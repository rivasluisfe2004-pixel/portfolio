// Latas de spray 3D — una por disciplina.
// Hover: la lata sube, gira y la tapa brilla. Click: lleva a su capítulo.
// Script normal (no módulo) para que la web también funcione abriendo index.html con doble clic.
(() => {
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  const ACID = '#c6ff3a', INK = '#f1f1ec', BLACK = '#0b0b0b';
  const TURN = Math.PI * 2;

  // id = ancla del capítulo en el HTML · label = texto de la etiqueta en cada idioma
  const CANS = [
    { id: 'web',     num: '01', label: 'web',                                          band: BLACK, text: INK,   accent: ACID,  cap: ACID },
    { id: 'grafico', num: '02', label: { es: 'gráfico', fr: 'graphisme', en: 'graphic' }, band: ACID, text: BLACK, accent: BLACK, cap: 'chrome' },
    { id: 'video',   num: '03', label: { es: 'video', fr: 'vidéo', en: 'video' },       band: INK,   text: BLACK, accent: BLACK, cap: BLACK },
    { id: 'dron',    num: '04', label: { es: 'dron', fr: 'drone', en: 'drone' },        band: BLACK, text: ACID,  accent: ACID,  cap: INK, stripes: true },
  ];
  // posición de cada lata dentro del grupo: [x, y, z, inclinación]
  const SPOTS = [[-1.35, -0.05, 0, 0.16], [-0.45, 0.2, 0.35, -0.05], [0.45, -0.12, 0.1, 0.1], [1.35, 0.1, 0.3, -0.17]];

  // Silueta de la lata (radio, altura) que se "tornea" alrededor del eje Y
  const PROFILE = [
    [0, 0], [0.33, 0], [0.355, 0.015], [0.36, 0.05], [0.36, 1.55],
    [0.35, 1.6], [0.3, 1.7], [0.2, 1.8], [0.12, 1.84], [0.1, 1.9],
  ];

  window.initCans = async function ({ canvas, area, reduce, onHover, onPick }) {
    const { gsap, i18n } = window;
    // three.js desde el CDN + las fuentes con las que se dibujan las etiquetas
    const [THREE] = await Promise.all([
      import(THREE_URL),
      document.fonts.load('900 100px Unbounded'),
      document.fonts.load('500 20px "JetBrains Mono"'),
    ]);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    scene.environment = studioEnv(THREE, renderer);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 10);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(-3, 4, 6);
    const neon = new THREE.PointLight(ACID, 25, 10);
    neon.position.set(3, 0.5, 2.5);
    scene.add(key, neon);

    const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.13 });
    const bodyGeo = new THREE.LatheGeometry(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), 64);
    // thetaStart = π → el centro de la textura (u = 0.5) queda mirando a cámara
    const bandGeo = new THREE.CylinderGeometry(0.364, 0.364, 1, 64, 1, true, Math.PI);
    const capGeo = new THREE.CylinderGeometry(0.34, 0.362, 0.5, 64);

    const rig = new THREE.Group();
    scene.add(rig);

    const cans = CANS.map((c, i) => {
      const inner = new THREE.Group();
      inner.position.y = -1.03; // pivote en el centro de la lata
      const band = new THREE.Mesh(bandGeo, new THREE.MeshStandardMaterial({ map: labelTexture(THREE, c, i18n.tr(c.label), renderer), roughness: 0.45 }));
      band.position.y = 0.95;
      const capMat = c.cap === 'chrome'
        ? new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.13, emissive: ACID, emissiveIntensity: 0 })
        : new THREE.MeshPhysicalMaterial({ color: c.cap, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1, emissive: ACID, emissiveIntensity: 0 });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 1.81;
      inner.add(new THREE.Mesh(bodyGeo, chrome), band, cap);

      const [x, y, z, tilt] = SPOTS[i];
      const can = new THREE.Group();
      can.add(inner);
      can.position.set(x, y, z);
      can.rotation.z = tilt;
      can.userData = { ...c, baseY: y, lift: 0, drop: reduce ? 0 : 6, spin: 0, capMat };
      rig.add(can);
      return can;
    });

    /* ---------- interacción ---------- */
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hovered = null;

    const canOf = o => { while (o && !o.userData.id) o = o.parent; return o ?? null; };
    const pick = e => {
      if (e.target.closest('a, button')) return null; // encima de un link HTML, manda el link
      const r = canvas.getBoundingClientRect();
      ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return canOf(ray.intersectObjects(cans, true)[0]?.object);
    };

    function setHover(can) {
      if (can === hovered) return;
      if (hovered) {
        gsap.to(hovered.userData, { lift: 0, duration: 0.6, ease: 'power3.out' });
        gsap.to(hovered.userData.capMat, { emissiveIntensity: 0, duration: 0.4 });
      }
      hovered = can;
      if (can) {
        const u = can.userData;
        gsap.to(u, { lift: 1, duration: 0.6, ease: 'power3.out' });
        // vuelta completa, siempre termina con la etiqueta de frente
        if (!reduce) gsap.to(u, { spin: Math.round(u.spin / TURN) * TURN + TURN, duration: 1.3, ease: 'expo.out' });
        gsap.to(u.capMat, { emissiveIntensity: 0.7, duration: 0.4 });
      }
      onHover(can ? can.userData.id : null);
    }

    area.addEventListener('pointermove', e => setHover(pick(e)));
    area.addEventListener('pointerleave', () => setHover(null));
    area.addEventListener('click', e => {
      const can = pick(e);
      if (can) onPick(can.userData.id);
    });

    /* ---------- tamaño / encuadre ---------- */
    let baseX = 0, baseY = 0;
    function resize() {
      const w = area.clientWidth, h = area.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const vw = vh * camera.aspect;
      const portrait = camera.aspect < 0.9;
      rig.scale.setScalar(portrait ? Math.min(1, vw / 4.3) : Math.min(1, vw / 8.2));
      baseX = portrait ? 0 : vw * 0.24;
      baseY = portrait ? -vh * 0.2 : -0.15;
    }
    resize();
    addEventListener('resize', resize);

    /* ---------- bucle ---------- */
    let visible = true, scrollP = 0, mx = 0, my = 0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; });
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(area);

    renderer.compile(scene, camera);
    gsap.ticker.add(time => {
      if (!visible) return;
      const t = reduce ? 0 : time;
      rig.rotation.y += (mx * 0.3 - rig.rotation.y) * 0.06;
      rig.rotation.x += (my * 0.12 - rig.rotation.x) * 0.06;
      rig.rotation.z = scrollP * -0.4;
      rig.position.set(baseX, baseY + scrollP * 3, scrollP * -2);
      cans.forEach((can, i) => {
        const u = can.userData;
        can.position.y = u.baseY + Math.sin(t * 1.2 + i * 1.9) * 0.07 + u.lift * 0.28 + u.drop;
        can.rotation.y = Math.sin(t * 0.5 + i * 2) * 0.28 + u.spin;
      });
      renderer.render(scene, camera);
    });

    return {
      intro() {
        cans.forEach((c, i) => gsap.to(c.userData, { drop: 0, duration: 1.6, delay: i * 0.1, ease: 'elastic.out(1, 0.55)' }));
      },
      setScroll(p) { scrollP = p; },
      highlight(id) { setHover(cans.find(c => c.userData.id === id) ?? null); },
    };
  };

  // Estudio falso para que el cromo tenga algo que reflejar: negro + tiras de luz (una verde neón).
  // Lo usa también drone.js.
  function studioEnv(THREE, renderer) {
    const env = new THREE.Scene();
    const strip = (hex, power, pos, w, h) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(power), side: THREE.DoubleSide }),
      );
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    // tiras verticales = los reflejos verticales típicos de una lata cromada
    strip('#ffffff', 6, [0, 6, 3], 10, 1.5);
    strip('#ffffff', 4, [-6, 0.5, 3], 1.2, 9);
    strip('#ffffff', 3, [-3, 0, 7], 1.5, 8);
    strip('#ffffff', 2.5, [2.5, 1, 7], 1, 8);
    strip('#ffffff', 2, [0, -5, 4], 10, 2);
    strip(ACID, 6, [6, 0, 1.5], 1.5, 9);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const tex = pmrem.fromScene(env, 0.02).texture;
    pmrem.dispose();
    return tex;
  }
  window.studioEnv = studioEnv;

  // Etiqueta de la lata dibujada en un canvas 2D (1024×448 = proporción del cilindro desenrollado)
  function labelTexture(THREE, c, label, renderer) {
    const W = 1024, H = 448;
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const g = cv.getContext('2d');
    g.fillStyle = c.band;
    g.fillRect(0, 0, W, H);

    if (c.stripes) {
      // parte trasera: franjas de precaución
      g.fillStyle = ACID;
      for (let x = -H; x < W; x += 64) {
        g.beginPath();
        g.moveTo(x, 0); g.lineTo(x + 30, 0); g.lineTo(x + 30 + H, H); g.lineTo(x + H, H);
        g.fill();
      }
    } else {
      // parte trasera: la palabra repetida, tenue
      g.fillStyle = c.text;
      g.globalAlpha = 0.14;
      g.font = '900 54px Unbounded';
      g.textBaseline = 'middle';
      for (let row = 0; row < 6; row++)
        for (let x = (row % 2) * -130; x < W; x += 260) g.fillText(label, x, 40 + row * 74);
      g.globalAlpha = 1;
    }

    // frente: panel limpio en el tercio central
    const fw = W * 0.34;
    g.fillStyle = c.band;
    g.fillRect((W - fw) / 2, 0, fw, H);
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    g.fillStyle = c.accent;
    g.font = '500 20px "JetBrains Mono"';
    g.fillText('MMI — 2026', W / 2, 54);
    g.fillStyle = c.text;
    g.font = '900 150px Unbounded';
    g.fillText(c.num, W / 2, 210);
    g.font = '900 62px Unbounded';
    const fit = Math.min(1, (fw - 40) / g.measureText(label).width);
    g.font = `900 ${62 * fit}px Unbounded`;
    g.fillText(label, W / 2, 290);
    g.fillStyle = c.accent;
    g.fillRect(W / 2 - 120, 326, 240, 5);
    g.font = '500 18px "JetBrains Mono"';
    g.fillText('luis rivas · 400 ml', W / 2, 372);

    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }
})();
