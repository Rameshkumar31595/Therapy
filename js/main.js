/* ═══════════════════════════════════════════════════════════
   SUSHRUTA KERALA MASSAGE THERAPY — interactions & motion
   All animation uses transform/opacity only (GPU-friendly)
   and respects prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ── Mobile navigation ───────────────────────────────────── */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  function closeNav() {
    mainNav.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  navToggle.addEventListener("click", function () {
    var open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("active", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mainNav.classList.contains("open")) closeNav();
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
    function updateParallax() {
      var y = window.scrollY;
      parallaxEls.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
        el.style.transform = "translate3d(0," + (y * speed).toFixed(1) + "px,0)";
      });
      pxTicking = false;
    }
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
      var size = rand(14, 34);                 // px — small & distant
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
})();
