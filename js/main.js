/* ═══════════════════════════════════════════════════════════
   SUSHRUTA KERALA MASSAGE THERAPY — interactions & motion
   All animation uses transform/opacity only (GPU-friendly)
   and respects prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ══════════════════════════════════════════════════════════
     LANGUAGE (English / Telugu)
     English defaults live in the HTML; Telugu strings below use
     simple, everyday wording for Narasaraopet locals.
     ══════════════════════════════════════════════════════════ */
  var LANG_KEY = "sushruta_lang";

  var TE = {
    "nav.about": "మా గురించి",
    "nav.services": "థెరపీలు",
    "nav.why": "మేమే ఎందుకు",
    "nav.timings": "సమయాలు",
    "nav.experience": "అనుభవం",
    "nav.contact": "కాంటాక్ట్",
    "nav.call": "కాల్ 95024 77334",

    "hero.eyebrow": "✦&nbsp; అసలైన కేరళ ఆయుర్వేద సంప్రదాయం &nbsp;✦",
    "hero.t1": "సంప్రదాయ కేరళ",
    "hero.t2": "మసాజ్ థెరపీ",
    "hero.t3": "ఇప్పుడు మీ ఇంటి వద్దకే",
    "hero.sub": "రిలాక్సేషన్, బాడీ కంఫర్ట్ మరియు స్ట్రెస్ రిలీఫ్ కోసం, సర్టిఫైడ్ థెరపిస్ట్ కపుల్ కేరళ సంప్రదాయ మసాజ్ సేవలను నరసరావుపేటలో మీ ఇంటికే వచ్చి అందిస్తారు.",
    "hero.scroll": "శ్వాస తీసుకోండి. మెల్లగా స్క్రోల్ చేయండి.",

    "cta.wa": "ఇప్పుడే వాట్సాప్ చేయండి",
    "cta.call": "కాల్ చేయండి",

    "chip.couple": "సర్టిఫైడ్ థెరపిస్ట్ కపుల్",
    "chip.mf": "మేల్ & ఫీమేల్ సెపరేట్ థెరపిస్ట్",
    "chip.door": "ఇంటికే వచ్చే సేవ",

    "about.badge": "సుశ్రుత<br/><em>సంప్రదాయం</em>",
    "about.eyebrow": "మా గురించి",
    "about.title": "కేరళ వెల్‌నెస్ సంప్రదాయం,<br/><span class=\"gold-italic\">మీ ఇంటి సౌకర్యంలో</span>",
    "about.lead": "సుశ్రుత ఒక సర్టిఫైడ్ థెరపిస్ట్ కపుల్. ప్రొఫెషనల్ కేరళ మసాజ్ థెరపీని నరసరావుపేటలో మీ ఇంటి వద్దకే అందిస్తారు.",
    "about.para": "తరతరాల ఆయుర్వేద అనుభవం నుంచి వచ్చిన అసలైన కేరళ పద్ధతుల్లో శిక్షణ పొందారు. ప్రతి సెషన్ రిలాక్సేషన్, బాడీ కంఫర్ట్ మరియు స్ట్రెస్ రిలీఫ్ కోసం. ప్రశాంతమైన ఒక గంట పూర్తిగా మీ కోసం.",
    "about.p1t": "కుటుంబ అనుకూలం & నమ్మకమైన సేవ",
    "about.p1d": "మర్యాదగల, ప్రొఫెషనల్ థెరపిస్ట్ కపుల్‌ను నిశ్చింతగా మీ ఇంటికి ఆహ్వానించవచ్చు.",
    "about.p2t": "మేల్ మరియు ఫీమేల్ థెరపిస్ట్ అందుబాటులో ఉంటారు",
    "about.p2d": "మహిళలకు లేడీ థెరపిస్ట్, పురుషులకు మేల్ థెరపిస్ట్. మీ కంఫర్ట్ మరియు ప్రైవసీ కోసం, ఎల్లప్పుడూ.",
    "about.p3t": "సంప్రదాయ నూనెలు & పద్ధతులు",
    "about.p3d": "వేడి హెర్బల్ నూనెలతో అసలైన కేరళ మసాజ్, రిలాక్సేషన్ మరియు నొప్పి ఉపశమన సపోర్ట్ కోసం.",
    "about.link": "వాట్సాప్‌లో మమ్మల్ని అడగండి",

    "svc.eyebrow": "మా థెరపీలు",
    "svc.title": "మీకు నచ్చిన <span class=\"gold-italic\">థెరపీ ఎంచుకోండి</span>",
    "svc.intro": "ప్రతి థెరపీ మీ ఇంటి వద్దే, వేడి హెర్బల్ నూనెలు, శుభ్రమైన లినెన్లతో, సంప్రదాయ కేరళ పద్ధతిలో.",
    "svc.book": "వాట్సాప్‌లో బుక్ చేయండి",
    "svc.listen": "థెరపీ వినండి",
    "svc.badge1": "బాగా ఇష్టపడేది",
    "svc.badge2": "రాయల్ థెరపీ",
    "svc1.tag": "పాదాలు & కాళ్ల మసాజ్",
    "svc1.desc": "అలసిన కాళ్లు, పాదాలకు హాయినిచ్చే థెరపీ. వేడి నూనె, లయబద్ధమైన మసాజ్‌తో రోజంతా అలసట మాయం.",
    "svc2.tag": "ఫుల్ బాడీ ఆయిల్ మసాజ్",
    "svc2.desc": "కేరళ ప్రసిద్ధ ఫుల్ బాడీ మసాజ్. వేడి హెర్బల్ నూనెతో పొడవైన, మృదువైన స్ట్రోక్స్. కండరాలు రిలాక్స్, మనసు ప్రశాంతం.",
    "svc3.note": "ఎక్స్‌టెండెడ్",
    "svc3.desc": "పూర్తి గంట సంప్రదాయ అభ్యంగతో డీప్ రిలాక్సేషన్, మెరుగైన ఫ్లెక్సిబిలిటీ, శరీరమంతా హాయి.",
    "svc4.tag": "హెర్బల్ పోట్లి మసాజ్",
    "svc4.desc": "కేరళ మూలికలతో నింపిన వేడి పోట్లిలతో మసాజ్. నొప్పి ఉపశమన సపోర్ట్, కండరాలకు డీప్ కంఫర్ట్.",
    "svc5.tag": "వేడి నూనె హెడ్ థెరపీ",
    "svc5.desc": "నుదుటిపై వేడి నూనె ధారతో డీప్ రిలాక్సేషన్, స్ట్రెస్ రిలీఫ్, మంచి నిద్రకు సపోర్ట్. కేరళ ప్రత్యేక థెరపీ.",
    "svc6.tag": "సంప్రదాయ కేరళ ఆయిల్ థెరపీ",
    "svc6.desc": "కేరళ \"రాయల్ ట్రీట్‌మెంట్\"గా పేరుగాంచిన థెరపీ. వేడి ఔషధ నూనె ధారలతో పాటు మసాజ్. శరీరమంతా లగ్జరీ అనుభూతి.",
    "dur.30": "30 నిమిషాలు",
    "dur.45": "45 నిమిషాలు",
    "dur.50": "50 నిమిషాలు",
    "dur.60": "60 నిమిషాలు",
    "steam.title": "హెర్బల్ స్టీమ్",
    "steam.label": "యాడ్-ఆన్",
    "steam.desc": "ఏ థెరపీతోనైనా హెర్బల్ స్టీమ్ జోడించండి. కండరాలు రిలాక్స్ అవుతాయి, రిలాక్సేషన్ మరింత పెరుగుతుంది.",
    "steam.btn": "బుకింగ్‌కు జోడించండి",

    "why.eyebrow": "సుశ్రుత ఎందుకు",
    "why.title": "పూర్తిగా నమ్మదగిన <span class=\"gold-italic\">వెల్‌నెస్ సేవ</span>",
    "why.c1t": "సర్టిఫైడ్ థెరపిస్ట్ కపుల్",
    "why.c1d": "అసలైన కేరళ ఆయుర్వేద పద్ధతుల్లో శిక్షణ పొందిన ప్రొఫెషనల్ థెరపిస్ట్ కపుల్.",
    "why.c2t": "మేల్ / ఫీమేల్ సెపరేట్ థెరపిస్ట్",
    "why.c2d": "మహిళలకు లేడీ థెరపిస్ట్, పురుషులకు మేల్ థెరపిస్ట్. కంఫర్ట్, ప్రైవసీ ఎప్పుడూ ముందే.",
    "why.c3t": "బాడీ కంఫర్ట్",
    "why.c3d": "మీ శరీర అవసరాలకు తగినట్టు వేడి నూనెలు, సరైన ప్రెషర్‌తో మసాజ్.",
    "why.c4t": "స్ట్రెస్ రిలీఫ్",
    "why.c4d": "ఒక గంట ప్రశాంతతలో ఒత్తిడి కరిగిపోతుంది, మనసు తేలికవుతుంది.",
    "why.c5t": "మైండ్ & బాడీ రిలాక్స్",
    "why.c5d": "సంప్రదాయ మసాజ్ లయతో శరీరం, మనసు రెండూ పూర్తి విశ్రాంతి పొందుతాయి.",
    "why.c6t": "ఫ్లెక్సిబిలిటీ మెరుగుదల",
    "why.c6d": "రెగ్యులర్ సెషన్లతో కండరాలు మృదువుగా, కదలికలు తేలికగా ఉంటాయి.",
    "why.c7t": "ఇంటికే వచ్చే సౌకర్యం",
    "why.c7d": "ప్రయాణం అవసరం లేదు, వెయిటింగ్ లేదు. నూనెలు, లినెన్లు అన్నీ మేమే తెస్తాము. మీరు హాయిగా రిలాక్స్ అవ్వండి.",

    "cred.eyebrow": "నైపుణ్యానికి రుజువు",
    "cred.title": "సర్టిఫైడ్ & అర్హత కలిగిన <span class=\"gold-italic\">నిపుణులు</span>",
    "cred.statement": "మా థెరపిస్టులు సంప్రదాయ ఆయుర్వేద మరియు థెరప్యూటిక్ మసాజ్ పద్ధతుల్లో ప్రొఫెషనల్ శిక్షణ పొంది, సర్టిఫికెట్ పొందారు — సురక్షితమైన, ప్రామాణికమైన, ఫలితమిచ్చే చికిత్సలకు ఇది హామీ.",
    "cred.b1": "సర్టిఫైడ్ ప్రొఫెషనల్స్",
    "cred.b2": "వెరిఫై చేసిన శిక్షణ",
    "cred.b3": "సంప్రదాయ నైపుణ్యం",
    "cred.b4": "క్లయింట్ కేంద్రిత సేవ",
    "cred.role": "సర్టిఫైడ్ ఆయుర్వేద థెరపిస్ట్ · NSQF లెవల్ 4",
    "cred.issuer": "ASAP కేరళ · NCVET, భారత ప్రభుత్వ గుర్తింపు",
    "cred.meta": "1200 గంటల శిక్షణ · శ్రీ చిత్ర ఆయుర్వేద, త్రిస్సూర్, కేరళ",
    "cred.view": "పూర్తి సర్టిఫికెట్ చూడండి",
    "cred.verify": "ప్రతి సర్టిఫికెట్ ప్రభుత్వం జారీ చేసినదే — అధికారిక ASAP కేరళ పోర్టల్‌లో ఎప్పుడైనా వెరిఫై చేసుకోవచ్చు.",

    "time.eyebrow": "మేము వచ్చే సమయాలు",
    "time.title": "ప్రతి రోజూ అందుబాటులో,<br/><span class=\"gold-italic\">మీ సౌకర్యం ప్రకారం</span>",
    "time.para": "ఉదయం రిలాక్సేషన్ లేదా సాయంత్రం విశ్రాంతి కోసం, నరసరావుపేట మరియు పల్నాడు జిల్లా అంతటా మీ ఇంటికే వస్తాము.",
    "time.btn": "ఈరోజు స్లాట్స్ కోసం అడగండి",
    "time.card": "పని వేళలు",
    "day.tue": "మంగళవారం",
    "day.wed": "బుధవారం",
    "day.thu": "గురువారం",
    "day.fri": "శుక్రవారం",
    "day.sat": "శనివారం",
    "day.sun": "ఆదివారం",
    "day.mon": "సోమవారం",
    "day.half": "హాఫ్ డే",
    "time.foot": "✦ &nbsp;సోమవారం ఉదయం మాత్రమే, ముందుగా బుక్ చేసుకోండి&nbsp; ✦",

    "exp.eyebrow": "అనుభవం",
    "exp.title": "కేరళ అనుభూతిలోకి <span class=\"gold-italic\">అడుగుపెట్టండి</span>",
    "exp.intro": "కళ్ళు మూసుకోండి. వేడి నూనె, మూలికల సువాసన, దూరంగా పక్షుల పాట. మీ సెషన్ ఇలా ఉంటుంది.",
    "exp.g1": "వేడి హెర్బల్ నూనెలు",
    "exp.g2": "తొందర లేని సంప్రదాయ సేవ",
    "exp.g3": "డీప్ రిలాక్సేషన్",
    "exp.g4": "కేరళ అందం",
    "exp.hint": "← &nbsp;స్వైప్ చేయండి&nbsp; →",

    "con.title": "మీ శరీరానికి కావాల్సిన<br/><span class=\"gold-italic\">విశ్రాంతి ఇదే</span>",
    "con.sub": "ఒక్క మెసేజ్ చాలు. మీకు కావాల్సిన థెరపీ, సమయం చెప్పండి. మేము మీ ఇంటి వద్దకే వచ్చి సేవ అందిస్తాము.",
    "con.wa": "వాట్సాప్ 95024 77334",
    "con.call": "కాల్ 95024 77334",
    "con.loc": "నరసరావుపేట, పల్నాడు జిల్లా",
    "con.hours": "ప్రతి రోజూ 9 AM నుండి 8 PM &nbsp;·&nbsp; సోమవారం 9 AM నుండి 1 PM",
    "con.door": "మీ ఇంటి వద్దకే సేవ",

    "foot.line": "సంప్రదాయ కేరళ వెల్‌నెస్, నరసరావుపేటలో మీ ఇంటి వద్దకే.",

    "bye.msg": "ధన్యవాదాలు. మీ సేవలో ఉండేందుకు మేము సిద్ధంగా ఉన్నాము."
  };

  var i18nEls = document.querySelectorAll("[data-i18n]");
  var enDefaults = {};
  i18nEls.forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (!(key in enDefaults)) enDefaults[key] = el.innerHTML;
  });

  var langSwitch = document.getElementById("langSwitch");

  function applyLang(lang) {
    var isTe = lang === "te";
    i18nEls.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var value = isTe ? TE[key] : enDefaults[key];
      if (value !== undefined) el.innerHTML = value;
    });
    document.documentElement.setAttribute("lang", isTe ? "te" : "en");
    langSwitch.textContent = isTe ? "English" : "తెలుగు";
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  var savedLang = null;
  try { savedLang = localStorage.getItem(LANG_KEY); } catch (e) {}

  /* Language selection overlay — shown on first visit only */
  var langModal = document.getElementById("langModal");
  if (savedLang === "en" || savedLang === "te") {
    applyLang(savedLang);
  } else {
    langModal.hidden = false;
    document.body.classList.add("lang-open");
  }

  langModal.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"));
      langModal.classList.add("closing");
      document.body.classList.remove("lang-open");
      setTimeout(function () { langModal.hidden = true; }, 550);
    });
  });

  langSwitch.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("lang");
    applyLang(current === "te" ? "en" : "te");
  });

  /* ── Header: solid on scroll ─────────────────────────────── */
  var header = document.getElementById("siteHeader");
  var headerTicking = false;
  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 40);
    headerTicking = false;
  }
  window.addEventListener("scroll", function () {
    if (!headerTicking) {
      headerTicking = true;
      requestAnimationFrame(updateHeader);
    }
  }, { passive: true });
  updateHeader();

  /* ── Mobile navigation (full-screen, scroll-locked) ──────── */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  function setNav(open) {
    mainNav.classList.toggle("open", open);
    navToggle.classList.toggle("active", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    // lock background scroll while the menu covers the viewport
    document.body.classList.toggle("nav-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
  }

  navToggle.addEventListener("click", function () {
    setNav(!mainNav.classList.contains("open"));
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setNav(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mainNav.classList.contains("open")) setNav(false);
  });

  /* ── Hero entrance ───────────────────────────────────────── */
  // Trigger line-reveal animations once styles are applied.
  requestAnimationFrame(function () {
    document.body.classList.add("hero-loaded");
    document.querySelector(".hero").classList.add("hero-loaded");
  });

  /* ── Reveal on scroll (staggered) ────────────────────────── */
  var revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    // Stagger siblings that enter together
    var revealObserver = new IntersectionObserver(function (entries) {
      var delay = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--rd", delay + "s");
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
        delay += 0.09;
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ── Parallax (treelines) ────────────────────────────────── */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!reducedMotion && parallaxEls.length) {
    var pxTicking = false;
    var updateParallax = function () {
      var y = window.scrollY;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
        el.style.transform = "translate3d(0," + (y * speed).toFixed(1) + "px,0)";
      });
      pxTicking = false;
    };
    window.addEventListener("scroll", function () {
      if (!pxTicking) {
        pxTicking = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });
  }

  /* ── Bird flight system ──────────────────────────────────── */
  // Spawns small silhouette birds that glide across a layer,
  // then removes them. Cheap: CSS keyframes, transform only.
  function birdSystem(layerId, options) {
    var layer = document.getElementById(layerId);
    if (!layer || reducedMotion) return;

    var opts = options || {};
    var minDelay = opts.minDelay || 5000;   // ms between spawns
    var maxDelay = opts.maxDelay || 12000;
    var maxBirds = opts.maxBirds || 4;
    var spawnTimer = null;
    var visible = true;

    function rand(min, max) { return min + Math.random() * (max - min); }

    function spawnFlock() {
      if (!visible) return schedule();
      var current = layer.querySelectorAll(".bird").length;
      var flockSize = Math.random() < 0.35 ? 2 : 1; // occasionally a pair
      for (var i = 0; i < flockSize && current + i < maxBirds; i++) {
        spawnBird(i * rand(400, 900));
      }
      schedule();
    }

    function spawnBird(delayOffset) {
      var wrapper = document.createElement("div");
      wrapper.className = "bird";
      // px — small & distant; enlarged on phones for visibility
      var size = rand(14, 34) * (window.innerWidth < 640 ? 1.4 : 1);
      var top = rand(8, 45);                   // % of layer height
      var duration = rand(18, 30) * (34 / size); // smaller = slower = further away
      duration = Math.min(duration, 42);

      wrapper.style.width = size + "px";
      wrapper.style.top = top + "%";
      wrapper.style.animationDuration = duration + "s";
      wrapper.style.animationDelay = (delayOffset / 1000) + "s";

      var glide = document.createElement("div");
      glide.className = "bird-glide";
      glide.style.animationDuration = rand(2.6, 4.2) + "s";

      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 60");
      var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#bird");
      svg.appendChild(use);

      // Vary flap speed a little per bird
      svg.style.setProperty("animation-duration", rand(0.8, 1.2) + "s");

      glide.appendChild(svg);
      wrapper.appendChild(glide);
      layer.appendChild(wrapper);

      wrapper.addEventListener("animationend", function (e) {
        if (e.target === wrapper) wrapper.remove();
      });
      // Safety cleanup
      setTimeout(function () { wrapper.remove(); }, (duration + delayOffset / 1000 + 2) * 1000);
    }

    function schedule() {
      spawnTimer = setTimeout(spawnFlock, rand(minDelay, maxDelay));
    }

    // Only animate when the layer's section is on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(layer);
    }

    // First birds appear soon after load
    spawnTimer = setTimeout(spawnFlock, opts.firstDelay || 1800);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        clearTimeout(spawnTimer);
      } else {
        schedule();
      }
    });
  }

  birdSystem("heroBirds", { firstDelay: 1600, minDelay: 4500, maxDelay: 10000, maxBirds: 5 });
  birdSystem("servicesBirds", { firstDelay: 3000, minDelay: 9000, maxDelay: 18000, maxBirds: 2 });
  birdSystem("contactBirds", { firstDelay: 2500, minDelay: 8000, maxDelay: 16000, maxBirds: 3 });

  /* ── Timings: highlight today ────────────────────────────── */
  var today = new Date().getDay(); // 0 = Sunday … 6 = Saturday
  var todayRow = document.querySelector('.timings-list li[data-day="' + today + '"]');
  if (todayRow) todayRow.classList.add("today");

  /* ── Footer year ─────────────────────────────────────────── */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Smooth anchor offset for fixed header ───────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  /* ══════════════════════════════════════════════════════════
     SCROLL STORY — ambient healing journey
     Stress → Therapy → Relief → Renewal, told by a fixed
     particle canvas plus a misty silhouette that changes pose
     as the visitor scrolls. Everything lives at z-index 1,
     below all content containers, and is pointer-events: none.
     ══════════════════════════════════════════════════════════ */
  (function storyLayer() {

    /* Scene classes for the CSS-only decorations */
    var whyUs = document.getElementById("why-us");
    var contactSec = document.getElementById("contact");
    if ("IntersectionObserver" in window && !reducedMotion) {
      var sceneObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (entry.target === whyUs) whyUs.classList.add("bloomed");
          if (entry.target === contactSec) contactSec.classList.add("sun-up");
          sceneObserver.unobserve(entry.target);
        });
      }, { threshold: 0.22 });
      if (whyUs) sceneObserver.observe(whyUs);
      if (contactSec) sceneObserver.observe(contactSec);
    } else {
      if (whyUs) whyUs.classList.add("bloomed");
      if (contactSec) contactSec.classList.add("sun-up");
    }

    var canvas = document.getElementById("storyCanvas");
    var figure = document.getElementById("journeyFigure");
    if (reducedMotion || !canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    var W = 0, H = 0;
    var sizeK = 1; // particles are enlarged on small screens for visibility
    var particles = [];
    var marks = [];        // scrollY of each story section top
    var ps = 0;            // smoothed story progress, 0 … 6
    var last = 0;
    var rafId = null;

    var SECTIONS = ["hero", "about", "services", "why-us", "timings", "experience", "contact"];

    /* One row per story stage.
       dark – share of grey "stress" motes   drop – share of oil droplets
       leaf – share of herbal leaves         up   – 0 = falling … 1 = rising
       speed – overall pace                  veil/va – ambient colour wash
       figO – silhouette opacity tuned to that section's background */
    var STAGES = [
      { dark: 0.40, drop: 0.00, leaf: 0.20, up: 0.12, speed: 0.50, veil: [70, 88, 74],    va: 0.06, figO: 0.26 },
      { dark: 0.05, drop: 0.18, leaf: 0.25, up: 0.30, speed: 0.60, veil: [201, 163, 90],  va: 0.05, figO: 0.16 },
      { dark: 0.02, drop: 0.30, leaf: 0.12, up: 0.42, speed: 0.72, veil: [201, 163, 90],  va: 0.06, figO: 0.30 },
      { dark: 0.00, drop: 0.06, leaf: 0.42, up: 0.55, speed: 0.55, veil: [93, 148, 114],  va: 0.05, figO: 0.16 },
      { dark: 0.00, drop: 0.00, leaf: 0.25, up: 0.30, speed: 0.35, veil: [201, 163, 90],  va: 0.04, figO: 0.26 },
      { dark: 0.00, drop: 0.00, leaf: 0.35, up: 0.50, speed: 0.50, veil: [227, 194, 132], va: 0.05, figO: 0.16 },
      { dark: 0.00, drop: 0.00, leaf: 0.25, up: 0.85, speed: 0.60, veil: [227, 194, 132], va: 0.08, figO: 0.32 }
    ];
    var KEYS = ["dark", "drop", "leaf", "up", "speed", "va", "figO"];

    function lerp(a, b, t) { return a + (b - a) * t; }
    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function rand(a, b) { return a + Math.random() * (b - a); }

    function stageParams(p) {
      var i = Math.max(0, Math.min(Math.floor(p), STAGES.length - 2));
      var t = clamp01(p - i);
      var a = STAGES[i], b = STAGES[i + 1], out = {}, k;
      for (k = 0; k < KEYS.length; k++) out[KEYS[k]] = lerp(a[KEYS[k]], b[KEYS[k]], t);
      out.veil = [
        lerp(a.veil[0], b.veil[0], t),
        lerp(a.veil[1], b.veil[1], t),
        lerp(a.veil[2], b.veil[2], t)
      ];
      return out;
    }

    function measure() {
      marks = [];
      for (var i = 0; i < SECTIONS.length; i++) {
        var el = document.getElementById(SECTIONS[i]);
        marks.push(el ? el.offsetTop : (i ? marks[i - 1] : 0));
      }
    }

    function targetP() {
      if (!marks.length) return 0;
      var y = window.scrollY + H * 0.55;
      if (y <= marks[0]) return 0;
      for (var i = 0; i < marks.length - 1; i++) {
        if (y < marks[i + 1]) {
          return i + (y - marks[i]) / Math.max(1, marks[i + 1] - marks[i]);
        }
      }
      return marks.length - 1;
    }

    /* Spawn positions favour the screen edges so the busiest
       motion stays away from the central reading column */
    function biasedX() {
      if (Math.random() < 0.6) {
        var e = Math.random() * 0.26 * W;
        return Math.random() < 0.5 ? e : W - e;
      }
      return Math.random() * W;
    }

    function spawn(p, anywhere) {
      var P = stageParams(ps);
      var r = Math.random();
      if (r < P.dark) p.type = "dark";
      else if (r < P.dark + P.drop) p.type = "drop";
      else if (r < P.dark + P.drop + P.leaf) p.type = "leaf";
      else p.type = "mote";

      p.gold = Math.random() < 0.6;
      p.s = rand(0.5, 1.2);
      p.x = biasedX();
      p.vx = rand(-6, 6);
      p.vy = rand(16, 40);
      p.amp = rand(6, 26);
      p.fq = rand(0.05, 0.25);
      p.ph = rand(0, Math.PI * 2);
      p.rot = rand(0, Math.PI * 2);
      p.spin = rand(-0.6, 0.6);
      p.size = (p.type === "leaf" ? rand(6, 13)
             : p.type === "dark" ? rand(7, 15)
             : p.type === "drop" ? rand(6, 11)
             : rand(1.2, 2.6)) * sizeK;

      var rising = P.up > 0.5 && p.type !== "drop";
      p.y = anywhere ? Math.random() * H : (rising ? H + 24 : -24);
    }

    function initParticles() {
      var n = Math.round(Math.min(64, Math.max(18, (W * H) / 26000)));
      particles = [];
      for (var i = 0; i < n; i++) {
        var p = {};
        spawn(p, true);
        particles.push(p);
      }
    }

    function resize() {
      var w = window.innerWidth, h = window.innerHeight;
      if (w === W && h === H) return;
      W = w; H = h;
      sizeK = W < 640 ? 1.45 : 1;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      initParticles();
    }

    function drawVeil(P) {
      var g = ctx.createRadialGradient(W / 2, -H * 0.25, 0, W / 2, -H * 0.25, H * 1.15);
      var c = "rgba(" + (P.veil[0] | 0) + "," + (P.veil[1] | 0) + "," + (P.veil[2] | 0) + ",";
      g.addColorStop(0, c + P.va.toFixed(3) + ")");
      g.addColorStop(1, c + "0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    function drawLeaf(p, x, alpha) {
      ctx.save();
      ctx.translate(x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.gold
        ? "rgba(201,163,90," + alpha.toFixed(3) + ")"
        : "rgba(93,148,114," + alpha.toFixed(3) + ")";
      var s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.75, -s * 0.15, 0, s);
      ctx.quadraticCurveTo(-s * 0.75, -s * 0.15, 0, -s);
      ctx.fill();
      ctx.restore();
    }

    /* Silhouette pose crossfade — each pose owns a region of the
       journey: burdened → receiving → meditative → renewed */
    var poses = figure ? figure.querySelectorAll(".pose") : [];
    var CENTERS = [0.25, 2.0, 3.7, 5.6];
    var SPANS = [1.35, 1.3, 1.3, 1.5];

    function updateFigure(P) {
      if (!poses.length) return;
      for (var i = 0; i < poses.length; i++) {
        var o;
        if (i === poses.length - 1 && ps >= CENTERS[i]) o = 1;
        else o = clamp01(1 - Math.abs(ps - CENTERS[i]) / SPANS[i]);
        o = o * o * (3 - 2 * o); // smoothstep for a gentler blend
        poses[i].style.opacity = o.toFixed(3);
      }
      figure.style.setProperty("--fig-o", P.figO.toFixed(3));
    }

    function frame(ts) {
      rafId = requestAnimationFrame(frame);
      if (!last) last = ts;
      var dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      var t = ts / 1000;

      ps += (targetP() - ps) * Math.min(1, dt * 3);
      var P = stageParams(ps);
      /* the grey "stress" motes dissolve for good as healing begins */
      var darkAlive = clamp01(1 - (ps - 0.55) / 1.0);
      var dir = 1 - P.up * 2; // positive falls, negative rises

      ctx.clearRect(0, 0, W, H);
      drawVeil(P);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        if (p.type === "drop") {
          p.y += p.vy * 2.2 * dt * (0.6 + P.speed); // oil always falls
        } else {
          p.y += p.vy * dir * P.speed * dt * (p.type === "dark" ? 0.5 : 1);
        }
        p.x += p.vx * dt;
        p.rot += p.spin * dt;

        if (p.y > H + 30 || p.y < -30 || p.x < -60 || p.x > W + 60) {
          spawn(p, false);
          continue;
        }

        var x = p.x + Math.sin(t * p.fq * 6.2832 + p.ph) * p.amp;
        var tw = 0.6 + 0.4 * Math.sin(t * (1 + p.fq * 6) + p.ph);

        if (p.type === "mote") {
          var a = 0.55 * p.s * tw;
          var col = p.gold ? "227,194,132" : "160,196,172";
          ctx.fillStyle = "rgba(" + col + "," + (a * 0.22).toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(x, p.y, p.size * 3, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "rgba(" + col + "," + a.toFixed(3) + ")";
          ctx.beginPath(); ctx.arc(x, p.y, p.size, 0, 6.2832); ctx.fill();
        } else if (p.type === "leaf") {
          drawLeaf(p, x, 0.42 * p.s);
        } else if (p.type === "drop") {
          ctx.save();
          ctx.translate(x, p.y);
          ctx.fillStyle = "rgba(213,175,102,0.5)";
          ctx.beginPath(); ctx.ellipse(0, 0, 1.5 * sizeK, p.size, 0, 0, 6.2832); ctx.fill();
          ctx.restore();
        } else { // dark — heaviness that gradually dissolves
          var da = 0.16 * p.s * darkAlive;
          if (da > 0.004) {
            ctx.fillStyle = "rgba(84,96,86," + da.toFixed(3) + ")";
            ctx.beginPath(); ctx.arc(x, p.y, p.size * 2.1, 0, 6.2832); ctx.fill();
            ctx.fillStyle = "rgba(84,96,86," + (da * 1.6).toFixed(3) + ")";
            ctx.beginPath(); ctx.arc(x, p.y, p.size, 0, 6.2832); ctx.fill();
          }
        }
      }

      updateFigure(P);
    }

    function start() {
      if (rafId === null) {
        last = 0;
        rafId = requestAnimationFrame(frame);
      }
    }
    function stop() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    /* Re-measure when layout shifts (lazy images, fonts, rotation) */
    var measureTimer = null;
    function queueMeasure() {
      clearTimeout(measureTimer);
      measureTimer = setTimeout(function () { measure(); resize(); }, 180);
    }
    window.addEventListener("resize", queueMeasure);
    window.addEventListener("load", queueMeasure);
    if ("ResizeObserver" in window) {
      new ResizeObserver(queueMeasure).observe(document.body);
    }

    measure();
    resize();
    ps = targetP(); // start in-place: no catch-up sweep on load
    start();
  })();
})();
