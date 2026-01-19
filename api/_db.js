// =====================================================
// DATABASE MODULE per Vercel Serverless
// Usa sql.js con dati demo pre-caricati
// =====================================================

const initSqlJs = require('sql.js');

let db = null;
let SQL = null;

// Schema SQL
const SCHEMA = `
-- Stylists
CREATE TABLE IF NOT EXISTS stylists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS stylist_specialties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stylist_id TEXT,
    specialty TEXT,
    FOREIGN KEY (stylist_id) REFERENCES stylists(id)
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    primary_interest TEXT,
    preferences TEXT,
    issues TEXT,
    last_visit TEXT,
    total_visits INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS client_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT,
    tag TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS client_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT,
    date TEXT,
    time TEXT,
    status TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS client_history_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    history_id INTEGER,
    service_name TEXT,
    FOREIGN KEY (history_id) REFERENCES client_history(id)
);

CREATE TABLE IF NOT EXISTS client_history_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    history_id INTEGER,
    product_name TEXT,
    FOREIGN KEY (history_id) REFERENCES client_history(id)
);

-- Services
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    duration INTEGER,
    price REAL,
    active INTEGER DEFAULT 1
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price REAL,
    use_case TEXT,
    active INTEGER DEFAULT 1
);

-- Service Rules
CREATE TABLE IF NOT EXISTS service_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger_service TEXT NOT NULL,
    reason TEXT,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS service_rule_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER,
    suggested_service TEXT,
    FOREIGN KEY (rule_id) REFERENCES service_rules(id)
);

-- Product Rules
CREATE TABLE IF NOT EXISTS product_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger_service TEXT NOT NULL,
    reason TEXT,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS product_rule_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER,
    suggested_product TEXT,
    FOREIGN KEY (rule_id) REFERENCES product_rules(id)
);

-- Recommendation Tracking
CREATE TABLE IF NOT EXISTS recommendation_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    shown INTEGER DEFAULT 0,
    accepted INTEGER DEFAULT 0,
    dismissed INTEGER DEFAULT 0
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT,
    stylist_id TEXT,
    stylist_name TEXT,
    date TEXT,
    time TEXT,
    status TEXT DEFAULT 'Programmato',
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (stylist_id) REFERENCES stylists(id)
);

CREATE TABLE IF NOT EXISTS appointment_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT,
    service_name TEXT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

CREATE TABLE IF NOT EXISTS appointment_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT,
    product_name TEXT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    subject_template TEXT,
    body_template TEXT,
    active INTEGER DEFAULT 1
);

-- Outreach Settings
CREATE TABLE IF NOT EXISTS outreach_settings (
    id INTEGER PRIMARY KEY,
    win_back_threshold_days INTEGER DEFAULT 30,
    reminder_days_before INTEGER DEFAULT 2
);
`;

