// Act registry — the single source of truth for the journey structure.
// HUD markers, section heights, scroll mapping and scene dispatch all derive
// from this array. To add a 5th act: create its scene module, add one entry
// here, add a card builder in ui/cards.js and a data section in cv-data.json.
import act1 from '../acts/act1-earth-base.js';
import act2 from '../acts/act2-ascent.js';
import act3 from '../acts/act3-moon.js';
import act4 from '../acts/act4-deep-space.js';

export const ACTS = [
  { id: 'base', lengthVh: 400, scene: act1, fadeBoundary: false },
  { id: 'launch', lengthVh: 550, scene: act2, fadeBoundary: false },
  { id: 'moon', lengthVh: 400, scene: act3, fadeBoundary: true },
  { id: 'space', lengthVh: 420, scene: act4, fadeBoundary: true }
];

/**
 * Vertical positions (as fraction of each act section) for every DOM card,
 * derived from the actual data so canvas events (building highlights, stage
 * separations...) stay in sync with the cards.
 */
export function computeLayout(data) {
  const spread = (n, a, b) =>
    n <= 1 ? [(a + b) / 2] : Array.from({ length: n }, (_, i) => a + (i * (b - a)) / (n - 1));

  return {
    base: {
      title: 0.26,
      cards: spread(data.education.length, 0.34, 0.84)
    },
    launch: {
      countEnd: 0.12,
      ign: 0.155,
      // los registros empiezan en 0.38: como una tarjeta se hace visible
      // ~0.18 antes de su posicion, la primera aparece hacia p~0.20, ya
      // con el cohete ascendiendo y la cuenta atras (fin en 0.155) terminada
      cards: spread(data.experience.length, 0.38, 0.9)
    },
    moon: {
      landEnd: 0.12,
      title: 0.05,
      cats: spread((data.skills?.categories || []).length, 0.2, 0.56),
      certTitle: 0.66,
      certs: spread(data.certifications.length, 0.74, 0.86)
    },
    space: {
      title: 0.03,
      hobbies: spread(data.hobbies.length, 0.1, 0.6),
      contact: 0.76
    }
  };
}
