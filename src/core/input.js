export const input = {
    x: 0,
    y: 0,
    isDown: false,
    swipeStart: null,
    swipeEnd: null,
    justReleased: false,

    init(canvas) {
        // Usamos Pointer Events para que funcione igual con mouse y touch
        canvas.addEventListener('pointerdown', (e) => this.onDown(e, canvas));
        canvas.addEventListener('pointermove', (e) => this.onMove(e, canvas));
        canvas.addEventListener('pointerup', (e) => this.onUp(e));
        canvas.addEventListener('pointercancel', (e) => this.onUp(e));
        
        // Evitar comportamientos por defecto del navegador (scroll, pull-to-refresh)
        canvas.style.touchAction = 'none';
    },

    getPos(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    },

    onDown(e, canvas) {
        const pos = this.getPos(e, canvas);
        this.x = pos.x;
        this.y = pos.y;
        this.isDown = true;
        this.justReleased = false;
        this.swipeStart = { x: pos.x, y: pos.y, time: Date.now() };
    },

    onMove(e, canvas) {
        if (!this.isDown) return;
        const pos = this.getPos(e, canvas);
        this.x = pos.x;
        this.y = pos.y;
    },

    onUp(e) {
        this.isDown = false;
        this.justReleased = true;
        this.swipeEnd = { x: this.x, y: this.y, time: Date.now() };
    }
};