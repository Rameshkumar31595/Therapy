/* ═══════════════════════════════════════════════════════════
   SUSHRUTA — CERTIFICATIONS & CREDENTIALS
   Renders the certificate cards in #certGrid from the manifest
   below.

   MUST be loaded BEFORE js/main.js: main.js scans the DOM once
   for [data-i18n] (bilingual text) and .reveal (scroll fade-in),
   so the cards have to exist by then.

   Adding a certificate:
     1. Drop the PDF or image into Certificates/
     2. PDFs only: run generate-cert-previews.py (project root)
        to create the card thumbnail in Certificates/previews/
     3. Add one entry to CERTIFICATES below.
   PDFs open in a new tab; images open in an on-page lightbox.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CERTIFICATES = [
    {
      file: "Certificates/Jampani Bhavana.pdf",
      preview: "Certificates/previews/jampani-bhavana.webp",
      name: "Jampani Bhavana",
      alt: "Government-issued Ayurveda Therapist certificate of Jampani Bhavana, " +
           "1200 hours of training, NSQF Level 4, recognised by NCVET, " +
           "issued under the Additional Skill Acquisition Programme, Kerala"
    },
    {
      file: "Certificates/Rahul Ashok Sakamuri.pdf",
      preview: "Certificates/previews/rahul-ashok-sakamuri.webp",
      name: "Rahul Ashok Sakamuri",
      alt: "Government-issued Ayurveda Therapist certificate of Rahul Ashok Sakamuri, " +
           "1200 hours of training, NSQF Level 4, recognised by NCVET, " +
           "issued under the Additional Skill Acquisition Programme, Kerala"
    }
  ];

  var grid = document.getElementById("certGrid");
  if (!grid) return;

  function isPdf(path) { return /\.pdf$/i.test(path); }

  /* ── Lightbox (used for image certificates) ─────────────── */
  var lightbox = null;

  function openLightbox(src, alt) {
    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.className = "cert-lightbox";
      lightbox.innerHTML =
        '<div class="cert-lightbox-backdrop"></div>' +
        '<figure class="cert-lightbox-body">' +
        '  <button type="button" class="cert-lightbox-close" aria-label="Close">&times;</button>' +
        '  <img src="" alt="" />' +
        "</figure>";
      document.body.appendChild(lightbox);
      lightbox.addEventListener("click", function (e) {
        if (e.target.closest(".cert-lightbox-close") ||
            e.target.classList.contains("cert-lightbox-backdrop")) closeLightbox();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeLightbox();
      });
    }
    var img = lightbox.querySelector("img");
    img.src = src;
    img.alt = alt;
    lightbox.classList.add("open");
    document.body.classList.add("cert-lightbox-open");
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove("open");
      document.body.classList.remove("cert-lightbox-open");
    }
  }

  /* ── Cards ──────────────────────────────────────────────── */
  CERTIFICATES.forEach(function (cert) {
    var href = encodeURI(cert.file);
    var card = document.createElement("article");
    card.className = "cert-card reveal";

    var openAttrs = 'href="' + href + '" target="_blank" rel="noopener"';
    card.innerHTML =
      '<a class="cert-preview" ' + openAttrs + ">" +
      '  <img src="' + encodeURI(cert.preview || cert.file) + '" alt="' + cert.alt + '" loading="lazy" />' +
      "</a>" +
      '<div class="cert-body">' +
      '  <h3 class="cert-name">' + cert.name + "</h3>" +
      '  <p class="cert-role" data-i18n="cred.role">Certified Ayurveda Therapist · NSQF Level 4</p>' +
      '  <p class="cert-issuer" data-i18n="cred.issuer">ASAP Kerala · Recognised by NCVET, Government of India</p>' +
      '  <p class="cert-meta" data-i18n="cred.meta">1200 hours of training · Sree Chithra Ayurveda, Thrissur, Kerala</p>' +
      '  <a class="btn btn-gold cert-view" ' + openAttrs + ' data-i18n="cred.view">View Full Certificate</a>' +
      "</div>";

    if (!isPdf(cert.file)) {
      // Image certificates open in the lightbox instead of a tab
      card.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          openLightbox(cert.file, cert.alt);
        });
      });
    }
    grid.appendChild(card);
  });
})();
