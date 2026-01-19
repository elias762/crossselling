const { getDb, query } = require('./_db');

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        // Get settings
        const settings = query(db, 'SELECT * FROM outreach_settings WHERE id = 1');
        const thresholdDays = settings[0]?.win_back_threshold_days || 30;

        // Get clients who haven't visited in threshold days
        const clients = query(db, 'SELECT * FROM clients ORDER BY last_visit');

        const today = new Date();
        const winBackClients = clients.filter(c => {
            if (!c.last_visit) return true;
            const lastVisit = new Date(c.last_visit);
            const daysSince = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));
            return daysSince >= thresholdDays;
        }).map(c => ({
            id: c.id,
            name: c.name,
            lastVisit: c.last_visit,
            daysSinceVisit: c.last_visit
                ? Math.floor((today - new Date(c.last_visit)) / (1000 * 60 * 60 * 24))
                : 999,
            totalVisits: c.total_visits
        }));

        // Get email templates
        const templates = query(db, 'SELECT * FROM email_templates WHERE active = 1');

        res.json({
            settings: {
                winBackThresholdDays: thresholdDays,
                reminderDaysBefore: settings[0]?.reminder_days_before || 2
            },
            winBackClients,
            templates: templates.map(t => ({
                id: t.id,
                name: t.name,
                type: t.type,
                subject: t.subject_template,
                body: t.body_template
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
