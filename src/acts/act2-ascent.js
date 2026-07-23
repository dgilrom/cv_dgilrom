// ACT 2 — Launch & Ascent (experience). Countdown -> ignition -> parallax
// climb through clouds to space. One rocket stage per job; stages detach
// (deterministically, reversible on scroll-up) as each job card passes.
import { PAL, DUSK_SKY, SPACE_SKY, ACCENTS } from '../sprites/palette.js';
import { blit, blitC } from '../sprites/px.js';
import { gantry } from '../sprites/sheets/buildings.js';
import { nose, engine, stageSprites } from '../sprites/sheets/rocket.js';
import { makeCloud, moonBall } from '../sprites/sheets/celestial.js';
import { makeStars, drawStars, skyGrad, mixStops, clamp, lerp, ease } from '../engine/parallax.js';
import { drawText } from '../sprites/font.js';
import { audio } from '../engine/audio.js';
import { t as T } from '../engine/i18n.js';

export default {
  id: 'launch',

  init(app) {
    this.app = app;
    this.stars = makeStars(90, 21);
    this.gantry = gantry();
    this.nose = nose();
    this.engine = engine();
    this.stages = stageSprites(app.data.experience.length);
    this.clouds = [makeCloud(46, 12, 4), makeCloud(34, 10, 5), makeCloud(56, 14, 6), makeCloud(40, 11, 8)];
    this.moon = moonBall(10);
    this.lastCount = -1;
    this.lastDetached = 0;
    this.ignited = false;
  },

  // stage i detaches shortly after its card scrolls past
  detachThreshold(i) {
    return (this.app.layout.launch.cards[i] ?? 0.5) + 0.05;
  },

  draw(ctx, v) {
    const { w, h, t, p, parts } = v;
    const { countEnd: CE, ign: IG } = this.app.layout.launch;
    const N = this.stages.length;
    const rx = Math.round(w * 0.5);

    if (p < IG) {
      this.drawPad(ctx, v, CE, IG, rx);
      return;
    }

    // ---- ascent ----
    const a = clamp((p - IG) / (1 - IG), 0, 1);

    skyGrad(ctx, w, h, mixStops(DUSK_SKY, SPACE_SKY, clamp(a * 1.7, 0, 1)));
    drawStars(ctx, this.stars, w, h, t, a * 0.5, clamp(a * 1.6 + 0.15, 0, 1));

    // ground falling away
    const gy = h * 0.8 + a * h * 3;
    if (gy < h + 10) {
      ctx.fillStyle = '#233620';
      ctx.fillRect(0, Math.round(gy), w, h);
      blit(ctx, this.gantry, rx - 22, gy - this.gantry.height + 2);
    }

    // cloud layers sweeping down at different speeds (parallax)
    if (a < 0.55) {
      this.clouds.forEach((c, i) => {
        const speed = 4 + i * 2.2;
        const cy = h * (-0.5 - i * 0.7) + a * h * speed;
        if (cy > -20 && cy < h + 20) {
          ctx.globalAlpha = clamp(1 - a * 1.6, 0.15, 1);
          blit(ctx, c, w * (0.1 + ((i * 0.27) % 0.7)) + Math.sin(t * 0.4 + i) * 2, cy);
          ctx.globalAlpha = 1;
        }
      });
    }

    // rocket (with remaining stages)
    const ry = h * 0.4 + Math.sin(t * 1.6) * 1.5;
    const detached = this.countDetached(p);
    if (detached !== this.lastDetached) {
      if (detached > this.lastDetached) audio.sep();
      this.lastDetached = detached;
    }

    const stackTop = this.drawStack(ctx, rx, ry, detached, t, parts, w, h, true);

    // falling detached stages (position derived from p => scrubs cleanly)
    for (let i = 0; i < detached; i++) {
      const ft = p - this.detachThreshold(i);
      const dir = i % 2 === 0 ? -1 : 1;
      const fx = rx + dir * ft * w * 2.2;
      const fy = ry + 20 + ft * h * 9;
      if (fy < h + 20) {
        ctx.save();
        ctx.translate(Math.round(fx), Math.round(fy));
        ctx.rotate(dir * ft * 14);
        ctx.drawImage(this.stages[i], -6, -4);
        ctx.restore();
      }
    }

    // moon preview near the top of the climb
    if (a > 0.78) {
      const my = lerp(-30, h * 0.16, ease((a - 0.78) / 0.22));
      blitC(ctx, this.moon, w * 0.72, my);
    }

    // altitude readout
    const alt = Math.round(ease(a) * 400);
    drawText(ctx, `${alt} ${T('labels.altUnit')}`, w - 4, 5, { scale: 1, color: PAL.cyan, align: 'right' });

    if (a < 0.1) {
      ctx.globalAlpha = 1 - a / 0.1;
      drawText(ctx, T('countdown.liftoff'), w / 2, h * 0.16, { scale: 2, color: PAL.yellow, align: 'center' });
      ctx.globalAlpha = 1;
    }
  },

  drawPad(ctx, v, CE, IG, rx) {
    const { w, h, t, p, parts } = v;
    const gy = Math.round(h * 0.8);

    skyGrad(ctx, w, h, DUSK_SKY);
    drawStars(ctx, this.stars, w, h * 0.55, t, 0, 0.6);
    ctx.fillStyle = '#233620';
    ctx.fillRect(0, gy, w, h - gy);
    ctx.fillStyle = '#1a2818';
    ctx.fillRect(0, gy + 6, w, h - gy - 6);
    ctx.fillStyle = PAL.grey3;
    ctx.fillRect(rx - 16, gy - 2, 36, 4);

    const shake = p > CE ? Math.sin(t * 70) * 1.5 : 0;
    ctx.save();
    ctx.translate(Math.round(shake), Math.round(shake * 0.6));

    // gantry retracts as the count progresses
    blit(ctx, this.gantry, rx - 22 - (p / CE) * 6, gy - this.gantry.height + 2);
    this.drawStack(ctx, rx, 0, 0, t, parts, w, h, false, gy);

    // ignition flame + smoke
    if (p > CE) {
      const f = (p - CE) / (IG - CE);
      for (let i = 0; i < 5; i++) {
        parts.spawn(
          rx - 4 + Math.random() * 8,
          gy,
          (Math.random() - 0.5) * 30 * f,
          -Math.random() * 8 * f,
          0.5,
          [PAL.yellow, PAL.flame, PAL.orange][i % 3],
          2
        );
        parts.spawn(rx - 10 + Math.random() * 20, gy, (Math.random() - 0.5) * 40, -Math.random() * 4, 1.2, PAL.grey2, 2);
      }
      ctx.globalAlpha = f * 0.5;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // countdown digits
    if (p < CE) {
      const n = Math.max(1, 10 - Math.floor((p / CE) * 10));
      if (n !== this.lastCount) {
        audio.tick();
        this.lastCount = n;
      }
      drawText(ctx, String(n), w / 2, h * 0.22, { scale: 6, color: PAL.yellow, align: 'center' });
      drawText(ctx, 'T-', w / 2 - 24 * 2, h * 0.22 + 6, { scale: 2, color: PAL.grey1, align: 'right' });
    } else {
      if (!this.ignited) {
        audio.ignition();
        this.ignited = true;
      }
      drawText(ctx, T('countdown.ignition'), w / 2, h * 0.24, { scale: 3, color: PAL.flame, align: 'center' });
    }
    if (p < 0.02) this.ignited = false;
  },

  countDetached(p) {
    let d = 0;
    while (d < this.stages.length && p > this.detachThreshold(d)) d++;
    return d;
  },

  /** Draw the remaining stack. In flight, centered on ry; on pad, resting on gy. */
  drawStack(ctx, rx, ry, detached, t, parts, w, h, flying, gy = 0) {
    const remaining = this.stages.length - detached;
    const totalH = this.nose.height + remaining * 8 + this.engine.height;
    let y = flying ? Math.round(ry - totalH / 2) : gy - totalH + 2;
    const x = rx - 5;

    blit(ctx, this.nose, x, y);
    y += this.nose.height;
    for (let i = this.stages.length - 1; i >= detached; i--) {
      blit(ctx, this.stages[i], x, y);
      y += 8;
    }
    blit(ctx, this.engine, x, y);
    y += this.engine.height;

    if (flying) {
      // exhaust flame + trail
      const len = 6 + Math.floor(Math.sin(t * 30) * 2 + 2);
      ctx.fillStyle = PAL.yellow;
      ctx.fillRect(rx - 2, y, 4, Math.floor(len / 2));
      ctx.fillStyle = PAL.flame;
      ctx.fillRect(rx - 1, y + Math.floor(len / 2), 2, len);
      for (let i = 0; i < 3; i++) {
        parts.spawn(rx - 2 + Math.random() * 4, y + len, (Math.random() - 0.5) * 6, 30 + Math.random() * 30, 0.6, [PAL.orange, PAL.grey2, PAL.yellow][i % 3], 1);
      }
    }
    return y;
  }
};
