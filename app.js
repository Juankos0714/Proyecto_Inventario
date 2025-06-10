
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