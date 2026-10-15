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
  const section = (s, k) => `
    <section class="case-sec" data-reveal>
      <p class="mono case-sec-num">${pad(k + 1)}</p>
      <div class="case-sec-body">
        ${s.h ? `<h2>${tx(s.h)}</h2>` : ''}
        ${s.p ? `<p class="case-p">${rx(s.p)}</p>` : ''}
        ${s.more ? `<p class="case-more mono">${t('case.more')}</p>` : ''}
        ${s.quote ? `<blockquote class="case-quote"><p>« ${tx(s.quote)} »</p>${s.cite ? `<cite class="mono">${tx(s.cite)}</cite>` : ''}</blockquote>` : ''}
        ${s.list ? `<ol class="case-list">${s.list.map(x => `<li>${rx(x)}</li>`).join('')}</ol>` : ''}
        ${s.cards ? `<div class="case-cards">${s.cards.map(c => `<div class="case-card"><h3>${tx(c.t)}</h3><p>${rx(c.p)}</p></div>`).join('')}</div>` : ''}
        ${s.stats ? `<div class="case-stats">${s.stats.map(x => `<div><b>${tx(x.v)}</b><span class="mono">${tx(x.l)}</span></div>`).join('')}</div>` : ''}
        ${s.chips ? `<ul class="case-chips mono">${tr(s.chips).map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
        ${s.video ? video(s.video) : ''}
        ${s.panos ? `<div class="pano-grid">${s.panos.map(pano).join('')}</div>` : ''}
        ${s.gallery ? `<div class="case-gallery g${s.gallery}">${Array.from({ length: s.gallery }, (_, g) =>
          `<div class="ph ph-gal"><span class="mono">${t('ph.image')} ${pad(g + 1)} ]</span></div>`).join('')}</div>` : ''}
      </div>
    </section>`;

  // video: ruta a un .mp4 (ej. 'assets/video/cancun.mp4') o true = hueco reservado
  const video = src => (typeof src === 'string'
    ? `<video class="case-video" src="${esc(src)}" controls playsinline preload="metadata"></video>`
    : `<div class="clip-frame ph ph-v1 case-video"><span class="rec mono"><i></i>rec</span><span class="mono">${t('ph.video')}</span></div>`);

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
      </dl>
    </header>
    <div class="case-hero case-${p.cat}" data-reveal>${VISUAL[p.cat]()}</div>
    <div class="case-body">${p.sections.map(section).join('')}</div>
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
