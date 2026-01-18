// =====================================================
// Salon Cross-Selling Assistant - Main Application
// =====================================================
// This file contains UI logic and event handlers.
// Data is fetched via Api layer (api.js).
// AppStore remains the source of truth.
// =====================================================

// Track loading states
let isLoading = {
    appointments: false,
    services: false,
    products: false,
    clients: false,
    rules: false,
    analytics: false,
    outreach: false
};

// Outreach state
let outreachState = {
    currentFilter: 'all',
    currentSuggestionId: null
};

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize the data store
    await AppStore.init();

    // Initialize all modules
    initNavigation();
    initSearch();
    initAppointmentModal();
    initAppointmentDetails();
    initClients();
    initServicesCatalog();
    initProductsCatalog();
    initRecommendationsPage();
    initAnalyticsPage();
    initOutreachPage();
    updateAppointmentFormSelections();
    setDefaultDate();

    // Render dashboard appointments
    renderDashboardAppointments();

    // Render appointments table
    renderAppointmentsTable();

    // Render analytics
    updateAnalytics();
});

// =====================
// LOADING HELPERS
// =====================

function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <tr class="loading-row">
                <td colspan="6">
                    <div class="loading-state">
                        <span class="loading-spinner"></span>
                        <span>${message}</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

function showLoadingDiv(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-state">
                <span class="loading-spinner"></span>
                <span>${message}</span>
            </div>
        `;
    }
}

// =====================
// NAVIGATION
// =====================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item a');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);

            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.classList.remove('active');
            });
            this.parentElement.classList.add('active');

            pages.forEach(page => {
                if (page.id === targetId) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });

            history.pushState(null, null, `#${targetId}`);
        });
    });

    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        navigateToPage(hash);
    });

    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        navigateToPage(initialHash);
    }
}

function navigateToPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const navItems = document.querySelectorAll('.nav-item');

    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    navItems.forEach(nav => {
        const link = nav.querySelector('a');
        if (link && link.getAttribute('href') === `#${pageId}`) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });
}

function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    console.log('Searching for:', searchTerm);
                }
            }
        });
    }
}

function setDefaultDate() {
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// =====================
// APPOINTMENT FUNCTIONS
// =====================

function initAppointmentModal() {
    const modal = document.getElementById('appointmentModalOverlay');
    const openBtn = document.getElementById('openAppointmentModal');
    const closeBtn = document.getElementById('closeAppointmentModal');
    const cancelBtn = document.getElementById('cancelAppointment');
    const form = document.getElementById('appointmentForm');

    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', function() {
        openModal();
    });

    closeBtn.addEventListener('click', function() {
        closeModal();
    });

    cancelBtn.addEventListener('click', function() {
        closeModal();
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createAppointment();
    });
}

function openModal(preselectedClient = null) {
    const modal = document.getElementById('appointmentModalOverlay');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    document.getElementById('appointmentForm').reset();
    setDefaultDate();

    if (preselectedClient) {
        document.getElementById('appointmentClient').value = preselectedClient;
    }
}

