// One pixel icon per hobby `icon` key (see cv-data.json). Unknown keys fall
// back to a generic asteroid, so new hobbies never break the render.
import { sprite, makeCanvas, ring, seg, disc } from '../px.js';
import { PAL } from '../palette.js';
import { asteroid } from './celestial.js';

function running() {
  return sprite([
    '..............',
    '.........CC...',
    '.........CC...',
    '........WCC...',
    '.....WWWWWC...',
    '...WWwwwwwC...',
    '..WwwwwwwwC...',
    '..Wwwwwwwww...',
    '.RRRRRRRRRRR..',
    '.RrRrRrRrRrR..',
    '..............'
  ]);
}

function bike() {
  const c = makeCanvas(15, 12);
  const g = c.getContext('2d');
  ring(g, 3, 8, 3, PAL.cyan);
  ring(g, 11, 8, 3, PAL.cyan);
  seg(g, 3, 8, 6, 4, PAL.amber);
  seg(g, 6, 4, 11, 8, PAL.amber);
  seg(g, 3, 8, 8, 8, PAL.amber);
  seg(g, 8, 8, 6, 4, PAL.amber);
  // seat + handlebar
  g.fillStyle = PAL.red;
  g.fillRect(5, 2, 3, 1);
  seg(g, 6, 3, 6, 4, PAL.grey1);
  seg(g, 11, 8, 11, 3, PAL.grey1);
  g.fillStyle = PAL.grey1;
  g.fillRect(10, 2, 3, 1);
  return c;
}

function smarthome() {
  return sprite([
    '.....CC.......',
    '...CC..CC.....',
    '..C......C....',
    '....CCCC......',
    '...C....C.....',
    '......RR......',
    '.....RRRR.....',
    '....RRRRRR....',
    '...RRRRRRRR...',
    '..WWWWWWWWWW..',
    '..WWaaWWWtWW..',
    '..WWaaWWWtWW..',
    '..WWWWWWWtWW..'
  ]);
}

function raspberry() {
  return sprite([
    '.....GG.GG....',
    '....GGGGG.....',
    '.....qqq......',
    '...qqqqqqq....',
    '..qqCqqqqCq...',
    '..qqqqCqqqq...',
    '.qqCqqqqqCqq..',
    '.qqqqCqCqqqq..',
    '..qqqqqqqqq...',
    '...qqqqqqq....',
    '.....qqq......'
  ]);
}

function vibecoding() {
  return sprite([
    '..Y...........',
    '.YYY.......Y..',
    '..Y...........',
    '....DDDDDDD...',
    '....DCCwCCD...',
    '....DwCCwCD...',
    '....DCwCCCD...',
    '....DDDDDDD...',
    '...ddddddddd..',
    '..ddddddddddd.',
    '..............'
  ]);
}

function llm() {
  return sprite([
    '...g.g.g.g....',
    '..DDDDDDDDD...',
    '.gDPPPPPPPDg..',
    '..DPCPPPCPD...',
    '.gDPPCPCPPDg..',
    '..DPCPPPCPD...',
    '.gDPPPPPPPDg..',
    '..DDDDDDDDD...',
    '...g.g.g.g....'
  ]);
}

function homelab() {
  return sprite([
    '..DDDDDDDDD...',
    '..DwwwwwwwD...',
    '..DGg.....D...',
    '..DDDDDDDDD...',
    '..DwwwwwwwD...',
    '..DAg.....D...',
    '..DDDDDDDDD...',
    '..DwwwwwwwD...',
    '..DCg.....D...',
    '..DDDDDDDDD...',
    '...dd...dd....'
  ]);
}

const ICONS = { running, bike, smarthome, raspberry, vibecoding, llm, homelab };

export function hobbyIcon(key) {
  const fn = ICONS[key];
  return fn ? fn() : asteroid(3, 5);
}
