// Home — interacciones.
// Usa lo compartido de common.js (window.site), los textos de i18n.js (window.i18n) y los proyectos de projects.js.
(async () => {
const { gsap, ScrollTrigger, lenis, goTo, $, $$, wait, session, reduce, setCursor, initReveals, reveal, arrived } = window.site;
const { t, tr, esc } = window.i18n;
const ACID = '#c6ff3a';
const tx = v => esc(tr(v));

/* ---------- tarjetas de proyectos (desde projects.js) ---------- */
const tagline = p => (p.tags || []).map(tx).join(' · ');
const media = p => (p.cover ? `<img src="${esc(p.cover)}" alt="${tx(p.title)}" loading="lazy">` : '');
const link = p => `href="project.html?p=${p.id}" data-curtain="${tx(p.title)}"`;
const CARD = {
  web: (p, n) => `
    <a class="project" ${link(p)} data-cursor="view" data-reveal>
      <div class="browser">
        <div class="browser-bar"><i></i><i></i><i></i><span class="mono">${esc(p.url || p.id)}</span></div>
        <div class="browser-view"><div class="ph ph-${p.ph}">${media(p) || `<span class="mono">${t('ph.screenshot')}</span>`}</div></div>
      </div>
      <p class="meta mono"><b>${n} — ${tx(p.title)}</b><span>${tagline(p)}</span></p>
    </a>`,
  grafico: (p, n) => `
    <a class="poster" ${link(p)} data-cursor="view">
      <span class="tape-bit"></span>
      <div class="ph ph-${p.ph}">${media(p) || `<span>${n}</span><em class="mono">${tx(p.title)}</em>`}</div>
      <p class="mono"><b>${tx(p.title)}</b><br>${tx(p.kind)}</p>
    </a>`,
  video: (p, n, i) => `
    <a class="clip ${i ? 'clip-side' : 'clip-main'}" ${link(p)} data-cursor="play" data-reveal>
      <div class="clip-frame ph ph-${p.ph}">${media(p)}
        <span class="rec mono"><i></i>rec</span><span class="tc mono">00:00:00:00</span>
        <span class="play" aria-hidden="true"></span>
      </div>
      <p class="meta mono"><b>${tx(p.title)}</b><span>${tx(p.kind)}</span></p>
    </a>`,
  dron: (p, n) => p.soon ? `
    <div class="flight flight-soon" data-reveal>
      <div class="flight-frame"><span class="mono">${t('drone.soon')}</span><b>${tx(p.title)}</b><span class="mono">${tx(p.kind)}</span></div>
      <p class="meta mono"><span>${tx(p.summary)}</span></p>
    </div>` : `
    <a class="flight" ${link(p)} data-cursor="view" data-reveal>
      <div class="flight-frame ph ph-${p.ph}">${media(p)}
        <i class="osd-c tl"></i><i class="osd-c tr"></i><i class="osd-c bl"></i><i class="osd-c br"></i>
        <span class="mono flight-no">${t('drone.flight')} ${n}</span>
        ${p.badge ? `<span class="mono flight-badge">${esc(p.badge)}</span>` : ''}
        <span class="mono flight-loc">⌖ ${tx(p.place)}</span>
      </div>
      <p class="meta mono"><b>${tx(p.title)}</b><span>${tagline(p)}</span></p>
    </a>`,
};

function renderProjects() {
  for (const cat of Object.keys(window.CHAPTERS)) {
    const list = window.PROJECTS.filter(p => p.cat === cat);
    let n = 0;
    $(`[data-projects="${cat}"]`).insertAdjacentHTML('beforeend',
      list.filter(p => !p.lab).map((p, i) => CARD[cat](p, p.soon ? '' : String(++n).padStart(2, '0'), i)).join(''));
    for (const el of $$(`[data-count="${cat}"]`)) el.textContent = `(${list.filter(p => !p.soon).length})`;
  }
  // el proyecto del motion lab (portadas) se presenta aparte, con la portada interactiva
  const lab = window.PROJECTS.find(p => p.lab);
  $('.lab-title').textContent = tr(lab.title);
  $('.lab-tags').textContent = lab.tags.map(tr).join(' · ');
  for (const a of $$('.lab a')) { a.href = `project.html?p=${lab.id}`; a.dataset.curtain = tr(lab.title); }
}

// cintas: repetimos el texto para que el bucle nunca muestre un hueco
function fillTapes() {
  for (const track of $$('.tape-track')) {
    const chunk = `<span>${esc(t(track.dataset.tape).repeat(3))}</span>`;
    track.innerHTML = chunk + chunk;
  }
}

/* ---------- pared de spray (hero) ---------- */
function initSpray(canvas, area) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio, 2);
  const drips = [];
  let w, h, last = null, frame = 0, visible = true;

  const resize = () => {
    w = area.clientWidth;
    h = area.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(area);

  // un "pshh": puntos con reparto gaussiano, más densos en el centro
  function puff(x, y, speed) {
    const r = 9 + Math.min(speed, 50) * 0.3;
    ctx.fillStyle = ACID;
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = r * Math.sqrt(-2 * Math.log(Math.random() + 1e-6)) * 0.5;
      const s = Math.random() * 1.6 + 0.5;
      ctx.globalAlpha = Math.random() * 0.5 + 0.2;
      ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, s, s);
    }
    ctx.globalAlpha = 1;
    // mano lenta = demasiada pintura = chorreón
    if (speed < 3 && Math.random() < 0.08 && drips.length < 24)
      drips.push({ x: x + (Math.random() - 0.5) * r, y: y + r * 0.4, v: 1 + Math.random(), w: 1.2 + Math.random() * 1.5 });
  }
  // rellena el hueco entre dos posiciones para que el trazo no salga punteado
  function stroke(from, to, speed) {
    const n = from ? Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / 5)) : 1;
    for (let i = 1; i <= n; i++)
      puff(from ? from.x + (to.x - from.x) * i / n : to.x, from ? from.y + (to.y - from.y) * i / n : to.y, speed);
  }

  area.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const b = canvas.getBoundingClientRect();
    const p = { x: e.clientX - b.left, y: e.clientY - b.top };
    stroke(last, p, last ? Math.hypot(p.x - last.x, p.y - last.y) : 0);
    last = p;
  });
  area.addEventListener('pointerleave', () => (last = null));

  gsap.ticker.add(() => {
    if (!visible) return;
    ctx.fillStyle = ACID;
    for (let i = drips.length - 1; i >= 0; i--) {
      const d = drips[i];
      ctx.fillRect(d.x, d.y, d.w, d.v + 0.5);
      d.y += d.v;
      d.v *= 0.985;
      if (d.v < 0.12) {
        ctx.beginPath();
        ctx.arc(d.x + d.w / 2, d.y, d.w, 0, Math.PI * 2);
        ctx.fill();
        drips.splice(i, 1);
      }
    }
    // la pared "se seca": borra un poco cada pocos frames (queda un fantasma leve, como grafiti viejo)
    if (++frame % 8 === 0) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.04)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
  });

  return {
    // trazo automático bajo un elemento (lo usa la intro)
    swoosh(el) {
      const a = canvas.getBoundingClientRect(), b = el.getBoundingClientRect();
      const x0 = b.left - a.left, x1 = x0 + b.width * 0.95, y0 = b.bottom - a.top + 8;
      const o = { t: 0 };
      let prev = null;
      gsap.to(o, {
        t: 1, duration: 0.9, ease: 'power2.inOut',
        onUpdate() {
          const p = { x: x0 + (x1 - x0) * o.t, y: y0 + Math.sin(o.t * Math.PI * 2.5) * 10 - o.t * 18 };
          stroke(prev, p, 14);
          prev = p;
        },
      });
    },
  };
}

