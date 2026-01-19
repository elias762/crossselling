const { getDb, query } = require('./_db');

function getServiceRules(db) {
    const rules = query(db, 'SELECT id, trigger_service, reason, active FROM service_rules ORDER BY trigger_service');
    const suggestions = query(db, 'SELECT rule_id, suggested_service FROM service_rule_suggestions');

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

function getProductRules(db) {
    const rules = query(db, 'SELECT id, trigger_service, reason, active FROM product_rules ORDER BY trigger_service');
    const suggestions = query(db, 'SELECT rule_id, suggested_product FROM product_rule_suggestions');

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

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        res.json({
            serviceRules: getServiceRules(db),
            productRules: getProductRules(db)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
