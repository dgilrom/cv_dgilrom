// Persistent HUD: mission altimeter with clickable act markers, plus the
// ES/EN mission-control switch and the sound toggle. All labels come from
// ui-strings.json (no hardcoded UI text).
import { t, getLang, setLang } from '../engine/i18n.js';
import { audio } from '../engine/audio.js';

let fillEl = null;
let shipEl = null;

export function initHud(app, scrollMap) {
  const el = document.getElementById('hud');

  const total = scrollMap.totalVh;
  const markers = scrollMap.ranges
    .map((r, i) => {
      const pos = (r.startVh / total) * 100;
      return `<button class="alt-marker" data-act="${r.id}" style="bottom:${pos}%"
        aria-label="${t(`hud.acts.${r.id}`)}"><i></i><span>${t(`hud.acts.${r.id}`)}</span></button>`;
    })
    .join('');

  el.innerHTML = `
    <div class="hud-top">
      <div class="lang-switch" role="group" aria-label="${t('hud.langLabel')}">
        <button data-lang="es" class="${getLang() === 'es' ? 'on' : ''}">ES</button>
        <button data-lang="en" class="${getLang() === 'en' ? 'on' : ''}">EN</button>
      </div>
      <button class="sound-btn" aria-pressed="${audio.enabled}">${audio.enabled ? t('hud.soundOn') : t('hud.soundOff')}</button>
    </div>
    <nav class="altimeter" aria-label="${t('hud.progressLabel')}">
      <div class="alt-track">
        <div class="alt-fill"></div>
        <div class="alt-ship">▲</div>
        ${markers}
      </div>
    </nav>`;

  fillEl = el.querySelector('.alt-fill');
  shipEl = el.querySelector('.alt-ship');

  el.querySelectorAll('.alt-marker').forEach((b) => {
    b.addEventListener('click', () => {
      audio.bleep();
      if (app.reduced) {
        // reduced mode uses natural document flow, not the vh scroll map
        document.getElementById(`act-${b.dataset.act}`)?.scrollIntoView();
      } else {
        scrollMap.jump(b.dataset.act, true);
      }
    });
  });

  el.querySelectorAll('.lang-switch button').forEach((b) => {
    b.addEventListener('click', () => {
      audio.bleep();
      setLang(b.dataset.lang);
    });
  });

  el.querySelector('.sound-btn').addEventListener('click', (e) => {
    audio.setEnabled(!audio.enabled);
    e.target.setAttribute('aria-pressed', String(audio.enabled));
    e.target.textContent = audio.enabled ? t('hud.soundOn') : t('hud.soundOff');
  });
}

/** Called every frame (or on scroll in reduced mode). */
export function updateHud(global) {
  if (!fillEl) return;
  const pct = `${(global * 100).toFixed(2)}%`;
  fillEl.style.height = pct;
  shipEl.style.bottom = pct;
}

/** Re-render labels after a language change (keeps listeners via re-init). */
export function refreshHud(app, scrollMap) {
  initHud(app, scrollMap);
  updateHud(scrollMap.get().global);
}
