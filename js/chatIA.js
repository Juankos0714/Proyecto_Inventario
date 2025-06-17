class ChatIAManager {
    constructor() {
        this.apiKey = null;
        this.isInitialized = false;
        this.conversationHistory = [];
        this.supportedFileTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'text/plain',
            'text/csv',
            'application/json',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.chatContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.fileInput = null;
        this.analysisTemplates = {
            proyecto: `Actúa como un experto en construcción y gestión de proyectos. Analiza el siguiente contenido y proporciona:
1. Resumen ejecutivo del proyecto
2. Análisis de costos y presupuesto
3. Cronograma y fases críticas
4. Identificación de riesgos potenciales
5. Recomendaciones para optimización
6. Análisis de materiales requeridos`,
            
            materiales: `Como experto en materiales de construcción, analiza la información proporcionada y ofrece:
1. Lista detallada de materiales identificados
2. Estimación de cantidades necesarias
3. Análisis de costos por material
4. Recomendaciones de proveedores o alternativas
5. Consideraciones de calidad y especificaciones técnicas
6. Impacto en cronograma de entrega`,
            
            planos: `Como arquitecto e ingeniero, revisa los planos/documentos técnicos y proporciona:
1. Análisis estructural y dimensional
2. Identificación de elementos críticos
3. Verificación de normativas y códigos
4. Sugerencias de mejoras o modificaciones
5. Estimación de complejidad constructiva
6. Requerimientos especiales de construcción`,
            
            presupuesto: `Como especialista en costos de construcción, analiza el presupuesto y ofrece:
1. Desglose detallado de partidas
2. Análisis de precios unitarios
3. Identificación de sobrecostos o ahorros potenciales
4. Comparación con estándares del mercado
5. Recomendaciones de optimización
6. Análisis de contingencias`
        };
    }

    /**
     * Inicializar el módulo de Chat IA
     */
    async init() {
        try {
            console.log('📱 Inicializando Chat IA Manager...');
            
            // Obtener elementos del DOM
            this.initializeElements();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Cargar historial de conversación
            this.loadConversationHistory();
            
            // Verificar API key guardada
            this.loadApiKey();
            
            // Inicializar interfaz
            this.initializeInterface();
            
            this.isInitialized = true;
            console.log('✅ Chat IA Manager inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando Chat IA Manager:', error);
            throw error;
        }
    }

    /**
     * Obtener elementos del DOM
     */
    initializeElements() {
        this.chatContainer = document.getElementById('chat-container');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.fileInput = document.getElementById('file-input');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.saveApiKeyButton = document.getElementById('save-api-key');
        this.analysisTypeSelect = document.getElementById('analysis-type');
        this.clearChatButton = document.getElementById('clear-chat');
        this.exportChatButton = document.getElementById('export-chat');
        
        // Crear elementos si no existen
        if (!this.chatContainer) {
            this.createChatInterface();
        }
    }

    /**
     * Crear interfaz de chat si no existe
     */
    createChatInterface() {
        const chatView = document.getElementById('chat-ia-view');
        if (!chatView) return;

        chatView.innerHTML = `
            <div class="chat-ia-container">
                <!-- Header del Chat -->
                <div class="chat-header">
                    <div class="chat-title">
                        <i class="fas fa-robot"></i>
                        <h3>Asistente IA para Construcción</h3>
                    </div>
                    <div class="chat-controls">
                        <button id="clear-chat" class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-trash"></i> Limpiar
                        </button>
                        <button id="export-chat" class="btn btn-outline-primary btn-sm">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                </div>

                <!-- Configuración API Key -->
                <div class="api-config-section" id="api-config">
                    <div class="alert alert-info">
                        <i class="fas fa-key"></i>
                        <strong>Configuración requerida:</strong> Ingresa tu API Key de Google Gemini para comenzar.
                    </div>
                    <div class="input-group">
                        <input type="password" id="api-key-input" class="form-control" 
                               placeholder="Ingresa tu API Key de Gemini">
                        <button id="save-api-key" class="btn btn-primary">
                            <i class="fas fa-save"></i> Guardar
                        </button>
                    </div>
                </div>

                <!-- Área de chat -->
                <div class="chat-area" id="chat-container">
                    <div class="welcome-message">
                        <div class="bot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <h4>¡Hola! Soy tu asistente de construcción</h4>
                            <p>Puedo ayudarte a:</p>
                            <ul>
                                <li>Analizar planos y documentos técnicos</li>
                                <li>Revisar presupuestos y costos</li>
                                <li>Evaluar listados de materiales</li>
                                <li>Optimizar cronogramas de obra</li>
                                <li>Identificar riesgos en proyectos</li>
                            </ul>
                            <p><strong>Sube archivos o escribe tu consulta para comenzar.</strong></p>
                        </div>
                    </div>
                </div>

                <!-- Área de entrada -->
                <div class="chat-input-area">
                    <!-- Tipo de análisis -->
                    <div class="analysis-options">
                        <label for="analysis-type">Tipo de análisis:</label>
                        <select id="analysis-type" class="form-select">
                            <option value="general">Consulta general</option>
                            <option value="proyecto">Análisis completo de proyecto</option>
                            <option value="materiales">Análisis de materiales</option>
                            <option value="planos">Revisión de planos</option>
                            <option value="presupuesto">Análisis de presupuesto</option>
                        </select>
                    </div>

                    <!-- Input de archivos -->
                    <div class="file-upload-area">
                        <input type="file" id="file-input" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv,.json,.xlsx,.xls">
                        <label for="file-input" class="file-upload-label">
                            <i class="fas fa-paperclip"></i>
                            <span>Adjuntar archivos</span>
                        </label>
                        <div id="selected-files" class="selected-files"></div>
                    </div>

                    <!-- Input de mensaje -->
                    <div class="message-input-container">
                        <textarea id="message-input" class="form-control" 
                                  placeholder="Escribe tu consulta sobre construcción, materiales, presupuestos..."
                                  rows="3"></textarea>
                        <button id="send-button" class="btn btn-primary send-btn" disabled>
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Reinicializar elementos
        this.initializeElements();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Guardar API Key
        if (this.saveApiKeyButton) {
            this.saveApiKeyButton.addEventListener('click', () => this.saveApiKey());
        }

        // Enviar mensaje
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Enter para enviar (Ctrl+Enter para nueva línea)
        if (this.messageInput) {
            this.messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            this.messageInput.addEventListener('input', () => {
                this.updateSendButton();
            });
        }

        // Manejo de archivos
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }

        // Limpiar chat
        if (this.clearChatButton) {
            this.clearChatButton.addEventListener('click', () => this.clearChat());
        }

        // Exportar chat
        if (this.exportChatButton) {
            this.exportChatButton.addEventListener('click', () => this.exportChat());
        }

        // API Key input
        if (this.apiKeyInput) {
            this.apiKeyInput.addEventListener('input', () => this.updateSendButton());
        }
    }

    /**
     * Cargar API Key guardada
     */
    loadApiKey() {
        const savedKey = localStorage.getItem('gemini-api-key');
        if (savedKey) {
            this.apiKey = savedKey;
            if (this.apiKeyInput) {
                this.apiKeyInput.value = savedKey;
            }
            this.hideApiConfig();
        }
    }

    /**
     * Guardar API Key
     */
    saveApiKey() {
        const apiKey = "AIzaSyC-eZMGzq9WwTtKC6_8R4cOme1mMhMgnMw";
        if (!apiKey) {
            this.showNotification('Por favor, ingresa una API Key válida', 'error');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('gemini-api-key', apiKey);
        this.hideApiConfig();
        this.showNotification('API Key guardada correctamente', 'success');
        this.updateSendButton();
    }

    /**
     * Ocultar configuración de API
     */
    hideApiConfig() {
        const apiConfig = document.getElementById('api-config');
        if (apiConfig) {
            apiConfig.style.display = 'none';
        }
    }

    /**
     * Mostrar configuración de API
     */
    showApiConfig() {
        const apiConfig = document.getElementById('api-config');
        if (apiConfig) {
            apiConfig.style.display = 'block';
        }
    }

    /**
     * Actualizar estado del botón enviar
     */
    updateSendButton() {
        if (!this.sendButton) return;

        const hasMessage = this.messageInput?.value.trim().length > 0;
        const hasApiKey = this.apiKey && this.apiKey.length > 0;
        const hasFiles = this.fileInput?.files.length > 0;

        this.sendButton.disabled = !hasApiKey || (!hasMessage && !hasFiles);
    }

    /**
     * Manejar selección de archivos
     */
    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        const selectedFilesContainer = document.getElementById('selected-files');
        
        if (!selectedFilesContainer) return;

        // Validar archivos
        const validFiles = files.filter(file => this.validateFile(file));
        
        if (validFiles.length !== files.length) {
            this.showNotification('Algunos archivos no son válidos y fueron excluidos', 'warning');
        }

        // Mostrar archivos seleccionados
        selectedFilesContainer.innerHTML = validFiles.map(file => `
            <div class="selected-file">
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
                <button class="remove-file" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        this.updateSendButton();
    }

    /**
     * Validar archivo
     */
    validateFile(file) {
        // Verificar tipo de archivo
        if (!this.supportedFileTypes.includes(file.type)) {
            this.showNotification(`Tipo de archivo no soportado: ${file.name}`, 'error');
            return false;
        }

        // Verificar tamaño
        if (file.size > this.maxFileSize) {
            this.showNotification(`Archivo demasiado grande: ${file.name}`, 'error');
            return false;
        }

        return true;
    }

    /**
     * Formatear tamaño de archivo
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Enviar mensaje
     */
    async sendMessage() {
        if (!this.apiKey) {
            this.showApiConfig();
            this.showNotification('Configura tu API Key primero', 'error');
            return;
        }

        const message = this.messageInput?.value.trim();
        const files = this.fileInput?.files;
        const analysisType = this.analysisTypeSelect?.value || 'general';

        if (!message && (!files || files.length === 0)) {
            this.showNotification('Escribe un mensaje o adjunta archivos', 'warning');
            return;
        }

        try {
            // Deshabilitar interfaz
            this.setInterfaceState(false);
            
            // Añadir mensaje del usuario
            this.addMessage('user', message, files);

            // Preparar contenido para enviar a Gemini
            const content = await this.prepareContent(message, files, analysisType);

            // Enviar a Gemini
            const response = await this.sendToGemini(content);

            // Añadir respuesta del bot
            this.addMessage('assistant', response);

            // Limpiar inputs
            this.clearInputs();

        } catch (error) {
            console.error('Error enviando mensaje:', error);
            this.addMessage('assistant', 'Lo siento, ocurrió un error al procesar tu consulta. Verifica tu API Key y conexión a internet.');
            this.showNotification('Error al enviar mensaje', 'error');
        } finally {
            this.setInterfaceState(true);
        }
    }

    /**
     * Preparar contenido para enviar a Gemini
     */
    async prepareContent(message, files, analysisType) {
        let content = [];

        // Agregar template según tipo de análisis
        if (analysisType !== 'general' && this.analysisTemplates[analysisType]) {
            content.push({
                type: 'text',
                text: this.analysisTemplates[analysisType]
            });
        }

        // Agregar mensaje del usuario
        if (message) {
            content.push({
                type: 'text',
                text: message
            });
        }

        // Procesar archivos
        if (files && files.length > 0) {
            for (let file of files) {
                try {
                    const fileContent = await this.processFile(file);
                    content.push(fileContent);
                } catch (error) {
                    console.error('Error procesando archivo:', file.name, error);
                }
            }
        }

        // Agregar contexto de la aplicación
        const contextInfo = this.getApplicationContext();
        content.push({
            type: 'text',
            text: `\n\nContexto de la aplicación:\n${contextInfo}`
        });

        return content;
    }

    /**
     * Procesar archivo para enviar a Gemini
     */
    async processFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    if (file.type.startsWith('image/')) {
                        // Para imágenes, enviar como base64
                        resolve({
                            type: 'inlineData',
                            inlineData: {
                                mimeType: file.type,
                                data: e.target.result.split(',')[1]
                            }
                        });
                    } else {
                        // Para archivos de texto, CSV, JSON, etc.
                        let textContent = '';
                        
                        if (file.type === 'text/csv') {
                            textContent = `Archivo CSV "${file.name}":\n${e.target.result}`;
                        } else if (file.type === 'application/json') {
                            textContent = `Archivo JSON "${file.name}":\n${e.target.result}`;
                        } else {
                            textContent = `Archivo "${file.name}":\n${e.target.result}`;
                        }

                        resolve({
                            type: 'text',
                            text: textContent
                        });
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Error leyendo archivo'));

            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    /**
     * Obtener contexto de la aplicación
     */
    getApplicationContext() {
        const obras = window.AppState?.obras || [];
        const materiales = window.AppState?.materiales || [];
        
        return `
Información actual del sistema:
- Obras registradas: ${obras.length}
- Materiales registrados: ${materiales.length}
- Fecha actual: ${new Date().toLocaleDateString('es-ES')}

Como experto en construcción, ten en cuenta esta información existente para proporcionar análisis más precisos y recomendaciones contextualizadas.
        `.trim();
    }

    /**
     * Enviar contenido a Gemini
     */
    async sendToGemini(content) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

        const requestBody = {
            contents: [{
                parts: content
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error de API: ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Respuesta inválida de la API');
        }

        return data.candidates[0].content.parts[0].text;
    }

    /**
     * Añadir mensaje al chat
     */
    addMessage(role, content, files = null) {
        if (!this.chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;

        const timestamp = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let filesHtml = '';
        if (files && files.length > 0) {
            filesHtml = `
                <div class="message-files">
                    ${Array.from(files).map(file => `
                        <div class="file-attachment">
                            <i class="fas fa-file"></i>
                            <span>${file.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${role === 'user' ? 'Tú' : 'Asistente IA'}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                ${filesHtml}
                <div class="message-text">${this.formatMessage(content)}</div>
            </div>
        `;

        // Remover mensaje de bienvenida si existe
        const welcomeMessage = this.chatContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        this.chatContainer.appendChild(messageElement);
        this.scrollToBottom();

        // Guardar en historial
        this.conversationHistory.push({
            role,
            content,
            timestamp: new Date().toISOString(),
            files: files ? Array.from(files).map(f => f.name) : null
        });

        this.saveConversationHistory();
    }

    /**
     * Formatear mensaje (markdown básico)
     */
    formatMessage(content) {
        if (!content) return '';

        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/###\s(.*?)(<br>|$)/g, '<h3>$1</h3>')
            .replace(/##\s(.*?)(<br>|$)/g, '<h2>$1</h2>')
            .replace(/\n\n/g, '<br><br>');
    }

    /**
     * Scroll al final del chat
     */
    scrollToBottom() {
        if (this.chatContainer) {
            this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
        }
    }

    /**
     * Limpiar inputs
     */
    clearInputs() {
        if (this.messageInput) {
            this.messageInput.value = '';
        }
        if (this.fileInput) {
            this.fileInput.value = '';
        }
        
        const selectedFiles = document.getElementById('selected-files');
        if (selectedFiles) {
            selectedFiles.innerHTML = '';
        }

        this.updateSendButton();
    }

    /**
     * Establecer estado de la interfaz
     */
    setInterfaceState(enabled) {
        const elements = [this.messageInput, this.sendButton, this.fileInput];
        elements.forEach(element => {
            if (element) {
                element.disabled = !enabled;
            }
        });

        if (this.sendButton) {
            this.sendButton.innerHTML = enabled ? 
                '<i class="fas fa-paper-plane"></i>' : 
                '<i class="fas fa-spinner fa-spin"></i>';
        }
    }

    /**
     * Limpiar chat
     */
    clearChat() {
        if (confirm('¿Estás seguro de que quieres limpiar el historial de chat?')) {
            this.conversationHistory = [];
            this.saveConversationHistory();
            
            if (this.chatContainer) {
                this.chatContainer.innerHTML = `
                    <div class="welcome-message">
                        <div class="bot-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <h4>Chat limpiado</h4>
                            <p>Puedes comenzar una nueva conversación.</p>
                        </div>
                    </div>
                `;
            }
            
            this.showNotification('Chat limpiado', 'success');
        }
    }

    /**
     * Exportar chat
     */
    exportChat() {
        if (this.conversationHistory.length === 0) {
            this.showNotification('No hay conversación para exportar', 'warning');
            return;
        }

        const chatData = {
            exportDate: new Date().toISOString(),
            messages: this.conversationHistory
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-ia-construccion-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Chat exportado correctamente', 'success');
    }

    /**
     * Cargar historial de conversación
     */
    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('chat-ia-history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                this.renderConversationHistory();
            }
        } catch (error) {
            console.error('Error cargando historial:', error);
        }
    }

    /**
     * Guardar historial de conversación
     */
    saveConversationHistory() {
        try {
            localStorage.setItem('chat-ia-history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error guardando historial:', error);
        }
    }

    /**
     * Renderizar historial de conversación
     */
    renderConversationHistory() {
        if (!this.chatContainer || this.conversationHistory.length === 0) return;

        // Limpiar contenedor
        this.chatContainer.innerHTML = '';

        // Renderizar mensajes
        this.conversationHistory.forEach(message => {
            this.addMessageFromHistory(message);
        });
    }

    /**
     * Añadir mensaje desde historial
     */
    addMessageFromHistory(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}-message`;

        const timestamp = new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let filesHtml = '';
        if (message.files && message.files.length > 0) {
            filesHtml = `
                <div class="message-files">
                    ${message.files.map(fileName => `
                        <div class="file-attachment">
                            <i class="fas fa-file"></i>
                            <span>${fileName}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${message.role === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${message.role === 'user' ? 'Tú' : 'Asistente IA'}</span>
                    <span class="message-time">${timestamp}</span>
                </div>
                ${filesHtml}
                <div class="message-text">${this.formatMessage(message.content)}</div>
            </div>
        `;

        this.chatContainer.appendChild(messageElement);
    }

    /**
     * Inicializar interfaz
     */
    initializeInterface() {
        this.updateSendButton();
        
        if (this.conversationHistory.length === 0) {
            // Mostrar mensaje de bienvenida si no hay historial
            this.createChatInterface();
        }
    }

    /**
     * Enfocar input de mensaje
     */
    focus() {
        if (this.messageInput) {
            this.messageInput.focus();
        }
    }

showNotification(message, type = 'info', duration = 5000) {
    if (window.AppState?.modules?.notificaciones) {
        window.AppState.modules.notificaciones.show(message, type, duration);
    } else {
        this.createSimpleNotification(message, type, duration);
    }
}


createSimpleNotification(message, type, duration) {
    let notificationContainer = document.getElementById('simple-notifications');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'simple-notifications';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 300px;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `simple-notification notification-${type}`;
    notification.style.cssText = `
        background: ${this.getNotificationColor(type)};
        color: white;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        cursor: pointer;
        font-size: 14px;
        line-height: 1.4;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <i class="fas fa-times" style="margin-left: auto; opacity: 0.7;"></i>
        </div>
    `;

    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });

    // Agregar al contenedor
    notificationContainer.appendChild(notification);

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);

    // Agregar estilos CSS si no existen
    this.addNotificationStyles();
}

/**
 * Obtener color de notificación según tipo
 */
getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || colors.info;
}

/**
 * Obtener icono de notificación según tipo
 */
getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

/**
 * Agregar estilos CSS para notificaciones
 */
addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .simple-notification:hover {
            transform: translateX(-5px);
            transition: transform 0.2s ease;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Obtener configuración de seguridad para Gemini
 * Función utilitaria que faltaba
 */
getGeminiSafetySettings() {
    return [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
    ];
}

/**
 * Validar respuesta de Gemini
 * Función de validación que faltaba
 */
validateGeminiResponse(data) {
    if (!data) {
        throw new Error('Respuesta vacía de la API');
    }

    if (data.error) {
        throw new Error(`Error de API: ${data.error.message || 'Error desconocido'}`);
    }

    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        throw new Error('No se recibieron candidatos de respuesta');
    }

    const candidate = data.candidates[0];
    
    if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts)) {
        throw new Error('Estructura de respuesta inválida');
    }

    if (candidate.content.parts.length === 0) {
        throw new Error('Respuesta vacía del modelo');
    }

    const firstPart = candidate.content.parts[0];
    if (!firstPart.text) {
        throw new Error('No se encontró texto en la respuesta');
    }

    return firstPart.text;
}

/**
 * Procesar archivos Excel con más detalle
 * Función mejorada para archivos Excel
 */
async processExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                // Para archivos Excel, extraer texto básico
                const arrayBuffer = e.target.result;
                
                // Intentar detectar si es un archivo de texto plano con extensión xlsx
                const uint8Array = new Uint8Array(arrayBuffer);
                const text = new TextDecoder().decode(uint8Array);
                
                resolve({
                    type: 'text',
                    text: `Archivo Excel "${file.name}" (${this.formatFileSize(file.size)}):\n\nNota: Este es un archivo Excel. Para un análisis completo, considera convertirlo a CSV o proporcionar detalles específicos sobre su contenido.\n\nPrimeros caracteres detectados: ${text.substring(0, 500)}...`
                });
                
            } catch (error) {
                // Si falla la lectura, proporcionar información básica
                resolve({
                    type: 'text',
                    text: `Archivo Excel "${file.name}" (${this.formatFileSize(file.size)}):\n\nArchivo Excel detectado. Para un mejor análisis, por favor describe el contenido del archivo o compártelo en formato CSV.`
                });
            }
        };

        reader.onerror = () => reject(new Error('Error leyendo archivo Excel'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Detectar tipo de análisis automáticamente
 * Función que faltaba para detección inteligente
 */
detectAnalysisType(message, files) {
    const texto = message.toLowerCase();
    
    // Detectar por palabras clave en el mensaje
    if (texto.includes('presupuesto') || texto.includes('costo') || texto.includes('precio')) {
        return 'presupuesto';
    }
    
    if (texto.includes('material') || texto.includes('cemento') || texto.includes('acero') || texto.includes('ladrillo')) {
        return 'materiales';
    }
    
    if (texto.includes('plano') || texto.includes('diseño') || texto.includes('estructura')) {
        return 'planos';
    }
    
    if (texto.includes('proyecto') || texto.includes('obra') || texto.includes('construcción')) {
        return 'proyecto';
    }
    
    // Detectar por tipo de archivos
    if (files && files.length > 0) {
        const fileTypes = Array.from(files).map(f => f.type);
        
        if (fileTypes.some(type => type.includes('image'))) {
            return 'planos'; // Imágenes probablemente sean planos
        }
        
        if (fileTypes.some(type => type.includes('spreadsheet') || type.includes('csv'))) {
            return 'presupuesto'; // Hojas de cálculo probablemente sean presupuestos
        }
    }
    
    return 'general';
}

/**
 * Generar plantilla contextual
 * Función para generar plantillas más específicas
 */
generateContextualTemplate(analysisType, files, message) {
    let baseTemplate = this.analysisTemplates[analysisType] || '';
    
    // Agregar contexto específico basado en archivos
    if (files && files.length > 0) {
        const fileInfo = Array.from(files).map(f => `- ${f.name} (${this.formatFileSize(f.size)})`).join('\n');
        baseTemplate += `\n\nArchivos proporcionados:\n${fileInfo}\n\nAnaliza estos archivos en detalle.`;
    }
    
    // Agregar contexto específico basado en el mensaje
    if (message && message.length > 0) {
        baseTemplate += `\n\nConsulta específica del usuario: "${message}"`;
    }
    
    return baseTemplate;
}

/**
 * Limpiar y formatear respuesta de IA
 * Función para mejorar el formato de las respuestas
 */
cleanAndFormatResponse(response) {
    if (!response) return '';
    
    return response
        // Limpiar caracteres extraños
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Mejorar formato de listas
        .replace(/^\s*[-*]\s/gm, '• ')
        // Mejorar formato de números
        .replace(/^(\d+)\.\s/gm, '$1. ')
        // Limpiar espacios excesivos
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Trim
        .trim();
}

/**
 * Función para reintentar envío en caso de error
 */
async sendToGeminiWithRetry(content, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await this.sendToGemini(content);
            return response;
        } catch (error) {
            lastError = error;
            console.warn(`Intento ${attempt} fallido:`, error.message);
            
            if (attempt < maxRetries) {
                // Esperar antes del siguiente intento (backoff exponencial)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }
    
    throw lastError;
}

async sendToGemini(content) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const requestBody = {
        contents: [{
            parts: content
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        },
        safetySettings: this.getGeminiSafetySettings()
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error de API: ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json();
    const responseText = this.validateGeminiResponse(data);
    
    return this.cleanAndFormatResponse(responseText);
}

/**
 * Función de utilidad para debugging
 */
debugLog(message, data = null) {
    if (window.AppState?.config?.debug) {
        console.log(`[ChatIA Debug] ${message}`, data);
    }
}

/**
 * Función para exportar configuración
 */
exportConfiguration() {
    const config = {
        apiKey: this.apiKey ? '***CONFIGURADA***' : 'NO_CONFIGURADA',
        analysisTemplates: this.analysisTemplates,
        supportedFileTypes: this.supportedFileTypes,
        maxFileSize: this.maxFileSize,
        conversationCount: this.conversationHistory.length,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatia-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showNotification('Configuración exportada', 'success');
}

/**
 * Función para importar configuración
 */
importConfiguration(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const config = JSON.parse(e.target.result);
            
            if (config.analysisTemplates) {
                this.analysisTemplates = { ...this.analysisTemplates, ...config.analysisTemplates };
            }
            
            this.showNotification('Configuración importada correctamente', 'success');
        } catch (error) {
            this.showNotification('Error al importar configuración', 'error');
            console.error('Error importando configuración:', error);
        }
    };
    
    reader.readAsText(file);
}

getStats() {
    return {
        totalMessages: this.conversationHistory.length,
        userMessages: this.conversationHistory.filter(m => m.role === 'user').length,
        assistantMessages: this.conversationHistory.filter(m => m.role === 'assistant').length,
        filesUploaded: this.conversationHistory.reduce((total, m) => total + (m.files?.length || 0), 0),
        isConfigured: !!this.apiKey,
        isInitialized: this.isInitialized
    };
}}