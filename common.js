// Piezas compartidas por todas las páginas: scroll suave, cursor, cortina de transición y apariciones al hacer scroll.
// GSAP, ScrollTrigger y Lenis llegan como globales desde el CDN; i18n desde i18n.js.
(() => {
  const { gsap, ScrollTrigger, Lenis, i18n } = window;
  gsap.registerPlugin(ScrollTrigger);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const session = (k, v) => { try { return v === undefined ? sessionStorage.getItem(k) : v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch { return null; } };
  const root = document.documentElement;

  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ---------- scroll suave ---------- */
  const lenis = reduce ? null : new Lenis({ lerp: 0.09 });
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // target: '#id' o número de píxeles
  const goTo = (target, immediate = false) => {
    if (lenis) {
      lenis.resize(); // el contenido se genera con JS: Lenis debe re-medir la página antes de saltar
      return lenis.scrollTo(target, { duration: 1.6, immediate });
    }
    if (typeof target === 'number') window.scrollTo(0, target);
    else $(target)?.scrollIntoView();
  };

  /* ---------- cortina: tapa el cambio de página o de idioma ---------- */
  // Al salir: sube la cortina y navega. Al llegar: la página nace tapada (script inline en el HTML) y reveal() la quita.
  function leave(url, text) {
    const label = text || 'luis rivas';
    session('curtain', label);
    $('.curtain-txt').textContent = label;
    root.classList.remove('curtain-out');
    root.classList.add('is-switching');
    setTimeout(() => location.assign(url), reduce ? 0 : 560);
  }
  const arrived = root.classList.contains('is-switched');
  function reveal() {
    session('curtain', null);
    if (!root.classList.contains('is-switched')) return;
    root.classList.add('curtain-out');
    root.classList.remove('is-switched');
  }
  // volver con el botón "atrás" puede restaurar la página tapada: la destapamos
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('is-switching'); });

  /* ---------- enlaces: #anclas con scroll suave, páginas internas con cortina ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('data-top')) { e.preventDefault(); goTo(0); return; } // lata "volver arriba"
    const href = a.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault(); // "#" solo = enlace que aún no tiene destino
      if (href.length > 1) goTo(href);
      return;
    }
    if (/^(mailto:|tel:|https?:|\/\/)/.test(href) || a.hasAttribute('download')) return;
    const url = new URL(href, location.href);
    e.preventDefault();
    if (url.pathname === location.pathname && url.search === location.search && url.hash) goTo(url.hash);
    else leave(url.href, a.dataset.curtain);
  });

  // la lata "volver arriba" aparece cuando ya has bajado un poco
  const onScroll = () => root.classList.toggle('is-scrolled', scrollY > innerHeight * 0.6);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- cursor ---------- */
  // modos: '' = punto · 'spray' = aro · cualquier otra clave = círculo grande con etiqueta (cursor.xxx en i18n.js)
  function initCursor() {
    if (!finePointer) return () => {};
    const el = $('.cursor'), label = $('.cursor-label');
    root.classList.add('has-cursor');
    const x = gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power3' });
    const y = gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power3' });
    addEventListener('pointermove', e => { el.classList.add('is-on'); x(e.clientX); y(e.clientY); });
    const set = mode => {
      el.classList.toggle('is-spray', mode === 'spray');
      el.classList.toggle('is-big', !!mode && mode !== 'spray');
      if (mode && mode !== 'spray') label.textContent = i18n.t('cursor.' + mode, mode);
    };
    document.addEventListener('pointerover', e => set(e.target.closest('[data-cursor]')?.dataset.cursor));
    return set;
  }
  const setCursor = initCursor();

  /* ---------- aparecer al entrar en pantalla ---------- */
  function initReveals(scope = document) {
    if (reduce) return;
    for (const el of $$('[data-reveal]', scope))
      gsap.from(el, { y: 70, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  }

  window.site = { gsap, ScrollTrigger, lenis, goTo, leave, reveal, arrived, reduce, finePointer, $, $$, wait, session, setCursor, initReveals };
})();