/* ---------- loader (solo la primera visita) ---------- */
async function runLoader(ready) {
  const loader = $('.loader'), bar = $('.loader-bar span'), pct = $('.loader-pct');
  document.fonts.load('190px "Sedgwick Ave Display"').finally(() => loader.classList.add('go'));
  const p = { v: 0 };
  const draw = () => { bar.style.transform = `scaleX(${p.v / 100})`; pct.textContent = Math.round(p.v); };
  const crawl = gsap.to(p, { v: 88, duration: 2.4, ease: 'power2.out', onUpdate: draw });
  await Promise.race([ready, wait(7000)]);
  crawl.kill();
  await gsap.to(p, { v: 100, duration: 0.35, ease: 'power1.in', onUpdate: draw });
  await gsap.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' });
  loader.remove();
}

/* ---------- utilidades ---------- */
// envuelve cada palabra en <span class="w"> sin romper los elementos internos
function splitWords(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  for (const node of texts) {
    const frag = document.createDocumentFragment();
    for (const part of node.textContent.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.append(part); continue; }
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = part;
      frag.append(s);
    }
    node.replaceWith(frag);
  }
  return $$('.w', root);
}

const drawDoodle = svg => gsap.to($$('path', svg), { strokeDashoffset: 0, duration: 0.7, stagger: 0.2, ease: 'power2.inOut' });

