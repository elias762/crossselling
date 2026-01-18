// =====================================================
// APPOINTMENTS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare } = require('../db/database');

// Helper to generate ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Helper to get appointment with services and products
function getAppointmentWithDetails(appointmentId) {
    const apt = prepare(`
        SELECT id, client_id, client_name, stylist_id, stylist_name, date, time, status, notes
        FROM appointments WHERE id = ?
    `).get(appointmentId);

    if (!apt) return null;

    const services = prepare(`
        SELECT service_name FROM appointment_services WHERE appointment_id = ?
    `).all(appointmentId);

    const products = prepare(`
        SELECT product_name FROM appointment_products WHERE appointment_id = ?
    `).all(appointmentId);

    return {
        id: apt.id,
        clientId: apt.client_id,
        client: apt.client_name,
        stylistId: apt.stylist_id,
        stylist: apt.stylist_name,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        notes: apt.notes,
        services: services.map(s => s.service_name),
        products: products.map(p => p.product_name)
    };
}

// GET /api/appointments - Get all appointments with services/products
router.get('/', (req, res, next) => {
    try {
        const appointments = prepare(`
            SELECT id, client_id, client_name, stylist_id, stylist_name, date, time, status, notes
            FROM appointments ORDER BY date DESC, time DESC
        `).all();

        const allServices = prepare('SELECT appointment_id, service_name FROM appointment_services').all();
        const allProducts = prepare('SELECT appointment_id, product_name FROM appointment_products').all();

        // Group by appointment
        const servicesByApt = {};
        for (const { appointment_id, service_name } of allServices) {
            if (!servicesByApt[appointment_id]) servicesByApt[appointment_id] = [];
            servicesByApt[appointment_id].push(service_name);
        }

        const productsByApt = {};
        for (const { appointment_id, product_name } of allProducts) {
            if (!productsByApt[appointment_id]) productsByApt[appointment_id] = [];
            productsByApt[appointment_id].push(product_name);
        }

        const result = appointments.map(apt => ({
            id: apt.id,
            clientId: apt.client_id,
            client: apt.client_name,
            stylistId: apt.stylist_id,
            stylist: apt.stylist_name,
            date: apt.date,
            time: apt.time,
            status: apt.status,
            notes: apt.notes,
            services: servicesByApt[apt.id] || [],
            products: productsByApt[apt.id] || []
        }));

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/appointments/:id - Get appointment by ID
router.get('/:id', (req, res, next) => {
    try {
        const apt = getAppointmentWithDetails(req.params.id);

        if (!apt) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json(apt);
    } catch (err) {
        next(err);
    }
});

// POST /api/appointments - Create appointment with services/products
router.post('/', (req, res, next) => {
    try {
        const { clientId, client, stylistId, stylist, date, time, status, notes, services, products } = req.body;

        if (!client || !services || services.length === 0) {
            return res.status(400).json({ error: 'Client and at least one service are required' });
        }

        const id = generateId();

        prepare(`
            INSERT INTO appointments (id, client_id, client_name, stylist_id, stylist_name, date, time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, clientId || null, client, stylistId || null, stylist || null, date, time, status || 'Scheduled', notes || null);

        for (const service of services) {
            prepare('INSERT INTO appointment_services (appointment_id, service_name) VALUES (?, ?)').run(id, service);
        }

        if (products && products.length > 0) {
            for (const product of products) {
                prepare('INSERT INTO appointment_products (appointment_id, product_name) VALUES (?, ?)').run(id, product);
            }
        }

        const apt = getAppointmentWithDetails(id);
        res.status(201).json(apt);
    } catch (err) {
        next(err);
    }
});

// PUT /api/appointments/:id - Update appointment status/notes
router.put('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const existing = prepare('SELECT id FROM appointments WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        if (status !== undefined) {
            prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
        }
        if (notes !== undefined) {
            prepare('UPDATE appointments SET notes = ? WHERE id = ?').run(notes, id);
        }

        const apt = getAppointmentWithDetails(id);
        res.json(apt);
    } catch (err) {
        next(err);
    }
});

// POST /api/appointments/:id/services - Add service to appointment
router.post('/:id/services', (req, res, next) => {
    try {
        const { id } = req.params;
        const { serviceName } = req.body;

        const existing = prepare('SELECT id FROM appointments WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check if service already added
        const alreadyAdded = prepare(`
            SELECT id FROM appointment_services WHERE appointment_id = ? AND service_name = ?
        `).get(id, serviceName);

        if (!alreadyAdded) {
            prepare('INSERT INTO appointment_services (appointment_id, service_name) VALUES (?, ?)').run(id, serviceName);
        }

        const apt = getAppointmentWithDetails(id);
        res.json(apt);
    } catch (err) {
        next(err);
    }
});

// POST /api/appointments/:id/products - Add product to appointment
router.post('/:id/products', (req, res, next) => {
    try {
        const { id } = req.params;
        const { productName } = req.body;

        const existing = prepare('SELECT id FROM appointments WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check if product already added
        const alreadyAdded = prepare(`
            SELECT id FROM appointment_products WHERE appointment_id = ? AND product_name = ?
        `).get(id, productName);

        if (!alreadyAdded) {
            prepare('INSERT INTO appointment_products (appointment_id, product_name) VALUES (?, ?)').run(id, productName);
        }

        const apt = getAppointmentWithDetails(id);
        res.json(apt);
    } catch (err) {
        next(err);
    }
});

// POST /api/appointments/:id/dismiss - Dismiss recommendation
router.post('/:id/dismiss', (req, res, next) => {
    try {
        const { id } = req.params;
        const { itemName, itemType } = req.body;

        const existing = prepare('SELECT id FROM appointments WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Check if already dismissed
        const alreadyDismissed = prepare(`
            SELECT id FROM dismissed_recommendations WHERE appointment_id = ? AND item_name = ? AND item_type = ?
        `).get(id, itemName, itemType);

        if (!alreadyDismissed) {
            prepare(`
                INSERT INTO dismissed_recommendations (appointment_id, item_name, item_type)
                VALUES (?, ?, ?)
            `).run(id, itemName, itemType);
        }

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

// GET /api/appointments/:id/dismissed - Get dismissed items for appointment
router.get('/:id/dismissed', (req, res, next) => {
    try {
        const { id } = req.params;

        const dismissed = prepare(`
            SELECT item_name, item_type FROM dismissed_recommendations WHERE appointment_id = ?
        `).all(id);

        const result = { services: [], products: [] };
        for (const { item_name, item_type } of dismissed) {
            if (item_type === 'service') {
                result.services.push(item_name);
            } else {
                result.products.push(item_name);
            }
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
