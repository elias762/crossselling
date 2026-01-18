// =====================================================
// DATABASE CONNECTION - SQLite with sql.js
// =====================================================

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'salon.db');

let db = null;
let SQL = null;

async function initDb() {
    if (db) return db;

    // Initialize SQL.js
    SQL = await initSqlJs();

    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load existing database or create new one
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    return db;
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return db;
}

async function initializeSchema() {
    const database = await initDb();
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    database.run(schema);
    saveDb();
    console.log('Database schema initialized');
}

function saveDb() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

function closeDb() {
    if (db) {
        saveDb();
        db.close();
        db = null;
    }
}

// Helper to run queries (sql.js uses different API)
function prepare(sql) {
    const database = getDb();
    return {
        run: (...params) => {
            database.run(sql, params);
            saveDb();
            return { lastInsertRowid: database.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0 };
        },
        get: (...params) => {
            const stmt = database.prepare(sql);
            stmt.bind(params);
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                return row;
            }
            stmt.free();
            return undefined;
        },
        all: (...params) => {
            const results = [];
            const stmt = database.prepare(sql);
            stmt.bind(params);
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();
            return results;
        }
    };
}

module.exports = {
    initDb,
    getDb,
    initializeSchema,
    saveDb,
    closeDb,
    prepare
};