function prepDoodles() {
  for (const svg of $$('.doodle')) {
    for (const p of $$('path', svg)) {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: reduce ? 0 : len });
    }
  }
}

/* ---------- chorreones del tag «multimedia» ---------- */
// Cada gota se pega bajo el trazo de una letra (l, i, d), medido sobre la fuente real:
// así sale de la pintura y no del aire, sea cual sea el idioma o el tamaño de pantalla.
function placeDrips() {
  const tag = $('.hero-tag'), word = tag.firstElementChild, node = word?.firstChild;
  if (!node) return;
  const text = node.textContent;
  const targets = [[text.indexOf('l'), 0.5], [text.indexOf('i'), 0.5], [text.lastIndexOf('d'), 0.8]];
  const size = parseFloat(getComputedStyle(tag).fontSize);
  const rot = tag.style.rotate;
  tag.style.rotate = '0deg'; // medir sin la inclinación
  const box = tag.getBoundingClientRect();
  const mark = document.createElement('span');
  mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  word.append(mark);
  const baseline = mark.getBoundingClientRect().top - box.top;
  mark.remove();
  const range = document.createRange();
  $$('i', tag).forEach((drip, k) => {
    const [idx, fx] = targets[k] || [];
    if (idx == null || idx < 0) { drip.hidden = true; return; }
    range.setStart(node, idx);
    range.setEnd(node, idx + 1);
    const r = range.getBoundingClientRect();
    drip.style.left = `${r.left - box.left + r.width * fx - drip.offsetWidth / 2}px`;
    drip.style.top = `${baseline - size * 0.14}px`; // empieza un poco dentro de la letra
  });
  tag.style.rotate = rot;
}
addEventListener('resize', placeDrips);

/* ---------- intro del hero ---------- */
function intro(cans, spray) {
  gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.3 } })
    .from('.hero-name .line > span', { yPercent: 115, stagger: 0.1 })
    .from('.nav > :not(.to-top)', { y: -24, autoAlpha: 0, stagger: 0.06, duration: 0.9 }, 0.1)
    .add(() => cans?.intro(), 0.15)
    .fromTo('.hero-tag',
      { clipPath: 'inset(-20% 100% -80% 0)' },
      { clipPath: 'inset(-20% 0% -80% 0)', duration: 0.8, ease: 'power2.inOut', clearProps: 'clipPath' }, 0.55)
    .add(() => { placeDrips(); $('.hero-tag').classList.add('is-dripping'); }, 1.2)
    .add(() => scrollY < innerHeight / 2 && spray.swoosh($('.hero-name')), 0.7) // solo si el hero está a la vista
    .from('.hero-meta, .hero-bottom, .sticker, .hero-hint', { autoAlpha: 0, y: 16, stagger: 0.07, duration: 0.9 }, 0.7)
    .add(() => drawDoodle($('.hero-hint .doodle')), 1.1);
}

/* ---------- animaciones de scroll ---------- */
function initScroll(cans, droneReady) {
  // 02 gráfico: la pared se recorre en horizontal (solo escritorio).
  // Va primero: los triggers que están debajo del pin deben crearse después.
  gsap.matchMedia().add('(min-width: 761px)', () => {
    const track = $('.posters');
    const dist = () => track.scrollWidth - innerWidth;
    gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: '.wall', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true },
    });
  });

  // hero: las latas salen volando y el nombre sube
  const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  ScrollTrigger.create({ ...heroST, onUpdate: s => cans?.setScroll(s.progress) });
  gsap.to('.hero-title', { yPercent: -25, autoAlpha: 0.2, ease: 'none', scrollTrigger: heroST });

  // 04 dron: despega a medida que la sección entra en pantalla
  let drone = null;
  const takeoff = ScrollTrigger.create({
    trigger: '.drone-stage', start: 'top 80%', end: 'center 45%', scrub: true,
    onUpdate: s => drone?.setFlight(s.progress),
  });
  droneReady.then(d => { drone = d; d?.setFlight(takeoff.progress); });

  if (reduce) return;

  // intro palabra por palabra + brochazo
  const words = splitWords($('.manifesto-text'));
  gsap.fromTo(words, { opacity: 0.12 }, {
    opacity: 1, stagger: 0.1, ease: 'none',
    scrollTrigger: { trigger: '.manifesto-text', start: 'top 75%', end: 'bottom 50%', scrub: true },
  });
  gsap.fromTo('.manifesto .paint', { '--p': 0 }, {
    '--p': 1, ease: 'none',
    scrollTrigger: { trigger: '.manifesto .paint', start: 'top 75%', end: 'top 50%', scrub: true },
  });

  // títulos gigantes que se deslizan
  for (const el of $$('.big-title'))
    gsap.fromTo(el, { xPercent: 10 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });

  initReveals();

  // rayones que se dibujan solos
  for (const svg of $$('.doodle:not([data-doodle="intro"])'))
    ScrollTrigger.create({ trigger: svg, start: 'top 80%', once: true, onEnter: () => drawDoodle(svg) });
}

