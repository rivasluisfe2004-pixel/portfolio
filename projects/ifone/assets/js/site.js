/* Ifones — shared chrome (nav, footer), product illustrations and all interactions. No dependencies. */
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const page = document.body.dataset.page || '';

  /* ---------- global nav + footer ---------- */
  const links = [['index.html', 'IFone', 'home'], ['gamme.html', 'Gamme', 'gamme'], ['labo.html', 'Labo', 'labo'], ['comparer.html', 'Comparer', 'comparer'], ['accessoires.html', 'Accessoires', 'accessoires'], ['specs.html', 'Support', 'specs']];
  const nav = $('[data-nav]');
  if (nav) nav.outerHTML = `<header class="gnav"><div class="wrap">
    <a class="logo" href="index.html" aria-label="Ifones, accueil">Ifones</a>
    <ul id="menu">${links.map(([h, t, p]) => `<li><a href="${h}"${p === page ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}</ul>
    <div style="display:flex;align-items:center;gap:8px"><a class="bag" href="acheter.html">Acheter <b data-bag></b></a>
    <button class="burger" aria-label="Menu" aria-controls="menu" aria-expanded="false"><i></i></button></div></div></header>`;
  const burger = $('.burger');
  if (burger) burger.addEventListener('click', () => { const o = doc.classList.toggle('nav-open'); burger.setAttribute('aria-expanded', o); });

  const foot = $('[data-foot]');
  if (foot) foot.outerHTML = `<footer class="foot"><div class="wrap">
    <p class="fine">¹ Financement sur 41 ans, sous réserve d’acceptation par votre descendance. TAEG : oui.<br>
    ² Testé sur un volcan que nos avocats nous interdisent de nommer.<br>
    ³ La météorite n’était pas assurée. Votre ville non plus.<br>
    Ifones décline toute responsabilité si vous fondez avant votre téléphone. Aucun téléphone n’a été blessé pendant les tests.</p><hr>
    <div class="cols">
      <div><h3>Découvrir</h3><ul><li><a href="index.html">IFone 18</a></li><li><a href="gamme.html#mini">IFone Mini</a></li><li><a href="gamme.html#pli">IFone Pli⁵</a></li><li><a href="gamme.html#pods">IFones Pods</a></li></ul></div>
      <div><h3>Acheter</h3><ul><li><a href="acheter.html">Boutique</a></li><li><a href="acheter.html#paiement">Financement sur 41 ans</a></li><li><a href="acheter.html#reprise">Reprise (3 €)</a></li></ul></div>
      <div><h3>Support</h3><ul><li><a href="accessoires.html#care">IFoneCare+ Post-Mortem</a></li><li><a href="specs.html">Mises à jour (1 an)</a></li><li><a href="404.html">Signaler une fonte</a></li></ul></div>
      <div><h3>Ifones</h3><ul><li><a href="labo.html">Le Labo</a></li><li><a href="404.html">Carrières au volcan</a></li><li><a href="404.html">Presse</a></li></ul></div>
    </div>
    <p>Copyright © 2026 Ifones Inc. Tous droits réservés. Conçu dans un volcan. Assemblé dans un autre.</p>
    <p>Site satirique. Ifones n’existe pas, ses téléphones non plus, et c’est probablement mieux comme ça.</p></div></footer>`;

  /* ---------- bag + toast ---------- */
  const bagEl = () => $('[data-bag]');
  const setBag = n => { store.set('ifones-bag', n); const b = bagEl(); if (b) b.textContent = n > 0 ? n : ''; };
  setBag(parseInt(store.get('ifones-bag') || '0', 10));
  let toastT;
  const toast = msg => {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200);
  };
  const quips = ['Ajouté. Votre banquier a été prévenu.', 'Ajouté. Vous n’en aviez pas besoin, et c’est très bien.', 'Ajouté. Le câble est vendu séparément.', 'Ajouté. On prépare déjà la version suivante.'];
  $$('[data-add]').forEach((b, i) => b.addEventListener('click', e => {
    e.preventDefault(); setBag(parseInt(store.get('ifones-bag') || '0', 10) + 1);
    toast(b.dataset.add || quips[i % quips.length]);
  }));

  /* ---------- product illustrations (line art) ---------- */
  const S = (body, vb = '0 0 200 200') => `<svg viewBox="${vb}" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const O = 'stroke="#ff7a2f" stroke-width="3"', G = 'stroke="#86868b" stroke-width="3"', F = 'fill="url(#g)"';
  const defs = '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc56b"/><stop offset=".55" stop-color="#ff7a2f"/><stop offset="1" stop-color="#e2401a"/></linearGradient></defs>';
  const ART = {
    mini: S(defs + `<rect x="34" y="62" width="58" height="80" rx="18" ${G}/><path d="M48 62 52 34h22l4 28M48 142l4 28h22l4-28" ${G}/><circle cx="63" cy="102" r="20" ${G}/><path d="M63 92v10l7 5" ${G}/>
      <rect x="122" y="70" width="40" height="66" rx="10" ${F}/><rect x="126" y="76" width="32" height="54" rx="7" fill="#000" opacity=".55"/><circle cx="133" cy="82" r="3" fill="#ffc56b"/>
      <text x="142" y="160" fill="#86868b" font-size="11" text-anchor="middle" font-family="system-ui">1,6″</text>`),
    pli: S(defs + `<g transform="translate(26 60)"><rect x="0" y="40" width="22" height="26" rx="4" ${F}/><rect x="30" y="34" width="30" height="32" rx="4" ${F} opacity=".85"/><rect x="68" y="24" width="38" height="42" rx="4" ${F} opacity=".7"/><rect x="114" y="8" width="34" height="58" rx="4" ${O}/><path d="M131 8v58M114 37h34" ${O} opacity=".5"/></g><path d="M30 150h140" ${G}/><text x="100" y="170" fill="#86868b" font-size="11" text-anchor="middle" font-family="system-ui">montre → 16″</text>`),
    pods: S(defs + `<path d="M62 60c-14 0-24 12-24 28s10 26 22 26h6v40a8 8 0 0 0 16 0V84c0-14-8-24-20-24Z" ${F}/><path d="M138 60c14 0 24 12 24 28s-10 26-22 26h-6v40a8 8 0 0 1-16 0V84c0-14 8-24 20-24Z" ${F}/><path d="M92 40c8 6 8 18 0 24M108 40c-8 6-8 18 0 24" ${G}/><path d="M84 36l32 34" stroke="#ff453a" stroke-width="3"/>`),
    phone: S(`<rect x="66" y="30" width="68" height="140" rx="16" ${G}/><path d="M90 40h20" ${G}/><path d="M84 102l12 12 22-26" stroke="#30d158" stroke-width="4"/>`),
    chip: S(defs + `<rect x="50" y="50" width="100" height="100" rx="18" ${F}/><rect x="66" y="66" width="68" height="68" rx="10" fill="#000" opacity=".5"/><path d="M84 100c0-10 14-10 16 0s16 10 16 0-14-10-16 0-16 10-16 0Z" stroke="#ffc56b" stroke-width="3"/><path d="M70 50V34M100 50V34M130 50V34M70 166v-16M100 166v-16M130 166v-16M50 70H34M50 100H34M50 130H34M166 70h-16M166 100h-16M166 130h-16" ${G}/>`),
    coque: S(defs + `<rect x="62" y="26" width="76" height="148" rx="20" ${G}/><rect x="70" y="34" width="60" height="132" rx="14" stroke="#86868b" stroke-width="2" stroke-dasharray="4 6"/><path d="M100 70c18 18 22 34 10 48 4-12-4-18-10-22 2 10-6 14-10 22-6-14 4-30 10-48Z" ${F}/>`),
    chargeur: S(defs + `<rect x="40" y="70" width="120" height="80" rx="16" ${F}/><ellipse cx="100" cy="110" rx="30" ry="11" stroke="#000" stroke-width="3" opacity=".6"/><ellipse cx="100" cy="110" rx="30" ry="11" transform="rotate(60 100 110)" stroke="#000" stroke-width="3" opacity=".6"/><ellipse cx="100" cy="110" rx="30" ry="11" transform="rotate(-60 100 110)" stroke="#000" stroke-width="3" opacity=".6"/><path d="M100 70V44h22" ${G}/><text x="100" y="176" fill="#86868b" font-size="12" text-anchor="middle" font-family="system-ui">14 kg</text>`),
    cable: S(`<path d="M40 100c0-22 30-22 40 0s40 22 40 0-30-22-40 0-40 22-40 0Z" ${O}/><path d="M160 100c0-22-30-22-40 0" ${O} opacity=".0"/><path d="M120 100c10-22 40-22 40 0s-30 22-40 0" ${O}/><rect x="22" y="94" width="14" height="12" rx="3" ${G}/><rect x="164" y="94" width="14" height="12" rx="3" ${G}/>`),
    chiffon: S(defs + `<path d="M50 60h100v90H50z" ${F}/><path d="M50 60l50 40 50-40" stroke="#000" stroke-width="3" opacity=".4"/><path d="M150 150c-12-6-30 6-40-4" stroke="#000" stroke-width="3" opacity=".4"/><text x="100" y="180" fill="#86868b" font-size="12" text-anchor="middle" font-family="system-ui">129 €</text>`),
    support: S(defs + `<circle cx="100" cy="128" r="44" ${G}/><circle cx="100" cy="128" r="10" ${G}/><path d="M60 128h30M110 128h30M100 138v34" ${G}/><rect x="36" y="26" width="128" height="62" rx="6" ${F}/>`),
    bracelet: S(`<path d="M76 30h48l-4 40H80zM80 130h40l4 40H76z" ${G}/><rect x="70" y="70" width="60" height="60" rx="14" stroke="#86868b" stroke-width="3" stroke-dasharray="5 6"/><path d="M84 86l32 28M116 86l-32 28" stroke="#ff453a" stroke-width="4"/>`),
    adaptateur: S(defs + `<rect x="24" y="80" width="40" height="40" rx="8" ${F}/><rect x="80" y="80" width="40" height="40" rx="8" ${F} opacity=".75"/><rect x="136" y="80" width="40" height="40" rx="8" ${F} opacity=".5"/><path d="M64 100h16M120 100h16" ${G}/><path d="M32 80V66M56 80V66" ${G}/>`),
    ifone: S(defs + `<rect x="60" y="24" width="80" height="152" rx="18" ${F}/><rect x="68" y="32" width="40" height="40" rx="11" fill="#000" opacity=".3"/><circle cx="80" cy="44" r="6" fill="#000" opacity=".6"/><circle cx="96" cy="60" r="6" fill="#000" opacity=".6"/><circle cx="80" cy="60" r="6" fill="#000" opacity=".6"/>`),
    watch: S(`<rect x="66" y="56" width="68" height="88" rx="20" ${G}/><path d="M78 56l4-26h36l4 26M78 144l4 26h36l4-26" ${G}/>`),
  };
  $$('[data-art]').forEach(el => { el.innerHTML = ART[el.dataset.art] || ''; });

  /* ---------- missing photos degrade gracefully ---------- */
  $$('img[data-photo]').forEach(img => {
    const fail = () => { // banner keeps its lava gradient; product tiles get the phone illustration
      const p = img.parentElement; img.remove();
      if (p.matches('.phone-tile, .media')) { p.classList.add('empty'); if (!p.querySelector('svg')) p.insertAdjacentHTML('beforeend', ART.ifone); }
    };
    if (img.complete && img.naturalWidth === 0) fail(); else img.addEventListener('error', fail);
  });

  /* ---------- reveal on scroll ---------- */
  const io = 'IntersectionObserver' in window && !reduce ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    if (e.target.matches('[data-count]')) count(e.target);
  }), { rootMargin: '0px 0px -12% 0px' }) : null;
  $$('.reveal, [data-count]').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* ---------- counters: 0 → value ---------- */
  function count(el) {
    const end = parseFloat(el.dataset.count.replace(',', '.')), dec = (el.dataset.count.split(',')[1] || '').length;
    const suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
      // French format by hand (thousands = narrow no-break space, decimals = comma): toLocaleString isn't reliable everywhere
      const [int, frac] = v.toFixed(dec).split('.');
      el.textContent = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') + (frac ? ',' + frac : '') + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (!io) $$('[data-count]').forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });

  /* ---------- banner parallax ---------- */
  const bannerImg = $('.banner img');
  if (bannerImg && !reduce) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const r = bannerImg.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) bannerImg.style.transform = `translateY(${(r.top * -0.12).toFixed(1)}px)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- IFone 19 countdown (starts at 364 j 23 h 59 min when you arrive) ---------- */
  const cd = $('[data-countdown]');
  if (cd) {
    const end = Date.now() + ((364 * 24 + 23) * 60 + 59) * 60000 + 59000;
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); s %= 60;
      cd.textContent = `L’IFone 19 arrive dans ${d} j ${h} h ${String(m).padStart(2, '0')} min ${String(s).padStart(2, '0')} s`;
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Pli⁵ unfolds with scroll: each fold halves the thickness ---------- */
  const pli = $('.pli');
  if (pli) {
    const scr = $('.pli-screen', pli), thick = $('[data-thick]', pli), diag = $('[data-diag]', pli), stepTxt = $('[data-step]', pli), dots = $$('.pli-steps i', pli);
    // [w, h] in mm per unfold step: watch → 16-inch laptop screen
    const sizes = [[46, 40], [80, 46], [92, 80], [160, 92], [184, 160], [355, 222]];
    const names = ['Plié ×5', 'Plié ×4', 'Plié ×3', 'Plié ×2', 'Plié ×1', 'Déplié'];
    const update = () => {
      const r = pli.getBoundingClientRect(), total = pli.offsetHeight - innerHeight;
      const p = reduce ? 1 : Math.min(1, Math.max(0, -r.top / total));
      const f = p * 5, i = Math.min(4, Math.floor(f)), t = f - i;
      const a = sizes[i], b = sizes[Math.min(5, i + 1)];
      const mm = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const k = Math.min(innerWidth * 0.82 / 355, innerHeight * 0.4 / 222);
      scr.style.setProperty('--pw', (mm[0] * k).toFixed(1) + 'px');
      scr.style.setProperty('--ph', (mm[1] * k).toFixed(1) + 'px');
      const layers = 32 / Math.pow(2, f); // 32 layers folded → 1 layer unfolded
      scr.style.setProperty('--folds', Math.max(1, Math.round(32 / layers)));
      const th = 34 / Math.pow(2, f); // mm
      thick.textContent = th >= 10 ? (th / 10).toFixed(1).replace('.', ',') + ' cm' : th.toFixed(1).replace('.', ',') + ' mm';
      diag.textContent = (Math.hypot(mm[0], mm[1]) / 25.4).toFixed(1).replace('.', ',') + '″';
      const s = Math.round(f);
      stepTxt.textContent = names[s];
      dots.forEach((d, j) => d.classList.toggle('on', j <= s));
    };
    update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update);
  }

  /* ---------- Pods: listen to the silence ---------- */
  const listen = $('[data-listen]');
  if (listen) {
    const out = $('.listen-out'), lines = ['…', 'Vous entendez ? Exactement.', 'Ça, c’est votre cœur. 62 bpm.', 'Et ça, votre estomac. Il est midi ?', 'Votre voisin pense à des lasagnes.'];
    let i = 0; listen.addEventListener('click', () => { out.textContent = lines[i++ % lines.length]; });
  }

  /* ---------- configurator (acheter) ---------- */
  const form = $('#config');
  if (form) {
    const eur = n => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    const img = $('#buy-photo'), cname = $('.cname-out'), tile = $('.buy-media .phone-tile');
    const update = () => {
      const fd = new FormData(form);
      const color = fd.get('couleur'), cap = parseFloat(fd.get('capacite')), rep = parseFloat(fd.get('reprise')), pay = fd.get('paiement');
      const total = cap + rep;
      $('[data-total]').textContent = eur(total);
      $('[data-monthly]').textContent = pay === 'mois' ? `soit ${eur(total * 12.19 / 4999.99)}/mois pendant 41 ans¹` : pay === 'ame' ? 'Paiement avec votre âme : bientôt disponible.' : 'Payé comptant. Courageux.';
      const label = { magma: 'Orange Magma', noir: 'Noir Trou Noir', argent: 'Argent Cryogénique' }[color];
      cname.textContent = label;
      if (img && img.dataset.color !== color) {
        img.style.opacity = 0;
        setTimeout(() => { img.src = `assets/img/phone-${color}.jpg`; img.className = 'z-' + color; img.alt = 'IFone 18 ' + label; img.dataset.color = color; img.style.opacity = 1; }, reduce ? 0 : 250);
      }
      if (tile) tile.classList.toggle('empty', !img || !img.isConnected);
    };
    form.addEventListener('change', update); update();
    form.addEventListener('submit', e => { e.preventDefault(); setBag(parseInt(store.get('ifones-bag') || '0', 10) + 1); toast('Ajouté au panier. Livraison : dès qu’on aura fini l’IFone 19.'); });
    $('[data-think]').addEventListener('click', () => toast('5 minutes, c’est long. Le prix a augmenté de 3 %.'));
  }

  /* ---------- 404 drips ---------- */
  const drips = $('.drips');
  if (drips && !reduce) drips.innerHTML = [18, 31, 47, 63, 79].map((x, i) => `<i style="left:${x}%;animation-delay:${i * .7}s;animation-duration:${3.5 + i * .4}s"></i>`).join('');
})();
