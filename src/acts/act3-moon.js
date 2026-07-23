// ACT 3 — The Moon (skills & certifications). Landing, then a bouncy EVA
// walk past planted certification flags while skill chips float in the DOM.
import { PAL, SPACE_SKY, ACCENTS } from '../sprites/palette.js';
import { blit, blitC, disc, mulberry32 } from '../sprites/px.js';
import { nose, engine } from '../sprites/sheets/rocket.js';
import { astronautWalk } from '../sprites/sheets/astronaut.js';
import { earth } from '../sprites/sheets/celestial.js';
import { makeStars, drawStars, skyGrad, clamp, lerp, ease } from '../engine/parallax.js';
import { makeCanvas } from '../sprites/px.js';
import { audio } from '../engine/audio.js';

function flagSprite(accent) {
  const c = makeCanvas(12, 16);
  const g = c.getContext('2d');
  g.fillStyle = PAL.grey1;
  g.fillRect(1, 0, 1, 16);
  g.fillStyle = accent;
  g.fillRect(2, 1, 8, 5);
  g.fillStyle = '#ffffff';
  g.fillRect(3, 3, 2, 1); // emblem
  return c;
}

export default {
  id: 'moon',

  init(app) {
    this.app = app;
    this.stars = makeStars(80, 33);
    this.earth = earth(7);
    this.nose = nose();
    this.engine = engine();
    this.walk = astronautWalk();
    this.flags = (app.data.certifications || []).map((c, i) => ({
      spr: flagSprite(ACCENTS[(i + 2) % ACCENTS.length]),
      wx: 0.45 + i * 0.28
    }));
    const rng = mulberry32(64);
    this.craters = Array.from({ length: 10 }, () => ({ x: rng(), r: 2 + rng() * 5, d: rng() }));
    this.landed = false;
  },

  draw(ctx, v) {
    const { w, h, t, p, parts } = v;
    const L = this.app.layout.moon.landEnd;
    const gy = Math.round(h * 0.74);
    const worldW = w * 2.2;
    const camX = ease(clamp((p - L) / (1 - L), 0, 1)) * (worldW - w) * 0.75;

    skyGrad(ctx, w, h, SPACE_SKY);
    drawStars(ctx, this.stars, w, h, t, camX / (worldW * 4), 0.9);

    // Earth hanging in the black sky
    blitC(ctx, this.earth, w * 0.14 - camX * 0.04, h * 0.14 + Math.sin(t * 0.4) * 1.5);

    // lunar surface with a stepped horizon curve
    for (let x = 0; x < w; x += 4) {
      const yoff = Math.round(2 * Math.sin(((x + camX * 0.2) / w) * Math.PI * 1.2));
      ctx.fillStyle = PAL.moon1;
      ctx.fillRect(x, gy - yoff, 4, 3);
      ctx.fillStyle = PAL.moon2;
      ctx.fillRect(x, gy - yoff + 3, 4, h);
    }
    ctx.fillStyle = PAL.moon3;
    ctx.fillRect(0, Math.round(h * 0.9), w, h);

    // craters (world-anchored)
    for (const cr of this.craters) {
      const cx = cr.x * worldW - camX;
      if (cx < -12 || cx > w + 12) continue;
      const cy = gy + 5 + cr.d * (h * 0.9 - gy - 8);
      disc(ctx, cx, cy, cr.r, PAL.moon3);
      disc(ctx, cx - 1, cy - 1, cr.r - 1, PAL.moon2);
    }

    // landing: final stage descends, dust burst, then stays parked
    const landerWX = 0.28 * worldW;
    const lx = landerWX - camX;
    const stackH = this.nose.height + this.engine.height;
    const nx = Math.floor(this.nose.width / 2);
    if (p < L) {
      const ly = lerp(-stackH - 10, gy - stackH + 1, ease(p / L));
      blit(ctx, this.nose, lx - nx, ly);
      blit(ctx, this.engine, lx - nx, ly + this.nose.height);
      // retro thruster
      ctx.fillStyle = PAL.flame;
      ctx.fillRect(Math.round(lx) - 2, Math.round(ly + stackH), 4, 6);
      if (p > L * 0.8) {
        for (let i = 0; i < 4; i++) {
          parts.spawn(lx - 12 + Math.random() * 24, gy + 1, (Math.random() - 0.5) * 40, -Math.random() * 12, 0.8, PAL.moon1, 2, 30);
        }
      }
      this.landed = false;
    } else {
      if (!this.landed) {
        audio.bleep();
        this.landed = true;
      }
      if (lx > -40 && lx < w + 40) {
        blit(ctx, this.nose, lx - nx, gy - stackH + 1);
        blit(ctx, this.engine, lx - nx, gy - this.engine.height + 1);
      }
    }

    // certification flags planted on the surface
    this.flags.forEach((f, i) => {
      const fx = f.wx * worldW - camX;
      if (fx < -16 || fx > w + 16) return;
      // gentle wave: shift the cloth column by 1px
      blit(ctx, f.spr, fx, gy - f.spr.height + 2 + (Math.sin(t * 3 + i) > 0.6 ? -1 : 0));
    });

    // astronaut EVA (bouncy low-gravity walk)
    if (p >= L) {
      const hop = Math.abs(Math.sin(camX * 0.25 + t * 2)) * 2;
      const frame = this.walk[Math.floor(t * 4) % 2];
      blit(ctx, frame, w * 0.34, gy - frame.height + 1 - hop);
      // kicked-up dust
      if (Math.random() < 0.15) {
        parts.spawn(w * 0.34 + 10, gy, (Math.random() - 0.5) * 8, -Math.random() * 6, 0.7, PAL.moon1, 2, 12);
      }
    }

    // faint orbit rings where the DOM skill chips float (zero-g zone)
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = PAL.cyan;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + t * 0.15;
      ctx.fillRect(Math.round(w * 0.55 + Math.cos(a) * w * 0.22), Math.round(h * 0.32 + Math.sin(a) * h * 0.1), 1, 1);
    }
    ctx.globalAlpha = 1;
  }
};
