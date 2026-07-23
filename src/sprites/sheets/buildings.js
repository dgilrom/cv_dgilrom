// Earth-base buildings, drawn procedurally into small canvases.
import { makeCanvas, mulberry32 } from '../px.js';
import { PAL } from '../palette.js';

function windowsRow(ctx, x0, y, count, step, seed) {
  const r = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = r() < 0.7 ? PAL.amber : '#7a5230';
    ctx.fillRect(x0 + i * step, y, 2, 2);
  }
}

/** Big hangar with arched roof and sliding door. */
export function hangar() {
  const c = makeCanvas(56, 26);
  const g = c.getContext('2d');
  // stepped arch roof
  for (let y = 0; y < 10; y++) {
    const w = Math.min(56, 22 + y * 4);
    g.fillStyle = y < 2 ? PAL.moon1 : PAL.moon2;
    g.fillRect(Math.round((56 - w) / 2), y, w, 1);
  }
  // body
  g.fillStyle = PAL.grey3;
  g.fillRect(0, 10, 56, 16);
  g.fillStyle = PAL.grey4;
  g.fillRect(50, 10, 6, 16); // side shading
  // red stripe
  g.fillStyle = PAL.red;
  g.fillRect(0, 10, 56, 2);
  // door
  g.fillStyle = PAL.black;
  g.fillRect(20, 14, 16, 12);
  g.fillStyle = PAL.amber;
  g.fillRect(20, 14, 16, 1);
  g.fillStyle = PAL.grey2;
  for (let i = 0; i < 4; i++) g.fillRect(22 + i * 4, 16, 1, 10);
  // windows
  windowsRow(g, 4, 16, 4, 4, 11);
  windowsRow(g, 40, 16, 2, 4, 12);
  return c;
}

/** Radar / comms tower with dish. */
export function dish() {
  const c = makeCanvas(26, 40);
  const g = c.getContext('2d');
  // mast
  g.fillStyle = PAL.grey3;
  g.fillRect(11, 12, 4, 28);
  g.fillStyle = PAL.grey4;
  g.fillRect(14, 12, 1, 28);
  // cross braces
  g.fillStyle = PAL.grey2;
  for (let y = 16; y < 40; y += 6) g.fillRect(9, y, 8, 1);
  // dish (stepped half bowl, facing up)
  for (let y = 0; y < 7; y++) {
    const w = 24 - y * 3;
    g.fillStyle = y < 2 ? PAL.grey1 : PAL.grey2;
    g.fillRect(Math.round((26 - w) / 2), 4 + y, w, 1);
  }
  // feed antenna
  g.fillStyle = PAL.grey1;
  g.fillRect(12, 0, 2, 5);
  g.fillStyle = PAL.red;
  g.fillRect(12, 0, 2, 1);
  // base hut
  g.fillStyle = PAL.grey3;
  g.fillRect(4, 32, 18, 8);
  g.fillStyle = PAL.amber;
  g.fillRect(7, 35, 2, 2);
  g.fillRect(13, 35, 2, 2);
  return c;
}

/** Training dome. */
export function dome() {
  const c = makeCanvas(32, 18);
  const g = c.getContext('2d');
  for (let y = 0; y < 14; y++) {
    const t = (14 - y) / 14;
    const w = Math.round(32 * Math.sqrt(Math.max(0, 1 - t * t)));
    if (w <= 0) continue;
    g.fillStyle = y < 5 ? PAL.moon1 : PAL.grey2;
    g.fillRect(Math.round((32 - w) / 2), y, w, 1);
  }
  g.fillStyle = PAL.grey3;
  g.fillRect(0, 14, 32, 4);
  // door + portholes
  g.fillStyle = PAL.black;
  g.fillRect(13, 10, 6, 8);
  g.fillStyle = PAL.amber;
  g.fillRect(6, 12, 2, 2);
  g.fillRect(24, 12, 2, 2);
  // panel seams
  g.fillStyle = PAL.grey3;
  g.fillRect(10, 2, 1, 12);
  g.fillRect(21, 2, 1, 12);
  return c;
}

/** Launch gantry tower (stands next to the rocket). */
export function gantry() {
  const c = makeCanvas(18, 52);
  const g = c.getContext('2d');
  const steel = '#a8452f';
  const dark = '#6e2c1e';
  // two vertical trusses
  g.fillStyle = steel;
  g.fillRect(2, 4, 3, 48);
  g.fillRect(13, 4, 3, 48);
  // cross braces
  g.fillStyle = dark;
  for (let y = 8; y < 52; y += 6) g.fillRect(4, y, 10, 1);
  // service arms (reach out to the rocket, to the right)
  g.fillStyle = steel;
  g.fillRect(15, 10, 3, 2);
  g.fillRect(15, 24, 3, 2);
  g.fillRect(15, 38, 3, 2);
  // top beacon
  g.fillStyle = PAL.red;
  g.fillRect(8, 0, 2, 2);
  g.fillStyle = steel;
  g.fillRect(2, 2, 14, 2);
  return c;
}
