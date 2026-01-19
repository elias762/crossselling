const { getDb, query } = require('./_db');

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        const products = query(db, 'SELECT * FROM products ORDER BY category, name');

        const result = products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            useCase: p.use_case,
            active: p.active === 1
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
