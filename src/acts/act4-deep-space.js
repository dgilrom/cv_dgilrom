// ACT 4 — Deep Space (hobbies & contact). The astronaut drifts past planets
// and asteroids toward the contact space station. Konami UFO lives here.
import { PAL } from '../sprites/palette.js';
import { blit, blitC } from '../sprites/px.js';
import { astronautFloat } from '../sprites/sheets/astronaut.js';
import { planetRinged, planetSmall, asteroid, ufo } from '../sprites/sheets/celestial.js';
import { station, STATION_LIGHTS } from '../sprites/sheets/station.js';
import { makeStars, drawStars, skyGrad, clamp, lerp, ease } from '../engine/parallax.js';

export default {
  id: 'space',

  init(app) {
    this.app = app;
    this.starsFar = makeStars(70, 51);
    this.starsNear = makeStars(50, 52);
    this.astro = astronautFloat();
    this.ringed = planetRinged();
    this.planets = [planetSmall(PAL.teal, 5, 9), planetSmall(PAL.purple2, 4, 10), planetSmall(PAL.darkGreen, 3, 11)];
    this.asteroids = [asteroid(1, 3), asteroid(2, 4), asteroid(3, 2), asteroid(4, 5)];
    this.station = station();
    this.ufo = ufo();
    this.docked = false;
  },

  draw(ctx, v) {
    const { w, h, t, p, parts, app } = v;

    skyGrad(ctx, w, h, [
      [0, '#04040c'],
      [0.5, '#080818'],
      [1, '#10102e']
    ]);

    // nebula blobs (layered translucent rects read as soft clouds)
    const neb = (x, y, bw, bh, color) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.04;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(bw), Math.round(bh));
      ctx.globalAlpha = 0.05;
      ctx.fillRect(Math.round(x + bw * 0.18), Math.round(y + bh * 0.25), Math.round(bw * 0.64), Math.round(bh * 0.5));
      ctx.globalAlpha = 0.06;
      ctx.fillRect(Math.round(x + bw * 0.34), Math.round(y + bh * 0.4), Math.round(bw * 0.32), Math.round(bh * 0.25));
      ctx.globalAlpha = 1;
    };
    neb(w * 0.58, h * (0.7 - p * 0.5), w * 0.36, h * 0.22, PAL.purple2);
    neb(w * 0.04, h * (1.1 - p * 0.8), w * 0.3, h * 0.18, PAL.blue);

    // two star layers, different parallax speeds
    drawStars(ctx, this.starsFar, w, h, t, p * 0.25, 0.7);
    drawStars(ctx, this.starsNear, w, h, t, p * 0.55, 1);

    // planets drifting up-screen as we travel deeper
    blitC(ctx, this.ringed, w * 0.82, h * (1.35 - p * 1.7));
    this.planets.forEach((pl, i) => {
      blitC(ctx, pl, w * (0.12 + i * 0.3), h * (0.6 + i * 0.9 - p * (1.3 + i * 0.5)));
    });
    this.asteroids.forEach((as, i) => {
      const ax = w * ((0.15 + i * 0.22) % 1) + Math.sin(t * 0.3 + i * 2) * 4;
      blitC(ctx, as, ax, h * (0.3 + i * 0.75 - p * (1 + i * 0.4)));
    });

    // drifting astronaut with jetpack puffs
    const ax = lerp(w * 0.16, w * 0.55, ease(p));
    const ay = h * 0.32 + Math.sin(t * 0.8) * 4 + p * h * 0.12;
    ctx.save();
    ctx.translate(Math.round(ax), Math.round(ay));
    ctx.rotate(Math.sin(t * 0.35) * 0.22);
    ctx.drawImage(this.astro, -5, -7);
    ctx.restore();
    if (Math.random() < 0.1) {
      parts.spawn(ax - 6, ay + 4, -8 - Math.random() * 6, (Math.random() - 0.5) * 4, 0.9, PAL.cyan, 1);
    }

    // contact station approaching from the right
    const sp = clamp((p - 0.6) / 0.4, 0, 1);
    if (sp > 0) {
      const sx = lerp(w + 50, w * 0.5, ease(sp));
      const sy = h * 0.52 + Math.sin(t * 0.5) * 2;
      blitC(ctx, this.station, sx, sy);
      // blinking lights
      const ox = sx - this.station.width / 2;
      const oy = sy - this.station.height / 2;
      STATION_LIGHTS.forEach(([lx, ly, color], i) => {
        if (Math.sin(t * 4 + i * 1.3) > 0) {
          ctx.fillStyle = color;
          ctx.fillRect(Math.round(ox + lx), Math.round(oy + ly), 2, 1);
        }
      });
      // docking tractor beam
      if (p > 0.9) {
        ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 6);
        ctx.strokeStyle = PAL.cyan;
        ctx.fillStyle = PAL.cyan;
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
          const bx = lerp(ax, sx, i / steps);
          const by = lerp(ay, sy - 10, i / steps);
          ctx.fillRect(Math.round(bx), Math.round(by), 1, 1);
        }
        ctx.globalAlpha = 1;
      }
    }

    // Konami easter egg: UFO patrol with rainbow trail
    if (app.state.konami) {
      const ux = ((t * 45) % (w + 100)) - 50;
      const uy = h * 0.16 + Math.sin(t * 2.2) * 8;
      const rainbow = [PAL.red, PAL.orange, PAL.yellow, PAL.green, PAL.cyan, PAL.purple2];
      for (let i = 0; i < 12; i++) {
        ctx.globalAlpha = 1 - i / 12;
        ctx.fillStyle = rainbow[i % rainbow.length];
        ctx.fillRect(Math.round(ux - 8 - i * 3), Math.round(uy + 2 + Math.sin(t * 2.2 - i * 0.2) * 2), 2, 1);
      }
      ctx.globalAlpha = 1;
      blitC(ctx, this.ufo, ux, uy);
    }
  }
};
