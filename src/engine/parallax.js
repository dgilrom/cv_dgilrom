// Math + background helpers shared by all scenes.
import { mulberry32 } from '../sprites/px.js';

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const ease = (t) => t * t * (3 - 2 * t); // smoothstep

export function lerpColor(c1, c2, t) {
  const p = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const [r1, g1, b1] = p(c1);
  const [r2, g2, b2] = p(c2);
  const h = (n) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(lerp(r1, r2, t))}${h(lerp(g1, g2, t))}${h(lerp(b1, b2, t))}`;
}

/** Sample a [[pos, color], ...] stop list at t (0..1). */
export function sampleStops(stops, t) {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [p0, c0] = stops[i - 1];
      const [p1, c1] = stops[i];
      return lerpColor(c0, c1, (t - p0) / Math.max(1e-6, p1 - p0));
    }
  }
  return stops[stops.length - 1][1];
}

/** Banded vertical gradient (discrete steps = retro look, cheap fills). */
export function skyGrad(ctx, w, h, stops, bands = 28) {
  const bh = Math.ceil(h / bands);
  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = sampleStops(stops, i / (bands - 1));
    ctx.fillRect(0, i * bh, w, bh + 1);
  }
}

/** Interpolate two stop lists (used for dusk -> space during ascent). */
export function mixStops(a, b, t) {
  return a.map((s, i) => [lerp(s[0], (b[i] || b[b.length - 1])[0], t), lerpColor(s[1], (b[i] || b[b.length - 1])[1], t)]);
}

export function makeStars(n, seed) {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => ({
    x: r(),
    y: r(),
    ph: r() * Math.PI * 2,
    big: r() < 0.15
  }));
}

/**
 * Draw a twinkling starfield. offY is a normalized parallax offset (stars
 * wrap vertically), alpha a global fade.
 */
export function drawStars(ctx, stars, w, h, t, offY = 0, alpha = 1) {
  if (alpha <= 0.01) return;
  for (const s of stars) {
    const tw = 0.55 + 0.45 * Math.sin(t * 2 + s.ph);
    ctx.globalAlpha = alpha * tw;
    ctx.fillStyle = s.big ? '#9fe8ff' : '#e8e8ff';
    const sy = ((((s.y + offY) % 1) + 1) % 1) * h;
    ctx.fillRect(Math.round(s.x * w), Math.round(sy), s.big ? 2 : 1, s.big ? 2 : 1);
  }
  ctx.globalAlpha = 1;
}

/** Stepped pyramid "hill" silhouette. */
export function hill(ctx, x, baseY, size, color) {
  ctx.fillStyle = color;
  const steps = 4;
  for (let i = 0; i < steps; i++) {
    const w = size * (1 - i / steps);
    ctx.fillRect(Math.round(x - w / 2), Math.round(baseY - (i + 1) * (size / 8)), Math.round(w), Math.ceil(size / 8));
  }
}
