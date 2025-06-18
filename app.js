
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                navTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });

        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', () => {
                const actionType = action.getAttribute('data-action');
                switch(actionType) {
                    case 'nueva-obra':
                        document.querySelector('[data-tab="obras"]').click();
                        break;
                    case 'agregar-material':
                        document.querySelector('[data-tab="materiales"]').click();
                        break;
                    case 'consultar-ia':
                        document.querySelector('[data-tab="ia"]').click();
                        break;
                    case 'cargar-archivo':
                        document.querySelector('[data-tab="archivos"]').click();
                        break;
                }
            });
        });

        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach(area => {
            const fileInput = area.querySelector('input[type="file"]');
            
            area.addEventListener('click', () => {
                fileInput.click();
            });

            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.style.borderColor = 'var(--primary-color)';
                area.style.background = 'rgba(37, 99, 235, 0.1)';
            });

            area.addEventListener('dragleave', () => {
                area.style.borderColor = 'var(--border)';
                area.style.background = 'var(--surface-hover)';
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFileUpload(files[0], area);
                }
                area.style.borderColor = 'var(--border)';
                area.style.background = 'var(--surface-hover)';
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0], area);
                }
            });
        });

        function handleFileUpload(file, area) {
            const icon = area.querySelector('.upload-icon');
            const text = area.querySelector('p');
            
            icon.className = 'fas fa-check-circle upload-icon';
            icon.style.color = 'var(--accent-color)';
            text.textContent = `Archivo cargado: ${file.name}`;
            
            setTimeout(() => {
                alert('Archivo cargado exitosamente');
            }, 1000);
        }

        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        const sendButton = document.getElementById('sendChat');

        function addMessage(message, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                margin-bottom: 1rem;
                padding: 0.75rem;
                border-radius: 8px;
                ${isUser ? 
                    'background: var(--primary-color); color: white; margin-left: 2rem; text-align: right;' : 
                    'background: var(--surface); border: 1px solid var(--border); margin-right: 2rem;'
                }
            `;
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function sendMessage() {
            const message = chatInput.value.trim();
            if (message) {
                addMessage(message, true);
                chatInput.value = '';
                
                setTimeout(() => {
                    const responses = [
                        'He analizado tu consulta. Basándome en los datos disponibles, te recomiendo revisar los costos de materiales en el ítem de estructura.',
                        'Puedo ayudarte con eso. ¿Podrías especificar qué tipo de análisis necesitas: presupuesto, cronograma o materiales?',
                        'Según mi análisis, detecté una posible optimización en la programación de actividades que podría ahorrarte un 15% en tiempo.',
                        'Te sugiero revisar los precios de cemento, ya que han aumentado un 8% en el último mes según datos de mercado.'
                    ];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    addMessage(randomResponse);
                }, 1500);
            }
        }

        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthElement = document.getElementById('currentMonth');
        const prevMonthButton = document.getElementById('prevMonth');
        const nextMonthButton = document.getElementById('nextMonth');

        let currentDate = new Date();
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        function generateCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const today = new Date();
            
            currentMonthElement.textContent = `${months[month]} ${year}`;
            
            calendarGrid.innerHTML = '';
            
            const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            dayHeaders.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.style.cssText = `
                    background: var(--primary-color);
                    color: white;
                    padding: 0.5rem;
                    text-align: center;
                    font-weight: bold;
                `;
                dayElement.textContent = day;
                calendarGrid.appendChild(dayElement);
            });
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            for (let i = firstDay - 1; i >= 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day other-month';
                dayElement.textContent = daysInPrevMonth - i;
                calendarGrid.appendChild(dayElement);
            }
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                
                if (year === today.getFullYear() && 
                    month === today.getMonth() && 
                    day === today.getDate()) {
                    dayElement.classList.add('today');
                }
                
                dayElement.innerHTML = `
                    <strong>${day}</strong>
                    ${getEventsForDay(day).join('<br>')}
                `;
                
                calendarGrid.appendChild(dayElement);
            }
            
            const totalCells = 42; 
            const cellsUsed = firstDay + daysInMonth;
            for (let day = 1; cellsUsed + day - 1 < totalCells; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day other-month';
                dayElement.textContent = day;
                calendarGrid.appendChild(dayElement);
            }
        }

        function getEventsForDay(day) {
            const events = [];
            if (day === 12) events.push('📦 Entrega');
            if (day === 15) events.push('🔍 Inspección');
            if (day === 20) events.push('📋 Reunión');
            return events;
        }

        prevMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
        });

        nextMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
        });

        generateCalendar();

        const style = document.createElement('style');
        style.textContent = `
            .badge {
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 500;
            }
            .badge-success {
                background: var(--accent-color);
                color: white;
            }
            .badge-warning {
                background: var(--secondary-color);
                color: white;
            }
        `;
        document.head.appendChild(style);

        console.log('ObraSmart v1.0 - Sistema de Gestión de Obras Inteligente');
       // Funcionalidad para formularios de obras
const obraForm = document.querySelector('#obras .form-grid');
if (obraForm) {
    const nuevaObraBtn = document.querySelector('#obras .btn-primary');
    nuevaObraBtn.addEventListener('click', () => {
        const inputs = obraForm.querySelectorAll('.form-input');
        const values = Array.from(inputs).map(input => input.value.trim());
        
        if (values.some(val => val === '')) {
            notificationSystem.show('Por favor complete todos los campos', 'warning');
            return;
        }
        
        // Agregar nueva fila a la tabla
        const tbody = document.querySelector('#obras tbody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${values[0]}</td>
            <td>${values[1]}</td>
            <td>$${parseInt(values[3]).toLocaleString()}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                0%
            </td>
            <td><span class="badge badge-success">Activa</span></td>
            <td>
                <button class="btn btn-secondary">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(newRow);
        
        // Limpiar formulario
        inputs.forEach(input => input.value = '');
        notificationSystem.show('Obra registrada exitosamente', 'success');
    });
}

const materialForm = document.querySelector('#materiales .form-grid');
if (materialForm) {
    const nuevoMaterialBtn = document.querySelector('#materiales .btn-primary');
    nuevoMaterialBtn.addEventListener('click', () => {
        const inputs = materialForm.querySelectorAll('.form-input');
        const values = Array.from(inputs).map(input => input.value.trim());
        
        if (values.some(val => val === '' || val === 'Seleccionar unidad')) {
            notificationSystem.show('Por favor complete todos los campos', 'warning');
            return;
        }
        
        const tbody = document.querySelector('#materiales tbody');
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${values[0]}</td>
            <td>${values[1]}</td>
            <td>${values[2]}</td>
            <td>$${parseInt(values[3]).toLocaleString()}</td>
            <td>0 ${values[2]}</td>
            <td>
                <button class="btn btn-secondary">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(newRow);
        
        inputs.forEach(input => {
            if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else {
                input.value = '';
            }
        });
        notificationSystem.show('Material registrado exitosamente', 'success');
    });
}

document.addEventListener('click', (e) => {
    if (e.target.closest('.fa-trash')) {
        if (confirm('¿Está seguro de eliminar este material?')) {
            e.target.closest('tr').remove();
            notificationSystem.show('Material eliminado', 'success');
        }
    }
});

const analisisButtons = document.querySelectorAll('#ia .btn');
analisisButtons.forEach(btn => {
    if (btn.id !== 'sendChat') {
        btn.addEventListener('click', () => {
            const loadingText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizando...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = loadingText;
                btn.disabled = false;
                
                const analysisType = btn.textContent.trim();
                let message = '';
                
                if (analysisType.includes('Presupuesto')) {
                    message = 'Análisis completado: Se detectaron 3 oportunidades de optimización que podrían generar un ahorro del 12%. Se recomienda revisar los precios de cemento y acero.';
                } else if (analysisType.includes('Logística')) {
                    message = 'Recomendación: Basándome en el cronograma actual, sugiero adelantar el pedido de varillas para la semana 3. Stock crítico detectado en cemento.';
                } else if (analysisType.includes('Riesgos')) {
                    message = 'Análisis de riesgos: Riesgo medio detectado en actividades de cimentación por posibles retrasos en permisos. Probabilidad de lluvia alta para las próximas 2 semanas.';
                }
                
                addMessage(message);
            }, 3000);
        });
    }
});

function updateStats() {
    const obrasCount = document.querySelectorAll('#obras tbody tr').length;
    const materialesCount = document.querySelectorAll('#materiales tbody tr').length;
    const alertasCount = Math.floor(Math.random() * 15) + 5;
    
    document.querySelector('.stat-card .stat-number').textContent = obrasCount;
    document.querySelector('.stat-card.secondary .stat-number').textContent = materialesCount;
    document.querySelector('.stat-card.warning .stat-number').textContent = alertasCount;
}

setInterval(updateStats, 30000);



class AlarmSystem {
    constructor() {
        this.alarms = [
            { id: 1, message: 'Stock bajo de cemento (< 100kg)', type: 'warning', active: true },
            { id: 2, message: 'Entrega retrasada - Torre Central', type: 'error', active: true },
            { id: 3, message: 'Revisión programada para mañana', type: 'info', active: true }
        ];
        this.checkAlarms();
    }
    
    checkAlarms() {
        this.alarms.forEach(alarm => {
            if (alarm.active) {
                notificationSystem.show(alarm.message, alarm.type, 6000);
                alarm.active = false; 
            }
        });
    }
    
    addAlarm(message, type = 'info') {
        const newAlarm = {
            id: Date.now(),
            message,
            type,
            active: true
        };
        this.alarms.push(newAlarm);
        notificationSystem.show(message, type);
        notificationSystem.addNotification();
    }
}

const alarmSystem = new AlarmSystem();

document.addEventListener('click', (e) => {
    if (e.target.closest('.fa-eye')) {
        notificationSystem.show('Abriendo vista detallada...', 'info');
    }
    
    if (e.target.closest('.fa-edit')) {
        notificationSystem.show('Modo de edición activado', 'warning');
    }
    
    if (e.target.closest('.fa-download')) {
        notificationSystem.show('Descargando archivo...', 'success');
    }
    
    if (e.target.closest('.notification-badge')) {
        notificationSystem.show('Todas las notificaciones revisadas', 'success');
        notificationSystem.clearNotifications();
    }
});

setInterval(() => {
    if (Math.random() > 0.8) {
        const messages = [
            { msg: 'Nueva entrega programada para mañana', type: 'info' },
            { msg: 'Actualización de precios disponible', type: 'warning' },
            { msg: 'Revisión de calidad completada', type: 'success' },
            { msg: 'Material crítico: Stock bajo', type: 'error' }
        ];
        const random = messages[Math.floor(Math.random() * messages.length)];
        alarmSystem.addAlarm(random.msg, random.type);
    }
}, 30000);

function addCalendarEvents() {
    const events = {
        '12': ['📦 Entrega cemento', '🚛 Transporte'],
        '15': ['🔍 Inspección torre', '📋 Reporte'],
        '20': ['📋 Reunión cliente', '💼 Presentación'],
        '25': ['🏗️ Inicio fase 2', '⚡ Actividad crítica']
    };
    
    const calendarDays = document.querySelectorAll('.calendar-day:not(.other-month)');
    calendarDays.forEach(day => {
        const dayNumber = day.querySelector('strong')?.textContent;
        if (events[dayNumber]) {
            const eventList = events[dayNumber].map(event => 
                `<div style="background: var(--primary-color); color: white; padding: 0.2rem; margin: 0.1rem 0; border-radius: 3px; font-size: 0.7rem;">${event}</div>`
            ).join('');
            day.innerHTML += eventList;
        }
    });
}

const originalGenerateCalendar = generateCalendar;
generateCalendar = function() {
    originalGenerateCalendar.call(this);
    setTimeout(addCalendarEvents, 100);
};

const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .form-input:focus {
        transform: scale(1.02);
    }
    
    .quick-action:active {
        transform: translateY(0) scale(0.98);
    }
    
    .btn:active {
        transform: translateY(0) scale(0.95);
    }
    
    .table tbody tr {
        transition: all 0.2s ease;
    }
    
    .upload-area.uploading {
        border-color: var(--accent-color);
        background: rgba(16, 185, 129, 0.1);
    }
`;
document.head.appendChild(animationStyles);

function addSearchFunctionality() {
    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
        const thead = table.querySelector('thead');
        if (thead) {
            const searchRow = document.createElement('tr');
            const headers = thead.querySelectorAll('th');
            
            headers.forEach((header, index) => {
                const searchCell = document.createElement('th');
                if (index < headers.length - 1) { 
                    searchCell.innerHTML = `<input type="text" style="width: 100%; padding: 0.25rem; border: 1px solid var(--border); border-radius: 4px;" placeholder="Buscar...">`;
                    const input = searchCell.querySelector('input');
                    input.addEventListener('input', (e) => {
                        filterTable(table, index, e.target.value);
                    });
                }
                searchRow.appendChild(searchCell);
            });
            
            thead.appendChild(searchRow);
        }
    });
}

