// storage.js - Sistema de almacenamiento local para ObraSmart
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
                },
                {
                    id: 'OB-003',
                    codigo: 'OB-003',
                    nombre: 'Conjunto Residencial Sur',
                    objeto: 'Construcción conjunto habitacional',
                    valor: 320000000,
                    duracion: 280,
                    fechaInicio: '2025-03-01',
                    progreso: 23,
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
                },
                {
                    id: 'MAT-003',
                    codigo: 'MAT-003',
                    nombre: 'Arena de río',
                    unidad: 'm3',
                    precio: 45000,
                    stock: 150
                },
                {
                    id: 'MAT-004',
                    codigo: 'MAT-004',
                    nombre: 'Grava triturada',
                    unidad: 'm3',
                    precio: 38000,
                    stock: 80
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
                },
                {
                    id: 'ARCH-002',
                    nombre: 'cronograma_centro_comercial.pdf',
                    tipo: 'Programación',
                    fecha: '2025-06-10',
                    estado: 'Procesado'
                }
            ]);
        }

        if (!this.getData('eventos')) {
            this.saveData('eventos', [
                {
                    id: 'EV-001',
                    fecha: '2025-06-18',
                    titulo: 'Entrega de cemento',
                    obra: 'Torre Residencial Central',
                    tipo: 'Entrega'
                },
                {
                    id: 'EV-002',
                    fecha: '2025-06-20',
                    titulo: 'Revisión de calidad estructural',
                    obra: 'Centro Comercial Norte',
                    tipo: 'Inspección'
                },
                {
                    id: 'EV-003',
                    fecha: '2025-06-22',
                    titulo: 'Reunión con cliente',
                    obra: 'Conjunto Residencial Sur',
                    tipo: 'Reunion'
                },
                {
                    id: 'EV-004',
                    fecha: '2025-06-25',
                    titulo: 'Entrega de varillas',
                    obra: 'Torre Residencial Central',
                    tipo: 'Entrega'
                }
            ]);
        }

        if (!this.getData('configuracion')) {
            this.saveData('configuracion', {
                version: '1.0',
                ultimaActualizacion: new Date().toISOString(),
                notificacionesActivas: true,
                alertasStock: true,
                umbralStockBajo: 100
            });
        }
    }

    // Guardar datos en localStorage con manejo de errores
    saveData(key, data) {
        try {
            const dataToSave = {
                data: data,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(this.storageKeys[key], JSON.stringify(dataToSave));
            console.log(`✅ Datos guardados: ${key}`);
            return true;
        } catch (error) {
            console.error(`❌ Error guardando ${key}:`, error);
            // Fallback: guardar en memoria si localStorage falla
            this[`_${key}`] = data;
            return false;
        }
    }

    // Obtener datos desde localStorage con validación
    getData(key) {
        try {
            const stored = localStorage.getItem(this.storageKeys[key]);
            if (!stored) {
                // Fallback: verificar si existe en memoria
                return this[`_${key}`] || null;
            }
            
            const parsed = JSON.parse(stored);
            
            // Validar estructura de datos
            if (parsed && parsed.data) {
                return parsed.data;
            }
            
            // Si no tiene la estructura esperada, asumir formato antiguo
            return parsed;
        } catch (error) {
            console.error(`❌ Error obteniendo ${key}:`, error);
            return this[`_${key}`] || null;
        }
    }

    // Agregar nueva obra
    addObra(obra) {
        const obras = this.getData('obras') || [];
        obra.id = this.generateId('OB', obras.length + 1);
        obra.progreso = 0;
        obra.estado = 'Activa';
        obra.fechaCreacion = new Date().toISOString();
        
        obras.push(obra);
        this.saveData('obras', obras);
        
        console.log(`✅ Nueva obra agregada: ${obra.nombre}`);
        return obra;
    }

    // Agregar nuevo material
    addMaterial(material) {
        const materiales = this.getData('materiales') || [];
        material.id = this.generateId('MAT', materiales.length + 1);
        material.stock = 0;
        material.fechaCreacion = new Date().toISOString();
        
        materiales.push(material);
        this.saveData('materiales', materiales);
        
        console.log(`✅ Nuevo material agregado: ${material.nombre}`);
        return material;
    }

    // Eliminar material
    deleteMaterial(id) {
        const materiales = this.getData('materiales') || [];
        const materialIndex = materiales.findIndex(m => m.id === id);
        
        if (materialIndex !== -1) {
            const deletedMaterial = materiales.splice(materialIndex, 1)[0];
            this.saveData('materiales', materiales);
            console.log(`✅ Material eliminado: ${deletedMaterial.nombre}`);
            return true;
        }
        
        console.warn(`⚠️ Material no encontrado: ${id}`);
        return false;
    }

    // Actualizar material
    updateMaterial(id, updates) {
        const materiales = this.getData('materiales') || [];
        const materialIndex = materiales.findIndex(m => m.id === id);
        
        if (materialIndex !== -1) {
            materiales[materialIndex] = { ...materiales[materialIndex], ...updates };
            this.saveData('materiales', materiales);
            console.log(`✅ Material actualizado: ${id}`);
            return materiales[materialIndex];
        }
        
        return null;
    }

    // Agregar nuevo archivo
    addArchivo(archivo) {
        const archivos = this.getData('archivos') || [];
        archivo.id = this.generateId('ARCH', archivos.length + 1);
        archivo.fecha = new Date().toISOString().split('T')[0];
        archivo.estado = 'Procesado';
        archivo.fechaCreacion = new Date().toISOString();
        
        archivos.push(archivo);
        this.saveData('archivos', archivos);
        
        console.log(`✅ Nuevo archivo agregado: ${archivo.nombre}`);
        return archivo;
    }

    // Actualizar progreso de obra
    updateObraProgress(id, progreso) {
        const obras = this.getData('obras') || [];
        const obraIndex = obras.findIndex(o => o.id === id);
        
        if (obraIndex !== -1) {
            obras[obraIndex].progreso = Math.min(100, Math.max(0, progreso));
            obras[obraIndex].ultimaActualizacion = new Date().toISOString();
            
            // Cambiar estado si se completa
            if (progreso >= 100) {
                obras[obraIndex].estado = 'Completada';
            }
            
            this.saveData('obras', obras);
            console.log(`✅ Progreso actualizado para ${obras[obraIndex].nombre}: ${progreso}%`);
            return true;
        }
        
        return false;
    }

    // Agregar evento al calendario
    addEvento(evento) {
        const eventos = this.getData('eventos') || [];
        evento.id = this.generateId('EV', eventos.length + 1);
        evento.fechaCreacion = new Date().toISOString();
        
        eventos.push(evento);
        this.saveData('eventos', eventos);
        
        console.log(`✅ Nuevo evento agregado: ${evento.titulo}`);
        return evento;
    }

    // Obtener estadísticas generales
    getStats() {
        const obras = this.getData('obras') || [];
        const materiales = this.getData('materiales') || [];
        const archivos = this.getData('archivos') || [];
        
        // Calcular estadísticas
        const obrasActivas = obras.filter(o => o.estado === 'Activa').length;
        const obrasCompletadas = obras.filter(o => o.estado === 'Completada').length;
        const totalMateriales = materiales.length;
        const materialesBajoStock = materiales.filter(m => m.stock < 100).length;
        const valorTotalObras = obras.reduce((total, obra) => total + (obra.valor || 0), 0);
        const progresoPromedio = obras.length > 0 
            ? Math.round(obras.reduce((total, obra) => total + (obra.progreso || 0), 0) / obras.length)
            : 0;
        
        return {
            obrasActivas,
            obrasCompletadas,
            totalObras: obras.length,
            totalMateriales,
            materialesBajoStock,
            totalArchivos: archivos.length,
            valorTotalObras,
            progresoPromedio,
            alertasPendientes: materialesBajoStock + Math.floor(Math.random() * 10) + 1
        };
    }

    // Buscar en todos los datos
    search(query, categoria = null) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        if (!categoria || categoria === 'obras') {
            const obras = this.getData('obras') || [];
            obras.forEach(obra => {
                if (obra.nombre.toLowerCase().includes(searchTerm) || 
                    obra.codigo.toLowerCase().includes(searchTerm)) {
                    results.push({ tipo: 'obra', data: obra });
                }
            });
        }
        
        if (!categoria || categoria === 'materiales') {
            const materiales = this.getData('materiales') || [];
            materiales.forEach(material => {
                if (material.nombre.toLowerCase().includes(searchTerm) || 
                    material.codigo.toLowerCase().includes(searchTerm)) {
                    results.push({ tipo: 'material', data: material });
                }
            });
        }
        
        return results;
    }

    // Obtener datos para exportar
    exportData() {
        return {
            obras: this.getData('obras'),
            materiales: this.getData('materiales'),
            archivos: this.getData('archivos'),
            eventos: this.getData('eventos'),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Importar datos
    importData(data) {
        try {
            if (data.obras) this.saveData('obras', data.obras);
            if (data.materiales) this.saveData('materiales', data.materiales);
            if (data.archivos) this.saveData('archivos', data.archivos);
            if (data.eventos) this.saveData('eventos', data.eventos);
            
            console.log('✅ Datos importados exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error importando datos:', error);
            return false;
        }
    }

    // Limpiar todos los datos
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('✅ Todos los datos eliminados');
            return true;
        } catch (error) {
            console.error('❌ Error limpiando datos:', error);
            return false;
        }
    }

    // Obtener información del almacenamiento
    getStorageInfo() {
        let totalSize = 0;
        const info = {};
        
        Object.entries(this.storageKeys).forEach(([key, storageKey]) => {
            const data = localStorage.getItem(storageKey);
            const size = data ? new Blob([data]).size : 0;
            totalSize += size;
            info[key] = {
                size: size,
                records: this.getData(key)?.length || 0
            };
        });
        
        return {
            totalSize: totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            details: info,
            available: this.isStorageAvailable()
        };
    }

    // Utilidades privadas
    generateId(prefix, number) {
        return `${prefix}-${String(number).padStart(3, '0')}`;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Crear instancia global
window.dataStorage = new DataStorage();

// Fallback para compatibilidad
window.DataManager = DataStorage;
window.dataManager = window.dataStorage;

console.log('📦 Storage.js cargado - Sistema de almacenamiento inicializado');