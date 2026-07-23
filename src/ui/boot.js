// "MISSION BOOT SEQUENCE" loading screen. Types its lines, fills the bar,
// resolves when done (or on click). Kept short so it never annoys.
import { t } from '../engine/i18n.js';

export function runBoot(minMs = 1500) {
  const el = document.getElementById('boot');
  const log = document.getElementById('boot-log');
  const bar = el.querySelector('.boot-bar i');

  return new Promise((resolve) => {
    const lines = t('boot.lines');
    const list = Array.isArray(lines) ? lines : [];
    let i = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(iv);
      el.classList.add('done');
      setTimeout(() => el.remove(), 650);
      resolve();
    };

    const iv = setInterval(() => {
      if (i < list.length) {
        log.textContent += (i ? '\n' : '') + list[i];
        i++;
        if (bar) bar.style.width = `${Math.round((i / list.length) * 100)}%`;
      }
    }, Math.max(60, (minMs - 400) / Math.max(1, list.length)));

    el.addEventListener('click', finish, { once: true });
    setTimeout(finish, minMs + 500);
  });
}
