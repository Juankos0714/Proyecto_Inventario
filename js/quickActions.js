/**
 * quickActions.js
 * Gestiona las acciones rápidas del dashboard de ObraSmart
 */

class QuickActions {
    constructor() {
        this.quickActions = document.querySelectorAll('.quick-action');
        this.initializeQuickActions();
    }

    /**
     * Inicializa los event listeners para las acciones rápidas
     */
    initializeQuickActions() {
        this.quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                this.handleQuickAction(e, action);
            });

            // Agregar efectos de hover y animaciones
            this.addActionEffects(action);
        });
    }

    /**
     * Maneja el click en una acción rápida
     * @param {Event} e - Evento del click
     * @param {HTMLElement} action - Elemento de la acción
     */
    handleQuickAction(e, action) {
        const actionType = action.getAttribute('data-action');
        const actionName = action.querySelector('span')?.textContent || 'Acción';
        
        // Efecto visual de click
        this.addClickEffect(action);
        
        // Mostrar notificación de acción
        if (window.notificationSystem) {
            window.notificationSystem.show(`Navegando a ${actionName}...`, 'info', 2000);
        }

        // Ejecutar la acción correspondiente
        switch(actionType) {
            case 'nueva-obra':
                this.navigateToObras();
                break;
            case 'agregar-material':
                this.navigateToMateriales();
                break;
            case 'consultar-ia':
                this.navigateToIA();
                break;
            case 'cargar-archivo':
                this.navigateToArchivos();
                break;
            default:
                console.warn(`Acción no reconocida: ${actionType}`);
        }
    }

    /**
     * Navega a la pestaña de obras
     */
    navigateToObras() {
        const obrasTab = document.querySelector('[data-tab="obras"]');
        if (obrasTab) {
            obrasTab.click();
            
            // Enfocar el primer campo del formulario después de un breve delay
            setTimeout(() => {
                const firstInput = document.querySelector('#obras .form-input');
                if (firstInput) {
                    firstInput.focus();
                    this.highlightSection('#obras .form-section');
                }
            }, 300);
        }
    }

    /**
     * Navega a la pestaña de materiales
     */
    navigateToMateriales() {
        const materialesTab = document.querySelector('[data-tab="materiales"]');
        if (materialesTab) {
            materialesTab.click();
            
            // Enfocar el primer campo del formulario
            setTimeout(() => {
                const firstInput = document.querySelector('#materiales .form-input');
                if (firstInput) {
                    firstInput.focus();
                    this.highlightSection('#materiales .form-section');
                }
            }, 300);
        }
    }

    /**
     * Navega a la pestaña de IA
     */
    navigateToIA() {
        const iaTab = document.querySelector('[data-tab="ia"]');
        if (iaTab) {
            iaTab.click();
            
            // Enfocar el área de chat
            setTimeout(() => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.focus();
                    this.highlightSection('#ia .chat-container');
                }
            }, 300);
        }
    }

    /**
     * Navega a la pestaña de archivos
     */
    navigateToArchivos() {
        const archivosTab = document.querySelector('[data-tab="archivos"]');
        if (archivosTab) {
            archivosTab.click();
            
            // Destacar las áreas de carga
            setTimeout(() => {
                this.highlightUploadAreas();
            }, 300);
        }
    }

    /**
     * Resalta visualmente una sección
     * @param {string} selector - Selector CSS de la sección
     */
    highlightSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.style.transition = 'all 0.3s ease';
            section.style.transform = 'scale(1.02)';
            section.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.2)';
            
            setTimeout(() => {
                section.style.transform = 'scale(1)';
                section.style.boxShadow = '';
            }, 1000);
        }
    }

    /**
     * Resalta las áreas de carga de archivos
     */
    highlightUploadAreas() {
        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach((area, index) => {
            setTimeout(() => {
                area.style.transition = 'all 0.3s ease';
                area.style.borderColor = 'var(--primary-color)';
                area.style.background = 'rgba(37, 99, 235, 0.1)';
                area.style.transform = 'translateY(-2px)';
                
                setTimeout(() => {
                    area.style.borderColor = 'var(--border)';
                    area.style.background = 'var(--surface-hover)';
                    area.style.transform = 'translateY(0)';
                }, 1500);
            }, index * 200);
        });
    }

    /**
     * Agrega efectos visuales a las acciones rápidas
     * @param {HTMLElement} action - Elemento de la acción
     */
    addActionEffects(action) {
        // Efecto hover
        action.addEventListener('mouseenter', () => {
            action.style.transition = 'all 0.2s ease';
            action.style.transform = 'translateY(-3px)';
            action.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });

        action.addEventListener('mouseleave', () => {
            action.style.transform = 'translateY(0)';
            action.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });

        // Efecto de loading en el icono cuando se hace click
        action.addEventListener('click', () => {
            const icon = action.querySelector('i');
            if (icon) {
                const originalClass = icon.className;
                icon.className = 'fas fa-spinner fa-spin';
                
                setTimeout(() => {
                    icon.className = originalClass;
                }, 1000);
            }
        });
    }

    /**
     * Agrega efecto visual de click
     * @param {HTMLElement} action - Elemento de la acción
     */
    addClickEffect(action) {
        action.style.transform = 'translateY(-3px) scale(0.98)';
        
        setTimeout(() => {
            action.style.transform = 'translateY(-3px) scale(1)';
        }, 150);
    }

    /**
     * Agrega una nueva acción rápida dinámicamente
     * @param {Object} actionConfig - Configuración de la nueva acción
     */
    addQuickAction(actionConfig) {
        const { icon, title, description, action, container } = actionConfig;
        
        const quickActionElement = document.createElement('div');
        quickActionElement.className = 'quick-action';
        quickActionElement.setAttribute('data-action', action);
        
        quickActionElement.innerHTML = `
            <i class="${icon}"></i>
            <div>
                <span>${title}</span>
                <p>${description}</p>
            </div>
        `;

        // Agregar al contenedor especificado o al contenedor por defecto
        const targetContainer = document.querySelector(container || '.quick-actions');
        if (targetContainer) {
            targetContainer.appendChild(quickActionElement);
            
            // Inicializar eventos para la nueva acción
            quickActionElement.addEventListener('click', (e) => {
                this.handleQuickAction(e, quickActionElement);
            });
            
            this.addActionEffects(quickActionElement);
        }
    }

    /**
     * Actualiza el estado de las acciones rápidas basado en datos
     */
    updateActionStates() {
        this.quickActions.forEach(action => {
            const actionType = action.getAttribute('data-action');
            
            // Agregar badges informativos
            this.addActionBadge(action, actionType);
        });
    }

    /**
     * Agrega un badge informativo a una acción
     * @param {HTMLElement} action - Elemento de la acción
     * @param {string} actionType - Tipo de acción
     */
    addActionBadge(action, actionType) {
        // Remover badge existente
        const existingBadge = action.querySelector('.action-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        let badgeText = '';
        let badgeClass = 'badge-info';

        switch(actionType) {
            case 'nueva-obra':
                const obras = window.dataManager?.getData('obras') || [];
                badgeText = obras.filter(o => o.estado === 'Activa').length.toString();
                badgeClass = 'badge-success';
                break;
            case 'agregar-material':
                const materiales = window.dataManager?.getData('materiales') || [];
                const stockBajo = materiales.filter(m => m.stock < 50).length;
                if (stockBajo > 0) {
                    badgeText = stockBajo.toString();
                    badgeClass = 'badge-warning';
                }
                break;
            case 'consultar-ia':
                badgeText = 'IA';
                badgeClass = 'badge-accent';
                break;
            case 'cargar-archivo':
                const archivos = window.dataManager?.getData('archivos') || [];
                badgeText = archivos.length.toString();
                badgeClass = 'badge-info';
                break;
        }

        if (badgeText) {
            const badge = document.createElement('div');
            badge.className = `action-badge ${badgeClass}`;
            badge.textContent = badgeText;
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: var(--accent-color);
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 0.75rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            
            action.style.position = 'relative';
            action.appendChild(badge);
        }
    }

    /**
     * Inicializa acciones rápidas personalizadas del usuario
     */
    initializeCustomActions() {
        // Verificar si hay acciones personalizadas guardadas
        const customActions = window.dataManager?.getData('customActions') || [];
        
        customActions.forEach(actionConfig => {
            this.addQuickAction(actionConfig);
        });
    }
}

// Estilos adicionales para las acciones rápidas
const quickActionStyles = `
    .quick-action {
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
    }
    
    .quick-action:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    .quick-action:active {
        transform: translateY(-3px) scale(0.98);
    }
    
    .quick-action::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
    }
    
    .quick-action:hover::before {
        left: 100%;
    }
    
    .action-badge.badge-success {
        background: var(--accent-color) !important;
    }
    
    .action-badge.badge-warning {
        background: var(--secondary-color) !important;
    }
    
    .action-badge.badge-info {
        background: var(--primary-color) !important;
    }
    
    .action-badge.badge-accent {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }
`;

// Inyectar estilos
const styleElement = document.createElement('style');
styleElement.textContent = quickActionStyles;
document.head.appendChild(styleElement);

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const quickActions = new QuickActions();
    
    // Hacer disponible globalmente para otros módulos
    window.quickActions = quickActions;
    
    // Actualizar estados cada 30 segundos
    setInterval(() => {
        quickActions.updateActionStates();
    }, 30000);
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickActions;
}