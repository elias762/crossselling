// =====================================================
// DATABASE SEEDER - Popola i dati demo
// =====================================================

const { initDb, initializeSchema, closeDb, prepare, saveDb } = require('./database');

async function seed() {
    console.log('Avvio seed database...');

    // Inizializza schema (elimina e ricrea le tabelle)
    await initializeSchema();

    // =====================================================
    // STILISTI
    // =====================================================

    const stylists = [
        { id: 'stylist-001', name: 'Marco V.', specialties: ['Capelli', 'Barba'], active: 1 },
        { id: 'stylist-002', name: 'Lucia R.', specialties: ['Capelli', 'Colore'], active: 1 },
        { id: 'stylist-003', name: 'Andrea M.', specialties: ['Unghie', 'Viso'], active: 1 },
        { id: 'stylist-004', name: 'Giulia B.', specialties: ['Capelli', 'Viso'], active: 1 }
    ];

    for (const stylist of stylists) {
        prepare('INSERT INTO stylists (id, name, active) VALUES (?, ?, ?)').run(stylist.id, stylist.name, stylist.active);
        for (const specialty of stylist.specialties) {
            prepare('INSERT INTO stylist_specialties (stylist_id, specialty) VALUES (?, ?)').run(stylist.id, specialty);
        }
    }
    console.log('Stilisti inseriti');

    // =====================================================
    // CLIENTI
    // =====================================================

    const clients = [
        {
            id: 'client-001', name: 'Marco Rossi', tags: ['Styling Capelli', 'Cura Barba'],
            primaryInterest: 'Capelli e Barba', preferences: 'Preferisce prodotti opachi. Appuntamenti rapidi.',
            issues: 'Cuoio capelluto secco in inverno', lastVisit: '2026-01-10', totalVisits: 12
        },
        {
            id: 'client-002', name: 'Giulia Bianchi', tags: ['Skincare', 'Styling Capelli'],
            primaryInterest: 'Skincare', preferences: 'Pelle sensibile. Preferisce prodotti senza profumo.',
            issues: 'Pelle soggetta a rossori', lastVisit: '2026-01-15', totalVisits: 8
        },
        {
            id: 'client-003', name: 'Francesca Marino', tags: ['Unghie', 'Skincare'],
            primaryInterest: 'Unghie', preferences: 'Solo smalto gel. Preferisce colori neutri.',
            issues: 'Unghie fragili', lastVisit: '2026-01-12', totalVisits: 15
        },
        {
            id: 'client-004', name: 'Sofia Conti', tags: ['Styling Capelli', 'Colore Capelli'],
            primaryInterest: 'Colore Capelli', preferences: 'Specialista balayage. Prenota appuntamenti lunghi.',
            issues: 'Colore che sbiadisce rapidamente', lastVisit: '2026-01-08', totalVisits: 6
        },
        {
            id: 'client-005', name: 'Alessandro Ferrari', tags: ['Cura Barba'],
            primaryInterest: 'Barba', preferences: 'Manutenzione barba completa. Preferisce oli naturali.',
            issues: 'Crescita irregolare sul lato sinistro', lastVisit: '2026-01-14', totalVisits: 20
        },
        {
            id: 'client-006', name: 'Luca Romano', tags: ['Styling Capelli', 'Cura Cuoio Capelluto'],
            primaryInterest: 'Capelli', preferences: 'Appuntamenti brevi. Styling minimale.',
            issues: 'Forfora, cuoio capelluto grasso', lastVisit: '2026-01-05', totalVisits: 9
        },
        {
            id: 'client-007', name: 'Isabella Ricci', tags: ['Skincare', 'Unghie'],
            primaryInterest: 'Grooming Completo', preferences: 'Pacchetto spa mensile. Solo prodotti premium.',
            issues: 'Nessuna nota', lastVisit: '2026-01-11', totalVisits: 24
        },
        {
            id: 'client-008', name: 'Giuseppe Greco', tags: ['Styling Capelli'],
            primaryInterest: 'Capelli', preferences: 'Solo tagli classici. Nessun prodotto.',
            issues: 'Capelli diradati', lastVisit: '2025-12-28', totalVisits: 4
        },
        {
            id: 'client-009', name: 'Antonio Colombo', tags: ['Cura Barba', 'Skincare'],
            primaryInterest: 'Barba e Viso', preferences: 'Appassionato di rasatura con asciugamano caldo. Ama i rituali di grooming.',
            issues: 'Peli incarniti', lastVisit: '2026-01-13', totalVisits: 11
        },
        {
            id: 'client-010', name: 'Valentina Esposito', tags: ['Colore Capelli', 'Styling Capelli'],
            primaryInterest: 'Colore Capelli', preferences: 'Colori audaci. Stili pronti per Instagram.',
            issues: 'Punte danneggiate dalla decolorazione', lastVisit: '2026-01-09', totalVisits: 7
        },
        {
            id: 'client-011', name: 'Chiara Moretti', tags: ['Unghie'],
            primaryInterest: 'Unghie', preferences: 'Manicure bisettimanale. Adora la nail art.',
            issues: 'Cuticole secche', lastVisit: '2026-01-16', totalVisits: 18
        },
        {
            id: 'client-012', name: 'Roberto Fontana', tags: ['Styling Capelli', 'Cura Barba', 'Skincare'],
            primaryInterest: 'Grooming Completo', preferences: 'Cliente VIP. Preferisce stanza privata. Mance generose.',
            issues: 'Pelle sensibile, cuoio capelluto secco', lastVisit: '2026-01-07', totalVisits: 32
        }
    ];

    for (const client of clients) {
        prepare(`
            INSERT INTO clients (id, name, primary_interest, preferences, issues, last_visit, total_visits)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(client.id, client.name, client.primaryInterest, client.preferences, client.issues, client.lastVisit, client.totalVisits);
        for (const tag of client.tags) {
            prepare('INSERT INTO client_tags (client_id, tag) VALUES (?, ?)').run(client.id, tag);
        }
    }
    console.log('Clienti inseriti');

    // =====================================================
    // SERVIZI
    // =====================================================

    const services = [
        { name: 'Taglio Capelli', category: 'Capelli', duration: 30, price: 35, active: 1 },
        { name: 'Colore Capelli', category: 'Capelli', duration: 90, price: 85, active: 1 },
        { name: 'Balayage', category: 'Capelli', duration: 120, price: 150, active: 1 },
        { name: 'Trattamento Profondo', category: 'Capelli', duration: 30, price: 40, active: 1 },
        { name: 'Trattamento Cuoio Capelluto', category: 'Capelli', duration: 45, price: 55, active: 1 },
        { name: 'Regolazione Barba', category: 'Barba', duration: 20, price: 20, active: 1 },
        { name: 'Rasatura Asciugamano Caldo', category: 'Barba', duration: 30, price: 35, active: 1 },
        { name: 'Trattamento Viso', category: 'Viso', duration: 60, price: 75, active: 1 },
        { name: 'Manicure', category: 'Unghie', duration: 45, price: 30, active: 1 },
        { name: 'Pedicure', category: 'Unghie', duration: 60, price: 45, active: 1 },
        { name: 'Trattamento Olaplex', category: 'Capelli', duration: 45, price: 65, active: 1 },
        { name: 'Trattamento Cheratina', category: 'Capelli', duration: 150, price: 200, active: 0 }
    ];

    for (const service of services) {
        prepare(`
            INSERT INTO services (name, category, duration, price, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(service.name, service.category, service.duration, service.price, service.active);
    }
    console.log('Servizi inseriti');

    // =====================================================
    // PRODOTTI
    // =====================================================

    const products = [
        { name: 'Argilla Opaca Styling', category: 'Capelli', price: 24, useCase: 'Tenuta', active: 1 },
        { name: 'Spray Sale Marino', category: 'Capelli', price: 18, useCase: 'Tenuta', active: 1 },
        { name: 'Siero Capelli', category: 'Capelli', price: 28, useCase: 'Riparazione', active: 1 },
        { name: 'Shampoo Protezione Colore', category: 'Capelli', price: 22, useCase: 'Riparazione', active: 1 },
        { name: 'Balsamo Protezione Colore', category: 'Capelli', price: 22, useCase: 'Riparazione', active: 1 },
        { name: 'Shampoo Antiforfora', category: 'Capelli', price: 19, useCase: 'Antiforfora', active: 1 },
        { name: 'Siero Cuoio Capelluto', category: 'Capelli', price: 32, useCase: 'Antiforfora', active: 1 },
        { name: 'Mousse Volumizzante', category: 'Capelli', price: 20, useCase: 'Tenuta', active: 1 },
        { name: 'Olio da Barba', category: 'Barba', price: 18, useCase: 'Idratazione', active: 1 },
        { name: 'Balsamo da Barba', category: 'Barba', price: 20, useCase: 'Tenuta', active: 1 },
        { name: 'Balsamo Dopobarba', category: 'Barba', price: 15, useCase: 'Idratazione', active: 1 },
        { name: 'Crema Idratante Viso', category: 'Viso', price: 35, useCase: 'Idratazione', active: 1 },
        { name: 'Crema SPF', category: 'Viso', price: 38, useCase: 'Protezione', active: 1 },
        { name: 'Olio Cuticole', category: 'Unghie', price: 12, useCase: 'Idratazione', active: 1 },
        { name: 'Rinforzante Unghie', category: 'Unghie', price: 16, useCase: 'Riparazione', active: 1 }
    ];

    for (const product of products) {
        prepare(`
            INSERT INTO products (name, category, price, use_case, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(product.name, product.category, product.price, product.useCase, product.active);
    }
    console.log('Prodotti inseriti');

    // =====================================================
    // REGOLE SERVIZI
    // =====================================================

    const serviceRules = [
        { trigger: 'Taglio Capelli', suggestions: ['Trattamento Profondo', 'Trattamento Cuoio Capelluto'], reason: 'Ripristina idratazione e favorisce la crescita sana', active: 1 },
        { trigger: 'Regolazione Barba', suggestions: ['Rasatura Asciugamano Caldo'], reason: 'Esperienza grooming completa', active: 1 },
        { trigger: 'Colore Capelli', suggestions: ['Trattamento Profondo', 'Trattamento Olaplex'], reason: 'Protegge e ripara i capelli colorati', active: 1 },
        { trigger: 'Balayage', suggestions: ['Trattamento Olaplex'], reason: 'Essenziale per la cura del balayage', active: 1 },
        { trigger: 'Manicure', suggestions: ['Pedicure'], reason: 'Pacchetto cura unghie completo', active: 1 },
        { trigger: 'Trattamento Viso', suggestions: ['Trattamento Cuoio Capelluto'], reason: 'Grooming completo testa-viso', active: 1 }
    ];

    for (const rule of serviceRules) {
        const result = prepare('INSERT INTO service_rules (trigger_service, reason, active) VALUES (?, ?, ?)').run(rule.trigger, rule.reason, rule.active);
        const ruleId = result.lastInsertRowid;
        for (const suggestion of rule.suggestions) {
            prepare('INSERT INTO service_rule_suggestions (rule_id, suggested_service) VALUES (?, ?)').run(ruleId, suggestion);
        }
    }
    console.log('Regole servizi inserite');

    // =====================================================
    // REGOLE PRODOTTI
    // =====================================================

    const productRules = [
        { trigger: 'Regolazione Barba', suggestions: ['Olio da Barba', 'Balsamo da Barba'], reason: 'Mantiene la barba morbida e in forma dopo la regolazione', active: 1 },
        { trigger: 'Taglio Capelli', suggestions: ['Argilla Opaca Styling', 'Spray Sale Marino'], reason: 'Perfetti per lo styling del taglio fresco', active: 1 },
        { trigger: 'Trattamento Cuoio Capelluto', suggestions: ['Shampoo Antiforfora', 'Siero Cuoio Capelluto'], reason: 'Prolunga i benefici del trattamento a casa', active: 1 },
        { trigger: 'Colore Capelli', suggestions: ['Shampoo Protezione Colore', 'Balsamo Protezione Colore'], reason: 'Preserva la vivacità del colore', active: 1 },
        { trigger: 'Balayage', suggestions: ['Shampoo Protezione Colore', 'Siero Capelli'], reason: 'Protegge le schiariture e aggiunge lucentezza', active: 1 },
        { trigger: 'Trattamento Viso', suggestions: ['Crema Idratante Viso', 'Crema SPF'], reason: 'Mantiene i risultati del trattamento', active: 1 },
        { trigger: 'Trattamento Profondo', suggestions: ['Siero Capelli'], reason: 'Aggiunge nutrimento extra a casa', active: 1 },
        { trigger: 'Rasatura Asciugamano Caldo', suggestions: ['Balsamo Dopobarba', 'Crema Idratante Viso'], reason: 'Lenisce e idrata dopo la rasatura', active: 1 },
        { trigger: 'Manicure', suggestions: ['Olio Cuticole', 'Rinforzante Unghie'], reason: 'Mantiene la salute delle unghie tra le visite', active: 1 },
        { trigger: 'Pedicure', suggestions: ['Olio Cuticole'], reason: 'Mantiene le unghie dei piedi sane', active: 1 }
    ];

    for (const rule of productRules) {
        const result = prepare('INSERT INTO product_rules (trigger_service, reason, active) VALUES (?, ?, ?)').run(rule.trigger, rule.reason, rule.active);
        const ruleId = result.lastInsertRowid;
        for (const suggestion of rule.suggestions) {
            prepare('INSERT INTO product_rule_suggestions (rule_id, suggested_product) VALUES (?, ?)').run(ruleId, suggestion);
        }
    }
    console.log('Regole prodotti inserite');

    // =====================================================
    // TRACCIAMENTO RACCOMANDAZIONI
    // =====================================================

    const tracking = [
        { itemName: 'Olio da Barba', type: 'product', shown: 45, accepted: 28, dismissed: 8 },
        { itemName: 'Balsamo da Barba', type: 'product', shown: 38, accepted: 15, dismissed: 12 },
        { itemName: 'Argilla Opaca Styling', type: 'product', shown: 52, accepted: 31, dismissed: 10 },
        { itemName: 'Spray Sale Marino', type: 'product', shown: 35, accepted: 12, dismissed: 15 },
        { itemName: 'Shampoo Protezione Colore', type: 'product', shown: 28, accepted: 18, dismissed: 5 },
        { itemName: 'Crema Idratante Viso', type: 'product', shown: 22, accepted: 14, dismissed: 4 },
        { itemName: 'Balsamo Dopobarba', type: 'product', shown: 30, accepted: 22, dismissed: 3 },
        { itemName: 'Olio Cuticole', type: 'product', shown: 25, accepted: 16, dismissed: 6 },
        { itemName: 'Trattamento Profondo', type: 'service', shown: 40, accepted: 18, dismissed: 12 },
        { itemName: 'Rasatura Asciugamano Caldo', type: 'service', shown: 32, accepted: 20, dismissed: 7 },
        { itemName: 'Trattamento Cuoio Capelluto', type: 'service', shown: 28, accepted: 10, dismissed: 10 },
        { itemName: 'Trattamento Olaplex', type: 'service', shown: 18, accepted: 8, dismissed: 5 },
        { itemName: 'Pedicure', type: 'service', shown: 20, accepted: 12, dismissed: 4 }
    ];

    for (const item of tracking) {
        prepare(`
            INSERT INTO recommendation_tracking (item_name, item_type, shown, accepted, dismissed)
            VALUES (?, ?, ?, ?, ?)
        `).run(item.itemName, item.type, item.shown, item.accepted, item.dismissed);
    }
    console.log('Tracciamento raccomandazioni inserito');

    // =====================================================
    // STORICO CLIENTI
    // =====================================================

    const clientHistory = {
        'client-001': [
            { date: '2026-01-10', time: '10:00', services: ['Taglio Capelli', 'Regolazione Barba'], products: ['Argilla Opaca Styling'], status: 'Completato' },
            { date: '2025-12-27', time: '11:30', services: ['Taglio Capelli'], products: ['Olio da Barba'], status: 'Completato' },
            { date: '2025-12-13', time: '09:00', services: ['Regolazione Barba', 'Rasatura Asciugamano Caldo'], products: ['Balsamo Dopobarba'], status: 'Completato' },
            { date: '2025-11-29', time: '14:00', services: ['Taglio Capelli', 'Trattamento Cuoio Capelluto'], products: [], status: 'Completato' },
            { date: '2025-11-15', time: '10:30', services: ['Taglio Capelli', 'Regolazione Barba'], products: ['Balsamo da Barba', 'Argilla Opaca Styling'], status: 'Completato' },
            { date: '2025-11-01', time: '15:00', services: ['Regolazione Barba'], products: ['Olio da Barba'], status: 'Completato' }
        ],
        'client-002': [
            { date: '2026-01-15', time: '13:00', services: ['Trattamento Viso'], products: ['Crema Idratante Viso'], status: 'Completato' },
            { date: '2025-12-30', time: '11:00', services: ['Taglio Capelli', 'Trattamento Viso'], products: ['Crema SPF'], status: 'Completato' },
            { date: '2025-12-15', time: '14:30', services: ['Trattamento Viso'], products: [], status: 'Completato' },
            { date: '2025-12-01', time: '10:00', services: ['Taglio Capelli'], products: [], status: 'Completato' },
            { date: '2025-11-17', time: '15:00', services: ['Trattamento Viso', 'Trattamento Cuoio Capelluto'], products: ['Siero Cuoio Capelluto'], status: 'Completato' },
            { date: '2025-11-03', time: '09:30', services: ['Taglio Capelli', 'Trattamento Viso'], products: [], status: 'Completato' }
        ],
        'client-003': [
            { date: '2026-01-12', time: '11:00', services: ['Manicure', 'Pedicure'], products: ['Olio Cuticole'], status: 'Completato' },
            { date: '2025-12-29', time: '14:00', services: ['Manicure'], products: ['Rinforzante Unghie'], status: 'Completato' },
            { date: '2025-12-15', time: '10:30', services: ['Manicure', 'Pedicure'], products: ['Olio Cuticole'], status: 'Completato' },
            { date: '2025-12-01', time: '13:00', services: ['Manicure'], products: [], status: 'Completato' },
            { date: '2025-11-17', time: '11:00', services: ['Manicure', 'Trattamento Viso'], products: ['Crema Idratante Viso'], status: 'Completato' },
            { date: '2025-11-03', time: '15:30', services: ['Pedicure'], products: ['Olio Cuticole'], status: 'Completato' }
        ],
        'client-004': [
            { date: '2026-01-08', time: '09:00', services: ['Balayage', 'Trattamento Profondo'], products: ['Shampoo Protezione Colore'], status: 'Completato' },
            { date: '2025-12-11', time: '10:00', services: ['Colore Capelli', 'Taglio Capelli'], products: ['Balsamo Protezione Colore'], status: 'Completato' },
            { date: '2025-11-13', time: '09:30', services: ['Balayage'], products: ['Siero Capelli', 'Shampoo Protezione Colore'], status: 'Completato' },
            { date: '2025-10-16', time: '11:00', services: ['Colore Capelli', 'Trattamento Profondo'], products: [], status: 'Completato' },
            { date: '2025-09-18', time: '10:00', services: ['Balayage', 'Taglio Capelli'], products: ['Shampoo Protezione Colore'], status: 'Completato' },
            { date: '2025-08-21', time: '09:00', services: ['Colore Capelli'], products: ['Siero Capelli'], status: 'Completato' }
        ],
        'client-005': [
            { date: '2026-01-14', time: '12:00', services: ['Regolazione Barba'], products: ['Olio da Barba'], status: 'Completato' },
            { date: '2026-01-07', time: '12:00', services: ['Regolazione Barba', 'Rasatura Asciugamano Caldo'], products: ['Balsamo da Barba', 'Balsamo Dopobarba'], status: 'Completato' },
            { date: '2025-12-31', time: '11:30', services: ['Regolazione Barba'], products: [], status: 'Completato' },
            { date: '2025-12-24', time: '10:00', services: ['Regolazione Barba', 'Taglio Capelli'], products: ['Olio da Barba', 'Argilla Opaca Styling'], status: 'Completato' },
            { date: '2025-12-17', time: '12:30', services: ['Regolazione Barba'], products: ['Olio da Barba'], status: 'Completato' },
            { date: '2025-12-10', time: '11:00', services: ['Regolazione Barba', 'Rasatura Asciugamano Caldo'], products: ['Balsamo Dopobarba'], status: 'Completato' }
        ],
        'client-006': [
            { date: '2026-01-05', time: '16:00', services: ['Taglio Capelli', 'Trattamento Cuoio Capelluto'], products: ['Shampoo Antiforfora'], status: 'Completato' },
            { date: '2025-12-22', time: '15:30', services: ['Taglio Capelli'], products: [], status: 'Completato' },
            { date: '2025-12-08', time: '14:00', services: ['Trattamento Cuoio Capelluto'], products: ['Siero Cuoio Capelluto'], status: 'Completato' },
            { date: '2025-11-24', time: '16:30', services: ['Taglio Capelli', 'Trattamento Cuoio Capelluto'], products: ['Shampoo Antiforfora'], status: 'Completato' },
            { date: '2025-11-10', time: '15:00', services: ['Taglio Capelli'], products: [], status: 'Completato' },
            { date: '2025-10-27', time: '14:30', services: ['Trattamento Cuoio Capelluto'], products: ['Siero Cuoio Capelluto'], status: 'Completato' }
        ],
        'client-007': [
            { date: '2026-01-11', time: '10:00', services: ['Trattamento Viso', 'Manicure', 'Pedicure'], products: ['Crema Idratante Viso', 'Olio Cuticole'], status: 'Completato' },
            { date: '2025-12-14', time: '10:00', services: ['Trattamento Viso', 'Manicure'], products: ['Rinforzante Unghie'], status: 'Completato' },
            { date: '2025-11-16', time: '10:00', services: ['Trattamento Viso', 'Manicure', 'Pedicure'], products: ['Crema SPF', 'Olio Cuticole'], status: 'Completato' },
            { date: '2025-10-19', time: '10:00', services: ['Trattamento Viso', 'Pedicure'], products: ['Crema Idratante Viso'], status: 'Completato' },
            { date: '2025-09-21', time: '10:00', services: ['Trattamento Viso', 'Manicure'], products: [], status: 'Completato' },
            { date: '2025-08-24', time: '10:00', services: ['Trattamento Viso', 'Manicure', 'Pedicure'], products: ['Crema Idratante Viso', 'Olio Cuticole'], status: 'Completato' }
        ],
        'client-008': [
            { date: '2025-12-28', time: '09:30', services: ['Taglio Capelli'], products: [], status: 'Completato' },
            { date: '2025-11-30', time: '10:00', services: ['Taglio Capelli'], products: [], status: 'Completato' },
            { date: '2025-11-02', time: '09:00', services: ['Taglio Capelli', 'Trattamento Cuoio Capelluto'], products: ['Mousse Volumizzante'], status: 'Completato' },
            { date: '2025-10-05', time: '10:30', services: ['Taglio Capelli'], products: [], status: 'Completato' }
        ],
        'client-009': [
            { date: '2026-01-13', time: '11:00', services: ['Rasatura Asciugamano Caldo', 'Trattamento Viso'], products: ['Balsamo Dopobarba', 'Crema Idratante Viso'], status: 'Completato' },
            { date: '2025-12-30', time: '10:30', services: ['Regolazione Barba', 'Rasatura Asciugamano Caldo'], products: ['Olio da Barba'], status: 'Completato' },
            { date: '2025-12-16', time: '11:30', services: ['Rasatura Asciugamano Caldo', 'Trattamento Viso'], products: ['Balsamo Dopobarba'], status: 'Completato' },
            { date: '2025-12-02', time: '10:00', services: ['Regolazione Barba'], products: ['Balsamo da Barba'], status: 'Completato' },
            { date: '2025-11-18', time: '11:00', services: ['Rasatura Asciugamano Caldo'], products: ['Balsamo Dopobarba'], status: 'Completato' },
            { date: '2025-11-04', time: '10:30', services: ['Regolazione Barba', 'Trattamento Viso'], products: ['Crema Idratante Viso'], status: 'Completato' }
        ],
        'client-010': [
            { date: '2026-01-09', time: '13:00', services: ['Colore Capelli', 'Trattamento Profondo'], products: ['Shampoo Protezione Colore', 'Siero Capelli'], status: 'Completato' },
            { date: '2025-12-19', time: '12:00', services: ['Balayage', 'Taglio Capelli'], products: ['Balsamo Protezione Colore'], status: 'Completato' },
            { date: '2025-11-28', time: '14:00', services: ['Colore Capelli'], products: ['Shampoo Protezione Colore'], status: 'Completato' },
            { date: '2025-11-07', time: '13:30', services: ['Trattamento Profondo', 'Taglio Capelli'], products: ['Siero Capelli'], status: 'Completato' },
            { date: '2025-10-17', time: '12:00', services: ['Balayage'], products: ['Shampoo Protezione Colore', 'Balsamo Protezione Colore'], status: 'Completato' },
            { date: '2025-09-26', time: '14:00', services: ['Colore Capelli', 'Trattamento Profondo'], products: [], status: 'Completato' }
        ],
        'client-011': [
            { date: '2026-01-16', time: '14:00', services: ['Manicure'], products: ['Olio Cuticole'], status: 'Completato' },
            { date: '2026-01-02', time: '14:30', services: ['Manicure'], products: [], status: 'Completato' },
            { date: '2025-12-19', time: '15:00', services: ['Manicure', 'Pedicure'], products: ['Olio Cuticole', 'Rinforzante Unghie'], status: 'Completato' },
            { date: '2025-12-05', time: '14:00', services: ['Manicure'], products: [], status: 'Completato' },
            { date: '2025-11-21', time: '14:30', services: ['Manicure'], products: ['Olio Cuticole'], status: 'Completato' },
            { date: '2025-11-07', time: '15:00', services: ['Manicure', 'Pedicure'], products: [], status: 'Completato' }
        ],
        'client-012': [
            { date: '2026-01-07', time: '09:00', services: ['Taglio Capelli', 'Regolazione Barba', 'Trattamento Viso'], products: ['Argilla Opaca Styling', 'Olio da Barba', 'Crema Idratante Viso'], status: 'Completato' },
            { date: '2025-12-24', time: '09:00', services: ['Taglio Capelli', 'Rasatura Asciugamano Caldo', 'Trattamento Cuoio Capelluto'], products: ['Balsamo Dopobarba', 'Siero Cuoio Capelluto'], status: 'Completato' },
            { date: '2025-12-10', time: '09:00', services: ['Regolazione Barba', 'Trattamento Viso'], products: ['Balsamo da Barba'], status: 'Completato' },
            { date: '2025-11-26', time: '09:00', services: ['Taglio Capelli', 'Regolazione Barba', 'Trattamento Viso'], products: ['Argilla Opaca Styling', 'Crema Idratante Viso'], status: 'Completato' },
            { date: '2025-11-12', time: '09:00', services: ['Rasatura Asciugamano Caldo', 'Trattamento Cuoio Capelluto'], products: ['Balsamo Dopobarba', 'Shampoo Antiforfora'], status: 'Completato' },
            { date: '2025-10-29', time: '09:00', services: ['Taglio Capelli', 'Regolazione Barba', 'Trattamento Viso'], products: ['Olio da Barba', 'Crema SPF'], status: 'Completato' }
        ]
    };

    for (const [clientId, history] of Object.entries(clientHistory)) {
        for (const visit of history) {
            const result = prepare('INSERT INTO client_history (client_id, date, time, status) VALUES (?, ?, ?, ?)').run(clientId, visit.date, visit.time, visit.status);
            const historyId = result.lastInsertRowid;
            for (const service of visit.services) {
                prepare('INSERT INTO client_history_services (history_id, service_name) VALUES (?, ?)').run(historyId, service);
            }
            for (const product of visit.products) {
                prepare('INSERT INTO client_history_products (history_id, product_name) VALUES (?, ?)').run(historyId, product);
            }
        }
    }
    console.log('Storico clienti inserito');

    // =====================================================
    // APPUNTAMENTI
    // =====================================================

    const appointments = [
        // ===== APPUNTAMENTI PASSATI (Completati) per Analytics =====
        {
            id: 'apt-c01',
            clientId: 'client-001',
            clientName: 'Marco Rossi',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-10',
            time: '09:00',
            status: 'Completato',
            notes: '',
            services: ['Taglio Capelli', 'Regolazione Barba'],
            products: ['Argilla Opaca Styling', 'Olio da Barba']
        },
        {
            id: 'apt-c02',
            clientId: 'client-002',
            clientName: 'Giulia Bianchi',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-10',
            time: '10:30',
            status: 'Completato',
            notes: '',
            services: ['Trattamento Viso', 'Taglio Capelli'],
            products: ['Crema Idratante Viso']
        },
        {
            id: 'apt-c03',
            clientId: 'client-005',
            clientName: 'Alessandro Ferrari',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-10',
            time: '14:00',
            status: 'Completato',
            notes: '',
            services: ['Regolazione Barba', 'Rasatura Asciugamano Caldo'],
            products: ['Olio da Barba', 'Balsamo Dopobarba']
        },
        {
            id: 'apt-c04',
            clientId: 'client-004',
            clientName: 'Sofia Conti',
            stylistId: 'stylist-002',
            stylistName: 'Lucia R.',
            date: '2026-01-11',
            time: '09:00',
            status: 'Completato',
            notes: '',
            services: ['Balayage', 'Trattamento Profondo', 'Trattamento Olaplex'],
            products: ['Shampoo Protezione Colore', 'Balsamo Protezione Colore', 'Siero Capelli']
        },
        {
            id: 'apt-c05',
            clientId: 'client-003',
            clientName: 'Francesca Marino',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-11',
            time: '11:00',
            status: 'Completato',
            notes: '',
            services: ['Manicure', 'Pedicure'],
            products: ['Olio Cuticole', 'Rinforzante Unghie']
        },
        {
            id: 'apt-c06',
            clientId: 'client-012',
            clientName: 'Roberto Fontana',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-11',
            time: '14:00',
            status: 'Completato',
            notes: 'VIP',
            services: ['Taglio Capelli', 'Regolazione Barba', 'Trattamento Viso', 'Trattamento Cuoio Capelluto'],
            products: ['Argilla Opaca Styling', 'Balsamo da Barba', 'Crema Idratante Viso', 'Siero Cuoio Capelluto']
        },
        // ===== APPUNTAMENTI OGGI E FUTURI =====
        {
            id: 'apt-001',
            clientId: 'client-009',
            clientName: 'Antonio Colombo',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-19',
            time: '09:00',
            status: 'Programmato',
            notes: '',
            services: ['Regolazione Barba', 'Rasatura Asciugamano Caldo'],
            products: []
        },
        {
            id: 'apt-002',
            clientId: 'client-007',
            clientName: 'Isabella Ricci',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-19',
            time: '10:00',
            status: 'Programmato',
            notes: 'Pacchetto spa mensile',
            services: ['Trattamento Viso', 'Manicure', 'Pedicure'],
            products: []
        },
        {
            id: 'apt-003',
            clientId: 'client-001',
            clientName: 'Roberto Fontana',
            stylistId: 'stylist-004',
            stylistName: 'Giulia B.',
            date: '2026-01-19',
            time: '09:00',
            status: 'Programmato',
            notes: 'VIP - Stanza privata',
            services: ['Taglio Capelli', 'Regolazione Barba', 'Trattamento Viso'],
            products: []
        },
        {
            id: 'apt-004',
            clientId: 'client-003',
            clientName: 'Francesca Marino',
            stylistId: 'stylist-003',
            stylistName: 'Andrea M.',
            date: '2026-01-26',
            time: '11:30',
            status: 'Programmato',
            notes: 'Smalto gel - colori neutri',
            services: ['Manicure', 'Pedicure'],
            products: []
        },
        {
            id: 'apt-005',
            clientId: 'client-008',
            clientName: 'Giuseppe Greco',
            stylistId: 'stylist-001',
            stylistName: 'Marco V.',
            date: '2026-01-26',
            time: '10:00',
            status: 'Programmato',
            notes: 'Taglio classico',
            services: ['Taglio Capelli'],
            products: []
        },
        {
            id: 'apt-006',
            clientId: 'client-002',
            clientName: 'Giulia Bianchi',
            stylistId: 'stylist-004',
            stylistName: 'Giulia B.',
            date: '2026-01-25',
            time: '15:00',
            status: 'Programmato',
            notes: 'Pelle sensibile',
            services: ['Taglio Capelli', 'Trattamento Viso'],
            products: []
        }
    ];

    for (const apt of appointments) {
        prepare(`
            INSERT INTO appointments (id, client_id, client_name, stylist_id, stylist_name, date, time, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(apt.id, apt.clientId, apt.clientName, apt.stylistId, apt.stylistName, apt.date, apt.time, apt.status, apt.notes);

        for (const service of apt.services) {
            prepare('INSERT INTO appointment_services (appointment_id, service_name) VALUES (?, ?)').run(apt.id, service);
        }
        for (const product of apt.products) {
            prepare('INSERT INTO appointment_products (appointment_id, product_name) VALUES (?, ?)').run(apt.id, product);
        }
    }
    console.log('Appuntamenti inseriti');

    // =====================================================
    // TEMPLATE EMAIL
    // =====================================================

    const emailTemplates = [
        {
            name: 'Win-back',
            type: 'win_back',
            subject_template: 'Ci manchi, {{client_name}}!',
            body_template: `Ciao {{client_name}},

abbiamo notato che la tua ultima visita da noi risale a {{days_since_visit}} giorni fa.

Saremmo felici di rivederti presto! Come ringraziamento per la tua fedeltà, vorremmo offrirti un servizio speciale.

Prenota ora il tuo prossimo appuntamento e approfitta delle nostre offerte attuali.

Cordiali saluti,
Il Team SalonAssist`,
            active: 1
        },
        {
            name: 'Promemoria Appuntamento',
            type: 'appointment_reminder',
            subject_template: 'Promemoria: Il tuo appuntamento del {{appointment_date}}',
            body_template: `Ciao {{client_name}},

ti ricordiamo il tuo prossimo appuntamento:

Data: {{appointment_date}}
Ora: {{appointment_time}}
Servizi: {{services}}

Se desideri annullare o spostare l'appuntamento, contattaci in anticipo.

Non vediamo l'ora di vederti!

Cordiali saluti,
Il Team SalonAssist`,
            active: 1
        },
        {
            name: 'Raccomandazione Prodotti',
            type: 'product_recommendation',
            subject_template: 'Prodotti perfetti per la cura dopo {{service}}',
            body_template: `Ciao {{client_name}},

in base al tuo ultimo servizio ({{service}}), vorremmo consigliarti alcuni prodotti perfetti per la tua cura:

{{product_recommendations}}

Questi prodotti ti aiuteranno a mantenere i risultati del trattamento più a lungo e a prenderti cura al meglio dei tuoi capelli/della tua pelle.

Vieni a trovarci in salone o ordina online!

Cordiali saluti,
Il Team SalonAssist`,
            active: 1
        },
        {
            name: 'Promozione',
            type: 'promotion',
            subject_template: 'Offerta esclusiva per te, {{client_name}}!',
            body_template: `Ciao {{client_name}},

come cliente speciale, vorremmo farti un'offerta esclusiva:

{{promotion_details}}

Questa offerta è valida solo per un periodo limitato. Prenota subito il tuo appuntamento!

Cordiali saluti,
Il Team SalonAssist`,
            active: 1
        }
    ];

    for (const template of emailTemplates) {
        prepare(`
            INSERT INTO email_templates (name, type, subject_template, body_template, active)
            VALUES (?, ?, ?, ?, ?)
        `).run(template.name, template.type, template.subject_template, template.body_template, template.active);
    }
    console.log('Template email inseriti');

    // =====================================================
    // IMPOSTAZIONI OUTREACH
    // =====================================================

    prepare(`
        INSERT INTO outreach_settings (id, win_back_threshold_days, reminder_days_before)
        VALUES (1, 30, 2)
    `).run();
    console.log('Impostazioni outreach inserite');

    saveDb();
    console.log('Seed database completato!');
    closeDb();
}

// Esegui seeder
seed().catch(err => {
    console.error('Seed fallito:', err);
    process.exit(1);
});
