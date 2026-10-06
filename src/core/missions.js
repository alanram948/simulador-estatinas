import { state } from './state.js';

export const missionSystem = {
    activeMissionIndex: 0,
    isPaused: false, // Controla si la simulación gráfica debe detenerse
    
    // Base de datos de misiones extraída del mapa conceptual
    missions: [
        {
            id: "endotelio_1",
            tabRequired: "endothelium",
            title: "Paso 1: Bloqueo de Prenilación",
            instruction: "Administra al menos 40mg de Atorvastatina para iniciar la cascada.",
            // Condición para disparar el puzzle: dosis > 40 y mevalonato cayó por debajo del 50%
            triggerCondition: () => state.drug.dose >= 40 && state.molecular.mevalonate <= 50,
            question: {
                text: "El mevalonato ha disminuido. ¿Qué intermediarios de la prenilación caerán ahora para inhibir a la Proteína Rho?",
                options: [
                    { text: "LDL y Apolipoproteína B", correct: false, feedback: "Incorrecto. Esos participan en la vía lipídica para aterosclerosis." },
                    { text: "FPP y GGPP", correct: true, feedback: "¡Correcto! La caída de FPP y GGPP bloquea la prenilación." },
                    { text: "Tromboxano A2", correct: false, feedback: "Incorrecto. Eso afecta la agregación plaquetaria." }
                ]
            },
            onComplete: () => {
                // Modificamos el estado para forzar la caída de FPP/GGPP visualmente
                state.molecular.fpp_ggpp = 30; 
                state.systemic.nitricOxide = 80; // Comienza a subir el ON
            }
        },
        {
            id: "endotelio_2",
            tabRequired: "endothelium",
            title: "Paso 2: Liberación de Óxido Nítrico",
            instruction: "Observa la inhibición de la Proteína Rho y espera la respuesta enzimática.",
            triggerCondition: () => state.molecular.fpp_ggpp <= 30 && state.systemic.nitricOxide >= 80,
            question: {
                text: "Con la Proteína Rho inhibida, aumenta la Sintetasa de Óxido Nítrico. ¿Cuál es el efecto tisular final en el vaso sanguíneo?",
                options: [
                    { text: "Vasodilatación", correct: true, feedback: "¡Exacto! Mejora la función endotelial ensanchando el vaso." },
                    { text: "Coagulación", correct: false, feedback: "Incorrecto. Eso ocurre en la vía del trombo." },
                    { text: "Estabilización de Placa", correct: false, feedback: "Incorrecto. Revisa la vía de los macrófagos y metaloproteinasas." }
                ]
            },
            onComplete: () => {
                // Disparamos la animación de vasodilatación final
                state.systemic.vasodilationComplete = true;
            }
        }
    ],

    init() {
        this.overlay = document.getElementById('mission-overlay');
        this.titleEl = document.getElementById('mission-title');
        this.textEl = document.getElementById('mission-text');
        this.optionsContainer = document.getElementById('puzzle-options');
        this.feedbackEl = document.getElementById('mission-feedback');
    },

    checkProgress() {
        if (this.isPaused || this.activeMissionIndex >= this.missions.length) return;

        const currentMission = this.missions[this.activeMissionIndex];
        
        // Verifica si el estudiante está en la pestaña correcta y cumplió la acción física
        if (state.currentTab === currentMission.tabRequired && currentMission.triggerCondition()) {
            this.triggerPuzzle(currentMission);
        }
    },

    triggerPuzzle(mission) {
        this.isPaused = true;
        this.titleEl.innerText = "Pregunta: " + mission.title;
        this.textEl.innerText = mission.question.text;
        this.feedbackEl.innerText = "";
        this.optionsContainer.innerHTML = "";

        mission.question.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'puzzle-btn';
            btn.innerText = opt.text;
            btn.onclick = () => this.handleAnswer(btn, opt, mission);
            this.optionsContainer.appendChild(btn);
        });

        this.overlay.classList.remove('hidden');
    },

    handleAnswer(button, option, mission) {
        // Deshabilitar todos los botones temporalmente
        const buttons = this.optionsContainer.querySelectorAll('button');
        buttons.forEach(b => b.disabled = true);

        if (option.correct) {
            button.classList.add('correct');
            this.feedbackEl.innerText = option.feedback;
            this.feedbackEl.style.color = '#16a34a';
            
            setTimeout(() => {
                this.overlay.classList.add('hidden');
                this.isPaused = false;
                mission.onComplete(); // Desbloquea la siguiente cascada matemática
                this.activeMissionIndex++;
            }, 2500);
        } else {
            button.classList.add('wrong');
            this.feedbackEl.innerText = option.feedback;
            this.feedbackEl.style.color = '#dc2626';
            
            // Permite intentar de nuevo después de 1.5 segundos
            setTimeout(() => {
                button.classList.remove('wrong');
                this.feedbackEl.innerText = "";
                buttons.forEach(b => b.disabled = false);
            }, 1500);
        }
    }
};