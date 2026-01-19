const { getDb, query } = require('./_db');

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        const services = query(db, 'SELECT * FROM services ORDER BY category, name');

        const result = services.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            duration: s.duration,
            price: s.price,
            active: s.active === 1
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
