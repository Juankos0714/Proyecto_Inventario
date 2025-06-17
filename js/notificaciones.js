/**
 * Sistema de Notificaciones para ObraSmart
 * Maneja notificaciones emergentes, alertas del sistema y notificaciones en tiempo real
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.count = 3;
        this.createNotificationContainer();
        this.updateBadge();
    }
    
    /**
     * Crea el contenedor principal de notificaciones
     */
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1000;
            max-width: 350px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    /**
     * Muestra una nueva notificación
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación: 'success', 'warning', 'error', 'info'
     * @param {number} duration - Duración en milisegundos
     * @returns {number} ID de la notificación
     */
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        const id = Date.now();
        
        let bgColor;
        let icon;
        switch(type) {
            case 'success':
                bgColor = '#10b981';
                icon = 'fa-check-circle';
                break;
            case 'warning':
                bgColor = '#f59e0b';
                icon = 'fa-exclamation-triangle';
                break;
            case 'error':
                bgColor = '#ef4444';
                icon = 'fa-times-circle';
                break;
            default:
                bgColor = '#2563eb';
                icon = 'fa-info-circle';
        }
        
        notification.style.cssText = `
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            margin-bottom: 0.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease, opacity 0.3s ease;
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            line-height: 1.4;
            max-width: 100%;
            word-wrap: break-word;
        `;
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
            <button onclick="window.notificationSystem.remove(${id})" style="
                background: none;
                border: none;
                color: white;
                margin-left: auto;
                cursor: pointer;
                padding: 0;
                font-size: 1.2rem;
                opacity: 0.7;
                flex-shrink: 0;
            " title="Cerrar">×</button>
        `;
        
        notification.dataset.id = id;
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
        }
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto-remover después de la duración especificada
        setTimeout(() => {
            this.remove(id);
        }, duration);
        
        this.notifications.push(id);
        return id;
    }
    
    /**
     * Remueve una notificación específica
     * @param {number} id - ID de la notificación a remover
     */
    remove(id) {
        const notification = document.querySelector(`[data-id="${id}"]`);
        if (notification) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
        this.notifications = this.notifications.filter(n => n !== id);
    }
    
    /**
     * Actualiza el badge de notificaciones en el header
     */
    updateBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const style = document.createElement('style');
            style.id = 'notification-badge-style';
            const existingStyle = document.getElementById('notification-badge-style');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            style.textContent = `
                .notification-badge::after {
                    content: '${this.count}';
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: var(--secondary-color);
                    color: white;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * Incrementa el contador de notificaciones
     */
    addNotification() {
        this.count++;
        this.updateBadge();
    }
    
    /**
     * Limpia todas las notificaciones
     */
    clearNotifications() {
        this.count = 0;
        this.updateBadge();
        
        // Remover todas las notificaciones visibles
        const notifications = document.querySelectorAll('#notification-container > div');
        notifications.forEach(notification => {
            const id = parseInt(notification.dataset.id);
            this.remove(id);
        });
    }
    
    /**
     * Muestra notificaciones de éxito comunes
     */
    success(message) {
        return this.show(message, 'success');
    }
    
    /**
     * Muestra notificaciones de advertencia
     */
    warning(message) {
        return this.show(message, 'warning');
    }
    
    /**
     * Muestra notificaciones de error
     */
    error(message) {
        return this.show(message, 'error');
    }
    
    /**
     * Muestra notificaciones informativas
     */
    info(message) {
        return this.show(message, 'info');
    }
}

/**
 * Sistema de Alertas para eventos críticos del sistema
 */
class AlarmSystem {
    constructor() {
        this.alarms = [
            { id: 1, message: 'Stock bajo de cemento (< 100kg)', type: 'warning', active: true },
            { id: 2, message: 'Entrega retrasada - Torre Central', type: 'error', active: true },
            { id: 3, message: 'Revisión programada para mañana', type: 'info', active: true }
        ];
        this.checkAlarms();
        this.startPeriodicChecks();
    }
    
    /**
     * Verifica y muestra alarmas activas
     */
    checkAlarms() {
        this.alarms.forEach(alarm => {
            if (alarm.active) {
                window.notificationSystem.show(alarm.message, alarm.type, 6000);
                alarm.active = false; // Evitar mostrar la misma alarma repetidamente
            }
        });
    }
    
    /**
     * Agrega una nueva alarma al sistema
     * @param {string} message - Mensaje de la alarma
     * @param {string} type - Tipo de alarma
     */
    addAlarm(message, type = 'info') {
        const newAlarm = {
            id: Date.now(),
            message,
            type,
            active: true
        };
        this.alarms.push(newAlarm);
        window.notificationSystem.show(message, type);
        window.notificationSystem.addNotification();
    }
    
