// Mission control: loads cv-data.json, boots i18n, renders the semantic DOM,
// wires the HUD and drives the canvas render loop.
import './styles/base.css';
import './styles/hud.css';
import './styles/cards.css';
import './styles/reduced.css';

import { initLang, onLang, L } from './engine/i18n.js';
import { ACTS, computeLayout } from './engine/acts.js';
import { ScrollMap } from './engine/scroll.js';
import { Renderer } from './engine/renderer.js';
import { Particles } from './engine/particles.js';
import { audio } from './engine/audio.js';
import { t } from './engine/i18n.js';
import { runBoot } from './ui/boot.js';
import { initHud, updateHud, refreshHud } from './ui/hud.js';
import { renderAll } from './ui/cards.js';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function setupKonami(app) {
  let i = 0;
  window.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === KONAMI[i]) {
      i++;
      if (i === KONAMI.length) {
        i = 0;
        if (!app.state.konami) {
          app.state.konami = true;
          audio.konami();
          toast(t('labels.konami'));
        }
      }
    } else {
      i = k === KONAMI[0] ? 1 : 0;
    }
  });
}

async function start() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) document.body.classList.add('reduced');

  const res = await fetch(`${import.meta.env.BASE_URL}cv-data.json`);
  const data = await res.json();

  initLang(data.meta?.defaultLang || 'es');
  const bootDone = runBoot(reduced ? 400 : 1500);

  const app = {
    data,
    layout: computeLayout(data),
    state: { konami: false },
    reduced
  };

  document.title = L(data.meta.title);
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = L(data.meta.description);

  renderAll(app);

  const scrollMap = new ScrollMap(ACTS);
  app.scroll = scrollMap;
  initHud(app, scrollMap);
  setupKonami(app);

  // instant language switch: re-render text, keep scroll position (section
  // heights are fixed in vh, so scrollY simply stays valid)
  onLang(() => {
    document.title = L(data.meta.title);
    if (metaDesc) metaDesc.content = L(data.meta.description);
    renderAll(app);
    refreshHud(app, scrollMap);
  });

  window.addEventListener('resize', () => scrollMap.measure());

  if (!reduced) {
    const parts = new Particles();
    const renderer = new Renderer(document.getElementById('world'));
    ACTS.forEach((a) => a.scene.init(app));

    // pre-compute fade boundaries (soft cut between non-contiguous scenes)
    const fadeStartsVh = ACTS.filter((a) => a.fadeBoundary).map((a) => scrollMap.ranges.find((r) => r.id === a.id).startVh);

    let lastIdx = -1;
    renderer.start((ctx, w, h, time, dt) => {
      const s = scrollMap.get();
      if (s.idx !== lastIdx) {
        parts.clear();
        lastIdx = s.idx;
      }
      const v = { w, h, t: time, dt, p: s.p, gp: s.global, app, parts };
      ACTS[s.idx].scene.draw(ctx, v);
      parts.step(dt);
      parts.draw(ctx);

      // black fade near act boundaries that need it
      let overlay = 0;
      for (const bVh of fadeStartsVh) {
        const d = Math.abs(s.y - scrollMap.px(bVh)) / (scrollMap.vh * 0.3);
        if (d < 1) overlay = Math.max(overlay, 1 - d);
      }
      if (overlay > 0.01) {
        ctx.globalAlpha = overlay;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }

      updateHud(s.global);
    });
  } else {
    // static mode: HUD progress tracks the natural document height
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      updateHud(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  await bootDone;
}

start();
