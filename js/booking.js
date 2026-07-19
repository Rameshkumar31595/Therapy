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

  /* ── TWO SERVICES ─────────────────────────────────────────
     The massage therapy center offers BOTH "At Massage Therapy Center" and "Home Service".
     Home Service is available ONLY for the three therapies that
     need no massage therapy center equipment (see HOME_THERAPIES). When Home
     Service is chosen a customer address is required; the WhatsApp message then
     carries that address instead of the massage therapy center address/map. */

  /* Massage Therapy Center address (one line per part for clean WhatsApp rendering)
     + Google Maps link. Kept in Latin script in both languages, as
     these are proper nouns the owner reads off to locate the booking. */
  var CENTER_ADDRESS_LINES = [
    "Venkata Ramana Enclave,",
    "4th Line,",
    "Prakash Nagar,",
    "Varababu Hospital Road,",
    "Narasaraopet,",
    "Andhra Pradesh"
  ];
  var CENTER_MAPS_URL =
    "https://www.google.com/maps/search/?api=1&query=16.2309877,80.04908";

  var form = document.getElementById("bookingForm");
  if (!form) return;

  var els = {
    name: document.getElementById("bkName"),
    phone: document.getElementById("bkPhone"),
    session: document.getElementById("bkSession"),
    therapy: document.getElementById("bkTherapy"),
    address: document.getElementById("bkAddress"),
    addressField: document.getElementById("bkAddressField"),
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
      errSession: "Please choose At Massage Therapy Center or Home Service first.",
      errTherapy: "Please choose a therapy.",
      errAddress: "Please enter your full home address for the visit.",
      errDate: "Please pick your preferred date.",
      errDatePast: "That date has already passed. Please pick today or a future date.",
      errTime: "Please choose a preferred time.",
      errGender: "Please select your gender so we can assign the right therapist.",
      sending: "Opening WhatsApp…",
      namePh: "Your name",
      phonePh: "10-digit mobile number",
      sessionPh: "Select service type…",
      sessionNote: "Home Service is available only for Siroabhyanga with Padaabhyanga Combo, Abhyanga Full Body and Abhyanga Full Body Extended Version. At the massage therapy center, all therapies are available.",
      therapyNote: "Some therapies need special equipment that is only available at the massage therapy center.",
      addressPh: "House / flat, street, area, landmark, town…",
      notesPh: "Anything we should know: health conditions, preferences…",
      errSaturdayCenter: "On Saturdays, the center is closed. Home service is available full day by appointment."
    },
    te: {
      errName: "దయచేసి మీ పేరు రాయండి.",
      errPhone: "దయచేసి మీ మొబైల్ నంబర్ ఇవ్వండి.",
      errPhoneFormat: "దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.",
      errSession: "దయచేసి ముందు మసాజ్ థెరపీ సెంటర్‌లో లేదా హోమ్ సర్వీస్ ఎంచుకోండి.",
      errTherapy: "దయచేసి ఒక థెరపీ ఎంచుకోండి.",
      errAddress: "దయచేసి హోమ్ సర్వీస్ కోసం మీ పూర్తి ఇంటి చిరునామా ఇవ్వండి.",
      errDate: "దయచేసి మీకు అనుకూలమైన తేదీ ఎంచుకోండి.",
      errDatePast: "ఆ తేదీ దాటిపోయింది. ఈరోజు లేదా రాబోయే తేదీ ఎంచుకోండి.",
      errTime: "దయచేసి సమయం ఎంచుకోండి.",
      errGender: "సరైన థెరపిస్ట్‌ను కేటాయించేందుకు జెండర్ ఎంచుకోండి.",
      sending: "వాట్సాప్ తెరుస్తున్నాం…",
      namePh: "మీ పేరు",
      phonePh: "10 అంకెల మొబైల్ నంబర్",
      sessionPh: "సేవ రకం ఎంచుకోండి…",
      sessionNote: "హోమ్ సర్వీస్ కేవలం సిరోఅభ్యంగ & పాదాభ్యంగ కాంబో, అభ్యంగ ఫుల్ బాడీ, అభ్యంగ ఫుల్ బాడీ ఎక్స్‌టెండెడ్ వెర్షన్ కోసం మాత్రమే అందుబాటులో ఉంది. మసాజ్ థెరపీ సెంటర్‌లో అన్ని థెరపీలు అందుబాటులో ఉంటాయి.",
      therapyNote: "కొన్ని థెరపీలకు అవసరమైన ప్రత్యేక పరికరాలు కేవలం మసాజ్ థెరపీ సెంటర్‌లో మాత్రమే అందుబాటులో ఉంటాయి.",
      addressPh: "ఇల్లు / ఫ్లాట్, వీధి, ఏరియా, ల్యాండ్‌మార్క్, ఊరు…",
      notesPh: "మేము తెలుసుకోవాల్సినవి: ఆరోగ్య విషయాలు, ఇష్టాలు…",
      errSaturdayCenter: "శనివారాల్లో సెంటర్ సెలవు. అపాయింట్‌మెంట్ ద్వారా హోమ్ సర్వీస్ పూర్తి రోజు అందుబాటులో ఉంటుంది."
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
      date: "Date",
      time: "Time",
      therapist: "Therapist",
      maleT: "Male Therapist",
      femaleT: "Female Therapist",
      serviceType: "Service Type",
      atCenterVal: "At Massage Therapy Center",
      homeVal: "Home Service",
      "massage therapy center": "Massage Therapy Center Location",
      custAddr: "Home Address",
      directions: "Directions",
      notes: "Notes",
      confirm: "Kindly confirm appointment availability.",
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"],
      therapies: {
        "Padaabhyanga": "Siroabhyanga with Padaabhyanga Combo",
        "Abhyanga": "Abhyanga Full Body",
        "Abhyanga Extended": "Abhyanga Full Body Extended Version",
        "Hot Potli": "Herbal Potli Therapy",
        "Shirodhara": "Shirodhara Warm Oil Head Bath",
        "Pizhichil": "Pizhichil Royal Warm Oil Bath Therapy"
      }
    },
    te: {
      header: "సుశ్రుత కేరళ మసాజ్ థెరపీ",
      title: "అపాయింట్‌మెంట్ అభ్యర్థన",
      patient: "పేరు",
      contact: "ఫోన్",
      therapy: "థెరపీ",
      date: "తేదీ",
      time: "సమయం",
      therapist: "థెరపిస్ట్",
      maleT: "పురుష థెరపిస్ట్",
      femaleT: "మహిళా థెరపిస్ట్",
      serviceType: "సేవ రకం",
      atCenterVal: "మసాజ్ థెరపీ సెంటర్‌లో",
      homeVal: "హోమ్ సర్వీస్",
      "massage therapy center": "మసాజ్ థెరపీ సెంటర్ చిరునామా",
      custAddr: "ఇంటి చిరునామా",
      directions: "మార్గం",
      notes: "గమనికలు",
      confirm: "దయచేసి అపాయింట్‌మెంట్ లభ్యతను నిర్ధారించండి.",
      days: ["ఆది", "సోమ", "మంగళ", "బుధ", "గురు", "శుక్ర", "శని"],
      months: ["జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్",
               "జూలై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"],
      therapies: {
        "Padaabhyanga": "సిరోఅభ్యంగ & పాదాభ్యంగ కాంబో",
        "Abhyanga": "అభ్యంగ ఫుల్ బాడీ",
        "Abhyanga Extended": "అభ్యంగ ఫుల్ బాడీ ఎక్స్‌టెండెడ్ వెర్షన్",
        "Hot Potli": "హెర్బల్ పోట్లి థెరపీ",
        "Shirodhara": "శిరోధార వార్మ్ ఆయిల్ హెడ్ బాత్",
        "Pizhichil": "పిజిచిల్ రాయల్ వార్మ్ ఆయిల్ బాత్ థెరపీ"
      }
    }
  };
  function m() { return MSG[lang()]; }

  var HOME_THERAPIES = {
    "Padaabhyanga": true,
    "Abhyanga": true,
    "Abhyanga Extended": true
  };

  var CENTER_THERAPIES = {
    "Padaabhyanga": true,
    "Abhyanga": true,
    "Abhyanga Extended": true,
    "Hot Potli": true,
    "Shirodhara": true,
    "Pizhichil": true
  };

  function therapyAllowedForSession(therapy, sessionType) {
    if (!therapy || !sessionType) return false;
    if (sessionType === "Home Service") return !!HOME_THERAPIES[therapy];
    if (sessionType === "At Massage Therapy Center") return !!CENTER_THERAPIES[therapy];
    return false;
  }

  /* Placeholders follow the site language (main.js only swaps
     innerHTML of [data-i18n]; placeholders are attributes). */
  function applyPlaceholders() {
    els.name.placeholder = t("namePh");
    els.phone.placeholder = t("phonePh");
    if (els.address) els.address.placeholder = t("addressPh");
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

  /* Match the form to the chosen service type: filter the therapy
     list, and toggle the home-address field. Switching back to
     "At Massage Therapy Center" restores everything. */
  function applyServiceType() {
    var sessionType = els.session.value;
    var isHome = sessionType === "Home Service";

    els.therapy.disabled = !sessionType;
    Array.prototype.forEach.call(els.therapy.options, function (option) {
      if (!option.value) return;
      var allowed = therapyAllowedForSession(option.value, sessionType);
      option.disabled = !allowed;   // fallback for browsers that ignore [hidden]
      option.hidden = !allowed;     // Home Service shows only its 3 therapies
    });
    if (!therapyAllowedForSession(els.therapy.value, sessionType)) {
      els.therapy.value = "";
    }

    // Home address: shown & required for Home Service; cleared otherwise.
    if (els.addressField) els.addressField.hidden = !isHome;
    if (!isHome && els.address) {
      els.address.value = "";
      setError(els.address, "bkAddressErr", null);
    }
  }

  applyServiceType();
  els.session.addEventListener("change", function () {
    setError(els.session, "bkSessionErr", null);
    setError(els.therapy, "bkTherapyErr", null);
    applyServiceType();
    validateSaturdayRule();
  });

  function isSelectedDateSaturday() {
    var val = els.date.value;
    if (!val) return false;
    var p = val.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.getDay() === 6; // 6 = Saturday
  }

  function validateSaturdayRule() {
    if (isSelectedDateSaturday() && els.session.value === "At Massage Therapy Center") {
      setError(els.session, "bkSessionErr", t("errSaturdayCenter"));
      return false;
    } else {
      var errEl = document.getElementById("bkSessionErr");
      if (errEl && errEl.textContent === t("errSaturdayCenter")) {
        setError(els.session, "bkSessionErr", null);
      }
      return true;
    }
  }

  els.date.addEventListener("change", function () {
    setError(els.date, "bkDateErr", null);
    validateSaturdayRule();
  });
  els.date.addEventListener("input", function () {
    setError(els.date, "bkDateErr", null);
    validateSaturdayRule();
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
    if (els.session.value) {
      check(validateSaturdayRule(), els.session, "bkSessionErr", t("errSaturdayCenter"));
    }
    check(!!els.therapy.value, els.therapy, "bkTherapyErr", t("errTherapy"));

    // Home Service requires a delivery address.
    if (els.session.value === "Home Service") {
      check(els.address && els.address.value.trim().length >= 6, els.address, "bkAddressErr", t("errAddress"));
    }

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
   ["address", "bkAddressErr"], ["date", "bkDateErr"], ["time", "bkTimeErr"]].forEach(function (pair) {
    if (!els[pair[0]]) return;
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
     Optional rows (Notes) are only added when set —
     no empty placeholders, no "—"/"N/A". Address + Maps link are
     always present. Kept compact so the encoded wa.me payload stays
     well within mobile limits (nothing gets truncated). */
  function buildMessage() {
    var L = m();
    var isHome = els.session.value === "Home Service";
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
    p.push("🧭 " + L.serviceType + ": " + (isHome ? L.homeVal : L.atCenterVal));
    p.push("");
    p.push("💆 " + L.therapy + ": " + therapyName);
    p.push("");
    p.push("📅 " + L.date + ": " + formatDate(els.date.value));
    p.push("🕒 " + L.time + ": " + els.time.value);
    p.push("");
    p.push("👨‍⚕️ " + L.therapist + ": " + therapist);
    p.push("");
    if (isHome) {
      // Home Service → customer address, no massage therapy center address/map.
      p.push("📍 " + L.custAddr);
      p.push("");
      p.push(els.address.value.trim());
    } else {
      // At Massage Therapy Center → massage therapy center address + Google Maps link.
      p.push("📍 " + L["massage therapy center"]);
      p.push("");
      p.push(CENTER_ADDRESS_LINES.join("\n"));
      p.push("");
      p.push("🗺️ " + L.directions);
      p.push("");
      p.push(CENTER_MAPS_URL);
    }
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

  /* ── "Book" buttons: preselect therapy ─────────────────── */
  document.querySelectorAll("[data-book]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var therapy = btn.getAttribute("data-book");
      // Default to At Massage Therapy Center (every therapy is available there); the
      // visitor can switch to Home Service for an eligible therapy.
      els.session.value = "At Massage Therapy Center";
      applyServiceType();
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
})();
