/**
 * formObras.js - Gestión de Formularios y Tabla de Obras
 * Sistema ObraSmart v1.0
 */

class ObrasManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindFormHandler();
        this.bindTableEvents();
        this.loadTable();
    }

    /**
     * Vincula el evento del formulario de nueva obra
     */
    bindFormHandler() {
        const nuevaObraBtn = document.querySelector('#obras .btn-primary');
        if (nuevaObraBtn) {
            // Reemplazar cualquier listener existente
            nuevaObraBtn.replaceWith(nuevaObraBtn.cloneNode(true));
            
            document.querySelector('#obras .btn-primary').addEventListener('click', () => {
                this.handleSubmit();
            });
        }
    }

    /**
     * Maneja el envío del formulario de nueva obra
     */
    handleSubmit() {
        const inputs = document.querySelectorAll('#obras .form-input');
        const values = Array.from(inputs).map(input => input.value.trim());
        
        // Validar campos obligatorios
        if (this.validateForm(values)) {
            const nuevaObra = this.createObraObject(values);
            this.saveObra(nuevaObra);
            this.clearForm(inputs);
            this.showSuccessMessage();
        }
    }

    /**
     * Valida los campos del formulario
     */
    validateForm(values) {
        if (values.some(val => val === '')) {
            if (window.notificationSystem) {
                window.notificationSystem.show('Por favor complete todos los campos', 'warning');
            } else {
                alert('Por favor complete todos los campos');
            }
            return false;
        }

        // Validar formato de fecha
        const fechaInicio = values[5];
        if (fechaInicio && !this.isValidDate(fechaInicio)) {
            if (window.notificationSystem) {
                window.notificationSystem.show('Formato de fecha inválido', 'warning');
            } else {
                alert('Formato de fecha inválido');
            }
            return false;
        }

        // Validar valores numéricos
        const valor = parseInt(values[3]);
        const duracion = parseInt(values[4]);
        
        if (isNaN(valor) || valor <= 0) {
            if (window.notificationSystem) {
                window.notificationSystem.show('El valor debe ser un número positivo', 'warning');
            } else {
                alert('El valor debe ser un número positivo');
            }
            return false;
        }

        if (isNaN(duracion) || duracion <= 0) {
            if (window.notificationSystem) {
                window.notificationSystem.show('La duración debe ser un número positivo', 'warning');
            } else {
                alert('La duración debe ser un número positivo');
            }
            return false;
        }

        return true;
    }

    /**
     * Valida formato de fecha
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Crea objeto obra a partir de los valores del formulario
     */
    createObraObject(values) {
        return {
            codigo: values[0],
            nombre: values[1],
            objeto: values[2],
            valor: parseInt(values[3]),
            duracion: parseInt(values[4]),
            fechaInicio: values[5],
            progreso: 0,
            estado: 'Activa',
            fechaCreacion: new Date().toISOString().split('T')[0]
        };
    }

    /**
     * Guarda la obra usando el sistema de storage
     */
    saveObra(obra) {
        if (window.dataStorage) {
            // Si existe el sistema de storage completo
            window.dataStorage.addObra(obra);
        } else if (window.dataManager) {
            // Si existe el manager básico
            const obras = window.dataManager.getData('obras') || [];
            obra.id = `OB-${String(obras.length + 1).padStart(3, '0')}`;
            obras.push(obra);
            window.dataManager.saveData('obras', obras);
        } else {
            // Fallback a localStorage directo
            const obras = this.getObrasFromStorage();
            obra.id = `OB-${String(obras.length + 1).padStart(3, '0')}`;
            obras.push(obra);
            this.saveObrasToStorage(obras);
        }
        
        this.loadTable();
        this.updateStats();
    }

    /**
     * Limpia el formulario después de envío exitoso
     */
    clearForm(inputs) {
        inputs.forEach(input => {
            input.value = '';
        });
    }

    /**
     * Muestra mensaje de éxito
     */
    showSuccessMessage() {
        if (window.notificationSystem) {
            window.notificationSystem.show('Obra registrada exitosamente', 'success');
        } else {
            alert('Obra registrada exitosamente');
        }
    }

    /**
     * Carga y actualiza la tabla de obras
     */
    loadTable() {
        const tbody = document.querySelector('#obras tbody');
        if (!tbody) return;

        const obras = this.getObras();
        
        tbody.innerHTML = '';
        obras.forEach(obra => {
            const row = this.createTableRow(obra);
            tbody.appendChild(row);
        });
    }

    /**
     * Crea una fila de la tabla para una obra
     */
    createTableRow(obra) {
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
                <button class="btn btn-secondary" onclick="obrasManager.viewObra('${obra.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-secondary" onclick="obrasManager.editObra('${obra.id}')">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        return row;
    }

    /**
     * Obtiene las obras desde el sistema de storage
     */
    getObras() {
        if (window.dataStorage) {
            return window.dataStorage.getData('obras') || [];
        } else if (window.dataManager) {
            return window.dataManager.getData('obras') || [];
        } else {
            return this.getObrasFromStorage();
        }
    }

    /**
     * Fallback para obtener obras desde localStorage
     */
    getObrasFromStorage() {
        try {
            const data = localStorage.getItem('obrasmart_obras');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error obteniendo obras:', error);
            return [];
        }
    }

    /**
     * Fallback para guardar obras en localStorage
     */
    saveObrasToStorage(obras) {
        try {
            localStorage.setItem('obrasmart_obras', JSON.stringify(obras));
            return true;
        } catch (error) {
            console.error('Error guardando obras:', error);
            return false;
        }
    }

    /**
     * Vincula eventos de la tabla
     */
    bindTableEvents() {
        // Los eventos de ver y editar se manejan desde onclick inline
        // para mayor compatibilidad con la carga dinámica
    }

    /**
     * Ver detalles de una obra
     */
    viewObra(id) {
        const obras = this.getObras();
        const obra = obras.find(o => o.id === id);
        
        if (obra) {
            // Por ahora mostrar en alert, después se puede implementar modal
            const detalles = `
Código: ${obra.codigo}
Nombre: ${obra.nombre}
Objeto: ${obra.objeto}
Valor: $${obra.valor.toLocaleString()}
Duración: ${obra.duracion} días
Fecha Inicio: ${obra.fechaInicio}
Progreso: ${obra.progreso}%
Estado: ${obra.estado}
            `.trim();
            
            if (window.notificationSystem) {
                window.notificationSystem.show('Abriendo vista detallada...', 'info');
            }
            alert(detalles);
        }
    }

    /**
     * Editar una obra
     */
    editObra(id) {
        const obras = this.getObras();
        const obra = obras.find(o => o.id === id);
        
        if (obra) {
            // Cargar datos en el formulario
            const inputs = document.querySelectorAll('#obras .form-input');
            if (inputs[0]) inputs[0].value = obra.codigo;
            if (inputs[1]) inputs[1].value = obra.nombre;
            if (inputs[2]) inputs[2].value = obra.objeto || '';
            if (inputs[3]) inputs[3].value = obra.valor;
            if (inputs[4]) inputs[4].value = obra.duracion || '';
            if (inputs[5]) inputs[5].value = obra.fechaInicio || '';
            
            if (window.notificationSystem) {
                window.notificationSystem.show('Datos cargados para edición', 'warning');
            }
            
            // Scroll al formulario
            const formSection = document.querySelector('#obras .form-grid');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    /**
     * Actualizar progreso de una obra
     */
    updateProgress(id, newProgress) {
        if (window.dataStorage) {
            window.dataStorage.updateObraProgress(id, newProgress);
        } else {
            const obras = this.getObras();
            const obra = obras.find(o => o.id === id);
            if (obra) {
                obra.progreso = Math.min(100, Math.max(0, newProgress));
                
                if (obra.progreso === 100) {
                    obra.estado = 'Completada';
                }
                
                if (window.dataManager) {
                    window.dataManager.saveData('obras', obras);
                } else {
                    this.saveObrasToStorage(obras);
                }
                
                this.loadTable();
            }
        }
    }

    /**
     * Actualiza las estadísticas del dashboard
     */
    updateStats() {
        if (window.updateStatsFromStorage) {
            window.updateStatsFromStorage();
        } else {
            // Actualización básica de estadísticas
            const obras = this.getObras();
            const obrasActivas = obras.filter(o => o.estado === 'Activa').length;
            
            const statNumber = document.querySelector('.stat-number');
            if (statNumber) {
                statNumber.textContent = obrasActivas;
            }
        }
    }

    /**
     * Eliminar una obra
     */
    deleteObra(id) {
        if (confirm('¿Está seguro de eliminar esta obra?')) {
            const obras = this.getObras();
            const updatedObras = obras.filter(o => o.id !== id);
            
            if (window.dataStorage) {
                window.dataStorage.saveData('obras', updatedObras);
            } else if (window.dataManager) {
                window.dataManager.saveData('obras', updatedObras);
            } else {
                this.saveObrasToStorage(updatedObras);
            }
            
            this.loadTable();
            this.updateStats();
            
            if (window.notificationSystem) {
                window.notificationSystem.show('Obra eliminada exitosamente', 'success');
            }
        }
    }

    /**
     * Buscar obras por texto
     */
    searchObras(searchTerm) {
        const rows = document.querySelectorAll('#obras tbody tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const shouldShow = text.includes(term);
            row.style.display = shouldShow ? '' : 'none';
        });
    }

    /**
     * Exportar obras a CSV
     */
    exportToCSV() {
        const obras = this.getObras();
        const headers = ['Código', 'Nombre', 'Objeto', 'Valor', 'Duración', 'Fecha Inicio', 'Progreso', 'Estado'];
        
        const csvContent = [
            headers.join(','),
            ...obras.map(obra => [
                obra.codigo,
                `"${obra.nombre}"`,
                `"${obra.objeto || ''}"`,
                obra.valor,
                obra.duracion || '',
                obra.fechaInicio || '',
                obra.progreso,
                obra.estado
            ].join(','))
        ].join('\n');
        
        // Crear y descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `obras_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        if (window.notificationSystem) {
            window.notificationSystem.show('Archivo CSV exportado exitosamente', 'success');
        }
    }
}

// Inicializar el gestor de obras
let obrasManager;

// Función de inicialización
function initializeObrasManager() {
    if (!obrasManager) {
        obrasManager = new ObrasManager();
        console.log('ObrasManager inicializado');
    }
}

// Función para recargar la tabla (usada por otros módulos)
function reloadObrasTable() {
    if (obrasManager) {
        obrasManager.loadTable();
    }
}

// Event listeners para inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeObrasManager);
} else {
    initializeObrasManager();
}

// Hacer funciones globales disponibles
window.obrasManager = obrasManager;
window.reloadObrasTable = reloadObrasTable;

// Exportar para uso con módulos ES6 si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ObrasManager, initializeObrasManager, reloadObrasTable };
}