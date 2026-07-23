// ACT 1 — Earth Base (education). Horizontal camera pan across the launch
// facility at dusk; each building is an education entry, ending at the pad.
import { PAL, DUSK_SKY } from '../sprites/palette.js';
import { blit, mulberry32 } from '../sprites/px.js';
import { hangar, dish, dome, gantry } from '../sprites/sheets/buildings.js';
import { buildRocket } from '../sprites/sheets/rocket.js';
import { astronautWalk } from '../sprites/sheets/astronaut.js';
import { makeCloud } from '../sprites/sheets/celestial.js';
import { makeStars, drawStars, skyGrad, clamp, ease, hill } from '../engine/parallax.js';

export default {
  id: 'base',

  init(app) {
    this.app = app;
    this.stars = makeStars(50, 7);
    const types = [hangar, dish, dome];
    this.buildings = (app.data.education || []).map((e, i) => ({
      spr: types[i % types.length](),
      wx: 0.12 + i * 0.2
    }));
    this.gantry = gantry();
    this.rocket = buildRocket(app.data.experience.length);
    this.clouds = [makeCloud(30, 9, 1), makeCloud(42, 11, 2), makeCloud(24, 7, 3)];
    this.walk = astronautWalk();
    this.rng = mulberry32(99);
    this.groundDots = Array.from({ length: 90 }, () => ({ x: this.rng(), y: this.rng() }));
  },

  draw(ctx, v) {
    const { w, h, t, p } = v;
    const gy = Math.round(h * 0.8);
    const worldW = w * 2.4;
    const camX = ease(clamp(p * 1.04, 0, 1)) * (worldW - w);

    skyGrad(ctx, w, h, DUSK_SKY);
    drawStars(ctx, this.stars, w, h * 0.55, t, 0, 0.7);

    // distant hills (slow parallax)
    for (let i = 0; i < 9; i++) {
      const hx = (i / 8) * worldW * 1.1 - camX * 0.4;
      if (hx > -60 && hx < w + 60) hill(ctx, hx, gy + 2, 40 + (i % 3) * 18, '#1a1a38');
    }

    // clouds (drift + parallax)
    this.clouds.forEach((c, i) => {
      const cx = ((i * 0.33 + 0.1) * worldW - camX * 0.55 + t * 2.5) % (worldW * 0.8);
      blit(ctx, c, cx - 20, h * (0.12 + i * 0.1));
    });

    // ground
    ctx.fillStyle = '#233620';
    ctx.fillRect(0, gy, w, h - gy);
    ctx.fillStyle = '#1a2818';
    ctx.fillRect(0, gy + 6, w, h - gy - 6);
    ctx.fillStyle = '#2e4429';
    for (const d of this.groundDots) {
      const dx = d.x * worldW - camX;
      if (dx >= 0 && dx < w) ctx.fillRect(Math.round(dx), Math.round(gy + 2 + d.y * (h - gy - 4)), 1, 1);
    }
    // tarmac road toward the pad
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(0, gy, w, 2);

    // buildings, each linked to an education card
    const layout = this.app.layout.base.cards;
    this.buildings.forEach((b, i) => {
      const bx = b.wx * worldW - camX;
      if (bx < -70 || bx > w + 70) return;
      const by = gy - b.spr.height + 1;
      // highlight while its card is on screen
      const ti = layout[i] ?? 0.5;
      const near = Math.abs(p - ti) < 0.09;
      if (near) {
        ctx.globalAlpha = 0.18 + 0.08 * Math.sin(t * 4);
        ctx.fillStyle = PAL.amber;
        ctx.fillRect(Math.round(bx - 4), Math.round(by - 6), b.spr.width + 8, b.spr.height + 10);
        ctx.globalAlpha = 1;
      }
      blit(ctx, b.spr, bx, by);
      // blinking rooftop beacon
      if (Math.sin(t * 3 + i * 2) > 0) {
        ctx.fillStyle = near ? PAL.amber : PAL.red;
        ctx.fillRect(Math.round(bx + b.spr.width / 2), by - 3, 2, 2);
      }
    });

    // launch pad: gantry + rocket (world x chosen so it ends up screen-center)
    const padWX = 0.79 * worldW;
    const rx = padWX - camX;
    if (rx > -80 && rx < w + 80) {
      ctx.fillStyle = PAL.grey3;
      ctx.fillRect(Math.round(rx - 28), gy - 2, 68, 4); // pad slab
      blit(ctx, this.gantry, rx - 44, gy - this.gantry.height + 2);
      blit(ctx, this.rocket, rx - this.rocket.width / 2, gy - this.rocket.height + 2);
      // floodlight glow
      ctx.globalAlpha = 0.1 + 0.04 * Math.sin(t * 2);
      ctx.fillStyle = PAL.amber;
      ctx.fillRect(Math.round(rx - 40), gy - this.rocket.height, 88, this.rocket.height);
      ctx.globalAlpha = 1;
    }

    // astronaut strolling across the base
    if (p < 0.97) {
      const frame = this.walk[Math.floor(t * 5) % 2];
      blit(ctx, frame, w * 0.22, gy - frame.height + 2);
    }
  }
};
