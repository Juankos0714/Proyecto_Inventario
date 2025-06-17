/**
 * SISTEMA DE GESTIÓN DE OBRAS - MAIN.JS
 * Punto de entrada principal de la aplicación
 * Inicializa todos los módulos y coordina la funcionalidad
 */

// Estado global de la aplicación
window.AppState = {
    currentView: 'dashboard',
    user: null,
    isInitialized: false,
    modules: {},
    config: {
        autoSave: true,
        notifications: true,
        theme: 'light'
    }
};

/**
 * Clase principal de la aplicación
 */
class MainApp {
    constructor() {
        this.modules = {};
        this.eventListeners = [];
        this.initPromise = null;
    }

    /**
     * Inicialización principal de la aplicación
     */
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._performInit();
        return this.initPromise;
    }

    async _performInit() {
        try {
            console.log('🚀 Iniciando Sistema de Gestión de Obras...');
            
            // 1. Verificar y cargar configuración
            await this.loadConfiguration();
            
            // 2. Inicializar sistema de almacenamiento
            await this.initStorage();
            
            // 3. Cargar datos iniciales
            await this.loadInitialData();
            
            // 4. Inicializar módulos principales
            await this.initModules();
            
            // 5. Configurar navegación
            await this.initNavigation();
            
            // 6. Configurar eventos globales
            this.setupGlobalEvents();
            
            // 7. Configurar sistema de notificaciones
            await this.initNotifications();
            
            // 8. Mostrar vista inicial
            this.showInitialView();
            
            // 9. Marcar como inicializado
            window.AppState.isInitialized = true;
            
            console.log('✅ Aplicación inicializada correctamente');
            this.notifyReady();
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Cargar configuración de la aplicación
     */
    async loadConfiguration() {
        try {
            const savedConfig = localStorage.getItem('app-config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                window.AppState.config = { ...window.AppState.config, ...config };
            }
            
            // Aplicar tema
            document.documentElement.setAttribute('data-theme', window.AppState.config.theme);
            
        } catch (error) {
            console.warn('Error cargando configuración, usando valores por defecto:', error);
        }
    }

    /**
     * Inicializar sistema de almacenamiento
     */
    async initStorage() {
        if (typeof window.StorageManager !== 'undefined') {
            this.modules.storage = new window.StorageManager();
            await this.modules.storage.init();
            window.AppState.modules.storage = this.modules.storage;
        }
    }

    /**
     * Cargar datos iniciales necesarios
     */
    async loadInitialData() {
        try {
            // Cargar datos de obras
            const obras = this.modules.storage?.get('obras') || [];
            window.AppState.obras = obras;
            
            // Cargar datos de materiales
            const materiales = this.modules.storage?.get('materiales') || [];
            window.AppState.materiales = materiales;
            
            // Cargar eventos del calendario
            const eventos = this.modules.storage?.get('eventos') || [];
            window.AppState.eventos = eventos;
            
            console.log(`📊 Datos cargados: ${obras.length} obras, ${materiales.length} materiales, ${eventos.length} eventos`);
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    /**
     * Inicializar todos los módulos de la aplicación
     */
    async initModules() {
        const modulePromises = [];

        // Inicializar Navigation
        if (typeof window.NavigationManager !== 'undefined') {
            this.modules.navigation = new window.NavigationManager();
            modulePromises.push(this.modules.navigation.init());
        }

        // Inicializar Quick Actions
        if (typeof window.QuickActionsManager !== 'undefined') {
            this.modules.quickActions = new window.QuickActionsManager();
            modulePromises.push(this.modules.quickActions.init());
        }

        // Inicializar Form Obras
        if (typeof window.FormObrasManager !== 'undefined') {
            this.modules.formObras = new window.FormObrasManager();
            modulePromises.push(this.modules.formObras.init());
        }

        // Inicializar Form Materiales
        if (typeof window.FormMaterialesManager !== 'undefined') {
            this.modules.formMateriales = new window.FormMaterialesManager();
            modulePromises.push(this.modules.formMateriales.init());
        }

        // Inicializar File Upload
        if (typeof window.FileUploadManager !== 'undefined') {
            this.modules.fileUpload = new window.FileUploadManager();
            modulePromises.push(this.modules.fileUpload.init());
        }

        // Inicializar Chat IA
        if (typeof window.ChatIAManager !== 'undefined') {
            this.modules.chatIA = new window.ChatIAManager();
            modulePromises.push(this.modules.chatIA.init());
        }

        // Inicializar Calendario
        if (typeof window.CalendarioManager !== 'undefined') {
            this.modules.calendario = new window.CalendarioManager();
            modulePromises.push(this.modules.calendario.init());
        }

        // Esperar a que todos los módulos se inicialicen
        await Promise.all(modulePromises);
        
        // Guardar referencia en el estado global
        window.AppState.modules = this.modules;
        
        console.log('📦 Módulos inicializados:', Object.keys(this.modules));
    }

    /**
     * Inicializar sistema de navegación
     */
    async initNavigation() {
        if (this.modules.navigation) {
            // Configurar rutas
            this.modules.navigation.setRoutes({
                'dashboard': () => this.showView('dashboard'),
                'obras': () => this.showView('obras'),
                'materiales': () => this.showView('materiales'),
                'calendario': () => this.showView('calendario'),
                'chat-ia': () => this.showView('chat-ia')
            });

            // Manejar navegación por URL
            this.handleUrlNavigation();
        }
    }

    /**
     * Configurar eventos globales
     */
    setupGlobalEvents() {
        // Evento de cambio de pestaña
        document.addEventListener('tab-change', (e) => {
            this.handleTabChange(e.detail.tab);
        });

        // Evento de guardado automático
        if (window.AppState.config.autoSave) {
            this.setupAutoSave();
        }

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyPress(e);
        });

        // Evento antes de cerrar ventana
        window.addEventListener('beforeunload', (e) => {
            this.handleBeforeUnload(e);
        });

        // Eventos de visibilidad de página
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Evento de redimensión de ventana
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });
    }

    /**
     * Inicializar sistema de notificaciones
     */
    async initNotifications() {
        if (typeof window.NotificacionesManager !== 'undefined') {
            this.modules.notificaciones = new window.NotificacionesManager();
            await this.modules.notificaciones.init();
            window.AppState.modules.notificaciones = this.modules.notificaciones;
        }
    }

    /**
     * Mostrar vista inicial
     */
    showInitialView() {
        const urlParams = new URLSearchParams(window.location.search);
        const initialView = urlParams.get('view') || 'dashboard';
        this.showView(initialView);
    }

    /**
     * Cambiar a una vista específica
     */
    showView(viewName) {
        try {
            // Ocultar todas las vistas
            const views = document.querySelectorAll('.view-content');
            views.forEach(view => {
                view.style.display = 'none';
                view.classList.remove('active');
            });

            // Mostrar vista solicitada
            const targetView = document.getElementById(`${viewName}-view`);
            if (targetView) {
                targetView.style.display = 'block';
                targetView.classList.add('active');
                window.AppState.currentView = viewName;

                // Notificar cambio de vista
                this.notifyViewChange(viewName);

                // Actualizar navegación
                if (this.modules.navigation) {
                    this.modules.navigation.setActiveTab(viewName);
                }

                // Inicializar vista específica si es necesario
                this.initializeView(viewName);
            }

        } catch (error) {
            console.error(`Error mostrando vista ${viewName}:`, error);
        }
    }

    /**
     * Inicializar vista específica
     */
    initializeView(viewName) {
        switch (viewName) {
            case 'dashboard':
                this.modules.quickActions?.refresh();
                break;
            case 'obras':
                this.modules.formObras?.refreshTable();
                break;
            case 'materiales':
                this.modules.formMateriales?.refreshTable();
                break;
            case 'calendario':
                this.modules.calendario?.refresh();
                break;
            case 'chat-ia':
                this.modules.chatIA?.focus();
                break;
        }
    }

    /**
     * Manejar cambio de pestaña
     */
    handleTabChange(tabName) {
        this.showView(tabName);
        
        // Actualizar URL sin recargar página
        const newUrl = `${window.location.pathname}?view=${tabName}`;
        window.history.pushState({ view: tabName }, '', newUrl);
    }

    /**
     * Manejar navegación por URL
     */
    handleUrlNavigation() {
        window.addEventListener('popstate', (e) => {
            const state = e.state;
            if (state && state.view) {
                this.showView(state.view);
            }
        });
    }

    /**
     * Configurar guardado automático
     */
    setupAutoSave() {
        let saveTimeout;
        
        const triggerAutoSave = () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.autoSave();
            }, 2000); // Guardar después de 2 segundos de inactividad
        };

        // Escuchar cambios en formularios
        document.addEventListener('input', triggerAutoSave);
        document.addEventListener('change', triggerAutoSave);
    }

    /**
     * Ejecutar guardado automático
     */
    autoSave() {
        try {
            if (this.modules.storage) {
                this.modules.storage.saveAll();
                
                if (window.AppState.config.notifications) {
                    this.showNotification('Datos guardados automáticamente', 'success', 2000);
                }
            }
        } catch (error) {
            console.error('Error en guardado automático:', error);
        }
    }

    /**
     * Manejar teclas globales
     */
    handleGlobalKeyPress(e) {
        // Ctrl + S para guardar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveAll();
        }

        // Ctrl + F para buscar
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            this.focusSearch();
        }

        // Escape para cerrar modales
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    /**
     * Manejar antes de cerrar ventana
     */
    handleBeforeUnload(e) {
        if (this.hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?';
        }
    }

    /**
     * Manejar cambio de visibilidad
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Página oculta - guardar datos
            this.autoSave();
        } else {
            // Página visible - refrescar datos si es necesario
            this.refreshIfNeeded();
        }
    }

    /**
     * Manejar redimensión de ventana
     */
    handleWindowResize() {
        // Notificar a módulos que necesiten reajustarse
        Object.values(this.modules).forEach(module => {
            if (typeof module.handleResize === 'function') {
                module.handleResize();
            }
        });
    }

    /**
     * Guardar todos los datos
     */
    saveAll() {
        try {
            if (this.modules.storage) {
                this.modules.storage.saveAll();
                this.showNotification('Todos los datos guardados', 'success');
            }
        } catch (error) {
            console.error('Error guardando datos:', error);
            this.showNotification('Error al guardar datos', 'error');
        }
    }

    /**
     * Verificar si hay cambios sin guardar
     */
    hasUnsavedChanges() {
        return Object.values(this.modules).some(module => 
            typeof module.hasUnsavedChanges === 'function' && module.hasUnsavedChanges()
        );
    }

    /**
     * Enfocar búsqueda
     */
    focusSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * Cerrar todos los modales
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.click();
            }
        });
    }

    /**
     * Refrescar datos si es necesario
     */
    refreshIfNeeded() {
        const currentView = window.AppState.currentView;
        this.initializeView(currentView);
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info', duration = 5000) {
        if (this.modules.notificaciones) {
            this.modules.notificaciones.show(message, type, duration);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Notificar que la aplicación está lista
     */
    notifyReady() {
        document.dispatchEvent(new CustomEvent('app-ready', {
            detail: { modules: Object.keys(this.modules) }
        }));

        this.showNotification('Sistema de Gestión de Obras listo', 'success', 3000);
    }

    /**
     * Notificar cambio de vista
     */
    notifyViewChange(viewName) {
        document.dispatchEvent(new CustomEvent('view-change', {
            detail: { 
                from: window.AppState.currentView,
                to: viewName 
            }
        }));
    }

    /**
     * Manejar error de inicialización
     */
    handleInitError(error) {
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error al inicializar la aplicación</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        Recargar página
                    </button>
                </div>
            `;
            errorContainer.style.display = 'block';
        }
    }

    /**
     * Obtener información del estado de la aplicación
     */
    getAppInfo() {
        return {
            isInitialized: window.AppState.isInitialized,
            currentView: window.AppState.currentView,
            modules: Object.keys(this.modules),
            config: window.AppState.config
        };
    }

    /**
     * Actualizar configuración
     */
    updateConfig(newConfig) {
        window.AppState.config = { ...window.AppState.config, ...newConfig };
        localStorage.setItem('app-config', JSON.stringify(window.AppState.config));
        
        // Aplicar cambios inmediatamente
        if (newConfig.theme) {
            document.documentElement.setAttribute('data-theme', newConfig.theme);
        }
    }
}

/**
 * Inicialización cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Crear instancia principal de la aplicación
        window.MainApp = new MainApp();
        
        // Inicializar aplicación
        await window.MainApp.init();
        
    } catch (error) {
        console.error('Error crítico al inicializar la aplicación:', error);
        
        // Mostrar error en la interfaz
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; font-family: Arial, sans-serif;">
                <h2 style="color: #dc3545;">Error de Inicialización</h2>
                <p>No se pudo inicializar la aplicación correctamente.</p>
                <pre style="background: #f8f9fa; padding: 1rem; border-radius: 4px; max-width: 600px; overflow: auto;">${error.stack}</pre>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Recargar Página
                </button>
            </div>
        `;
    }
});

/**
 * API pública para interactuar con la aplicación
 */
window.AppAPI = {
    getInfo: () => window.MainApp?.getAppInfo(),
    showView: (viewName) => window.MainApp?.showView(viewName),
    saveAll: () => window.MainApp?.saveAll(),
    updateConfig: (config) => window.MainApp?.updateConfig(config),
    getModule: (moduleName) => window.AppState.modules[moduleName],
    isReady: () => window.AppState.isInitialized
};