// fileUpload.js - Sistema de Carga de Archivos para ObraSmart

class FileUploadManager {
    constructor() {
        this.uploadAreas = [];
        this.allowedTypes = {
            'presupuesto': ['.xlsx', '.xls', '.csv', '.pdf'],
            'programacion': ['.xlsx', '.xls', '.mpp', '.pdf'],
            'documento': ['.pdf', '.doc', '.docx', '.txt'],
            'plano': ['.dwg', '.pdf', '.jpg', '.png'],
            'imagen': ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
        };
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.init();
    }

    init() {
        this.setupUploadAreas();
        this.setupEventListeners();
        this.addDragAndDropStyles();
    }

    setupUploadAreas() {
        const uploadAreas = document.querySelectorAll('.upload-area');
        uploadAreas.forEach(area => {
            this.initializeUploadArea(area);
        });
    }

    initializeUploadArea(area) {
        const fileInput = area.querySelector('input[type="file"]');
        
        if (!fileInput) {
            console.warn('No se encontró input de archivo en el área de carga');
            return;
        }

        // Configurar tipos de archivo permitidos según el área
        const uploadType = this.getUploadType(area);
        if (uploadType && this.allowedTypes[uploadType]) {
            const acceptTypes = this.allowedTypes[uploadType].join(',');
            fileInput.setAttribute('accept', acceptTypes);
        }

        // Eventos de click
        area.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                fileInput.click();
            }
        });

        // Eventos de drag and drop
        this.setupDragAndDrop(area, fileInput);

        // Evento de cambio de archivo
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0], area);
            }
        });

        this.uploadAreas.push({
            element: area,
            input: fileInput,
            type: uploadType
        });
    }

    setupDragAndDrop(area, fileInput) {
        // Prevenir comportamiento por defecto del navegador
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Resaltar área de drop
        ['dragenter', 'dragover'].forEach(eventName => {
            area.addEventListener(eventName, () => this.highlight(area), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, () => this.unhighlight(area), false);
        });

        // Manejar drop
        area.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0], area);
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight(area) {
        area.classList.add('drag-over');
        area.style.borderColor = 'var(--primary-color)';
        area.style.background = 'rgba(37, 99, 235, 0.1)';
        area.style.transform = 'scale(1.02)';
    }

    unhighlight(area) {
        area.classList.remove('drag-over');
        area.style.borderColor = 'var(--border)';
        area.style.background = 'var(--surface-hover)';
        area.style.transform = 'scale(1)';
    }

    getUploadType(area) {
        // Determinar tipo de carga basado en el ID o clase del área
        if (area.id.includes('presupuesto') || area.closest('#presupuesto-upload')) {
            return 'presupuesto';
        }
        if (area.id.includes('programacion') || area.closest('#programacion-upload')) {
            return 'programacion';
        }
        if (area.id.includes('plano') || area.classList.contains('plano-upload')) {
            return 'plano';
        }
        if (area.id.includes('imagen') || area.classList.contains('imagen-upload')) {
            return 'imagen';
        }
        return 'documento';
    }

    validateFile(file, uploadType) {
        const errors = [];

        // Validar tamaño
        if (file.size > this.maxFileSize) {
            errors.push(`El archivo es demasiado grande. Máximo permitido: ${this.formatFileSize(this.maxFileSize)}`);
        }

        // Validar tipo
        if (uploadType && this.allowedTypes[uploadType]) {
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!this.allowedTypes[uploadType].includes(fileExtension)) {
                errors.push(`Tipo de archivo no permitido. Permitidos: ${this.allowedTypes[uploadType].join(', ')}`);
            }
        }

        // Validar nombre
        if (file.name.length > 100) {
            errors.push('El nombre del archivo es demasiado largo (máximo 100 caracteres)');
        }

        return errors;
    }

    handleFileSelection(file, area) {
        const uploadType = this.getUploadType(area);
        const validationErrors = this.validateFile(file, uploadType);

        if (validationErrors.length > 0) {
            this.showValidationErrors(validationErrors);
            return;
        }

        this.processFile(file, area, uploadType);
    }

    processFile(file, area, uploadType) {
        // Mostrar estado de carga
        this.showUploadProgress(area, file);

        // Simular procesamiento de archivo
        this.simulateFileProcessing(file, area, uploadType);
    }

    showUploadProgress(area, file) {
        const icon = area.querySelector('.upload-icon');
        const text = area.querySelector('p');
        const progressContainer = area.querySelector('.progress-container') || this.createProgressContainer(area);

        if (icon) {
            icon.className = 'fas fa-spinner fa-spin upload-icon';
            icon.style.color = 'var(--primary-color)';
        }

        if (text) {
            text.textContent = `Procesando: ${file.name}`;
        }

        // Mostrar barra de progreso
        progressContainer.style.display = 'block';
        this.animateProgress(progressContainer.querySelector('.progress-bar'));
    }

    createProgressContainer(area) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.cssText = `
            margin-top: 1rem;
            display: none;
        `;

        progressContainer.innerHTML = `
            <div class="progress-bar" style="
                width: 100%;
                height: 4px;
                background: var(--border);
                border-radius: 2px;
                overflow: hidden;
            ">
                <div class="progress-fill" style="
                    height: 100%;
                    background: var(--primary-color);
                    width: 0%;
                    transition: width 0.3s ease;
                "></div>
            </div>
            <div class="progress-text" style="
                margin-top: 0.5rem;
                font-size: 0.8rem;
                color: var(--text-secondary);
                text-align: center;
            ">0%</div>
        `;

        area.appendChild(progressContainer);
        return progressContainer;
    }

    animateProgress(progressBar) {
        const fill = progressBar.querySelector('.progress-fill');
        const text = progressBar.parentElement.querySelector('.progress-text');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;

            fill.style.width = `${progress}%`;
            text.textContent = `${Math.round(progress)}%`;

            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 200);
    }

    simulateFileProcessing(file, area, uploadType) {
        // Simular tiempo de procesamiento variable según el tipo y tamaño
        const processingTime = this.calculateProcessingTime(file, uploadType);

        setTimeout(() => {
            this.completeUpload(file, area, uploadType);
        }, processingTime);
    }

    calculateProcessingTime(file, uploadType) {
        const baseTime = 1000; // 1 segundo base
        const sizeMultiplier = Math.min(file.size / (1024 * 1024), 5); // Máximo 5 segundos por tamaño
        
        const typeMultipliers = {
            'presupuesto': 1.5,
            'programacion': 2,
            'plano': 1.2,
            'imagen': 0.8,
            'documento': 1
        };

        const typeMultiplier = typeMultipliers[uploadType] || 1;
        
        return baseTime + (sizeMultiplier * 1000 * typeMultiplier);
    }

    completeUpload(file, area, uploadType) {
        const icon = area.querySelector('.upload-icon');
        const text = area.querySelector('p');
        const progressContainer = area.querySelector('.progress-container');

        // Actualizar interfaz
        if (icon) {
            icon.className = 'fas fa-check-circle upload-icon';
            icon.style.color = 'var(--accent-color)';
        }

        if (text) {
            text.innerHTML = `
                <strong>Archivo cargado:</strong><br>
                ${file.name}<br>
                <small style="color: var(--text-secondary);">
                    ${this.formatFileSize(file.size)} • ${this.getFileTypeDisplay(uploadType)}
                </small>
            `;
        }

        // Ocultar barra de progreso
        if (progressContainer) {
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 1000);
        }

        // Agregar botones de acción
        this.addFileActions(area, file, uploadType);

        // Guardar archivo en el sistema
        this.saveFileToSystem(file, uploadType);

        // Mostrar notificación de éxito
        this.showSuccessNotification(file, uploadType);
    }

    addFileActions(area, file, uploadType) {
        let actionsContainer = area.querySelector('.file-actions');
        
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'file-actions';
            actionsContainer.style.cssText = `
                margin-top: 1rem;
                display: flex;
                gap: 0.5rem;
                justify-content: center;
            `;
            area.appendChild(actionsContainer);
        }

        actionsContainer.innerHTML = `
            <button class="btn btn-secondary btn-sm" onclick="fileUploadManager.previewFile('${file.name}', '${uploadType}')">
                <i class="fas fa-eye"></i> Ver
            </button>
            <button class="btn btn-secondary btn-sm" onclick="fileUploadManager.downloadFile('${file.name}')">
                <i class="fas fa-download"></i> Descargar
            </button>
            <button class="btn btn-danger btn-sm" onclick="fileUploadManager.removeFile('${file.name}')">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        `;
    }

    saveFileToSystem(file, uploadType) {
        try {
            const archivos = JSON.parse(localStorage.getItem('obrasmart_archivos') || '[]');
            
            const nuevoArchivo = {
                id: `ARCH-${String(archivos.length + 1).padStart(3, '0')}`,
                nombre: file.name,
                tipo: this.getFileTypeDisplay(uploadType),
                tamaño: file.size,
                fecha: new Date().toISOString().split('T')[0],
                estado: 'Procesado',
                categoria: uploadType
            };

            archivos.push(nuevoArchivo);
            localStorage.setItem('obrasmart_archivos', JSON.stringify(archivos));

            // Actualizar tabla de archivos si está visible
            if (typeof loadArchivosTable === 'function') {
                loadArchivosTable();
            }

        } catch (error) {
            console.error('Error guardando archivo:', error);
        }
    }

    previewFile(fileName, uploadType) {
        if (window.notificationSystem) {
            window.notificationSystem.show(`Abriendo vista previa de: ${fileName}`, 'info');
        }
        
        // Aquí se implementaría la lógica de vista previa
        console.log(`Previsualizando archivo: ${fileName} (${uploadType})`);
    }

    downloadFile(fileName) {
        if (window.notificationSystem) {
            window.notificationSystem.show(`Descargando: ${fileName}`, 'success');
        }
        
        // Aquí se implementaría la lógica de descarga
        console.log(`Descargando archivo: ${fileName}`);
    }

    removeFile(fileName) {
        if (confirm(`¿Está seguro de eliminar el archivo "${fileName}"?`)) {
            try {
                // Remover de localStorage
                const archivos = JSON.parse(localStorage.getItem('obrasmart_archivos') || '[]');
                const archivosActualizados = archivos.filter(arch => arch.nombre !== fileName);
                localStorage.setItem('obrasmart_archivos', JSON.stringify(archivosActualizados));

                // Limpiar área de carga
                this.resetUploadArea(fileName);

                if (window.notificationSystem) {
                    window.notificationSystem.show('Archivo eliminado exitosamente', 'success');
                }

                // Actualizar tabla si está visible
                if (typeof loadArchivosTable === 'function') {
                    loadArchivosTable();
                }

            } catch (error) {
                console.error('Error eliminando archivo:', error);
                if (window.notificationSystem) {
                    window.notificationSystem.show('Error al eliminar el archivo', 'error');
                }
            }
        }
    }

    resetUploadArea(fileName) {
        this.uploadAreas.forEach(({ element }) => {
            const text = element.querySelector('p');
            if (text && text.textContent.includes(fileName)) {
                const icon = element.querySelector('.upload-icon');
                const actionsContainer = element.querySelector('.file-actions');
                const progressContainer = element.querySelector('.progress-container');

                if (icon) {
                    icon.className = 'fas fa-cloud-upload-alt upload-icon';
                    icon.style.color = 'var(--text-secondary)';
                }

                if (text) {
                    text.innerHTML = 'Arrastra y suelta archivos aquí o <strong>haz clic para seleccionar</strong>';
                }

                if (actionsContainer) {
                    actionsContainer.remove();
                }

                if (progressContainer) {
                    progressContainer.remove();
                }
            }
        });
    }

    showValidationErrors(errors) {
        const errorMessage = errors.join('\n');
        
        if (window.notificationSystem) {
            window.notificationSystem.show(errorMessage, 'error', 6000);
        } else {
            alert(errorMessage);
        }
    }

    showSuccessNotification(file, uploadType) {
        const message = `Archivo "${file.name}" cargado exitosamente como ${this.getFileTypeDisplay(uploadType)}`;
        
        if (window.notificationSystem) {
            window.notificationSystem.show(message, 'success');
        } else {
            alert(message);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileTypeDisplay(uploadType) {
        const typeNames = {
            'presupuesto': 'Presupuesto',
            'programacion': 'Programación',
            'documento': 'Documento',
            'plano': 'Plano',
            'imagen': 'Imagen'
        };
        
        return typeNames[uploadType] || 'Documento';
    }

    addDragAndDropStyles() {
        if (document.getElementById('drag-drop-styles')) return;

        const style = document.createElement('style');
        style.id = 'drag-drop-styles';
        style.textContent = `
            .upload-area {
                transition: all 0.3s ease;
                cursor: pointer;
            }
            
            .upload-area:hover {
                border-color: var(--primary-color);
                background: rgba(37, 99, 235, 0.05);
                transform: translateY(-2px);
            }
            
            .upload-area.drag-over {
                border-color: var(--primary-color) !important;
                background: rgba(37, 99, 235, 0.1) !important;
                transform: scale(1.02) !important;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
            }
            
            .upload-area .upload-icon {
                transition: all 0.3s ease;
            }
            
            .file-actions .btn-sm {
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                border-radius: 4px;
            }
            
            .progress-container {
                animation: slideDown 0.3s ease;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .btn-danger {
                background: var(--secondary-color);
                border-color: var(--secondary-color);
            }
            
            .btn-danger:hover {
                background: #dc2626;
                border-color: #dc2626;
            }
        `;
        
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Escuchar cuando se cambia de pestaña para reinicializar áreas de carga
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-tab[data-tab="archivos"]')) {
                setTimeout(() => {
                    this.reinitializeUploadAreas();
                }, 100);
            }
        });
    }

    reinitializeUploadAreas() {
        // Buscar nuevas áreas de carga que puedan haberse agregado dinámicamente
        const newUploadAreas = document.querySelectorAll('.upload-area:not([data-initialized])');
        newUploadAreas.forEach(area => {
            area.setAttribute('data-initialized', 'true');
            this.initializeUploadArea(area);
        });
    }
}

// Inicializar el sistema de carga de archivos
const fileUploadManager = new FileUploadManager();

// Hacer disponible globalmente para compatibilidad
window.fileUploadManager = fileUploadManager;

// Función legacy para compatibilidad con código existente
window.handleFileUpload = function(file, area) {
    fileUploadManager.handleFileSelection(file, area);
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileUploadManager;
}

console.log('FileUpload v1.0 - Sistema de carga de archivos inicializado');