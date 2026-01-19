const { getDb, query } = require('./_db');

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        const clients = query(db, 'SELECT * FROM clients ORDER BY last_visit DESC');
        const tags = query(db, 'SELECT client_id, tag FROM client_tags');

        const tagsByClient = {};
        for (const { client_id, tag } of tags) {
            if (!tagsByClient[client_id]) tagsByClient[client_id] = [];
            tagsByClient[client_id].push(tag);
        }

        const result = clients.map(c => ({
            id: c.id,
            name: c.name,
            primaryInterest: c.primary_interest,
            preferences: c.preferences,
            issues: c.issues,
            lastVisit: c.last_visit,
            totalVisits: c.total_visits,
            tags: tagsByClient[c.id] || []
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
