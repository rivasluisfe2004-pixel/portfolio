// Dron 3D: el modelo del DJI Avata 360 (assets/model/avata360.glb, cromado, hecho en Blender).
// Despega con el scroll, gira solo, se inclina hacia el mouse, sus hélices giran y, de vez en cuando,
// el gimbal pasa del modo 360° (objetivos arriba/abajo) al modo de un solo objetivo y vuelve.
// Si el modelo no carga, se usa el dron sencillo hecho con piezas de three.js (buildDrone).
(() => {
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js';
  // necesita el importmap de index.html (resuelve 'three' a la misma URL que THREE_URL)
  const LOADER_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/examples/jsm/loaders/GLTFLoader.js';
  const ACID = '#c6ff3a';
  const GROUND = -0.95;           // altura de la plataforma
  const HOVER = 0.1;              // dron en vuelo estacionario
  const TAU3 = (Math.PI * 2) / 3; // 120°, para las 3 palas

  window.initDrone = async function ({ canvas, stage, osd, reduce }) {
    const { gsap, site } = window;
    const [THREE] = await Promise.all([import(THREE_URL), document.fonts.load('900 100px Unbounded')]);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    scene.environment = window.studioEnv(THREE, renderer);
    scene.environmentIntensity = 1.6;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 1.35, 5.6);
    camera.lookAt(0, -0.2, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-3, 5, 4);
    const back = new THREE.DirectionalLight(0xffffff, 1.6);
    back.position.set(2, 2, -5);
    const glow = new THREE.PointLight(ACID, 10, 4);
    glow.position.set(0, GROUND + 0.1, 0);
    scene.add(key, back, glow);

    const built = await loadAvata(THREE).catch(err => { console.warn('Avata 360 .glb:', err); return null; }) ?? buildDrone(THREE);
    const { drone, props, blurMat, gimbal } = built;
    const LANDED = GROUND + built.lift; // dron posado sobre la plataforma
    scene.add(drone);
    const { pad, shadow } = buildPad(THREE);
    scene.add(pad, shadow);

    /* ---------- tamaño ---------- */
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // en pantallas estrechas alejamos la cámara para que quepa entero
      camera.position.z = w / h < 1 ? 7 : 4.7;
      camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize);

    /* ---------- estado ---------- */
    let visible = false, flight = reduce ? 1 : 0, yaw = 0.6, roll = 0, pitch = 0, mx = 0, my = 0;
    let bat = 100, clock = 0, speed = 0;
    // gimbal: 0 = modo 360° (como el dron real al grabar en 360), π/2 = un solo objetivo mirando al frente
    const cam = { angle: 0 };
    let flyTime = 0, nextSwap = 4, swapping = false;
    // batería baja: a 15 % aterriza sola en la H, espera 10 s, «cambia la batería» y vuelve a despegar
    const auto = { on: false, f: 1 };
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width * 2 - 1;
      my = (e.clientY - r.top) / r.height * 2 - 1;
    });
    stage.addEventListener('pointerleave', () => { mx = my = 0; });
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);

    const out = Object.fromEntries([...osd.querySelectorAll('[data-osd]')].map(el => [el.dataset.osd, el]));
    const horizon = osd.querySelector('.osd-horizon');
    const shown = {};
    const put = (k, v) => { if (shown[k] !== v) out[k].textContent = shown[k] = v; };
    const easeOut = p => 1 - (1 - p) ** 3;

    renderer.compile(scene, camera);
    gsap.ticker.add((time, dt) => {
      if (!visible) return;
      const s = dt / 1000;
      const f = auto.on ? Math.min(auto.f, flight) : flight;
      // girar sobre sí mismo (más rápido en el aire) e inclinarse hacia el mouse, como al volar
      if (!reduce) yaw += s * (0.18 + 0.4 * f);
      roll += (-mx * 0.35 * f - roll) * 0.06;
      pitch += (my * 0.22 * f - pitch) * 0.06;
      const bob = reduce ? 0 : Math.sin(time * 1.7) * 0.05 * f;
      drone.position.y = LANDED + (HOVER - LANDED) * easeOut(f) + bob;
      drone.rotation.set(pitch, yaw, roll);

      // hélices: casi paradas en el suelo, a tope en el aire (y el disco borroso aparece)
      const spin = reduce ? 0 : 3 + 55 * Math.min(1, f * 2.5);
      props.forEach((p, i) => (p.rotation.y += s * spin * (p.userData.dir ?? (i % 3 ? 1 : -1))));
      blurMat.opacity = 0.09 * Math.min(1, f * 2.5);
      // en vuelo, cada ~8-13 s el gimbal cambia de modo y vuelve; además compensa el cabeceo (estabilización)
      if (!reduce && f > 0.9 && !auto.on) {
        flyTime += s;
        if (!swapping && flyTime > nextSwap) swapLens();
      }
      gimbal.rotation.x = cam.angle - pitch;

      // sombra: más pequeña y suave cuanto más alto
      const h = drone.position.y - LANDED;
      shadow.scale.setScalar(1 + h * 0.5);
      shadow.material.opacity = 0.75 - h * 0.45;

      // OSD
      clock += s;
      if (!reduce && !auto.on) bat -= s * 0.2;
      if (bat < 15 && !auto.on) lowBattery();
      speed += (Math.min(Math.abs(site.lenis?.velocity ?? 0) * 4, 99) - speed) * 0.1;
      put('alt', (h * 12).toFixed(1).padStart(5, '0'));
      put('spd', String(Math.round(speed)).padStart(2, '0'));
      put('bat', String(Math.floor(bat)));
      put('time', `${String(Math.floor(clock / 60)).padStart(2, '0')}:${String(Math.floor(clock % 60)).padStart(2, '0')}`);
      horizon.style.transform = `translateY(${pitch * 60}px) rotate(${roll * 57}deg)`;

      renderer.render(scene, camera);
    });

    function setMode(single, force) {
      if (auto.on && !force) return; // durante la batería baja manda el aviso, no el gimbal
      put('mode', window.i18n.t(single ? 'drone.mode1' : 'drone.mode'));
      put('res', single ? '4k' : '8k');
      stage.classList.toggle('is-single', single);
    }
    // gira el gimbal al modo de un objetivo, se queda unos segundos y vuelve al modo 360°
    let swapTl = null;
    function swapLens() {
      swapping = true;
      swapTl = gsap.timeline({ onComplete: () => { swapping = false; nextSwap = flyTime + 8 + Math.random() * 5; } })
        .to(cam, { angle: Math.PI / 2, duration: 1.8, ease: 'power3.inOut' })
        .call(setMode, [true], 0.9)
        .to(cam, { angle: 0, duration: 1.8, ease: 'power3.inOut' }, '+=3.4')
        .call(setMode, [false], '-=0.9');
    }

    function lowBattery() {
      auto.on = true;
      auto.f = flight;
      swapTl?.kill();
      swapping = false;
      stage.classList.remove('is-single');
      put('res', '8k');
      stage.classList.add('is-lowbat');
      put('mode', window.i18n.t('drone.lowbat'));
      gsap.timeline()
        .to(cam, { angle: 0, duration: 0.8, ease: 'power2.out' })                      // gimbal a su posición
        .to(auto, { f: 0, duration: 4, ease: 'power2.inOut' }, 0.6)                     // descenso suave hasta la H
        .call(() => { stage.classList.remove('is-lowbat'); stage.classList.add('is-charging'); put('mode', window.i18n.t('drone.charging')); })
        .to({}, { duration: 10 })                                                        // 10 s posado
        .call(() => { bat = 100; stage.classList.remove('is-charging'); setMode(false, true); })
        .to(auto, { f: 1, duration: 3, ease: 'power2.inOut' })                         // vuelve a despegar
        .call(() => { auto.on = false; nextSwap = flyTime + 4; });
    }

    const setFlight = p => {
      if (!reduce) flight = p;
      stage.classList.toggle('is-flying', flight > 0.9); // esconde el aviso "haz scroll para despegar"
    };
    setFlight(flight);
    return { setFlight };
  };

  /* ---------- el dron: modelo .glb del Avata 360 ---------- */
  // El .glb va dentro de assets/model/avata360.js (base64) para que funcione también con doble clic (file://).
  async function loadAvata(THREE) {
    if (!window.AVATA360_GLB) {
      await new Promise((ok, ko) => {
        const s = document.createElement('script');
        s.src = 'assets/model/avata360.js';
        s.onload = ok;
        s.onerror = () => ko(new Error('no se pudo cargar assets/model/avata360.js'));
        document.head.append(s);
      });
    }
    const { GLTFLoader } = await import(LOADER_URL);
    const bin = Uint8Array.from(atob(window.AVATA360_GLB), c => c.charCodeAt(0));
    const model = (await new GLTFLoader().parseAsync(bin.buffer, '')).scene;

    // mismo tamaño en pantalla que el dron anterior (el modelo viene en metros: 25 cm de ancho)
    const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    model.scale.setScalar(1.95 / size.x);
    const drone = new THREE.Group();
    drone.rotation.order = 'YXZ'; // girar (yaw), luego cabecear (pitch) y alabear (roll)
    drone.add(model);

    // hélices: sentido de giro opuesto por parejas (como en el dron real) + disco borroso para la velocidad
    const blurMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const props = ['FL', 'FR', 'BL', 'BR'].map(k => {
      const p = model.getObjectByName('prop_' + k);
      p.userData.dir = k === 'FL' || k === 'BR' ? 1 : -1;
      // radio real de las palas, medido vértice a vértice en el espacio de la hélice
      // (una caja alineada a los ejes del mundo daba un radio de más y el disco asomaba fuera del aro)
      let r = 0, y = 0, n = 0;
      const v = new THREE.Vector3();
      p.updateWorldMatrix(true, true);
      const inv = p.matrixWorld.clone().invert();
      p.traverse(o => {
        const pos = o.geometry?.attributes?.position;
        if (!pos) return;
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).applyMatrix4(inv);
          r = Math.max(r, Math.hypot(v.x, v.z));
          y += v.y; n++;
        }
      });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(r * 0.97, 48), blurMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.y = n ? y / n : 0;
      p.add(disc);
      return p;
    });
    model.traverse(o => {
      // LEDs en el verde del sitio, sin que el tone mapping los apague
      if (o.material?.name === 'LED') {
        o.material.toneMapped = false;
        o.material.emissive?.set(ACID);
      }
      // cromo un pelín más satinado: reparte los reflejos y se lee plateado (como las latas), no negro
      if (o.material?.name === 'Chrome') o.material.roughness = 0.2;
    });
    const lift = -new THREE.Box3().setFromObject(drone).min.y + 0.01;
    return { drone, props, blurMat, gimbal: model.getObjectByName('gimbal'), lift };
  }

  /* ---------- dron de respaldo, hecho con piezas simples ---------- */
  function buildDrone(THREE) {
    const drone = new THREE.Group();
    drone.rotation.order = 'YXZ'; // girar (yaw), luego cabecear (pitch) y alabear (roll)

    const shell = new THREE.MeshPhysicalMaterial({ color: 0x1d1d1f, roughness: 0.42, metalness: 0.25, clearcoat: 0.7, clearcoatRoughness: 0.35 });
    const shellIn = shell.clone();
    shellIn.side = THREE.DoubleSide;
    const dark = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.75 });
    const chrome = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.15 });
    const led = new THREE.MeshBasicMaterial({ color: ACID, toneMapped: false });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.02, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0 });
    const blurMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });

    const add = (parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0]) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(...pos);
      m.rotation.set(...rot);
      parent.add(m);
      return m;
    };

    // cuerpo: cápsula aplastada de delante (z+) a atrás, con la batería encima
    add(drone, new THREE.CapsuleGeometry(0.26, 0.5, 8, 24), shell, [0, 0, -0.02], [Math.PI / 2, 0, 0]).scale.set(1.15, 1, 0.62);
    add(drone, new THREE.CapsuleGeometry(0.17, 0.32, 6, 20), dark, [0, 0.14, -0.14], [Math.PI / 2, 0, 0]).scale.set(1.1, 1, 0.55);
    add(drone, new THREE.BoxGeometry(0.05, 0.012, 0.42), led, [0, 0.235, -0.14]);

    // 4 conductos con hélice tripala (las protecciones típicas de un cinewhoop)
    const props = [];
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const duct = new THREE.Group();
      duct.position.set(sx * 0.56, 0, sz * 0.5);
      drone.add(duct);
      add(duct, new THREE.CylinderGeometry(0.4, 0.4, 0.15, 48, 1, true), shellIn);
      add(duct, new THREE.TorusGeometry(0.4, 0.028, 12, 56), chrome, [0, 0.075, 0], [Math.PI / 2, 0, 0]);
      add(duct, new THREE.TorusGeometry(0.4, 0.02, 10, 56), led, [0, -0.075, 0], [Math.PI / 2, 0, 0]);
      add(duct, new THREE.CylinderGeometry(0.06, 0.07, 0.08, 20), dark, [0, -0.01, 0]);
      for (let k = 0; k < 3; k++) {
        const a = k * TAU3 + Math.PI / 6;
        add(duct, new THREE.BoxGeometry(0.34, 0.02, 0.035), dark, [Math.cos(a) * 0.2, -0.05, Math.sin(a) * 0.2], [0, -a, 0]);
      }
      const prop = new THREE.Group();
      prop.position.y = 0.04;
      duct.add(prop);
      for (let k = 0; k < 3; k++) {
        const geo = new THREE.BoxGeometry(0.34, 0.006, 0.055).translate(0.17, 0, 0);
        const blade = add(prop, geo, dark, [0, 0, 0], [0.2, k * TAU3, 0]);
        blade.rotation.order = 'YXZ'; // cada pala inclinada sobre su propio eje
      }
      props.push(prop);
      add(duct, new THREE.CircleGeometry(0.37, 48), blurMat, [0, 0.045, 0], [-Math.PI / 2, 0, 0]);
      // brazo que une el conducto al cuerpo
      add(drone, new THREE.BoxGeometry(0.1, 0.07, 0.45), shell, [sx * 0.3, 0, sz * 0.27], [0, Math.atan2(sx, sz), 0]);
    }

    // cámara 360°: cápsula con un objetivo arriba y otro abajo, colgada de un gimbal de un eje
    const gimbal = new THREE.Group();
    gimbal.position.set(0, -0.02, 0.66);
    drone.add(gimbal);
    add(gimbal, new THREE.TorusGeometry(0.15, 0.016, 8, 24, Math.PI), dark, [0, 0, 0], [-Math.PI / 2, 0, 0]);
    add(gimbal, new THREE.CapsuleGeometry(0.095, 0.09, 6, 16), shell);
    for (const dir of [1, -1]) {
      add(gimbal, new THREE.SphereGeometry(0.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass, [0, dir * 0.12, 0], [dir > 0 ? 0 : Math.PI, 0, 0]);
      add(gimbal, new THREE.TorusGeometry(0.072, 0.009, 8, 32), chrome, [0, dir * 0.12, 0], [Math.PI / 2, 0, 0]);
    }

    return { drone, props, blurMat, gimbal, lift: 0.24 };
  }

  /* ---------- plataforma de aterrizaje (H) + sombra ---------- */
  function buildPad(THREE) {
    const S = 512, cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d');
    g.strokeStyle = g.fillStyle = ACID;
    g.lineWidth = 6;
    g.beginPath(); g.arc(S / 2, S / 2, 236, 0, Math.PI * 2); g.stroke();
    g.setLineDash([18, 14]);
    g.lineWidth = 3;
    g.beginPath(); g.arc(S / 2, S / 2, 200, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]);
    for (let a = 0; a < 12; a++) {
      const r = (a / 12) * Math.PI * 2;
      g.beginPath();
      g.moveTo(S / 2 + Math.cos(r) * 236, S / 2 + Math.sin(r) * 236);
      g.lineTo(S / 2 + Math.cos(r) * 252, S / 2 + Math.sin(r) * 252);
      g.stroke();
    }
    g.globalAlpha = 0.85;
    g.font = '900 210px Unbounded';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('H', S / 2, S / 2 + 10);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 2.8),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = GROUND;

    const sc = document.createElement('canvas');
    sc.width = sc.height = 128;
    const sg = sc.getContext('2d');
    const grad = sg.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,.9)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.1, 2.1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = GROUND + 0.01;
    return { pad, shadow };
  }
})();
