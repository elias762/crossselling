// =====================================================
// STYLISTS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare } = require('../db/database');

// Helper to build stylist with specialties
function buildStylistsWithSpecialties(whereClause = '', params = []) {
    const stylists = prepare(`
        SELECT id, name, active FROM stylists ${whereClause} ORDER BY name
    `).all(...params);

    const specialties = prepare(`SELECT stylist_id, specialty FROM stylist_specialties`).all();

    // Group specialties by stylist
    const specialtiesByStylist = {};
    for (const { stylist_id, specialty } of specialties) {
        if (!specialtiesByStylist[stylist_id]) {
            specialtiesByStylist[stylist_id] = [];
        }
        specialtiesByStylist[stylist_id].push(specialty);
    }

    return stylists.map(stylist => ({
        id: stylist.id,
        name: stylist.name,
        active: stylist.active === 1,
        specialties: specialtiesByStylist[stylist.id] || []
    }));
}

// GET /api/stylists - Get all stylists
router.get('/', (req, res, next) => {
    try {
        const result = buildStylistsWithSpecialties();
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/stylists/active - Get active stylists only
router.get('/active', (req, res, next) => {
    try {
        const result = buildStylistsWithSpecialties('WHERE active = 1');
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/stylists/:id - Get stylist by ID
router.get('/:id', (req, res, next) => {
    try {
        const { id } = req.params;

        const stylist = prepare(`SELECT id, name, active FROM stylists WHERE id = ?`).get(id);

        if (!stylist) {
            return res.status(404).json({ error: 'Stylist not found' });
        }

        const specialties = prepare(`SELECT specialty FROM stylist_specialties WHERE stylist_id = ?`).all(id);

        res.json({
            id: stylist.id,
            name: stylist.name,
            active: stylist.active === 1,
            specialties: specialties.map(s => s.specialty)
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
