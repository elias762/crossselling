// =====================================================
// ANALYTICS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare } = require('../db/database');

// GET /api/analytics - Get analytics data
router.get('/', (req, res, next) => {
    try {
        // Get all appointments (live + history for analytics)
        const appointments = [];

        // Live appointments
        const liveAppts = prepare(`SELECT id, date, time, status FROM appointments`).all();

        const liveServices = prepare('SELECT appointment_id, service_name FROM appointment_services').all();
        const liveProducts = prepare('SELECT appointment_id, product_name FROM appointment_products').all();

        const liveServicesByApt = {};
        for (const { appointment_id, service_name } of liveServices) {
            if (!liveServicesByApt[appointment_id]) liveServicesByApt[appointment_id] = [];
            liveServicesByApt[appointment_id].push(service_name);
        }

        const liveProductsByApt = {};
        for (const { appointment_id, product_name } of liveProducts) {
            if (!liveProductsByApt[appointment_id]) liveProductsByApt[appointment_id] = [];
            liveProductsByApt[appointment_id].push(product_name);
        }

        for (const apt of liveAppts) {
            appointments.push({
                date: apt.date,
                time: apt.time,
                status: apt.status,
                services: liveServicesByApt[apt.id] || [],
                products: liveProductsByApt[apt.id] || []
            });
        }

        // Client history
        const history = prepare('SELECT id, date, time, status FROM client_history').all();
        const historyServices = prepare('SELECT history_id, service_name FROM client_history_services').all();
        const historyProducts = prepare('SELECT history_id, product_name FROM client_history_products').all();

        const histServicesByHistory = {};
        for (const { history_id, service_name } of historyServices) {
            if (!histServicesByHistory[history_id]) histServicesByHistory[history_id] = [];
            histServicesByHistory[history_id].push(service_name);
        }

        const histProductsByHistory = {};
        for (const { history_id, product_name } of historyProducts) {
            if (!histProductsByHistory[history_id]) histProductsByHistory[history_id] = [];
            histProductsByHistory[history_id].push(product_name);
        }

        for (const h of history) {
            appointments.push({
                date: h.date,
                time: h.time,
                status: h.status,
                services: histServicesByHistory[h.id] || [],
                products: histProductsByHistory[h.id] || []
            });
        }

        // Get tracking data
        const trackingRows = prepare(`
            SELECT item_name, item_type, shown, accepted, dismissed
            FROM recommendation_tracking
        `).all();

        const tracking = {};
        for (const item of trackingRows) {
            tracking[item.item_name] = {
                shown: item.shown,
                accepted: item.accepted,
                dismissed: item.dismissed,
                type: item.item_type
            };
        }

        // Get services
        const services = prepare(`
            SELECT id, name, category, duration, price, active FROM services
        `).all().map(s => ({
            id: s.id,
            name: s.name,
            category: s.category,
            duration: s.duration,
            price: s.price,
            active: s.active === 1
        }));

        // Get products
        const products = prepare(`
            SELECT id, name, category, price, use_case, active FROM products
        `).all().map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            useCase: p.use_case,
            active: p.active === 1
        }));

        res.json({
            appointments,
            tracking,
            services,
            products
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
