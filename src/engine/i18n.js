// Bilingual (es/en) resolver for both CV content and engine UI strings.
import UI from '../data/ui-strings.json';

let lang = 'es';
const listeners = new Set();

export function initLang(defaultLang = 'es') {
  const stored = localStorage.getItem('cv-lang');
  if (stored === 'es' || stored === 'en') {
    lang = stored;
  } else {
    const nav = (navigator.language || defaultLang).toLowerCase();
    lang = nav.startsWith('en') ? 'en' : defaultLang;
  }
  document.documentElement.lang = lang;
  return lang;
}

export function getLang() {
  return lang;
}

export function setLang(l) {
  if (l === lang) return;
  lang = l;
  localStorage.setItem('cv-lang', l);
  document.documentElement.lang = l;
  listeners.forEach((fn) => fn(l));
}

export function onLang(fn) {
  listeners.add(fn);
}

/** Resolve a localized value: {es, en} objects pick the active language. */
export function L(v) {
  if (v == null) return '';
  if (typeof v === 'object' && ('es' in v || 'en' in v)) {
    return v[lang] ?? v.es ?? v.en ?? '';
  }
  return v;
}

/** Resolve an engine UI string by dotted path, e.g. t('hud.acts.base'). */
export function t(path) {
  let cur = UI;
  for (const key of path.split('.')) {
    if (cur == null) return path;
    cur = cur[key];
  }
  return L(cur);
}

/** "2016-01" -> "ene 2016" / "Jan 2016"; "present" -> localized label. */
export function fmtDate(iso) {
  if (!iso) return '';
  if (iso === 'present') return t('labels.present');
  const [y, m] = iso.split('-');
  const months = t('labels.months');
  const mi = Math.max(0, Math.min(11, parseInt(m, 10) - 1));
  return `${Array.isArray(months) ? months[mi] : m} ${y}`;
}
