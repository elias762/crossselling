// =====================================================
// EXPRESS SERVER - Salon Cross-Selling API
// =====================================================

const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging (simple)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Routes
const clientsRouter = require('./routes/clients');
const stylistsRouter = require('./routes/stylists');
const servicesRouter = require('./routes/services');
const productsRouter = require('./routes/products');
const appointmentsRouter = require('./routes/appointments');
const rulesRouter = require('./routes/rules');
const trackingRouter = require('./routes/tracking');
const analyticsRouter = require('./routes/analytics');
const outreachRouter = require('./routes/outreach');

app.use('/api/clients', clientsRouter);
app.use('/api/stylists', stylistsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/products', productsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/outreach', outreachRouter);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Salon API Server',
        status: 'running',
        endpoints: {
            health: '/api/health',
            clients: '/api/clients',
            stylists: '/api/stylists',
            services: '/api/services',
            products: '/api/products',
            appointments: '/api/appointments',
            rules: '/api/rules',
            tracking: '/api/tracking',
            analytics: '/api/analytics',
            outreach: '/api/outreach'
        },
        frontend: 'Open index.html in browser'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Initialize database and start server
async function start() {
    try {
        await initDb();
        console.log('Database initialized');

        app.listen(PORT, () => {
            console.log(`Salon API server running on http://localhost:${PORT}`);
            console.log('Available endpoints:');
            console.log('  GET  /api/health');
            console.log('  GET  /api/clients');
            console.log('  GET  /api/stylists');
            console.log('  GET  /api/services');
            console.log('  GET  /api/products');
            console.log('  GET  /api/appointments');
            console.log('  GET  /api/rules');
            console.log('  GET  /api/tracking');
            console.log('  GET  /api/analytics');
            console.log('  GET  /api/outreach');
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();

module.exports = app;
