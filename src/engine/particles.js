// Screen-space particle pool (rocket exhaust, moon dust, sparkles...).
export class Particles {
  constructor(max = 400) {
    this.max = max;
    this.list = [];
  }

  clear() {
    this.list.length = 0;
  }

  spawn(x, y, vx, vy, life, color, size = 1, g = 0) {
    if (this.list.length >= this.max) return;
    this.list.push({ x, y, vx, vy, life, max: life, color, size, g });
  }

  step(dt) {
    const out = [];
    for (const p of this.list) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.g * dt;
      p.life -= dt;
      if (p.life > 0) out.push(p);
    }
    this.list = out;
  }

  draw(ctx) {
    for (const p of this.list) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }
}
