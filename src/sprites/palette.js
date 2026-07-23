// Retro palette (~28 colors). Dark space blues/purples + warm amber for base lights.
export const PAL = {
  space0: '#05050f',
  space1: '#0b0b24',
  space2: '#16163a',
  space3: '#22224e',
  purple0: '#2e2260',
  purple1: '#4a2c5e',
  purple2: '#7b5cd6',
  horizon: '#b0552a',
  amber: '#ffb347',
  orange: '#ff8c1a',
  flame: '#ff5722',
  yellow: '#ffd93d',
  red: '#d94a3d',
  darkRed: '#8f2f27',
  blue: '#3b6fd4',
  darkBlue: '#22407e',
  cyan: '#4dd0e1',
  teal: '#1d7d8c',
  green: '#4caf6d',
  darkGreen: '#2e6b45',
  crt: '#6ef58c',
  white: '#f4f4f8',
  grey1: '#c9c9d9',
  grey2: '#8b8ba3',
  grey3: '#55556e',
  grey4: '#2e2e40',
  black: '#14141f',
  moon1: '#b4b4c8',
  moon2: '#7d7d99',
  moon3: '#5c5c78',
  brown1: '#7a5c3e',
  brown2: '#4e3a28',
  pink: '#d63384'
};

// Single-char map used by string-grid sprites ('.' and ' ' = transparent)
export const CHARS = {
  W: PAL.white,
  w: PAL.grey1,
  g: PAL.grey2,
  d: PAL.grey3,
  D: PAL.grey4,
  K: PAL.black,
  A: PAL.amber,
  a: PAL.orange,
  O: PAL.flame,
  Y: PAL.yellow,
  R: PAL.red,
  r: PAL.darkRed,
  B: PAL.blue,
  b: PAL.darkBlue,
  C: PAL.cyan,
  c: PAL.teal,
  G: PAL.green,
  n: PAL.darkGreen,
  P: PAL.purple2,
  p: PAL.purple0,
  M: PAL.moon1,
  m: PAL.moon2,
  T: PAL.brown1,
  t: PAL.brown2,
  q: PAL.pink
};

// Per-entry accent colors, shared by DOM cards (CSS) and canvas (rocket stages, flags...)
export const ACCENTS = ['#ffb347', '#4dd0e1', '#7b5cd6', '#4caf6d', '#d94a3d', '#5b8def', '#ffd93d'];

// Dusk sky used by act 1 and the launch pad of act 2 (continuity between acts)
export const DUSK_SKY = [
  [0, '#0b0b24'],
  [0.45, '#22224e'],
  [0.72, '#4a2c5e'],
  [0.92, '#b0552a'],
  [1, '#c96f2f']
];

export const SPACE_SKY = [
  [0, '#05050f'],
  [0.6, '#0b0b24'],
  [1, '#16163a']
];