/* ---------- HUD velocímetro (guiño a Need for Speed) ---------- */
function initHud() {
  const hud = $('.hud'), num = $('.hud-num b'), prog = $('.hud-prog'), sec = $('.hud-sec');
  const C = 2 * Math.PI * 44, ARC = C * 0.75;
  $('.hud-track').style.strokeDasharray = `${ARC} ${C}`;
  let speed = 0, shown = '';
  gsap.ticker.add(() => {
    speed += (Math.min(Math.abs(lenis?.velocity ?? 0) * 5, 299) - speed) * 0.1;
    const s = String(Math.round(speed)).padStart(3, '0');
    if (s !== shown) num.textContent = shown = s;
    const max = ScrollTrigger.maxScroll(window);
    prog.style.strokeDasharray = `${ARC * (max ? scrollY / max : 0)} ${C}`;
    hud.classList.toggle('is-on', scrollY > innerHeight * 0.5 && scrollY < max - 80); // se esconde al llegar al footer
  });
  for (const s of $$('[data-hud]'))
    ScrollTrigger.create({ trigger: s, start: 'top 55%', end: 'bottom 55%', onToggle: st => st.isActive && (sec.textContent = t(s.dataset.hud)) });
}

/* ---------- detalles ---------- */
function initClips() {
  // el timecode corre mientras pasas el mouse (24 fps)
  const pad = n => String(Math.floor(n)).padStart(2, '0');
  for (const clip of $$('.clip')) {
    const tc = $('.tc', clip);
    let f = 0, on = false;
    clip.addEventListener('pointerenter', () => (on = true));
    clip.addEventListener('pointerleave', () => (on = false));
    gsap.ticker.add((time, dt) => {
      if (!on) return;
      f += dt * 0.024;
      tc.textContent = [f / 86400, (f / 1440) % 60, (f / 24) % 60, f % 24].map(pad).join(':');
    });
  }
}

