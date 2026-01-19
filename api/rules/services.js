const { getDb, query, run } = require('../_db');

function getServiceRules(db, whereClause = '', params = []) {
    const rules = query(db, `SELECT id, trigger_service, reason, active FROM service_rules ${whereClause} ORDER BY trigger_service`, params);
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

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        if (req.method === 'GET') {
            res.json(getServiceRules(db));
        } else if (req.method === 'POST') {
            const { trigger, suggestions, reason, active } = req.body;

            if (!trigger || !suggestions || suggestions.length === 0) {
                return res.status(400).json({ error: 'Trigger and suggestions required' });
            }

            const ruleId = run(db, 'INSERT INTO service_rules (trigger_service, reason, active) VALUES (?, ?, ?)',
                [trigger, reason || null, active !== false ? 1 : 0]);

            for (const suggestion of suggestions) {
                run(db, 'INSERT INTO service_rule_suggestions (rule_id, suggested_service) VALUES (?, ?)', [ruleId, suggestion]);
            }

            const rules = getServiceRules(db, 'WHERE id = ?', [ruleId]);
            res.status(201).json(rules[0]);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