// Dati demo
function seedData(db) {
    // Stilisti
    const stylists = [
        { id: 'stylist-001', name: 'Marco V.', specialties: ['Capelli', 'Barba'] },
        { id: 'stylist-002', name: 'Lucia R.', specialties: ['Capelli', 'Colore'] },
        { id: 'stylist-003', name: 'Andrea M.', specialties: ['Unghie', 'Viso'] },
        { id: 'stylist-004', name: 'Giulia B.', specialties: ['Capelli', 'Viso'] }
    ];

    for (const s of stylists) {
        db.run('INSERT OR REPLACE INTO stylists (id, name, active) VALUES (?, ?, 1)', [s.id, s.name]);
        for (const spec of s.specialties) {
            db.run('INSERT INTO stylist_specialties (stylist_id, specialty) VALUES (?, ?)', [s.id, spec]);
        }
    }

    // Clienti
    const clients = [
        { id: 'client-001', name: 'Marco Rossi', tags: ['Styling Capelli', 'Cura Barba'], primaryInterest: 'Capelli e Barba', preferences: 'Preferisce prodotti opachi.', issues: 'Cuoio capelluto secco', lastVisit: '2026-01-10', totalVisits: 12 },
        { id: 'client-002', name: 'Giulia Bianchi', tags: ['Skincare', 'Styling Capelli'], primaryInterest: 'Skincare', preferences: 'Pelle sensibile.', issues: 'Pelle soggetta a rossori', lastVisit: '2026-01-15', totalVisits: 8 },
        { id: 'client-003', name: 'Francesca Marino', tags: ['Unghie', 'Skincare'], primaryInterest: 'Unghie', preferences: 'Solo smalto gel.', issues: 'Unghie fragili', lastVisit: '2026-01-12', totalVisits: 15 },
        { id: 'client-004', name: 'Sofia Conti', tags: ['Styling Capelli', 'Colore Capelli'], primaryInterest: 'Colore Capelli', preferences: 'Specialista balayage.', issues: 'Colore che sbiadisce', lastVisit: '2026-01-08', totalVisits: 6 },
        { id: 'client-005', name: 'Alessandro Ferrari', tags: ['Cura Barba'], primaryInterest: 'Barba', preferences: 'Preferisce oli naturali.', issues: 'Crescita irregolare', lastVisit: '2026-01-14', totalVisits: 20 },
        { id: 'client-006', name: 'Luca Romano', tags: ['Styling Capelli', 'Cura Cuoio Capelluto'], primaryInterest: 'Capelli', preferences: 'Styling minimale.', issues: 'Forfora', lastVisit: '2026-01-05', totalVisits: 9 },
        { id: 'client-007', name: 'Isabella Ricci', tags: ['Skincare', 'Unghie'], primaryInterest: 'Grooming Completo', preferences: 'Solo prodotti premium.', issues: '', lastVisit: '2026-01-11', totalVisits: 24 },
        { id: 'client-008', name: 'Giuseppe Greco', tags: ['Styling Capelli'], primaryInterest: 'Capelli', preferences: 'Solo tagli classici.', issues: 'Capelli diradati', lastVisit: '2025-12-28', totalVisits: 4 },
        { id: 'client-009', name: 'Antonio Colombo', tags: ['Cura Barba', 'Skincare'], primaryInterest: 'Barba e Viso', preferences: 'Ama i rituali di grooming.', issues: 'Peli incarniti', lastVisit: '2026-01-13', totalVisits: 11 },
        { id: 'client-010', name: 'Valentina Esposito', tags: ['Colore Capelli', 'Styling Capelli'], primaryInterest: 'Colore Capelli', preferences: 'Colori audaci.', issues: 'Punte danneggiate', lastVisit: '2026-01-09', totalVisits: 7 },
        { id: 'client-011', name: 'Chiara Moretti', tags: ['Unghie'], primaryInterest: 'Unghie', preferences: 'Adora la nail art.', issues: 'Cuticole secche', lastVisit: '2026-01-16', totalVisits: 18 },
        { id: 'client-012', name: 'Roberto Fontana', tags: ['Styling Capelli', 'Cura Barba', 'Skincare'], primaryInterest: 'Grooming Completo', preferences: 'Cliente VIP.', issues: 'Pelle sensibile', lastVisit: '2026-01-07', totalVisits: 32 }
    ];

    for (const c of clients) {
        db.run('INSERT OR REPLACE INTO clients (id, name, primary_interest, preferences, issues, last_visit, total_visits) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [c.id, c.name, c.primaryInterest, c.preferences, c.issues, c.lastVisit, c.totalVisits]);
        for (const tag of c.tags) {
            db.run('INSERT INTO client_tags (client_id, tag) VALUES (?, ?)', [c.id, tag]);
        }
    }

    // Servizi
    const services = [
        { name: 'Taglio Capelli', category: 'Capelli', duration: 30, price: 35 },
        { name: 'Colore Capelli', category: 'Capelli', duration: 90, price: 85 },
        { name: 'Balayage', category: 'Capelli', duration: 120, price: 150 },
        { name: 'Trattamento Profondo', category: 'Capelli', duration: 30, price: 40 },
        { name: 'Trattamento Cuoio Capelluto', category: 'Capelli', duration: 45, price: 55 },
        { name: 'Regolazione Barba', category: 'Barba', duration: 20, price: 20 },
        { name: 'Rasatura Asciugamano Caldo', category: 'Barba', duration: 30, price: 35 },
        { name: 'Trattamento Viso', category: 'Viso', duration: 60, price: 75 },
        { name: 'Manicure', category: 'Unghie', duration: 45, price: 30 },
        { name: 'Pedicure', category: 'Unghie', duration: 60, price: 45 },
        { name: 'Trattamento Olaplex', category: 'Capelli', duration: 45, price: 65 }
    ];

    for (const s of services) {
        db.run('INSERT INTO services (name, category, duration, price, active) VALUES (?, ?, ?, ?, 1)',
            [s.name, s.category, s.duration, s.price]);
    }

    // Prodotti
    const products = [
        { name: 'Argilla Opaca Styling', category: 'Capelli', price: 24, useCase: 'Tenuta' },
        { name: 'Spray Sale Marino', category: 'Capelli', price: 18, useCase: 'Tenuta' },
        { name: 'Siero Capelli', category: 'Capelli', price: 28, useCase: 'Riparazione' },
        { name: 'Shampoo Protezione Colore', category: 'Capelli', price: 22, useCase: 'Riparazione' },
        { name: 'Balsamo Protezione Colore', category: 'Capelli', price: 22, useCase: 'Riparazione' },
        { name: 'Shampoo Antiforfora', category: 'Capelli', price: 19, useCase: 'Antiforfora' },
        { name: 'Siero Cuoio Capelluto', category: 'Capelli', price: 32, useCase: 'Antiforfora' },
        { name: 'Mousse Volumizzante', category: 'Capelli', price: 20, useCase: 'Tenuta' },
        { name: 'Olio da Barba', category: 'Barba', price: 18, useCase: 'Idratazione' },
        { name: 'Balsamo da Barba', category: 'Barba', price: 20, useCase: 'Tenuta' },
        { name: 'Balsamo Dopobarba', category: 'Barba', price: 15, useCase: 'Idratazione' },
        { name: 'Crema Idratante Viso', category: 'Viso', price: 35, useCase: 'Idratazione' },
        { name: 'Crema SPF', category: 'Viso', price: 38, useCase: 'Protezione' },
        { name: 'Olio Cuticole', category: 'Unghie', price: 12, useCase: 'Idratazione' },
        { name: 'Rinforzante Unghie', category: 'Unghie', price: 16, useCase: 'Riparazione' }
    ];

    for (const p of products) {
        db.run('INSERT INTO products (name, category, price, use_case, active) VALUES (?, ?, ?, ?, 1)',
            [p.name, p.category, p.price, p.useCase]);
    }

    // Regole servizi
    const serviceRules = [
        { trigger: 'Taglio Capelli', suggestions: ['Trattamento Profondo', 'Trattamento Cuoio Capelluto'], reason: 'Ripristina idratazione' },
        { trigger: 'Regolazione Barba', suggestions: ['Rasatura Asciugamano Caldo'], reason: 'Esperienza grooming completa' },
        { trigger: 'Colore Capelli', suggestions: ['Trattamento Profondo', 'Trattamento Olaplex'], reason: 'Protegge i capelli colorati' },
        { trigger: 'Balayage', suggestions: ['Trattamento Olaplex'], reason: 'Essenziale per la cura del balayage' },
        { trigger: 'Manicure', suggestions: ['Pedicure'], reason: 'Pacchetto cura unghie completo' },
        { trigger: 'Trattamento Viso', suggestions: ['Trattamento Cuoio Capelluto'], reason: 'Grooming completo testa-viso' }
    ];

    for (const rule of serviceRules) {
        db.run('INSERT INTO service_rules (trigger_service, reason, active) VALUES (?, ?, 1)', [rule.trigger, rule.reason]);
        const ruleId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];
        for (const s of rule.suggestions) {
            db.run('INSERT INTO service_rule_suggestions (rule_id, suggested_service) VALUES (?, ?)', [ruleId, s]);
        }
    }

    // Regole prodotti
    const productRules = [
        { trigger: 'Regolazione Barba', suggestions: ['Olio da Barba', 'Balsamo da Barba'], reason: 'Mantiene la barba morbida' },
        { trigger: 'Taglio Capelli', suggestions: ['Argilla Opaca Styling', 'Spray Sale Marino'], reason: 'Perfetti per lo styling' },
        { trigger: 'Trattamento Cuoio Capelluto', suggestions: ['Shampoo Antiforfora', 'Siero Cuoio Capelluto'], reason: 'Prolunga i benefici' },
        { trigger: 'Colore Capelli', suggestions: ['Shampoo Protezione Colore', 'Balsamo Protezione Colore'], reason: 'Preserva il colore' },
        { trigger: 'Balayage', suggestions: ['Shampoo Protezione Colore', 'Siero Capelli'], reason: 'Protegge le schiariture' },
        { trigger: 'Trattamento Viso', suggestions: ['Crema Idratante Viso', 'Crema SPF'], reason: 'Mantiene i risultati' },
        { trigger: 'Trattamento Profondo', suggestions: ['Siero Capelli'], reason: 'Nutrimento extra' },
        { trigger: 'Rasatura Asciugamano Caldo', suggestions: ['Balsamo Dopobarba', 'Crema Idratante Viso'], reason: 'Lenisce dopo la rasatura' },
        { trigger: 'Manicure', suggestions: ['Olio Cuticole', 'Rinforzante Unghie'], reason: 'Mantiene la salute delle unghie' },
        { trigger: 'Pedicure', suggestions: ['Olio Cuticole'], reason: 'Mantiene le unghie sane' }
    ];

    for (const rule of productRules) {
        db.run('INSERT INTO product_rules (trigger_service, reason, active) VALUES (?, ?, 1)', [rule.trigger, rule.reason]);
        const ruleId = db.exec("SELECT last_insert_rowid()")[0].values[0][0];
        for (const p of rule.suggestions) {
            db.run('INSERT INTO product_rule_suggestions (rule_id, suggested_product) VALUES (?, ?)', [ruleId, p]);
        }
    }

    // Tracking
    const tracking = [
        { itemName: 'Olio da Barba', type: 'product', shown: 45, accepted: 28, dismissed: 8 },
        { itemName: 'Argilla Opaca Styling', type: 'product', shown: 52, accepted: 31, dismissed: 10 },
        { itemName: 'Shampoo Protezione Colore', type: 'product', shown: 28, accepted: 18, dismissed: 5 },
        { itemName: 'Crema Idratante Viso', type: 'product', shown: 22, accepted: 14, dismissed: 4 },
        { itemName: 'Trattamento Profondo', type: 'service', shown: 40, accepted: 18, dismissed: 12 },
        { itemName: 'Rasatura Asciugamano Caldo', type: 'service', shown: 32, accepted: 20, dismissed: 7 },
        { itemName: 'Trattamento Olaplex', type: 'service', shown: 18, accepted: 8, dismissed: 5 }
    ];

    for (const t of tracking) {
        db.run('INSERT INTO recommendation_tracking (item_name, item_type, shown, accepted, dismissed) VALUES (?, ?, ?, ?, ?)',
            [t.itemName, t.type, t.shown, t.accepted, t.dismissed]);
    }

    // Appuntamenti
    const appointments = [
        { id: 'apt-001', clientId: 'client-009', clientName: 'Antonio Colombo', stylistId: 'stylist-001', stylistName: 'Marco V.', date: '2026-01-19', time: '09:00', status: 'Programmato', notes: '', services: ['Regolazione Barba', 'Rasatura Asciugamano Caldo'] },
        { id: 'apt-002', clientId: 'client-007', clientName: 'Isabella Ricci', stylistId: 'stylist-003', stylistName: 'Andrea M.', date: '2026-01-19', time: '10:00', status: 'Programmato', notes: 'Pacchetto spa', services: ['Trattamento Viso', 'Manicure', 'Pedicure'] },
        { id: 'apt-003', clientId: 'client-012', clientName: 'Roberto Fontana', stylistId: 'stylist-004', stylistName: 'Giulia B.', date: '2026-01-19', time: '09:00', status: 'Programmato', notes: 'VIP', services: ['Taglio Capelli', 'Regolazione Barba', 'Trattamento Viso'] },
        { id: 'apt-004', clientId: 'client-003', clientName: 'Francesca Marino', stylistId: 'stylist-003', stylistName: 'Andrea M.', date: '2026-01-26', time: '11:30', status: 'Programmato', notes: '', services: ['Manicure', 'Pedicure'] },
        { id: 'apt-005', clientId: 'client-008', clientName: 'Giuseppe Greco', stylistId: 'stylist-001', stylistName: 'Marco V.', date: '2026-01-26', time: '10:00', status: 'Programmato', notes: '', services: ['Taglio Capelli'] }
    ];

    for (const apt of appointments) {
        db.run('INSERT INTO appointments (id, client_id, client_name, stylist_id, stylist_name, date, time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [apt.id, apt.clientId, apt.clientName, apt.stylistId, apt.stylistName, apt.date, apt.time, apt.status, apt.notes]);
        for (const s of apt.services) {
            db.run('INSERT INTO appointment_services (appointment_id, service_name) VALUES (?, ?)', [apt.id, s]);
        }
    }

    // Email templates
    db.run(`INSERT INTO email_templates (name, type, subject_template, body_template, active) VALUES
        ('Win-back', 'win_back', 'Ci manchi, {{client_name}}!', 'Ciao {{client_name}}, ci manchi! Torna a trovarci.', 1)`);

    // Outreach settings
    db.run('INSERT INTO outreach_settings (id, win_back_threshold_days, reminder_days_before) VALUES (1, 30, 2)');
}

async function getDb() {
    if (db) return db;

    SQL = await initSqlJs();
    db = new SQL.Database();
    db.run(SCHEMA);
    seedData(db);

    return db;
}

// Helper per query
function query(db, sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

function run(db, sql, params = []) {
    db.run(sql, params);
    return db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0;
}

module.exports = { getDb, query, run };
