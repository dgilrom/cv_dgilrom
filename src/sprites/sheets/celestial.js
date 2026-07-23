// Clouds, planets, moon, earth, asteroids, UFO... procedural celestial props.
import { makeCanvas, disc, ring, mulberry32, sprite } from '../px.js';
import { PAL } from '../palette.js';

export function makeCloud(w, h, seed) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  const r = mulberry32(seed * 77 + 3);
  const blobs = 5 + Math.floor(r() * 4);
  for (let i = 0; i < blobs; i++) {
    const br = 2 + Math.floor(r() * (h / 2));
    const bx = br + r() * (w - 2 * br);
    const by = h - br - r() * (h / 3);
    disc(g, bx, by, br, i % 3 === 0 ? PAL.grey1 : PAL.white);
  }
  return c;
}

export function earth(r = 8) {
  const c = makeCanvas(r * 2 + 2, r * 2 + 2);
  const g = c.getContext('2d');
  const cx = r + 1;
  disc(g, cx, cx, r, PAL.blue);
  const rnd = mulberry32(42);
  // landmasses + clouds
  for (let i = 0; i < 14; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * (r - 2);
    g.fillStyle = rnd() < 0.6 ? PAL.green : PAL.white;
    g.fillRect(Math.round(cx + Math.cos(a) * d), Math.round(cx + Math.sin(a) * d), 2, 1);
  }
  // terminator shading
  g.fillStyle = 'rgba(5,5,15,0.45)';
  for (let y = -r; y <= r; y++) {
    const s = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
    g.fillRect(cx + Math.floor(s * 0.3), cx + y, s, 1);
  }
  return c;
}

export function moonBall(r = 12) {
  const c = makeCanvas(r * 2 + 2, r * 2 + 2);
  const g = c.getContext('2d');
  const cx = r + 1;
  disc(g, cx, cx, r, PAL.moon1);
  const rnd = mulberry32(7);
  for (let i = 0; i < 8; i++) {
    const a = rnd() * Math.PI * 2;
    const d = rnd() * (r - 3);
    disc(g, cx + Math.cos(a) * d, cx + Math.sin(a) * d, 1 + Math.floor(rnd() * 2), PAL.moon2);
  }
  return c;
}

export function planetRinged() {
  const c = makeCanvas(30, 22);
  const g = c.getContext('2d');
  disc(g, 15, 11, 7, PAL.horizon);
  g.fillStyle = PAL.amber;
  g.fillRect(9, 8, 12, 1);
  g.fillRect(10, 12, 11, 1);
  // ring
  g.fillStyle = PAL.grey1;
  for (let x = 0; x < 30; x++) {
    const y = 11 + Math.round(Math.sin((x / 29) * Math.PI) * 4) * ((x < 15) ? 1 : -1);
    if (Math.abs(x - 15) > 4) g.fillRect(x, y, 1, 1);
  }
  g.fillRect(0, 11, 6, 1);
  g.fillRect(24, 11, 6, 1);
  return c;
}

export function planetSmall(color, r = 5, seed = 5) {
  const c = makeCanvas(r * 2 + 2, r * 2 + 2);
  const g = c.getContext('2d');
  disc(g, r + 1, r + 1, r, color);
  const rnd = mulberry32(seed);
  g.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = 0; i < 5; i++) {
    g.fillRect(Math.round(1 + rnd() * r * 2), Math.round(1 + rnd() * r * 2), 2, 1);
  }
  return c;
}

export function asteroid(seed = 1, r = 4) {
  const c = makeCanvas(r * 2 + 4, r * 2 + 4);
  const g = c.getContext('2d');
  const rnd = mulberry32(seed * 13 + 5);
  const cx = r + 2;
  disc(g, cx, cx, r, PAL.grey2);
  disc(g, cx - 1, cx - 1, r - 1, PAL.moon2);
  for (let i = 0; i < 4; i++) {
    g.fillStyle = PAL.grey3;
    g.fillRect(Math.round(2 + rnd() * r * 1.6), Math.round(2 + rnd() * r * 1.6), 1, 1);
  }
  return c;
}

export function ufo() {
  return sprite([
    '.....CCCC.....',
    '....CccccC....',
    '..WWWWWWWWWW..',
    '.WwwwwwwwwwwW.',
    'WWWWWWWWWWWWWW',
    '.gAgYgAgYgAg..',
    '..............'
  ]);
}
