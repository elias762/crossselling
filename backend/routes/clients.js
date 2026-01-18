// =====================================================
// CLIENTS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare } = require('../db/database');

// GET /api/clients - Get all clients with tags
router.get('/', (req, res, next) => {
    try {
        const clients = prepare(`
            SELECT id, name, primary_interest, preferences, issues, last_visit, total_visits
            FROM clients ORDER BY name
        `).all();

        const tags = prepare(`SELECT client_id, tag FROM client_tags`).all();

        // Group tags by client
        const tagsByClient = {};
        for (const { client_id, tag } of tags) {
            if (!tagsByClient[client_id]) {
                tagsByClient[client_id] = [];
            }
            tagsByClient[client_id].push(tag);
        }

        // Attach tags to clients
        const result = clients.map(client => ({
            id: client.id,
            name: client.name,
            primaryInterest: client.primary_interest,
            preferences: client.preferences,
            issues: client.issues,
            lastVisit: client.last_visit,
            totalVisits: client.total_visits,
            tags: tagsByClient[client.id] || []
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/clients/:id - Get client by ID
router.get('/:id', (req, res, next) => {
    try {
        const { id } = req.params;

        const client = prepare(`
            SELECT id, name, primary_interest, preferences, issues, last_visit, total_visits
            FROM clients WHERE id = ?
        `).get(id);

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const tags = prepare(`SELECT tag FROM client_tags WHERE client_id = ?`).all(id);

        res.json({
            id: client.id,
            name: client.name,
            primaryInterest: client.primary_interest,
            preferences: client.preferences,
            issues: client.issues,
            lastVisit: client.last_visit,
            totalVisits: client.total_visits,
            tags: tags.map(t => t.tag)
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/clients/:id/history - Get client appointment history
router.get('/:id/history', (req, res, next) => {
    try {
        const { id } = req.params;

        // Check client exists
        const client = prepare('SELECT id FROM clients WHERE id = ?').get(id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Get history entries
        const history = prepare(`
            SELECT id, date, time, status
            FROM client_history
            WHERE client_id = ?
            ORDER BY date DESC, time DESC
        `).all(id);

        // Get services and products for each history entry
        const historyServices = prepare(`SELECT history_id, service_name FROM client_history_services`).all();
        const historyProducts = prepare(`SELECT history_id, product_name FROM client_history_products`).all();

        // Group by history_id
        const servicesByHistory = {};
        for (const { history_id, service_name } of historyServices) {
            if (!servicesByHistory[history_id]) {
                servicesByHistory[history_id] = [];
            }
            servicesByHistory[history_id].push(service_name);
        }

        const productsByHistory = {};
        for (const { history_id, product_name } of historyProducts) {
            if (!productsByHistory[history_id]) {
                productsByHistory[history_id] = [];
            }
            productsByHistory[history_id].push(product_name);
        }

        // Build result
        const result = history.map(h => ({
            date: h.date,
            time: h.time,
            status: h.status,
            services: servicesByHistory[h.id] || [],
            products: productsByHistory[h.id] || []
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
