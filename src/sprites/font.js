// Minimal 3x5 pixel font for canvas HUD/countdown text.
// Each glyph is 5 rows of 3-bit patterns (MSB = left pixel).
const F = {
  '0': [0b111, 0b101, 0b101, 0b101, 0b111],
  '1': [0b010, 0b110, 0b010, 0b010, 0b111],
  '2': [0b111, 0b001, 0b111, 0b100, 0b111],
  '3': [0b111, 0b001, 0b111, 0b001, 0b111],
  '4': [0b101, 0b101, 0b111, 0b001, 0b001],
  '5': [0b111, 0b100, 0b111, 0b001, 0b111],
  '6': [0b111, 0b100, 0b111, 0b101, 0b111],
  '7': [0b111, 0b001, 0b001, 0b010, 0b010],
  '8': [0b111, 0b101, 0b111, 0b101, 0b111],
  '9': [0b111, 0b101, 0b111, 0b001, 0b111],
  A: [0b010, 0b101, 0b111, 0b101, 0b101],
  B: [0b110, 0b101, 0b110, 0b101, 0b110],
  C: [0b011, 0b100, 0b100, 0b100, 0b011],
  D: [0b110, 0b101, 0b101, 0b101, 0b110],
  E: [0b111, 0b100, 0b110, 0b100, 0b111],
  F: [0b111, 0b100, 0b110, 0b100, 0b100],
  G: [0b011, 0b100, 0b101, 0b101, 0b011],
  H: [0b101, 0b101, 0b111, 0b101, 0b101],
  I: [0b111, 0b010, 0b010, 0b010, 0b111],
  J: [0b001, 0b001, 0b001, 0b101, 0b010],
  K: [0b101, 0b110, 0b100, 0b110, 0b101],
  L: [0b100, 0b100, 0b100, 0b100, 0b111],
  M: [0b101, 0b111, 0b111, 0b101, 0b101],
  N: [0b110, 0b101, 0b101, 0b101, 0b101],
  O: [0b111, 0b101, 0b101, 0b101, 0b111],
  P: [0b111, 0b101, 0b111, 0b100, 0b100],
  Q: [0b111, 0b101, 0b101, 0b111, 0b001],
  R: [0b111, 0b101, 0b110, 0b101, 0b101],
  S: [0b011, 0b100, 0b010, 0b001, 0b110],
  T: [0b111, 0b010, 0b010, 0b010, 0b010],
  U: [0b101, 0b101, 0b101, 0b101, 0b111],
  V: [0b101, 0b101, 0b101, 0b101, 0b010],
  W: [0b101, 0b101, 0b111, 0b111, 0b101],
  X: [0b101, 0b101, 0b010, 0b101, 0b101],
  Y: [0b101, 0b101, 0b010, 0b010, 0b010],
  Z: [0b111, 0b001, 0b010, 0b100, 0b111],
  '-': [0b000, 0b000, 0b111, 0b000, 0b000],
  '.': [0b000, 0b000, 0b000, 0b000, 0b010],
  ':': [0b000, 0b010, 0b000, 0b010, 0b000],
  '/': [0b001, 0b001, 0b010, 0b100, 0b100],
  '!': [0b010, 0b010, 0b010, 0b000, 0b010],
  ' ': [0, 0, 0, 0, 0]
};

/**
 * Draw pixel text. Accents are stripped (the 3x5 font has no diacritics).
 * opts: { scale, color, align: 'left'|'center'|'right' }
 */
export function drawText(ctx, text, x, y, opts = {}) {
  const { scale = 1, color = '#f4f4f8', align = 'left' } = opts;
  const s = String(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase();
  const width = s.length * 4 * scale - scale;
  let cx =
    align === 'center' ? Math.round(x - width / 2) : align === 'right' ? Math.round(x - width) : Math.round(x);
  const cy = Math.round(y);
  ctx.fillStyle = color;
  for (const ch of s) {
    const glyph = F[ch];
    if (glyph) {
      for (let r = 0; r < 5; r++) {
        const bits = glyph[r];
        for (let b = 0; b < 3; b++) {
          if (bits & (4 >> b)) ctx.fillRect(cx + b * scale, cy + r * scale, scale, scale);
        }
      }
    }
    cx += 4 * scale;
  }
}
