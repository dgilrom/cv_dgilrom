// Contact space station: central hub + solar arrays + docking port.
import { makeCanvas } from '../px.js';
import { PAL } from '../palette.js';

export function station() {
  const c = makeCanvas(76, 44);
  const g = c.getContext('2d');

  // solar arrays
  const panel = (x) => {
    g.fillStyle = PAL.darkBlue;
    g.fillRect(x, 14, 24, 14);
    g.fillStyle = PAL.blue;
    for (let i = 0; i < 4; i++) g.fillRect(x + 1 + i * 6, 15, 5, 12);
    g.fillStyle = '#7fa8f0';
    g.fillRect(x, 14, 24, 1);
  };
  panel(0);
  panel(52);

  // truss to hub
  g.fillStyle = PAL.grey2;
  g.fillRect(24, 20, 6, 2);
  g.fillRect(46, 20, 6, 2);

  // central hub (cylinder)
  g.fillStyle = PAL.grey2;
  g.fillRect(30, 10, 16, 22);
  g.fillStyle = PAL.grey1;
  g.fillRect(30, 10, 4, 22);
  g.fillStyle = PAL.grey3;
  g.fillRect(43, 10, 3, 22);
  // hub windows
  g.fillStyle = PAL.amber;
  g.fillRect(33, 15, 2, 2);
  g.fillRect(37, 15, 2, 2);
  g.fillRect(41, 15, 2, 2);
  g.fillStyle = PAL.cyan;
  g.fillRect(35, 24, 6, 3);

  // top module + antenna
  g.fillStyle = PAL.grey3;
  g.fillRect(33, 5, 10, 5);
  g.fillStyle = PAL.grey1;
  g.fillRect(37, 0, 2, 5);
  g.fillStyle = PAL.red;
  g.fillRect(37, 0, 2, 1);

  // docking port (bottom)
  g.fillStyle = PAL.grey3;
  g.fillRect(35, 32, 6, 6);
  g.fillStyle = PAL.grey4;
  g.fillRect(34, 38, 8, 3);
  g.fillStyle = PAL.cyan;
  g.fillRect(35, 41, 2, 1);
  g.fillRect(39, 41, 2, 1);

  return c;
}

// Blinking light offsets (relative to sprite top-left), drawn by the scene.
export const STATION_LIGHTS = [
  [37, 0, PAL.red],
  [30, 10, PAL.green],
  [45, 10, PAL.green],
  [35, 41, PAL.cyan],
  [39, 41, PAL.cyan]
];
