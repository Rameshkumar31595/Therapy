/* ═══════════════════════════════════════════════════════════
   BUBBLE — a lightweight, context-aware virtual page guide.

   Bubble is NOT an AI chatbot. It is a friendly on-screen guide
   that, once tapped, enters ACTIVE GUIDE MODE — following the
   visitor down the page and narrating each new section in the
   site's active language (English / Telugu). Frontend-only:
   no backend, no network, no external API.

   Structure (vanilla-JS "components"):
     • assistantMessages    – per-section EN/TE copy + UI strings
     • BubbleAvatar         – the animated SVG guide
     • BubbleMessagePanel   – the expandable explanation card
     • BubbleVoiceService   – provider-agnostic voice layer (TTS
                              today; swap in prerecorded audio later)
     • createSectionMonitor – start/stop guide-mode section tracking
     • BubbleAssistant      – wires it all together

   It never covers the sticky CTA bar, the floating WhatsApp
   button, or the booking form, and touches no existing logic.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (!("IntersectionObserver" in window) || !document.body) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SS_WELCOME = "bubble_welcomed";
  var SS_HINT = "bubble_close_hint";

  function lang() {
    return document.documentElement.getAttribute("lang") === "te" ? "te" : "en";
  }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  /* ══════════════ assistantMessages config ══════════════════
     One short, warm, premium message per section, in both
     languages. Kept concise for the compact voice-first card. */
  var MESSAGES = {
    hero: {
      en: "Welcome to Sushruta Kerala Massage Therapy. I'm Bubble, your wellness guide — I'll help you explore our therapies, home service, clinic treatments and booking.",
      te: "సుశ్రుత కేరళ మసాజ్ థెరపీకి స్వాగతం. నేను బబుల్. ఈ వెబ్‌సైట్‌లోని థెరపీలు, హోమ్ సర్వీస్, క్లినిక్ సేవలు మరియు బుకింగ్ వివరాలు తెలుసుకోవడంలో నేను మీకు సహాయం చేస్తాను."
    },
    about: {
      en: "This is our story — a certified therapist couple bringing authentic Kerala Ayurveda to Narasaraopet, at our clinic and to your home.",
      te: "ఇది మా కథ — సర్టిఫైడ్ థెరపిస్ట్ కపుల్, అసలైన కేరళ ఆయుర్వేదాన్ని నరసరావుపేటలో క్లినిక్‌లోనూ, మీ ఇంటికీ అందిస్తారు."
    },
    certificates: {
      en: "These certificates showcase our professional training and experience. They're here to help you book with confidence.",
      te: "ఈ సర్టిఫికేట్లు మా ప్రొఫెషనల్ శిక్షణ, అనుభవాన్ని చూపిస్తాయి. మీరు నమ్మకంగా బుక్ చేసుకోవడానికి ఇవి సహాయపడతాయి."
    },
    therapies: {
      en: "These are our Kerala therapies. Tap Listen on any card to hear more — and a few are also available as home service.",
      te: "ఇవి మా కేరళ థెరపీలు. మరిన్ని వివరాలకు కార్డ్‌పై Listen నొక్కండి — కొన్ని హోమ్ సర్వీస్‌గా కూడా అందుబాటులో ఉన్నాయి."
    },
    "therapy-detail": {
      en: "Tap “Listen to Therapy” on any card to hear how that treatment works, in your language.",
      te: "ఏదైనా కార్డ్‌పై “థెరపీ వినండి” నొక్కితే, ఆ చికిత్స ఎలా పనిచేస్తుందో మీ భాషలో వినవచ్చు."
    },
    "why-us": {
      en: "Here's why guests trust us — certified therapists, separate male and female care, and genuine Kerala technique.",
      te: "అతిథులు మమ్మల్ని ఎందుకు నమ్ముతారో ఇక్కడ ఉంది — సర్టిఫైడ్ థెరపిస్టులు, మేల్/ఫీమేల్ సెపరేట్ కేర్, అసలైన కేరళ పద్ధతి."
    },
    timings: {
      en: "These are our hours — open daily, with Monday mornings only. Booking ahead is always a good idea.",
      te: "ఇవి మా సమయాలు — ప్రతిరోజూ తెరిచి ఉంటాం, సోమవారం ఉదయం మాత్రమే. ముందుగా బుక్ చేసుకోవడం ఎప్పుడూ మంచిది."
    },
    experience: {
      en: "A little glimpse of the calm you can expect — warm oils, quiet care, and a true Kerala mood.",
      te: "మీకు లభించే ప్రశాంతత ఒక చిన్న సంగ్రహం — వెచ్చని నూనెలు, నిశ్శబ్ద సేవ, నిజమైన కేరళ అనుభూతి."
    },
    location: {
      en: "This section shows our clinic location. If you'd like to visit, just tap Directions and Google Maps will take care of the rest.",
      te: "ఈ విభాగంలో మా క్లినిక్ లొకేషన్ ఉంది. రావాలనుకుంటే, Directions నొక్కండి — మిగతాది Google Maps చూసుకుంటుంది."
    },
    booking: {
      en: "Ready to book? Choose your service type, therapy and time — I'll let the booking form handle the rest.",
      te: "బుక్ చేయడానికి సిద్ధమా? సేవ రకం, థెరపీ, సమయం ఎంచుకోండి — మిగతాది బుకింగ్ ఫారమ్ చూసుకుంటుంది."
    },
    contact: {
      en: "Here are the quick ways to reach us — Call, WhatsApp or Directions. Whenever you're ready, we're one tap away.",
      te: "మమ్మల్ని సంప్రదించే సులభ మార్గాలు ఇవి — Call, WhatsApp లేదా Directions. మీరు సిద్ధమైనప్పుడు, ఒక్క ట్యాప్ దూరంలో ఉన్నాం."
    },
    footer: {
      en: "That's the tour! Address, phone, WhatsApp and directions all live here for quick access. Thanks for visiting.",
      te: "అదీ టూర్! చిరునామా, ఫోన్, WhatsApp, directions అన్నీ ఇక్కడ సులభంగా ఉన్నాయి. సందర్శించినందుకు ధన్యవాదాలు."
    }
  };

  var UI = {
    en: {
      open: "Open Bubble — your wellness guide",
      close: "Close Bubble guide",
      title: "Bubble",
      welcome: "Hi! I'm Bubble. Tap me for a quick tour of this page.",
      closeHint: "Tap me anytime if you need help understanding this page.",
      listen: "Listen",
      stop: "Stop",
      closeBtn: "Close"
    },
    te: {
      open: "బబుల్ తెరవండి — మీ వెల్‌నెస్ గైడ్",
      close: "బబుల్ గైడ్ మూసివేయండి",
      title: "బబుల్",
      welcome: "హాయ్! నేను బబుల్. ఈ పేజీ టూర్ కోసం నన్ను ట్యాప్ చేయండి.",
      closeHint: "ఈ పేజీని అర్థం చేసుకోవడానికి సహాయం కావాలంటే ఎప్పుడైనా నన్ను ట్యాప్ చేయండి.",
      listen: "వినండి",
      stop: "ఆపండి",
      closeBtn: "మూసివేయి"
    }
  };

  function messageFor(section) {
    var entry = MESSAGES[section] || MESSAGES.hero;
    return entry[lang()] || entry.en;
  }

  /* ══════════════ BubbleAvatar ══════════════════════════════
     A friendly male wellness guide, drawn in inline SVG so it
     stays tiny and animates with CSS (idle float, blink, wave). */
  var AVATAR_SVG =
    '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
      '<defs><clipPath id="bbClip"><circle cx="32" cy="32" r="31"/></clipPath></defs>' +
      '<g clip-path="url(#bbClip)">' +
        '<path d="M6 64 C6 51 18 45 32 45 C46 45 58 51 58 64 Z" fill="#2e6b45"/>' +
        '<path d="M26 46 L32 54 L38 46" fill="none" stroke="#e3c284" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="32" cy="57.5" r="2.1" fill="#c9a35a"/>' +
        '<rect x="28" y="40" width="8" height="8" rx="3" fill="#d9a578"/>' +
        '<ellipse cx="32" cy="30" rx="12.5" ry="13.5" fill="#e8b98c"/>' +
        '<circle cx="19.8" cy="31" r="2.4" fill="#e0ad7f"/>' +
        '<circle cx="44.2" cy="31" r="2.4" fill="#e0ad7f"/>' +
        '<path d="M19 30 C18 15 46 15 45 30 C45 24 41 18 32 18 C24 18 19 23 19 30 Z" fill="#2a1c12"/>' +
        '<path d="M23.5 26 q3 -1.7 6 0" stroke="#3a2a1c" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M34.5 26 q3 -1.7 6 0" stroke="#3a2a1c" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
        '<ellipse class="bb-eye" cx="26.6" cy="30" rx="1.7" ry="2.3" fill="#2a1c12"/>' +
        '<ellipse class="bb-eye" cx="37.4" cy="30" rx="1.7" ry="2.3" fill="#2a1c12"/>' +
        '<path d="M32 31 l -1.1 4 h 2.2" fill="none" stroke="#c98f63" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M26.5 37 Q32 42 37.5 37" fill="none" stroke="#8a4b3a" stroke-width="1.7" stroke-linecap="round"/>' +
        '<circle cx="23.8" cy="35" r="1.8" fill="#e79a86" opacity="0.5"/>' +
        '<circle cx="40.2" cy="35" r="1.8" fill="#e79a86" opacity="0.5"/>' +
        '<g class="bb-hand"><rect x="46" y="40" width="4" height="7" rx="2" fill="#2e6b45"/><circle cx="48" cy="39" r="3.1" fill="#e8b98c"/></g>' +
      '</g>' +
    '</svg>';

  /* ══════════════ Build DOM (root + panel) ══════════════════ */
  var root = document.createElement("div");
  root.className = "bubble-root";

  var tip = document.createElement("div");
  tip.className = "bubble-tip";
  tip.setAttribute("role", "status");
  tip.setAttribute("aria-live", "polite");

  var panel = document.createElement("div");
  panel.className = "bubble-panel";
  panel.id = "bubblePanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", UI.en.title);
  panel.setAttribute("tabindex", "-1");
  panel.innerHTML =
    '<div class="bubble-head">' +
      '<span class="bubble-orb" aria-hidden="true"><i></i></span>' +
      '<span class="bubble-name" data-bb="title"></span>' +
      '<span class="bubble-wave" data-bb="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' +
      '<button type="button" class="bubble-close" data-bb="close">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6Z"/></svg>' +
      '</button>' +
    '</div>' +
    '<p class="bubble-msg" data-bb="msg" aria-live="polite" aria-atomic="true"></p>';

  var avatar = document.createElement("button");
  avatar.type = "button";
  avatar.className = "bubble-avatar";
  avatar.setAttribute("aria-expanded", "false");
  avatar.setAttribute("aria-controls", "bubblePanel");
  avatar.setAttribute("aria-label", UI.en.open);
  avatar.innerHTML = AVATAR_SVG;

  root.appendChild(tip);
  root.appendChild(panel);
  root.appendChild(avatar);
  document.body.appendChild(root);

  var titleEl = panel.querySelector('[data-bb="title"]');
  var closeBtn = panel.querySelector('[data-bb="close"]');
  var msgEl = panel.querySelector('[data-bb="msg"]');
  var eqEl = panel.querySelector('[data-bb="eq"]');

  /* ══════════════ BubbleVoiceService ════════════════════════
     A thin, provider-agnostic voice layer. Bubble NEVER calls the
     SpeechSynthesis API directly — it only calls this service via
     { isSupported, refresh, speak, stop }. `speak` receives a
     request object { section, lang, text, onStart, onEnd }.

     ► Future upgrade to PRERECORDED AUDIO needs no Bubble changes:
       swap in a service with the same contract that plays an
       <audio> clip keyed by (section, lang) and falls back to
       `text` via TTS when a clip is missing. Everything else — the
       guide logic, section detection, UI — stays exactly as-is. */
  function createVoiceService() {
    var synth = window.speechSynthesis || null;
    var supported = !!synth && typeof window.SpeechSynthesisUtterance !== "undefined";

    /* ONE personality everywhere: warm, youthful, slightly playful.
       Pitch/volume constant across sections AND languages; Telugu
       gets a marginally slower rate purely for clarity. */
    var TUNING = {
      en: { rate: 1.0, pitch: 1.2, volume: 1.0 },
      te: { rate: 0.94, pitch: 1.2, volume: 1.0 }
    };
    var cache = { en: undefined, te: undefined }; // best voice per language

    function score(v, want) {
      var lc = (v.lang || "").toLowerCase();
      var nm = (v.name || "").toLowerCase();
      var s = 0;
      if (want === "te") {
        if (lc.indexOf("te") !== 0) return -1;          // Telugu voices only
        s += 100;
      } else {
        if (lc.indexOf("en-in") === 0) s += 100;        // Indian English first
        else if (lc.indexOf("en") === 0) s += 60;       // any English
        else return -1;
      }
      // Highest-quality engines (matters most when several exist)
      if (/google/.test(nm)) s += 30;
      if (/natural|neural|online|enhanced|premium|wavenet/.test(nm)) s += 26;
      // Warmer / younger (typically female) — same intent both languages
      if (/female|woman|zira|heera|swara|kalpana|raveena|aditi|priya|neerja|isha|lekha/.test(nm)) s += 14;
      if (/\bmale\b|david|ravi|hemant|prabhat/.test(nm)) s -= 6;
      if (v.localService) s += 3;
      return s;
    }
    function pick(want) {
      var voices;
      try { voices = synth.getVoices() || []; } catch (e) { return null; }
      var best = null, bestScore = 0;
      for (var i = 0; i < voices.length; i++) {
        var sc = score(voices[i], want);
        if (sc > bestScore) { bestScore = sc; best = voices[i]; }
      }
      return best;
    }
    function resolve() {
      if (!supported) return;
      cache.en = pick("en") || null;
      cache.te = pick("te") || null;
    }
    if (supported) {
      resolve();
      try { synth.addEventListener("voiceschanged", resolve); }
      catch (e) { synth.onvoiceschanged = resolve; }
    }

    return {
      isSupported: function () { return supported; },
      refresh: resolve,
      stop: function () { if (synth) { try { synth.cancel(); } catch (e) {} } },
      speak: function (req) {
        if (!supported || !req || !req.text) { if (req && req.onEnd) req.onEnd(); return false; }
        try { synth.cancel(); } catch (e) {}
        var L = req.lang === "te" ? "te" : "en";
        var u = new window.SpeechSynthesisUtterance(req.text);
        u.lang = L === "te" ? "te-IN" : "en-IN";
        var v = cache[L];
        if (v === undefined) { resolve(); v = cache[L]; }
        if (v) u.voice = v;                 // else platform picks by u.lang
        var tune = TUNING[L];
        u.rate = tune.rate; u.pitch = tune.pitch; u.volume = tune.volume;
        u.onstart = req.onStart || null;
        u.onend = req.onEnd || null;
        u.onerror = req.onEnd || null;
        try { synth.speak(u); return true; }
        catch (e) { if (req.onEnd) req.onEnd(); return false; }
      }
    };
  }

  var voice = createVoiceService();
  var canSpeak = voice.isSupported();

  function setSpeaking(on) {
    panel.classList.toggle("speaking", on);
  }
  function stopSpeech() { voice.stop(); setSpeaking(false); }
  function speakSection(section) {
    if (!canSpeak) return;                  // unsupported → text only, silently
    voice.speak({
      section: section,
      lang: lang(),
      text: messageFor(section),
      onStart: function () { setSpeaking(true); },
      onEnd: function () { setSpeaking(false); }
    });
  }

  /* ══════════════ Section monitor — Active Guide Mode ════════
     Runs ONLY while Bubble is open (start/stop), so it costs
     nothing when minimized. Chooses the section owning the
     viewport midpoint; if none does, the most-visible section
     wins (visibility %). A debounce absorbs fast scrolling so
     Bubble never flickers or narrates a section the user merely
     flew past, and the same section is never re-narrated. */
  function createSectionMonitor(onEnter) {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-section]"));
    var DEBOUNCE = 550;
    var current = null, io = null, raf = 0, timer = 0, running = false;

    function pick() {
      var vh = window.innerHeight, midY = vh / 2;
      var mid = null, mostVis = null, mostArea = 0;
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        var top = r.top > 0 ? r.top : 0;
        var bot = r.bottom < vh ? r.bottom : vh;
        var vis = bot - top;
        if (vis <= 0) continue;                                  // not on screen
        if (!mid && r.top <= midY && r.bottom >= midY) mid = sections[i]; // owns midpoint
        if (vis > mostArea) { mostArea = vis; mostVis = sections[i]; }
      }
      var el = mid || mostVis;
      return el ? el.getAttribute("data-section") : null;
    }

    function evaluate() {
      var sec = pick();
      if (!sec || sec === current) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {                           // settle before committing
        var now = pick();
        if (now && now !== current) { current = now; onEnter(now); }
      }, DEBOUNCE);
    }
    function schedule() {
      if (raf) return;
      raf = window.requestAnimationFrame(function () { raf = 0; evaluate(); });
    }

    return {
      current: function () { return current; },
      start: function () {
        if (running || !sections.length) return;
        running = true;
        current = pick();                                        // baseline (not narrated)
        // IO fires on section boundary crossings → evaluate directly
        // (robust even where rAF is throttled); scroll/resize use the
        // rAF-coalesced path to stay smooth during active scrolling.
        io = new IntersectionObserver(function () { evaluate(); },
          { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
        sections.forEach(function (el) { io.observe(el); });
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });
      },
      stop: function () {
        running = false;
        if (io) { io.disconnect(); io = null; }
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
        if (timer) { clearTimeout(timer); timer = 0; }
      }
    };
  }

  /* ══════════════ BubbleMessagePanel controls ═══════════════ */
  var open = false;
  var tipTimer = null;

  function applyStaticLabels() {
    var L = UI[lang()];
    titleEl.textContent = L.title;
    panel.setAttribute("aria-label", L.title);
    closeBtn.setAttribute("aria-label", L.closeBtn);
    avatar.setAttribute("aria-label", open ? L.close : L.open);
  }

  function renderMessage(section) {
    msgEl.textContent = messageFor(section || monitor.current() || "hero");
  }

  function showTip(text, ms) {
    tip.textContent = text;
    tip.classList.add("show");
    if (tipTimer) clearTimeout(tipTimer);
    if (ms) tipTimer = setTimeout(hideTip, ms);
  }
  function hideTip() { tip.classList.remove("show"); }

  /* Open → enter Active Guide Mode: start monitoring, narrate the
     current section right away (inside the tap gesture for iOS). */
  function openPanel() {
    if (open) return;
    open = true;
    hideTip();
    monitor.start();
    var sec = monitor.current() || "hero";
    renderMessage(sec);
    panel.classList.add("open");
    avatar.setAttribute("aria-expanded", "true");
    avatar.setAttribute("aria-label", UI[lang()].close);
    try { panel.focus({ preventScroll: true }); } catch (e) { panel.focus(); }
    speakSection(sec);
  }
  /* Close → leave Guide Mode: stop speech AND stop all monitoring. */
  function closePanel(withHint) {
    if (!open) return;
    open = false;
    monitor.stop();
    stopSpeech();
    panel.classList.remove("open");
    avatar.setAttribute("aria-expanded", "false");
    avatar.setAttribute("aria-label", UI[lang()].open);
    try { avatar.focus({ preventScroll: true }); } catch (e) {}
    if (withHint && !ssGet(SS_HINT)) { ssSet(SS_HINT, "1"); showTip(UI[lang()].closeHint, 5600); }
  }
  function toggle() { open ? closePanel(true) : openPanel(); }

  /* ══════════════ BubbleAssistant — wiring ══════════════════ */
  // Continuous Guide Mode: while open, entering a NEW section (after
  // the debounce settles) swaps the text and narrates it — stopping
  // any in-progress speech first. Same section never repeats.
  var monitor = createSectionMonitor(function (section) {
    if (!open) return;
    renderMessage(section);
    speakSection(section);
  });

  applyStaticLabels();

  avatar.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
  closeBtn.addEventListener("click", function (e) { e.stopPropagation(); closePanel(true); });

  // Tap outside closes (no hint); Escape closes (no hint)
  document.addEventListener("click", function (e) {
    if (open && !root.contains(e.target)) closePanel(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) closePanel(false);
  });

  // Language toggle → re-localize the UI, re-pick the matching voice
  // (same Bubble personality), and if the guide is open, re-narrate
  // the current section in the new language so it never mixes.
  new MutationObserver(function () {
    applyStaticLabels();
    voice.refresh();
    if (open) {
      var sec = monitor.current() || "hero";
      renderMessage(sec);
      speakSection(sec);          // best-effort (may be blocked without a gesture on iOS)
    } else {
      stopSpeech();
    }
    if (tip.classList.contains("show")) hideTip();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  // One-time friendly welcome (once per session, only if not opened yet)
  if (!ssGet(SS_WELCOME)) {
    setTimeout(function () {
      if (!open) { showTip(UI[lang()].welcome, 6000); }
      ssSet(SS_WELCOME, "1");
    }, 1600);
  }
})();
