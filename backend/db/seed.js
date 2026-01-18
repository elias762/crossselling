// =====================================================
// DATABASE SEEDER - Populates demo data
// =====================================================

const { initDb, initializeSchema, closeDb, prepare, saveDb } = require('./database');

async function seed() {
    console.log('Starting database seed...');

    // Initialize schema (drops and recreates tables)
    await initializeSchema();

    // =====================================================
    // STYLISTS
    // =====================================================

    const stylists = [
        { id: 'stylist-001', name: 'Marco V.', specialties: ['Hair', 'Beard'], active: 1 },
        { id: 'stylist-002', name: 'Lucia R.', specialties: ['Hair', 'Color'], active: 1 },
        { id: 'stylist-003', name: 'Andrea M.', specialties: ['Nails', 'Skin'], active: 1 },
        { id: 'stylist-004', name: 'Giulia B.', specialties: ['Hair', 'Skin'], active: 1 }
    ];

    for (const stylist of stylists) {
        prepare('INSERT INTO stylists (id, name, active) VALUES (?, ?, ?)').run(stylist.id, stylist.name, stylist.active);
        for (const specialty of stylist.specialties) {
            prepare('INSERT INTO stylist_specialties (stylist_id, specialty) VALUES (?, ?)').run(stylist.id, specialty);
        }
    }
    console.log('Stylists seeded');

    // =====================================================
    // CLIENTS
    // =====================================================

    const clients = [
        {
            id: 'client-001', name: 'Marco Rossi', tags: ['Hair Styling', 'Beard Care'],
            primaryInterest: 'Hair & Beard', preferences: 'Prefers matte finish products. Likes quick appointments.',
            issues: 'Dry scalp in winter', lastVisit: '2026-01-10', totalVisits: 12
        },
        {
            id: 'client-002', name: 'Giulia Bianchi', tags: ['Skincare', 'Hair Styling'],
            primaryInterest: 'Skincare', preferences: 'Sensitive skin. Prefers fragrance-free products.',
            issues: 'Redness-prone skin', lastVisit: '2026-01-15', totalVisits: 8
        },
        {
            id: 'client-003', name: 'Francesca Marino', tags: ['Nails', 'Skincare'],
            primaryInterest: 'Nails', preferences: 'Gel polish only. Likes neutral colors.',
            issues: 'Brittle nails', lastVisit: '2026-01-12', totalVisits: 15
        },
        {
            id: 'client-004', name: 'Sofia Conti', tags: ['Hair Styling', 'Hair Color'],
            primaryInterest: 'Hair Color', preferences: 'Balayage specialist. Books long appointments.',
            issues: 'Color fading quickly', lastVisit: '2026-01-08', totalVisits: 6
        },
        {
            id: 'client-005', name: 'Alessandro Ferrari', tags: ['Beard Care'],
            primaryInterest: 'Beard', preferences: 'Full beard maintenance. Prefers natural oils.',
            issues: 'Patchy growth on left side', lastVisit: '2026-01-14', totalVisits: 20
        },
        {
            id: 'client-006', name: 'Luca Romano', tags: ['Hair Styling', 'Scalp Care'],
            primaryInterest: 'Hair', preferences: 'Short appointments. Minimal styling.',
            issues: 'Dandruff, oily scalp', lastVisit: '2026-01-05', totalVisits: 9
        },
        {
            id: 'client-007', name: 'Isabella Ricci', tags: ['Skincare', 'Nails'],
            primaryInterest: 'Full Grooming', preferences: 'Monthly spa package. Premium products only.',
            issues: 'None noted', lastVisit: '2026-01-11', totalVisits: 24
        },
        {
            id: 'client-008', name: 'Giuseppe Greco', tags: ['Hair Styling'],
            primaryInterest: 'Hair', preferences: 'Classic cuts only. No products.',
            issues: 'Thinning hair', lastVisit: '2025-12-28', totalVisits: 4
        },
        {
            id: 'client-009', name: 'Antonio Colombo', tags: ['Beard Care', 'Skincare'],
            primaryInterest: 'Beard & Skin', preferences: 'Hot towel shave enthusiast. Likes grooming rituals.',
            issues: 'Ingrown hairs', lastVisit: '2026-01-13', totalVisits: 11
        },
        {
            id: 'client-010', name: 'Valentina Esposito', tags: ['Hair Color', 'Hair Styling'],
            primaryInterest: 'Hair Color', preferences: 'Bold colors. Instagram-ready styles.',
            issues: 'Damaged ends from bleaching', lastVisit: '2026-01-09', totalVisits: 7
        },
        {
            id: 'client-011', name: 'Chiara Moretti', tags: ['Nails'],
            primaryInterest: 'Nails', preferences: 'Bi-weekly manicures. Loves nail art.',
            issues: 'Cuticle dryness', lastVisit: '2026-01-16', totalVisits: 18
        },
        {
            id: 'client-012', name: 'Roberto Fontana', tags: ['Hair Styling', 'Beard Care', 'Skincare'],
            primaryInterest: 'Full Grooming', preferences: 'VIP client. Prefers private room. Tip generously.',
            issues: 'Sensitive skin, dry scalp', lastVisit: '2026-01-07', totalVisits: 32
        }
    ];

    for (const client of clients) {
        prepare(`
            INSERT INTO clients (id, name, primary_interest, preferences, issues, last_visit, total_visits)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(client.id, client.name, client.primaryInterest, client.preferences, client.issues, client.lastVisit, client.totalVisits);
        for (const tag of client.tags) {
            prepare('INSERT INTO client_tags (client_id, tag) VALUES (?, ?)').run(client.id, tag);
        }
    }
    console.log('Clients seeded');

    // =====================================================
    // SERVICES
    // =====================================================

    const services = [
        { name: 'Haircut', category: 'Hair', duration: 30, price: 35, active: 1 },
        { name: 'Hair Color', category: 'Hair', duration: 90, price: 85, active: 1 },
        { name: 'Balayage', category: 'Hair', duration: 120, price: 150, active: 1 },
        { name: 'Deep Conditioning', category: 'Hair', duration: 30, price: 40, active: 1 },
        { name: 'Scalp Treatment', category: 'Hair', duration: 45, price: 55, active: 1 },
        { name: 'Beard Trim', category: 'Beard', duration: 20, price: 20, active: 1 },
        { name: 'Hot Towel Shave', category: 'Beard', duration: 30, price: 35, active: 1 },
        { name: 'Facial Treatment', category: 'Skin', duration: 60, price: 75, active: 1 },
        { name: 'Manicure', category: 'Nails', duration: 45, price: 30, active: 1 },
        { name: 'Pedicure', category: 'Nails', duration: 60, price: 45, active: 1 },
        { name: 'Olaplex Treatment', category: 'Hair', duration: 45, price: 65, active: 1 },
        { name: 'Keratin Treatment', category: 'Hair', duration: 150, price: 200, active: 0 }
    ];

    for (const service of services) {
        prepare(`
            INSERT INTO services (name, category, duration, price, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(service.name, service.category, service.duration, service.price, service.active);
    }
    console.log('Services seeded');

    // =====================================================
    // PRODUCTS
    // =====================================================

    const products = [
        { name: 'Matte Styling Clay', category: 'Hair', price: 24, useCase: 'Hold', active: 1 },
        { name: 'Sea Salt Spray', category: 'Hair', price: 18, useCase: 'Hold', active: 1 },
        { name: 'Hair Serum', category: 'Hair', price: 28, useCase: 'Repair', active: 1 },
        { name: 'Color Protect Shampoo', category: 'Hair', price: 22, useCase: 'Repair', active: 1 },
        { name: 'Color Protect Conditioner', category: 'Hair', price: 22, useCase: 'Repair', active: 1 },
        { name: 'Anti-Dandruff Shampoo', category: 'Hair', price: 19, useCase: 'Anti-dandruff', active: 1 },
        { name: 'Scalp Serum', category: 'Hair', price: 32, useCase: 'Anti-dandruff', active: 1 },
        { name: 'Volumizing Mousse', category: 'Hair', price: 20, useCase: 'Hold', active: 1 },
        { name: 'Beard Oil', category: 'Beard', price: 18, useCase: 'Hydration', active: 1 },
        { name: 'Beard Balm', category: 'Beard', price: 20, useCase: 'Hold', active: 1 },
        { name: 'Aftershave Balm', category: 'Beard', price: 15, useCase: 'Hydration', active: 1 },
        { name: 'Face Moisturizer', category: 'Skin', price: 35, useCase: 'Hydration', active: 1 },
        { name: 'Moisturizer SPF', category: 'Skin', price: 38, useCase: 'SPF', active: 1 },
        { name: 'Cuticle Oil', category: 'Nails', price: 12, useCase: 'Hydration', active: 1 },
        { name: 'Nail Strengthener', category: 'Nails', price: 16, useCase: 'Repair', active: 1 }
    ];

    for (const product of products) {
        prepare(`
            INSERT INTO products (name, category, price, use_case, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(product.name, product.category, product.price, product.useCase, product.active);
    }
    console.log('Products seeded');

    // =====================================================
    // SERVICE RULES
    // =====================================================

    const serviceRules = [
        { trigger: 'Haircut', suggestions: ['Deep Conditioning', 'Scalp Treatment'], reason: 'Restores moisture and promotes healthy growth', active: 1 },
        { trigger: 'Beard Trim', suggestions: ['Hot Towel Shave'], reason: 'Complete grooming experience', active: 1 },
        { trigger: 'Hair Color', suggestions: ['Deep Conditioning', 'Olaplex Treatment'], reason: 'Protects and repairs colored hair', active: 1 },
        { trigger: 'Balayage', suggestions: ['Olaplex Treatment'], reason: 'Essential for balayage care', active: 1 },
        { trigger: 'Manicure', suggestions: ['Pedicure'], reason: 'Full nail care package', active: 1 },
        { trigger: 'Facial Treatment', suggestions: ['Scalp Treatment'], reason: 'Complete head-to-face grooming', active: 1 }
    ];

    for (const rule of serviceRules) {
        const result = prepare('INSERT INTO service_rules (trigger_service, reason, active) VALUES (?, ?, ?)').run(rule.trigger, rule.reason, rule.active);
        const ruleId = result.lastInsertRowid;
        for (const suggestion of rule.suggestions) {
            prepare('INSERT INTO service_rule_suggestions (rule_id, suggested_service) VALUES (?, ?)').run(ruleId, suggestion);
        }
    }
    console.log('Service rules seeded');

    // =====================================================
    // PRODUCT RULES
    // =====================================================

    const productRules = [
        { trigger: 'Beard Trim', suggestions: ['Beard Oil', 'Beard Balm'], reason: 'Keeps beard soft and styled after trim', active: 1 },
        { trigger: 'Haircut', suggestions: ['Matte Styling Clay', 'Sea Salt Spray'], reason: 'Perfect for styling fresh cuts', active: 1 },
        { trigger: 'Scalp Treatment', suggestions: ['Anti-Dandruff Shampoo', 'Scalp Serum'], reason: 'Extends treatment benefits at home', active: 1 },
        { trigger: 'Hair Color', suggestions: ['Color Protect Shampoo', 'Color Protect Conditioner'], reason: 'Preserves color vibrancy', active: 1 },
        { trigger: 'Balayage', suggestions: ['Color Protect Shampoo', 'Hair Serum'], reason: 'Protects highlights and adds shine', active: 1 },
        { trigger: 'Facial Treatment', suggestions: ['Face Moisturizer', 'Moisturizer SPF'], reason: 'Maintains facial results', active: 1 },
        { trigger: 'Deep Conditioning', suggestions: ['Hair Serum'], reason: 'Adds extra nourishment at home', active: 1 },
        { trigger: 'Hot Towel Shave', suggestions: ['Aftershave Balm', 'Face Moisturizer'], reason: 'Soothes and hydrates after shave', active: 1 },
        { trigger: 'Manicure', suggestions: ['Cuticle Oil', 'Nail Strengthener'], reason: 'Maintains nail health between visits', active: 1 },
        { trigger: 'Pedicure', suggestions: ['Cuticle Oil'], reason: 'Keeps toenails healthy', active: 1 }
    ];

    for (const rule of productRules) {
        const result = prepare('INSERT INTO product_rules (trigger_service, reason, active) VALUES (?, ?, ?)').run(rule.trigger, rule.reason, rule.active);
        const ruleId = result.lastInsertRowid;
        for (const suggestion of rule.suggestions) {
            prepare('INSERT INTO product_rule_suggestions (rule_id, suggested_product) VALUES (?, ?)').run(ruleId, suggestion);
        }
    }
    console.log('Product rules seeded');

    // =====================================================
    // RECOMMENDATION TRACKING
    // =====================================================

    const tracking = [
        { itemName: 'Beard Oil', type: 'product', shown: 45, accepted: 28, dismissed: 8 },
        { itemName: 'Beard Balm', type: 'product', shown: 38, accepted: 15, dismissed: 12 },
        { itemName: 'Matte Styling Clay', type: 'product', shown: 52, accepted: 31, dismissed: 10 },
        { itemName: 'Sea Salt Spray', type: 'product', shown: 35, accepted: 12, dismissed: 15 },
        { itemName: 'Color Protect Shampoo', type: 'product', shown: 28, accepted: 18, dismissed: 5 },
        { itemName: 'Face Moisturizer', type: 'product', shown: 22, accepted: 14, dismissed: 4 },
        { itemName: 'Aftershave Balm', type: 'product', shown: 30, accepted: 22, dismissed: 3 },
        { itemName: 'Cuticle Oil', type: 'product', shown: 25, accepted: 16, dismissed: 6 },
        { itemName: 'Deep Conditioning', type: 'service', shown: 40, accepted: 18, dismissed: 12 },
        { itemName: 'Hot Towel Shave', type: 'service', shown: 32, accepted: 20, dismissed: 7 },
        { itemName: 'Scalp Treatment', type: 'service', shown: 28, accepted: 10, dismissed: 10 },
        { itemName: 'Olaplex Treatment', type: 'service', shown: 18, accepted: 8, dismissed: 5 },
        { itemName: 'Pedicure', type: 'service', shown: 20, accepted: 12, dismissed: 4 }
    ];

    for (const item of tracking) {
        prepare(`
            INSERT INTO recommendation_tracking (item_name, item_type, shown, accepted, dismissed)
            VALUES (?, ?, ?, ?, ?)
        `).run(item.itemName, item.type, item.shown, item.accepted, item.dismissed);
    }
    console.log('Recommendation tracking seeded');

    // =====================================================
    // CLIENT HISTORY
    // =====================================================

    const clientHistory = {
        'client-001': [
            { date: '2026-01-10', time: '10:00', services: ['Haircut', 'Beard Trim'], products: ['Matte Styling Clay'], status: 'Completed' },
            { date: '2025-12-27', time: '11:30', services: ['Haircut'], products: ['Beard Oil'], status: 'Completed' },
            { date: '2025-12-13', time: '09:00', services: ['Beard Trim', 'Hot Towel Shave'], products: ['Aftershave Balm'], status: 'Completed' },
            { date: '2025-11-29', time: '14:00', services: ['Haircut', 'Scalp Treatment'], products: [], status: 'Completed' },
            { date: '2025-11-15', time: '10:30', services: ['Haircut', 'Beard Trim'], products: ['Beard Balm', 'Matte Styling Clay'], status: 'Completed' },
            { date: '2025-11-01', time: '15:00', services: ['Beard Trim'], products: ['Beard Oil'], status: 'Completed' }
        ],
        'client-002': [
            { date: '2026-01-15', time: '13:00', services: ['Facial Treatment'], products: ['Gentle Cleanser', 'Face Moisturizer'], status: 'Completed' },
            { date: '2025-12-30', time: '11:00', services: ['Haircut', 'Facial Treatment'], products: ['Moisturizer SPF'], status: 'Completed' },
            { date: '2025-12-15', time: '14:30', services: ['Facial Treatment'], products: ['Hydrating Cleanser'], status: 'Completed' },
            { date: '2025-12-01', time: '10:00', services: ['Haircut'], products: [], status: 'Completed' },
            { date: '2025-11-17', time: '15:00', services: ['Facial Treatment', 'Scalp Treatment'], products: ['Scalp Serum'], status: 'Completed' },
            { date: '2025-11-03', time: '09:30', services: ['Haircut', 'Facial Treatment'], products: ['Gentle Cleanser'], status: 'Completed' }
        ],
        'client-003': [
            { date: '2026-01-12', time: '11:00', services: ['Manicure', 'Pedicure'], products: ['Cuticle Oil'], status: 'Completed' },
            { date: '2025-12-29', time: '14:00', services: ['Manicure'], products: ['Nail Strengthener'], status: 'Completed' },
            { date: '2025-12-15', time: '10:30', services: ['Manicure', 'Pedicure'], products: ['Cuticle Oil', 'Foot Cream'], status: 'Completed' },
            { date: '2025-12-01', time: '13:00', services: ['Manicure'], products: [], status: 'Completed' },
            { date: '2025-11-17', time: '11:00', services: ['Manicure', 'Facial Treatment'], products: ['Face Moisturizer'], status: 'Completed' },
            { date: '2025-11-03', time: '15:30', services: ['Pedicure'], products: ['Cuticle Oil'], status: 'Completed' }
        ],
        'client-004': [
            { date: '2026-01-08', time: '09:00', services: ['Balayage', 'Deep Conditioning'], products: ['Color Protect Shampoo'], status: 'Completed' },
            { date: '2025-12-11', time: '10:00', services: ['Hair Color', 'Haircut'], products: ['Color Protect Conditioner'], status: 'Completed' },
            { date: '2025-11-13', time: '09:30', services: ['Balayage'], products: ['Hair Serum', 'Color Protect Shampoo'], status: 'Completed' },
            { date: '2025-10-16', time: '11:00', services: ['Hair Color', 'Deep Conditioning'], products: [], status: 'Completed' },
            { date: '2025-09-18', time: '10:00', services: ['Balayage', 'Haircut'], products: ['Color Protect Shampoo'], status: 'Completed' },
            { date: '2025-08-21', time: '09:00', services: ['Hair Color'], products: ['Hair Serum'], status: 'Completed' }
        ],
        'client-005': [
            { date: '2026-01-14', time: '12:00', services: ['Beard Trim'], products: ['Beard Oil'], status: 'Completed' },
            { date: '2026-01-07', time: '12:00', services: ['Beard Trim', 'Hot Towel Shave'], products: ['Beard Balm', 'Aftershave Balm'], status: 'Completed' },
            { date: '2025-12-31', time: '11:30', services: ['Beard Trim'], products: [], status: 'Completed' },
            { date: '2025-12-24', time: '10:00', services: ['Beard Trim', 'Haircut'], products: ['Beard Oil', 'Matte Styling Clay'], status: 'Completed' },
            { date: '2025-12-17', time: '12:30', services: ['Beard Trim'], products: ['Beard Oil'], status: 'Completed' },
            { date: '2025-12-10', time: '11:00', services: ['Beard Trim', 'Hot Towel Shave'], products: ['Aftershave Balm'], status: 'Completed' }
        ],
        'client-006': [
            { date: '2026-01-05', time: '16:00', services: ['Haircut', 'Scalp Treatment'], products: ['Anti-Dandruff Shampoo'], status: 'Completed' },
            { date: '2025-12-22', time: '15:30', services: ['Haircut'], products: [], status: 'Completed' },
            { date: '2025-12-08', time: '14:00', services: ['Scalp Treatment'], products: ['Scalp Serum', 'Clarifying Shampoo'], status: 'Completed' },
            { date: '2025-11-24', time: '16:30', services: ['Haircut', 'Scalp Treatment'], products: ['Anti-Dandruff Shampoo'], status: 'Completed' },
            { date: '2025-11-10', time: '15:00', services: ['Haircut'], products: [], status: 'Completed' },
            { date: '2025-10-27', time: '14:30', services: ['Scalp Treatment'], products: ['Scalp Serum'], status: 'Completed' }
        ],
        'client-007': [
            { date: '2026-01-11', time: '10:00', services: ['Facial Treatment', 'Manicure', 'Pedicure'], products: ['Face Moisturizer', 'Cuticle Oil'], status: 'Completed' },
            { date: '2025-12-14', time: '10:00', services: ['Facial Treatment', 'Manicure'], products: ['Hydrating Cleanser', 'Nail Strengthener'], status: 'Completed' },
            { date: '2025-11-16', time: '10:00', services: ['Facial Treatment', 'Manicure', 'Pedicure'], products: ['Moisturizer SPF', 'Cuticle Oil'], status: 'Completed' },
            { date: '2025-10-19', time: '10:00', services: ['Facial Treatment', 'Pedicure'], products: ['Face Moisturizer', 'Foot Cream'], status: 'Completed' },
            { date: '2025-09-21', time: '10:00', services: ['Facial Treatment', 'Manicure'], products: ['Gentle Cleanser'], status: 'Completed' },
            { date: '2025-08-24', time: '10:00', services: ['Facial Treatment', 'Manicure', 'Pedicure'], products: ['Face Moisturizer', 'Cuticle Oil'], status: 'Completed' }
        ],
        'client-008': [
            { date: '2025-12-28', time: '09:30', services: ['Haircut'], products: [], status: 'Completed' },
            { date: '2025-11-30', time: '10:00', services: ['Haircut'], products: [], status: 'Completed' },
            { date: '2025-11-02', time: '09:00', services: ['Haircut', 'Scalp Treatment'], products: ['Volumizing Mousse'], status: 'Completed' },
            { date: '2025-10-05', time: '10:30', services: ['Haircut'], products: [], status: 'Completed' }
        ],
        'client-009': [
            { date: '2026-01-13', time: '11:00', services: ['Hot Towel Shave', 'Facial Treatment'], products: ['Aftershave Balm', 'Face Moisturizer'], status: 'Completed' },
            { date: '2025-12-30', time: '10:30', services: ['Beard Trim', 'Hot Towel Shave'], products: ['Beard Oil'], status: 'Completed' },
            { date: '2025-12-16', time: '11:30', services: ['Hot Towel Shave', 'Facial Treatment'], products: ['Gentle Cleanser', 'Aftershave Balm'], status: 'Completed' },
            { date: '2025-12-02', time: '10:00', services: ['Beard Trim'], products: ['Beard Balm'], status: 'Completed' },
            { date: '2025-11-18', time: '11:00', services: ['Hot Towel Shave'], products: ['Aftershave Balm'], status: 'Completed' },
            { date: '2025-11-04', time: '10:30', services: ['Beard Trim', 'Facial Treatment'], products: ['Face Moisturizer'], status: 'Completed' }
        ],
        'client-010': [
            { date: '2026-01-09', time: '13:00', services: ['Hair Color', 'Deep Conditioning'], products: ['Color Protect Shampoo', 'Hair Serum'], status: 'Completed' },
            { date: '2025-12-19', time: '12:00', services: ['Balayage', 'Haircut'], products: ['Color Protect Conditioner'], status: 'Completed' },
            { date: '2025-11-28', time: '14:00', services: ['Hair Color'], products: ['Color Protect Shampoo'], status: 'Completed' },
            { date: '2025-11-07', time: '13:30', services: ['Deep Conditioning', 'Haircut'], products: ['Hair Serum'], status: 'Completed' },
            { date: '2025-10-17', time: '12:00', services: ['Balayage'], products: ['Color Protect Shampoo', 'Color Protect Conditioner'], status: 'Completed' },
            { date: '2025-09-26', time: '14:00', services: ['Hair Color', 'Deep Conditioning'], products: [], status: 'Completed' }
        ],
        'client-011': [
            { date: '2026-01-16', time: '14:00', services: ['Manicure'], products: ['Cuticle Oil'], status: 'Completed' },
            { date: '2026-01-02', time: '14:30', services: ['Manicure'], products: ['Nail Polish'], status: 'Completed' },
            { date: '2025-12-19', time: '15:00', services: ['Manicure', 'Pedicure'], products: ['Cuticle Oil', 'Nail Strengthener'], status: 'Completed' },
            { date: '2025-12-05', time: '14:00', services: ['Manicure'], products: [], status: 'Completed' },
            { date: '2025-11-21', time: '14:30', services: ['Manicure'], products: ['Cuticle Oil'], status: 'Completed' },
            { date: '2025-11-07', time: '15:00', services: ['Manicure', 'Pedicure'], products: ['Nail Polish', 'Foot Cream'], status: 'Completed' }
        ],
        'client-012': [
            { date: '2026-01-07', time: '09:00', services: ['Haircut', 'Beard Trim', 'Facial Treatment'], products: ['Matte Styling Clay', 'Beard Oil', 'Face Moisturizer'], status: 'Completed' },
            { date: '2025-12-24', time: '09:00', services: ['Haircut', 'Hot Towel Shave', 'Scalp Treatment'], products: ['Aftershave Balm', 'Scalp Serum'], status: 'Completed' },
            { date: '2025-12-10', time: '09:00', services: ['Beard Trim', 'Facial Treatment'], products: ['Beard Balm', 'Gentle Cleanser'], status: 'Completed' },
            { date: '2025-11-26', time: '09:00', services: ['Haircut', 'Beard Trim', 'Facial Treatment'], products: ['Matte Styling Clay', 'Face Moisturizer'], status: 'Completed' },
            { date: '2025-11-12', time: '09:00', services: ['Hot Towel Shave', 'Scalp Treatment'], products: ['Aftershave Balm', 'Anti-Dandruff Shampoo'], status: 'Completed' },
            { date: '2025-10-29', time: '09:00', services: ['Haircut', 'Beard Trim', 'Facial Treatment'], products: ['Beard Oil', 'Moisturizer SPF'], status: 'Completed' }
        ]
    };

    for (const [clientId, history] of Object.entries(clientHistory)) {
        for (const visit of history) {
            const result = prepare('INSERT INTO client_history (client_id, date, time, status) VALUES (?, ?, ?, ?)').run(clientId, visit.date, visit.time, visit.status);
            const historyId = result.lastInsertRowid;
            for (const service of visit.services) {
                prepare('INSERT INTO client_history_services (history_id, service_name) VALUES (?, ?)').run(historyId, service);
            }
            for (const product of visit.products) {
                prepare('INSERT INTO client_history_products (history_id, product_name) VALUES (?, ?)').run(historyId, product);
            }
        }
    }
    console.log('Client history seeded');

    // =====================================================
    // APPOINTMENTS (Dummy appointments for today and upcoming)
    // =====================================================

    const appointments = [
        // ===== VERGANGENE TERMINE (Completed) für Analytics =====
        // 10.01.2026
        {
            id: 'apt-c01',
            clientId: 'client-001',
            clientName: 'Marco Rossi',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-10',
            time: '09:00',
            status: 'Completed',
            notes: '',
            services: ['Haircut', 'Beard Trim'],
            products: ['Matte Styling Clay', 'Beard Oil']
        },
        {
            id: 'apt-c02',
            clientId: 'client-002',
            clientName: 'Giulia Bianchi',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-10',
            time: '10:30',
            status: 'Completed',
            notes: '',
            services: ['Facial Treatment', 'Haircut'],
            products: ['Face Moisturizer']
        },
        {
            id: 'apt-c03',
            clientId: 'client-005',
            clientName: 'Alessandro Ferrari',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-10',
            time: '14:00',
            status: 'Completed',
            notes: '',
            services: ['Beard Trim', 'Hot Towel Shave'],
            products: ['Beard Oil', 'Aftershave Balm']
        },
        // 11.01.2026
        {
            id: 'apt-c04',
            clientId: 'client-004',
            clientName: 'Sofia Conti',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-11',
            time: '09:00',
            status: 'Completed',
            notes: '',
            services: ['Balayage', 'Deep Conditioning', 'Olaplex Treatment'],
            products: ['Color Protect Shampoo', 'Color Protect Conditioner', 'Hair Serum']
        },
        {
            id: 'apt-c05',
            clientId: 'client-003',
            clientName: 'Francesca Marino',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-11',
            time: '11:00',
            status: 'Completed',
            notes: '',
            services: ['Manicure', 'Pedicure'],
            products: ['Cuticle Oil', 'Nail Strengthener']
        },
        {
            id: 'apt-c06',
            clientId: 'client-012',
            clientName: 'Roberto Fontana',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-11',
            time: '14:00',
            status: 'Completed',
            notes: 'VIP',
            services: ['Haircut', 'Beard Trim', 'Facial Treatment', 'Scalp Treatment'],
            products: ['Matte Styling Clay', 'Beard Balm', 'Face Moisturizer', 'Scalp Serum']
        },
        // 13.01.2026
        {
            id: 'apt-c07',
            clientId: 'client-007',
            clientName: 'Isabella Ricci',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-13',
            time: '10:00',
            status: 'Completed',
            notes: '',
            services: ['Facial Treatment', 'Manicure', 'Pedicure'],
            products: ['Face Moisturizer', 'Moisturizer SPF', 'Cuticle Oil']
        },
        {
            id: 'apt-c08',
            clientId: 'client-006',
            clientName: 'Luca Romano',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-13',
            time: '11:30',
            status: 'Completed',
            notes: '',
            services: ['Haircut', 'Scalp Treatment'],
            products: ['Anti-Dandruff Shampoo', 'Scalp Serum']
        },
        {
            id: 'apt-c09',
            clientId: 'client-009',
            clientName: 'Antonio Colombo',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-13',
            time: '15:00',
            status: 'Completed',
            notes: '',
            services: ['Hot Towel Shave', 'Facial Treatment'],
            products: ['Aftershave Balm', 'Face Moisturizer']
        },
        // 14.01.2026
        {
            id: 'apt-c10',
            clientId: 'client-010',
            clientName: 'Valentina Esposito',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-14',
            time: '09:30',
            status: 'Completed',
            notes: '',
            services: ['Hair Color', 'Haircut', 'Deep Conditioning'],
            products: ['Color Protect Shampoo', 'Hair Serum']
        },
        {
            id: 'apt-c11',
            clientId: 'client-011',
            clientName: 'Chiara Moretti',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-14',
            time: '11:00',
            status: 'Completed',
            notes: '',
            services: ['Manicure'],
            products: ['Cuticle Oil']
        },
        {
            id: 'apt-c12',
            clientId: 'client-008',
            clientName: 'Giuseppe Greco',
            stylistId: 'stylist-004',
            stylistName: 'Giulia B.',
            date: '2026-01-14',
            time: '14:00',
            status: 'Completed',
            notes: '',
            services: ['Haircut'],
            products: ['Volumizing Mousse']
        },
        // 15.01.2026
        {
            id: 'apt-c13',
            clientId: 'client-001',
            clientName: 'Marco Rossi',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-15',
            time: '10:00',
            status: 'Completed',
            notes: '',
            services: ['Beard Trim'],
            products: ['Beard Oil']
        },
        {
            id: 'apt-c14',
            clientId: 'client-005',
            clientName: 'Alessandro Ferrari',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-15',
            time: '11:30',
            status: 'Completed',
            notes: '',
            services: ['Beard Trim', 'Hot Towel Shave'],
            products: ['Beard Balm', 'Aftershave Balm']
        },
        {
            id: 'apt-c15',
            clientId: 'client-004',
            clientName: 'Sofia Conti',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-15',
            time: '14:00',
            status: 'Completed',
            notes: '',
            services: ['Haircut', 'Olaplex Treatment'],
            products: ['Hair Serum']
        },
        // 16.01.2026
        {
            id: 'apt-c16',
            clientId: 'client-007',
            clientName: 'Isabella Ricci',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-16',
            time: '09:00',
            status: 'Completed',
            notes: '',
            services: ['Facial Treatment', 'Pedicure'],
            products: ['Moisturizer SPF']
        },
        {
            id: 'apt-c17',
            clientId: 'client-012',
            clientName: 'Roberto Fontana',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-16',
            time: '11:00',
            status: 'Completed',
            notes: 'VIP',
            services: ['Haircut', 'Hot Towel Shave'],
            products: ['Matte Styling Clay', 'Aftershave Balm']
        },
        {
            id: 'apt-c18',
            clientId: 'client-002',
            clientName: 'Giulia Bianchi',
            stylistId: 'stylist-004',
            stylistName: 'Giulia B.',
            date: '2026-01-16',
            time: '15:00',
            status: 'Completed',
            notes: '',
            services: ['Haircut', 'Facial Treatment'],
            products: ['Face Moisturizer']
        },
        // 17.01.2026
        {
            id: 'apt-c19',
            clientId: 'client-003',
            clientName: 'Francesca Marino',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-17',
            time: '10:00',
            status: 'Completed',
            notes: '',
            services: ['Manicure', 'Pedicure'],
            products: ['Cuticle Oil', 'Nail Strengthener']
        },
        {
            id: 'apt-c20',
            clientId: 'client-009',
            clientName: 'Antonio Colombo',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-17',
            time: '11:30',
            status: 'Completed',
            notes: '',
            services: ['Beard Trim', 'Facial Treatment'],
            products: ['Beard Oil', 'Face Moisturizer']
        },
        {
            id: 'apt-c21',
            clientId: 'client-006',
            clientName: 'Luca Romano',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-17',
            time: '14:00',
            status: 'Completed',
            notes: '',
            services: ['Haircut', 'Scalp Treatment'],
            products: ['Anti-Dandruff Shampoo']
        },
        {
            id: 'apt-c22',
            clientId: 'client-010',
            clientName: 'Valentina Esposito',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-17',
            time: '16:00',
            status: 'Completed',
            notes: '',
            services: ['Deep Conditioning', 'Haircut'],
            products: ['Color Protect Conditioner']
        },
        // ===== HEUTIGE UND ZUKÜNFTIGE TERMINE =====
        // 18.01.2026
        {
            id: 'apt-001',
            clientId: 'client-001',
            clientName: 'Marco Rossi',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-18',
            time: '09:00',
            status: 'Scheduled',
            notes: '',
            services: ['Haircut', 'Beard Trim'],
            products: []
        },
        {
            id: 'apt-002',
            clientId: 'client-002',
            clientName: 'Giulia Bianchi',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-18',
            time: '10:30',
            status: 'Scheduled',
            notes: 'Empfindliche Haut beachten',
            services: ['Facial Treatment'],
            products: []
        },
        {
            id: 'apt-003',
            clientId: 'client-005',
            clientName: 'Alessandro Ferrari',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-18',
            time: '11:00',
            status: 'In Progress',
            notes: '',
            services: ['Beard Trim', 'Hot Towel Shave'],
            products: ['Beard Oil']
        },
        {
            id: 'apt-004',
            clientId: 'client-003',
            clientName: 'Francesca Marino',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-18',
            time: '14:00',
            status: 'Scheduled',
            notes: 'Gel Polish - neutrale Farben',
            services: ['Manicure', 'Pedicure'],
            products: []
        },
        {
            id: 'apt-005',
            clientId: 'client-004',
            clientName: 'Sofia Conti',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-18',
            time: '15:00',
            status: 'Scheduled',
            notes: 'Balayage Auffrischung',
            services: ['Balayage', 'Deep Conditioning'],
            products: []
        },
        {
            id: 'apt-006',
            clientId: 'client-012',
            clientName: 'Roberto Fontana',
            stylistId: 'stylist-004',
            stylistName: 'Giulia B.',
            date: '2026-01-19',
            time: '09:00',
            status: 'Scheduled',
            notes: 'VIP - Privater Raum',
            services: ['Haircut', 'Beard Trim', 'Facial Treatment'],
            products: []
        },
        {
            id: 'apt-007',
            clientId: 'client-007',
            clientName: 'Isabella Ricci',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-19',
            time: '10:00',
            status: 'Scheduled',
            notes: 'Monatliches Spa-Paket',
            services: ['Facial Treatment', 'Manicure', 'Pedicure'],
            products: []
        },
        {
            id: 'apt-008',
            clientId: 'client-009',
            clientName: 'Antonio Colombo',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-20',
            time: '11:00',
            status: 'Scheduled',
            notes: 'Hot Towel Shave Enthusiast',
            services: ['Hot Towel Shave', 'Facial Treatment'],
            products: []
        },
        // 20.01.2026 - weitere Termine
        {
            id: 'apt-009',
            clientId: 'client-006',
            clientName: 'Luca Romano',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-20',
            time: '09:00',
            status: 'Scheduled',
            notes: 'Kopfhautbehandlung gewünscht',
            services: ['Haircut', 'Scalp Treatment'],
            products: []
        },
        {
            id: 'apt-010',
            clientId: 'client-010',
            clientName: 'Valentina Esposito',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-20',
            time: '14:00',
            status: 'Scheduled',
            notes: 'Instagram-Style gewünscht',
            services: ['Hair Color', 'Deep Conditioning'],
            products: []
        },
        // 21.01.2026
        {
            id: 'apt-011',
            clientId: 'client-001',
            clientName: 'Marco Rossi',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-21',
            time: '10:00',
            status: 'Scheduled',
            notes: '',
            services: ['Beard Trim'],
            products: []
        },
        {
            id: 'apt-012',
            clientId: 'client-011',
            clientName: 'Chiara Moretti',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-21',
            time: '11:00',
            status: 'Scheduled',
            notes: 'Nail Art gewünscht',
            services: ['Manicure'],
            products: []
        },
        {
            id: 'apt-013',
            clientId: 'client-008',
            clientName: 'Giuseppe Greco',
            stylistId: 'stylist-004',
            stylistName: 'Giulia B.',
            date: '2026-01-21',
            time: '14:00',
            status: 'Scheduled',
            notes: 'Klassischer Schnitt',
            services: ['Haircut'],
            products: []
        },
        {
            id: 'apt-014',
            clientId: 'client-002',
            clientName: 'Giulia Bianchi',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-21',
            time: '15:30',
            status: 'Scheduled',
            notes: 'Empfindliche Haut',
            services: ['Facial Treatment', 'Manicure'],
            products: []
        },
        // 22.01.2026
        {
            id: 'apt-015',
            clientId: 'client-005',
            clientName: 'Alessandro Ferrari',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-22',
            time: '09:30',
            status: 'Scheduled',
            notes: 'Vollbart-Pflege',
            services: ['Beard Trim', 'Hot Towel Shave'],
            products: []
        },
        {
            id: 'apt-016',
            clientId: 'client-004',
            clientName: 'Sofia Conti',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-22',
            time: '10:00',
            status: 'Scheduled',
            notes: 'Farbauffrischung',
            services: ['Balayage', 'Olaplex Treatment'],
            products: []
        },
        {
            id: 'apt-017',
            clientId: 'client-007',
            clientName: 'Isabella Ricci',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-22',
            time: '13:00',
            status: 'Scheduled',
            notes: 'Premium Produkte',
            services: ['Facial Treatment', 'Pedicure'],
            products: []
        },
        {
            id: 'apt-018',
            clientId: 'client-012',
            clientName: 'Roberto Fontana',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-22',
            time: '16:00',
            status: 'Scheduled',
            notes: 'VIP - Privater Raum',
            services: ['Haircut', 'Beard Trim', 'Scalp Treatment'],
            products: []
        },
        // 23.01.2026
        {
            id: 'apt-019',
            clientId: 'client-003',
            clientName: 'Francesca Marino',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-23',
            time: '10:00',
            status: 'Scheduled',
            notes: 'Gel Polish - neutrale Farben',
            services: ['Manicure', 'Pedicure'],
            products: []
        },
        {
            id: 'apt-020',
            clientId: 'client-009',
            clientName: 'Antonio Colombo',
            stylistId: 'stylist-004',
            stylistName: 'Giulia B.',
            date: '2026-01-23',
            time: '11:30',
            status: 'Scheduled',
            notes: 'Grooming-Ritual',
            services: ['Hot Towel Shave', 'Facial Treatment'],
            products: []
        },
        {
            id: 'apt-021',
            clientId: 'client-006',
            clientName: 'Luca Romano',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-23',
            time: '14:00',
            status: 'Scheduled',
            notes: 'Schuppen-Behandlung',
            services: ['Haircut', 'Scalp Treatment'],
            products: []
        },
        {
            id: 'apt-022',
            clientId: 'client-010',
            clientName: 'Valentina Esposito',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-23',
            time: '15:00',
            status: 'Scheduled',
            notes: 'Spitzen schneiden',
            services: ['Haircut', 'Deep Conditioning'],
            products: []
        },
        // 24.01.2026
        {
            id: 'apt-023',
            clientId: 'client-001',
            clientName: 'Marco Rossi',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-24',
            time: '09:00',
            status: 'Scheduled',
            notes: '',
            services: ['Haircut', 'Beard Trim'],
            products: []
        },
        {
            id: 'apt-024',
            clientId: 'client-007',
            clientName: 'Isabella Ricci',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-24',
            time: '10:30',
            status: 'Scheduled',
            notes: 'Spa-Tag',
            services: ['Facial Treatment', 'Manicure', 'Pedicure'],
            products: []
        },
        {
            id: 'apt-025',
            clientId: 'client-012',
            clientName: 'Roberto Fontana',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-24',
            time: '14:00',
            status: 'Scheduled',
            notes: 'VIP Kunde',
            services: ['Haircut', 'Hot Towel Shave', 'Facial Treatment'],
            products: []
        },
        // 25.01.2026
        {
            id: 'apt-026',
            clientId: 'client-004',
            clientName: 'Sofia Conti',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-25',
            time: '09:00',
            status: 'Scheduled',
            notes: 'Balayage Nachbesserung',
            services: ['Balayage', 'Olaplex Treatment'],
            products: []
        },
        {
            id: 'apt-027',
            clientId: 'client-011',
            clientName: 'Chiara Moretti',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-25',
            time: '11:00',
            status: 'Scheduled',
            notes: 'Nail Art - Wintermotive',
            services: ['Manicure'],
            products: []
        },
        {
            id: 'apt-028',
            clientId: 'client-005',
            clientName: 'Alessandro Ferrari',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-25',
            time: '13:00',
            status: 'Scheduled',
            notes: '',
            services: ['Beard Trim'],
            products: []
        },
        {
            id: 'apt-029',
            clientId: 'client-002',
            clientName: 'Giulia Bianchi',
            stylistId: 'stylist-004',
            stylistName: 'Giulia B.',
            date: '2026-01-25',
            time: '15:00',
            status: 'Scheduled',
            notes: 'Sensible Haut',
            services: ['Haircut', 'Facial Treatment'],
            products: []
        },
        // 26.01.2026
        {
            id: 'apt-030',
            clientId: 'client-008',
            clientName: 'Giuseppe Greco',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-26',
            time: '10:00',
            status: 'Scheduled',
            notes: 'Klassischer Schnitt',
            services: ['Haircut'],
            products: []
        },
        {
            id: 'apt-031',
            clientId: 'client-003',
            clientName: 'Francesca Marino',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-26',
            time: '11:30',
            status: 'Scheduled',
            notes: 'Gel Polish erneuern',
            services: ['Manicure', 'Pedicure'],
            products: []
        },
        {
            id: 'apt-032',
            clientId: 'client-009',
            clientName: 'Antonio Colombo',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-26',
            time: '14:00',
            status: 'Scheduled',
            notes: 'Hot Towel Shave Ritual',
            services: ['Beard Trim', 'Hot Towel Shave'],
            products: []
        }
    ];

    for (const apt of appointments) {
        prepare(`
            INSERT INTO appointments (id, client_id, client_name, stylist_id, stylist_name, date, time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(apt.id, apt.clientId, apt.clientName, apt.stylistId, apt.stylistName, apt.date, apt.time, apt.status, apt.notes);

        for (const service of apt.services) {
            prepare('INSERT INTO appointment_services (appointment_id, service_name) VALUES (?, ?)').run(apt.id, service);
        }
        for (const product of apt.products) {
            prepare('INSERT INTO appointment_products (appointment_id, product_name) VALUES (?, ?)').run(apt.id, product);
        }
    }
    console.log('Appointments seeded');

    // =====================================================
    // EMAIL TEMPLATES
    // =====================================================

    const emailTemplates = [
        {
            name: 'Win-back',
            type: 'win_back',
            subject_template: 'Wir vermissen Sie, {{client_name}}!',
            body_template: `Hallo {{client_name}},

wir haben festgestellt, dass Ihr letzter Besuch bei uns schon {{days_since_visit}} Tage her ist.

Wir würden uns freuen, Sie bald wieder bei uns begrüßen zu dürfen! Als kleines Dankeschön für Ihre Treue möchten wir Ihnen einen besonderen Service anbieten.

Buchen Sie jetzt Ihren nächsten Termin und profitieren Sie von unseren aktuellen Angeboten.

Herzliche Grüße,
Ihr SalonAssist Team`,
            active: 1
        },
        {
            name: 'Appointment Reminder',
            type: 'appointment_reminder',
            subject_template: 'Erinnerung: Ihr Termin am {{appointment_date}}',
            body_template: `Hallo {{client_name}},

wir möchten Sie an Ihren bevorstehenden Termin erinnern:

📅 Datum: {{appointment_date}}
🕐 Uhrzeit: {{appointment_time}}
💇 Services: {{services}}

Falls Sie den Termin absagen oder verschieben möchten, kontaktieren Sie uns bitte rechtzeitig.

Wir freuen uns auf Ihren Besuch!

Herzliche Grüße,
Ihr SalonAssist Team`,
            active: 1
        },
        {
            name: 'Product Recommendation',
            type: 'product_recommendation',
            subject_template: 'Perfekte Produkte für Ihre {{service}} Pflege',
            body_template: `Hallo {{client_name}},

basierend auf Ihrem letzten Service ({{service}}) möchten wir Ihnen einige Produkte empfehlen, die perfekt zu Ihrer Pflege passen:

{{product_recommendations}}

Diese Produkte helfen Ihnen, die Ergebnisse Ihrer Behandlung länger zu erhalten und Ihr Haar/Ihre Haut optimal zu pflegen.

Besuchen Sie uns im Salon oder bestellen Sie online!

Herzliche Grüße,
Ihr SalonAssist Team`,
            active: 1
        },
        {
            name: 'Promotion',
            type: 'promotion',
            subject_template: 'Exklusives Angebot für Sie, {{client_name}}!',
            body_template: `Hallo {{client_name}},

als geschätzter Kunde möchten wir Ihnen ein exklusives Angebot machen:

{{promotion_details}}

Dieses Angebot gilt nur für kurze Zeit. Buchen Sie jetzt Ihren Termin!

Herzliche Grüße,
Ihr SalonAssist Team`,
            active: 1
        }
    ];

    for (const template of emailTemplates) {
        prepare(`
            INSERT INTO email_templates (name, type, subject_template, body_template, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(template.name, template.type, template.subject_template, template.body_template, template.active);
    }
    console.log('Email templates seeded');

    // =====================================================
    // OUTREACH SETTINGS
    // =====================================================

    prepare(`
        INSERT INTO outreach_settings (id, win_back_threshold_days, reminder_days_before)
        VALUES (1, 30, 2)
    `).run();
    console.log('Outreach settings seeded');

    saveDb();
    console.log('Database seeding complete!');
    closeDb();
}

// Run seeder
seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
