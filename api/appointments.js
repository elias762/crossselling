const { getDb, query } = require('./_db');

module.exports = async (req, res) => {
    try {
        const db = await getDb();

        const appointments = query(db, 'SELECT * FROM appointments ORDER BY date, time');
        const services = query(db, 'SELECT appointment_id, service_name FROM appointment_services');
        const products = query(db, 'SELECT appointment_id, product_name FROM appointment_products');

        const servicesByApt = {};
        for (const { appointment_id, service_name } of services) {
            if (!servicesByApt[appointment_id]) servicesByApt[appointment_id] = [];
            servicesByApt[appointment_id].push(service_name);
        }

        const productsByApt = {};
        for (const { appointment_id, product_name } of products) {
            if (!productsByApt[appointment_id]) productsByApt[appointment_id] = [];
            productsByApt[appointment_id].push(product_name);
        }

        const result = appointments.map(apt => ({
            id: apt.id,
            clientId: apt.client_id,
            clientName: apt.client_name,
            stylistId: apt.stylist_id,
            stylistName: apt.stylist_name,
            date: apt.date,
            time: apt.time,
            status: apt.status,
            notes: apt.notes,
            services: servicesByApt[apt.id] || [],
            products: productsByApt[apt.id] || []
        }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
