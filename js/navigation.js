/**
 * Sistema de navegación y gestión de pestañas para ObraSmart
 * Maneja la navegación entre las diferentes secciones de la aplicación
 */

class NavigationManager {
    constructor() {
        this.routes = {};
        this.currentTab = null;
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.tabContents = document.querySelectorAll('.tab-content');
    }

    init() {
        this.setupEventListeners();
        return Promise.resolve(); // For async compatibility
    }

    setRoutes(routes) {
        this.routes = routes;
        console.log('Routes configured:', Object.keys(routes));
    }

    setupEventListeners() {
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and contents
        this.navTabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(tabName);

        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');
            this.currentTab = tabName;

            // Execute route handler if exists
            if (this.routes[tabName]) {
                this.routes[tabName]();
            }
        }
    }

    setActiveTab(tabName) {
        this.switchTab(tabName);
    }
}

// Export to window
window.NavigationManager = NavigationManager;

console.log('NavigationManager: Sistema de navegación inicializado correctamente');