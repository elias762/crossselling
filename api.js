// =====================================================
// API LAYER - Real HTTP Calls to Backend
// =====================================================
// Uses relative paths - works on Vercel and localhost
// =====================================================

const Api = (function() {
    'use strict';

    const BASE_URL = '/api';

    // Helper for fetch with error handling
    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // =====================
    // CLIENTS
    // =====================

    async function getClients() {
        return request('/clients');
    }

    async function getClientById(id) {
        return request(`/clients/${id}`);
    }

    async function getClientHistory(clientId) {
        return request(`/clients/${clientId}/history`);
    }

    // =====================
    // STYLISTS
    // =====================

    async function getStylists() {
        return request('/stylists');
    }

    async function getActiveStylists() {
        return request('/stylists/active');
    }

    async function getStylistById(id) {
        return request(`/stylists/${id}`);
    }

    // =====================
    // SERVICES
    // =====================

    async function getServices() {
        return request('/services');
    }

    async function getActiveServices() {
        return request('/services/active');
    }

    async function getServiceById(id) {
        return request(`/services/${id}`);
    }

    async function createService(data) {
        return request('/services', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateService(id, data) {
        return request(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function toggleServiceActive(id, active) {
        return request(`/services/${id}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ active })
        });
    }

    // =====================
    // PRODUCTS
    // =====================

    async function getProducts() {
        return request('/products');
    }

    async function getActiveProducts() {
        return request('/products/active');
    }

    async function getProductById(id) {
        return request(`/products/${id}`);
    }

    async function createProduct(data) {
        return request('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateProduct(id, data) {
        return request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function toggleProductActive(id, active) {
        return request(`/products/${id}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ active })
        });
    }

    // =====================
    // APPOINTMENTS
    // =====================

    async function getAppointments() {
        return request('/appointments');
    }

    async function getAppointmentById(id) {
        return request(`/appointments/${id}`);
    }

    async function createAppointment(data) {
        return request('/appointments', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateAppointment(id, data) {
        return request(`/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function addServiceToAppointment(appointmentId, serviceName) {
        return request(`/appointments/${appointmentId}/services`, {
            method: 'POST',
            body: JSON.stringify({ serviceName })
        });
    }

    async function addProductToAppointment(appointmentId, productName) {
        return request(`/appointments/${appointmentId}/products`, {
            method: 'POST',
            body: JSON.stringify({ productName })
        });
    }

    async function dismissRecommendation(appointmentId, itemName, type) {
        return request(`/appointments/${appointmentId}/dismiss`, {
            method: 'POST',
            body: JSON.stringify({ itemName, itemType: type })
        });
    }

    async function getDismissedRecommendations(appointmentId) {
        return request(`/appointments/${appointmentId}/dismissed`);
    }

    // =====================
    // RULES (Service Rules + Product Rules)
    // =====================

    async function getRules() {
        return request('/rules');
    }

    async function getServiceRules() {
        return request('/rules/services');
    }

    async function getProductRules() {
        return request('/rules/products');
    }

    async function getServiceRuleById(id) {
        const rules = await getServiceRules();
        const rule = rules.find(r => r.id === id);
        if (!rule) throw new Error(`Service rule not found: ${id}`);
        return rule;
    }

    async function getProductRuleById(id) {
        const rules = await getProductRules();
        const rule = rules.find(r => r.id === id);
        if (!rule) throw new Error(`Product rule not found: ${id}`);
        return rule;
    }

    async function createServiceRule(data) {
        return request('/rules/services', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function createProductRule(data) {
        return request('/rules/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async function updateServiceRule(id, data) {
        return request(`/rules/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function updateProductRule(id, data) {
        return request(`/rules/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function deleteServiceRule(id) {
        return request(`/rules/services/${id}`, {
            method: 'DELETE'
        });
    }

    async function deleteProductRule(id) {
        return request(`/rules/products/${id}`, {
            method: 'DELETE'
        });
    }

    async function toggleServiceRuleActive(id, active) {
        return request(`/rules/services/${id}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ active })
        });
    }

    async function toggleProductRuleActive(id, active) {
        return request(`/rules/products/${id}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ active })
        });
    }

    // =====================
    // RECOMMENDATION TRACKING
    // =====================

    async function trackRecommendationShown(itemName, type) {
        return request('/tracking/shown', {
            method: 'POST',
            body: JSON.stringify({ itemName, type })
        });
    }

    async function trackRecommendationAccepted(itemName, type) {
        return request('/tracking/accepted', {
            method: 'POST',
            body: JSON.stringify({ itemName, type })
        });
    }

    async function trackRecommendationDismissed(itemName, type) {
        return request('/tracking/dismissed', {
            method: 'POST',
            body: JSON.stringify({ itemName, type })
        });
    }

    async function getRecommendationTracking() {
        return request('/tracking');
    }

    // =====================
    // ANALYTICS
    // =====================

    async function getAnalyticsData() {
        return request('/analytics');
    }

    // =====================
    // OUTREACH
    // =====================

    async function getOutreachSuggestions(type = null, status = null) {
        let endpoint = '/outreach/suggestions';
        const params = [];
        if (type) params.push(`type=${encodeURIComponent(type)}`);
        if (status) params.push(`status=${encodeURIComponent(status)}`);
        if (params.length > 0) endpoint += '?' + params.join('&');
        return request(endpoint);
    }

    async function getOutreachSuggestionById(id) {
        return request(`/outreach/suggestions/${id}`);
    }

    async function generateOutreachSuggestions() {
        return request('/outreach/suggestions/generate', {
            method: 'POST'
        });
    }

    async function sendOutreachSuggestion(id) {
        return request(`/outreach/suggestions/${id}/send`, {
            method: 'POST'
        });
    }

    async function dismissOutreachSuggestion(id) {
        return request(`/outreach/suggestions/${id}/dismiss`, {
            method: 'POST'
        });
    }

    async function getOutreachTemplates() {
        return request('/outreach/templates');
    }

    async function getOutreachStats() {
        return request('/outreach/stats');
    }

    async function getOutreachSettings() {
        return request('/outreach/settings');
    }

    async function updateOutreachSettings(settings) {
        return request('/outreach/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    // =====================
    // PUBLIC API
    // =====================

    return {
        // Clients
        getClients,
        getClientById,
        getClientHistory,

        // Stylists
        getStylists,
        getActiveStylists,
        getStylistById,

        // Services
        getServices,
        getActiveServices,
        getServiceById,
        createService,
        updateService,
        toggleServiceActive,

        // Products
        getProducts,
        getActiveProducts,
        getProductById,
        createProduct,
        updateProduct,
        toggleProductActive,

        // Appointments
        getAppointments,
        getAppointmentById,
        createAppointment,
        updateAppointment,
        addServiceToAppointment,
        addProductToAppointment,
        dismissRecommendation,
        getDismissedRecommendations,

        // Rules
        getRules,
        getServiceRules,
        getProductRules,
        getServiceRuleById,
        getProductRuleById,
        createServiceRule,
        createProductRule,
        updateServiceRule,
        updateProductRule,
        deleteServiceRule,
        deleteProductRule,
        toggleServiceRuleActive,
        toggleProductRuleActive,

        // Tracking
        trackRecommendationShown,
        trackRecommendationAccepted,
        trackRecommendationDismissed,
        getRecommendationTracking,

        // Analytics
        getAnalyticsData,

        // Outreach
        getOutreachSuggestions,
        getOutreachSuggestionById,
        generateOutreachSuggestions,
        sendOutreachSuggestion,
        dismissOutreachSuggestion,
        getOutreachTemplates,
        getOutreachStats,
        getOutreachSettings,
        updateOutreachSettings
    };
})();

// Export globally
if (typeof window !== 'undefined') {
    window.Api = Api;
}