    /**
     * Inicia verificaciones periódicas de alertas del sistema
     */
    startPeriodicChecks() {
        // Verificar nuevas alertas cada 30 segundos
        setInterval(() => {
            if (Math.random() > 0.8) { // 20% de probabilidad
                const messages = [
                    { msg: 'Nueva entrega programada para mañana', type: 'info' },
                    { msg: 'Actualización de precios disponible', type: 'warning' },
                    { msg: 'Revisión de calidad completada', type: 'success' },
                    { msg: 'Material crítico: Stock bajo', type: 'error' },
                    { msg: 'Progreso de obra actualizado', type: 'info' },
                    { msg: 'Nuevo mensaje del cliente', type: 'info' },
                    { msg: 'Recordatorio: Reunión a las 3:00 PM', type: 'warning' }
                ];
                const random = messages[Math.floor(Math.random() * messages.length)];
                this.addAlarm(random.msg, random.type);
            }
        }, 30000);
    }
    
    /**
     * Verifica niveles críticos de stock
     */
    checkStockLevels() {
        // Simulación de verificación de stock
        const criticalItems = ['Cemento', 'Varillas #4', 'Arena'];
        criticalItems.forEach(item => {
            if (Math.random() > 0.9) { // 10% de probabilidad de stock crítico
                this.addAlarm(`Stock crítico: ${item} requiere reposición urgente`, 'error');
            }
        });
    }
    
    /**
     * Verifica retrasos en cronograma
     */
    checkScheduleDelays() {
        const obras = ['Torre Central', 'Centro Comercial Norte', 'Proyecto Residencial'];
        obras.forEach(obra => {
            if (Math.random() > 0.95) { // 5% de probabilidad de retraso
                this.addAlarm(`Posible retraso detectado en ${obra}`, 'warning');
            }
        });
    }
}

/**
 * Manejador de eventos de notificaciones
 */
class NotificationEventHandler {
    constructor() {
        this.initializeEventListeners();
    }
    
    /**
     * Inicializa los event listeners para notificaciones
     */
    initializeEventListeners() {
        // Manejar clics en elementos de la interfaz
        document.addEventListener('click', (e) => {
            this.handleInterfaceClicks(e);
        });
        
        // Manejar interacciones con el badge de notificaciones
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            notificationBadge.addEventListener('click', () => {
                window.notificationSystem.show('Todas las notificaciones revisadas', 'success');
                window.notificationSystem.clearNotifications();
            });
        }
    }
    
    /**
     * Maneja clics en elementos específicos de la interfaz
     * @param {Event} e - Evento de clic
     */
    handleInterfaceClicks(e) {
        if (e.target.closest('.fa-eye')) {
            window.notificationSystem.show('Abriendo vista detallada...', 'info');
        }
        
        if (e.target.closest('.fa-edit')) {
            window.notificationSystem.show('Modo de edición activado', 'warning');
        }
        
        if (e.target.closest('.fa-download')) {
            window.notificationSystem.show('Descargando archivo...', 'success');
        }
        
        if (e.target.closest('.fa-trash')) {
            // No mostrar notificación aquí, se maneja en el evento específico
        }
        
        if (e.target.closest('.quick-action')) {
            const actionType = e.target.closest('.quick-action').getAttribute('data-action');
            let message = '';
            
            switch(actionType) {
                case 'nueva-obra':
                    message = 'Navegando a registro de obras...';
                    break;
                case 'agregar-material':
                    message = 'Navegando a gestión de materiales...';
                    break;
                case 'consultar-ia':
                    message = 'Activando asistente de IA...';
                    break;
                case 'cargar-archivo':
                    message = 'Navegando a carga de archivos...';
                    break;
            }
            
            if (message) {
                window.notificationSystem.show(message, 'info', 2000);
            }
        }
    }
}

/**
 * Inicialización del sistema de notificaciones
 */
function initializeNotificationSystem() {
    // Crear instancia global del sistema de notificaciones
    window.notificationSystem = new NotificationSystem();
    
    // Crear sistema de alarmas
    window.alarmSystem = new AlarmSystem();
    
    // Crear manejador de eventos
    window.notificationEventHandler = new NotificationEventHandler();
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        window.notificationSystem.show('Sistema ObraSmart iniciado correctamente', 'success');
    }, 1000);
}

/**
 * Funciones de utilidad para notificaciones específicas
 */
const NotificationUtils = {
    /**
     * Notificación para operaciones de datos exitosas
     */
    dataSuccess(operation, item) {
        const messages = {
            'create': `${item} creado exitosamente`,
            'update': `${item} actualizado exitosamente`,
            'delete': `${item} eliminado exitosamente`,
            'save': `${item} guardado exitosamente`
        };
        window.notificationSystem.success(messages[operation] || `Operación completada: ${item}`);
    },
    
    /**
     * Notificación para errores de validación
     */
    validationError(message = 'Por favor verifique los datos ingresados') {
        window.notificationSystem.warning(message);
    },
    
    /**
     * Notificación para errores del sistema
     */
    systemError(message = 'Ha ocurrido un error del sistema') {
        window.notificationSystem.error(message);
    },
    
    /**
     * Notificación para procesos en progreso
     */
    processInfo(message) {
        return window.notificationSystem.info(message);
    }
};

// Exportar para uso global
window.NotificationUtils = NotificationUtils;

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeNotificationSystem);
} else {
    initializeNotificationSystem();
}

console.log('Sistema de notificaciones cargado - ObraSmart v1.0');