function initStickers() {
  let z = 1;
  for (const el of $$('.stickers li')) {
    el.style.setProperty('--r', gsap.utils.random(-9, 9, 1) + 'deg');
    let sx = 0, sy = 0, x = 0, y = 0;
    el.addEventListener('pointerdown', e => {
      el.setPointerCapture(e.pointerId);
      sx = e.clientX - x;
      sy = e.clientY - y;
      el.style.zIndex = ++z;
      el.classList.add('is-drag');
    });
    el.addEventListener('pointermove', e => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      x = e.clientX - sx;
      y = e.clientY - sy;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener('lostpointercapture', () => el.classList.remove('is-drag'));
  }
}

// motion lab: portada en capas con parallax (con el mouse, o sola en bucle si nadie la toca)
function initCover() {
  const cover = $('.cover');
  // cada capa: se desplaza según su profundidad y, si está fuera del fondo, también avanza en Z (sale de la portada)
  const layers = $$('[data-depth]', cover).map(l => {
    const d = +l.dataset.depth, wrap = l.closest('.pop');
    // la profundidad (Z) va en el envoltorio .pop: así las capas se ordenan bien en 3D aunque el
    // envoltorio recorte (clip-path aplana lo que hay dentro, pero no a él mismo)
    if (wrap) gsap.set(wrap, { z: d * 16 });
    return [gsap.quickTo(l, 'x', { duration: 1, ease: 'power3' }), gsap.quickTo(l, 'y', { duration: 1, ease: 'power3' }), d * 11];
  });
  const turnY = gsap.quickTo(cover, 'rotationY', { duration: 1, ease: 'power3' });
  const turnX = gsap.quickTo(cover, 'rotationX', { duration: 1, ease: 'power3' });
  const move = (nx, ny) => {
    for (const [x, y, k] of layers) { x(nx * k); y(ny * k); }
    turnY(nx * 9);
    turnX(-ny * 7);
  };
  let hover = false, visible = false;
  cover.addEventListener('pointermove', e => {
    const r = cover.getBoundingClientRect();
    hover = true;
    move((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
  });
  cover.addEventListener('pointerleave', () => (hover = false));
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(cover);
  if (!reduce) gsap.ticker.add(time => { if (visible && !hover) move(Math.sin(time * 0.6) * 0.85, Math.cos(time * 0.45) * 0.6); });

  // brasas que suben del fuego y se escapan por arriba de la portada
  const cv = $('.cl-embers', cover);
  if (cv && !reduce) {
    const g = cv.getContext('2d');
    const sparks = Array.from({ length: 60 }, () => ({ x: Math.random(), y: 0.3 + Math.random() * 0.7, v: 0.025 + Math.random() * 0.05, r: 0.6 + Math.random() * 1.8, w: Math.random() * 6 }));
    gsap.ticker.add((time, dt) => {
      if (!visible) return;
      const w = (cv.width = cv.clientWidth), h = (cv.height = cv.clientHeight);
      g.globalCompositeOperation = 'lighter';
      for (const p of sparks) {
        p.y -= p.v * dt / 1000;
        if (p.y < -0.02) { p.y = 0.75 + Math.random() * 0.25; p.x = 0.1 + Math.random() * 0.8; }
        const a = Math.min(1, p.y * 2.2) * (0.5 + 0.5 * Math.sin(time * 6 + p.w));
        g.fillStyle = `rgba(255, ${120 + (p.w * 15 | 0)}, 40, ${a * 0.9})`;
        g.beginPath();
        g.arc((p.x + Math.sin(time * 0.8 + p.w) * 0.015) * w, p.y * h, p.r, 0, Math.PI * 2);
        g.fill();
      }
    });
  }
}

// preguntas rápidas → datos estructurados FAQPage (Google y las IA), en el idioma actual
function faqSchema() {
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: document.documentElement.lang,
    mainEntity: [1, 2, 3, 4, 5].map(n => ({
      '@type': 'Question',
      name: t(`faq.q${n}`),
      acceptedAnswer: { '@type': 'Answer', text: t(`faq.a${n}`) },
    })),
  });
  document.head.append(ld);
}

/* ---------- arranque ---------- */
renderProjects();
fillTapes();
faqSchema();
const spray = initSpray($('.hero-spray'), $('.hero'));
prepDoodles();
initClips();
initStickers();
initCover();

const cansReady = Promise.resolve()
  .then(() => window.initCans({
    canvas: $('.hero-3d'),
    area: $('.hero'),
    reduce,
    onHover: id => {
      setCursor(id ? 'open' : 'spray');
      for (const a of $$('.hero-cats a')) a.classList.toggle('is-active', a.hash === '#' + id);
    },
    onPick: id => goTo('#' + id),
  }))
  .catch(err => { console.warn('3D desactivado:', err); return null; });

// loader completo solo en la primera visita; al volver o al cambiar de idioma, la cortina ya tapa la carga
const first = !session('visited');
session('visited', '1');
lenis?.stop();
if (reduce || !first || arrived) $('.loader').remove();
else await runLoader(Promise.all([cansReady, document.fonts.ready, wait(1800)]));
if (arrived) await Promise.race([cansReady, wait(1500)]);
document.documentElement.classList.remove('is-loading');
lenis?.start();

const cans = await cansReady;
for (const a of $$('.hero-cats a')) {
  a.addEventListener('pointerenter', () => cans?.highlight(a.hash.slice(1)));
  a.addEventListener('pointerleave', () => cans?.highlight(null));
}
const droneReady = Promise.resolve()
  .then(() => window.initDrone({ canvas: $('.drone-3d'), stage: $('.drone-stage'), osd: $('.osd'), reduce }))
  .catch(err => { console.warn('Dron 3D desactivado:', err); return null; });
initScroll(cans, droneReady);
initHud();
if (!reduce) intro(cans, spray);
reveal();

// volver al mismo punto tras cambiar de idioma, o saltar al capítulo pedido (index.html#dron)
const y = session('scrollY');
session('scrollY', null);
if (y) goTo(+y, true);
else if (location.hash) goTo(location.hash, true);
})();
