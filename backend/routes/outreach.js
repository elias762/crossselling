// =====================================================
// OUTREACH ROUTES - Email Suggestions & Campaigns
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare, saveDb } = require('../db/database');

// =====================================================
// GET /api/outreach/suggestions - Get all suggestions
// =====================================================
router.get('/suggestions', (req, res, next) => {
    try {
        const { type, status } = req.query;

        let query = `
            SELECT es.*, c.name as client_name
            FROM email_suggestions es
            JOIN clients c ON es.client_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (type) {
            query += ' AND es.suggestion_type = ?';
            params.push(type);
        }

        if (status) {
            query += ' AND es.status = ?';
            params.push(status);
        }

        query += ' ORDER BY es.created_at DESC';

        const suggestions = prepare(query).all(...params);

        const result = suggestions.map(s => ({
            id: s.id,
            clientId: s.client_id,
            clientName: s.client_name,
            type: s.suggestion_type,
            reason: s.reason,
            subject: s.email_subject,
            content: s.personalized_content,
            status: s.status,
            createdAt: s.created_at,
            sentAt: s.sent_at
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// =====================================================
// GET /api/outreach/suggestions/:id - Get single suggestion
// =====================================================
router.get('/suggestions/:id', (req, res, next) => {
    try {
        const { id } = req.params;

        const suggestion = prepare(`
            SELECT es.*, c.name as client_name, c.primary_interest, c.last_visit
            FROM email_suggestions es
            JOIN clients c ON es.client_id = c.id
            WHERE es.id = ?
        `).get(id);

        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }

        res.json({
            id: suggestion.id,
            clientId: suggestion.client_id,
            clientName: suggestion.client_name,
            clientInterest: suggestion.primary_interest,
            clientLastVisit: suggestion.last_visit,
            type: suggestion.suggestion_type,
            reason: suggestion.reason,
            subject: suggestion.email_subject,
            content: suggestion.personalized_content,
            status: suggestion.status,
            createdAt: suggestion.created_at,
            sentAt: suggestion.sent_at
        });
    } catch (err) {
        next(err);
    }
});

// =====================================================
// POST /api/outreach/suggestions/generate - Generate suggestions
// =====================================================
router.post('/suggestions/generate', (req, res, next) => {
    try {
        const settings = prepare('SELECT * FROM outreach_settings WHERE id = 1').get() || {
            win_back_threshold_days: 30,
            reminder_days_before: 2
        };

        let generatedCount = 0;

        // Get all clients for various suggestions
        const allClients = prepare('SELECT * FROM clients').all();

        // =========================================================
        // 1. WIN-BACK / SPECIAL OFFER - Clients who haven't visited recently
        // =========================================================
        const winBackClients = prepare(`
            SELECT c.* FROM clients c
            WHERE julianday('now') - julianday(c.last_visit) >= ?
              AND c.id NOT IN (
                  SELECT client_id FROM email_suggestions
                  WHERE suggestion_type = 'win_back' AND status = 'pending'
              )
        `).all(settings.win_back_threshold_days);

        // Special offers for win-back
        const winBackOffers = [
            { discount: '15%', service: 'Ihren nächsten Service', code: 'COMEBACK15' },
            { discount: '20%', service: 'eine Haarbehandlung', code: 'WELCOME20' },
            { discount: '10€', service: 'Ihren nächsten Besuch', code: 'MISS10' }
        ];

        for (const client of winBackClients) {
            const daysSinceVisit = Math.floor(
                (new Date() - new Date(client.last_visit)) / (1000 * 60 * 60 * 24)
            );
            const offer = winBackOffers[Math.floor(Math.random() * winBackOffers.length)];

            const subject = `${client.name}, wir vermissen Sie! ${offer.discount} Rabatt wartet auf Sie`;
            const content = `Hallo ${client.name},

es ist schon ${daysSinceVisit} Tage her, seit wir Sie bei uns begrüßen durften. Wir vermissen Sie!

🎁 EXKLUSIVES ANGEBOT NUR FÜR SIE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${offer.discount} Rabatt auf ${offer.service}
Gutscheincode: ${offer.code}
Gültig bis: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Buchen Sie jetzt Ihren Termin und lassen Sie sich von unserem Team verwöhnen!

Wir freuen uns auf Sie!

Herzliche Grüße,
Ihr SalonAssist Team`;

            prepare(`
                INSERT INTO email_suggestions (client_id, suggestion_type, reason, email_subject, personalized_content, status)
                VALUES (?, 'win_back', ?, ?, ?, 'pending')
            `).run(client.id, `${offer.discount} Rabatt - Letzter Besuch vor ${daysSinceVisit} Tagen`, subject, content);
            generatedCount++;
        }

        // =========================================================
        // 2. PRODUCT RECOMMENDATIONS based on client interests & history
        // =========================================================
        const productRecommendations = [
            { interest: 'Hair Styling', products: ['Styling Pomade', 'Sea Salt Spray', 'Hair Wax'], discount: '10%' },
            { interest: 'Hair Color', products: ['Color Protection Shampoo', 'Color Mask', 'Olaplex Treatment'], discount: '15%' },
            { interest: 'Beard Care', products: ['Beard Oil', 'Beard Balm', 'Beard Brush Set'], discount: '20%' },
            { interest: 'Skincare', products: ['Face Moisturizer', 'Anti-Aging Serum', 'SPF Sunscreen'], discount: '15%' },
            { interest: 'Scalp Care', products: ['Scalp Treatment Oil', 'Anti-Dandruff Shampoo', 'Scalp Scrub'], discount: '10%' }
        ];

        for (const client of allClients) {
            // Check if already has pending product recommendation
            const existingProductRec = prepare(`
                SELECT id FROM email_suggestions
                WHERE client_id = ? AND suggestion_type = 'product_recommendation' AND status = 'pending'
            `).get(client.id);
            if (existingProductRec) continue;

            // Find matching recommendation based on primary interest
            const matchingRec = productRecommendations.find(r => r.interest === client.primary_interest);
            if (!matchingRec) continue;

            const productList = matchingRec.products.map(p => `  • ${p}`).join('\n');
            const subject = `${client.name}, neue Produkte für Ihre ${matchingRec.interest} Routine!`;
            const content = `Hallo ${client.name},

basierend auf Ihren Vorlieben haben wir die perfekten Produkte für Sie ausgewählt!

🛍️ EMPFOHLEN FÜR SIE (${matchingRec.interest}):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${productList}

💰 SPECIAL: ${matchingRec.discount} RABATT
auf alle ${matchingRec.interest} Produkte mit dem Code: CARE${matchingRec.discount.replace('%', '')}

Diese Produkte ergänzen perfekt Ihre regelmäßigen Behandlungen und helfen Ihnen, die Ergebnisse zuhause zu erhalten.

Bestellen Sie online oder holen Sie die Produkte bei Ihrem nächsten Besuch ab!

Herzliche Grüße,
Ihr SalonAssist Team`;

            prepare(`
                INSERT INTO email_suggestions (client_id, suggestion_type, reason, email_subject, personalized_content, status)
                VALUES (?, 'product_recommendation', ?, ?, ?, 'pending')
            `).run(client.id, `${matchingRec.interest} Produkte - ${matchingRec.discount} Rabatt`, subject, content);
            generatedCount++;
        }

        // =========================================================
        // 3. SEASONAL PROMOTIONS - Special offers for all clients
        // =========================================================
        const currentMonth = new Date().getMonth();
        const seasonalPromotions = [
            { month: [11, 0, 1], name: 'Winter Wellness', offer: 'Gratis Deep Conditioning bei jedem Haircut', reason: 'Winter Pflege Special' },
            { month: [2, 3, 4], name: 'Frühlings-Frische', offer: '20% auf alle Color Services', reason: 'Frühlings-Aktion' },
            { month: [5, 6, 7], name: 'Summer Glow', offer: 'Gratis Scalp Treatment bei jedem Service über 50€', reason: 'Sommer Special' },
            { month: [8, 9, 10], name: 'Herbst Verwöhn-Paket', offer: '25% auf Facial Treatments', reason: 'Herbst Wellness' }
        ];

        const currentPromo = seasonalPromotions.find(p => p.month.includes(currentMonth)) || seasonalPromotions[0];

        // Select random clients for promotion (max 5)
        const promoClients = allClients
            .filter(c => {
                const existingPromo = prepare(`
                    SELECT id FROM email_suggestions
                    WHERE client_id = ? AND suggestion_type = 'promotion' AND status = 'pending'
                `).get(c.id);
                return !existingPromo;
            })
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        for (const client of promoClients) {
            const subject = `🌟 ${currentPromo.name} Special für Sie, ${client.name}!`;
            const content = `Hallo ${client.name},

wir haben ein exklusives Angebot für Sie!

🌟 ${currentPromo.name.toUpperCase()} SPECIAL 🌟
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${currentPromo.offer}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dieses Angebot gilt nur für kurze Zeit und ist exklusiv für unsere treuen Kunden wie Sie!

📅 Gültig bis: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE')}

Buchen Sie jetzt Ihren Termin und profitieren Sie von diesem besonderen Angebot!

Wir freuen uns auf Sie!

Herzliche Grüße,
Ihr SalonAssist Team`;

            prepare(`
                INSERT INTO email_suggestions (client_id, suggestion_type, reason, email_subject, personalized_content, status)
                VALUES (?, 'promotion', ?, ?, ?, 'pending')
            `).run(client.id, currentPromo.reason, subject, content);
            generatedCount++;
        }

        // =========================================================
        // 4. SERVICE UPGRADE SUGGESTIONS - Based on booking history
        // =========================================================
        const upgradeOffers = [
            { fromService: 'Haircut', toService: 'Haircut + Deep Conditioning', savings: '15€', reason: 'Upgrade: Haircut → Premium' },
            { fromService: 'Beard Trim', toService: 'Beard Trim + Hot Towel Shave', savings: '10€', reason: 'Upgrade: Beard → Luxus' },
            { fromService: 'Manicure', toService: 'Manicure + Pedicure Kombi', savings: '20€', reason: 'Upgrade: Nail Kombi-Angebot' },
            { fromService: 'Facial Treatment', toService: 'Facial + Scalp Treatment', savings: '25€', reason: 'Upgrade: Wellness Paket' }
        ];

        // Look at client history to find upgrade opportunities
        for (const client of allClients) {
            const clientHistory = prepare(`
                SELECT chs.service_name, COUNT(*) as count
                FROM client_history ch
                JOIN client_history_services chs ON ch.id = chs.history_id
                WHERE ch.client_id = ?
                GROUP BY chs.service_name
                ORDER BY count DESC
                LIMIT 1
            `).get(client.id);

            if (!clientHistory) continue;

            const upgrade = upgradeOffers.find(u => u.fromService === clientHistory.service_name);
            if (!upgrade) continue;

            // Check if already has pending suggestion
            const existingUpgrade = prepare(`
                SELECT id FROM email_suggestions
                WHERE client_id = ? AND suggestion_type = 'promotion' AND reason LIKE 'Upgrade%' AND status = 'pending'
            `).get(client.id);
            if (existingUpgrade) continue;

            const subject = `${client.name}, sparen Sie ${upgrade.savings} beim Upgrade!`;
            const content = `Hallo ${client.name},

wir haben gesehen, dass Sie regelmäßig unseren ${upgrade.fromService} Service nutzen. Danke für Ihre Treue!

💎 EXKLUSIVES UPGRADE-ANGEBOT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Statt: ${upgrade.fromService}
Upgrade zu: ${upgrade.toService}

💰 SIE SPAREN: ${upgrade.savings}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Probieren Sie das erweiterte Erlebnis und genießen Sie die zusätzliche Verwöhnung!

Buchen Sie jetzt und nennen Sie einfach das Stichwort "UPGRADE" bei der Terminbuchung.

Herzliche Grüße,
Ihr SalonAssist Team`;

            prepare(`
                INSERT INTO email_suggestions (client_id, suggestion_type, reason, email_subject, personalized_content, status)
                VALUES (?, 'promotion', ?, ?, ?, 'pending')
            `).run(client.id, upgrade.reason, subject, content);
            generatedCount++;
        }

        // =========================================================
        // 5. LOYALTY REWARDS - For frequent visitors
        // =========================================================
        const loyalClients = prepare(`
            SELECT c.*,
                   (SELECT COUNT(*) FROM client_history WHERE client_id = c.id) as visit_count
            FROM clients c
            WHERE (SELECT COUNT(*) FROM client_history WHERE client_id = c.id) >= 5
              AND c.id NOT IN (
                  SELECT client_id FROM email_suggestions
                  WHERE suggestion_type = 'promotion' AND reason LIKE '%Treue%' AND status = 'pending'
              )
        `).all();

        for (const client of loyalClients) {
            const subject = `🏆 Danke für Ihre Treue, ${client.name}! Ein Geschenk wartet`;
            const content = `Hallo ${client.name},

WOW! Sie haben uns bereits ${client.visit_count} Mal besucht! 🎉

Als Dankeschön für Ihre Treue haben wir ein besonderes Geschenk für Sie:

🎁 IHR TREUE-BONUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ GRATIS Produkt Ihrer Wahl (bis 25€ Wert)
  bei Ihrem nächsten Besuch

✓ PLUS: 10% Rabatt auf alle Services
  für die nächsten 3 Monate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Zeigen Sie einfach diese E-Mail bei Ihrem nächsten Termin vor.

Vielen Dank, dass Sie Teil unserer SalonAssist Familie sind!

Herzliche Grüße,
Ihr SalonAssist Team`;

            prepare(`
                INSERT INTO email_suggestions (client_id, suggestion_type, reason, email_subject, personalized_content, status)
                VALUES (?, 'promotion', ?, ?, ?, 'pending')
            `).run(client.id, `Treue-Bonus - ${client.visit_count} Besuche`, subject, content);
            generatedCount++;
        }

        saveDb();

        res.json({
            success: true,
            generated: generatedCount,
            message: `${generatedCount} neue Vorschläge generiert`
        });
    } catch (err) {
        next(err);
    }
});

// =====================================================
// POST /api/outreach/suggestions/:id/send - Mark as sent
// =====================================================
router.post('/suggestions/:id/send', (req, res, next) => {
    try {
        const { id } = req.params;

        const suggestion = prepare('SELECT * FROM email_suggestions WHERE id = ?').get(id);
        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }

        prepare(`
            UPDATE email_suggestions
            SET status = 'sent', sent_at = datetime('now')
            WHERE id = ?
        `).run(id);

        saveDb();

        res.json({
            success: true,
            message: 'E-Mail als gesendet markiert'
        });
    } catch (err) {
        next(err);
    }
});

// =====================================================
// POST /api/outreach/suggestions/:id/dismiss - Dismiss suggestion
// =====================================================
router.post('/suggestions/:id/dismiss', (req, res, next) => {
    try {
        const { id } = req.params;

        const suggestion = prepare('SELECT * FROM email_suggestions WHERE id = ?').get(id);
        if (!suggestion) {
            return res.status(404).json({ error: 'Suggestion not found' });
        }

        prepare(`
            UPDATE email_suggestions
            SET status = 'dismissed'
            WHERE id = ?
        `).run(id);

        saveDb();

        res.json({
            success: true,
            message: 'Vorschlag verworfen'
        });
    } catch (err) {
        next(err);
    }
});

// =====================================================
// GET /api/outreach/templates - Get email templates
// =====================================================
router.get('/templates', (req, res, next) => {
    try {
        const templates = prepare('SELECT * FROM email_templates ORDER BY name').all();

        const result = templates.map(t => ({
            id: t.id,
            name: t.name,
            type: t.type,
            subjectTemplate: t.subject_template,
            bodyTemplate: t.body_template,
            active: t.active === 1
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// =====================================================
// GET /api/outreach/stats - Get outreach statistics
// =====================================================
router.get('/stats', (req, res, next) => {
    try {
        // Count pending suggestions
        const pending = prepare(`
            SELECT COUNT(*) as count FROM email_suggestions WHERE status = 'pending'
        `).get().count;

        // Count sent this week
        const sentThisWeek = prepare(`
            SELECT COUNT(*) as count FROM email_suggestions
            WHERE status = 'sent'
              AND date(sent_at) >= date('now', 'weekday 0', '-7 days')
        `).get().count;

        // Count sent this month
        const sentThisMonth = prepare(`
            SELECT COUNT(*) as count FROM email_suggestions
            WHERE status = 'sent'
              AND strftime('%Y-%m', sent_at) = strftime('%Y-%m', 'now')
        `).get().count;

        // Calculate response rate (mock - would need actual tracking)
        const totalSent = prepare(`
            SELECT COUNT(*) as count FROM email_suggestions WHERE status = 'sent'
        `).get().count;

        // Mock response rate based on sent count
        const responseRate = totalSent > 0 ? Math.min(Math.round((totalSent * 0.25) / totalSent * 100), 35) : 0;

        // Count by type
        const byType = prepare(`
            SELECT suggestion_type as type, COUNT(*) as count
            FROM email_suggestions
            WHERE status = 'pending'
            GROUP BY suggestion_type
        `).all();

        const typeMap = {};
        byType.forEach(t => { typeMap[t.type] = t.count; });

        res.json({
            pending,
            sentThisWeek,
            sentThisMonth,
            responseRate,
            byType: {
                winBack: typeMap['win_back'] || 0,
                appointmentReminder: typeMap['appointment_reminder'] || 0,
                productRecommendation: typeMap['product_recommendation'] || 0,
                promotion: typeMap['promotion'] || 0
            }
        });
    } catch (err) {
        next(err);
    }
});

// =====================================================
// GET /api/outreach/settings - Get outreach settings
// =====================================================
router.get('/settings', (req, res, next) => {
    try {
        const settings = prepare('SELECT * FROM outreach_settings WHERE id = 1').get();

        if (!settings) {
            return res.json({
                winBackThresholdDays: 30,
                reminderDaysBefore: 2
            });
        }

        res.json({
            winBackThresholdDays: settings.win_back_threshold_days,
            reminderDaysBefore: settings.reminder_days_before
        });
    } catch (err) {
        next(err);
    }
});

// =====================================================
// PUT /api/outreach/settings - Update outreach settings
// =====================================================
router.put('/settings', (req, res, next) => {
    try {
        const { winBackThresholdDays, reminderDaysBefore } = req.body;

        // Check if settings exist
        const existing = prepare('SELECT id FROM outreach_settings WHERE id = 1').get();

        if (existing) {
            prepare(`
                UPDATE outreach_settings
                SET win_back_threshold_days = ?, reminder_days_before = ?
                WHERE id = 1
            `).run(winBackThresholdDays || 30, reminderDaysBefore || 2);
        } else {
            prepare(`
                INSERT INTO outreach_settings (id, win_back_threshold_days, reminder_days_before)
                VALUES (1, ?, ?)
            `).run(winBackThresholdDays || 30, reminderDaysBefore || 2);
        }

        saveDb();

        res.json({
            success: true,
            winBackThresholdDays: winBackThresholdDays || 30,
            reminderDaysBefore: reminderDaysBefore || 2
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
