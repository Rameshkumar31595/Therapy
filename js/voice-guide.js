/* ═══════════════════════════════════════════════════════════
   SUSHRUTA — THERAPY VOICE GUIDE
   A therapist personally introduces each therapy, in the
   language the visitor is browsing in (html[lang]).

   Modular by design:
   · Audio files are plain MP3s under /audio/<lang>/, named
     "<therapy>.mp3" (e.g. audio/te/abhyanga45.mp3), generated
     fully offline by generate-audio.py in the project root
     (no cloud APIs). Regenerate or replace them any time —
     no code changes.
   · Audio is created lazily on first listen (no page-load cost).
   · Language switches are observed live; if the visitor changes
     language while the modal is open, the voice follows.

   Debugging:
   · Set DEBUG = true (below) for detailed "[VoiceGuide]" console
     logs of every step: selection, src, load, metadata, errors.
   · Call voiceGuideDebug() in the console at any time to dump
     the live audio state (src, duration, readyState, …).
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Configuration ─────────────────────────────────────── */
  var AUDIO_BASE = "audio/";
  var AUDIO_EXT = ".mp3";
  // Cache-buster: bump whenever MP3s are regenerated, otherwise
  // browsers keep playing the previously downloaded versions.
  var AUDIO_VERSION = "2026-07-04b";
  var DEBUG = true; // set to false for production once audio works

  var THERAPIES = {
    padaabhyanga: {
      file: "padaabhyanga",
      name: { en: "Padaabhyanga", te: "పాదాభ్యంగం" },
      tag:  { en: "Foot & Leg Massage", te: "పాదాలు & కాళ్ల మసాజ్" }
    },
    abhyanga45: {
      file: "abhyanga45",
      name: { en: "Abhyanga", te: "అభ్యంగం" },
      tag:  { en: "Full Body Oil Massage · 45 min", te: "ఫుల్ బాడీ ఆయిల్ మసాజ్ · 45 నిమిషాలు" }
    },
    abhyanga60: {
      file: "abhyanga60",
      name: { en: "Abhyanga Extended", te: "అభ్యంగం ఎక్స్‌టెండెడ్" },
      tag:  { en: "Full Body Oil Massage · 60 min", te: "ఫుల్ బాడీ ఆయిల్ మసాజ్ · 60 నిమిషాలు" }
    },
    potli: {
      file: "potli",
      name: { en: "Hot Herbal Potli", te: "హాట్ హెర్బల్ పోట్లి" },
      tag:  { en: "Herbal Pouch Massage", te: "హెర్బల్ పోట్లి మసాజ్" }
    },
    shirodhara: {
      file: "shirodhara",
      name: { en: "Shirodhara", te: "శిరోధార" },
      tag:  { en: "Warm Oil Head Therapy", te: "వేడి నూనె హెడ్ థెరపీ" }
    },
    pizhichil: {
      file: "pizhichil",
      name: { en: "Pizhichil", te: "పిళిచిల్" },
      tag:  { en: "Traditional Kerala Oil Therapy", te: "సంప్రదాయ కేరళ ఆయిల్ థెరపీ" }
    }
  };

  var UI = {
    en: {
      eyebrow: "A word from your therapist",
      loading: "Preparing your therapist's voice…",
      errMissing: "Audio file missing. This narration hasn't been added to the website yet.",
      errNetwork: "Couldn't load the audio. Please check your internet connection and try again.",
      errDecode: "This audio file can't be played. It may be corrupted or in an unsupported format.",
      errBlocked: "The browser paused playback. Please tap the play button.",
      close: "Close", play: "Play", pause: "Pause",
      stop: "Stop", replay: "Replay from beginning", seek: "Audio progress",
      speed: "Playback speed"
    },
    te: {
      eyebrow: "మీ థెరపిస్ట్ మాటల్లో",
      loading: "ఆడియో సిద్ధమవుతోంది…",
      errMissing: "ఆడియో ఫైల్ లేదు. ఈ థెరపీ నెరేషన్ ఇంకా వెబ్‌సైట్‌కి జోడించలేదు.",
      errNetwork: "ఆడియో లోడ్ కాలేదు. మీ ఇంటర్నెట్ కనెక్షన్ చూసి మళ్లీ ప్రయత్నించండి.",
      errDecode: "ఈ ఆడియో ఫైల్ ప్లే అవ్వడం లేదు. ఫైల్ ఫార్మాట్ సపోర్ట్ కాకపోవచ్చు.",
      errBlocked: "బ్రౌజర్ ప్లేబ్యాక్ ఆపింది. ప్లే బటన్ నొక్కండి.",
      close: "మూసివేయండి", play: "ప్లే", pause: "పాజ్",
      stop: "ఆపండి", replay: "మొదటి నుంచి వినండి", seek: "ఆడియో ప్రోగ్రెస్",
      speed: "ప్లేబ్యాక్ వేగం"
    }
  };

  function log() {
    if (DEBUG && window.console && console.log) {
      console.log.apply(console, ["[VoiceGuide]"].concat([].slice.call(arguments)));
    }
  }

  /* ── Elements ──────────────────────────────────────────── */
  var modal = document.getElementById("voiceModal");
  if (!modal) {
    log("FATAL: #voiceModal not found in the DOM — modal markup missing.");
    return;
  }

  var els = {
    eyebrow: document.getElementById("voiceEyebrow"),
    name: document.getElementById("voiceTherapyName"),
    tag: document.getElementById("voiceTherapyTag"),
    seek: document.getElementById("voiceSeek"),
    cur: document.getElementById("voiceCur"),
    dur: document.getElementById("voiceDur"),
    play: document.getElementById("voicePlay"),
    stop: document.getElementById("voiceStop"),
    replay: document.getElementById("voiceReplay"),
    speed: document.getElementById("voiceSpeed"),
    close: document.getElementById("voiceClose"),
    status: document.getElementById("voiceStatus")
  };

  /* ── State ─────────────────────────────────────────────── */
  var cache = {};          // "therapy-lang" -> HTMLAudioElement
  var audio = null;        // currently active element
  var currentId = null;
  var seeking = false;
  var hideTimer = null;

  /* Playback speed: cycles 1× → 1.5× → 2×; remembered across visits */
  var SPEEDS = [1, 1.5, 2];
  var SPEED_KEY = "voiceGuideSpeed";
  var speed = 1;
  try {
    var saved = parseFloat(localStorage.getItem(SPEED_KEY));
    if (SPEEDS.indexOf(saved) !== -1) speed = saved;
  } catch (err) { /* storage unavailable — session default */ }

  function applySpeed(a) {
    a.playbackRate = speed;
    // keep the natural voice pitch when sped up
    if ("preservesPitch" in a) a.preservesPitch = true;
    else if ("webkitPreservesPitch" in a) a.webkitPreservesPitch = true;
  }

  function renderSpeed() {
    els.speed.textContent = (speed === 1 ? "1" : String(speed)) + "×";
    els.speed.classList.toggle("active", speed !== 1);
    els.speed.setAttribute("aria-label", t("speed") + " " + speed + "×");
  }

  function lang() {
    return document.documentElement.getAttribute("lang") === "te" ? "te" : "en";
  }
  function t(key) { return UI[lang()][key]; }

  function fmt(sec) {
    if (!isFinite(sec) || sec < 0) return "--:--";
    sec = Math.floor(sec);
    return Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);
  }

  function audioState(a) {
    return a ? {
      src: a.currentSrc || a.src,
      duration: a.duration,
      currentTime: a.currentTime,
      readyState: a.readyState,     // 0 HAVE_NOTHING … 4 HAVE_ENOUGH_DATA
      networkState: a.networkState, // 0 EMPTY, 1 IDLE, 2 LOADING, 3 NO_SOURCE
      paused: a.paused,
      errorCode: a.error ? a.error.code : null,
      errorMessage: a.error ? a.error.message : null
    } : null;
  }

  /* Console helper: dump the live player state at any moment */
  window.voiceGuideDebug = function () {
    var s = {
      therapy: currentId,
      language: lang(),
      modalOpen: !modal.hidden,
      audio: audioState(audio),
      cachedKeys: Object.keys(cache)
    };
    console.log("[VoiceGuide] state:", s);
    return s;
  };

  /* ── Audio (lazy, cached per therapy + language) ───────── */
  function getAudio(id, lg) {
    var key = id + "-" + lg;
    if (!cache[key]) {
      var a = new Audio();
      a.preload = "none"; // nothing downloads until the visitor listens
      a.src = AUDIO_BASE + lg + "/" + THERAPIES[id].file + AUDIO_EXT
        // query strings can upset file:// playback — only add on http(s)
        + (location.protocol === "file:" ? "" : "?v=" + AUDIO_VERSION);
      log("Creating audio element:", a.src);
      bindAudio(a);
      cache[key] = a;
    }
    return cache[key];
  }

  /* Decide which error message fits, then verify with a HEAD
     request so "file missing" vs "network" vs "bad file" is
     reported precisely (the media error code alone can't
     distinguish a 404 from an unsupported format). */
  function diagnoseError(a) {
    var code = a.error ? a.error.code : 0;
    log("Audio error:", audioState(a));

    // First guess from the MediaError code:
    // 1 ABORTED, 2 NETWORK, 3 DECODE, 4 SRC_NOT_SUPPORTED (includes 404s)
    setStatus(code === 2 ? "errNetwork" : code === 3 ? "errDecode" : "errMissing");

    if (!window.fetch || location.protocol === "file:") return;
    fetch(a.src, { method: "HEAD", cache: "no-store" })
      .then(function (res) {
        log("Diagnostic HEAD", a.src, "→ HTTP", res.status);
        if (a !== audio) return; // user moved on
        if (res.status === 404) setStatus("errMissing");
        else if (res.ok && code) setStatus("errDecode"); // file exists → format problem
        else if (!res.ok) setStatus("errNetwork");
      })
      .catch(function (err) {
        log("Diagnostic HEAD failed (offline / server down?):", err && err.message);
        if (a === audio) setStatus("errNetwork");
      });
  }

  function bindAudio(a) {
    a.addEventListener("loadedmetadata", function () {
      log("Metadata loaded:", audioState(a));
      if (a !== audio) return;
      els.dur.textContent = fmt(a.duration);
      els.seek.disabled = false;
    });
    a.addEventListener("canplay", function () {
      log("Audio ready (canplay):", a.currentSrc || a.src);
    });
    a.addEventListener("timeupdate", function () {
      if (a !== audio || seeking) return;
      updateProgress();
    });
    a.addEventListener("play", function () {
      if (a !== audio) return;
      setPlaying(true);
    });
    a.addEventListener("playing", function () {
      log("Playing:", a.currentSrc || a.src);
      if (a !== audio) return;
      setStatus(null);
    });
    a.addEventListener("pause", function () {
      if (a !== audio) return;
      setPlaying(false);
    });
    a.addEventListener("waiting", function () {
      if (a !== audio) return;
      setStatus("loading");
    });
    a.addEventListener("seeked", function () {
      log("Seeked to:", +a.currentTime.toFixed(2));
      if (a !== audio) return;
      setStatus(null);
      if (!seeking) updateProgress();
    });
    a.addEventListener("ended", function () {
      log("Ended:", a.currentSrc || a.src);
      if (a !== audio) return;
      a.currentTime = 0;
      setPlaying(false);
      updateProgress();
    });
    a.addEventListener("error", function () {
      if (a !== audio) { log("Error on inactive audio:", a.src); return; }
      setPlaying(false);
      diagnoseError(a);
    });
  }

  /* ── UI helpers ────────────────────────────────────────── */
  function setPlaying(on) {
    modal.classList.toggle("playing", on);
    els.play.setAttribute("aria-label", on ? t("pause") : t("play"));
  }

  function setStatus(key) {
    if (!key) {
      els.status.hidden = true;
      els.status.classList.remove("error");
      return;
    }
    els.status.textContent = t(key);
    els.status.classList.toggle("error", key.indexOf("err") === 0);
    els.status.hidden = false;
  }

  function updateProgress() {
    var d = audio && isFinite(audio.duration) ? audio.duration : 0;
    var c = audio ? audio.currentTime : 0;
    var pct = d ? (c / d) * 100 : 0;
    els.seek.value = pct;
    els.seek.style.setProperty("--p", pct + "%");
    els.cur.textContent = fmt(c);
    if (d) els.dur.textContent = fmt(d);
  }

  function renderTexts() {
    var lg = lang();
    els.eyebrow.textContent = UI[lg].eyebrow;
    if (currentId) {
      els.name.textContent = THERAPIES[currentId].name[lg];
      els.tag.textContent = THERAPIES[currentId].tag[lg];
    }
    els.close.setAttribute("aria-label", UI[lg].close);
    els.stop.setAttribute("aria-label", UI[lg].stop);
    els.replay.setAttribute("aria-label", UI[lg].replay);
    els.seek.setAttribute("aria-label", UI[lg].seek);
    els.play.setAttribute("aria-label",
      audio && !audio.paused ? UI[lg].pause : UI[lg].play);
    renderSpeed();
  }

  /* ── Playback control ──────────────────────────────────── */
  function play() {
    if (!audio) return;
    log("play() requested:", audioState(audio));
    setStatus("loading");
    var p = audio.play();
    if (p && p.catch) {
      p.then(function () { setStatus(null); })
       .catch(function (err) {
         log("play() rejected:", err && err.name, "—", err && err.message);
         if (err && err.name === "NotAllowedError") {
           // Autoplay policy blocked it — a direct tap on Play will work
           setStatus("errBlocked");
         } else if (audio && audio.error) {
           diagnoseError(audio); // load failure — classify it precisely
         } else {
           setStatus(null);
         }
       });
    }
  }

  function setAudio(a, autoplay) {
    if (audio && audio !== a && !audio.paused) audio.pause();
    audio = a;
    applySpeed(a);
    els.seek.disabled = !isFinite(a.duration) || !a.duration;
    setPlaying(!a.paused && !a.ended);
    setStatus(null);
    updateProgress();
    els.dur.textContent = isFinite(a.duration) && a.duration ? fmt(a.duration) : "--:--";
    if (autoplay) play();
  }

  /* ── Modal open / close ────────────────────────────────── */
  function open(id) {
    if (!THERAPIES[id]) {
      log("Unknown therapy id:", id, "— check data-therapy attributes.");
      return;
    }
    clearTimeout(hideTimer);
    var resume = id === currentId; // same card reopened → resume position
    currentId = id;
    log("Therapy selected:", id, "| language:", lang(),
        "| audio src:", AUDIO_BASE + lang() + "/" + THERAPIES[id].file + AUDIO_EXT);
    renderTexts();
    setAudio(getAudio(id, lang()), true);
    if (!resume && audio) audio.currentTime = 0;

    modal.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { modal.classList.add("open"); });
    });
    document.body.classList.add("voice-open");
    els.play.focus();
  }

  function close() {
    if (modal.hidden) return;
    if (audio && !audio.paused) audio.pause(); // keeps position for resume
    modal.classList.remove("open");
    document.body.classList.remove("voice-open");
    hideTimer = setTimeout(function () { modal.hidden = true; }, 400);
  }

  /* ── Wire up controls ──────────────────────────────────── */
  var listenBtns = document.querySelectorAll(".service-listen");
  log("Initialised —", listenBtns.length, "listen buttons found.");
  listenBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      open(btn.getAttribute("data-therapy"));
    });
  });

  els.play.addEventListener("click", function () {
    if (!audio) return;
    if (audio.paused) play();
    else audio.pause();
  });

  els.stop.addEventListener("click", function () {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    updateProgress();
  });

  els.replay.addEventListener("click", function () {
    if (!audio) return;
    audio.currentTime = 0;
    updateProgress();
    play();
  });

  els.speed.addEventListener("click", function () {
    speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    log("Playback speed:", speed + "×");
    if (audio) applySpeed(audio);
    renderSpeed();
    try { localStorage.setItem(SPEED_KEY, String(speed)); } catch (err) {}
  });
  renderSpeed();

  /* ── Seeking / scrubbing ───────────────────────────────────
     Pointer-based: tap anywhere on the bar to jump, drag the
     thumb for a live preview, release to seek. Pointer Events
     cover mouse, touch and pen with one code path; position is
     computed from the bar's bounding box + clientX, clamped to
     [0,1], against the FRESH duration at release time. The
     input/change listeners below remain only for keyboard
     (arrow-key) accessibility. */
  var dragging = false;

  function pctFromPointer(e) {
    var rect = els.seek.getBoundingClientRect();
    if (!rect.width) return 0;
    var pct = (e.clientX - rect.left) / rect.width;
    return Math.min(1, Math.max(0, pct));
  }

  function previewPct(pct) {
    els.seek.value = pct * 100;
    els.seek.style.setProperty("--p", (pct * 100) + "%");
    if (audio && isFinite(audio.duration) && audio.duration) {
      els.cur.textContent = fmt(pct * audio.duration);
    }
  }

  function seekToPct(pct, e) {
    if (!audio) return;
    var d = audio.duration; // read fresh — never a cached value
    if (!isFinite(d) || d <= 0) return;
    // keep a hair below duration so we don't trip 'ended'
    var target = Math.min(pct * d, Math.max(0, d - 0.05));
    if (DEBUG) {
      var seekEnd = audio.seekable && audio.seekable.length
        ? audio.seekable.end(audio.seekable.length - 1) : 0;
      log("Seek:", {
        clientX: e && e.clientX,
        pct: +pct.toFixed(4),
        duration: +d.toFixed(2),
        target: +target.toFixed(2),
        seekableEnd: +seekEnd.toFixed(2) // < target ⇒ server lacks Range support
      });
    }
    audio.currentTime = target;
    updateProgress();
  }

  if (window.PointerEvent) {
    els.seek.addEventListener("pointerdown", function (e) {
      if (els.seek.disabled || (e.pointerType === "mouse" && e.button !== 0)) return;
      e.preventDefault(); // we drive the thumb ourselves
      dragging = true;
      seeking = true;     // blocks timeupdate from stomping the preview
      try { els.seek.setPointerCapture(e.pointerId); } catch (err) {}
      previewPct(pctFromPointer(e));
    });
    els.seek.addEventListener("pointermove", function (e) {
      if (dragging) previewPct(pctFromPointer(e));
    });
    els.seek.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false;
      seekToPct(pctFromPointer(e), e);
      seeking = false;
    });
    els.seek.addEventListener("pointercancel", function () {
      // gesture taken over (e.g. scroll) — abandon without seeking
      dragging = false;
      seeking = false;
      updateProgress();
    });
  }

  /* Keyboard accessibility (arrow keys on the focused slider) */
  els.seek.addEventListener("input", function () {
    if (dragging) return;
    seeking = true;
    previewPct(els.seek.value / 100);
  });
  els.seek.addEventListener("change", function () {
    if (dragging) return;
    seekToPct(els.seek.value / 100, null);
    seeking = false;
  });

  modal.querySelectorAll("[data-voice-close]").forEach(function (el) {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });

  /* ── Live language sync ────────────────────────────────────
     The site's language selector sets html[lang]. Watch it, so
     the voice always matches the language on screen — even if
     the visitor switches while the modal is open. */
  new MutationObserver(function () {
    if (modal.hidden || !currentId) return;
    log("Language changed to:", lang(), "— switching narration.");
    var next = getAudio(currentId, lang());
    if (next === audio) { renderTexts(); return; }
    var wasPlaying = audio && !audio.paused;
    if (audio && !audio.paused) audio.pause();
    next.currentTime = 0;
    renderTexts();
    setAudio(next, wasPlaying); // restart narration in the new language
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
})();