function closeModal() {
    const modal = document.getElementById('appointmentModalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

async function createAppointment() {
    const client = document.getElementById('appointmentClient').value;
    const stylist = document.getElementById('appointmentStylist').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const notes = document.getElementById('appointmentNotes').value;

    const serviceCheckboxes = document.querySelectorAll('input[name="services"]:checked');
    const services = Array.from(serviceCheckboxes).map(cb => cb.value);

    const productCheckboxes = document.querySelectorAll('input[name="products"]:checked');
    const products = Array.from(productCheckboxes).map(cb => cb.value);

    if (services.length === 0) {
        alert('Please select at least one service.');
        return;
    }

    try {
        // Use API to create appointment
        await Api.createAppointment({
            client,
            stylist,
            date,
            time,
            services,
            products,
            notes
        });

        await renderAppointmentsTable();
        closeModal();
        showNotification('Appointment created successfully!');
    } catch (error) {
        console.error('Error creating appointment:', error);
        showNotification('Error creating appointment: ' + error.message);
    }
}

async function renderAppointmentsTable() {
    const tbody = document.getElementById('appointmentsTableBody');
    const countBadge = document.getElementById('appointmentCount');

    if (!tbody) return;

    // Show loading on first load
    if (!isLoading.appointments) {
        isLoading.appointments = true;
        showLoading('appointmentsTableBody', 'Loading appointments...');
    }

    try {
        const appointments = await Api.getAppointments();
        const count = appointments.length;
        countBadge.textContent = `${count} appointment${count !== 1 ? 's' : ''}`;

        tbody.innerHTML = '';

        if (appointments.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state-row">
                    <td colspan="6">
                        <div class="empty-state">
                            <span class="empty-icon">📅</span>
                            <p>No appointments yet. Click "+ New Appointment" to create one.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.classList.add('clickable-row');
            row.dataset.appointmentId = appointment.id;

            const formattedDate = formatDate(appointment.date);
            const formattedTime = formatTime(appointment.time);

            const serviceTags = appointment.services.map(s =>
                `<span class="service-tag">${s}</span>`
            ).join('');

            const productTags = appointment.products.length > 0
                ? appointment.products.map(p => `<span class="product-tag">${p}</span>`).join('')
                : '<span class="no-products">None</span>';

            const statusClass = appointment.status.toLowerCase().replace(' ', '-');

            row.innerHTML = `
                <td>
                    <div class="datetime-cell">
                        <span class="date">${formattedDate}</span>
                        <span class="time">${formattedTime}</span>
                    </div>
                </td>
                <td>
                    <div class="client-cell">
                        <div class="client-avatar">${getInitials(appointment.client)}</div>
                        <span>${appointment.client}</span>
                    </div>
                </td>
                <td>${appointment.stylist}</td>
                <td><div class="tags-cell">${serviceTags}</div></td>
                <td><div class="tags-cell">${productTags}</div></td>
                <td><span class="status ${statusClass}">${appointment.status}</span></td>
            `;

            row.addEventListener('click', function() {
                openAppointmentDetails(appointment.id);
            });

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading appointments:', error);
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="6">
                    <div class="empty-state error">
                        <span class="empty-icon">⚠️</span>
                        <p>Error loading appointments. Please try again.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

async function renderDashboardAppointments() {
    const tbody = document.getElementById('dashboardAppointmentsBody');
    if (!tbody) return;

    try {
        const appointments = await Api.getAppointments();

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Filter for today's appointments and sort by time
        const todayAppointments = appointments
            .filter(apt => apt.date === today)
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(0, 8); // Show max 8 appointments

        tbody.innerHTML = '';

        if (todayAppointments.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state-row">
                    <td colspan="5">
                        <div class="empty-state">
                            <span class="empty-icon">📅</span>
                            <p>No appointments for today.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        todayAppointments.forEach(appointment => {
            const row = document.createElement('tr');

            const serviceTags = appointment.services.map(s =>
                `<span class="service-tag">${s}</span>`
            ).join('');

            const statusClass = appointment.status.toLowerCase().replace(' ', '-');

            row.innerHTML = `
                <td>
                    <div class="client-cell">
                        <div class="client-avatar">${getInitials(appointment.client)}</div>
                        <span>${appointment.client}</span>
                    </div>
                </td>
                <td><div class="tags-cell">${serviceTags}</div></td>
                <td>${appointment.stylist}</td>
                <td>${formatTime(appointment.time)}</td>
                <td><span class="status ${statusClass}">${appointment.status}</span></td>
            `;

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading dashboard appointments:', error);
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="5">
                    <div class="empty-state error">
                        <span class="empty-icon">⚠️</span>
                        <p>Error loading appointments.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

function initAppointmentDetails() {
    const backBtn = document.getElementById('backToAppointments');
    const markCompletedBtn = document.getElementById('markCompleted');
    const markNoShowBtn = document.getElementById('markNoShow');

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            navigateToPage('appointments');
            AppStore.setCurrentAppointmentId(null);
        });
    }

    if (markCompletedBtn) {
        markCompletedBtn.addEventListener('click', function() {
            updateAppointmentStatus('Completed');
        });
    }

    if (markNoShowBtn) {
        markNoShowBtn.addEventListener('click', function() {
            updateAppointmentStatus('No-show');
        });
    }
}

async function openAppointmentDetails(appointmentId) {
    try {
        const appointment = await Api.getAppointmentById(appointmentId);

        AppStore.setCurrentAppointmentId(appointmentId);

        document.getElementById('detailsClient').textContent = appointment.client;
        document.getElementById('detailsStylist').textContent = appointment.stylist;
        document.getElementById('detailsDate').textContent = formatDate(appointment.date);
        document.getElementById('detailsTime').textContent = formatTime(appointment.time);

        const servicesContainer = document.getElementById('detailsServices');
        servicesContainer.innerHTML = appointment.services.map(s =>
            `<span class="service-tag">${s}</span>`
        ).join('');

        const productsContainer = document.getElementById('detailsProducts');
        if (appointment.products.length > 0) {
            productsContainer.innerHTML = appointment.products.map(p =>
                `<span class="product-tag">${p}</span>`
            ).join('');
        } else {
            productsContainer.innerHTML = '<span class="no-products">None</span>';
        }

        const notesElement = document.getElementById('detailsNotes');
        notesElement.textContent = appointment.notes || 'No notes added.';

        updateStatusDisplay(appointment.status);
        generateRecommendations(appointment);

        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById('appointment-details').classList.add('active');

        document.querySelectorAll('.nav-item').forEach(nav => {
            const link = nav.querySelector('a');
            if (link && link.getAttribute('href') === '#appointments') {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('Error loading appointment details:', error);
        showNotification('Error loading appointment details');
    }
}

function updateStatusDisplay(status) {
    const statusElement = document.getElementById('detailsStatus');
    const statusClass = status.toLowerCase().replace(' ', '-');
    statusElement.className = `status ${statusClass}`;
    statusElement.textContent = status;

    const completedBtn = document.getElementById('markCompleted');
    const noShowBtn = document.getElementById('markNoShow');

    if (status === 'Completed' || status === 'No-show') {
        completedBtn.disabled = true;
        noShowBtn.disabled = true;
        completedBtn.classList.add('disabled');
        noShowBtn.classList.add('disabled');
    } else {
        completedBtn.disabled = false;
        noShowBtn.disabled = false;
        completedBtn.classList.remove('disabled');
        noShowBtn.classList.remove('disabled');
    }
}

async function updateAppointmentStatus(newStatus) {
    const currentAppointmentId = AppStore.getCurrentAppointmentId();
    if (!currentAppointmentId) return;

    try {
        await Api.updateAppointment(currentAppointmentId, { status: newStatus });

        updateStatusDisplay(newStatus);
        await renderAppointmentsTable();

        showNotification(`Appointment marked as ${newStatus}`);
    } catch (error) {
        console.error('Error updating appointment:', error);
        showNotification('Error updating appointment status');
    }
}

// =====================
// RECOMMENDATIONS (using configurable rules from AppStore)
// =====================

function generateRecommendations(appointment) {
    const svcRecs = [];
    const prdRecs = [];

    const dismissed = AppStore.getDismissedRecommendations(appointment.id);
    const serviceRules = AppStore.getActiveServiceRules();
    const productRules = AppStore.getActiveProductRules();

    const serviceReasonMap = {};
    const productReasonMap = {};

    appointment.services.forEach(bookedService => {
        const matchingServiceRules = serviceRules.filter(r => r.trigger === bookedService);
        matchingServiceRules.forEach(rule => {
            rule.suggestions.forEach(suggestion => {
                if (appointment.services.includes(suggestion) ||
                    dismissed.services.includes(suggestion) ||
                    !AppStore.isServiceActive(suggestion)) {
                    return;
                }

                if (!serviceReasonMap[suggestion]) {
                    serviceReasonMap[suggestion] = [];
                }
                serviceReasonMap[suggestion].push({
                    reason: rule.reason || `Pairs well with ${bookedService}`,
                    trigger: bookedService
                });
            });
        });

        const matchingProductRules = productRules.filter(r => r.trigger === bookedService);
        matchingProductRules.forEach(rule => {
            rule.suggestions.forEach(suggestion => {
                if (appointment.products.includes(suggestion) ||
                    dismissed.products.includes(suggestion) ||
                    !AppStore.isProductActive(suggestion)) {
                    return;
                }

                if (!productReasonMap[suggestion]) {
                    productReasonMap[suggestion] = [];
                }
                productReasonMap[suggestion].push({
                    reason: rule.reason || `Recommended after ${bookedService}`,
                    trigger: bookedService
                });
            });
        });
    });

    Object.entries(serviceReasonMap).forEach(([itemName, reasons]) => {
        let displayReason;
        if (reasons.length === 1) {
            displayReason = reasons[0].reason;
        } else {
            displayReason = `Suggested by ${reasons.length} rules`;
        }

        svcRecs.push({
            name: itemName,
            reason: displayReason,
            type: 'service',
            ruleCount: reasons.length
        });
    });

    Object.entries(productReasonMap).forEach(([itemName, reasons]) => {
        let displayReason;
        if (reasons.length === 1) {
            displayReason = reasons[0].reason;
        } else {
            displayReason = `Suggested by ${reasons.length} rules`;
        }

        prdRecs.push({
            name: itemName,
            reason: displayReason,
            type: 'product',
            ruleCount: reasons.length
        });
    });

    svcRecs.sort((a, b) => b.ruleCount - a.ruleCount);
    prdRecs.sort((a, b) => b.ruleCount - a.ruleCount);

    renderRecommendations('serviceRecommendations', svcRecs, 'service');
    renderRecommendations('productRecommendations', prdRecs, 'product');
}

function renderRecommendations(containerId, recommendations, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (recommendations.length === 0) {
        container.innerHTML = '<p class="no-recommendations">No suggestions available.</p>';
        return;
    }

    // Track "shown" for each recommendation (fire and forget)
    recommendations.forEach(rec => {
        Api.trackRecommendationShown(rec.name, type).catch(console.error);
    });

    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card" data-name="${rec.name}" data-type="${type}">
            <div class="rec-header">
                <span class="rec-name">${rec.name}</span>
                <span class="rec-category">${type === 'service' ? 'Add-on Service' : 'Retail Product'}</span>
            </div>
            <p class="rec-reason">💡 ${rec.reason}</p>
            <div class="rec-actions">
                <button class="btn-add" onclick="addRecommendation('${rec.name}', '${type}')">
                    + Add to appointment
                </button>
                <button class="btn-dismiss" onclick="dismissRecommendation('${rec.name}', '${type}')">
                    Dismiss
                </button>
            </div>
        </div>
    `).join('');
}

async function addRecommendation(name, type) {
    const currentAppointmentId = AppStore.getCurrentAppointmentId();
    if (!currentAppointmentId) return;

    try {
        if (type === 'service') {
            await Api.addServiceToAppointment(currentAppointmentId, name);
        } else if (type === 'product') {
            await Api.addProductToAppointment(currentAppointmentId, name);
        }

        // Track "accepted" (fire and forget)
        Api.trackRecommendationAccepted(name, type).catch(console.error);

        await openAppointmentDetails(currentAppointmentId);
        await renderAppointmentsTable();
        showNotification(`${name} added to appointment`);
    } catch (error) {
        console.error('Error adding recommendation:', error);
        showNotification('Error adding to appointment');
    }
}

async function dismissRecommendation(name, type) {
    const currentAppointmentId = AppStore.getCurrentAppointmentId();
    if (!currentAppointmentId) return;

    try {
        await Api.dismissRecommendation(currentAppointmentId, name, type);

        // Track "dismissed" (fire and forget)
        Api.trackRecommendationDismissed(name, type).catch(console.error);

        const appointment = await Api.getAppointmentById(currentAppointmentId);
        if (appointment) {
            generateRecommendations(appointment);
        }

        showNotification(`${name} dismissed`);
    } catch (error) {
        console.error('Error dismissing recommendation:', error);
    }
}

// =====================
// CLIENTS FUNCTIONS
// =====================

function initClients() {
    renderClientsTable();
    initClientSearch();
    initClientProfile();
}

async function renderClientsTable(filteredClients = null) {
    const tbody = document.getElementById('clientsTableBody');
    const countBadge = document.getElementById('clientCount');

    if (!tbody) return;

    try {
        const clients = filteredClients || await Api.getClients();
        countBadge.textContent = `${clients.length} client${clients.length !== 1 ? 's' : ''}`;

        tbody.innerHTML = '';

        if (clients.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state-row">
                    <td colspan="4">
                        <div class="empty-state">
                            <span class="empty-icon">👥</span>
                            <p>No clients found matching your search.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        clients.forEach(client => {
            const row = document.createElement('tr');
            row.classList.add('clickable-row');
            row.dataset.clientId = client.id;

            const tagHtml = client.tags.map(tag => {
                const tagClass = getTagClass(tag);
                return `<span class="client-tag ${tagClass}">${tag}</span>`;
            }).join('');

            row.innerHTML = `
                <td>
                    <div class="client-cell">
                        <div class="client-avatar">${getInitials(client.name)}</div>
                        <span>${client.name}</span>
                    </div>
                </td>
                <td><div class="tags-cell">${tagHtml}</div></td>
                <td>${formatDate(client.lastVisit)}</td>
                <td><span class="visit-count">${client.totalVisits}</span></td>
            `;

            row.addEventListener('click', function() {
                openClientProfile(client.id);
            });

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

function getTagClass(tag) {
    const tagClasses = {
        'Hair Styling': 'tag-hair',
        'Hair Color': 'tag-color',
        'Beard Care': 'tag-beard',
        'Skincare': 'tag-skin',
        'Nails': 'tag-nails',
        'Scalp Care': 'tag-scalp'
    };
    return tagClasses[tag] || 'tag-default';
}

function initClientSearch() {
    const searchInput = document.getElementById('clientSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', async function() {
        const searchTerm = this.value.toLowerCase().trim();

        if (!searchTerm) {
            await renderClientsTable();
            return;
        }

        try {
            const clients = await Api.getClients();
            const filtered = clients.filter(client => {
                const nameMatch = client.name.toLowerCase().includes(searchTerm);
                const tagMatch = client.tags.some(tag => tag.toLowerCase().includes(searchTerm));
                return nameMatch || tagMatch;
            });

            await renderClientsTable(filtered);
        } catch (error) {
            console.error('Error searching clients:', error);
        }
    });
}

function initClientProfile() {
    const backBtn = document.getElementById('backToClients');
    const bookBtn = document.getElementById('bookForClient');

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            navigateToPage('clients');
            AppStore.setCurrentClientId(null);
        });
    }

    if (bookBtn) {
        bookBtn.addEventListener('click', async function() {
            const currentClientId = AppStore.getCurrentClientId();
            if (currentClientId) {
                try {
                    const client = await Api.getClientById(currentClientId);
                    if (client) {
                        navigateToPage('appointments');
                        setTimeout(() => openModal(client.name), 100);
                    }
                } catch (error) {
                    console.error('Error getting client:', error);
                }
            }
        });
    }
}

async function openClientProfile(clientId) {
    try {
        const client = await Api.getClientById(clientId);

        AppStore.setCurrentClientId(clientId);

        const history = await Api.getClientHistory(clientId);
        const appointments = await Api.getAppointments();
        const newAppointments = appointments.filter(a => a.client === client.name);

        const allAppointments = [
            ...newAppointments.map(a => ({
                date: a.date,
                time: a.time,
                services: a.services,
                products: a.products,
                status: a.status
            })),
            ...history
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        document.getElementById('profileClientName').textContent = client.name;
        document.getElementById('profileAvatar').textContent = getInitials(client.name);

        document.getElementById('profileInterest').textContent = client.primaryInterest;
        document.getElementById('profileTotalVisits').textContent = client.totalVisits + newAppointments.filter(a => a.status === 'Completed').length;
        document.getElementById('profileLastVisit').textContent = allAppointments.length > 0 ? formatDate(allAppointments[0].date) : '-';

        document.getElementById('profilePreferences').textContent = client.preferences;
        document.getElementById('profileIssues').textContent = client.issues;

        const tagsContainer = document.getElementById('profileTags');
        tagsContainer.innerHTML = client.tags.map(tag => {
            const tagClass = getTagClass(tag);
            return `<span class="client-tag ${tagClass}">${tag}</span>`;
        }).join('');

        renderClientHistory(allAppointments);
        renderClientInsights(client, allAppointments);
        renderSuggestedServices(client);

        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById('client-profile').classList.add('active');

        document.querySelectorAll('.nav-item').forEach(nav => {
            const link = nav.querySelector('a');
            if (link && link.getAttribute('href') === '#clients') {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });
    } catch (error) {
        console.error('Error loading client profile:', error);
        showNotification('Error loading client profile');
    }
}

function renderClientHistory(appointments) {
    const tbody = document.getElementById('clientHistoryBody');
    const countBadge = document.getElementById('historyCount');

    if (!tbody) return;

    countBadge.textContent = `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''}`;

    tbody.innerHTML = '';

    if (appointments.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="4">
                    <div class="empty-state">
                        <span class="empty-icon">📅</span>
                        <p>No appointment history yet.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const displayAppointments = appointments.slice(0, 6);

    displayAppointments.forEach(apt => {
        const row = document.createElement('tr');

        const serviceTags = apt.services.map(s =>
            `<span class="service-tag">${s}</span>`
        ).join('');

        const productTags = apt.products.length > 0
            ? apt.products.map(p => `<span class="product-tag">${p}</span>`).join('')
            : '<span class="no-products">None</span>';

        const statusClass = apt.status.toLowerCase().replace(' ', '-');

        row.innerHTML = `
            <td>
                <div class="datetime-cell">
                    <span class="date">${formatDate(apt.date)}</span>
                    <span class="time">${formatTime(apt.time)}</span>
                </div>
            </td>
            <td><div class="tags-cell">${serviceTags}</div></td>
            <td><div class="tags-cell">${productTags}</div></td>
            <td><span class="status ${statusClass}">${apt.status}</span></td>
        `;

        tbody.appendChild(row);
    });
}

function renderClientInsights(client, appointments) {
    const completedApts = appointments.filter(a => a.status === 'Completed');
    const avgTicket = completedApts.length > 0 ? Math.round(45 + Math.random() * 60) : 0;
    document.getElementById('insightAvgTicket').textContent = avgTicket > 0 ? `${avgTicket} €` : '-';

    const serviceCounts = {};
    completedApts.forEach(apt => {
        apt.services.forEach(s => {
            serviceCounts[s] = (serviceCounts[s] || 0) + 1;
        });
    });
    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('insightTopService').textContent = topService ? topService[0] : '-';

    let productCount = 0;
    completedApts.forEach(apt => {
        productCount += apt.products.length;
    });
    document.getElementById('insightProductCount').textContent = productCount;

    const aptsWithProducts = completedApts.filter(a => a.products.length > 0).length;
    const crossSellRate = completedApts.length > 0 ? Math.round((aptsWithProducts / completedApts.length) * 100) : 0;
    document.getElementById('insightCrossSell').textContent = `${crossSellRate}%`;
}

function renderSuggestedServices(client) {
    const container = document.getElementById('suggestedServices');
    if (!container) return;

    const suggestions = [];

    if (client.issues.toLowerCase().includes('dry scalp')) {
        suggestions.push({ name: 'Scalp Treatment', reason: 'Addresses dry scalp issues' });
    }
    if (client.issues.toLowerCase().includes('dandruff')) {
        suggestions.push({ name: 'Scalp Treatment', reason: 'Helps with dandruff' });
    }
    if (client.issues.toLowerCase().includes('damaged') || client.issues.toLowerCase().includes('bleach')) {
        suggestions.push({ name: 'Deep Conditioning', reason: 'Repairs damaged hair' });
    }
    if (client.tags.includes('Beard Care') && !client.tags.includes('Skincare')) {
        suggestions.push({ name: 'Facial Treatment', reason: 'Complement beard grooming with skincare' });
    }
    if (client.tags.includes('Hair Color')) {
        suggestions.push({ name: 'Olaplex Treatment', reason: 'Protect color-treated hair' });
    }
    if (client.tags.includes('Nails')) {
        suggestions.push({ name: 'Pedicure', reason: 'Complete nail care package' });
    }

    if (suggestions.length === 0) {
        suggestions.push({ name: 'Deep Conditioning', reason: 'Maintains healthy hair' });
    }

    container.innerHTML = suggestions.slice(0, 3).map(s => `
        <div class="suggested-item">
            <span class="suggested-name">${s.name}</span>
            <span class="suggested-reason">${s.reason}</span>
        </div>
    `).join('');
}

// =====================
// HELPER FUNCTIONS
// =====================

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function getInitials(name) {
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0] === 'Client') {
        return 'C' + parts[1].substring(0, 1);
    }
    return name.substring(0, 2).toUpperCase();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =====================
// SERVICES CATALOG FUNCTIONS
// =====================

function initServicesCatalog() {
    renderServicesTable();
    initServiceModal();
}

async function renderServicesTable() {
    const tbody = document.getElementById('servicesTableBody');
    const countBadge = document.getElementById('serviceCount');

    if (!tbody) return;

    if (!isLoading.services) {
        isLoading.services = true;
        showLoading('servicesTableBody', 'Loading services...');
    }

    try {
        const services = await Api.getServices();
        const count = services.length;
        countBadge.textContent = `${count} service${count !== 1 ? 's' : ''}`;

        tbody.innerHTML = '';

        if (services.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state-row">
                    <td colspan="5">
                        <div class="empty-state">
                            <span class="empty-icon">💇</span>
                            <p>No services yet. Click "+ Add Service" to create one.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        services.forEach(service => {
            const row = document.createElement('tr');
            const categoryClass = getCategoryClass(service.category);

            row.innerHTML = `
                <td>
                    <span class="catalog-item-name">${service.name}</span>
                </td>
                <td>
                    <span class="category-badge ${categoryClass}">${service.category}</span>
                </td>
                <td>${service.duration} min</td>
                <td class="price-cell">${service.price.toFixed(2)} €</td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${service.active ? 'checked' : ''}
                               onchange="toggleServiceActive(${service.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </td>
            `;

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading services:', error);
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="5">
                    <div class="empty-state error">
                        <span class="empty-icon">⚠️</span>
                        <p>Error loading services.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

function initServiceModal() {
    const modal = document.getElementById('serviceModalOverlay');
    const openBtn = document.getElementById('openServiceModal');
    const closeBtn = document.getElementById('closeServiceModal');
    const cancelBtn = document.getElementById('cancelService');
    const form = document.getElementById('serviceForm');

    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', function() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        form.reset();
        document.getElementById('serviceActive').checked = true;
    });

    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addService();
    });
}

async function addService() {
    const name = document.getElementById('serviceName').value.trim();
    const category = document.getElementById('serviceCategory').value;
    const duration = parseInt(document.getElementById('serviceDuration').value) || 30;
    const price = parseFloat(document.getElementById('servicePrice').value);
    const active = document.getElementById('serviceActive').checked;

    if (!name || isNaN(price)) {
        alert('Please fill in required fields (Name and Price).');
        return;
    }

    try {
        await Api.createService({
            name,
            category,
            duration,
            price,
            active
        });

        await renderServicesTable();
        updateAppointmentFormSelections();

        document.getElementById('serviceModalOverlay').classList.remove('active');
        document.body.style.overflow = '';

        showNotification(`Service "${name}" added successfully!`);
    } catch (error) {
        console.error('Error creating service:', error);
        showNotification('Error creating service: ' + error.message);
    }
}

async function toggleServiceActive(serviceId, isActive) {
    try {
        const service = await Api.toggleServiceActive(serviceId, isActive);
        if (service) {
            updateAppointmentFormSelections();
            showNotification(`${service.name} ${isActive ? 'activated' : 'deactivated'}`);
        }
    } catch (error) {
        console.error('Error toggling service:', error);
        showNotification('Error updating service');
        await renderServicesTable(); // Revert UI
    }
}

// =====================
// PRODUCTS CATALOG FUNCTIONS
// =====================

function initProductsCatalog() {
    renderProductsTable();
    initProductModal();
}

async function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    const countBadge = document.getElementById('productCount');

    if (!tbody) return;

    if (!isLoading.products) {
        isLoading.products = true;
        showLoading('productsTableBody', 'Loading products...');
    }

    try {
        const products = await Api.getProducts();
        const count = products.length;
        countBadge.textContent = `${count} product${count !== 1 ? 's' : ''}`;

        tbody.innerHTML = '';

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state-row">
                    <td colspan="5">
                        <div class="empty-state">
                            <span class="empty-icon">🧴</span>
                            <p>No products yet. Click "+ Add Product" to create one.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');
            const categoryClass = getCategoryClass(product.category);
            const useCaseClass = getUseCaseClass(product.useCase);

            row.innerHTML = `
                <td>
                    <span class="catalog-item-name">${product.name}</span>
                </td>
                <td>
                    <span class="category-badge ${categoryClass}">${product.category}</span>
                </td>
                <td class="price-cell">${product.price.toFixed(2)} €</td>
                <td>
                    <span class="usecase-badge ${useCaseClass}">${product.useCase}</span>
                </td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" ${product.active ? 'checked' : ''}
                               onchange="toggleProductActive(${product.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </td>
            `;

            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="5">
                    <div class="empty-state error">
                        <span class="empty-icon">⚠️</span>
                        <p>Error loading products.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

function initProductModal() {
    const modal = document.getElementById('productModalOverlay');
    const openBtn = document.getElementById('openProductModal');
    const closeBtn = document.getElementById('closeProductModal');
    const cancelBtn = document.getElementById('cancelProduct');
    const form = document.getElementById('productForm');
    const useCaseSelect = document.getElementById('productUseCase');
    const customUseCaseGroup = document.getElementById('customUseCaseGroup');

    if (!modal || !openBtn) return;

    openBtn.addEventListener('click', function() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        form.reset();
        document.getElementById('productActive').checked = true;
        customUseCaseGroup.style.display = 'none';
    });

    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    useCaseSelect.addEventListener('change', function() {
        if (this.value === 'Custom') {
            customUseCaseGroup.style.display = 'block';
        } else {
            customUseCaseGroup.style.display = 'none';
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
    });
}

async function addProduct() {
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    let useCase = document.getElementById('productUseCase').value;
    const customUseCase = document.getElementById('productUseCaseCustom').value.trim();
    const active = document.getElementById('productActive').checked;

    if (!name || isNaN(price)) {
        alert('Please fill in required fields (Name and Price).');
        return;
    }

    if (useCase === 'Custom' && customUseCase) {
        useCase = customUseCase;
    } else if (useCase === 'Custom') {
        useCase = 'Other';
    }

    try {
        await Api.createProduct({
            name,
            category,
            price,
            useCase,
            active
        });

        await renderProductsTable();
        updateAppointmentFormSelections();

        document.getElementById('productModalOverlay').classList.remove('active');
        document.body.style.overflow = '';

        showNotification(`Product "${name}" added successfully!`);
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification('Error creating product: ' + error.message);
    }
}

async function toggleProductActive(productId, isActive) {
    try {
        const product = await Api.toggleProductActive(productId, isActive);
        if (product) {
            updateAppointmentFormSelections();
            showNotification(`${product.name} ${isActive ? 'activated' : 'deactivated'}`);
        }
    } catch (error) {
        console.error('Error toggling product:', error);
        showNotification('Error updating product');
        await renderProductsTable(); // Revert UI
    }
}

// =====================
// CATALOG HELPER FUNCTIONS
// =====================

function getCategoryClass(category) {
    const classes = {
        'Hair': 'cat-hair',
        'Beard': 'cat-beard',
        'Skin': 'cat-skin',
        'Nails': 'cat-nails'
    };
    return classes[category] || 'cat-default';
}

function getUseCaseClass(useCase) {
    const classes = {
        'Hold': 'uc-hold',
        'Hydration': 'uc-hydration',
        'Repair': 'uc-repair',
        'Anti-dandruff': 'uc-antidandruff',
        'SPF': 'uc-spf'
    };
    return classes[useCase] || 'uc-default';
}

// =====================
// UPDATE APPOINTMENT FORM WITH CATALOG DATA
// =====================

function updateAppointmentFormSelections() {
    updateServicesCheckboxes();
    updateProductsCheckboxes();
    updateStylistsDropdown();
}

function updateServicesCheckboxes() {
    const container = document.getElementById('servicesCheckboxes');
    if (!container) return;

    const activeServices = AppStore.getActiveServices();

    container.innerHTML = activeServices.map(service => `
        <label class="checkbox-item">
            <input type="checkbox" name="services" value="${service.name}">
            <span>${service.name}</span>
        </label>
    `).join('');
}

function updateProductsCheckboxes() {
    const container = document.getElementById('productsCheckboxes');
    if (!container) return;

    const activeProducts = AppStore.getActiveProducts();

    container.innerHTML = activeProducts.map(product => `
        <label class="checkbox-item">
            <input type="checkbox" name="products" value="${product.name}">
            <span>${product.name}</span>
        </label>
    `).join('');
}

function updateStylistsDropdown() {
    const select = document.getElementById('appointmentStylist');
    if (!select) return;

    const stylists = AppStore.getActivestylists();

    select.innerHTML = '<option value="">Select a stylist...</option>' +
        stylists.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
}

// =====================
// RECOMMENDATIONS PAGE
// =====================

function initRecommendationsPage() {
    initRulesTabs();
    renderServiceRules();
    renderProductRules();
    initRuleModal();
}

function initRulesTabs() {
    const tabs = document.querySelectorAll('.rules-tab');
    const sections = document.querySelectorAll('.rules-section');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetId = this.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
}

async function renderServiceRules() {
    const container = document.getElementById('serviceRulesList');
    if (!container) return;

    if (!isLoading.rules) {
        isLoading.rules = true;
        showLoadingDiv('serviceRulesList', 'Loading rules...');
    }

    try {
        const serviceRules = await Api.getServiceRules();

        if (serviceRules.length === 0) {
            container.innerHTML = `
                <div class="empty-rules">
                    <span class="empty-icon">💡</span>
                    <p>No service rules yet. Click "+ Add Rule" to create one.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = serviceRules.map(rule => `
            <div class="rule-card ${rule.active ? '' : 'inactive'}" data-rule-id="${rule.id}" data-rule-type="service">
                <div class="rule-content">
                    <div class="rule-trigger">
                        <span class="rule-label">When:</span>
                        <span class="rule-service">${rule.trigger}</span>
                    </div>
                    <div class="rule-arrow">→</div>
                    <div class="rule-suggestions">
                        <span class="rule-label">Suggest:</span>
                        <div class="rule-items">
                            ${rule.suggestions.map(s => `<span class="rule-item service-item">${s}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="rule-reason">
                    <span class="reason-icon">💡</span>
                    <span>${rule.reason || 'No reason specified'}</span>
                </div>
                <div class="rule-actions">
                    <label class="toggle-switch">
                        <input type="checkbox" ${rule.active ? 'checked' : ''}
                               onchange="toggleRuleActive(${rule.id}, 'service', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                    <button class="btn-icon" onclick="editRule(${rule.id}, 'service')" title="Edit">
                        <span>✏️</span>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteRule(${rule.id}, 'service')" title="Delete">
                        <span>🗑️</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading service rules:', error);
        container.innerHTML = `
            <div class="empty-rules error">
                <span class="empty-icon">⚠️</span>
                <p>Error loading rules.</p>
            </div>
        `;
    }
}

async function renderProductRules() {
    const container = document.getElementById('productRulesList');
    if (!container) return;

    try {
        const productRules = await Api.getProductRules();

        if (productRules.length === 0) {
            container.innerHTML = `
                <div class="empty-rules">
                    <span class="empty-icon">🧴</span>
                    <p>No product rules yet. Click "+ Add Rule" to create one.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productRules.map(rule => `
            <div class="rule-card ${rule.active ? '' : 'inactive'}" data-rule-id="${rule.id}" data-rule-type="product">
                <div class="rule-content">
                    <div class="rule-trigger">
                        <span class="rule-label">When:</span>
                        <span class="rule-service">${rule.trigger}</span>
                    </div>
                    <div class="rule-arrow">→</div>
                    <div class="rule-suggestions">
                        <span class="rule-label">Suggest:</span>
                        <div class="rule-items">
                            ${rule.suggestions.map(s => `<span class="rule-item product-item">${s}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="rule-reason">
                    <span class="reason-icon">💡</span>
                    <span>${rule.reason || 'No reason specified'}</span>
                </div>
                <div class="rule-actions">
                    <label class="toggle-switch">
                        <input type="checkbox" ${rule.active ? 'checked' : ''}
                               onchange="toggleRuleActive(${rule.id}, 'product', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                    <button class="btn-icon" onclick="editRule(${rule.id}, 'product')" title="Edit">
                        <span>✏️</span>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteRule(${rule.id}, 'product')" title="Delete">
                        <span>🗑️</span>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading product rules:', error);
        container.innerHTML = `
            <div class="empty-rules error">
                <span class="empty-icon">⚠️</span>
                <p>Error loading rules.</p>
            </div>
        `;
    }
}

function initRuleModal() {
    const modal = document.getElementById('ruleModalOverlay');
    const addServiceBtn = document.getElementById('addServiceRule');
    const addProductBtn = document.getElementById('addProductRule');
    const closeBtn = document.getElementById('closeRuleModal');
    const cancelBtn = document.getElementById('cancelRule');
    const form = document.getElementById('ruleForm');

    if (!modal) return;

    addServiceBtn?.addEventListener('click', () => openRuleModal('service'));
    addProductBtn?.addEventListener('click', () => openRuleModal('product'));

    closeBtn?.addEventListener('click', closeRuleModal);
    cancelBtn?.addEventListener('click', closeRuleModal);

    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeRuleModal();
    });

    form?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveRule();
    });
}

function openRuleModal(type, ruleId = null) {
    const modal = document.getElementById('ruleModalOverlay');
    const titleEl = document.getElementById('ruleModalTitle');
    const typeInput = document.getElementById('ruleType');
    const idInput = document.getElementById('ruleId');
    const triggerSelect = document.getElementById('ruleTrigger');
    const suggestionsGrid = document.getElementById('ruleSuggestionsGrid');
    const suggestionsLabel = document.getElementById('ruleSuggestionsLabel');
    const reasonInput = document.getElementById('ruleReason');
    const activeCheckbox = document.getElementById('ruleActive');
    const saveBtn = document.getElementById('saveRuleBtn');

    const activeServices = AppStore.getActiveServices();
    const activeProducts = AppStore.getActiveProducts();

    typeInput.value = type;

    triggerSelect.innerHTML = '<option value="">Select a service...</option>' +
        activeServices.map(s => `<option value="${s.name}">${s.name}</option>`).join('');

    if (type === 'service') {
        suggestionsLabel.textContent = 'Suggest these services:';
        suggestionsGrid.innerHTML = activeServices.map(s => `
            <label class="checkbox-item">
                <input type="checkbox" name="suggestions" value="${s.name}">
                <span>${s.name}</span>
            </label>
        `).join('');
    } else {
        suggestionsLabel.textContent = 'Suggest these products:';
        suggestionsGrid.innerHTML = activeProducts.map(p => `
            <label class="checkbox-item">
                <input type="checkbox" name="suggestions" value="${p.name}">
                <span>${p.name}</span>
            </label>
        `).join('');
    }

    if (ruleId) {
        const rule = type === 'service'
            ? AppStore.getServiceRule(ruleId)
            : AppStore.getProductRule(ruleId);

        if (rule) {
            titleEl.textContent = 'Edit Rule';
            saveBtn.textContent = 'Update Rule';
            idInput.value = rule.id;
            triggerSelect.value = rule.trigger;
            reasonInput.value = rule.reason || '';
            activeCheckbox.checked = rule.active;

            rule.suggestions.forEach(suggestion => {
                const checkbox = suggestionsGrid.querySelector(`input[value="${suggestion}"]`);
                if (checkbox) checkbox.checked = true;
            });

            AppStore.setCurrentEditingRule({ id: ruleId, type });
        }
    } else {
        titleEl.textContent = type === 'service' ? 'Add Service Rule' : 'Add Product Rule';
        saveBtn.textContent = 'Save Rule';
        idInput.value = '';
        triggerSelect.value = '';
        reasonInput.value = '';
        activeCheckbox.checked = true;
        AppStore.setCurrentEditingRule(null);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRuleModal() {
    const modal = document.getElementById('ruleModalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    AppStore.setCurrentEditingRule(null);
    document.getElementById('ruleForm').reset();
}

async function saveRule() {
    const type = document.getElementById('ruleType').value;
    const idInput = document.getElementById('ruleId').value;
    const trigger = document.getElementById('ruleTrigger').value;
    const reason = document.getElementById('ruleReason').value.trim();
    const active = document.getElementById('ruleActive').checked;

    const suggestionCheckboxes = document.querySelectorAll('#ruleSuggestionsGrid input[name="suggestions"]:checked');
    const suggestions = Array.from(suggestionCheckboxes).map(cb => cb.value);

    if (!trigger) {
        alert('Please select a trigger service.');
        return;
    }

    if (suggestions.length === 0) {
        alert('Please select at least one suggestion.');
        return;
    }

    try {
        if (idInput) {
            // Update existing rule
            if (type === 'service') {
                await Api.updateServiceRule(parseInt(idInput), { trigger, suggestions, reason, active });
            } else {
                await Api.updateProductRule(parseInt(idInput), { trigger, suggestions, reason, active });
            }
            showNotification('Rule updated successfully!');
        } else {
            // Create new rule
            if (type === 'service') {
                await Api.createServiceRule({ trigger, suggestions, reason, active });
            } else {
                await Api.createProductRule({ trigger, suggestions, reason, active });
            }
            showNotification('Rule created successfully!');
        }

        // Re-render and close
        if (type === 'service') {
            await renderServiceRules();
        } else {
            await renderProductRules();
        }

        closeRuleModal();
    } catch (error) {
        console.error('Error saving rule:', error);
        showNotification('Error saving rule: ' + error.message);
    }
}

function editRule(ruleId, type) {
    openRuleModal(type, ruleId);
}

async function deleteRule(ruleId, type) {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
        if (type === 'service') {
            await Api.deleteServiceRule(ruleId);
            await renderServiceRules();
        } else {
            await Api.deleteProductRule(ruleId);
            await renderProductRules();
        }

        showNotification('Rule deleted');
    } catch (error) {
        console.error('Error deleting rule:', error);
        showNotification('Error deleting rule');
    }
}

async function toggleRuleActive(ruleId, type, isActive) {
    try {
        if (type === 'service') {
            await Api.toggleServiceRuleActive(ruleId, isActive);
        } else {
            await Api.toggleProductRuleActive(ruleId, isActive);
        }
        showNotification(`Rule ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
        console.error('Error toggling rule:', error);
        showNotification('Error updating rule');
        // Revert UI
        if (type === 'service') {
            await renderServiceRules();
        } else {
            await renderProductRules();
        }
    }
}

// =====================
// ANALYTICS PAGE
// =====================

function initAnalyticsPage() {
    updateAnalytics();

    document.querySelectorAll('.nav-item a[href="#analytics"]').forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(updateAnalytics, 100);
        });
    });
}

async function updateAnalytics() {
    try {
        const data = await Api.getAnalyticsData();

        calculateAndRenderKPIs(data.appointments, data.tracking, data.services, data.products);
        renderRevenueSplitChart(data.appointments, data.services, data.products);
        renderCrossSellTrendChart(data.appointments);
        renderCrossSellCombosTable(data.appointments, data.services, data.products);
        renderRecsPerformanceTable(data.tracking);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function calculateAndRenderKPIs(allAppointments, tracking, services, products) {
    const completed = allAppointments.filter(a => a.status === 'Completed');

    let totalServiceRevenue = 0;
    let totalProductRevenue = 0;

    const getServicePrice = (name) => {
        const service = services.find(s => s.name === name);
        return service ? service.price : 40;
    };

    const getProductPrice = (name) => {
        const product = products.find(p => p.name === name);
        return product ? product.price : 20;
    };

    completed.forEach(apt => {
        apt.services.forEach(s => totalServiceRevenue += getServicePrice(s));
        apt.products.forEach(p => totalProductRevenue += getProductPrice(p));
    });

    const totalRevenue = totalServiceRevenue + totalProductRevenue;
    document.getElementById('kpiTotalRevenue').textContent = `€${totalRevenue.toLocaleString()}`;

    const avgTicket = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;
    document.getElementById('kpiAvgTicket').textContent = `€${avgTicket}`;

    const crossSellCount = completed.filter(apt =>
        apt.products.length > 0 || apt.services.length > 1
    ).length;
    const crossSellRate = completed.length > 0
        ? Math.round((crossSellCount / completed.length) * 100)
        : 0;
    document.getElementById('kpiCrossSellRate').textContent = `${crossSellRate}%`;

    let totalShown = 0;
    let totalAccepted = 0;
    Object.values(tracking).forEach(data => {
        totalShown += data.shown;
        totalAccepted += data.accepted;
    });
    const acceptanceRate = totalShown > 0
        ? Math.round((totalAccepted / totalShown) * 100)
        : 0;
    document.getElementById('kpiAcceptanceRate').textContent = `${acceptanceRate}%`;
}

function renderRevenueSplitChart(allAppointments, services, products) {
    const container = document.getElementById('revenueSplitChart');
    if (!container) return;

    const completed = allAppointments.filter(a => a.status === 'Completed');

    const getServicePrice = (name) => {
        const service = services.find(s => s.name === name);
        return service ? service.price : 40;
    };

    const getProductPrice = (name) => {
        const product = products.find(p => p.name === name);
        return product ? product.price : 20;
    };

    let serviceRevenue = 0;
    let productRevenue = 0;

    completed.forEach(apt => {
        apt.services.forEach(s => serviceRevenue += getServicePrice(s));
        apt.products.forEach(p => productRevenue += getProductPrice(p));
    });

    const total = serviceRevenue + productRevenue;
    const servicePercent = total > 0 ? Math.round((serviceRevenue / total) * 100) : 0;
    const productPercent = total > 0 ? Math.round((productRevenue / total) * 100) : 0;

    container.innerHTML = `
        <div class="revenue-split-chart">
            <div class="split-bar">
                <div class="split-segment services" style="width: ${servicePercent}%"></div>
                <div class="split-segment products" style="width: ${productPercent}%"></div>
            </div>
            <div class="split-legend">
                <div class="legend-item">
                    <span class="legend-color services"></span>
                    <span class="legend-label">Services</span>
                    <span class="legend-value">€${serviceRevenue.toLocaleString()} (${servicePercent}%)</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color products"></span>
                    <span class="legend-label">Products</span>
                    <span class="legend-value">€${productRevenue.toLocaleString()} (${productPercent}%)</span>
                </div>
            </div>
        </div>
    `;
}

function renderCrossSellTrendChart(allAppointments) {
    const container = document.getElementById('crossSellTrendChart');
    if (!container) return;

    const days = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push({
            date: date.toISOString().split('T')[0],
            label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
        });
    }

    const dailyData = days.map(day => {
        const dayAppointments = allAppointments.filter(apt =>
            apt.date === day.date && apt.status === 'Completed'
        );
        const crossSellCount = dayAppointments.filter(apt =>
            apt.products.length > 0 || apt.services.length > 1
        ).length;
        return { ...day, count: crossSellCount, total: dayAppointments.length };
    });

    const maxCount = Math.max(...dailyData.map(d => d.count), 5);

    container.innerHTML = `
        <div class="trend-chart">
            <div class="trend-bars">
                ${dailyData.map(d => `
                    <div class="trend-bar-wrapper" title="${d.label}: ${d.count} cross-sells">
                        <div class="trend-bar" style="height: ${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%">
                            <span class="trend-value">${d.count}</span>
                        </div>
                        <span class="trend-label">${d.label.split(' ')[0]}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderCrossSellCombosTable(allAppointments, services, products) {
    const tbody = document.getElementById('crossSellCombosBody');
    const countBadge = document.getElementById('combosCount');
    if (!tbody) return;

    const completed = allAppointments.filter(a => a.status === 'Completed');

    const getServicePrice = (name) => {
        const service = services.find(s => s.name === name);
        return service ? service.price : 40;
    };

    const getProductPrice = (name) => {
        const product = products.find(p => p.name === name);
        return product ? product.price : 20;
    };

    const combos = {};

    completed.forEach(apt => {
        apt.services.forEach(service => {
            apt.products.forEach(product => {
                const key = `${service} → ${product}`;
                if (!combos[key]) {
                    combos[key] = {
                        service,
                        product,
                        count: 0,
                        type: 'product',
                        revenue: 0
                    };
                }
                combos[key].count++;
                combos[key].revenue += getProductPrice(product);
            });
        });

        if (apt.services.length > 1) {
            for (let i = 0; i < apt.services.length; i++) {
                for (let j = i + 1; j < apt.services.length; j++) {
                    const key = `${apt.services[i]} + ${apt.services[j]}`;
                    if (!combos[key]) {
                        combos[key] = {
                            service: apt.services[i],
                            addon: apt.services[j],
                            count: 0,
                            type: 'service',
                            revenue: 0
                        };
                    }
                    combos[key].count++;
                    combos[key].revenue += getServicePrice(apt.services[j]);
                }
            }
        }
    });

    const sortedCombos = Object.entries(combos)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8);

    countBadge.textContent = `${sortedCombos.length} combos`;

    if (sortedCombos.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="3">
                    <div class="empty-state">
                        <span class="empty-icon">📊</span>
                        <p>No cross-sell data yet.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sortedCombos.map(([key, data]) => `
        <tr>
            <td>
                <div class="combo-cell">
                    <span class="combo-text">${key}</span>
                    <span class="combo-type ${data.type}">${data.type === 'product' ? 'Retail' : 'Add-on'}</span>
                </div>
            </td>
            <td>
                <span class="combo-count">${data.count}</span>
            </td>
            <td>
                <span class="combo-revenue">€${data.revenue.toLocaleString()}</span>
            </td>
        </tr>
    `).join('');
}

function renderRecsPerformanceTable(tracking) {
    const tbody = document.getElementById('recsPerformanceBody');
    const countBadge = document.getElementById('recsCount');
    if (!tbody) return;

    const sortedRecs = Object.entries(tracking)
        .filter(([_, data]) => data.shown > 0)
        .sort((a, b) => b[1].shown - a[1].shown)
        .slice(0, 10);

    countBadge.textContent = `${sortedRecs.length} items`;

    if (sortedRecs.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state-row">
                <td colspan="5">
                    <div class="empty-state">
                        <span class="empty-icon">💡</span>
                        <p>No recommendation data yet.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sortedRecs.map(([name, data]) => {
        const rate = data.shown > 0 ? Math.round((data.accepted / data.shown) * 100) : 0;
        const rateClass = rate >= 50 ? 'high' : rate >= 25 ? 'medium' : 'low';

        return `
            <tr>
                <td><span class="rec-item-name">${name}</span></td>
                <td><span class="rec-type-badge ${data.type}">${data.type}</span></td>
                <td>${data.shown}</td>
                <td>${data.accepted}</td>
                <td>
                    <div class="rate-cell">
                        <div class="rate-bar-bg">
                            <div class="rate-bar ${rateClass}" style="width: ${rate}%"></div>
                        </div>
                        <span class="rate-value">${rate}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// =====================
// OUTREACH PAGE
// =====================

function initOutreachPage() {
    initOutreachTabs();
    initOutreachModals();
    initOutreachButtons();
    loadOutreachData();
}

function initOutreachTabs() {
    const tabs = document.querySelectorAll('.outreach-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.dataset.filter;

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            outreachState.currentFilter = filter;
            renderOutreachSuggestions();
        });
    });
}

function initOutreachModals() {
    // Email Preview Modal
    const previewModal = document.getElementById('emailPreviewModalOverlay');
    const closePreviewBtn = document.getElementById('closeEmailPreviewModal');
    const sendBtn = document.getElementById('sendEmailSuggestion');
    const dismissBtn = document.getElementById('dismissEmailSuggestion');

    closePreviewBtn?.addEventListener('click', closeEmailPreviewModal);
    previewModal?.addEventListener('click', function(e) {
        if (e.target === previewModal) closeEmailPreviewModal();
    });

    sendBtn?.addEventListener('click', sendCurrentSuggestion);
    dismissBtn?.addEventListener('click', dismissCurrentSuggestion);

    // Settings Modal
    const settingsModal = document.getElementById('outreachSettingsModalOverlay');
    const openSettingsBtn = document.getElementById('openOutreachSettings');
    const closeSettingsBtn = document.getElementById('closeOutreachSettingsModal');
    const cancelSettingsBtn = document.getElementById('cancelOutreachSettings');
    const settingsForm = document.getElementById('outreachSettingsForm');

    openSettingsBtn?.addEventListener('click', openOutreachSettingsModal);
    closeSettingsBtn?.addEventListener('click', closeOutreachSettingsModal);
    cancelSettingsBtn?.addEventListener('click', closeOutreachSettingsModal);

    settingsModal?.addEventListener('click', function(e) {
        if (e.target === settingsModal) closeOutreachSettingsModal();
    });

    settingsForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveOutreachSettings();
    });
}

function initOutreachButtons() {
    const generateBtn = document.getElementById('generateSuggestions');
    generateBtn?.addEventListener('click', generateSuggestions);
}

async function loadOutreachData() {
    await Promise.all([
        loadOutreachStats(),
        loadOutreachSuggestions()
    ]);
}

async function loadOutreachStats() {
    try {
        const stats = await Api.getOutreachStats();

        document.getElementById('outreachPending').textContent = stats.pending || 0;
        document.getElementById('outreachSentWeek').textContent = stats.sentThisWeek || 0;
        document.getElementById('outreachSentMonth').textContent = stats.sentThisMonth || 0;
        document.getElementById('outreachResponseRate').textContent = `${stats.responseRate || 0}%`;
    } catch (error) {
        console.error('Error loading outreach stats:', error);
    }
}

async function loadOutreachSuggestions() {
    const container = document.getElementById('outreachSuggestionsList');
    if (!container) return;

    if (!isLoading.outreach) {
        isLoading.outreach = true;
        container.innerHTML = `
            <div class="loading-state">
                <span class="loading-spinner"></span>
                <span>Loading suggestions...</span>
            </div>
        `;
    }

    try {
        const filter = outreachState.currentFilter === 'all' ? null : outreachState.currentFilter;
        const suggestions = await Api.getOutreachSuggestions(filter, 'pending');

        AppStore.setOutreachSuggestions(suggestions);
        renderOutreachSuggestions();
    } catch (error) {
        console.error('Error loading outreach suggestions:', error);
        container.innerHTML = `
            <div class="empty-state error">
                <span class="empty-icon">⚠️</span>
                <p>Fehler beim Laden der Vorschläge.</p>
            </div>
        `;
    }
}

function renderOutreachSuggestions() {
    const container = document.getElementById('outreachSuggestionsList');
    if (!container) return;

    let suggestions = AppStore.getOutreachSuggestions() || [];

    // Apply filter
    if (outreachState.currentFilter !== 'all') {
        suggestions = suggestions.filter(s => s.type === outreachState.currentFilter);
    }

    if (suggestions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📧</span>
                <p>Keine Vorschläge vorhanden. Klicken Sie auf "Vorschläge generieren" um E-Mail-Vorschläge zu erstellen.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = suggestions.map(suggestion => {
        const typeLabels = {
            'win_back': 'Win-back',
            'appointment_reminder': 'Erinnerung',
            'product_recommendation': 'Produktempfehlung',
            'promotion': 'Promotion'
        };

        const excerpt = suggestion.content
            ? suggestion.content.substring(0, 120) + (suggestion.content.length > 120 ? '...' : '')
            : '';

        return `
            <div class="suggestion-card" data-suggestion-id="${suggestion.id}">
                <div class="suggestion-card-header">
                    <div class="suggestion-client">
                        <div class="suggestion-avatar">${getInitials(suggestion.clientName)}</div>
                        <div class="suggestion-client-info">
                            <span class="suggestion-client-name">${suggestion.clientName}</span>
                            <span class="suggestion-reason">${suggestion.reason}</span>
                        </div>
                    </div>
                    <span class="suggestion-type-badge ${suggestion.type}">${typeLabels[suggestion.type] || suggestion.type}</span>
                </div>
                <div class="suggestion-preview">
                    <div class="suggestion-subject">${suggestion.subject}</div>
                    <div class="suggestion-excerpt">${excerpt}</div>
                </div>
                <div class="suggestion-actions">
                    <button class="btn-preview" onclick="openEmailPreview(${suggestion.id})">Vorschau & Senden</button>
                    <button class="btn-dismiss-suggestion" onclick="quickDismissSuggestion(${suggestion.id})">Verwerfen</button>
                </div>
            </div>
        `;
    }).join('');
}

async function generateSuggestions() {
    const btn = document.getElementById('generateSuggestions');
    const originalText = btn.textContent;
    btn.textContent = 'Generiere...';
    btn.disabled = true;

    try {
        const result = await Api.generateOutreachSuggestions();

        showNotification(result.message || `${result.generated} Vorschläge generiert`);

        await loadOutreachData();
    } catch (error) {
        console.error('Error generating suggestions:', error);
        showNotification('Fehler beim Generieren der Vorschläge');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function openEmailPreview(suggestionId) {
    try {
        const suggestion = await Api.getOutreachSuggestionById(suggestionId);

        outreachState.currentSuggestionId = suggestionId;

        const typeLabels = {
            'win_back': 'Win-back',
            'appointment_reminder': 'Erinnerung',
            'product_recommendation': 'Produktempfehlung',
            'promotion': 'Promotion'
        };

        document.getElementById('emailPreviewTo').textContent = suggestion.clientName;
        document.getElementById('emailPreviewSubject').textContent = suggestion.subject;

        const typeEl = document.getElementById('emailPreviewType');
        typeEl.textContent = typeLabels[suggestion.type] || suggestion.type;
        typeEl.className = `email-type-badge ${suggestion.type}`;

        document.getElementById('emailPreviewReason').textContent = suggestion.reason;
        document.getElementById('emailPreviewContent').textContent = suggestion.content;

        const modal = document.getElementById('emailPreviewModalOverlay');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading suggestion:', error);
        showNotification('Fehler beim Laden des Vorschlags');
    }
}

function closeEmailPreviewModal() {
    const modal = document.getElementById('emailPreviewModalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    outreachState.currentSuggestionId = null;
}

async function sendCurrentSuggestion() {
    if (!outreachState.currentSuggestionId) return;

    try {
        await Api.sendOutreachSuggestion(outreachState.currentSuggestionId);

        showNotification('E-Mail als gesendet markiert');
        closeEmailPreviewModal();

        await loadOutreachData();
    } catch (error) {
        console.error('Error sending suggestion:', error);
        showNotification('Fehler beim Markieren als gesendet');
    }
}

async function dismissCurrentSuggestion() {
    if (!outreachState.currentSuggestionId) return;

    try {
        await Api.dismissOutreachSuggestion(outreachState.currentSuggestionId);

        showNotification('Vorschlag verworfen');
        closeEmailPreviewModal();

        await loadOutreachData();
    } catch (error) {
        console.error('Error dismissing suggestion:', error);
        showNotification('Fehler beim Verwerfen');
    }
}

async function quickDismissSuggestion(suggestionId) {
    try {
        await Api.dismissOutreachSuggestion(suggestionId);

        showNotification('Vorschlag verworfen');

        await loadOutreachData();
    } catch (error) {
        console.error('Error dismissing suggestion:', error);
        showNotification('Fehler beim Verwerfen');
    }
}

async function openOutreachSettingsModal() {
    try {
        const settings = await Api.getOutreachSettings();

        document.getElementById('winBackThreshold').value = settings.winBackThresholdDays || 30;
        document.getElementById('reminderDays').value = settings.reminderDaysBefore || 2;

        const modal = document.getElementById('outreachSettingsModalOverlay');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error loading settings:', error);
        showNotification('Fehler beim Laden der Einstellungen');
    }
}

function closeOutreachSettingsModal() {
    const modal = document.getElementById('outreachSettingsModalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

async function saveOutreachSettings() {
    const winBackThresholdDays = parseInt(document.getElementById('winBackThreshold').value) || 30;
    const reminderDaysBefore = parseInt(document.getElementById('reminderDays').value) || 2;

    try {
        await Api.updateOutreachSettings({
            winBackThresholdDays,
            reminderDaysBefore
        });

        showNotification('Einstellungen gespeichert');
        closeOutreachSettingsModal();
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Fehler beim Speichern der Einstellungen');
    }
}
