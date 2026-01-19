const { getDb, query } = require('./_db');

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        // Tracking data
        const tracking = query(db, 'SELECT * FROM recommendation_tracking');

        // Calculate totals
        let totalShown = 0, totalAccepted = 0, totalDismissed = 0;
        for (const t of tracking) {
            totalShown += t.shown;
            totalAccepted += t.accepted;
            totalDismissed += t.dismissed;
        }

        // Top performers
        const topProducts = tracking
            .filter(t => t.item_type === 'product')
            .sort((a, b) => b.accepted - a.accepted)
            .slice(0, 5)
            .map(t => ({
                name: t.item_name,
                accepted: t.accepted,
                shown: t.shown,
                rate: t.shown > 0 ? Math.round((t.accepted / t.shown) * 100) : 0
            }));

        const topServices = tracking
            .filter(t => t.item_type === 'service')
            .sort((a, b) => b.accepted - a.accepted)
            .slice(0, 5)
            .map(t => ({
                name: t.item_name,
                accepted: t.accepted,
                shown: t.shown,
                rate: t.shown > 0 ? Math.round((t.accepted / t.shown) * 100) : 0
            }));

        res.json({
            summary: {
                totalShown,
                totalAccepted,
                totalDismissed,
                acceptRate: totalShown > 0 ? Math.round((totalAccepted / totalShown) * 100) : 0,
                dismissRate: totalShown > 0 ? Math.round((totalDismissed / totalShown) * 100) : 0
            },
            topProducts,
            topServices,
            tracking: tracking.map(t => ({
                id: t.id,
                itemName: t.item_name,
                itemType: t.item_type,
                shown: t.shown,
                accepted: t.accepted,
                dismissed: t.dismissed
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
