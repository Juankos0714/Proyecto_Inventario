// calendario.js - Sistema de Calendario y Eventos para ObraSmart

class CalendarioManager {
    constructor() {
        // Ensure storage is available
        if (!window.dataStorage) {
            console.error('Storage not initialized for CalendarioManager');
            return;
        }
        
        this.storage = window.dataStorage;
        this.calendarGrid = document.getElementById('calendarGrid');
        this.currentMonthElement = document.getElementById('currentMonth');
        this.prevMonthButton = document.getElementById('prevMonth');
        this.nextMonthButton = document.getElementById('nextMonth');
        
        this.currentDate = new Date();
        this.months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        this.eventos = this.loadEventos();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateCalendar();
        this.loadEventosTable();
    }

    setupEventListeners() {
        if (this.prevMonthButton) {
            this.prevMonthButton.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.generateCalendar();
            });
        }

        if (this.nextMonthButton) {
            this.nextMonthButton.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.generateCalendar();
            });
        }

        // Event listener para agregar eventos al hacer clic en días
        if (this.calendarGrid) {
            this.calendarGrid.addEventListener('click', (e) => {
                const dayElement = e.target.closest('.calendar-day:not(.other-month)');
                if (dayElement) {
                    this.handleDayClick(dayElement);
                }
            });
        }
    }

    loadEventos() {
        // Cargar eventos desde localStorage o datos por defecto
        const stored = window.dataManager ? window.dataManager.getData('eventos') : null;
        
        if (stored) {
            return stored;
        }

        // Eventos por defecto
        const defaultEventos = [
            {
                id: 'EV-001',
                fecha: '2025-06-12',
                titulo: 'Entrega de materiales',
                descripcion: 'Entrega programada de cemento y varillas',
                obra: 'Torre Residencial Central',
                tipo: 'Entrega',
                prioridad: 'alta',
                completado: false
            },
            {
                id: 'EV-002',
                fecha: '2025-06-15',
                titulo: 'Revisión de calidad',
                descripcion: 'Inspección de obra gris - Nivel 3',
                obra: 'Centro Comercial Norte',
                tipo: 'Inspección',
                prioridad: 'media',
                completado: false
            },
            {
                id: 'EV-003',
                fecha: '2025-06-20',
                titulo: 'Reunión con cliente',
                descripcion: 'Presentación de avances del proyecto',
                obra: 'Torre Residencial Central',
                tipo: 'Reunión',
                prioridad: 'alta',
                completado: false
            },
            {
                id: 'EV-004',
                fecha: '2025-06-25',
                titulo: 'Inicio Fase 2',
                descripcion: 'Comienzo de actividades de estructura',
                obra: 'Centro Comercial Norte',
                tipo: 'Hito',
                prioridad: 'critica',
                completado: false
            }
        ];

        // Guardar eventos por defecto
        if (window.dataManager) {
            window.dataManager.saveData('eventos', defaultEventos);
        }

        return defaultEventos;
    }

    generateCalendar() {
        if (!this.calendarGrid || !this.currentMonthElement) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();
        
        this.currentMonthElement.textContent = `${this.months[month]} ${year}`;
        this.calendarGrid.innerHTML = '';
        
        // Encabezados de días
        this.createDayHeaders();
        
        // Calcular días del mes
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Días del mes anterior
        for (let i = firstDay - 1; i >= 0; i--) {
            this.createDayElement(daysInPrevMonth - i, true, false);
        }
        
        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = year === today.getFullYear() && 
                           month === today.getMonth() && 
                           day === today.getDate();
            
            this.createDayElement(day, false, isToday);
        }
        
        // Días del siguiente mes para completar la grilla
        const totalCells = 42;
        const cellsUsed = firstDay + daysInMonth;
        for (let day = 1; cellsUsed + day - 1 < totalCells; day++) {
            this.createDayElement(day, true, false);
        }
    }

    createDayHeaders() {
        const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayHeaders.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-header';
            dayElement.style.cssText = `
                background: var(--primary-color);
                color: white;
                padding: 0.75rem;
                text-align: center;
                font-weight: bold;
                font-size: 0.875rem;
            `;
            dayElement.textContent = day;
            this.calendarGrid.appendChild(dayElement);
        });
    }

    createDayElement(day, isOtherMonth, isToday) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
        
        const currentDateString = this.formatDateForDay(day, isOtherMonth);
        const dayEvents = this.getEventsForDate(currentDateString);
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="day-events">${this.renderDayEvents(dayEvents)}</div>
        `;
        
        // Aplicar estilos
        this.applyDayStyles(dayElement, isOtherMonth, isToday, dayEvents.length > 0);
        
        this.calendarGrid.appendChild(dayElement);
    }

    formatDateForDay(day, isOtherMonth) {
        const year = this.currentDate.getFullYear();
        let month = this.currentDate.getMonth();
        
        if (isOtherMonth) {
            if (day > 15) {
                month = month - 1;
                if (month < 0) {
                    month = 11;
                }
            } else {
                month = month + 1;
                if (month > 11) {
                    month = 0;
                }
            }
        }
        
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    getEventsForDate(dateString) {
        return this.eventos.filter(evento => evento.fecha === dateString);
    }

    renderDayEvents(events) {
        return events.map(event => {
            const icon = this.getEventIcon(event.tipo);
            const colorClass = this.getEventColorClass(event.prioridad);
            
            return `<div class="calendar-event ${colorClass}" title="${event.titulo}">
                ${icon} ${event.titulo.substring(0, 12)}${event.titulo.length > 12 ? '...' : ''}
            </div>`;
        }).join('');
    }

    getEventIcon(tipo) {
        const icons = {
            'Entrega': '📦',
            'Inspección': '🔍',
            'Reunión': '📋',
            'Hito': '🏗️',
            'Mantenimiento': '🔧',
            'Capacitación': '📚'
        };
        return icons[tipo] || '📅';
    }

    getEventColorClass(prioridad) {
        const classes = {
            'critica': 'event-critical',
            'alta': 'event-high',
            'media': 'event-medium',
            'baja': 'event-low'
        };
        return classes[prioridad] || 'event-medium';
    }

    applyDayStyles(dayElement, isOtherMonth, isToday, hasEvents) {
        let baseStyle = `
            border: 1px solid var(--border);
            min-height: 80px;
            padding: 0.5rem;
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
        `;

        if (isOtherMonth) {
            baseStyle += `
                background: var(--background);
                color: var(--text-muted);
                opacity: 0.5;
            `;
        } else {
            baseStyle += `
                background: var(--surface);
                color: var(--text);
            `;
            
            if (isToday) {
                baseStyle += `
                    background: var(--primary-color);
                    color: white;
                    font-weight: bold;
                `;
            }
            
            if (hasEvents) {
                baseStyle += `
                    border-left: 4px solid var(--accent-color);
                `;
            }
        }

        dayElement.style.cssText = baseStyle;
        
        // Hover effect
        if (!isOtherMonth) {
            dayElement.addEventListener('mouseenter', () => {
                if (!isToday) {
                    dayElement.style.background = 'var(--surface-hover)';
                }
                dayElement.style.transform = 'scale(1.02)';
            });
            
            dayElement.addEventListener('mouseleave', () => {
                if (!isToday) {
                    dayElement.style.background = 'var(--surface)';
                }
                dayElement.style.transform = 'scale(1)';
            });
        }
    }

    handleDayClick(dayElement) {
        const dayNumber = dayElement.querySelector('.day-number').textContent;
        const dateString = this.formatDateForDay(parseInt(dayNumber), false);
        
        this.showEventModal(dateString, dayNumber);
    }

    showEventModal(dateString, dayNumber) {
        const events = this.getEventsForDate(dateString);
        
        // Crear modal simple
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--surface);
            padding: 2rem;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            max-height: 80%;
            overflow-y: auto;
        `;
        
        modalContent.innerHTML = `
            <h3 style="margin-top: 0;">Eventos para ${dayNumber} de ${this.months[this.currentDate.getMonth()]}</h3>
            ${events.length > 0 ? 
                events.map(event => `
                    <div style="border: 1px solid var(--border); padding: 1rem; margin: 1rem 0; border-radius: 4px;">
                        <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">${this.getEventIcon(event.tipo)} ${event.titulo}</h4>
                        <p style="margin: 0.25rem 0; color: var(--text-muted);">Obra: ${event.obra}</p>
                        <p style="margin: 0.25rem 0;">${event.descripcion}</p>
                        <span class="badge badge-${this.getPriorityBadgeClass(event.prioridad)}">${event.prioridad.toUpperCase()}</span>
                    </div>
                `).join('') : 
                '<p>No hay eventos programados para este día.</p>'
            }
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 1rem;
            ">Cerrar</button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getPriorityBadgeClass(prioridad) {
        const classes = {
            'critica': 'error',
            'alta': 'warning',
            'media': 'info',
            'baja': 'success'
        };
        return classes[prioridad] || 'info';
    }

    loadEventosTable() {
        const tbody = document.querySelector('#calendario tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Ordenar eventos por fecha
        const sortedEventos = [...this.eventos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        sortedEventos.forEach(evento => {
            if (!evento) return; // Skip if evento is undefined
            
            const row = document.createElement('tr');
            // Ensure prioridad exists and has a default value
            const prioridad = (evento.prioridad || 'media').toLowerCase();
            const badgeClass = this.getPriorityBadgeClass(prioridad);
            
            row.innerHTML = `
                <td>${this.formatDisplayDate(evento.fecha)}</td>
                <td>
                    ${this.getEventIcon(evento.tipo || 'default')} ${evento.titulo || 'Sin título'}
                    <br><small style="color: var(--text-muted);">${evento.descripcion || 'Sin descripción'}</small>
                </td>
                <td>${evento.obra || 'Sin asignar'}</td>
                <td>
                    <span class="badge badge-${badgeClass}">${prioridad.toUpperCase()}</span>
                    <span class="badge badge-${evento.completado ? 'success' : 'secondary'}" style="margin-left: 0.5rem;">
                        ${evento.completado ? 'Completado' : 'Pendiente'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="calendarioManager.toggleEventoCompletado('${evento.id}')" title="Marcar como completado">
                        <i class="fas fa-${evento.completado ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="calendarioManager.editEvento('${evento.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="calendarioManager.deleteEvento('${evento.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    formatDisplayDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const day = date.getDate();
        const month = this.months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    }

    toggleEventoCompletado(id) {
        const evento = this.eventos.find(e => e.id === id);
        if (evento) {
            evento.completado = !evento.completado;
            this.saveEventos();
            this.loadEventosTable();
            this.generateCalendar();
            
            const message = evento.completado ? 'Evento marcado como completado' : 'Evento marcado como pendiente';
            if (window.notificationSystem) {
                window.notificationSystem.show(message, 'success');
            }
        }
    }

    editEvento(id) {
        const evento = this.eventos.find(e => e.id === id);
        if (evento) {
            // Implementar modal de edición
            if (window.notificationSystem) {
                window.notificationSystem.show('Función de edición en desarrollo', 'info');
            }
        }
    }

    deleteEvento(id) {
        if (confirm('¿Está seguro de eliminar este evento?')) {
            this.eventos = this.eventos.filter(e => e.id !== id);
            this.saveEventos();
            this.loadEventosTable();
            this.generateCalendar();
            
            if (window.notificationSystem) {
                window.notificationSystem.show('Evento eliminado exitosamente', 'success');
            }
        }
    }

    addEvento(evento) {
        evento.id = `EV-${String(this.eventos.length + 1).padStart(3, '0')}`;
        evento.completado = false;
        this.eventos.push(evento);
        this.saveEventos();
        this.loadEventosTable();
        this.generateCalendar();
        
        if (window.notificationSystem) {
            window.notificationSystem.show('Evento agregado exitosamente', 'success');
        }
    }

    saveEventos() {
        if (window.dataManager) {
            window.dataManager.saveData('eventos', this.eventos);
        }
    }

    // Método para agregar estilos CSS específicos del calendario
    addCalendarStyles() {
        const style = document.createElement('style');
        style.id = 'calendar-styles';
        
        if (document.getElementById('calendar-styles')) {
            return; // Ya existe
        }
        
        style.textContent = `
            .calendar-event {
                font-size: 0.7rem;
                padding: 0.2rem;
                margin: 0.1rem 0;
                border-radius: 3px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .event-critical {
                background: var(--danger-color, #ef4444);
                color: white;
            }
            
            .event-high {
                background: var(--warning-color, #f59e0b);
                color: white;
            }
            
            .event-medium {
                background: var(--info-color, #3b82f6);
                color: white;
            }
            
            .event-low {
                background: var(--success-color, #10b981);
                color: white;
            }
            
            .day-number {
                font-weight: bold;
                margin-bottom: 0.25rem;
            }
            
            .day-events {
                font-size: 0.75rem;
            }
            
            .calendar-day.today .day-number {
                color: white;
            }
            
            .calendar-day.other-month {
                pointer-events: none;
            }
            
            .badge-error {
                background: var(--danger-color, #ef4444);
                color: white;
            }
            
            .badge-info {
                background: var(--info-color, #3b82f6);
                color: white;
            }
            
            .badge-secondary {
                background: var(--text-muted, #6b7280);
                color: white;
            }
            
            .btn-sm {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
            }
            
            .btn-danger {
                background: var(--danger-color, #ef4444);
                color: white;
                border: none;
            }
            
            .btn-danger:hover {
                background: #dc2626;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Inicializar el sistema de calendario
let calendarioManager;

function initCalendario() {
    calendarioManager = new CalendarioManager();
    calendarioManager.addCalendarStyles();
}

// Exportar para uso global
window.CalendarioManager = CalendarioManager;
window.initCalendario = initCalendario;

// Auto-inicializar si el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendario);
} else {
    initCalendario();
}

console.log('Calendario module loaded successfully');