// Low-resolution canvas + rAF loop. The canvas renders at ~1/S of the
// viewport and is upscaled by CSS with image-rendering: pixelated — that IS
// the retro look, and it keeps fill costs tiny (60fps on modest hardware).
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const vw = Math.max(1, window.innerWidth);
    const vh = Math.max(1, window.innerHeight);
    this.vw = vw;
    this.vh = vh;
    this.S = Math.max(2, Math.round(vw / 420));
    this.w = Math.ceil(vw / this.S);
    this.h = Math.ceil(vh / this.S);
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.ctx.imageSmoothingEnabled = false;
  }

  start(tick) {
    let last = performance.now();
    const loop = (now) => {
      // resize events can be missed (hidden panes, mobile URL bar); self-heal
      if (window.innerWidth !== this.vw || window.innerHeight !== this.vh) this.resize();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      tick(this.ctx, this.w, this.h, now / 1000, dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
  }
}
