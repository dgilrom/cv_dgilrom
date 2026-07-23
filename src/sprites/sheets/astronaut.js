// Astronaut sprites: two walk frames + a free-floating pose.
import { sprite } from '../px.js';

const HEAD = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WWCCCCWW.',
  '.WWCCCcWW.',
  '.WWWWWWWW.',
  '..WWWWWW..'
];

export function astronautWalk() {
  const a = sprite([
    ...HEAD,
    '.AWWWWWWA.',
    '.AWWWWWWA.',
    '.dWWWWWWd.',
    '..WWWWWW..',
    '..WW..WW..',
    '..WW..WW..',
    '..dd..dd..',
    '..DD..DD..'
  ]);
  const b = sprite([
    ...HEAD,
    '.AWWWWWWA.',
    '.AWWWWWWA.',
    '.dWWWWWWd.',
    '..WWWWWW..',
    '..WW..WW..',
    '.WW....WW.',
    '.dd....dd.',
    '.DD....DD.'
  ]);
  return [a, b];
}

export function astronautFloat() {
  return sprite([
    ...HEAD,
    'AWWWWWWWWA',
    'A.WWWWWW.A',
    '..WWWWWW..',
    '..WWWWWW..',
    '...WWWW...',
    '..WW..WW..',
    '..dd..dd..',
    '..DD..DD..'
  ]);
}
