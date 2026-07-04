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

  var form = document.getElementById("bookingForm");
  if (!form) return;

  var els = {
    name: document.getElementById("bkName"),
    phone: document.getElementById("bkPhone"),
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
      errTherapy: "Please choose a therapy.",
      errDate: "Please pick your preferred date.",
      errDatePast: "That date has already passed — please pick today or a future date.",
      errTime: "Please choose a preferred time.",
      errGender: "Please select your gender so we can assign the right therapist.",
      sending: "Opening WhatsApp…",
      namePh: "Your name",
      phonePh: "10-digit mobile number",
      notesPh: "Anything we should know — health conditions, preferences…"
    },
    te: {
      errName: "దయచేసి మీ పేరు రాయండి.",
      errPhone: "దయచేసి మీ మొబైల్ నంబర్ ఇవ్వండి.",
      errPhoneFormat: "దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.",
      errTherapy: "దయచేసి ఒక థెరపీ ఎంచుకోండి.",
      errDate: "దయచేసి మీకు అనుకూలమైన తేదీ ఎంచుకోండి.",
      errDatePast: "ఆ తేదీ దాటిపోయింది — ఈరోజు లేదా రాబోయే తేదీ ఎంచుకోండి.",
      errTime: "దయచేసి సమయం ఎంచుకోండి.",
      errGender: "సరైన థెరపిస్ట్‌ను కేటాయించేందుకు జెండర్ ఎంచుకోండి.",
      sending: "వాట్సాప్ తెరుస్తున్నాం…",
      namePh: "మీ పేరు",
      phonePh: "10 అంకెల మొబైల్ నంబర్",
      notesPh: "మేము తెలుసుకోవాల్సినవి — ఆరోగ్య విషయాలు, ఇష్టాలు…"
    }
  };
  function t(key) { return T[lang()][key]; }

  /* Placeholders follow the site language (main.js only swaps
     innerHTML of [data-i18n]; placeholders are attributes). */
  function applyPlaceholders() {
    els.name.placeholder = t("namePh");
    els.phone.placeholder = t("phonePh");
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
  [["name", "bkNameErr"], ["phone", "bkPhoneErr"], ["therapy", "bkTherapyErr"],
   ["date", "bkDateErr"], ["time", "bkTimeErr"]].forEach(function (pair) {
    els[pair[0]].addEventListener("input", function () { setError(els[pair[0]], pair[1], null); });
    els[pair[0]].addEventListener("change", function () { setError(els[pair[0]], pair[1], null); });
  });
  form.querySelectorAll('input[name="gender"]').forEach(function (r) {
    r.addEventListener("change", function () { setError(null, "bkGenderErr", null); });
  });

  /* ── WhatsApp message ───────────────────────────────────── */
  function formatDate(iso) {
    var parts = iso.split("-");
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString("en-IN",
      { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  }

  function buildMessage() {
    var gender = radioValue("gender");
    var therapist = gender === "Male" ? "Male Therapist" : "Female Therapist";
    var notes = els.notes.value.trim() || "—";

    return [
      "🌿 New Appointment Request",
      "",
      "👤 Name:", els.name.value.trim(),
      "",
      "📞 Phone:", els.phone.value.replace(/[\s\-()]/g, ""),
      "",
      "💆 Therapy:", els.therapy.value,
      "",
      "♨ Herbal Steam:", els.steam.checked ? "Yes (+₹200)" : "No",
      "",
      "📅 Preferred Date:", formatDate(els.date.value),
      "",
      "🕒 Preferred Time:", els.time.value,
      "",
      "🚻 Gender:", gender,
      "",
      "🧑‍⚕️ Assigned Therapist:", therapist,
      "",
      "🏠 Session Type:", radioValue("session"),
      "",
      "📝 Notes:", notes,
      "",
      "Please confirm appointment availability."
    ].join("\n");
  }

  /* ── Submit → open WhatsApp → success panel ─────────────── */
  var submitLabel = els.submit.querySelector("span");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var url = "https://wa.me/" + OWNER_WHATSAPP +
      "?text=" + encodeURIComponent(buildMessage());

    els.submit.disabled = true;
    var original = submitLabel.textContent;
    submitLabel.textContent = t("sending");

    window.open(url, "_blank", "noopener");

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
      els.therapy.value = btn.getAttribute("data-book");
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
