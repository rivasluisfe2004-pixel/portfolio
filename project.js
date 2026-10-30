// Página de proyecto (project.html?p=id) — se construye sola con los datos de projects.js.
(() => {
  const { gsap, $, reduce, initReveals, reveal, goTo, session } = window.site;
  const { t, tr, esc, rich } = window.i18n;
  const tx = v => esc(tr(v));
  const rx = v => rich(tr(v));
  const pad = n => String(n).padStart(2, '0');

  const all = window.PROJECTS.filter(p => !p.soon);
  const i = all.findIndex(p => p.id === new URLSearchParams(location.search).get('p'));
  if (i < 0) { location.replace('index.html#trabajo'); return; }
  const p = all[i], next = all[(i + 1) % all.length];
  const num = window.CHAPTERS[p.cat];
  // si el proyecto tiene un video real, va arriba del todo (en lugar de la imagen de portada)
  // portadas animadas: elige un álbum (?a=id) y solo se ve ese; sin elegir, solo el selector
  const albumId = new URLSearchParams(location.search).get('a');
  const album = p.albums?.find(a => a.id === albumId);
  const src = p.albums ? album?.sections || [] : p.sections;
  const heroVideo = p.albums ? null : src.find(x => !x.inline && (x.video?.src || x.video?.youtube));
  const sections = src.filter(x => x !== heroVideo);
  const photos = sections.flatMap(x => x.images || (x.groups || []).flatMap(g => g.images)); // todas las fotos, para el visor

  document.title = `${tr(p.title)} — Luis Rivas`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', tr(p.summary));

  // imagen principal: el mismo "marco" que su capítulo en la home
  const media = p.cover ? `<img src="${esc(p.cover)}" alt="${tx(p.title)}">` : '';
  const corners = '<i class="osd-c tl"></i><i class="osd-c tr"></i><i class="osd-c bl"></i><i class="osd-c br"></i>';
  const VISUAL = {
    web: () => `
      <div class="browser">
        <div class="browser-bar"><i></i><i></i><i></i><span class="mono">${esc(p.url || p.id)}</span></div>
        <div class="browser-view"><div class="ph ph-${p.ph}">${media || `<span class="mono">${t('ph.screenshot')}</span>`}</div></div>
      </div>`,
    grafico: () => `
      <div class="case-wall"><div class="poster case-poster"><span class="tape-bit"></span>
        <div class="ph ph-${p.ph}">${media || `<span>${num}</span><em class="mono">${tx(p.title)}</em>`}</div>
      </div></div>`,
    video: () => `
      <div class="clip-frame ph ph-${p.ph}">${media}
        <span class="rec mono"><i></i>rec</span><span class="tc mono">00:00:00:00</span><span class="play" aria-hidden="true"></span>
      </div>`,
    dron: () => `
      <div class="flight-frame ph ph-${p.ph}">${media}${corners}
        ${p.badge ? `<span class="mono flight-badge">${esc(p.badge)}</span>` : ''}
        <span class="mono flight-loc">⌖ ${tx(p.place)}</span>
      </div>`,
  };

  // cada bloque de texto de projects.js → una sección numerada
  // proceso: secciones con step: n → número grande + barra de pasos clicable
  const STEP = { es: 'Paso', fr: 'Étape', en: 'Step' };
  const nSteps = sections.filter(x => x.step).length;
  const section = (s, k) => `
    <section class="case-sec${s.step ? ' is-step' : ''}"${s.step ? ` id="step-${s.step}"` : ''} data-reveal>
      ${s.step ? `<p class="case-step"><b>${pad(s.step)}</b><span class="mono">${tx(STEP)} ${s.step}/${nSteps}</span></p>` : `<p class="mono case-sec-num">${pad(k + 1)}</p>`}
      <div class="case-sec-body">
        ${s.h ? `<h2>${tx(s.h)}</h2>` : ''}
        ${s.p ? `<p class="case-p">${rx(s.p)}</p>` : ''}
        ${s.more ? `<p class="case-more mono">${t('case.more')}</p>` : ''}
        ${s.quote ? `<blockquote class="case-quote"><p>« ${tx(s.quote)} »</p>${s.cite ? `<cite class="mono">${tx(s.cite)}</cite>` : ''}</blockquote>` : ''}
        ${s.list ? `<ol class="case-list">${s.list.map(x => `<li><span>${rx(x)}</span></li>`).join('')}</ol>` : ''}
        ${s.cards ? `<div class="case-cards">${s.cards.map(c => `<div class="case-card"><h3>${tx(c.t)}</h3><p>${rx(c.p)}</p></div>`).join('')}</div>` : ''}
        ${s.steps ? `<ol class="case-steps mono">${sections.filter(x => x.step).map(x => `<li><a href="#step-${x.step}"><b>${pad(x.step)}</b>${tx(x.short)}</a></li>`).join('')}</ol>` : ''}
        ${s.stats ? `<div class="case-stats">${s.stats.map(x => `<div><b>${tx(x.v)}</b><span class="mono">${tx(x.l)}</span></div>`).join('')}</div>` : ''}
        ${s.chips ? `<ul class="case-chips mono">${tr(s.chips).map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
        ${s.video ? video(s.video) : ''}
        ${s.videos ? `<div class="case-videos">${s.videos.map(video).join('')}</div>` : ''}
        ${s.links ? `<p class="case-links">${s.links.map(l => `<a class="yt-link mono" href="${esc(tr(l.href))}"${/^https?:/.test(tr(l.href)) ? ' target="_blank" rel="noopener">' + tx(l.t) + ' ↗' : ' download>' + tx(l.t) + ' ↓'}</a>`).join(' ')}</p>` : ''}
        ${s.compare ? `<div class="compare-list">${s.compare.map(compare).join('')}</div>` : ''}
        ${s.images ? `<div class="case-photos${p.fullPhotos ? ' full' : ''}">${s.images.map(photo).join('')}</div>` : ''}
        ${s.groups ? s.groups.map(g => `<div class="case-photos full" style="--cols:${g.cols}">${g.images.map(photo).join('')}</div>`).join('') : ''}
        ${s.layers ? `<div class="explode" data-explode><div class="ex-sticky"><div class="ex-stage"><div class="ex-stack">${s.layers.map((l, k) => {
          const label = `<span class="ex-label mono"><b>${pad(k + 1)}</b><i>${tx(l.name)}</i></span>`;
          return `<div class="ex-plane" data-z="${k}">${l.box
            ? `<div class="ex-item" style="left:${l.box[0]}%;top:${l.box[1]}%;width:${l.box[2]}%"><img src="${esc(l.src)}" alt="" draggable="false">${label}</div>`
            : `<img class="ex-full" src="${esc(l.src)}" alt="" draggable="false">${label}`}</div>`;
        }).join('')}</div></div><ol class="ex-legend mono">${s.layers.map((l, k) => `<li><b>${pad(k + 1)}</b>${tx(l.name)}</li>`).join('')}</ol></div></div>` : ''}
        ${s.panos ? `<div class="pano-grid">${s.panos.map(pano).join('')}</div>` : ''}
        ${s.gallery ? `<div class="case-gallery g${s.gallery}">${Array.from({ length: s.gallery }, (_, g) =>
          `<div class="ph ph-gal"><span class="mono">${t('ph.image')} ${pad(g + 1)} ]</span></div>`).join('')}</div>` : ''}
      </div>
    </section>`;

  // video: { src, poster, youtube } o true = hueco reservado.
  // youtube = id o enlace → reproductor de YouTube en 4K que solo se carga al pulsar play (ni cookies ni peso antes)
  const ytId = u => String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1] || u;
  const video = v => {
    if (v?.youtube) {
      const id = esc(ytId(v.youtube));
      return `<div class="case-video yt" data-yt="${id}">
          <button type="button" class="yt-play" aria-label="${t('yt.play')}" data-cursor="play">
            ${v.poster ? `<img src="${esc(v.poster)}" alt="" loading="lazy">` : ''}
            <span class="play" aria-hidden="true"></span><span class="mono yt-note">${t('yt.note')}</span>
          </button>
        </div>
        <a class="yt-link mono" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">${t('yt.link')} ↗</a>`;
    }
    return v?.src
      ? `<video class="case-video" src="${esc(v.src)}"${v.poster ? ` poster="${esc(v.poster)}"` : ''}${v.loop ? ' autoplay muted loop' : ''} controls playsinline preload="metadata"></video>`
      : `<div class="clip-frame ph ph-v1 case-video"><span class="rec mono"><i></i>rec</span><span class="mono">${t('ph.video')}</span></div>`;
  };

  // antes / después: la foto editada encima, recortada por una cortina que se arrastra
  const compare = x => `
    <figure class="compare" style="--pos: 50%">
      <img src="${esc(x.before)}" alt="${tx(x.alt)} — ${t('cmp.before')}" loading="lazy">
      <img class="compare-after" src="${esc(x.after)}" alt="${tx(x.alt)} — ${t('cmp.after')}" loading="lazy">
      <span class="compare-tag compare-tag-b mono">${t('cmp.before')}</span>
      <span class="compare-tag compare-tag-a mono">${t('cmp.after')}</span>
      <span class="compare-line" aria-hidden="true"><i class="tag-font">↔</i></span>
      <input class="compare-range" type="range" min="0" max="100" value="50" step="0.1" aria-label="${t('cmp.label')} — ${tx(x.alt)}">
      <figcaption class="mono">${tx(x.alt)}</figcaption>
    </figure>`;

  // foto: miniatura que abre el visor a pantalla completa
  const photo = x => `
    <button type="button" class="case-photo" data-photo="${photos.indexOf(x)}" data-cursor="view">
      <img src="${esc(tr(x.src))}" alt="${tx(x.alt)}" loading="lazy">
    </button>`;

  // foto 360°: tarjeta con el tiny planet girando (lo anima pano.js); al hacer clic se abre el visor
  const pano = x => `
    <button type="button" class="pano-card" data-pano="${esc(x.id)}" data-title="${tx(x.title)}" data-cursor="enter"
      aria-label="${t('pano.open')} — ${tx(x.title)}">
      <canvas aria-hidden="true"></canvas>
      <span class="mono pano-badge">360°</span>
      <span class="mono pano-cap">${tx(x.title)}</span>
      <span class="pano-cta tag-font" aria-hidden="true">${t('pano.enter')}</span>
    </button>`;

  // cada portada en miniatura con el mismo parallax de la home; 5 casillas, las vacías = próximamente
  const PICK = { es: 'Elige una portada', fr: 'Choisissez une pochette', en: 'Pick a cover' };
  const SOON = { es: 'próximamente', fr: 'bientôt', en: 'coming soon' };
  const picker = () => {
    const slots = [...p.albums, ...Array(Math.max(0, 5 - p.albums.length)).fill(null)];
    return `<p class="mono pick-label">${tx(PICK)}</p><div class="picks">${slots.map((a, k) => {
      if (!a) return `<div class="pick pick-soon mono"><span>${pad(k + 1)}</span>${tx(SOON)}</div>`;
      const ls = a.sections.find(x => x.layers).layers, n = ls.length - 1;
      return `<a class="pick${a === album ? ' is-on' : ''}" href="project.html?p=${p.id}&a=${a.id}#album" data-cursor="move" aria-label="${esc(a.title)} — ${esc(a.artist)}">
        <span class="pick-cover">${ls.map((l, j) => l.box
          ? `<img class="cover-layer" src="${esc(l.src)}" alt="" style="left:${l.box[0]}%;top:${l.box[1]}%;width:${l.box[2]}%" data-depth="${(0.2 + 0.8 * j / n).toFixed(2)}" draggable="false">`
          : `<img class="cover-layer pick-bg" src="${esc(l.src)}" alt="" data-depth="-0.3" draggable="false">`).join('')}</span>
        <span class="pick-cap mono"><b>${pad(k + 1)}</b> ${esc(a.title)}<i>${esc(a.artist)}</i></span>
      </a>`;
    }).join('')}</div>`;
  };

  $('#case').innerHTML = `
    <header class="case-head">
      <div class="case-top mono">
        <a href="index.html#${p.cat}">← ${t('case.back')}</a>
        <span>${t('case.project')} ${pad(i + 1)} / ${pad(all.length)}</span>
      </div>
      <p class="case-cat mono"><b>${num}</b> ${t('cat.' + p.cat)} — ${tx(p.kind)}</p>
      <h1 class="case-title">${tx(p.title)}</h1>
      <p class="case-sub">${rx(p.summary)}</p>
      <dl class="case-meta mono">
        <div><dt>${t('case.context')}</dt><dd>${tx(p.context)}</dd></div>
        <div><dt>${t('case.role')}</dt><dd>${tx(p.role)}</dd></div>
        ${p.team ? `<div><dt>${t('case.team')}</dt><dd>${tx(p.team)}</dd></div>` : ''}
        <div><dt>${t('case.tools')}</dt><dd>${(p.tags || []).map(tx).join(' · ')}</dd></div>
        ${p.software ? `<div class="case-sw"><dt>${t('case.software')}</dt><dd>${tx(p.software)}</dd></div>` : ''}
      </dl>
    </header>
    ${p.albums ? `<div class="case-picker" data-reveal>${picker()}</div>`
      : `<div class="case-hero case-${p.cat}" data-reveal>${heroVideo ? video(heroVideo.video) : VISUAL[p.cat]()}</div>`}
    <div class="case-body" id="album">${sections.map(section).join('')}</div>
    <a class="case-next" href="project.html?p=${next.id}" data-curtain="${tx(next.title)}" data-cursor="open">
      <span class="mono">${t('case.next')} →</span>
      <b>${tx(next.title)}</b>
      <span class="mono">${window.CHAPTERS[next.cat]} — ${t('cat.' + next.cat)}</span>
    </a>`;

  // datos estructurados (schema.org) para que Google y las IA entiendan qué es esta página
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: tr(p.title),
    description: tr(p.summary).replace(/\{\{|\}\}/g, ''),
    genre: t('cat.' + p.cat),
    keywords: (p.tags || []).map(tr).join(', '),
    inLanguage: document.documentElement.lang,
    creator: { '@type': 'Person', name: 'Luis Rivas' },
  });
  document.head.append(ld);

  initReveals($('#case'));
  // selector de portadas: capas que siguen al mouse; solas en bucle si nadie las toca
  for (const card of document.querySelectorAll('.pick:not(.pick-soon)')) {
    const layers = [...card.querySelectorAll('[data-depth]')].map(l => [gsap.quickTo(l, 'x', { duration: 1, ease: 'power3' }), gsap.quickTo(l, 'y', { duration: 1, ease: 'power3' }), +l.dataset.depth * 8]);
    const ry = gsap.quickTo(card, 'rotationY', { duration: 1, ease: 'power3' }), rx = gsap.quickTo(card, 'rotationX', { duration: 1, ease: 'power3' });
    const move = (nx, ny) => { for (const [x, y, k] of layers) { x(nx * k); y(ny * k); } ry(nx * 12); rx(-ny * 10); };
    let hover = false, seed = Math.random() * 9;
    card.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect(); hover = true;
      move((e.clientX - r.left) / r.width * 2 - 1, (e.clientY - r.top) / r.height * 2 - 1);
    });
    card.addEventListener('pointerleave', () => (hover = false));
    if (!reduce) gsap.ticker.add(time => { if (!hover) move(Math.sin(time * 0.6 + seed) * 0.6, Math.cos(time * 0.45 + seed) * 0.45); });
  }
  window.initPanos?.($('#case'));
  if (photos.length) initLightbox();
  initCompares();
  // YouTube: el iframe se crea solo al pulsar play
  document.addEventListener('click', e => {
    const b = e.target.closest('.yt-play');
    if (!b) return;
    const box = b.parentElement, id = box.dataset.yt;
    // abierto con doble clic (file://) no hay dirección web y YouTube rechaza el reproductor (error 153):
    // en ese caso abrimos el video en YouTube
    if (location.protocol === 'file:') { open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener'); return; }
    // YouTube exige saber desde qué sitio se inserta el video: origin + referrer
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&origin=${encodeURIComponent(location.origin)}" title="YouTube" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer" allowfullscreen></iframe>`;
  });

  /* ---------- antes / después ---------- */
  function initCompares() {
    for (const fig of document.querySelectorAll('.compare')) {
      const range = fig.querySelector('.compare-range');
      const set = v => { fig.style.setProperty('--pos', v + '%'); range.value = v; };
      range.addEventListener('input', () => set(+range.value));
      // arrastrar en cualquier punto de la foto (también con el dedo)
      const fromPointer = e => { const r = fig.getBoundingClientRect(); set(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100))); };
      fig.addEventListener('pointerdown', e => { fig.setPointerCapture(e.pointerId); fig.classList.add('is-drag'); fromPointer(e); });
      fig.addEventListener('pointermove', e => { if (fig.hasPointerCapture(e.pointerId)) fromPointer(e); });
      fig.addEventListener('lostpointercapture', () => fig.classList.remove('is-drag'));
      // pequeña demostración la primera vez que aparece: la cortina va y vuelve
      if (!reduce) new IntersectionObserver(([en], io) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        const o = { v: 50 };
        gsap.timeline({ delay: 0.3 }).to(o, { v: 72, duration: 0.7, ease: 'power2.inOut', onUpdate: () => set(o.v) })
          .to(o, { v: 30, duration: 0.9, ease: 'power2.inOut', onUpdate: () => set(o.v) })
          .to(o, { v: 50, duration: 0.6, ease: 'power2.out', onUpdate: () => set(o.v) });
      }, { threshold: 0.6 }).observe(fig);
    }
  }

  /* ---------- visor de fotos ---------- */
  function initLightbox() {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', t('lb.label'));
    box.innerHTML = `
      <img class="lb-img" alt="">
      <p class="lb-cap mono"></p>
      <button type="button" class="pano-exit tag-font lb-exit">${t('pano.exit')}</button>
      <button type="button" class="lb-nav lb-prev mono" aria-label="${t('lb.prev')}">←</button>
      <button type="button" class="lb-nav lb-next mono" aria-label="${t('lb.next')}">→</button>`;
    document.body.append(box);
    const img = box.querySelector('.lb-img'), cap = box.querySelector('.lb-cap');
    let cur = 0, opener = null;
    const show = k => {
      cur = (k + photos.length) % photos.length;
      img.src = tr(photos[cur].src);
      img.alt = tr(photos[cur].alt);
      cap.textContent = `${pad(cur + 1)} / ${pad(photos.length)} — ${tr(photos[cur].alt)}`;
    };
    const open = k => {
      opener = document.activeElement;
      show(k);
      box.classList.add('is-open');
      document.documentElement.classList.add('pano-open');
      window.site.lenis?.stop();
      box.querySelector('.lb-exit').focus();
    };
    const close = () => {
      box.classList.remove('is-open');
      document.documentElement.classList.remove('pano-open');
      window.site.lenis?.start();
      opener?.focus();
    };
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-photo]');
      if (b) open(+b.dataset.photo);
    });
    box.querySelector('.lb-exit').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', () => show(cur - 1));
    box.querySelector('.lb-next').addEventListener('click', () => show(cur + 1));
    box.addEventListener('click', e => { if (e.target === box) close(); });
    addEventListener('keydown', e => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });
  }
  // capa por capa, en 3 tiempos:
  // 1) cada elemento sale de la portada hacia un lado → queda el fondo reconstruido en el centro
  // 2) vuelven a su sitio mientras todo gira a la vista lateral 3D (capas apiladas)
  // 3) se cierra en la portada final
  for (const box of document.querySelectorAll('[data-explode]')) {
    const stage = box.querySelector('.ex-stage');
    const stack = box.querySelector('.ex-stack');
    const planes = [...box.querySelectorAll('.ex-plane')];
    const items = [...box.querySelectorAll('.ex-item')];
    const labels = box.querySelectorAll('.ex-label');
    const gap = () => Math.min(innerWidth, 1100) * 0.085;
    // casillas alrededor de la portada: a los lados si hay sitio, si no arriba y abajo (móvil)
    let slots = [];
    const layout = () => {
      const S = stage.offsetWidth, side = innerWidth > S * 1.9;
      const c = items.map((el, i) => ({ i, x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight }));
      const half = Math.ceil(c.length / 2);
      const byX = [...c].sort((a, b) => a.x - b.x);
      const groups = [byX.slice(0, half), byX.slice(half)].map(g => g.sort((a, b) => side ? a.y - b.y : a.x - b.x));
      slots = [];
      groups.forEach((g, gi) => g.forEach((e, k) => {
        const n = g.length, cell = S / n;
        const tx = side ? (gi ? S * 1.45 : -S * 0.45) : cell * (k + 0.5);
        const ty = side ? cell * (k + 0.5) : (gi ? S * 1.3 : -S * 0.3);
        const room = side ? Math.min(S * 0.42, cell * 0.8) : Math.min(cell * 0.8, S * 0.3);
        slots[e.i] = { x: tx - e.x, y: ty - e.y, scale: Math.min(1, room / Math.max(e.w, e.h)) };
      }));
    };
    layout();
    addEventListener('resize', layout);
    const out = (tl, at) => tl
      .to(stack, { scale: 0.62, duration: 1 }, at)
      .to(items, { x: i => slots[i].x, y: i => slots[i].y, scale: i => slots[i].scale, '--s': i => slots[i].scale, duration: 1 }, at)
      .to(box, { '--pull': 1, duration: 0.5 }, at + 0.4)
      .to(labels, { autoAlpha: 1, stagger: 0.04, duration: 0.3 }, at + 0.5);
    const stackUp = (tl, at) => tl
      .to(items, { x: 0, y: 0, scale: 1, '--s': 1, duration: 1 }, at)
      .to(box, { '--pull': 0, '--edge': 1, duration: 0.6 }, at)
      .to(stack, { rotateY: -52, rotateX: 8, duration: 1 }, at)
      .to(planes, { z: (k, el) => (+el.dataset.z - (planes.length - 1) / 2) * gap(), duration: 1 }, at);
    if (reduce) { box.classList.add('is-static'); stackUp(out(gsap.timeline(), 0), 1).progress(1); continue; }
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: box, start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true, onRefreshInit: layout } });
    out(tl, 0);
    tl.to({}, { duration: 0.5 });
    stackUp(tl, 1.5);
    tl.to({}, { duration: 0.5 })
      .to(labels, { autoAlpha: 0, duration: 0.3 })
      .to(box, { '--edge': 0, duration: 0.4 }, '<')
      .to(planes, { z: 0, duration: 1 }, '<')
      .to(stack, { rotateY: 0, rotateX: 0, scale: 1, duration: 1 }, '<');
  }

  if (!reduce) {
    gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } })
      .from('.case-title', { yPercent: 30, autoAlpha: 0 })
      .from('.case-top, .case-cat, .case-sub, .case-meta > div', { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.9 }, 0.15);
  }
  reveal();

  // volver al mismo punto tras cambiar de idioma
  const y = session('scrollY');
  session('scrollY', null);
  if (y) goTo(+y, true);
  else if (album) setTimeout(() => goTo('#album'), reduce ? 0 : 700); // portada elegida → se revela su proyecto
})();
