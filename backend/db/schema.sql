-- =====================================================
-- SALON CROSS-SELLING ASSISTANT - DATABASE SCHEMA
-- =====================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS outreach_settings;
DROP TABLE IF EXISTS email_templates;
DROP TABLE IF EXISTS email_suggestions;
DROP TABLE IF EXISTS client_history_products;
DROP TABLE IF EXISTS client_history_services;
DROP TABLE IF EXISTS client_history;
DROP TABLE IF EXISTS recommendation_tracking;
DROP TABLE IF EXISTS dismissed_recommendations;
DROP TABLE IF EXISTS product_rule_suggestions;
DROP TABLE IF EXISTS product_rules;
DROP TABLE IF EXISTS service_rule_suggestions;
DROP TABLE IF EXISTS service_rules;
DROP TABLE IF EXISTS appointment_products;
DROP TABLE IF EXISTS appointment_services;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS stylist_specialties;
DROP TABLE IF EXISTS stylists;
DROP TABLE IF EXISTS client_tags;
DROP TABLE IF EXISTS clients;

-- =====================================================
-- CLIENTS
-- =====================================================

CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    primary_interest TEXT,
    preferences TEXT,
    issues TEXT,
    last_visit TEXT,
    total_visits INTEGER DEFAULT 0
);

CREATE TABLE client_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_client_tags_client_id ON client_tags(client_id);

-- =====================================================
-- STYLISTS
-- =====================================================

CREATE TABLE stylists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1
);

CREATE TABLE stylist_specialties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stylist_id TEXT NOT NULL,
    specialty TEXT NOT NULL,
    FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE
);

CREATE INDEX idx_stylist_specialties_stylist_id ON stylist_specialties(stylist_id);

-- =====================================================
-- SERVICES
-- =====================================================

CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    duration INTEGER,
    price REAL NOT NULL,
    active INTEGER DEFAULT 1
);

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    price REAL NOT NULL,
    use_case TEXT,
    active INTEGER DEFAULT 1
);

-- =====================================================
-- APPOINTMENTS
-- =====================================================

CREATE TABLE appointments (
    id TEXT PRIMARY KEY,
    client_id TEXT,
    client_name TEXT NOT NULL,
    stylist_id TEXT,
    stylist_name TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (stylist_id) REFERENCES stylists(id)
);

CREATE TABLE appointment_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE INDEX idx_appointment_services_appointment_id ON appointment_services(appointment_id);

CREATE TABLE appointment_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE INDEX idx_appointment_products_appointment_id ON appointment_products(appointment_id);

-- =====================================================
-- RECOMMENDATION RULES
-- =====================================================

CREATE TABLE service_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger_service TEXT NOT NULL,
    reason TEXT,
    active INTEGER DEFAULT 1
);

CREATE TABLE service_rule_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    suggested_service TEXT NOT NULL,
    FOREIGN KEY (rule_id) REFERENCES service_rules(id) ON DELETE CASCADE
);

CREATE INDEX idx_service_rule_suggestions_rule_id ON service_rule_suggestions(rule_id);

CREATE TABLE product_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger_service TEXT NOT NULL,
    reason TEXT,
    active INTEGER DEFAULT 1
);

CREATE TABLE product_rule_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id INTEGER NOT NULL,
    suggested_product TEXT NOT NULL,
    FOREIGN KEY (rule_id) REFERENCES product_rules(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_rule_suggestions_rule_id ON product_rule_suggestions(rule_id);

-- =====================================================
-- TRACKING
-- =====================================================

CREATE TABLE dismissed_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product')),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    UNIQUE(appointment_id, item_name, item_type)
);

CREATE INDEX idx_dismissed_recommendations_appointment_id ON dismissed_recommendations(appointment_id);

CREATE TABLE recommendation_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL UNIQUE,
    item_type TEXT NOT NULL CHECK (item_type IN ('service', 'product')),
    shown INTEGER DEFAULT 0,
    accepted INTEGER DEFAULT 0,
    dismissed INTEGER DEFAULT 0
);

-- =====================================================
-- CLIENT HISTORY (for demo data)
-- =====================================================

CREATE TABLE client_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'Completed',
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_client_history_client_id ON client_history(client_id);

CREATE TABLE client_history_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    history_id INTEGER NOT NULL,
    service_name TEXT NOT NULL,
    FOREIGN KEY (history_id) REFERENCES client_history(id) ON DELETE CASCADE
);

CREATE INDEX idx_client_history_services_history_id ON client_history_services(history_id);

CREATE TABLE client_history_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    history_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    FOREIGN KEY (history_id) REFERENCES client_history(id) ON DELETE CASCADE
);

CREATE INDEX idx_client_history_products_history_id ON client_history_products(history_id);

-- =====================================================
-- EMAIL OUTREACH
-- =====================================================

-- Email Suggestions
CREATE TABLE email_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    suggestion_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    email_subject TEXT NOT NULL,
    personalized_content TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    sent_at TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE INDEX idx_email_suggestions_client_id ON email_suggestions(client_id);
CREATE INDEX idx_email_suggestions_status ON email_suggestions(status);
CREATE INDEX idx_email_suggestions_type ON email_suggestions(suggestion_type);

-- Email Templates
CREATE TABLE email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    active INTEGER DEFAULT 1
);

-- Outreach Settings
CREATE TABLE outreach_settings (
    id INTEGER PRIMARY KEY,
    win_back_threshold_days INTEGER DEFAULT 30,
    reminder_days_before INTEGER DEFAULT 2
);
