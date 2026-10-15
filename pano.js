// FOTOS 360° — al estilo Insta360:
//  · vista previa: un "tiny planet" que gira solo dentro de la tarjeta
//  · al hacer clic el planeta se despliega y entras en la foto: arrastra para mirar, rueda o pellizco para el zoom
// Un único shader dibuja todas las vistas: `dist` = 0 es la vista normal, `dist` = 1 es el tiny planet
// (proyección estereográfica); entre los dos valores la imagen se transforma de forma continua.
// Las fotos viven en assets/pano/<id>.js — para añadir una nueva: tools/add-pano.sh
(() => {
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  const DEG = Math.PI / 180;
  // zoom = tangente de la mitad del campo de visión vertical
  const VIEWS = {
    planet: { dist: 1, pitch: -90 * DEG, zoom: 2.1 },
    normal: { dist: 0, pitch: 0, zoom: Math.tan(40 * DEG) },
  };
  const ZOOM = { planet: [1.2, 3.6], normal: [Math.tan(15 * DEG), Math.tan(55 * DEG)] };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const VERT = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const FRAG = `
    uniform sampler2D map;
    uniform float yaw, pitch, zoom, dist, aspect;
    varying vec2 vUv;
    #define PI 3.141592653589793
    void main() {
      // pixel → rayo. Los rayos salen de un punto a "dist" detrás del centro de la esfera:
      // 0 = desde el centro (vista normal), 1 = desde el polo opuesto (estereográfica, tiny planet)
      vec2 p = (vUv * 2.0 - 1.0) * vec2(aspect, 1.0) * zoom;
      vec3 d = normalize(vec3(p, -1.0));
      vec3 o = vec3(0.0, 0.0, dist);
      float b = dot(o, d);
      vec3 dir = o + d * (-b + sqrt(b * b - dot(o, o) + 1.0));
      float cp = cos(pitch), sp = sin(pitch);
      dir = vec3(dir.x, dir.y * cp - dir.z * sp, dir.y * sp + dir.z * cp);
      float cy = cos(yaw), sy = sin(yaw);
      dir = normalize(vec3(dir.x * cy - dir.z * sy, dir.y, dir.x * sy + dir.z * cy));
      vec2 uv = vec2(atan(dir.x, -dir.z) / (2.0 * PI) + 0.5, asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5);
      // en la costura de la foto (u pasa de 1 a 0) las derivadas saltan y el mipmap pinta una línea:
      // usamos las derivadas de una u desplazada media vuelta cuando son más pequeñas
      vec2 uv2 = vec2(fract(uv.x + 0.5), uv.y);
      vec2 dx = dFdx(uv), dy = dFdy(uv), dx2 = dFdx(uv2), dy2 = dFdy(uv2);
      if (abs(dx2.x) + abs(dy2.x) < abs(dx.x) + abs(dy.x)) { dx = dx2; dy = dy2; }
      gl_FragColor = textureGrad(map, uv, dx, dy);
    }`;

  /* ---------- carga ---------- */
  let threeP;
  const three = () => (threeP ||= import(THREE_URL));
  const scripts = {};
  const loadScript = src => (scripts[src] ||= new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = ok;
    s.onerror = () => ko(new Error('No se pudo cargar ' + src));
    document.head.append(s);
  }));
  // small = versión ligera (vista previa); si no, la versión grande del visor
  async function loadPano(id, small) {
    await loadScript(`assets/pano/${id}${small ? '.sm' : ''}.js`);
    const img = new Image();
    img.src = (small ? window.PANOS_SM : window.PANOS)[id];
    await img.decode();
    return img;
  }

  // un lienzo WebGL con el shader; draw(estado) pinta la vista pedida
  async function createView(canvas) {
    const THREE = await three();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const uniforms = { map: { value: null }, yaw: { value: 0 }, pitch: { value: 0 }, zoom: { value: 1 }, dist: { value: 0 }, aspect: { value: 1 } };
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, depthTest: false }));
    mesh.frustumCulled = false;
    const scene = new THREE.Scene();
    scene.add(mesh);
    const camera = new THREE.Camera();
    let w = 0, h = 0;
    return {
      setImage(img) {
        uniforms.map.value?.dispose();
        const tex = new THREE.Texture(img);
        tex.wrapS = THREE.RepeatWrapping;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        tex.needsUpdate = true;
        uniforms.map.value = tex;
      },
      draw(s) {
        if (!uniforms.map.value) return;
        if (canvas.clientWidth !== w || canvas.clientHeight !== h) {
          w = canvas.clientWidth;
          h = canvas.clientHeight;
          renderer.setSize(w, h, false);
        }
        if (!w || !h) return;
        uniforms.yaw.value = s.yaw;
        uniforms.pitch.value = s.pitch;
        uniforms.zoom.value = s.zoom;
        uniforms.dist.value = s.dist;
        uniforms.aspect.value = w / h;
        renderer.render(scene, camera);
      },
    };
  }

  /* ---------- vista previa: tiny planet girando ---------- */
  function initPreview(card) {
    const { gsap, site } = window;
    const id = card.dataset.pano;
    const canvas = card.querySelector('canvas');
    const s = { ...VIEWS.planet, yaw: Math.random() * Math.PI * 2, speed: 0.12 };
    let view = null, visible = false, hover = false, started = false;

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!visible || started) return;
      started = true; // la foto se carga cuando la tarjeta se acerca a la pantalla
      Promise.all([createView(canvas), loadPano(id, true)])
        .then(([v, img]) => { v.setImage(img); view = v; card.classList.add('is-ready'); })
        .catch(err => console.warn('360°:', err));
    }, { rootMargin: '300px' }).observe(card);

    card.addEventListener('pointerenter', () => (hover = true));
    card.addEventListener('pointerleave', () => (hover = false));
    card.addEventListener('click', () => open(card, s.yaw));

    gsap.ticker.add((time, dt) => {
      if (!visible || !view) return;
      // al pasar el mouse: gira más rápido y se acerca un poco
      s.speed += ((hover ? 0.55 : 0.12) - s.speed) * 0.05;
      s.zoom += ((hover ? 1.7 : VIEWS.planet.zoom) - s.zoom) * 0.06;
      if (!site.reduce) s.yaw += s.speed * dt / 1000;
      view.draw(s);
    });
  }

  /* ---------- visor a pantalla completa ---------- */
  let viewer = null;

  async function buildViewer() {
    const { gsap, i18n } = window;
    const { t } = i18n;
    const el = document.createElement('div');
    el.className = 'pano-viewer';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', t('pano.dialog'));
    el.innerHTML = `
      <canvas class="pano-canvas" data-cursor="drag"></canvas>
      <i class="osd-c tl"></i><i class="osd-c tr"></i><i class="osd-c bl"></i><i class="osd-c br"></i>
      <p class="pano-info mono"><b>360°</b><span class="pano-title"></span></p>
      <button type="button" class="pano-exit tag-font">${t('pano.exit')}</button>
      <p class="pano-hint mono">${t('pano.hint')}</p>
      <div class="pano-bar">
        <div class="pano-modes" role="group">
          <button type="button" class="mono" data-view="normal">${t('pano.normal')}</button>
          <button type="button" class="mono" data-view="planet">tiny planet</button>
        </div>
        <span class="pano-read mono"></span>
      </div>
      <p class="pano-hd mono">${t('pano.hd')}</p>`;
    document.body.append(el);

    const canvas = el.querySelector('.pano-canvas');
    const v = {
      el, canvas,
      view: await createView(canvas),
      s: { ...VIEWS.planet, yaw: 0 },
      mode: 'planet', open: false, current: null, returnFocus: null,
      vx: 0, vy: 0,
      title: el.querySelector('.pano-title'),
      read: el.querySelector('.pano-read'),
      exit: el.querySelector('.pano-exit'),
      modes: [...el.querySelectorAll('[data-view]')],
    };

    /* controles: arrastrar, inercia, rueda, pellizco, teclado */
    const pointers = new Map();
    let pinch = 0;
    const zoomBy = f => { const [lo, hi] = ZOOM[v.mode]; v.s.zoom = clamp(v.s.zoom * f, lo, hi); };
    const touched = () => el.classList.add('is-touched');

    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, e);
      v.vx = v.vy = 0;
      el.classList.add('is-dragging');
      touched();
    });
    canvas.addEventListener('pointermove', e => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      pointers.set(e.pointerId, e);
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        if (pinch) zoomBy(pinch / d);
        pinch = d;
        return;
      }
      // radianes por píxel según el zoom actual: la foto "se queda pegada" al dedo
      const k = (2 * Math.atan(v.s.zoom)) / canvas.clientHeight;
      v.vx = -(e.clientX - prev.clientX) * k;
      v.vy = v.mode === 'normal' ? (e.clientY - prev.clientY) * k : 0;
      v.s.yaw += v.vx;
      v.s.pitch = clamp(v.s.pitch + v.vy, -85 * DEG, 85 * DEG);
    });
    const release = e => {
      pointers.delete(e.pointerId);
      pinch = 0;
      if (!pointers.size) el.classList.remove('is-dragging');
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('wheel', e => { e.preventDefault(); zoomBy(Math.exp(e.deltaY * 0.0012)); touched(); }, { passive: false });
    canvas.addEventListener('dblclick', () => setMode(v.mode === 'normal' ? 'planet' : 'normal'));

    addEventListener('keydown', e => {
      if (!v.open) return;
      const step = 5 * DEG;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') v.s.yaw -= step;
      else if (e.key === 'ArrowRight') v.s.yaw += step;
      else if (e.key === 'ArrowUp' && v.mode === 'normal') v.s.pitch = clamp(v.s.pitch + step, -85 * DEG, 85 * DEG);
      else if (e.key === 'ArrowDown' && v.mode === 'normal') v.s.pitch = clamp(v.s.pitch - step, -85 * DEG, 85 * DEG);
      else if (e.key === '+' || e.key === '=') zoomBy(0.9);
      else if (e.key === '-') zoomBy(1.1);
      else return;
      touched();
    });

    v.exit.addEventListener('click', close);
    for (const b of v.modes) b.addEventListener('click', () => setMode(b.dataset.view));

    let shown = '';
    gsap.ticker.add((time, dt) => {
      if (!v.open) return;
      if (!pointers.size) {
        // inercia al soltar; en tiny planet, además, sigue girando despacio
        v.s.yaw += v.vx;
        if (v.mode === 'normal') v.s.pitch = clamp(v.s.pitch + v.vy, -85 * DEG, 85 * DEG);
        v.vx *= 0.92;
        v.vy *= 0.92;
        if (v.mode === 'planet' && !window.site.reduce) v.s.yaw += 0.1 * dt / 1000;
      }
      v.view.draw(v.s);
      const deg = Math.round((((v.s.yaw / DEG) % 360) + 360) % 360);
      const text = v.mode === 'planet' ? `↻ ${deg}°` : `↻ ${deg}° · fov ${Math.round((2 * Math.atan(v.s.zoom)) / DEG)}°`;
      if (text !== shown) v.read.textContent = shown = text;
    });
    return v;
  }

  function setMode(mode, duration = 1.1) {
    const { gsap, site } = window;
    viewer.mode = mode;
    const { dist, pitch, zoom } = VIEWS[mode];
    gsap.to(viewer.s, { dist, pitch, zoom, duration: site.reduce ? 0 : duration, ease: 'power3.inOut', overwrite: true });
    for (const b of viewer.modes) b.setAttribute('aria-pressed', b.dataset.view === mode);
  }

  async function open(card, yaw) {
    const { site } = window;
    const id = card.dataset.pano;
    viewer ||= await buildViewer();
    const v = viewer;
    v.current = id;
    v.returnFocus = card;
    v.title.textContent = card.dataset.title || '';
    v.view.setImage(await loadPano(id, true)); // primero la ligera (ya cargada) para abrir al instante
    Object.assign(v.s, VIEWS.planet, { yaw });
    v.mode = 'planet';
    v.vx = v.vy = 0;
    v.open = true;
    v.el.classList.remove('is-touched');
    v.el.classList.add('is-open', 'is-loading-hd');
    document.documentElement.classList.add('pano-open');
    site.lenis?.stop();
    v.exit.focus();
    setMode('normal', 1.6); // el planeta se despliega y entras en la foto
    loadPano(id, false)
      .then(img => { if (v.current === id) v.view.setImage(img); })
      .catch(err => console.warn('360° HD:', err))
      .finally(() => v.el.classList.remove('is-loading-hd'));
  }

  function close() {
    const { gsap, site } = window;
    const v = viewer;
    if (!v?.open) return;
    v.current = null;
    v.mode = 'planet';
    const { dist, pitch, zoom } = VIEWS.planet;
    // vuelve a cerrarse en planeta y se desvanece
    gsap.to(v.s, {
      dist, pitch, zoom, duration: site.reduce ? 0 : 0.7, ease: 'power3.in', overwrite: true,
      onComplete: () => {
        v.open = false;
        v.el.classList.remove('is-open');
        document.documentElement.classList.remove('pano-open');
        site.lenis?.start();
        v.returnFocus?.focus();
      },
    });
  }

  window.initPanos = (root = document) => {
    for (const card of root.querySelectorAll('[data-pano]')) initPreview(card);
  };
})();
