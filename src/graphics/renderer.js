import { state } from '../core/state.js';
import { input } from '../core/input.js';

export const renderer = {
    init(canvas, ctx) {
        this.canvas = canvas; this.ctx = ctx;
        this.bloodCells = [];  
        for(let i = 0; i < 30; i++) this.bloodCells.push({ x: Math.random() * canvas.width, y: 0, speed: 1 + Math.random() * 2, size: 6 + Math.random() * 3 });
    },

    // FUNCIÓN PARA DIBUJAR INSTRUCCIONES CENTRADAS EN CADA PANTALLA
    draw() {
        // Leemos la resolución lógica correcta en cada frame
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        if (state.currentTab === 'molecular') this.drawMolecular();
        else if (state.currentTab === 'celular') this.drawCelular();
        else if (state.currentTab === 'tisular') this.drawTisular();
        else if (state.currentTab === 'sistemico') this.drawSistemico();
    },

    drawInstructionBar(titulo, subtitulo) {
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        this.ctx.fillRect(0, 0, this.width, 70); // Usar this.width
        this.ctx.fillStyle = '#fef08a'; 
        this.ctx.font = '16px bold system-ui';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(titulo, this.width / 2, 30);
        this.ctx.fillStyle = '#cbd5e1'; 
        this.ctx.font = '13px system-ui';
        this.ctx.fillText(subtitulo, this.width / 2, 50);
    },

    drawMolecular() {
        this.ctx.fillStyle = '#0f172a'; this.ctx.fillRect(0, 0, this.width, this.height);
        this.drawInstructionBar("Paso 1: Inhibición Competitiva", "Arrastra la Estatina hacia la Enzima HMG-CoA");

        const statin = state.interactives.statin; const enzyme = state.interactives.enzymeHmgCoa;

        this.ctx.fillStyle = statin.isBound ? '#64748b' : '#f59e0b';
        this.ctx.beginPath(); this.ctx.arc(enzyme.x, enzyme.y, enzyme.radius, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#fff'; this.ctx.font = '14px system-ui'; this.ctx.textAlign = 'center';
        this.ctx.fillText("HMG-CoA Reductasa", enzyme.x, enzyme.y + enzyme.radius + 20);

        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.beginPath(); this.ctx.arc(statin.x, statin.y, statin.radius, 0, Math.PI * 2); this.ctx.fill();
        if (statin.isDragging) { this.ctx.strokeStyle = '#fff'; this.ctx.lineWidth = 2; this.ctx.stroke(); }
        this.ctx.fillStyle = '#fff'; this.ctx.font = '12px system-ui'; this.ctx.fillText("Estatina", statin.x, statin.y + 4);

        // Textos elevados para no chocar con el botón
        this.ctx.font = '16px system-ui';
        this.ctx.fillText(`Ácido Mevalónico: ${Math.round(state.molecular.mevalonate)}%`, this.width/2, this.height - 110);
        this.ctx.fillText(`Isoprenoides: ${Math.round(state.molecular.isoprenoids)}%`, this.width/2, this.height - 80);
    },

    drawCelular() {
        this.ctx.fillStyle = '#064e3b'; this.ctx.fillRect(0, 0, this.width, this.height); 
        
        if (state.molecular.mevalonate <= 50) {
            this.drawInstructionBar("Paso 2: Translocación Genética", "Arrastra el SREBP hacia el Núcleo (ADN)");
        } else {
            this.drawInstructionBar("Bloqueado: Colesterol Alto", "Debes completar el Nivel Molecular primero");
        }

        const srebp = state.interactives.srebp; const nucleus = state.interactives.nucleus;

        this.ctx.fillStyle = '#10b981'; this.ctx.fillRect(0, 90, this.width, 10);
        this.ctx.fillStyle = '#fff'; this.ctx.font = '15px system-ui'; this.ctx.textAlign = 'center';
        this.ctx.fillText(`Receptores LDLR: ${Math.round(state.celular.ldlReceptors)}%`, this.width/2, 120);

        this.ctx.fillStyle = '#022c22'; this.ctx.beginPath(); this.ctx.arc(nucleus.x, nucleus.y, nucleus.radius, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillStyle = '#6ee7b7'; this.ctx.fillText("Núcleo (ADN)", nucleus.x, nucleus.y + 5);

        if (state.molecular.mevalonate <= 50) {
            this.ctx.fillStyle = '#c084fc'; 
            this.ctx.beginPath(); this.ctx.arc(srebp.x, srebp.y, srebp.radius, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.fillStyle = '#fff'; this.ctx.font = '14px bold system-ui'; this.ctx.fillText("SREBP", srebp.x, srebp.y + 5);
        }
    },

    drawTisular() {
        this.ctx.fillStyle = '#450a0a'; this.ctx.fillRect(0, 0, this.width, this.height);
        
        if (state.molecular.mevalonate <= 50) {
            this.drawInstructionBar("Paso 3: Efectos Pleiotrópicos", "Toca los macrófagos y enciende la eNOS");
        } else {
            this.drawInstructionBar("Bloqueado: Isoprenoides Altos", "Completa el Nivel Molecular primero");
        }

        const eNos = state.interactives.eNosNode;

        state.tisular.macrophages.forEach(m => {
            this.ctx.beginPath(); this.ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = m.active ? '#ef4444' : '#22c55e'; this.ctx.fill(); 
            this.ctx.fillStyle = '#fff'; this.ctx.font = '14px system-ui'; this.ctx.textAlign = 'center';
            this.ctx.fillText(m.marker, m.x, m.y + 5);
        });

        this.ctx.beginPath(); this.ctx.arc(eNos.x, eNos.y, eNos.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = eNos.active ? '#3b82f6' : '#64748b'; this.ctx.fill();
        this.ctx.fillStyle = '#fff'; this.ctx.fillText("eNOS", eNos.x, eNos.y + 5);

        // Textos elevados
        this.ctx.font = '15px system-ui';
        this.ctx.fillText(`Metaloproteinasas: ${Math.round(state.tisular.metalloproteinases)}%`, this.width/2, this.height - 110);
        this.ctx.fillText(`Óxido Nítrico (NO): ${Math.round(state.tisular.nitricOxide)}%`, this.width/2, this.height - 80);
    },

    drawSistemico() {
        const width = this.width; const height = this.height;
        this.ctx.fillStyle = '#0f172a'; this.ctx.fillRect(0, 0, width, height);

        // Variables de progreso
        const isMolecularDone = state.interactives.statin.isBound;
        const isCelularDone = state.interactives.srebp.inNucleus;
        const isTisularDone = !state.tisular.macrophages.some(m => m.active) && state.interactives.eNosNode.active;

        // 1. BARRA DE INSTRUCCIONES DINÁMICA
        if (isTisularDone) {
            this.drawInstructionBar("Éxito Clínico", "Efectos pleiotrópicos activos: Placa estabilizada y LDL depurado");
        } else if (isCelularDone) {
            this.drawInstructionBar("Reacción Plasmática", "Los receptores LDLR están limpiando el colesterol de la sangre");
        } else if (isMolecularDone) {
            this.drawInstructionBar("Reacción Plasmática", "La síntesis hepática se detuvo. Isoprenoides a la baja.");
        } else {
            this.drawInstructionBar("Estado Inicial (Crítico)", "Placa inestable, LDL elevado y flujo vascular restringido");
        }

        // 2. DIBUJO DEL VASO Y FLUJO
        const radius = 40 + (state.tisular.nitricOxide * 0.4); 
        this.ctx.fillStyle = '#7f1d1d'; this.ctx.fillRect(0, 100, width, radius * 2);

        this.ctx.fillStyle = '#dc2626';
        this.bloodCells.forEach(cell => {
            cell.x += cell.speed * (1 + (state.tisular.nitricOxide/50)); 
            if (cell.x > width + 20) cell.x = -20;
            cell.y = 100 + radius + (Math.sin(cell.x * 0.05) * (radius * 0.8));
            this.ctx.beginPath(); this.ctx.arc(cell.x, cell.y, cell.size, 0, Math.PI * 2); this.ctx.fill();
        });

        // 3. PANEL DE RESULTADOS (Levantado para no chocar con el botón)
        this.ctx.fillStyle = '#fff'; this.ctx.textAlign = 'center'; 
        this.ctx.font = '18px bold system-ui'; 
        this.ctx.fillText("Perfil Lipídico Plasmático", width/2, height - 210);
        
        this.ctx.font = '16px system-ui';
        this.ctx.fillStyle = state.sistemico.ldl < 100 ? '#4ade80' : '#fca5a5';
        this.ctx.fillText(`Colesterol LDL: ${Math.round(state.sistemico.ldl)} mg/dL`, width/2, height - 180);
        
        this.ctx.fillStyle = state.sistemico.tg < 130 ? '#4ade80' : '#fca5a5';
        this.ctx.fillText(`Triglicéridos: ${Math.round(state.sistemico.tg)} mg/dL`, width/2, height - 155);

        this.ctx.fillStyle = state.sistemico.hdl > 42 ? '#4ade80' : '#cbd5e1';
        this.ctx.fillText(`Colesterol HDL: ${Math.round(state.sistemico.hdl)} mg/dL`, width/2, height - 130);

        // Mensaje Final levantado casi 100px desde abajo
        if (state.sistemico.cardioRisk < 50) {
            this.ctx.fillStyle = '#4ade80'; this.ctx.font = '18px bold system-ui';
            this.ctx.fillText("✅ Riesgo Cardiovascular Reducido", width/2, height - 90);
        } else {
            this.ctx.fillStyle = '#ef4444'; this.ctx.font = '18px bold system-ui';
            this.ctx.fillText("⚠️ Alto Riesgo Cardiovascular", width/2, height - 90);
        }
    }
};