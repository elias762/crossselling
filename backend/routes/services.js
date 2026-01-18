// =====================================================
// SERVICES ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare, saveDb } = require('../db/database');

// Helper to format service
function formatService(service) {
    return {
        id: service.id,
        name: service.name,
        category: service.category,
        duration: service.duration,
        price: service.price,
        active: service.active === 1
    };
}

// GET /api/services - Get all services
router.get('/', (req, res, next) => {
    try {
        const services = prepare(`
            SELECT id, name, category, duration, price, active
            FROM services ORDER BY category, name
        `).all();
        res.json(services.map(formatService));
    } catch (err) {
        next(err);
    }
});

// GET /api/services/active - Get active services only
router.get('/active', (req, res, next) => {
    try {
        const services = prepare(`
            SELECT id, name, category, duration, price, active
            FROM services WHERE active = 1 ORDER BY category, name
        `).all();
        res.json(services.map(formatService));
    } catch (err) {
        next(err);
    }
});

// GET /api/services/:id - Get service by ID
router.get('/:id', (req, res, next) => {
    try {
        const { id } = req.params;

        const service = prepare(`
            SELECT id, name, category, duration, price, active
            FROM services WHERE id = ?
        `).get(id);

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(formatService(service));
    } catch (err) {
        next(err);
    }
});

// POST /api/services - Create service
router.post('/', (req, res, next) => {
    try {
        const { name, category, duration, price, active } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        const result = prepare(`
            INSERT INTO services (name, category, duration, price, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, category || null, duration || null, price, active !== false ? 1 : 0);

        const service = prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(formatService(service));
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Service name already exists' });
        }
        next(err);
    }
});

// PUT /api/services/:id - Update service
router.put('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, category, duration, price, active } = req.body;

        const existing = prepare('SELECT id FROM services WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Service not found' });
        }

        prepare(`
            UPDATE services SET name = ?, category = ?, duration = ?, price = ?, active = ?
            WHERE id = ?
        `).run(
            name || null,
            category || null,
            duration || null,
            price || 0,
            active !== false ? 1 : 0,
            id
        );

        const service = prepare('SELECT * FROM services WHERE id = ?').get(id);
        res.json(formatService(service));
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Service name already exists' });
        }
        next(err);
    }
});

// PATCH /api/services/:id/toggle - Toggle active status
router.patch('/:id/toggle', (req, res, next) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const existing = prepare('SELECT id FROM services WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Service not found' });
        }

        prepare('UPDATE services SET active = ? WHERE id = ?').run(active ? 1 : 0, id);

        const service = prepare('SELECT * FROM services WHERE id = ?').get(id);
        res.json(formatService(service));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
