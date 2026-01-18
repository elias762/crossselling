// =====================================================
// PRODUCTS ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const { prepare } = require('../db/database');

// Helper to format product
function formatProduct(product) {
    return {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        useCase: product.use_case,
        active: product.active === 1
    };
}

// GET /api/products - Get all products
router.get('/', (req, res, next) => {
    try {
        const products = prepare(`
            SELECT id, name, category, price, use_case, active
            FROM products ORDER BY category, name
        `).all();
        res.json(products.map(formatProduct));
    } catch (err) {
        next(err);
    }
});

// GET /api/products/active - Get active products only
router.get('/active', (req, res, next) => {
    try {
        const products = prepare(`
            SELECT id, name, category, price, use_case, active
            FROM products WHERE active = 1 ORDER BY category, name
        `).all();
        res.json(products.map(formatProduct));
    } catch (err) {
        next(err);
    }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', (req, res, next) => {
    try {
        const { id } = req.params;

        const product = prepare(`
            SELECT id, name, category, price, use_case, active
            FROM products WHERE id = ?
        `).get(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(formatProduct(product));
    } catch (err) {
        next(err);
    }
});

// POST /api/products - Create product
router.post('/', (req, res, next) => {
    try {
        const { name, category, price, useCase, active } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        const result = prepare(`
            INSERT INTO products (name, category, price, use_case, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, category || null, price, useCase || null, active !== false ? 1 : 0);

        const product = prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json(formatProduct(product));
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Product name already exists' });
        }
        next(err);
    }
});

// PUT /api/products/:id - Update product
router.put('/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, category, price, useCase, active } = req.body;

        const existing = prepare('SELECT id FROM products WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        prepare(`
            UPDATE products SET name = ?, category = ?, price = ?, use_case = ?, active = ?
            WHERE id = ?
        `).run(
            name || null,
            category || null,
            price || 0,
            useCase || null,
            active !== false ? 1 : 0,
            id
        );

        const product = prepare('SELECT * FROM products WHERE id = ?').get(id);
        res.json(formatProduct(product));
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Product name already exists' });
        }
        next(err);
    }
});

// PATCH /api/products/:id/toggle - Toggle active status
router.patch('/:id/toggle', (req, res, next) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const existing = prepare('SELECT id FROM products WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        prepare('UPDATE products SET active = ? WHERE id = ?').run(active ? 1 : 0, id);

        const product = prepare('SELECT * FROM products WHERE id = ?').get(id);
        res.json(formatProduct(product));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
