// =====================================================
// RULES ROUTES (Service Rules + Product Rules)
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare } = require('../db/database');

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getServiceRulesWithSuggestions(whereClause = '', params = []) {
    const rules = prepare(`
        SELECT id, trigger_service, reason, active
        FROM service_rules ${whereClause} ORDER BY trigger_service
    `).all(...params);

    const suggestions = prepare('SELECT rule_id, suggested_service FROM service_rule_suggestions').all();

    const suggestionsByRule = {};
    for (const { rule_id, suggested_service } of suggestions) {
        if (!suggestionsByRule[rule_id]) suggestionsByRule[rule_id] = [];
        suggestionsByRule[rule_id].push(suggested_service);
    }

    return rules.map(rule => ({
        id: rule.id,
        trigger: rule.trigger_service,
        suggestions: suggestionsByRule[rule.id] || [],
        reason: rule.reason,
        active: rule.active === 1
    }));
}

function getProductRulesWithSuggestions(whereClause = '', params = []) {
    const rules = prepare(`
        SELECT id, trigger_service, reason, active
        FROM product_rules ${whereClause} ORDER BY trigger_service
    `).all(...params);

    const suggestions = prepare('SELECT rule_id, suggested_product FROM product_rule_suggestions').all();

    const suggestionsByRule = {};
    for (const { rule_id, suggested_product } of suggestions) {
        if (!suggestionsByRule[rule_id]) suggestionsByRule[rule_id] = [];
        suggestionsByRule[rule_id].push(suggested_product);
    }

    return rules.map(rule => ({
        id: rule.id,
        trigger: rule.trigger_service,
        suggestions: suggestionsByRule[rule.id] || [],
        reason: rule.reason,
        active: rule.active === 1
    }));
}

// =====================================================
// COMBINED RULES
// =====================================================

// GET /api/rules - Get all rules (service + product)
router.get('/', (req, res, next) => {
    try {
        res.json({
            serviceRules: getServiceRulesWithSuggestions(),
            productRules: getProductRulesWithSuggestions()
        });
    } catch (err) {
        next(err);
    }
});

// =====================================================
// SERVICE RULES
// =====================================================

// GET /api/rules/services - Get service rules
router.get('/services', (req, res, next) => {
    try {
        res.json(getServiceRulesWithSuggestions());
    } catch (err) {
        next(err);
    }
});

