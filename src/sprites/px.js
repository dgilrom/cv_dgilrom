// Tiny pixel-art drawing toolkit. Everything renders into small offscreen
// canvases that get blitted (and upscaled with crisp pixels) by the engine.
import { CHARS } from './palette.js';

/**
 * Global sprite scale: every sprite pixel renders as K x K canvas pixels.
 * Sprites (astronaut, buildings, rocket...) get bigger relative to the
 * scene backgrounds (sky, terrain, stars), which stay at 1x.
 */
export const K = 2;

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w * K;
  c.height = h * K;
  // pre-scale the context so all drawing code keeps using logical coords
  c.getContext('2d').scale(K, K);
  return c;
}

/** Unscaled canvas for compositing already-scaled sprites (e.g. buildRocket). */
export function makeRawCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Build a sprite from a string grid. Each char maps to a palette color via
 * CHARS (or the `extra` override map). '.' and ' ' are transparent.
 * Rows may have different lengths; missing cells are transparent.
 */
export function sprite(rows, extra = {}) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = extra[ch] || CHARS[ch] || '#ff00ff';
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

export function blit(ctx, img, x, y) {
  ctx.drawImage(img, Math.round(x), Math.round(y));
}

/** Blit centered on (x, y). */
export function blitC(ctx, img, x, y) {
  ctx.drawImage(img, Math.round(x - img.width / 2), Math.round(y - img.height / 2));
}

/** Filled circle (scanline, no antialiasing). */
export function disc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    const s = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
    ctx.fillRect(Math.round(cx - s), Math.round(cy + y), 2 * s + 1, 1);
  }
}

/** Circle outline made of discrete pixels. */
export function ring(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  const steps = Math.max(12, Math.floor(r * 8));
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    ctx.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
  }
}

/** Pixel line (integer stepping). */
export function seg(ctx, x0, y0, x1, y1, color) {
  ctx.fillStyle = color;
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    ctx.fillRect(Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 1, 1);
  }
}

/** Deterministic PRNG for stable procedural detail (stars, craters...). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
