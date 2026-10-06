export const state = {
    currentTab: 'molecular', 
    quizActive: false, 

    unlocked: {
        molecular: false, celular: false, tisular: false, sistemico: false
    },
    
    interactives: {
        // Coordenadas centradas para el nuevo diseño
        statin: { x: 80, y: 220, radius: 25, isDragging: false, isBound: false },
        enzymeHmgCoa: { x: 280, y: 220, radius: 50 },
        
        srebp: { x: 80, y: 320, radius: 25, isDragging: false, inNucleus: false },
        nucleus: { x: 280, y: 320, radius: 60 },
        
        eNosNode: { x: 225, y: 350, radius: 30, active: false }
    },
    
    molecular: { hmgCoaActivity: 100, mevalonate: 100, isoprenoids: 100 },
    
    celular: { ldlReceptors: 20, vldlSecretion: 100 },

    tisular: {
        macrophages: [
            { id: 1, x: 120, y: 200, radius: 30, active: true, marker: 'PCR' },
            { id: 2, x: 330, y: 200, radius: 30, active: true, marker: 'NF-κB' }
        ],
        metalloproteinases: 100, plaqueStability: 20, nitricOxide: 20
    },

    sistemico: {
        ldl: 160, tg: 150, hdl: 40, cardioRisk: 100
    }
};