function filterTable(table, columnIndex, searchTerm) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cell = row.cells[columnIndex];
        if (cell) {
            const cellText = cell.textContent.toLowerCase();
            const shouldShow = cellText.includes(searchTerm.toLowerCase());
            row.style.display = shouldShow ? '' : 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    addCalendarEvents();
    addSearchFunctionality();
});

console.log('funcionando feature');
// Sistema de almacenamiento local para ObraSmart
class DataStorage {
    constructor() {
        this.storageKeys = {
            obras: 'obrasmart_obras',
            materiales: 'obrasmart_materiales',
            archivos: 'obrasmart_archivos',
            eventos: 'obrasmart_eventos',
            configuracion: 'obrasmart_config'
        };
        this.initializeStorage();
    }

    // Inicializar datos por defecto si no existen
    initializeStorage() {
        if (!this.getData('obras')) {
            this.saveData('obras', [
                {
                    id: 'OB-001',
                    codigo: 'OB-001',
                    nombre: 'Torre Residencial Central',
                    objeto: 'Construcción edificio residencial',
                    valor: 500000000,
                    duracion: 365,
                    fechaInicio: '2025-01-15',
                    progreso: 45,
                    estado: 'Activa'
                },
                {
                    id: 'OB-002',
                    codigo: 'OB-002',
                    nombre: 'Centro Comercial Norte',
                    objeto: 'Construcción centro comercial',
                    valor: 750000000,
                    duracion: 400,
                    fechaInicio: '2024-10-01',
                    progreso: 78,
                    estado: 'Activa'
                }
            ]);
        }

        if (!this.getData('materiales')) {
            this.saveData('materiales', [
                {
                    id: 'MAT-001',
                    codigo: 'MAT-001',
                    nombre: 'Cemento Portland',
                    unidad: 'kg',
                    precio: 25000,
                    stock: 500
                },
                {
                    id: 'MAT-002',
                    codigo: 'MAT-002',
                    nombre: 'Varilla #4',
                    unidad: 'unidad',
                    precio: 15000,
                    stock: 200
                }
            ]);
        }

        if (!this.getData('archivos')) {
            this.saveData('archivos', [
                {
                    id: 'ARCH-001',
                    nombre: 'presupuesto_torre_central.xlsx',
                    tipo: 'Presupuesto',
                    fecha: '2025-06-08',
                    estado: 'Procesado'
                }
            ]);
        }

        if (!this.getData('eventos')) {
            this.saveData('eventos', [
                {
                    id: 'EV-001',
                    fecha: '2025-06-12',
                    titulo: 'Entrega de materiales',
                    obra: 'Torre Residencial',
                    tipo: 'Entrega'
                },
                {
                    id: 'EV-002',
                    fecha: '2025-06-15',
                    titulo: 'Revisión de calidad',
                    obra: 'Centro Comercial',
                    tipo: 'Inspección'
                }
            ]);
        }
    }

