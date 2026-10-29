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
  const heroVideo = p.sections.find(x => !x.inline && (x.video?.src || x.video?.youtube));
  const sections = p.sections.filter(x => x !== heroVideo);
  const photos = sections.flatMap(x => x.images || []); // todas las fotos, para el visor

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
        ${s.links ? `<p class="case-links">${s.links.map(l => `<a class="yt-link mono" href="${esc(tr(l.href))}" download>${tx(l.t)} ↓</a>`).join(' ')}</p>` : ''}
        ${s.compare ? `<div class="compare-list">${s.compare.map(compare).join('')}</div>` : ''}
        ${s.images ? `<div class="case-photos${p.fullPhotos ? ' full' : ''}">${s.images.map(photo).join('')}</div>` : ''}
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
      ? `<video class="case-video" src="${esc(v.src)}"${v.poster ? ` poster="${esc(v.poster)}"` : ''} controls playsinline preload="metadata"></video>`
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
    <div class="case-hero case-${p.cat}" data-reveal>${heroVideo ? video(heroVideo.video) : VISUAL[p.cat]()}</div>
    <div class="case-body">${sections.map(section).join('')}</div>
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
})();
