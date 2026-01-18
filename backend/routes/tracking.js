// =====================================================
// TRACKING ROUTES - Recommendation Tracking
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare } = require('../db/database');

// GET /api/tracking - Get all tracking data
router.get('/', (req, res, next) => {
    try {
        const tracking = prepare(`
            SELECT item_name, item_type, shown, accepted, dismissed
            FROM recommendation_tracking
        `).all();

        // Convert to object keyed by item_name
        const result = {};
        for (const item of tracking) {
            result[item.item_name] = {
                shown: item.shown,
                accepted: item.accepted,
                dismissed: item.dismissed,
                type: item.item_type
            };
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// POST /api/tracking/shown - Track item shown
router.post('/shown', (req, res, next) => {
    try {
        const { itemName, type } = req.body;

        if (!itemName || !type) {
            return res.status(400).json({ error: 'itemName and type are required' });
        }

        // Check if exists
        const existing = prepare('SELECT id FROM recommendation_tracking WHERE item_name = ?').get(itemName);

        if (existing) {
            prepare('UPDATE recommendation_tracking SET shown = shown + 1 WHERE item_name = ?').run(itemName);
        } else {
            prepare(`
                INSERT INTO recommendation_tracking (item_name, item_type, shown, accepted, dismissed)
                VALUES (?, ?, 1, 0, 0)
            `).run(itemName, type);
        }

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

// POST /api/tracking/accepted - Track item accepted
router.post('/accepted', (req, res, next) => {
    try {
        const { itemName, type } = req.body;

        if (!itemName || !type) {
            return res.status(400).json({ error: 'itemName and type are required' });
        }

        const existing = prepare('SELECT id FROM recommendation_tracking WHERE item_name = ?').get(itemName);

        if (existing) {
            prepare('UPDATE recommendation_tracking SET accepted = accepted + 1 WHERE item_name = ?').run(itemName);
        } else {
            prepare(`
                INSERT INTO recommendation_tracking (item_name, item_type, shown, accepted, dismissed)
                VALUES (?, ?, 0, 1, 0)
            `).run(itemName, type);
        }

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

// POST /api/tracking/dismissed - Track item dismissed
router.post('/dismissed', (req, res, next) => {
    try {
        const { itemName, type } = req.body;

        if (!itemName || !type) {
            return res.status(400).json({ error: 'itemName and type are required' });
        }

        const existing = prepare('SELECT id FROM recommendation_tracking WHERE item_name = ?').get(itemName);

        if (existing) {
            prepare('UPDATE recommendation_tracking SET dismissed = dismissed + 1 WHERE item_name = ?').run(itemName);
        } else {
            prepare(`
                INSERT INTO recommendation_tracking (item_name, item_type, shown, accepted, dismissed)
                VALUES (?, ?, 0, 0, 1)
            `).run(itemName, type);
        }

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
