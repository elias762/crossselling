const { getDb, query } = require('./_db');

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        const tracking = query(db, 'SELECT * FROM recommendation_tracking ORDER BY shown DESC');

        const result = tracking.map(t => ({
            id: t.id,
            itemName: t.item_name,
            itemType: t.item_type,
            shown: t.shown,
            accepted: t.accepted,
            dismissed: t.dismissed,
            acceptRate: t.shown > 0 ? Math.round((t.accepted / t.shown) * 100) : 0
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
