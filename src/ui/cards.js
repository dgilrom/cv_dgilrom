// Renders ALL CV content as semantic HTML positioned along the journey.
// Screen readers and crawlers get a normal document; sighted users get
// mission panels that slide in as they scroll. No CV text lives in code —
// everything comes from cv-data.json (+ ui-strings.json for UI labels).
import { ACTS } from '../engine/acts.js';
import { L, t, fmtDate } from '../engine/i18n.js';
import { ACCENTS } from '../sprites/palette.js';
import { hobbyIcon } from '../sprites/sheets/hobbies.js';

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let observer = null;
const iconCache = new Map();

function iconUrl(key) {
  if (!iconCache.has(key)) iconCache.set(key, hobbyIcon(key).toDataURL());
  return iconCache.get(key);
}

function actTitle(actId, topFrac) {
  return `<header class="act-title" style="top:${(topFrac * 100).toFixed(1)}%">
    <h2>${esc(t(`acts.${actId}.title`))}</h2>
    <p>${esc(t(`acts.${actId}.subtitle`))}</p>
  </header>`;
}

function card({ top, side, accent, tag, title, sub, body }) {
  return `<article class="card ${side}" style="top:${(top * 100).toFixed(1)}%;--accent:${accent}">
    ${tag ? `<div class="card-tag">${tag}</div>` : ''}
    <h3>${title}</h3>
    ${sub ? `<div class="card-sub">${sub}</div>` : ''}
    ${body || ''}
  </article>`;
}

const builders = {
  base(app) {
    const { profile, education } = app.data;
    const lay = app.layout.base;
    let html = `<header class="hero">
      <h1>${esc(profile.name)}</h1>
      <p class="tagline">${esc(L(profile.tagline))}</p>
      <p class="summary">${esc(L(profile.summary))}</p>
      <div class="scroll-hint">${esc(t('labels.scrollHint'))}<span>▼</span></div>
    </header>`;
    html += actTitle('base', lay.title);
    education.forEach((e, i) => {
      const years = e.startYear === e.endYear ? `${e.startYear}` : `${e.startYear}–${e.endYear}`;
      const spec = L(e.specialization);
      const desc = L(e.description);
      html += card({
        top: lay.cards[i],
        // acto 1: el astronauta camina por la izquierda -> tarjetas siempre
        // a la derecha para no taparlo nunca
        side: 'right',
        accent: ACCENTS[i % ACCENTS.length],
        tag: `${esc(t('labels.record'))} ${String(i + 1).padStart(2, '0')} · ${years}`,
        title: esc(L(e.degree)),
        sub: `${esc(L(e.institution))} · ${esc(L(e.location))}`,
        body: (spec ? `<p>${esc(spec)}</p>` : '') + (desc ? `<p>${esc(desc)}</p>` : '')
      });
    });
    return html;
  },

  launch(app) {
    const lay = app.layout.launch;
    let html = actTitle('launch', 0.145);
    app.data.experience.forEach((x, i) => {
      html += card({
        top: lay.cards[i],
        side: i % 2 ? 'right' : 'left',
        accent: ACCENTS[i % ACCENTS.length],
        tag: `${esc(t('labels.stage'))} ${i + 1} · ${esc(fmtDate(x.startDate))} — ${esc(fmtDate(x.endDate))}`,
        title: esc(L(x.role)),
        sub: `${esc(x.company)} · ${esc(L(x.location))}`,
        body: `<ul>${x.highlights.map((hl) => `<li>${esc(L(hl))}</li>`).join('')}</ul>`
      });
    });
    return html;
  },

  moon(app) {
    const lay = app.layout.moon;
    const { skills, certifications } = app.data;
    let html = actTitle('moon', lay.title);
    (skills?.categories || []).forEach((cat, i) => {
      html += card({
        top: lay.cats[i],
        // acto 3: el astronauta hace EVA por la izquierda -> tarjetas a la derecha
        side: 'right',
        accent: ACCENTS[(i + 1) % ACCENTS.length],
        title: esc(L(cat.name)),
        body: `<div class="chips">${cat.items.map((it) => `<span class="skill-chip">${esc(L(it))}</span>`).join('')}</div>`
      });
    });
    html += `<header class="act-title minor" style="top:${(lay.certTitle * 100).toFixed(1)}%">
      <h2>${esc(t('labels.certifications'))}</h2></header>`;
    certifications.forEach((c, i) => {
      html += card({
        top: lay.certs[i],
        side: 'right',
        accent: ACCENTS[(i + 2) % ACCENTS.length],
        tag: `⚑ ${c.year}`,
        title: esc(L(c.name)),
        sub: esc(c.issuer)
      });
    });
    return html;
  },

  space(app) {
    const lay = app.layout.space;
    const { hobbies, contact } = app.data;
    let html = actTitle('space', lay.title);
    hobbies.forEach((hb, i) => {
      const left = i % 2 ? 56 + (i * 7) % 14 : 10 + (i * 9) % 16;
      html += `<div class="hobby-chip" style="top:${(lay.hobbies[i] * 100).toFixed(1)}%;left:${left}%;--delay:${(i * 0.7).toFixed(1)}s">
        <img src="${iconUrl(hb.icon)}" alt="" width="42" height="42" />
        <span>${esc(L(hb.name))}</span>
      </div>`;
    });
    // TRANSMISSION contact panel. Phone is intentionally never rendered.
    html += `<section class="contact-panel" style="top:${(lay.contact * 100).toFixed(1)}%" aria-label="${esc(t('labels.transmission'))}">
      <h2>▚ ${esc(t('labels.transmission'))} ▞</h2>
      <p class="contact-sub">${esc(t('labels.transmissionSub'))}</p>
      <div class="contact-btns">
        <a class="t-btn" href="mailto:${esc(contact.email)}">${esc(t('labels.email'))}</a>
        <a class="t-btn" href="${esc(contact.linkedin)}" target="_blank" rel="noopener">${esc(t('labels.linkedin'))}</a>
        <a class="t-btn" href="${esc(contact.github)}" target="_blank" rel="noopener">${esc(t('labels.github'))}</a>
      </div>
      <p class="contact-loc">${esc(t('labels.location'))}: ${esc(L(contact.location))} <span class="cursor">█</span></p>
    </section>`;
    return html;
  }
};

export function renderAll(app) {
  const journey = document.getElementById('journey');
  journey.innerHTML = ACTS.map(
    (act) => `<section id="act-${act.id}" class="act act-${act.id}" style="height:${act.lengthVh}vh"
      aria-label="${esc(t(`acts.${act.id}.title`))}">${builders[act.id](app)}</section>`
  ).join('');

  // slide-in on viewport entry
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('visible', e.isIntersecting)),
    { threshold: 0.15 }
  );
  journey.querySelectorAll('.card, .act-title, .hero, .hobby-chip, .contact-panel').forEach((n) => observer.observe(n));
}
