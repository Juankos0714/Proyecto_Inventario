/**
 * formMateriales.js
 * Gestión completa del módulo de materiales en ObraSmart
 * Incluye: formularios, tabla, validaciones, búsqueda y CRUD
 */

class MaterialesManager {
    constructor() {
        this.storageKey = 'obrasmart_materiales';
        this.initializeEvents();
        this.loadMaterialesTable();
        this.addSearchFunctionality();
    }

    /**
     * Inicializa todos los event listeners relacionados con materiales
     */
    initializeEvents() {
        // Formulario de nuevo material
        const nuevoMaterialBtn = document.querySelector('#materiales .btn-primary');
        if (nuevoMaterialBtn) {
            nuevoMaterialBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNuevoMaterial();
            });
        }

        // Event listeners para botones de acción en la tabla
        this.initializeTableEvents();

        // Validación en tiempo real
        this.addFormValidation();
    }

    /**
     * Maneja la creación de un nuevo material
     */
    handleNuevoMaterial() {
        const materialForm = document.querySelector('#materiales .form-grid');
        if (!materialForm) return;

        const inputs = materialForm.querySelectorAll('.form-input');
        const values = Array.from(inputs).map(input => input.value.trim());
        
        // Validación de campos obligatorios
        if (this.validateForm(values)) {
            const nuevoMaterial = this.createMaterialObject(values);
            
            if (this.saveMaterial(nuevoMaterial)) {
                this.clearForm(inputs);
                this.loadMaterialesTable();
                this.updateStats();
                window.notificationSystem?.show('Material registrado exitosamente', 'success');
            } else {
                window.notificationSystem?.show('Error al guardar el material', 'error');
            }
        }
    }

    /**
     * Valida el formulario de materiales
     */
    validateForm(values) {
        // Verificar campos vacíos
        if (values.some(val => val === '' || val === 'Seleccionar unidad')) {
            window.notificationSystem?.show('Por favor complete todos los campos', 'warning');
            return false;
        }

        // Validar código único
        const existingMaterials = this.getMateriales();
        if (existingMaterials.some(material => material.codigo === values[0])) {
            window.notificationSystem?.show('El código de material ya existe', 'warning');
            return false;
        }

        // Validar precio numérico
        const precio = parseFloat(values[3]);
        if (isNaN(precio) || precio <= 0) {
            window.notificationSystem?.show('El precio debe ser un número válido mayor a 0', 'warning');
            return false;
        }

        return true;
    }

    /**
     * Crea el objeto material a partir de los valores del formulario
     */
    createMaterialObject(values) {
        const materiales = this.getMateriales();
        return {
            id: `MAT-${String(materiales.length + 1).padStart(3, '0')}`,
            codigo: values[0],
            nombre: values[1],
            unidad: values[2],
            precio: parseFloat(values[3]),
            stock: 0,
            fechaCreacion: new Date().toISOString().split('T')[0],
            activo: true
        };
    }

    /**
     * Guarda un material en el almacenamiento
     */
    saveMaterial(material) {
        try {
            const materiales = this.getMateriales();
            materiales.push(material);
            
            if (window.dataManager) {
                return window.dataManager.saveData('materiales', materiales);
            } else {
                localStorage.setItem(this.storageKey, JSON.stringify(materiales));
                return true;
            }
        } catch (error) {
            console.error('Error guardando material:', error);
            return false;
        }
    }

    /**
     * Obtiene todos los materiales del almacenamiento
     */
    getMateriales() {
        try {
            if (window.dataManager) {
                return window.dataManager.getData('materiales') || this.getDefaultMateriales();
            } else {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : this.getDefaultMateriales();
            }
        } catch (error) {
            console.error('Error obteniendo materiales:', error);
            return this.getDefaultMateriales();
        }
    }

    /**
     * Materiales por defecto para inicialización
     */
    getDefaultMateriales() {
        return [
            {
                id: 'MAT-001',
                codigo: 'CEM-001',
                nombre: 'Cemento Portland Tipo I',
                unidad: 'kg',
                precio: 25000,
                stock: 500,
                fechaCreacion: '2025-06-01',
                activo: true
            },
            {
                id: 'MAT-002',
                codigo: 'VAR-004',
                nombre: 'Varilla Corrugada #4',
                unidad: 'unidad',
                precio: 15000,
                stock: 200,
                fechaCreacion: '2025-06-01',
                activo: true
            },
            {
                id: 'MAT-003',
                codigo: 'ARE-001',
                nombre: 'Arena de Río',
                unidad: 'm³',
                precio: 35000,
                stock: 50,
                fechaCreacion: '2025-06-01',
                activo: true
            }
        ];
    }

    /**
     * Carga y renderiza la tabla de materiales
     */
    loadMaterialesTable() {
        const tbody = document.querySelector('#materiales tbody');
        if (!tbody) return;

        const materiales = this.getMateriales().filter(m => m.activo);
        
        tbody.innerHTML = '';
        
        if (materiales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        No hay materiales registrados
                    </td>
                </tr>
            `;
            return;
        }

        materiales.forEach(material => {
            const row = this.createTableRow(material);
            tbody.appendChild(row);
        });

        // Re-inicializar eventos de la tabla después de cargar
        this.initializeTableEvents();
    }

    /**
     * Crea una fila de la tabla para un material
     */
    createTableRow(material) {
        const row = document.createElement('tr');
        row.dataset.materialId = material.id;
        
        // Determinar color del stock
        const stockClass = material.stock < 50 ? 'text-warning' : 
                          material.stock < 20 ? 'text-danger' : '';
        
        row.innerHTML = `
            <td>${material.codigo}</td>
            <td>${material.nombre}</td>
            <td>${material.unidad}</td>
            <td>$${material.precio.toLocaleString()}</td>
            <td class="${stockClass}">
                ${material.stock} ${material.unidad}
                ${material.stock < 20 ? '<i class="fas fa-exclamation-triangle" style="color: var(--secondary-color); margin-left: 0.5rem;"></i>' : ''}
            </td>
            <td>
                <button class="btn btn-secondary btn-edit" title="Editar material">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary btn-stock" title="Actualizar stock">
                    <i class="fas fa-boxes"></i>
                </button>
                <button class="btn btn-secondary btn-delete" title="Eliminar material">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        return row;
    }

    /**
     * Inicializa eventos de la tabla
     */
    initializeTableEvents() {
        const tbody = document.querySelector('#materiales tbody');
        if (!tbody) return;

        // Usar delegación de eventos para botones dinámicos
        tbody.removeEventListener('click', this.handleTableClick);
        tbody.addEventListener('click', this.handleTableClick.bind(this));
    }

    /**
     * Maneja clicks en botones de la tabla
     */
    handleTableClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const row = button.closest('tr');
        const materialId = row?.dataset.materialId;
        
        if (!materialId) return;

        if (button.classList.contains('btn-edit')) {
            this.editMaterial(materialId);
        } else if (button.classList.contains('btn-stock')) {
            this.updateStock(materialId);
        } else if (button.classList.contains('btn-delete')) {
            this.deleteMaterial(materialId);
        }
    }

    /**
     * Edita un material (modal o formulario inline)
     */
    editMaterial(materialId) {
        const material = this.getMateriales().find(m => m.id === materialId);
        if (!material) return;

        // Por ahora, solo mostrar información
        window.notificationSystem?.show(`Editando: ${material.nombre}`, 'info');
        
        // TODO: Implementar modal de edición o formulario inline
        this.showEditModal(material);
    }

    /**
     * Actualiza el stock de un material
     */
    updateStock(materialId) {
        const material = this.getMateriales().find(m => m.id === materialId);
        if (!material) return;

        const newStock = prompt(`Stock actual: ${material.stock} ${material.unidad}\nIngrese nuevo stock:`, material.stock);
        
        if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
            const materiales = this.getMateriales();
            const index = materiales.findIndex(m => m.id === materialId);
            
            if (index !== -1) {
                materiales[index].stock = parseInt(newStock);
                
                if (this.saveMateriales(materiales)) {
                    this.loadMaterialesTable();
                    window.notificationSystem?.show('Stock actualizado correctamente', 'success');
                    
                    // Verificar stock bajo
                    if (parseInt(newStock) < 20) {
                        window.notificationSystem?.show(`¡Alerta! Stock bajo para ${material.nombre}`, 'warning');
                    }
                }
            }
        }
    }

    /**
     * Elimina un material
     */
    deleteMaterial(materialId) {
        const material = this.getMateriales().find(m => m.id === materialId);
        if (!material) return;

        if (confirm(`¿Está seguro de eliminar el material "${material.nombre}"?\nEsta acción no se puede deshacer.`)) {
            const materiales = this.getMateriales();
            const index = materiales.findIndex(m => m.id === materialId);
            
            if (index !== -1) {
                // Marcar como inactivo en lugar de eliminar completamente
                materiales[index].activo = false;
                materiales[index].fechaEliminacion = new Date().toISOString().split('T')[0];
                
                if (this.saveMateriales(materiales)) {
                    this.loadMaterialesTable();
                    this.updateStats();
                    window.notificationSystem?.show('Material eliminado correctamente', 'success');
                }
            }
        }
    }

    /**
     * Guarda la lista completa de materiales
     */
    saveMateriales(materiales) {
        try {
            if (window.dataManager) {
                return window.dataManager.saveData('materiales', materiales);
            } else {
                localStorage.setItem(this.storageKey, JSON.stringify(materiales));
                return true;
            }
        } catch (error) {
            console.error('Error guardando materiales:', error);
            window.notificationSystem?.show('Error al guardar los cambios', 'error');
            return false;
        }
    }

    /**
     * Limpia el formulario
     */
    clearForm(inputs) {
        inputs.forEach(input => {
            if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else {
                input.value = '';
            }
        });
    }

    /**
     * Añade funcionalidad de búsqueda a la tabla
     */
    addSearchFunctionality() {
        const table = document.querySelector('#materiales .table');
        if (!table) return;

        const thead = table.querySelector('thead');
        if (!thead) return;

        // Verificar si ya existe fila de búsqueda
        if (thead.querySelector('.search-row')) return;

        const searchRow = document.createElement('tr');
        searchRow.className = 'search-row';
        
        const headers = thead.querySelectorAll('th');
        
        headers.forEach((header, index) => {
            const searchCell = document.createElement('th');
            searchCell.style.padding = '0.5rem';
            
            if (index < headers.length - 1) { // No agregar búsqueda en columna de acciones
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-input';
                input.placeholder = `Buscar ${header.textContent.toLowerCase()}...`;
                input.style.cssText = `
                    width: 100%;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.8rem;
                    margin: 0;
                `;
                
                input.addEventListener('input', (e) => {
                    this.filterTable(index, e.target.value);
                });
                
                searchCell.appendChild(input);
            }
            
            searchRow.appendChild(searchCell);
        });
        
        thead.appendChild(searchRow);
    }

    /**
     * Filtra la tabla por columna y término de búsqueda
     */
    filterTable(columnIndex, searchTerm) {
        const tbody = document.querySelector('#materiales tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            if (row.cells.length <= columnIndex) return;
            
            const cell = row.cells[columnIndex];
            const cellText = cell.textContent.toLowerCase();
            const shouldShow = cellText.includes(term);
            
            row.style.display = shouldShow ? '' : 'none';
        });
    }

    /**
     * Añade validación en tiempo real al formulario
     */
    addFormValidation() {
        const form = document.querySelector('#materiales .form-grid');
        if (!form) return;

        const inputs = form.querySelectorAll('.form-input');
        
        inputs.forEach((input, index) => {
            input.addEventListener('blur', () => {
                this.validateField(input, index);
            });

            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    /**
     * Valida un campo específico
     */
    validateField(input, index) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch(index) {
            case 0: // Código
                if (!value) {
                    isValid = false;
                    errorMessage = 'El código es obligatorio';
                } else if (!/^[A-Z0-9\-]+$/i.test(value)) {
                    isValid = false;
                    errorMessage = 'Solo se permiten letras, números y guiones';
                }
                break;
            
            case 1: // Nombre
                if (!value) {
                    isValid = false;
                    errorMessage = 'El nombre es obligatorio';
                } else if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'El nombre debe tener al menos 3 caracteres';
                }
                break;
            
            case 3: // Precio
                const precio = parseFloat(value);
                if (!value) {
                    isValid = false;
                    errorMessage = 'El precio es obligatorio';
                } else if (isNaN(precio) || precio <= 0) {
                    isValid = false;
                    errorMessage = 'Ingrese un precio válido mayor a 0';
                } else if (precio > 10000000) {
                    isValid = false;
                    errorMessage = 'El precio parece demasiado alto';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(input, errorMessage);
        } else {
            this.clearFieldError(input);
        }

        return isValid;
    }

    /**
     * Muestra error en un campo
     */
    showFieldError(input, message) {
        this.clearFieldError(input);
        
        input.style.borderColor = 'var(--secondary-color)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: var(--secondary-color);
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
    }

    /**
     * Limpia error de un campo
     */
    clearFieldError(input) {
        input.style.borderColor = '';
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /**
     * Muestra modal de edición
     */
    showEditModal(material) {
        // TODO: Implementar modal de edición completo
        console.log('Editando material:', material);
    }

    /**
     * Actualiza estadísticas
     */
    updateStats() {
        if (typeof updateStatsFromStorage === 'function') {
            updateStatsFromStorage();
        } else if (window.dataManager) {
            // Actualizar estadísticas básicas
            const materiales = this.getMateriales().filter(m => m.activo);
            const statElement = document.querySelector('.stat-card.secondary .stat-number');
            if (statElement) {
                statElement.textContent = materiales.length;
            }
        }
    }

    /**
     * Exporta materiales a CSV
     */
    exportToCSV() {
        const materiales = this.getMateriales().filter(m => m.activo);
        if (materiales.length === 0) {
            window.notificationSystem?.show('No hay materiales para exportar', 'warning');
            return;
        }

        const headers = ['Código', 'Nombre', 'Unidad', 'Precio', 'Stock', 'Fecha Creación'];
        const csvContent = [
            headers.join(','),
            ...materiales.map(m => [
                m.codigo,
                `"${m.nombre}"`,
                m.unidad,
                m.precio,
                m.stock,
                m.fechaCreacion
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `materiales_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.notificationSystem?.show('Materiales exportados exitosamente', 'success');
    }

    /**
     * Obtiene materiales con stock bajo
     */
    getMaterialesStockBajo(limite = 20) {
        return this.getMateriales()
            .filter(m => m.activo && m.stock < limite)
            .sort((a, b) => a.stock - b.stock);
    }

    /**
     * Genera alertas de stock bajo
     */
    checkStockBajo() {
        const materialesStockBajo = this.getMaterialesStockBajo();
        
        materialesStockBajo.forEach(material => {
            const mensaje = `Stock bajo: ${material.nombre} (${material.stock} ${material.unidad})`;
            window.notificationSystem?.show(mensaje, 'warning', 8000);
        });

        return materialesStockBajo;
    }
}

// Inicializar el gestor de materiales cuando el DOM esté listo
let materialesManager;

function initializeMateriales() {
    if (document.querySelector('#materiales')) {
        materialesManager = new MaterialesManager();
        
        // Verificar stock bajo cada 5 minutos
        setInterval(() => {
            if (materialesManager) {
                materialesManager.checkStockBajo();
            }
        }, 5 * 60 * 1000);
        
        console.log('MaterialesManager inicializado correctamente');
    }
}

// Auto-inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMateriales);
} else {
    initializeMateriales();
}

// Exportar para uso global
window.MaterialesManager = MaterialesManager;
window.materialesManager = materialesManager;

// Función global para compatibilidad con código existente
window.deleteMaterial = function(id) {
    if (window.materialesManager) {
        window.materialesManager.deleteMaterial(id);
    }
};