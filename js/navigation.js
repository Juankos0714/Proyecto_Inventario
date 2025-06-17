/**
 * Sistema de navegación y gestión de pestañas para ObraSmart
 * Maneja la navegación entre las diferentes secciones de la aplicación
 */

class NavigationManager {
    constructor() {
        this.currentTab = 'inicio';
        this.navTabs = null;
        this.tabContents = null;
        this.history = ['inicio'];
        this.maxHistoryLength = 10;
        
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.setActiveTab('inicio');
        this.updateNavigationState();
    }

    bindElements() {
        this.navTabs = document.querySelectorAll('.nav-tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        if (!this.navTabs.length) {
            console.warn('NavigationManager: No se encontraron elementos de navegación');
            return;
        }
    }

    bindEvents() {
        // Event listener para pestañas de navegación
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.getAttribute('data-tab');
                
                if (targetTab && targetTab !== this.currentTab) {
                    this.navigateToTab(targetTab);
                }
            });

            // Efecto hover mejorado
            tab.addEventListener('mouseenter', () => {
                if (!tab.classList.contains('active')) {
                    tab.style.transform = 'translateY(-2px)';
                    tab.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }
            });

            tab.addEventListener('mouseleave', () => {
                if (!tab.classList.contains('active')) {
                    tab.style.transform = '';
                    tab.style.boxShadow = '';
                }
            });
        });

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                this.handleKeyboardNavigation(e);
            }
        });

        // Gestión del historial del navegador
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tab) {
                this.setActiveTab(e.state.tab, false);
            }
        });
    }

    navigateToTab(tabName, addToHistory = true) {
        if (!this.isValidTab(tabName)) {
            console.warn(`NavigationManager: Pestaña '${tabName}' no válida`);
            return false;
        }

        // Ejecutar callback antes del cambio de pestaña
        this.onBeforeTabChange(this.currentTab, tabName);

        // Cambiar pestaña activa
        this.setActiveTab(tabName, addToHistory);

        // Ejecutar callback después del cambio
        this.onAfterTabChange(this.currentTab, tabName);

        // Actualizar datos específicos de la pestaña
        this.loadTabData(tabName);

        return true;
    }

    setActiveTab(tabName, addToHistory = true) {
        if (!this.isValidTab(tabName)) {
            return false;
        }

        // Remover clase active de todas las pestañas y contenidos
        this.navTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.style.transform = '';
            tab.style.boxShadow = '';
        });
        
        this.tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Activar pestaña y contenido correspondiente
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(tabName);

        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');

            // Efecto de transición suave
            activeContent.style.opacity = '0';
            activeContent.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                activeContent.style.opacity = '1';
                activeContent.style.transform = 'translateY(0)';
            }, 50);
        }

        // Actualizar estado interno
        const previousTab = this.currentTab;
        this.currentTab = tabName;

        // Gestionar historial
        if (addToHistory) {
            this.addToHistory(tabName);
            this.updateBrowserHistory(tabName);
        }

        // Actualizar estado visual
        this.updateNavigationState();

        // Dispatch evento personalizado
        this.dispatchNavigationEvent(previousTab, tabName);

        return true;
    }

    isValidTab(tabName) {
        return document.getElementById(tabName) !== null;
    }

    addToHistory(tabName) {
        // Evitar duplicados consecutivos
        if (this.history[this.history.length - 1] !== tabName) {
            this.history.push(tabName);
            
            // Mantener límite del historial
            if (this.history.length > this.maxHistoryLength) {
                this.history.shift();
            }
        }
    }

    updateBrowserHistory(tabName) {
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        
        try {
            window.history.pushState(
                { tab: tabName }, 
                `ObraSmart - ${this.getTabTitle(tabName)}`, 
                url.toString()
            );
        } catch (error) {
            console.warn('NavigationManager: Error actualizando historial del navegador', error);
        }
    }

    getTabTitle(tabName) {
        const tabTitles = {
            'inicio': 'Dashboard',
            'obras': 'Gestión de Obras',
            'materiales': 'Inventario de Materiales',
            'ia': 'Asistente IA',
            'archivos': 'Gestión de Archivos',
            'calendario': 'Calendario y Eventos',
            'reportes': 'Reportes y Análisis'
        };
        
        return tabTitles[tabName] || 'ObraSmart';
    }

    updateNavigationState() {
        // Actualizar título de la página
        document.title = `ObraSmart - ${this.getTabTitle(this.currentTab)}`;

        // Actualizar breadcrumb si existe
        this.updateBreadcrumb();

        // Actualizar indicadores visuales
        this.updateVisualIndicators();
    }

    updateBreadcrumb() {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            const tabTitle = this.getTabTitle(this.currentTab);
            breadcrumb.innerHTML = `
                <span>ObraSmart</span>
                <i class="fas fa-chevron-right"></i>
                <span>${tabTitle}</span>
            `;
        }
    }

    updateVisualIndicators() {
        // Actualizar contador de pestañas activas si existe
        const activeIndicator = document.querySelector('.active-tab-indicator');
        if (activeIndicator) {
            activeIndicator.textContent = this.getTabTitle(this.currentTab);
        }
    }

    handleKeyboardNavigation(e) {
        const shortcuts = {
            'KeyD': 'inicio',      // Ctrl+D -> Dashboard
            'KeyO': 'obras',       // Ctrl+O -> Obras
            'KeyM': 'materiales',  // Ctrl+M -> Materiales
            'KeyI': 'ia',          // Ctrl+I -> IA
            'KeyA': 'archivos',    // Ctrl+A -> Archivos
            'KeyC': 'calendario'   // Ctrl+C -> Calendario
        };

        if (shortcuts[e.code]) {
            e.preventDefault();
            this.navigateToTab(shortcuts[e.code]);
        }
    }

    onBeforeTabChange(fromTab, toTab) {
        // Lógica a ejecutar antes del cambio de pestaña
        console.log(`NavigationManager: Cambiando de ${fromTab} a ${toTab}`);

        // Guardar estado del formulario actual si es necesario
        this.saveCurrentFormState(fromTab);

        // Limpiar temporizadores o recursos si es necesario
        this.cleanupTabResources(fromTab);
    }

    onAfterTabChange(fromTab, toTab) {
        // Lógica a ejecutar después del cambio de pestaña
        console.log(`NavigationManager: Cambio completado a ${toTab}`);

        // Restaurar estado del formulario si es necesario
        this.restoreFormState(toTab);

        // Inicializar recursos específicos de la pestaña
        this.initializeTabResources(toTab);
    }

    saveCurrentFormState(tabName) {
        // Guardar estado de formularios para evitar pérdida de datos
        const forms = document.querySelectorAll(`#${tabName} form`);
        forms.forEach(form => {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            sessionStorage.setItem(`form_state_${tabName}`, JSON.stringify(data));
        });
    }

    restoreFormState(tabName) {
        // Restaurar estado de formularios
        const savedState = sessionStorage.getItem(`form_state_${tabName}`);
        if (savedState) {
            try {
                const data = JSON.parse(savedState);
                Object.keys(data).forEach(key => {
                    const input = document.querySelector(`#${tabName} [name="${key}"]`);
                    if (input) {
                        input.value = data[key];
                    }
                });
            } catch (error) {
                console.warn('Error restaurando estado del formulario:', error);
            }
        }
    }

    cleanupTabResources(tabName) {
        // Limpiar recursos específicos de cada pestaña
        switch (tabName) {
            case 'calendario':
                // Limpiar eventos del calendario si es necesario
                break;
            case 'ia':
                // Detener procesos de IA en ejecución
                break;
            default:
                break;
        }
    }

    initializeTabResources(tabName) {
        // Inicializar recursos específicos de cada pestaña
        switch (tabName) {
            case 'calendario':
                // Regenerar calendario si es necesario
                if (window.generateCalendar) {
                    window.generateCalendar();
                }
                break;
            case 'obras':
                // Cargar datos de obras
                if (window.loadObrasTable) {
                    window.loadObrasTable();
                }
                break;
            case 'materiales':
                // Cargar datos de materiales
                if (window.loadMaterialesTable) {
                    window.loadMaterialesTable();
                }
                break;
            default:
                break;
        }
    }

    loadTabData(tabName) {
        // Cargar datos específicos de la pestaña
        const dataLoaders = {
            'inicio': () => window.updateStatsFromStorage?.(),
            'obras': () => window.loadObrasTable?.(),
            'materiales': () => window.loadMaterialesTable?.(),
            'archivos': () => window.loadArchivosTable?.(),
            'calendario': () => window.loadEventosTable?.()
        };

        const loader = dataLoaders[tabName];
        if (loader) {
            // Pequeño delay para permitir que la transición visual complete
            setTimeout(loader, 100);
        }
    }

    dispatchNavigationEvent(fromTab, toTab) {
        // Dispatch evento personalizado para otros componentes
        const event = new CustomEvent('tabChanged', {
            detail: {
                from: fromTab,
                to: toTab,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }

    // Métodos públicos para interacción externa
    getCurrentTab() {
        return this.currentTab;
    }

    getHistory() {
        return [...this.history];
    }

    goBack() {
        if (this.history.length > 1) {
            // Remover pestaña actual del historial
            this.history.pop();
            // Ir a la pestaña anterior
            const previousTab = this.history[this.history.length - 1];
            this.setActiveTab(previousTab, false);
            return true;
        }
        return false;
    }

    clearHistory() {
        this.history = [this.currentTab];
    }

    // Método para navegación programática
    navigateTo(tabName) {
        return this.navigateToTab(tabName);
    }
}

// Inicializar el gestor de navegación cuando el DOM esté listo
let navigationManager;

function initializeNavigation() {
    try {
        navigationManager = new NavigationManager();
        window.navigationManager = navigationManager;
        
        // Verificar si hay una pestaña especificada en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get('tab');
        
        if (tabFromUrl && navigationManager.isValidTab(tabFromUrl)) {
            navigationManager.setActiveTab(tabFromUrl);
        }
        
        console.log('NavigationManager: Sistema de navegación inicializado correctamente');
    } catch (error) {
        console.error('NavigationManager: Error durante la inicialización:', error);
    }
}

// Inicialización automática
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNavigation);
} else {
    initializeNavigation();
}

// Exportar para uso externo
window.NavigationManager = NavigationManager;