// IDIOMAS — todos los textos de la interfaz viven aquí, con sus 3 versiones juntas.
// REGLA: si cambias una frase, cambia las tres (es / fr / en).
// Marcas dentro de los textos:  {{palabra}} = brochazo verde · [[palabra]] = círculo dibujado · \n = salto de línea
// Los textos de los proyectos están en projects.js (mismo sistema).
(() => {
  const LANGS = ['es', 'fr', 'en'];
  const NAMES = { es: 'español', fr: 'français', en: 'english' };

  const T = {
    'meta.title':      { es: 'Luis Rivas — Portfolio', fr: 'Luis Rivas — Portfolio', en: 'Luis Rivas — Portfolio' },
    'meta.desc':       { es: 'Portfolio de Luis Rivas: diseño gráfico, web/UI, video, motion design y dron.',
                         fr: 'Portfolio de Luis Rivas : graphisme, web/UI, vidéo, motion design et drone.',
                         en: 'Luis Rivas’ portfolio: graphic design, web/UI, video, motion design and drone.' },
    'lang.label':      { es: 'Idioma', fr: 'Langue', en: 'Language' },

    'loader.word':     { es: 'Cargando', fr: 'loading', en: 'loading' },
    'loader.txt':      { es: 'cargando el archivo —', fr: 'chargement des archives —', en: 'loading the archive —' },

    'nav.work':        { es: 'trabajo', fr: 'projets', en: 'work' },
    'nav.about':       { es: 'sobre mí', fr: 'à propos', en: 'about' },
    'nav.contact':     { es: 'contacto', fr: 'contact', en: 'contact' },
    'nav.status':      { es: 'busco stage · 12 abr → 16 jun 2027', fr: 'recherche de stage · 12 avr → 16 juin 2027', en: 'looking for an internship · 12 apr → 16 jun 2027' },

    'hero.meta':       { es: 'gráfico · UI · video · dron', fr: 'graphisme · UI · vidéo · drone', en: 'graphic · UI · video · drone' },
    'hero.tag':        { es: 'multimedia', fr: 'multimédia', en: 'multimedia' },
    'hero.hint':       { es: 'elige una lata', fr: 'choisissez une bombe', en: 'pick a can' },
    'hero.paint':      { es: 'mueve el mouse para pintar', fr: 'bougez la souris pour peindre', en: 'move your mouse to paint' },
    'hero.sticker':    { es: '★ busco stage · abr–jun 2027', fr: '★ cherche stage · avr–juin 2027', en: '★ internship · apr–jun 2027' },

    'cat.web':         { es: 'web', fr: 'web', en: 'web' },
    'cat.grafico':     { es: 'gráfico', fr: 'graphisme', en: 'graphic' },
    'cat.video':       { es: 'video', fr: 'vidéo', en: 'video' },
    'cat.dron':        { es: 'dron', fr: 'drone', en: 'drone' },

    'tape.a':          { es: 'web ✦ gráfico ✦ video ✦ motion ✦ dron ✦ ', fr: 'web ✦ graphisme ✦ vidéo ✦ motion ✦ drone ✦ ', en: 'web ✦ graphic ✦ video ✦ motion ✦ drone ✦ ' },
    'tape.b':          { es: 'salvadoreño en Francia ✦ BUT MMI · IUT de Chambéry ✦ español · français · english ✦ ',
                         fr: 'salvadorien en France ✦ BUT MMI · IUT de Chambéry ✦ español · français · english ✦ ',
                         en: 'Salvadoran in France ✦ BUT MMI · IUT de Chambéry ✦ español · français · english ✦ ' },

    'intro.text':      { es: 'Soy Luis — salvadoreño, estudiante de MMI en Francia. Todavía no elijo una sola especialidad porque me gustan [[todas]]: diseño, programo, edito y vuelo drones. Una {{herramienta multiusos}} para tu equipo.',
                         fr: 'Moi, c’est Luis — Salvadorien, étudiant en MMI en France. Je n’ai pas encore choisi une seule spécialité, parce que je les aime [[toutes]] : je conçois, je code, je monte et je pilote des drones. Un vrai {{couteau suisse}} pour votre équipe.',
                         en: 'I’m Luis — Salvadoran, studying MMI in France. I haven’t picked a single specialty yet because I love [[all of them]]: I design, code, edit and fly drones. A true {{multi-tool}} for your team.' },

    'work.title':      { es: 'trabajo', fr: 'projets', en: 'work' },
    'work.tabs':       { es: 'Disciplinas', fr: 'Disciplines', en: 'Disciplines' },
    'ch.web':          { es: 'sitios · interfaces · UX\ndel análisis al código', fr: 'sites · interfaces · UX\nde l’analyse au code', en: 'sites · interfaces · UX\nfrom analysis to code' },
    'ch.grafico':      { es: 'identidad · carteles · pictogramas\npegados en la pared →', fr: 'identité · affiches · pictos\ncollés au mur →', en: 'identity · posters · icons\npasted on the wall →' },
    'ch.video':        { es: 'montaje · motion · tiempo real\ndale play', fr: 'montage · motion · temps réel\nappuyez sur play', en: 'editing · motion · real-time\nhit play' },
    'ch.dron':         { es: 'vuelos · 360° · FPV muy pronto\ndespegando ↑', fr: 'vols · 360° · FPV très bientôt\ndécollage ↑', en: 'flights · 360° · FPV coming soon\ntaking off ↑' },

    'lab.label':       { es: 'motion lab — nuevo', fr: 'motion lab — nouveau', en: 'motion lab — new' },
    'lab.text':        { es: 'Me estoy metiendo de lleno en el {{motion design}}. Primer terreno: portadas de álbum animadas — separo la imagen en capas y le doy profundidad con un efecto parallax.',
                         fr: 'Je me lance à fond dans le {{motion design}}. Premier terrain de jeu : des pochettes d’album animées — je découpe l’image en calques et je lui donne de la profondeur avec un effet de parallaxe.',
                         en: 'I’m diving into {{motion design}}. First playground: animated album covers — I split the artwork into layers and give it depth with a parallax effect.' },
    'lab.hint':        { es: '↖ pasa el mouse por la portada', fr: '↖ survolez la pochette', en: '↖ hover the cover' },
    'lab.link':        { es: 'ver el proyecto →', fr: 'voir le projet →', en: 'see the project →' },
    'lab.alt':         { es: 'Portada Sayonara animada en capas: un personaje de espaldas en un parque de atracciones en ruinas y en llamas', fr: 'Pochette Sayonara animée en calques : un personnage de dos dans un parc d’attractions en ruines et en flammes', en: 'Sayonara cover animated in layers: a figure seen from behind in a ruined, burning amusement park' },

    'drone.mode':      { es: 'modo 360°', fr: 'mode 360°', en: '360° mode' },
    'drone.mode1':     { es: 'modo 1 lente', fr: 'mode 1 objectif', en: 'single-lens mode' },
    'drone.flight':    { es: 'vuelo', fr: 'vol', en: 'flight' },
    'drone.soon':      { es: 'próximamente', fr: 'bientôt', en: 'coming soon' },
    'drone.scroll':    { es: 'haz scroll para despegar', fr: 'scrollez pour décoller', en: 'scroll to take off' },

    'about.title':     { es: 'sobre mí', fr: 'à propos', en: 'about' },
    'about.label':     { es: '(05) — quién soy', fr: '(05) — qui je suis', en: '(05) — who I am' },
    'about.lead':      { es: 'hola, soy {{Luis Rivas}}', fr: 'salut, moi c’est {{Luis Rivas}}', en: 'hi, I’m {{Luis Rivas}}' },
    'about.bio':       { es: 'Salvadoreño, estudiante de BUT MMI en el IUT de Chambéry. Me muevo entre el diseño gráfico, las interfaces, el video y los drones — y ahora me estoy metiendo de lleno en el motion design. Antes de diseñar una respuesta, me gusta entender bien el problema.',
                         fr: 'Salvadorien, étudiant en BUT MMI à l’IUT de Chambéry. Je navigue entre le graphisme, les interfaces, la vidéo et le drone — et je me lance maintenant à fond dans le motion design. Avant de dessiner une réponse, j’aime bien comprendre le problème.',
                         en: 'Salvadoran, studying BUT MMI at the IUT de Chambéry. I move between graphic design, interfaces, video and drones — and I’m now diving into motion design. Before designing an answer, I like to really understand the problem.' },
    'about.photo':     { es: '[ tu foto — estilo calle ]', fr: '[ ta photo — style street ]', en: '[ your photo — street style ]' },
    'about.tools':     { es: 'herramientas — arrástralas ✦', fr: 'outils — déplacez-les ✦', en: 'tools — drag them around ✦' },
    'about.skills':    { es: 'lo que aporto', fr: 'ce que j’apporte', en: 'what I bring' },
    'skill.1':         { es: 'autonomía', fr: 'autonomie', en: 'autonomy' },
    'skill.2':         { es: 'ingenio', fr: 'débrouillardise', en: 'resourcefulness' },
    'skill.3':         { es: 'adaptabilidad', fr: 'adaptabilité', en: 'adaptability' },
    'skill.4':         { es: 'trabajo en equipo', fr: 'esprit d’équipe', en: 'team spirit' },
    'info.study':      { es: 'estudios', fr: 'études', en: 'studies' },
    'info.study.v':    { es: 'BUT MMI · 2º año — IUT de Chambéry (Le Bourget-du-Lac)', fr: 'BUT MMI · 2e année — IUT de Chambéry (Le Bourget-du-Lac)', en: 'BUT MMI · 2nd year — IUT de Chambéry (Le Bourget-du-Lac)' },
    'info.from':       { es: 'de', fr: 'origine', en: 'from' },
    'info.from.v':     { es: 'El Salvador → Francia', fr: 'Salvador → France', en: 'El Salvador → France' },
    'info.langs':      { es: 'idiomas', fr: 'langues', en: 'languages' },
    'info.seek':       { es: 'busco', fr: 'je cherche', en: 'looking for' },
    'info.seek.v':     { es: 'stage de 2 meses · 12 abr → 16 jun 2027', fr: 'stage de 2 mois · 12 avr → 16 juin 2027', en: '2-month internship · 12 apr → 16 jun 2027' },

    'contact.label':   { es: '(07) — contacto', fr: '(07) — contact', en: '(07) — contact' },
    'contact.title':   { es: 'hablemos', fr: 'parlons-en', en: 'let’s talk' },
    'contact.tag':     { es: '¿un café?', fr: 'un café ?', en: 'coffee?' },
    'contact.cv':      { es: 'descargar cv ↓', fr: 'télécharger le cv ↓', en: 'download cv ↓' },

    'footer.made':     { es: 'hecho con html, css, js, three.js y gsap', fr: 'fait avec html, css, js, three.js et gsap', en: 'built with html, css, js, three.js and gsap' },
    'footer.legal':    { es: 'aviso legal', fr: 'mentions légales', en: 'legal notice' },
    'top.label':       { es: 'Volver arriba', fr: 'Revenir en haut', en: 'Back to top' },
    'footer.top':      { es: 'volver arriba ↑', fr: 'haut de page ↑', en: 'back to top ↑' },

    'hud.home':        { es: 'inicio', fr: 'accueil', en: 'home' },
    'hud.intro':       { es: 'intro', fr: 'intro', en: 'intro' },
    'hud.web':         { es: '01 — web', fr: '01 — web', en: '01 — web' },
    'hud.grafico':     { es: '02 — gráfico', fr: '02 — graphisme', en: '02 — graphic' },
    'hud.video':       { es: '03 — video', fr: '03 — vidéo', en: '03 — video' },
    'hud.dron':        { es: '04 — dron', fr: '04 — drone', en: '04 — drone' },
    'hud.about':       { es: 'sobre mí', fr: 'à propos', en: 'about' },
    'hud.contact':     { es: 'contacto', fr: 'contact', en: 'contact' },

    'cursor.view':     { es: 'ver', fr: 'voir', en: 'view' },
    'cursor.open':     { es: 'abrir', fr: 'ouvrir', en: 'open' },
    'cursor.play':     { es: 'play', fr: 'play', en: 'play' },
    'cursor.drag':     { es: 'arrastra', fr: 'glissez', en: 'drag' },
    'cursor.write':    { es: 'escribe', fr: 'écrivez', en: 'write' },
    'cursor.move':     { es: 'mueve', fr: 'bougez', en: 'move' },
    'cursor.enter':    { es: 'entrar', fr: 'entrer', en: 'enter' },

    'ph.screenshot':   { es: '[ captura ]', fr: '[ capture ]', en: '[ screenshot ]' },
    'ph.image':        { es: '[ imagen', fr: '[ image', en: '[ image' },
    'ph.video':        { es: '[ video editado — muy pronto ]', fr: '[ vidéo montée — très bientôt ]', en: '[ edited video — very soon ]' },

    // fotos 360° (pano.js)
    'pano.enter':      { es: 'entra', fr: 'entrez', en: 'step in' },
    'pano.open':       { es: 'Abrir la foto 360°', fr: 'Ouvrir la photo 360°', en: 'Open the 360° photo' },
    'pano.dialog':     { es: 'Visor de foto 360°', fr: 'Visionneuse photo 360°', en: '360° photo viewer' },
    'pano.exit':       { es: 'salir ✕', fr: 'sortir ✕', en: 'exit ✕' },
    'pano.normal':     { es: 'vista normal', fr: 'vue normale', en: 'normal view' },
    'pano.hint':       { es: 'arrastra para mirar · rueda o pellizca para el zoom · doble clic: cambia de vista', fr: 'glissez pour regarder · molette ou pincement pour zoomer · double-clic : changer de vue', en: 'drag to look around · scroll or pinch to zoom · double-click: switch view' },
    'pano.hd':         { es: 'cargando HD…', fr: 'chargement HD…', en: 'loading HD…' },

    'case.back':       { es: 'volver al archivo', fr: 'retour aux projets', en: 'back to work' },
    'case.project':    { es: 'proyecto', fr: 'projet', en: 'project' },
    'case.context':    { es: 'contexto', fr: 'contexte', en: 'context' },
    'case.role':       { es: 'rol', fr: 'rôle', en: 'role' },
    'case.team':       { es: 'equipo', fr: 'équipe', en: 'team' },
    'case.tools':      { es: 'herramientas', fr: 'outils', en: 'tools' },
    'case.software':   { es: 'software', fr: 'logiciels', en: 'software' },
    'cmp.before':      { es: 'antes', fr: 'avant', en: 'before' },
    'cmp.after':       { es: 'después', fr: 'après', en: 'after' },
    'cmp.label':       { es: 'Comparar antes y después', fr: 'Comparer avant et après', en: 'Compare before and after' },
    'yt.play':         { es: 'Reproducir el video en YouTube', fr: 'Lire la vidéo sur YouTube', en: 'Play the video on YouTube' },
    'yt.note':         { es: 'YouTube · 4K', fr: 'YouTube · 4K', en: 'YouTube · 4K' },
    'yt.link':         { es: 'ver en YouTube en 4K', fr: 'voir sur YouTube en 4K', en: 'watch on YouTube in 4K' },
    'drone.lowbat':    { es: 'batería baja · aterrizando', fr: 'batterie faible · atterrissage', en: 'low battery · landing' },
    'drone.charging':  { es: 'cambiando batería', fr: 'changement de batterie', en: 'swapping battery' },
    'lb.label':        { es: 'Visor de fotos', fr: 'Visionneuse photos', en: 'Photo viewer' },
    'lb.prev':         { es: 'Foto anterior', fr: 'Photo précédente', en: 'Previous photo' },
    'lb.next':         { es: 'Foto siguiente', fr: 'Photo suivante', en: 'Next photo' },
    'case.next':       { es: 'siguiente proyecto', fr: 'projet suivant', en: 'next project' },
    'case.more':       { es: '[más detalles muy pronto]', fr: '[plus de détails très bientôt]', en: '[more details very soon]' },

    // preguntas rápidas (también salen como datos estructurados FAQPage para Google y las IA)
    'faq.title':       { es: 'preguntas rápidas', fr: 'questions rapides', en: 'quick questions' },
    'faq.label':       { es: '(06) — faq', fr: '(06) — faq', en: '(06) — faq' },
    'faq.q1':          { es: '¿Quién es Luis Rivas?', fr: 'Qui est Luis Rivas ?', en: 'Who is Luis Rivas?' },
    'faq.a1':          { es: 'Un estudiante salvadoreño de BUT MMI (Métiers du Multimédia et de l’Internet) en el IUT de Chambéry, en Francia. Perfil multidisciplinar: diseño gráfico, UI, video, motion design y dron.',
                         fr: 'Un étudiant salvadorien en BUT MMI (Métiers du Multimédia et de l’Internet) à l’IUT de Chambéry, en France. Profil pluridisciplinaire : graphisme, UI, vidéo, motion design et drone.',
                         en: 'A Salvadoran student in the BUT MMI (Métiers du Multimédia et de l’Internet) at the IUT de Chambéry, France. A multidisciplinary profile: graphic design, UI, video, motion design and drone.' },
    'faq.q2':          { es: '¿Qué sabe hacer?', fr: 'Que sait-il faire ?', en: 'What can he do?' },
    'faq.a2':          { es: 'Identidad visual y carteles (Illustrator, Photoshop), maquetas UI (Figma), sitios web (HTML, CSS, JavaScript, PHP/SQL), montaje y motion design (Premiere Pro, After Effects, DaVinci Resolve), instalaciones interactivas (TouchDesigner) y vuelo y edición 360° con dron (DJI Avata 360).',
                         fr: 'Identité visuelle et affiches (Illustrator, Photoshop), maquettes UI (Figma), sites web (HTML, CSS, JavaScript, PHP/SQL), montage et motion design (Premiere Pro, After Effects, DaVinci Resolve), installations interactives (TouchDesigner), pilotage et montage 360° en drone (DJI Avata 360).',
                         en: 'Visual identity and posters (Illustrator, Photoshop), UI mockups (Figma), websites (HTML, CSS, JavaScript, PHP/SQL), editing and motion design (Premiere Pro, After Effects, DaVinci Resolve), interactive installations (TouchDesigner) and 360° drone flying and editing (DJI Avata 360).' },
    'faq.q3':          { es: '¿Qué busca?', fr: 'Que recherche-t-il ?', en: 'What is he looking for?' },
    'faq.a3':          { es: 'Un stage de 2 meses, del 12 de abril al 16 de junio de 2027, en diseño gráfico, UI, video o motion design.',
                         fr: 'Un stage de 2 mois, du 12 avril au 16 juin 2027, en graphisme, UI, vidéo ou motion design.',
                         en: 'A 2-month internship, from 12 April to 16 June 2027, in graphic design, UI, video or motion design.' },
    'faq.q4':          { es: '¿En qué idiomas trabaja?', fr: 'Dans quelles langues travaille-t-il ?', en: 'Which languages does he work in?' },
    'faq.a4':          { es: 'Español (lengua materna), francés e inglés.', fr: 'Espagnol (langue maternelle), français et anglais.', en: 'Spanish (native), French and English.' },
    'faq.q5':          { es: '¿Cómo contactarlo?', fr: 'Comment le contacter ?', en: 'How can I contact him?' },
    'faq.a5':          { es: 'Por email en rivasluisfe2004@gmail.com, o por LinkedIn e Instagram.', fr: 'Par e-mail à rivasluisfe2004@gmail.com, ou via LinkedIn et Instagram.', en: 'By email at rivasluisfe2004@gmail.com, or through LinkedIn and Instagram.' },

    // aviso legal / mentions légales (legal.html)
    'legal.title':     { es: 'aviso legal', fr: 'mentions légales', en: 'legal notice' },
    'legal.editor.h':  { es: 'Editor del sitio', fr: 'Éditeur du site', en: 'Site publisher' },
    'legal.editor.p':  { es: 'Luis Rivas — estudiante de BUT MMI en el IUT de Chambéry (Francia).\nContacto: rivasluisfe2004@gmail.com',
                         fr: 'Luis Rivas — étudiant en BUT MMI à l’IUT de Chambéry (France).\nContact : rivasluisfe2004@gmail.com',
                         en: 'Luis Rivas — BUT MMI student at the IUT de Chambéry (France).\nContact: rivasluisfe2004@gmail.com' },
    'legal.host.h':    { es: 'Alojamiento', fr: 'Hébergement', en: 'Hosting' },
    'legal.host.p':    { es: 'GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, Estados Unidos.',
                         fr: 'GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.',
                         en: 'GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States.' },
    'legal.ip.h':      { es: 'Propiedad intelectual', fr: 'Propriété intellectuelle', en: 'Intellectual property' },
    'legal.ip.p':      { es: 'Salvo que se indique lo contrario, los textos, imágenes, videos y diseños de este sitio son de Luis Rivas. Los proyectos de equipo mencionan a cada participante. Queda prohibida cualquier reproducción sin autorización previa. Las marcas citadas (DJI, Adobe, Figma…) pertenecen a sus propietarios.',
                         fr: 'Sauf mention contraire, les textes, images, vidéos et créations de ce site appartiennent à Luis Rivas. Les projets d’équipe mentionnent chaque participant. Toute reproduction sans autorisation préalable est interdite. Les marques citées (DJI, Adobe, Figma…) appartiennent à leurs propriétaires.',
                         en: 'Unless stated otherwise, the texts, images, videos and designs on this site belong to Luis Rivas. Team projects credit every participant. Any reproduction without prior permission is prohibited. The brands mentioned (DJI, Adobe, Figma…) belong to their owners.' },
    'legal.data.h':    { es: 'Datos personales y cookies', fr: 'Données personnelles et cookies', en: 'Personal data & cookies' },
    'legal.data.p':    { es: 'Este sitio no usa cookies, ni medición de audiencia, ni formularios: no recoge ningún dato personal. Tu navegador solo guarda el idioma elegido (localStorage) y el estado de las transiciones (sessionStorage); esa información nunca sale de tu dispositivo. Los videos de YouTube solo se cargan cuando pulsas play (desde youtube-nocookie.com); a partir de ese momento se aplica la política de privacidad de YouTube. Las tipografías están alojadas en el propio sitio; las librerías de animación y 3D (GSAP, Lenis, three.js) se cargan desde la CDN jsDelivr, que recibe tu dirección IP para poder enviarte los archivos. Para cualquier pregunta sobre tus datos (RGPD): rivasluisfe2004@gmail.com.',
                         fr: 'Ce site n’utilise ni cookies, ni mesure d’audience, ni formulaire : il ne collecte aucune donnée personnelle. Votre navigateur enregistre seulement la langue choisie (localStorage) et l’état des transitions (sessionStorage) ; ces informations ne quittent jamais votre appareil. Les vidéos YouTube ne se chargent que lorsque vous appuyez sur lecture (depuis youtube-nocookie.com) ; la politique de confidentialité de YouTube s’applique alors. Les polices sont hébergées sur le site ; les bibliothèques d’animation et de 3D (GSAP, Lenis, three.js) sont chargées depuis le CDN jsDelivr, qui reçoit votre adresse IP pour vous envoyer les fichiers. Pour toute question sur vos données (RGPD) : rivasluisfe2004@gmail.com.',
                         en: 'This site uses no cookies, no analytics and no forms: it collects no personal data. Your browser only stores the chosen language (localStorage) and the transition state (sessionStorage); this information never leaves your device. YouTube videos only load when you press play (from youtube-nocookie.com); YouTube’s privacy policy then applies. Fonts are hosted on the site itself; the animation and 3D libraries (GSAP, Lenis, three.js) load from the jsDelivr CDN, which receives your IP address in order to send you the files. For any question about your data (GDPR): rivasluisfe2004@gmail.com.' },
    'legal.image.h':   { es: 'Derecho a la imagen', fr: 'Droit à l’image', en: 'Image rights' },
    'legal.image.p':   { es: 'Algunas fotos y videos muestran a personas (por ejemplo, durante la exposición E-LLUSION). Si apareces en una imagen y quieres que se retire, escríbeme y la quitaré lo antes posible.',
                         fr: 'Certaines photos et vidéos montrent des personnes (par exemple pendant l’exposition E-LLUSION). Si vous apparaissez sur une image et souhaitez son retrait, écrivez-moi : je la retirerai au plus vite.',
                         en: 'Some photos and videos show people (for example during the E-LLUSION exhibition). If you appear in an image and would like it removed, write to me and I will take it down as soon as possible.' },
    'legal.credits.h': { es: 'Créditos', fr: 'Crédits', en: 'Credits' },
    'legal.credits.p': { es: 'Tipografías: Unbounded, Sedgwick Ave Display, JetBrains Mono y Manrope (SIL Open Font License). Librerías: three.js (MIT), GSAP (licencia gratuita «No Charge») y Lenis (MIT). Fotos y videos aéreos: DJI Avata 360.',
                         fr: 'Polices : Unbounded, Sedgwick Ave Display, JetBrains Mono et Manrope (SIL Open Font License). Bibliothèques : three.js (MIT), GSAP (licence gratuite « No Charge ») et Lenis (MIT). Photos et vidéos aériennes : DJI Avata 360.',
                         en: 'Typefaces: Unbounded, Sedgwick Ave Display, JetBrains Mono and Manrope (SIL Open Font License). Libraries: three.js (MIT), GSAP (free “No Charge” licence) and Lenis (MIT). Aerial photos and videos: DJI Avata 360.' },
  };

  /* ---------- idioma actual: ?lang= → elección guardada → idioma del navegador → francés ---------- */
  const store = (k, v) => { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };
  const read = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const fromNav = (navigator.languages || [navigator.language]).map(l => (l || '').slice(0, 2)).find(l => LANGS.includes(l));
  const lang = [new URLSearchParams(location.search).get('lang'), read('lang'), fromNav, 'fr'].find(l => LANGS.includes(l));
  store('lang', lang);
  document.documentElement.lang = lang;

  /* ---------- helpers ---------- */
  const tr = v => (v == null ? '' : typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.fr ?? v.es ?? '') : v);
  const t = (key, fallback) => (T[key] ? tr(T[key]) : fallback ?? key);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const CIRCLE = '<svg class="doodle" viewBox="0 0 220 90" preserveAspectRatio="none" aria-hidden="true"><path d="M30 18 C 80 2, 190 4, 208 34 C 224 62, 150 86, 92 84 C 34 82, 4 62, 12 38 C 18 22, 50 12, 84 10"/></svg>';
  // texto seguro → HTML con las marcas {{ }}, [[ ]] y \n
  const rich = s => esc(s)
    .replace(/\{\{(.+?)\}\}/g, '<span class="paint">$1</span>')
    .replace(/\[\[(.+?)\]\]/g, `<span class="circled">$1${CIRCLE}</span>`)
    .replace(/\n/g, '<br>');

  function apply(root = document) {
    for (const el of root.querySelectorAll('[data-i18n]')) el.innerHTML = rich(t(el.dataset.i18n));
    for (const el of root.querySelectorAll('[data-i18n-label]')) el.setAttribute('aria-label', t(el.dataset.i18nLabel));
    for (const b of root.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', b.dataset.lang === lang);
  }

  // cambiar de idioma = recargar la página en el otro idioma, tapada por la cortina (ver common.js)
  function setLang(l) {
    if (l === lang || !LANGS.includes(l)) return;
    store('lang', l);
    try { sessionStorage.setItem('scrollY', String(Math.round(scrollY))); } catch {}
    const url = new URL(location.href);
    url.searchParams.set('lang', l);
    url.hash = '';
    window.site.leave(url.href, NAMES[l]);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (b) setLang(b.dataset.lang);
  });

  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.desc'));
  apply();

  window.i18n = { lang, LANGS, NAMES, t, tr, esc, rich, apply, setLang };
})();