// POST /api/rules/services - Create service rule
router.post('/services', (req, res, next) => {
    try {
        const { trigger, suggestions, reason, active } = req.body;

        if (!trigger || !suggestions || suggestions.length === 0) {
            return res.status(400).json({ error: 'Trigger and at least one suggestion are required' });
        }

        const result = prepare(`
            INSERT INTO service_rules (trigger_service, reason, active) VALUES (?, ?, ?)
        `).run(trigger, reason || null, active !== false ? 1 : 0);

        const ruleId = result.lastInsertRowid;
        for (const suggestion of suggestions) {
            prepare('INSERT INTO service_rule_suggestions (rule_id, suggested_service) VALUES (?, ?)').run(ruleId, suggestion);
        }

        const rules = getServiceRulesWithSuggestions('WHERE id = ?', [ruleId]);
        res.status(201).json(rules[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/rules/services/:id - Update service rule
router.put('/services/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const { trigger, suggestions, reason, active } = req.body;

        const existing = prepare('SELECT id FROM service_rules WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Service rule not found' });
        }

        prepare(`
            UPDATE service_rules SET trigger_service = ?, reason = ?, active = ? WHERE id = ?
        `).run(trigger, reason || null, active !== false ? 1 : 0, id);

        // Replace suggestions
        prepare('DELETE FROM service_rule_suggestions WHERE rule_id = ?').run(id);
        if (suggestions && suggestions.length > 0) {
            for (const suggestion of suggestions) {
                prepare('INSERT INTO service_rule_suggestions (rule_id, suggested_service) VALUES (?, ?)').run(id, suggestion);
            }
        }

        const rules = getServiceRulesWithSuggestions('WHERE id = ?', [id]);
        res.json(rules[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/rules/services/:id - Delete service rule
router.delete('/services/:id', (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = prepare('SELECT id FROM service_rules WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Service rule not found' });
        }

        prepare('DELETE FROM service_rule_suggestions WHERE rule_id = ?').run(id);
        prepare('DELETE FROM service_rules WHERE id = ?').run(id);
        res.json({ success: true, id: Number(id) });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/rules/services/:id/toggle - Toggle service rule active
router.patch('/services/:id/toggle', (req, res, next) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const existing = prepare('SELECT id FROM service_rules WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Service rule not found' });
        }

        prepare('UPDATE service_rules SET active = ? WHERE id = ?').run(active ? 1 : 0, id);

        const rules = getServiceRulesWithSuggestions('WHERE id = ?', [id]);
        res.json(rules[0]);
    } catch (err) {
        next(err);
    }
});

// =====================================================
// PRODUCT RULES
// =====================================================

// GET /api/rules/products - Get product rules
router.get('/products', (req, res, next) => {
    try {
        res.json(getProductRulesWithSuggestions());
    } catch (err) {
        next(err);
    }
});

// POST /api/rules/products - Create product rule
router.post('/products', (req, res, next) => {
    try {
        const { trigger, suggestions, reason, active } = req.body;

        if (!trigger || !suggestions || suggestions.length === 0) {
            return res.status(400).json({ error: 'Trigger and at least one suggestion are required' });
        }

        const result = prepare(`
            INSERT INTO product_rules (trigger_service, reason, active) VALUES (?, ?, ?)
        `).run(trigger, reason || null, active !== false ? 1 : 0);

        const ruleId = result.lastInsertRowid;
        for (const suggestion of suggestions) {
            prepare('INSERT INTO product_rule_suggestions (rule_id, suggested_product) VALUES (?, ?)').run(ruleId, suggestion);
        }

        const rules = getProductRulesWithSuggestions('WHERE id = ?', [ruleId]);
        res.status(201).json(rules[0]);
    } catch (err) {
        next(err);
    }
});

// PUT /api/rules/products/:id - Update product rule
router.put('/products/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const { trigger, suggestions, reason, active } = req.body;

        const existing = prepare('SELECT id FROM product_rules WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Product rule not found' });
        }

        prepare(`
            UPDATE product_rules SET trigger_service = ?, reason = ?, active = ? WHERE id = ?
        `).run(trigger, reason || null, active !== false ? 1 : 0, id);

        // Replace suggestions
        prepare('DELETE FROM product_rule_suggestions WHERE rule_id = ?').run(id);
        if (suggestions && suggestions.length > 0) {
            for (const suggestion of suggestions) {
                prepare('INSERT INTO product_rule_suggestions (rule_id, suggested_product) VALUES (?, ?)').run(id, suggestion);
            }
        }

        const rules = getProductRulesWithSuggestions('WHERE id = ?', [id]);
        res.json(rules[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/rules/products/:id - Delete product rule
router.delete('/products/:id', (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = prepare('SELECT id FROM product_rules WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Product rule not found' });
        }

        prepare('DELETE FROM product_rule_suggestions WHERE rule_id = ?').run(id);
        prepare('DELETE FROM product_rules WHERE id = ?').run(id);
        res.json({ success: true, id: Number(id) });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/rules/products/:id/toggle - Toggle product rule active
router.patch('/products/:id/toggle', (req, res, next) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const existing = prepare('SELECT id FROM product_rules WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Product rule not found' });
        }

        prepare('UPDATE product_rules SET active = ? WHERE id = ?').run(active ? 1 : 0, id);

        const rules = getProductRulesWithSuggestions('WHERE id = ?', [id]);
        res.json(rules[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
