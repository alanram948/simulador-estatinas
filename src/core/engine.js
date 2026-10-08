import { state } from './state.js';
import { input } from './input.js';
import { renderer } from '../graphics/renderer.js';

class Engine {
    constructor() {
        this.canvas = document.getElementById('sim-canvas');
        this.ctx = this.canvas.getContext('2d');
        input.init(this.canvas);
        this.lastTime = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        renderer.init(this.canvas, this.ctx);
        this.initUI();
    }

    
    resize() {
        const container = document.getElementById('simulation-container');
        if (container) {
            const rect = container.getBoundingClientRect();
            // Obtener la densidad de píxeles del dispositivo (Retina/HD)
            const dpr = window.devicePixelRatio || 1; 
            
            // Asignar el tamaño real HD al canvas interno
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            
            // Asignar el tamaño visual lógico por CSS
            this.canvas.style.width = `${rect.width}px`;
            this.canvas.style.height = `${rect.height}px`;
            
            // Escalar el contexto para que nuestros dibujos no queden pequeños
            this.ctx.scale(dpr, dpr);
        }
    }

    initUI() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.currentTarget.getAttribute('data-target');
                tabs.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                state.currentTab = target;
                
                // Limpieza total de inputs al cambiar de pestaña (Arregla el bug)
                input.isDown = false; input.justReleased = false;
                if (state.interactives.statin) state.interactives.statin.isDragging = false;
                if (state.interactives.srebp) state.interactives.srebp.isDragging = false;
            });
        });
        const startBtn = document.getElementById('start-btn');
        const introModal = document.getElementById('intro-modal');
        if (startBtn && introModal) {
            startBtn.addEventListener('click', () => {
                introModal.style.display = 'none'; // Oculta la intro
                state.introSeen = true;            // Activa el juego
            });
        }
    }

    update(deltaTime) {
        const statin = state.interactives.statin;
        const enzyme = state.interactives.enzymeHmgCoa;
        const srebp = state.interactives.srebp;
        const nucleus = state.interactives.nucleus;
        const eNos = state.interactives.eNosNode;

        // ==========================================
        // SISTEMA DE PREGUNTAS (QUIZ) CORREGIDO
        // ==========================================
        const triggerQuiz = (nivel) => {
            if (state.unlocked[nivel]) return false; // Ya está desbloqueado
            if (state.quizActive) return true;       // NUEVO: Si ya está abierto, bloquea y no redibuja

            state.quizActive = true;                 // NUEVO: Ponemos el candado
            
            const modal = document.getElementById('quiz-modal');
            const qText = document.getElementById('quiz-question');
            const optionsBox = document.getElementById('quiz-options');
            const feedback = document.getElementById('quiz-feedback');
            
            let questionData = {};
            if (nivel === 'molecular') {
                questionData = {
                    q: "Las estatinas inhiben competitivamente el paso de la biosíntesis al unirse a qué enzima:",
                    opts: [{t:"SREBP", c:false}, {t:"HMG-CoA reductasa", c:true}, {t:"eNOS", c:false}]
                };
            } else if (nivel === 'celular') {
                questionData = {
                    q: "Al bajar el colesterol, este factor de transcripción viaja al núcleo para sobreexpresar el gen del receptor de LDL (LDLR):",
                    opts: [{t:"NF-κB", c:false}, {t:"Proteína Rho", c:false}, {t:"SREBP-2", c:true}]
                };
            } else if (nivel === 'tisular') {
                questionData = {
                    q: "¿Qué efecto pleiotrópico estabiliza la placa ateromatosa?",
                    opts: [{t:"Reducción de metaloproteinasas", c:true}, {t:"Aumento de PCR", c:false}, {t:"Secreción de VLDL", c:false}]
                };
            } else if (nivel === 'sistemico') {
                questionData = {
                    q: "A nivel plasmático, las estatinas producen un descenso del colesterol LDL de:",
                    opts: [{t:"5 - 20%", c:false}, {t:"25 - 65%", c:true}, {t:"5 - 12%", c:false}]
                };
            }

            qText.innerText = questionData.q;
            optionsBox.innerHTML = '';
            feedback.innerText = '';
            
            questionData.opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.innerText = opt.t;
                btn.style.cssText = "padding: 12px; background: #334155; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-bottom: 5px;";
                
                btn.onclick = () => {
                    if (opt.c) {
                        btn.style.background = '#22c55e'; // Verde
                        feedback.style.color = '#4ade80';
                        feedback.innerText = "¡Correcto! Sistema desbloqueado.";
                        
                        // Desactivamos temporalmente todos los botones para evitar doble clic
                        const allBtns = optionsBox.querySelectorAll('button');
                        allBtns.forEach(b => b.disabled = true);

                        setTimeout(() => {
                            modal.style.display = 'none';
                            state.unlocked[nivel] = true;
                            state.quizActive = false;     // NUEVO: Quitamos el candado al acertar
                            input.justReleased = false; 
                        }, 1200);
                    } else {
                        btn.style.background = '#ef4444'; // Rojo
                        feedback.style.color = '#f87171';
                        feedback.innerText = "Incorrecto. Revisa tus notas.";
                        setTimeout(() => { 
                            btn.style.background = '#334155'; 
                            feedback.innerText = ''; 
                        }, 1500);
                    }
                };
                optionsBox.appendChild(btn);
            });
            
            modal.style.display = 'flex';
            return true; // Indicamos que el quiz se abrió correctamente
        };


        // ==========================================
        // INTERACCIONES CON BLOQUEO (ESCAPE ROOM)
        // ==========================================

        if (state.currentTab === 'molecular') {
            // Intentar arrastrar la estatina
            if (input.isDown && Math.hypot(input.x - statin.x, input.y - statin.y) < statin.radius && !statin.isBound) {
                if (!triggerQuiz('molecular')) { // Si ya está desbloqueado, se arrastra
                    statin.isDragging = true;
                }
            }
            if (statin.isDragging) {
                statin.x = input.x; statin.y = input.y;
                if (Math.hypot(statin.x - enzyme.x, statin.y - enzyme.y) < enzyme.radius + statin.radius + 15 && input.justReleased) {
                    statin.x = enzyme.x; statin.y = enzyme.y - 15;
                    statin.isBound = true; statin.isDragging = false;
                }
            }
        }

        else if (state.currentTab === 'celular') {
            if (state.molecular.mevalonate <= 50) {
                if (input.isDown && Math.hypot(input.x - srebp.x, input.y - srebp.y) < srebp.radius && !srebp.inNucleus) {
                    if (!triggerQuiz('celular')) {
                        srebp.isDragging = true;
                    }
                }
                if (srebp.isDragging) {
                    srebp.x = input.x; srebp.y = input.y;
                    if (Math.hypot(srebp.x - nucleus.x, srebp.y - nucleus.y) < nucleus.radius && input.justReleased) {
                        srebp.x = nucleus.x; srebp.y = nucleus.y;
                        srebp.inNucleus = true; srebp.isDragging = false;
                    }
                }
            }
        }

        else if (state.currentTab === 'tisular') {
            if (input.justReleased && state.molecular.mevalonate <= 50) {
                if (!triggerQuiz('tisular')) {
                    state.tisular.macrophages.forEach(m => {
                        if (m.active && Math.hypot(input.x - m.x, input.y - m.y) < m.radius + 20) m.active = false;
                    });
                    if (!eNos.active && Math.hypot(input.x - eNos.x, input.y - eNos.y) < eNos.radius + 20) eNos.active = true;
                }
            }
        }
        
        else if (state.currentTab === 'sistemico' && state.introSeen) {
            // Lanzar el quiz al entrar a la pestaña si no está desbloqueado
            if (!state.unlocked.sistemico) {
                triggerQuiz('sistemico');
            }
        }
        if (state.currentTab === 'sistemico') {
            // Solo salta si ya resolvieron el nivel anterior
            if (state.unlocked.tisular && !state.unlocked.sistemico) {
                triggerQuiz('sistemico');
            }
        }
        const nextBtn = document.getElementById('next-level-btn');
        let showNext = false;
        let targetTab = '';
        let btnText = '';

        // Variables para saber qué ya completó el alumno
        const isMolecularDone = statin.isBound;
        const isCelularDone = srebp.inNucleus;
        const isTisularDone = !state.tisular.macrophages.some(m => m.active) && eNos.active;

        // Si estamos en la pantalla SISTÉMICA (Macro)
        if (state.currentTab === 'sistemico') {
            if (!isMolecularDone) {
                showNext = true; btnText = "Paso 1: Ir a Nivel Molecular ➔"; targetTab = 'molecular';
            } else if (isMolecularDone && !isCelularDone) {
                showNext = true; btnText = "Paso 2: Ir a Nivel Celular ➔"; targetTab = 'celular';
            } else if (isCelularDone && !isTisularDone) {
                showNext = true; btnText = "Paso 3: Ir a Nivel Tisular ➔"; targetTab = 'tisular';
            } else {
                showNext = false; // Ya terminó todo
            }
        } 
        // Si acaba de terminar una acción MICRO, lo mandamos a ver el resultado
        else if (state.currentTab === 'molecular' && isMolecularDone && !isCelularDone) {
            showNext = true; btnText = "Ver Efecto Sistémico ➔"; targetTab = 'sistemico';
        } 
        else if (state.currentTab === 'celular' && isCelularDone && !isTisularDone) {
            showNext = true; btnText = "Ver Efecto Sistémico ➔"; targetTab = 'sistemico';
        } 
        else if (state.currentTab === 'tisular' && isTisularDone) {
            showNext = true; btnText = "Ver Resultado Final ➔"; targetTab = 'sistemico';
        }

        // Mostrar u ocultar el botón dinámicamente
        if (showNext && !state.quizActive) { 
            nextBtn.style.display = 'block';
            nextBtn.innerText = btnText;
            nextBtn.onclick = () => {
                document.querySelector(`.tab[data-target="${targetTab}"]`).click();
                nextBtn.style.display = 'none';
            };
        } else {
            nextBtn.style.display = 'none';
        }

        // ==========================================
        // MATEMÁTICAS / CONSECUENCIAS (Tu texto)
        // ==========================================

        // 1. Molecular: Bloqueo -> Baja Mevalonato e Isoprenoides automáticamente
        state.molecular.hmgCoaActivity += ((statin.isBound ? 10 : 100) - state.molecular.hmgCoaActivity) * 0.05;
        state.molecular.mevalonate = state.molecular.hmgCoaActivity;
        state.molecular.isoprenoids = state.molecular.hmgCoaActivity; // Representa Rho/Rab inactivándose

        // 2. Celular: SREBP en el núcleo -> Aumentan receptores, baja VLDL
        state.celular.ldlReceptors += ((srebp.inNucleus ? 150 : 20) - state.celular.ldlReceptors) * 0.05;
        state.celular.vldlSecretion += ((srebp.inNucleus ? 30 : 100) - state.celular.vldlSecretion) * 0.05;

        // 3. Tisular: Macrófagos off -> Baja Metaloproteinasas. eNOS on -> Sube NO.
        const macActive = state.tisular.macrophages.some(m => m.active);
        state.tisular.metalloproteinases += ((macActive ? 100 : 20) - state.tisular.metalloproteinases) * 0.05;
        state.tisular.plaqueStability += ((state.tisular.metalloproteinases < 50 ? 90 : 20) - state.tisular.plaqueStability) * 0.02;
        state.tisular.nitricOxide += ((eNos.active ? 100 : 20) - state.tisular.nitricOxide) * 0.05;

        // 4. Sistémico (Cálculos de Perfil Lipídico según tu texto: LDL -60%, TG -15%, HDL +10%)
        state.sistemico.ldl += ((160 - ((state.celular.ldlReceptors - 20) * 0.6)) - state.sistemico.ldl) * 0.03;
        state.sistemico.tg += ((srebp.inNucleus ? 120 : 150) - state.sistemico.tg) * 0.03; // Menos VLDL = Menos TG
        state.sistemico.hdl += ((srebp.inNucleus ? 45 : 40) - state.sistemico.hdl) * 0.01;
        state.sistemico.cardioRisk += ((state.tisular.plaqueStability > 70 ? 20 : 100) - state.sistemico.cardioRisk) * 0.05;

        // Animaciones de retorno si sueltas algo en lugar equivocado
        if (input.justReleased) {
            if (statin.isDragging) { statin.isDragging = false; if (!statin.isBound) { statin.x = 50; statin.y = 50; } }
            if (srebp.isDragging) { srebp.isDragging = false; if (!srebp.inNucleus) { srebp.x = 80; srebp.y = 250; } }
            input.justReleased = false; // Consumimos el input para que NO pase a otra pestaña
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        renderer.draw();
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.update(deltaTime);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    start() { requestAnimationFrame((t) => this.loop(t)); }
}

document.addEventListener('DOMContentLoaded', () => { const app = new Engine(); app.start(); });