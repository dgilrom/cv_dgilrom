// Rocket sprites. The rocket is a stack: nose + one stage per job + engine.
// Stage accent stripes ('#') are tinted per-job with the shared ACCENTS colors.
import { sprite, makeRawCanvas } from '../px.js';
import { ACCENTS } from '../palette.js';

export function nose() {
  return sprite([
    '.....W.....',
    '....WWW....',
    '...WWWWW...',
    '...WRRRW...',
    '..WWWWWWW..',
    '..WwwwwwW..'
  ]);
}

export function stage(accent) {
  return sprite(
    [
      '.WWWWWWWWW.',
      '.WwwwwwwwW.',
      '.Ww#CC#wwW.',
      '.W#######W.',
      '.WwwwwwwwW.',
      '.WwwwwwwwW.',
      '.gwwwwwwwg.',
      '.ggggggggg.'
    ],
    { '#': accent }
  );
}

export function engine() {
  return sprite([
    'R.WWWWWWW.R',
    'RRWwwwwwWRR',
    'RRgggggggRR',
    '.ggggggggg.',
    '..A..A..A..',
    '..a..a..a..'
  ]);
}

export function stageSprites(n) {
  return Array.from({ length: n }, (_, i) => stage(ACCENTS[i % ACCENTS.length]));
}

/** Full assembled rocket (used on the launch pad in act 1). */
export function buildRocket(n) {
  const ns = nose();
  const st = stageSprites(n);
  const en = engine();
  // parts are already K-scaled: composite them 1:1 on a raw canvas
  const h = ns.height + st.reduce((a, s) => a + s.height, 0) + en.height;
  const c = makeRawCanvas(ns.width, h);
  const ctx = c.getContext('2d');
  let y = 0;
  ctx.drawImage(ns, 0, y);
  y += ns.height;
  // newest job right under the nose, oldest at the bottom (detaches first)
  for (let i = st.length - 1; i >= 0; i--) {
    ctx.drawImage(st[i], 0, y);
    y += st[i].height;
  }
  ctx.drawImage(en, 0, y);
  return c;
}
