const { getDb, query } = require('./_db');

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        const stylists = query(db, 'SELECT * FROM stylists WHERE active = 1');
        const specialties = query(db, 'SELECT stylist_id, specialty FROM stylist_specialties');

        const specByStylelist = {};
        for (const { stylist_id, specialty } of specialties) {
            if (!specByStylelist[stylist_id]) specByStylelist[stylist_id] = [];
            specByStylelist[stylist_id].push(specialty);
        }

        const result = stylists.map(s => ({
            id: s.id,
            name: s.name,
            specialties: specByStylelist[s.id] || [],
            active: s.active === 1
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
