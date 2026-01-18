// =====================================================
// APP DATA STORE - Centralized State Management
// =====================================================
// All data lives here. Components subscribe to changes.
// Actions are the only way to modify state.
// Data is loaded from backend API on initialization.
// =====================================================

const AppStore = (function() {
    'use strict';

    // =====================
    // PRIVATE STATE
    // =====================

    let state = {
        // Clients
        clients: [],
        clientHistory: {},

        // Stylists
        stylists: [],

        // Catalogs
        services: [],
        products: [],

        // Appointments
        appointments: [],
        dismissedRecommendations: {}, // { appointmentId: { services: [], products: [] } }

        // Recommendation Rules
        serviceRules: [],
        productRules: [],

        // Analytics Tracking
        recommendationTracking: {}, // { itemName: { shown, accepted, dismissed, type } }

        // Outreach
        outreachSuggestions: [],

        // UI State (not persisted)
        currentAppointmentId: null,
        currentClientId: null,
        currentEditingRule: null,

        // Loading state
        initialized: false,
        loading: false
    };

    // Subscribers for reactivity
    const subscribers = {
        clients: [],
        stylists: [],
        services: [],
        products: [],
        appointments: [],
        serviceRules: [],
        productRules: [],
        recommendationTracking: [],
        outreach: [],
        ui: []
    };

    // =====================
    // PRIVATE HELPERS
    // =====================

    function notify(channel) {
        if (subscribers[channel]) {
            subscribers[channel].forEach(callback => {
                try {
                    callback(getState());
                } catch (e) {
                    console.error(`Subscriber error on ${channel}:`, e);
                }
            });
        }
    }

    function generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    function getState() {
        // Return a shallow copy to prevent direct mutation
        return { ...state };
    }

    // =====================
    // PUBLIC API: GETTERS
    // =====================

    const api = {
        // Get full state (read-only copy)
        getState,

        // Get specific entities
        getClients: () => [...state.clients],
        getClient: (id) => state.clients.find(c => c.id === id),
        getClientHistory: (clientId) => state.clientHistory[clientId] || [],

        getStylists: () => [...state.stylists],
        getActivestylists: () => state.stylists.filter(s => s.active),
        getStylist: (id) => state.stylists.find(s => s.id === id),

        getServices: () => [...state.services],
        getActiveServices: () => state.services.filter(s => s.active),
        getService: (id) => state.services.find(s => s.id === id),
        getServiceByName: (name) => state.services.find(s => s.name === name),
        getServicePrice: (name) => {
            const service = state.services.find(s => s.name === name);
            return service ? service.price : 40; // Default fallback
        },
        isServiceActive: (name) => {
            const service = state.services.find(s => s.name === name);
            return service && service.active;
        },

        getProducts: () => [...state.products],
        getActiveProducts: () => state.products.filter(p => p.active),
        getProduct: (id) => state.products.find(p => p.id === id),
        getProductByName: (name) => state.products.find(p => p.name === name),
        getProductPrice: (name) => {
            const product = state.products.find(p => p.name === name);
            return product ? product.price : 20; // Default fallback
        },
        isProductActive: (name) => {
            const product = state.products.find(p => p.name === name);
            return product && product.active;
        },

        getAppointments: () => [...state.appointments],
        getAppointment: (id) => state.appointments.find(a => a.id === id),
        getDismissedRecommendations: (appointmentId) => state.dismissedRecommendations[appointmentId] || { services: [], products: [] },

        getServiceRules: () => [...state.serviceRules],
        getActiveServiceRules: () => state.serviceRules.filter(r => r.active),
        getServiceRule: (id) => state.serviceRules.find(r => r.id === id),

        getProductRules: () => [...state.productRules],
        getActiveProductRules: () => state.productRules.filter(r => r.active),
        getProductRule: (id) => state.productRules.find(r => r.id === id),

        getRecommendationTracking: () => ({ ...state.recommendationTracking }),

        // Outreach
        getOutreachSuggestions: () => [...state.outreachSuggestions],

        // UI State
        getCurrentAppointmentId: () => state.currentAppointmentId,
        getCurrentClientId: () => state.currentClientId,
        getCurrentEditingRule: () => state.currentEditingRule,

        // Loading State
        isInitialized: () => state.initialized,
        isLoading: () => state.loading,

        // Combined data for analytics
        getAllAppointmentsForAnalytics: () => {
            const all = [];

            // Add demo history from all clients
            Object.values(state.clientHistory).forEach(history => {
                history.forEach(apt => {
                    all.push({
                        date: apt.date,
                        time: apt.time,
                        services: apt.services,
                        products: apt.products,
                        status: apt.status
                    });
                });
            });

            // Add live appointments
            state.appointments.forEach(apt => {
                all.push({
                    date: apt.date,
                    time: apt.time,
                    services: apt.services,
                    products: apt.products,
                    status: apt.status
                });
            });

            return all;
        },

        // =====================
        // PUBLIC API: ACTIONS
        // =====================

        // --- Appointments ---
        addAppointment: (appointment) => {
            const newAppointment = {
                id: generateId(),
                ...appointment,
                status: appointment.status || 'Scheduled'
            };
            state.appointments.unshift(newAppointment);
            state.dismissedRecommendations[newAppointment.id] = { services: [], products: [] };
            notify('appointments');
            return newAppointment;
        },

        updateAppointment: (id, updates) => {
            const index = state.appointments.findIndex(a => a.id === id);
            if (index !== -1) {
                state.appointments[index] = { ...state.appointments[index], ...updates };
                notify('appointments');
                return state.appointments[index];
            }
            return null;
        },

        deleteAppointment: (id) => {
            state.appointments = state.appointments.filter(a => a.id !== id);
            delete state.dismissedRecommendations[id];
            notify('appointments');
        },

        addServiceToAppointment: (appointmentId, serviceName) => {
            const apt = state.appointments.find(a => a.id === appointmentId);
            if (apt && !apt.services.includes(serviceName)) {
                apt.services.push(serviceName);
                notify('appointments');
            }
        },

        addProductToAppointment: (appointmentId, productName) => {
            const apt = state.appointments.find(a => a.id === appointmentId);
            if (apt && !apt.products.includes(productName)) {
                apt.products.push(productName);
                notify('appointments');
            }
        },

        dismissRecommendationForAppointment: (appointmentId, itemName, type) => {
            if (!state.dismissedRecommendations[appointmentId]) {
                state.dismissedRecommendations[appointmentId] = { services: [], products: [] };
            }
            const key = type === 'service' ? 'services' : 'products';
            if (!state.dismissedRecommendations[appointmentId][key].includes(itemName)) {
                state.dismissedRecommendations[appointmentId][key].push(itemName);
            }
        },

        // --- Services ---
        addService: (service) => {
            const newService = {
                id: Date.now(),
                ...service,
                active: service.active !== undefined ? service.active : true
            };
            state.services.push(newService);
            notify('services');
            return newService;
        },

        updateService: (id, updates) => {
            const index = state.services.findIndex(s => s.id === id);
            if (index !== -1) {
                state.services[index] = { ...state.services[index], ...updates };
                notify('services');
                return state.services[index];
            }
            return null;
        },

        toggleServiceActive: (id, active) => {
            const service = state.services.find(s => s.id === id);
            if (service) {
                service.active = active;
                notify('services');
                return service;
            }
            return null;
        },

        deleteService: (id) => {
            state.services = state.services.filter(s => s.id !== id);
            notify('services');
        },

        // --- Products ---
        addProduct: (product) => {
            const newProduct = {
                id: Date.now(),
                ...product,
                active: product.active !== undefined ? product.active : true
            };
            state.products.push(newProduct);
            notify('products');
            return newProduct;
        },

        updateProduct: (id, updates) => {
            const index = state.products.findIndex(p => p.id === id);
            if (index !== -1) {
                state.products[index] = { ...state.products[index], ...updates };
                notify('products');
                return state.products[index];
            }
            return null;
        },

        toggleProductActive: (id, active) => {
            const product = state.products.find(p => p.id === id);
            if (product) {
                product.active = active;
                notify('products');
                return product;
            }
            return null;
        },

        deleteProduct: (id) => {
            state.products = state.products.filter(p => p.id !== id);
            notify('products');
        },

        // --- Service Rules ---
        addServiceRule: (rule) => {
            const newId = Math.max(0, ...state.serviceRules.map(r => r.id)) + 1;
            const newRule = {
                id: newId,
                ...rule,
                active: rule.active !== undefined ? rule.active : true
            };
            state.serviceRules.push(newRule);
            notify('serviceRules');
            return newRule;
        },

        updateServiceRule: (id, updates) => {
            const index = state.serviceRules.findIndex(r => r.id === id);
            if (index !== -1) {
                state.serviceRules[index] = { ...state.serviceRules[index], ...updates };
                notify('serviceRules');
                return state.serviceRules[index];
            }
            return null;
        },

        toggleServiceRuleActive: (id, active) => {
            const rule = state.serviceRules.find(r => r.id === id);
            if (rule) {
                rule.active = active;
                notify('serviceRules');
                return rule;
            }
            return null;
        },

        deleteServiceRule: (id) => {
            state.serviceRules = state.serviceRules.filter(r => r.id !== id);
            notify('serviceRules');
        },

        // --- Product Rules ---
        addProductRule: (rule) => {
            const newId = Math.max(0, ...state.productRules.map(r => r.id)) + 1;
            const newRule = {
                id: newId,
                ...rule,
                active: rule.active !== undefined ? rule.active : true
            };
            state.productRules.push(newRule);
            notify('productRules');
            return newRule;
        },

        updateProductRule: (id, updates) => {
            const index = state.productRules.findIndex(r => r.id === id);
            if (index !== -1) {
                state.productRules[index] = { ...state.productRules[index], ...updates };
                notify('productRules');
                return state.productRules[index];
            }
            return null;
        },

        toggleProductRuleActive: (id, active) => {
            const rule = state.productRules.find(r => r.id === id);
            if (rule) {
                rule.active = active;
                notify('productRules');
                return rule;
            }
            return null;
        },

        deleteProductRule: (id) => {
            state.productRules = state.productRules.filter(r => r.id !== id);
            notify('productRules');
        },

        // --- Recommendation Tracking ---
        trackRecommendationShown: (itemName, type) => {
            if (!state.recommendationTracking[itemName]) {
                state.recommendationTracking[itemName] = { shown: 0, accepted: 0, dismissed: 0, type };
            }
            state.recommendationTracking[itemName].shown++;
            notify('recommendationTracking');
        },

        trackRecommendationAccepted: (itemName, type) => {
            if (!state.recommendationTracking[itemName]) {
                state.recommendationTracking[itemName] = { shown: 0, accepted: 0, dismissed: 0, type };
            }
            state.recommendationTracking[itemName].accepted++;
            notify('recommendationTracking');
        },

        trackRecommendationDismissed: (itemName, type) => {
            if (!state.recommendationTracking[itemName]) {
                state.recommendationTracking[itemName] = { shown: 0, accepted: 0, dismissed: 0, type };
            }
            state.recommendationTracking[itemName].dismissed++;
            notify('recommendationTracking');
        },

        // --- UI State ---
        setCurrentAppointmentId: (id) => {
            state.currentAppointmentId = id;
            notify('ui');
        },

        setCurrentClientId: (id) => {
            state.currentClientId = id;
            notify('ui');
        },

        setCurrentEditingRule: (rule) => {
            state.currentEditingRule = rule;
            notify('ui');
        },

        // --- Stylists ---
        addStylist: (stylist) => {
            const newStylist = {
                id: generateId(),
                ...stylist,
                active: stylist.active !== undefined ? stylist.active : true
            };
            state.stylists.push(newStylist);
            notify('stylists');
            return newStylist;
        },

        updateStylist: (id, updates) => {
            const index = state.stylists.findIndex(s => s.id === id);
            if (index !== -1) {
                state.stylists[index] = { ...state.stylists[index], ...updates };
                notify('stylists');
                return state.stylists[index];
            }
            return null;
        },

        toggleStylistActive: (id, active) => {
            const stylist = state.stylists.find(s => s.id === id);
            if (stylist) {
                stylist.active = active;
                notify('stylists');
                return stylist;
            }
            return null;
        },

        // --- State Setters (for API data) ---
        setClients: (clients) => {
            state.clients = clients;
            notify('clients');
        },

        setClientHistory: (clientId, history) => {
            state.clientHistory[clientId] = history;
        },

        setStylists: (stylists) => {
            state.stylists = stylists;
            notify('stylists');
        },

        setServices: (services) => {
            state.services = services;
            notify('services');
        },

        setProducts: (products) => {
            state.products = products;
            notify('products');
        },

        setAppointments: (appointments) => {
            state.appointments = appointments;
            // Initialize dismissed recommendations for each appointment
            appointments.forEach(apt => {
                if (!state.dismissedRecommendations[apt.id]) {
                    state.dismissedRecommendations[apt.id] = { services: [], products: [] };
                }
            });
            notify('appointments');
        },

        setServiceRules: (rules) => {
            state.serviceRules = rules;
            notify('serviceRules');
        },

        setProductRules: (rules) => {
            state.productRules = rules;
            notify('productRules');
        },

        setRecommendationTracking: (tracking) => {
            state.recommendationTracking = tracking;
            notify('recommendationTracking');
        },

        setDismissedRecommendations: (appointmentId, dismissed) => {
            state.dismissedRecommendations[appointmentId] = dismissed;
        },

        // --- Outreach ---
        setOutreachSuggestions: (suggestions) => {
            state.outreachSuggestions = suggestions;
            notify('outreach');
        },

        // =====================
        // SUBSCRIPTION SYSTEM
        // =====================

        subscribe: (channel, callback) => {
            if (subscribers[channel]) {
                subscribers[channel].push(callback);
                // Return unsubscribe function
                return () => {
                    const index = subscribers[channel].indexOf(callback);
                    if (index > -1) {
                        subscribers[channel].splice(index, 1);
                    }
                };
            }
            console.warn(`Unknown subscription channel: ${channel}`);
            return () => {};
        },

        // =====================
        // INITIALIZATION
        // =====================

        init: async () => {
            if (state.initialized || state.loading) {
                return;
            }

            state.loading = true;
            console.log('AppStore initializing from API...');

            try {
                // Load all data from API in parallel
                const [
                    clients,
                    stylists,
                    services,
                    products,
                    appointments,
                    rules,
                    tracking
                ] = await Promise.all([
                    Api.getClients(),
                    Api.getStylists(),
                    Api.getServices(),
                    Api.getProducts(),
                    Api.getAppointments(),
                    Api.getRules(),
                    Api.getRecommendationTracking()
                ]);

                // Set state
                state.clients = clients;
                state.stylists = stylists;
                state.services = services;
                state.products = products;
                state.appointments = appointments;
                state.serviceRules = rules.serviceRules;
                state.productRules = rules.productRules;
                state.recommendationTracking = tracking;

                // Initialize dismissed recommendations for appointments
                for (const apt of appointments) {
                    try {
                        const dismissed = await Api.getDismissedRecommendations(apt.id);
                        state.dismissedRecommendations[apt.id] = dismissed;
                    } catch (e) {
                        state.dismissedRecommendations[apt.id] = { services: [], products: [] };
                    }
                }

                // Load client history for each client
                for (const client of clients) {
                    try {
                        const history = await Api.getClientHistory(client.id);
                        state.clientHistory[client.id] = history;
                    } catch (e) {
                        state.clientHistory[client.id] = [];
                    }
                }

                state.initialized = true;
                state.loading = false;

                // Notify all channels
                Object.keys(subscribers).forEach(channel => notify(channel));

                console.log('AppStore initialized with API data');
            } catch (error) {
                state.loading = false;
                console.error('Failed to initialize AppStore from API:', error);
                throw error;
            }
        }
    };

    return api;
})();

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    window.AppStore = AppStore;
}