    saveData(key, data) {
        try {
            localStorage.setItem(this.storageKeys[key], JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando datos:', error);
            return false;
        }
    }

    getData(key) {
        try {
            const data = localStorage.getItem(this.storageKeys[key]);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error obteniendo datos:', error);
            return null;
        }
    }

    addObra(obra) {
        const obras = this.getData('obras') || [];
        obra.id = `OB-${String(obras.length + 1).padStart(3, '0')}`;
        obra.progreso = 0;
        obra.estado = 'Activa';
        obras.push(obra);
        this.saveData('obras', obras);
        return obra;
    }

    addMaterial(material) {
        const materiales = this.getData('materiales') || [];
        material.id = `MAT-${String(materiales.length + 1).padStart(3, '0')}`;
        material.stock = 0;
        materiales.push(material);
        this.saveData('materiales', materiales);
        return material;
    }

    deleteMaterial(id) {
        const materiales = this.getData('materiales') || [];
        const updatedMateriales = materiales.filter(m => m.id !== id);
        this.saveData('materiales', updatedMateriales);
        return true;
    }

    addArchivo(archivo) {
        const archivos = this.getData('archivos') || [];
        archivo.id = `ARCH-${String(archivos.length + 1).padStart(3, '0')}`;
        archivo.fecha = new Date().toISOString().split('T')[0];
        archivo.estado = 'Procesado';
        archivos.push(archivo);
        this.saveData('archivos', archivos);
        return archivo;
    }

    updateObraProgress(id, progreso) {
        const obras = this.getData('obras') || [];
        const obra = obras.find(o => o.id === id);
        if (obra) {
            obra.progreso = progreso;
            this.saveData('obras', obras);
            return true;
        }
        return false;
    }

    getStats() {
        const obras = this.getData('obras') || [];
        const materiales = this.getData('materiales') || [];
        const eventos = this.getData('eventos') || [];
        
        return {
            obrasActivas: obras.filter(o => o.estado === 'Activa').length,
            totalMateriales: materiales.length,
            alertasPendientes: Math.floor(Math.random() * 15) + 5
        };
    }
}

const dataStorage = new DataStorage();

function loadObrasTable() {
    const tbody = document.querySelector('#obras tbody');
    const obras = dataStorage.getData('obras') || [];
    
    tbody.innerHTML = '';
    obras.forEach(obra => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${obra.codigo}</td>
            <td>${obra.nombre}</td>
            <td>$${obra.valor.toLocaleString()}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${obra.progreso}%"></div>
                </div>
                ${obra.progreso}%
            </td>
            <td><span class="badge badge-success">${obra.estado}</span></td>
            <td>
                <button class="btn btn-secondary">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadMaterialesTable() {
    const tbody = document.querySelector('#materiales tbody');
    const materiales = dataStorage.getData('materiales') || [];
    
    tbody.innerHTML = '';
    materiales.forEach(material => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${material.codigo}</td>
            <td>${material.nombre}</td>
            <td>${material.unidad}</td>
            <td>$${material.precio.toLocaleString()}</td>
            <td>${material.stock} ${material.unidad}</td>
            <td>
                <button class="btn btn-secondary">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary" onclick="deleteMaterial('${material.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadArchivosTable() {
    const tbody = document.querySelector('#archivos tbody');
    const archivos = dataStorage.getData('archivos') || [];
    
    tbody.innerHTML = '';
    archivos.forEach(archivo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${archivo.nombre}</td>
            <td>${archivo.tipo}</td>
            <td>${archivo.fecha}</td>
            <td><span class="badge badge-success">${archivo.estado}</span></td>
            <td>
                <button class="btn btn-secondary">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-secondary">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadEventosTable() {
    const tbody = document.querySelector('#calendario tbody');
    const eventos = dataStorage.getData('eventos') || [];
    
    if (tbody) {
        tbody.innerHTML = '';
        eventos.forEach(evento => {
            const row = document.createElement('tr');
            const badgeClass = evento.tipo === 'Entrega' ? 'badge-success' : 'badge-warning';
            row.innerHTML = `
                <td>${evento.fecha}</td>
                <td>${evento.titulo}</td>
                <td>${evento.obra}</td>
                <td><span class="badge ${badgeClass}">${evento.tipo}</span></td>
            `;
            tbody.appendChild(row);
        });
    }
}

function updateStatsFromStorage() {
    const stats = dataStorage.getStats();
    const statCards = document.querySelectorAll('.stat-number');
    
    if (statCards[0]) statCards[0].textContent = stats.obrasActivas;
    if (statCards[1]) statCards[1].textContent = stats.totalMateriales;
    if (statCards[2]) statCards[2].textContent = stats.alertasPendientes;
}

function deleteMaterial(id) {
    if (confirm('¿Está seguro de eliminar este material?')) {
        dataStorage.deleteMaterial(id);
        loadMaterialesTable();
        updateStatsFromStorage();
        notificationSystem.show('Material eliminado exitosamente', 'success');
    }
}

const originalObraHandler = document.querySelector('#obras .btn-primary');
if (originalObraHandler) {
    originalObraHandler.replaceWith(originalObraHandler.cloneNode(true));
    document.querySelector('#obras .btn-primary').addEventListener('click', () => {
        const inputs = document.querySelectorAll('#obras .form-input');
        const values = Array.from(inputs).map(input => input.value.trim());
        
        if (values.some(val => val === '')) {
            notificationSystem.show('Por favor complete todos los campos', 'warning');
            return;
        }
        
        const nuevaObra = {
            codigo: values[0],
            nombre: values[1],
            objeto: values[2],
            valor: parseInt(values[3]),
            duracion: parseInt(values[4]),
            fechaInicio: values[5]
        };
        
        dataStorage.addObra(nuevaObra);
        loadObrasTable();
        updateStatsFromStorage();
        
        inputs.forEach(input => input.value = '');
        notificationSystem.show('Obra registrada exitosamente', 'success');
    });
}

const originalMaterialHandler = document.querySelector('#materiales .btn-primary');
if (originalMaterialHandler) {
    originalMaterialHandler.replaceWith(originalMaterialHandler.cloneNode(true));
    document.querySelector('#materiales .btn-primary').addEventListener('click', () => {
        const inputs = document.querySelectorAll('#materiales .form-input');
        const values = Array.from(inputs).map(input => input.value.trim());
        
        if (values.some(val => val === '' || val === 'Seleccionar unidad')) {
            notificationSystem.show('Por favor complete todos los campos', 'warning');
            return;
        }
        
        const nuevoMaterial = {
            codigo: values[0],
            nombre: values[1],
            unidad: values[2],
            precio: parseInt(values[3])
        };
        
        dataStorage.addMaterial(nuevoMaterial);
        loadMaterialesTable();
        updateStatsFromStorage();
        
        inputs.forEach(input => {
            if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else {
                input.value = '';
            }
        });
        notificationSystem.show('Material registrado exitosamente', 'success');
    });
}

function handleFileUploadWithStorage(file, area) {
    const icon = area.querySelector('.upload-icon');
    const text = area.querySelector('p');
    
    icon.className = 'fas fa-check-circle upload-icon';
    icon.style.color = 'var(--accent-color)';
    text.textContent = `Archivo cargado: ${file.name}`;
    
    // Determinar tipo de archivo
    let tipo = 'Documento';
    if (area.id === 'presupuesto-upload') {
        tipo = 'Presupuesto';
    } else if (area.id === 'programacion-upload') {
        tipo = 'Programación';
    }
    
    // Guardar en localStorage
    const nuevoArchivo = {
        nombre: file.name,
        tipo: tipo
    };
    
    dataStorage.addArchivo(nuevoArchivo);
    loadArchivosTable();
    
    setTimeout(() => {
        notificationSystem.show('Archivo cargado y guardado exitosamente', 'success');
    }, 1000);
}

window.handleFileUpload = handleFileUploadWithStorage;

document.addEventListener('DOMContentLoaded', () => {
    loadObrasTable();
    loadMaterialesTable();
    loadArchivosTable();
    loadEventosTable();
    updateStatsFromStorage();
});

document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        setTimeout(() => {
            if (targetTab === 'obras') loadObrasTable();
            if (targetTab === 'materiales') loadMaterialesTable();
            if (targetTab === 'archivos') loadArchivosTable();
            if (targetTab === 'calendario') loadEventosTable();
            if (targetTab === 'inicio') updateStatsFromStorage();
        }, 100);
    });
});

console.log('localStorage funcionando');
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.count = 3;
        this.createNotificationContainer();
        this.updateBadge();
    }
    
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
            ">×</button>
        `;
        
        notification.dataset.id = id;
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
        }
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            this.remove(id);
        }, duration);
        
        this.notifications.push(id);
        return id;
    }
    
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
    
    addNotification() {
        this.count++;
        this.updateBadge();
    }
    
    clearNotifications() {
        this.count = 0;
        this.updateBadge();
    }
}
window.notificationSystem = new NotificationSystem();
class DataManager {
    constructor() {
        this.storageKeys = {
            obras: 'obrasmart_obras',
            materiales: 'obrasmart_materiales',
            archivos: 'obrasmart_archivos',
            eventos: 'obrasmart_eventos'
        };
        this.initializeStorage();
    }

    initializeStorage() {
        if (!localStorage.getItem(this.storageKeys.obras)) {
            this.saveData('obras', [
                {
                    id: 'OB-001',
                    codigo: 'OB-001',
                    nombre: 'Torre Residencial Central',
                    valor: 500000000,
                    progreso: 45,
                    estado: 'Activa'
                }
            ]);
        }
    }

    saveData(key, data) {
        try {
            localStorage.setItem(this.storageKeys[key], JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error guardando datos:', error);
            this[key] = data;
            return false;
        }
    }

    getData(key) {
        try {
            const data = localStorage.getItem(this.storageKeys[key]);
            return data ? JSON.parse(data) : (this[key] || null);
        } catch (error) {
            console.error('Error obteniendo datos:', error);
            return this[key] || null;
        }
    }
}

window.dataManager = new DataManager();

function deleteMaterial(id) {
    if (confirm('¿Está seguro de eliminar este material?')) {
        const materiales = window.dataManager.getData('materiales') || [];
        const updated = materiales.filter(m => m.id !== id);
        window.dataManager.saveData('materiales', updated);
        loadMaterialesTable();
        window.notificationSystem.show('Material eliminado exitosamente', 'success');
    }
}


window.handleFileUpload = function(file, area) {
    const icon = area.querySelector('.upload-icon');
    const text = area.querySelector('p');
    
    if (icon && text) {
        icon.className = 'fas fa-check-circle upload-icon';
        icon.style.color = 'var(--accent-color)';
        text.textContent = `Archivo cargado: ${file.name}`;
        
        setTimeout(() => {
            window.notificationSystem.show('Archivo cargado exitosamente', 'success');
        }, 1000);
    }
};

function initializeApp() {
    try {
        if (!window.notificationSystem) {
            window.notificationSystem = new NotificationSystem();
        }
        
        if (!window.dataManager) {
            window.dataManager = new DataManager();
        }

        updateStats();
        
        console.log('ObraSmart v1.0 - Sistema inicializado correctamente');
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
    }
}
function abrirModalUsuario() {
      document.getElementById('modalUsr').style.display = 'block';
    }

    function cerrarModalUsuario() {
      document.getElementById('modalUsr').style.display = 'none';
    }
document.addEventListener('DOMContentLoaded', initializeApp);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}