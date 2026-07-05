/* ═══════════════════════════════════════════════════════════
   SUSHRUTA — WHATSAPP APPOINTMENT BOOKING
   No backend, no email, no OTP: the form validates locally and
   opens WhatsApp with a pre-filled booking message to the owner.

   ── CONFIGURATION ──
   To change the owner's WhatsApp number, edit OWNER_WHATSAPP
   below (country code + number, digits only). This is the ONLY
   place the booking system reads it from.

   Business rule: therapists are assigned automatically by the
   customer's gender (male → male therapist, female → lady
   therapist). Customers never pick a therapist.
   ═══════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var OWNER_WHATSAPP = "919502477334";

  /* ── FEATURE FLAG: Home / Doorstep service ────────────────
     Home (doorstep) service is temporarily paused — the site
     currently operates as CLINIC ONLY. While this is false the
     booking form hides the "Session Type" chooser, treats every
     request as "At Clinic", and adds the clinic address to the
     WhatsApp message.

     To bring doorstep service back later, simply set this to
     true — no other change is required. All home-service logic
     (HOME_THERAPIES, Home Visit handling, etc.) is preserved. */
  var HOME_SERVICE_ENABLED = false;

  /* Clinic address (one line per part for clean WhatsApp rendering)
     + Google Maps link. Kept in Latin script in both languages, as
     these are proper nouns the owner reads off to locate the booking. */
  var CLINIC_ADDRESS_LINES = [
    "Venkata Ramana Enclave,",
    "4th Line,",
    "Prakash Nagar,",
    "Varababu Hospital Road,",
    "Narasaraopet,",
    "Andhra Pradesh"
  ];
  var CLINIC_MAPS_URL =
    "https://www.google.com/maps/search/?api=1&query=16.2309877,80.04908";

  var form = document.getElementById("bookingForm");
  if (!form) return;

  var els = {
    name: document.getElementById("bkName"),
    phone: document.getElementById("bkPhone"),
    session: document.getElementById("bkSession"),
    therapy: document.getElementById("bkTherapy"),
    steam: document.getElementById("bkSteam"),
    date: document.getElementById("bkDate"),
    time: document.getElementById("bkTime"),
    notes: document.getElementById("bkNotes"),
    submit: document.getElementById("bkSubmit"),
    success: document.getElementById("bookingSuccess"),
    waContact: document.getElementById("bkWaContact"),
    continueBtn: document.getElementById("bkContinue")
  };

  els.waContact.href = "https://wa.me/" + OWNER_WHATSAPP;

  function lang() {
    return document.documentElement.getAttribute("lang") === "te" ? "te" : "en";
  }

  /* ── Bilingual strings (errors, placeholders, states) ───── */
  var T = {
    en: {
      errName: "Please tell us your name.",
      errPhone: "Please enter your mobile number.",
      errPhoneFormat: "Please enter a valid 10-digit Indian mobile number.",
      errSession: "Please choose Home or Clinic first.",
      errTherapy: "Please choose a therapy.",
      errDate: "Please pick your preferred date.",
      errDatePast: "That date has already passed — please pick today or a future date.",
      errTime: "Please choose a preferred time.",
      errGender: "Please select your gender so we can assign the right therapist.",
      sending: "Opening WhatsApp…",
      namePh: "Your name",
      phonePh: "10-digit mobile number",
      sessionPh: "Select Home or Clinic…",
      sessionNote: "Home visits support only Padaabhyanga, Abhyanga, and Abhyanga Extended. At clinic, all therapies are available.",
      therapyNote: "Some therapies need special equipment that is only available at the clinic.",
      notesPh: "Anything we should know — health conditions, preferences…"
    },
    te: {
      errName: "దయచేసి మీ పేరు రాయండి.",
      errPhone: "దయచేసి మీ మొబైల్ నంబర్ ఇవ్వండి.",
      errPhoneFormat: "దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.",
      errSession: "దయచేసి ముందు ఇంటి వద్ద లేదా క్లినిక్‌ను ఎంచుకోండి.",
      errTherapy: "దయచేసి ఒక థెరపీ ఎంచుకోండి.",
      errDate: "దయచేసి మీకు అనుకూలమైన తేదీ ఎంచుకోండి.",
      errDatePast: "ఆ తేదీ దాటిపోయింది — ఈరోజు లేదా రాబోయే తేదీ ఎంచుకోండి.",
      errTime: "దయచేసి సమయం ఎంచుకోండి.",
      errGender: "సరైన థెరపిస్ట్‌ను కేటాయించేందుకు జెండర్ ఎంచుకోండి.",
      sending: "వాట్సాప్ తెరుస్తున్నాం…",
      namePh: "మీ పేరు",
      phonePh: "10 అంకెల మొబైల్ నంబర్",
      sessionPh: "ఇంటి వద్ద లేదా క్లినిక్ ఎంచుకోండి…",
      sessionNote: "ఇంటి వద్ద సేవలో Padaabhyanga, Abhyanga, Abhyanga Extended మాత్రమే అందుబాటులో ఉంటాయి. క్లినిక్‌లో అన్ని థెరపీలు అందుబాటులో ఉంటాయి.",
      therapyNote: "కొన్ని థెరపీలకు అవసరమైన ప్రత్యేక పరికరాలు కేవలం క్లినిక్‌లో మాత్రమే అందుబాటులో ఉంటాయి.",
      notesPh: "మేము తెలుసుకోవాల్సినవి — ఆరోగ్య విషయాలు, ఇష్టాలు…"
    }
  };
  function t(key) { return T[lang()][key]; }

  /* ── WhatsApp message strings (fully localized) ───────────────
     The generated booking message is built entirely from ONE of
     these two blocks depending on the active site language, so the
     message is never mixed-language. Month/day names are kept here
     (not Intl.toLocaleDateString) so desktop, Android and iPhone all
     produce a byte-identical message regardless of device locale. */
  var MSG = {
    en: {
      header: "Sushruta Kerala Massage Therapy",
      title: "Appointment Request",
      patient: "Patient",
      contact: "Contact",
      therapy: "Therapy",
      steam: "Herbal Steam",
      steamYes: "Yes (+₹200)",
      date: "Date",
      time: "Time",
      therapist: "Therapist",
      maleT: "Male Therapist",
      femaleT: "Female Therapist",
      clinic: "Clinic Location",
      directions: "Directions",
      notes: "Notes",
      confirm: "Kindly confirm appointment availability.",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"],
      therapies: {
        "Padaabhyanga": "Padaabhyanga",
        "Abhyanga": "Abhyanga",
        "Abhyanga Extended": "Abhyanga (Extended)",
        "Hot Herbal Potli": "Hot Herbal Potli",
        "Shirodhara": "Shirodhara",
        "Pizhichil": "Pizhichil"
      }
    },
    te: {
      header: "సుశ్రుత కేరళ మసాజ్ థెరపీ",
      title: "అపాయింట్‌మెంట్ అభ్యర్థన",
      patient: "పేరు",
      contact: "ఫోన్",
      therapy: "థెరపీ",
      steam: "హెర్బల్ స్టీమ్",
      steamYes: "అవును (+₹200)",
      date: "తేదీ",
      time: "సమయం",
      therapist: "థెరపిస్ట్",
      maleT: "పురుష థెరపిస్ట్",
      femaleT: "మహిళా థెరపిస్ట్",
      clinic: "క్లినిక్ చిరునామా",
      directions: "మార్గం",
      notes: "గమనికలు",
      confirm: "దయచేసి అపాయింట్‌మెంట్ లభ్యతను నిర్ధారించండి.",
      days: ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"],
      months: ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్",
               "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"],
      therapies: {
        "Padaabhyanga": "పాదాభ్యంగ",
        "Abhyanga": "అభ్యంగ",
        "Abhyanga Extended": "అభ్యంగ (ఎక్స్‌టెండెడ్)",
        "Hot Herbal Potli": "హాట్ హెర్బల్ పోట్లి",
        "Shirodhara": "శిరోధార",
        "Pizhichil": "పిజిచిల్"
      }
    }
  };
  function m() { return MSG[lang()]; }

  var HOME_THERAPIES = {
    "Padaabhyanga": true,
    "Abhyanga": true,
    "Abhyanga Extended": true
  };

  var CLINIC_THERAPIES = {
    "Padaabhyanga": true,
    "Abhyanga": true,
    "Abhyanga Extended": true,
    "Hot Herbal Potli": true,
    "Shirodhara": true,
    "Pizhichil": true
  };

  function therapyAllowedForSession(therapy, sessionType) {
    if (!therapy || !sessionType) return false;
    if (sessionType === "Home Visit") return !!HOME_THERAPIES[therapy];
    if (sessionType === "At Clinic") return !!CLINIC_THERAPIES[therapy];
    return false;
  }

  /* Placeholders follow the site language (main.js only swaps
     innerHTML of [data-i18n]; placeholders are attributes). */
  function applyPlaceholders() {
    els.name.placeholder = t("namePh");
    els.phone.placeholder = t("phonePh");
    if (els.session && !els.session.value) {
      els.session.options[0].textContent = t("sessionPh");
    }
    els.notes.placeholder = t("notesPh");
  }
  applyPlaceholders();
  new MutationObserver(applyPlaceholders)
    .observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  /* ── Date: local today as yyyy-mm-dd; block past dates ──── */
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" +
      ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
      ("0" + d.getDate()).slice(-2);
  }
  els.date.min = todayISO();

  function updateTherapies() {
    var sessionType = els.session.value;

    els.therapy.disabled = !sessionType;

    Array.prototype.forEach.call(els.therapy.options, function (option) {
      if (!option.value) return;

      var allowed = therapyAllowedForSession(option.value, sessionType);
      option.disabled = !allowed;
      option.hidden = false;
    });

    if (!therapyAllowedForSession(els.therapy.value, sessionType)) {
      els.therapy.value = "";
    }
  }

  /* ── CLINIC-ONLY MODE ─────────────────────────────────────
     When home service is paused, lock the session to "At Clinic",
     hide the Session Type chooser and the clinic-only equipment
     note (both only make sense when Home vs Clinic is offered). */
  if (!HOME_SERVICE_ENABLED && els.session) {
    els.session.value = "At Clinic";
    var sessionField = els.session.closest(".bk-field");
    if (sessionField) sessionField.style.display = "none";
    var clinicNote = form.querySelector(".bk-note-right");
    if (clinicNote) clinicNote.style.display = "none";
  }

  updateTherapies();
  els.session.addEventListener("change", function () {
    setError(els.session, "bkSessionErr", null);
    setError(els.therapy, "bkTherapyErr", null);
    updateTherapies();
  });
  els.session.addEventListener("input", function () {
    setError(els.session, "bkSessionErr", null);
  });

  /* ── Validation ─────────────────────────────────────────── */
  function setError(field, id, msg) {
    var p = document.getElementById(id);
    if (msg) {
      p.textContent = msg;
      p.hidden = false;
      if (field) field.setAttribute("aria-invalid", "true");
      return false;
    }
    p.hidden = true;
    if (field) field.removeAttribute("aria-invalid");
    return true;
  }

  function radioValue(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function validate() {
    var ok = true, firstBad = null;

    function check(valid, field, errId, msg) {
      var pass = setError(field, errId, valid ? null : msg);
      if (!pass && ok) { ok = false; firstBad = field; }
      return pass;
    }

    check(els.name.value.trim().length >= 2, els.name, "bkNameErr", t("errName"));

    var digits = els.phone.value.replace(/[\s\-()]/g, "");
    if (!digits) {
      check(false, els.phone, "bkPhoneErr", t("errPhone"));
    } else {
      check(/^(\+?91)?[6-9]\d{9}$/.test(digits), els.phone, "bkPhoneErr", t("errPhoneFormat"));
    }

    check(!!els.session.value, els.session, "bkSessionErr", t("errSession"));
    check(!!els.therapy.value, els.therapy, "bkTherapyErr", t("errTherapy"));

    if (!els.date.value) {
      check(false, els.date, "bkDateErr", t("errDate"));
    } else {
      check(els.date.value >= todayISO(), els.date, "bkDateErr", t("errDatePast"));
    }

    check(!!els.time.value, els.time, "bkTimeErr", t("errTime"));
    check(!!radioValue("gender"), null, "bkGenderErr", t("errGender"));

    if (firstBad) firstBad.focus();
    return ok;
  }

  /* Clear a field's error as soon as the visitor fixes it */
  [["name", "bkNameErr"], ["phone", "bkPhoneErr"], ["session", "bkSessionErr"], ["therapy", "bkTherapyErr"],
   ["date", "bkDateErr"], ["time", "bkTimeErr"]].forEach(function (pair) {
    els[pair[0]].addEventListener("input", function () { setError(els[pair[0]], pair[1], null); });
    els[pair[0]].addEventListener("change", function () { setError(els[pair[0]], pair[1], null); });
  });
  form.querySelectorAll('input[name="gender"]').forEach(function (r) {
    r.addEventListener("change", function () { setError(null, "bkGenderErr", null); });
  });

  /* ── WhatsApp message ───────────────────────────────────── */
  /* Device-independent date: getDay()/getMonth() are pure calendar
     math, so the same yyyy-mm-dd yields identical text everywhere. */
  function formatDate(iso) {
    var L = m();
    var p = iso.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return L.days[d.getDay()] + ", " + (+p[2]) + " " + L.months[+p[1] - 1] + " " + p[0];
  }

  /* Builds the full booking message in the ACTIVE site language.
     Optional rows (Herbal Steam, Notes) are only added when set —
     no empty placeholders, no "—"/"N/A". Address + Maps link are
     always present. Kept compact so the encoded wa.me payload stays
     well within mobile limits (nothing gets truncated). */
  function buildMessage() {
    var L = m();
    var gender = radioValue("gender");
    var therapist = gender === "Male" ? L.maleT : L.femaleT;
    var therapyName = L.therapies[els.therapy.value] || els.therapy.value;
    var notes = els.notes.value.trim();

    var p = [];
    p.push("✨ " + L.header);
    p.push("");
    p.push(L.title);
    p.push("");
    p.push("👤 " + L.patient + ": " + els.name.value.trim());
    p.push("📱 " + L.contact + ": " + els.phone.value.replace(/[\s\-()]/g, ""));
    p.push("");
    p.push("💆 " + L.therapy + ": " + therapyName);
    if (els.steam.checked) p.push("♨️ " + L.steam + ": " + L.steamYes);
    p.push("");
    p.push("📅 " + L.date + ": " + formatDate(els.date.value));
    p.push("🕒 " + L.time + ": " + els.time.value);
    p.push("");
    p.push("👨‍⚕️ " + L.therapist + ": " + therapist);
    p.push("");
    p.push("📍 " + L.clinic);
    p.push("");
    p.push(CLINIC_ADDRESS_LINES.join("\n"));
    p.push("");
    p.push("🗺️ " + L.directions);
    p.push("");
    p.push(CLINIC_MAPS_URL);
    if (notes) {
      p.push("");
      p.push("✍️ " + L.notes + ":");
      p.push(notes);
    }
    p.push("");
    p.push("🙏 " + L.confirm);

    return p.join("\n");
  }

  /* ── Submit → open WhatsApp → success panel ─────────────── */
  var submitLabel = els.submit.querySelector("span");

  /* Robust WhatsApp open (mobile + desktop).
     The whole message is encoded ONCE with encodeURIComponent, so the
     Maps URL's "&query=" travels as an opaque %26 and is never parsed
     as a separate parameter. We try a new tab (desktop keeps the site
     open); if the browser blocks it — common on mobile — we navigate
     the current tab instead, which lets the OS hand the wa.me link
     straight to the WhatsApp app so the text arrives intact. No
     "noopener" feature string (that made mobile treat it as a blocked
     popup and drop the payload). */
  function openWhatsApp(message) {
    var url = "https://wa.me/" + OWNER_WHATSAPP +
      "?text=" + encodeURIComponent(message);
    var win = window.open(url, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = url;
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    els.submit.disabled = true;
    var original = submitLabel.textContent;
    submitLabel.textContent = t("sending");

    openWhatsApp(buildMessage());

    setTimeout(function () {
      els.submit.disabled = false;
      submitLabel.textContent = original;
      form.hidden = true;
      els.success.hidden = false;
      els.success.classList.add("show");
      els.success.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 500);
  });

  /* Continue Browsing → restore the form for a new request */
  els.continueBtn.addEventListener("click", function () {
    els.success.classList.remove("show");
    els.success.hidden = true;
    form.hidden = false;
  });

  /* ── "Book" buttons: preselect therapy / steam add-on ───── */
  document.querySelectorAll("[data-book]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var therapy = btn.getAttribute("data-book");
      var sessionType = (HOME_SERVICE_ENABLED && therapyAllowedForSession(therapy, "Home Visit"))
        ? "Home Visit" : "At Clinic";

      els.session.value = sessionType;
      updateTherapies();
      els.therapy.value = therapy;
      setError(els.session, "bkSessionErr", null);
      setError(els.therapy, "bkTherapyErr", null);
      if (form.hidden) { /* success panel showing — bring form back */
        els.success.hidden = true;
        els.success.classList.remove("show");
        form.hidden = false;
      }
    });
  });
  document.querySelectorAll("[data-book-steam]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      els.steam.checked = true;
      if (form.hidden) {
        els.success.hidden = true;
        els.success.classList.remove("show");
        form.hidden = false;
      }
    });
  });
})();
