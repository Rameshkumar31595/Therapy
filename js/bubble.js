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
  var hasIntroduced = false;   // full introduction already played this page load?

  function lang() {
    return document.documentElement.getAttribute("lang") === "te" ? "te" : "en";
  }
  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  /* ══════════════ assistantMessages config ══════════════════
     One short, warm, premium message per section, in both
     languages. Kept concise for the compact voice-first card. */
  var MESSAGES = {
    intro: {
      en: [
        "Hi! I'm Bubble, your wellness guide. Welcome to Sushruta Kerala Massage Therapy. I'll be right here if you need help exploring our treatments, facilities, or booking options.",
        "Hello! Welcome to Sushruta. I'm Bubble! Think of me as your personal guide to everything we offer here, from our therapies to booking an appointment.",
        "Namaste, and welcome to Sushruta Kerala Massage Therapy. I am Bubble. Feel free to tap me anytime you'd like a quick tour of what you're looking at."
      ],
      te: [
        "హలో! నేను బబుల్, మీ వెల్‌నెస్ గైడ్‌ని. సుశ్రుత కేరళ మసాజ్ థెరపీకి స్వాగతం. మా చికిత్సలు మరియు బుకింగ్ వివరాలను తెలుసుకోవడంలో నేను మీకు సహాయం చేస్తాను.",
        "నమస్తే! సుశ్రుతకు స్వాగతం. నేను మీ గైడ్ బబుల్‌ని! మా థెరపీలు లేదా అపాయింట్‌మెంట్ బుకింగ్ గురించి ఏదైనా సహాయం కావాలంటే నేను ఇక్కడే ఉంటాను.",
        "సుశ్రుత కేరళ మసాజ్ థెరపీకి స్వాగతం. నేను బబుల్. ఈ పేజీలో మీకు అర్థం కాని విషయాలు ఉంటే, ఎప్పుడైనా నన్ను ట్యాప్ చేయండి."
      ]
    },
    hero: {
      en: [
        "We offer authentic Kerala Ayurvedic therapies right here at our clinic. We even offer relaxing treatments like Padaabhyanga and Abhyanga as convenient home services.",
        "At our specialized clinic, you can experience true Kerala Ayurveda. And for your ultimate comfort, treatments like Padaabhyanga are available right at your home.",
        "Experience the healing power of authentic Kerala therapies at our center. If you prefer to relax at home, our home services have you covered."
      ],
      te: [
        "మేము మా ప్రత్యేక క్లినిక్‌లో ప్రామాణిక కేరళ ఆయుర్వేద థెరపీలను అందిస్తున్నాము. పాదాభ్యంగ మరియు అభ్యంగ వంటి కొన్ని చికిత్సలను మీ ఇంటి వద్ద కూడా అందిస్తాము.",
        "మా క్లినిక్‌లో మీరు నిజమైన కేరళ ఆయుర్వేదాన్ని అనుభవించవచ్చు. మీ సౌలభ్యం కోసం, పాదాభ్యంగ వంటి చికిత్సలను మీ ఇంటి వద్దకే తీసుకువస్తున్నాము.",
        "మా కేంద్రంలో కేరళ థెరపీల స్వస్థతను ఆస్వాదించండి. మీరు ఇంట్లోనే విశ్రాంతి తీసుకోవాలనుకుంటే, మా హోమ్ సర్వీసెస్ మీకు అందుబాటులో ఉన్నాయి."
      ]
    },
    about: {
      en: [
        "Sushruta is run by a certified therapist couple. Our goal is to bring the true, traditional essence of Kerala Ayurveda straight to Narasaraopet.",
        "Founded by a passionate and certified therapist couple, we are deeply committed to providing authentic Ayurvedic care to the Narasaraopet community.",
        "We are a husband and wife team of certified therapists, and our lifelong mission is bringing traditional Kerala healing practices directly to you."
      ],
      te: [
        "సుశ్రుత కేరళ ఆయుర్వేద కేంద్రాన్ని ఒక సర్టిఫైడ్ థెరపిస్ట్ దంపతులు నిర్వహిస్తున్నారు. నరసరావుపేటలో నిజమైన కేరళ ఆయుర్వేద వైద్యాన్ని అందించడమే మా లక్ష్యం.",
        "అంకితభావం గల సర్టిఫైడ్ థెరపిస్ట్ దంపతులచే స్థాపించబడిన మా కేంద్రం, నరసరావుపేట వాసులకు అసలైన ఆయుర్వేద సేవలు అందించడానికి కట్టుబడి ఉంది.",
        "మేము సర్టిఫైడ్ థెరపిస్టులైన భార్యాభర్తలం. సాంప్రదాయ కేరళ వైద్య పద్ధతులను నేరుగా మీ దరికి చేర్చడమే మా జీవిత లక్ష్యం."
      ]
    },
    certificates: {
      en: [
        "Our certifications show our deep professional training in traditional Ayurveda, so you can always rest assured you are in expert hands.",
        "We pride ourselves on our rigorous professional training. These certifications guarantee you're receiving care of the absolute highest quality.",
        "Feel completely at ease knowing our expertise is backed by recognized Ayurvedic certifications. You are truly in safe, knowledgeable hands."
      ],
      te: [
        "మా సర్టిఫికేట్లు సాంప్రదాయ ఆయుర్వేద పద్ధతుల్లో మా వృత్తిపరమైన శిక్షణ మరియు నైపుణ్యాన్ని ప్రతిబింబిస్తాయి. అత్యుత్తమ నాణ్యమైన చికిత్సకు ఇవే నిదర్శనం.",
        "మా వృత్తిపరమైన శిక్షణ పట్ల మేము గర్విస్తున్నాము. మీకు అత్యుత్తమ నాణ్యమైన చికిత్స అందుతుందని ఈ సర్టిఫికేట్లు హామీ ఇస్తున్నాయి.",
        "మా నైపుణ్యానికి గుర్తింపు పొందిన ఆయుర్వేద సర్టిఫికేట్లు ఉన్నాయి కాబట్టి మీరు నిశ్చింతగా ఉండవచ్చు. మీరు సురక్షితమైన మరియు నిపుణుల చేతుల్లో ఉన్నారు."
      ]
    },
    therapies: {
      en: [
        "Take a look at our therapies, like Padaabhyanga, Abhyanga, Shirodhara, Pizhichil, and Herbal Potli. You can tap 'Listen to Therapy' on any card to hear exactly how it works.",
        "We offer a wonderful range of traditional treatments. Browse through them below, and just tap the listen button to hear a detailed explanation of each one.",
        "From soothing Shirodhara to relaxing Pizhichil, explore all our healing therapies here. Don't forget to tap listen to learn the benefits of each."
      ],
      te: [
        "పాదాభ్యంగ, అభ్యంగ, శిరోధార, పిజిచిల్ మరియు హెర్బల్ పోట్లి వంటి మా థెరపీలను అన్వేషించండి. ప్రతి చికిత్స గురించి మరింత తెలుసుకోవడానికి కార్డ్‌పై 'వినండి' నొక్కండి.",
        "మేము అద్భుతమైన సాంప్రదాయ చికిత్సలను అందిస్తున్నాము. కింద వాటిని పరిశీలించండి, మరియు ప్రతి దాని గురించి వివరంగా వినడానికి లిజన్ బటన్‌ను నొక్కండి.",
        "ప్రశాంతమైన శిరోధార నుండి ఉపశమనం కలిగించే పిజిచిల్ వరకు, మా థెరపీలన్నింటినీ ఇక్కడ అన్వేషించండి. ప్రతి చికిత్స ప్రయోజనాలను వినడం మర్చిపోకండి."
      ]
    },
    "therapy-detail": {
      en: [
        "If you want to know what to expect, just tap 'Listen to Therapy' to hear a soothing explanation in your own language.",
        "Curious about a specific treatment? Tap 'Listen to Therapy' on the card and I'll explain how it works.",
        "Tap 'Listen to Therapy' on any treatment card below, and a detailed voice guide will tell you everything you need to know."
      ],
      te: [
        "ఏదైనా కార్డ్‌పై థెరపీ వినండి నొక్కితే, ఆ చికిత్స ఎలా పనిచేస్తుందో మీ భాషలో వినవచ్చు.",
        "ఏదైనా నిర్దిష్ట చికిత్స గురించి ఆసక్తి ఉందా? కార్డ్‌పై 'థెరపీ వినండి' నొక్కండి, అది ఎలా పనిచేస్తుందో నేను వివరిస్తాను.",
        "కింద ఉన్న ఏదైనా ట్రీట్‌మెంట్ కార్డ్‌పై 'థెరపీ వినండి' నొక్కండి, వాయిస్ గైడ్ మీకు కావాల్సిన ప్రతి విషయాన్ని వివరిస్తుంది."
      ]
    },
    "why-us": {
      en: [
        "Our guests love us for our certified expertise, and our strict dedication to authentic Kerala massage techniques. We also provide distinct care options for men and women.",
        "Why choose us? We offer specialized male and female care, certified traditional expertise, and a truly authentic Kerala experience.",
        "People trust us because we never compromise on authenticity. With certified therapists and dedicated options for everyone, you're always in the best hands."
      ],
      te: [
        "అతిథులు మమ్మల్ని ఎందుకు విశ్వసిస్తారంటే, మా సర్టిఫైడ్ నైపుణ్యం, పురుషులకు మరియు స్త్రీలకు ప్రత్యేకమైన సేవలు మరియు అసలైన కేరళ మసాజ్ పద్ధతుల పట్ల మా నిబద్ధత.",
        "మమ్మల్ని ఎందుకు ఎంచుకోవాలి? మేము పురుషులకు మరియు స్త్రీలకు ప్రత్యేకమైన సంరక్షణను, ప్రామాణికమైన కేరళ అనుభవాన్ని అందిస్తున్నాము.",
        "మేము ప్రామాణికత విషయంలో రాజీపడము కాబట్టే ప్రజలు మమ్మల్ని విశ్వసిస్తారు. సర్టిఫైడ్ థెరపిస్టులు మరియు అందరికీ అనువైన ఆప్షన్స్‌తో, మీరు ఎల్లప్పుడూ అత్యుత్తమ సేవలు పొందుతారు."
      ]
    },
    "timings": {
      en: [
        "We're open every day from 9 AM to 8 PM, except on Mondays when we close early at 1 PM. It's always best to book your appointment in advance.",
        "Our doors are open daily from 9 in the morning to 8 at night, though we do close at 1 PM on Mondays. Please remember to book ahead!",
        "You can visit us from 9 AM to 8 PM on most days, and until 1 PM on Mondays. We highly recommend scheduling your session before you arrive."
      ],
      te: [
        "మేము ప్రతిరోజూ ఉదయం 9 గంటల నుండి రాత్రి 8 గంటల వరకు తెరిచి ఉంటాము, సోమవారం మాత్రం మధ్యాహ్నం 1 గంట వరకు మాత్రమే. మీరు ముందుగా అపాయింట్‌మెంట్ బుక్ చేసుకోవడం సూచించబడింది.",
        "సోమవారం మధ్యాహ్నం 1 గంట వరకు మినహా, మా తలుపులు ప్రతిరోజూ ఉదయం 9 నుండి రాత్రి 8 వరకు తెరిచి ఉంటాయి. దయచేసి ముందుగా బుక్ చేసుకోవడం మర్చిపోకండి!",
        "మీరు సోమవారం మధ్యాహ్నం 1 గంట వరకు మరియు మిగిలిన రోజులలో ఉదయం 9 నుండి రాత్రి 8 వరకు మమ్మల్ని సందర్శించవచ్చు. వచ్చే ముందు అపాయింట్‌మెంట్ తీసుకోవడం ఉత్తమం."
      ]
    },
    "experience": {
      en: [
        "You'll experience profound relaxation here, with warm herbal oils and a deeply peaceful atmosphere inspired by Kerala's heritage.",
        "Immerse yourself in tranquility. Our unhurried care and warm herbal oils will leave you feeling completely rejuvenated and balanced.",
        "Step into a deeply calming space. The rich heritage of Kerala Ayurveda combined with our personalized care ensures a truly restorative experience."
      ],
      te: [
        "వెచ్చని హెర్బల్ నూనెలు, ప్రశాంతమైన వ్యక్తిగత సేవ మరియు కేరళ సంప్రదాయ స్ఫూర్తితో కూడిన ప్రశాంత వాతావరణంలో గొప్ప ఉపశమనాన్ని అనుభవించండి.",
        "ప్రశాంతతలో మునిగిపోండి. మా శ్రద్ధతో కూడిన సేవ మరియు వెచ్చని హెర్బల్ నూనెలు మిమ్మల్ని పూర్తిగా ఉత్తేజపరుస్తాయి.",
        "ప్రశాంతమైన వాతావరణంలోకి అడుగుపెట్టండి. కేరళ ఆయుర్వేద సంప్రదాయం మరియు మా వ్యక్తిగత సేవ మీకు నిజమైన స్వస్థతను అందిస్తాయి."
      ]
    },
    "location": {
      en: [
        "Here is where you can find our clinic in Narasaraopet. Just tap 'Directions' and Google Maps will guide you right to our door.",
        "Looking for us? This map shows our exact location in Narasaraopet. Tap directions for an easy route straight to the clinic.",
        "We are conveniently located right here in Narasaraopet. Feel free to use the map below to get instant directions to our center."
      ],
      te: [
        "ఇది నరసరావుపేటలో మా క్లినిక్ ఉన్న ప్రదేశం. మా వద్దకు చేరుకోవడానికి, 'డైరెక్షన్స్' పై నొక్కండి, గూగుల్ మ్యాప్స్ మీకు మార్గదర్శకత్వం చేస్తుంది.",
        "మమ్మల్ని వెతుకుతున్నారా? ఈ మ్యాప్ నరసరావుపేటలో మా ఖచ్చితమైన స్థానాన్ని చూపుతుంది. నేరుగా క్లినిక్‌కి సులభమైన మార్గం కోసం డైరెక్షన్స్ నొక్కండి.",
        "మేము నరసరావుపేటలోనే సౌకర్యవంతంగా ఉన్నాము. మా కేంద్రానికి తక్షణ మార్గదర్శకత్వం పొందడానికి కింద ఉన్న మ్యాప్‌ను ఉపయోగించండి."
      ]
    },
    "booking": {
      en: [
        "Ready to relax? Just choose your service, therapy, and time. Your booking will be quickly confirmed over WhatsApp.",
        "Booking is simple and fast. Select what you need, pick a time, and we'll confirm everything securely with you on WhatsApp.",
        "It's time to treat yourself. Use the form below to request an appointment, and look out for a WhatsApp message from us to confirm."
      ],
      te: [
        "విశ్రాంతి తీసుకోవడానికి సిద్ధంగా ఉన్నారా? మీకు కావలసిన సేవ, థెరపీ, తేదీ మరియు సమయాన్ని ఎంచుకోండి. మీ బుకింగ్ అభ్యర్థన వాట్సాప్ ద్వారా నిర్ధారించబడుతుంది.",
        "బుకింగ్ చాలా సులభం మరియు వేగవంతమైనది. మీకు కావలసినదాన్ని ఎంచుకోండి, సమయాన్ని నిర్ణయించుకోండి, మేము వాట్సాప్‌లో అన్నీ ధృవీకరిస్తాము.",
        "ఇది మీకు మీరు సమయం కేటాయించుకునే వేళ. అపాయింట్‌మెంట్ కోసం కింద ఫారమ్‌ను ఉపయోగించండి, నిర్ధారణ కోసం మా వాట్సాప్ సందేశం కోసం వేచి ఉండండి."
      ]
    },
    "contact": {
      en: [
        "We are always here to help. Feel free to call us or send a WhatsApp message anytime.",
        "Have a question? Don't hesitate to reach out! You can easily contact us via call or WhatsApp using the buttons below.",
        "We'd love to hear from you. Just tap below to call us instantly, or drop us a quick message on WhatsApp."
      ],
      te: [
        "మేము మీకు సహాయం చేయడానికి ఎల్లప్పుడూ సిద్ధంగా ఉన్నాము. కాల్ లేదా వాట్సాప్ ద్వారా మమ్మల్ని సంప్రదించండి, లేదా నేరుగా రావడానికి మ్యాప్ మార్గాన్ని పొందండి.",
        "ఏదైనా ప్రశ్న ఉందా? మమ్మల్ని సంప్రదించడానికి వెనుకాడకండి! కింద ఉన్న బటన్ల ద్వారా మీరు సులభంగా కాల్ లేదా వాట్సాప్ చేయవచ్చు.",
        "మాతో మాట్లాడాలనుకుంటున్నారా. మాకు వెంటనే కాల్ చేయడానికి లేదా వాట్సాప్‌లో చిన్న సందేశం పంపడానికి కింద ట్యాప్ చేయండి."
      ]
    },
    "footer": {
      en: [
        "Thanks for exploring our therapies! You'll find all our contact details and quick links right down here at the bottom.",
        "We appreciate you visiting our site. Down here in the footer, you can easily access our address, phone number, and quick links.",
        "That's everything! Thank you for your time. Feel free to use these footer links to navigate or contact us directly."
      ],
      te: [
        "మా సేవలను పరిశీలించినందుకు ధన్యవాదాలు. మీరు మా పూర్తి సంప్రదింపు వివరాలు, చిరునామా మరియు ముఖ్యమైన లింక్‌లను ఇక్కడ పేజీ చివరన కనుగొనవచ్చు.",
        "మా వెబ్‌సైట్‌ను సందర్శించినందుకు ధన్యవాదాలు. కింద ఫూటర్‌లో, మీరు మా చిరునామా, ఫోన్ నంబర్ మరియు ముఖ్యమైన లింక్‌లను సులభంగా యాక్సెస్ చేయవచ్చు.",
        "అంతే! మీ సమయానికి ధన్యవాదాలు. నావిగేట్ చేయడానికి లేదా మమ్మల్ని నేరుగా సంప్రదించడానికి ఈ ఫూటర్ లింక్‌లను ఉపయోగించండి."
      ]
    }
  };

  var UI = {
    en: {
      open: "Open Bubble, your wellness guide",
      close: "Close Bubble guide",
      title: "Bubble",
      welcome: "Hi! I'm Bubble. Tap me for a quick tour of this page.",
      closeHint: "Tap me anytime if you need help understanding this page.",
      listen: "Listen",
      stop: "Stop",
      closeBtn: "Close"
    },
    te: {
      open: "బబుల్ తెరవండి, మీ వెల్‌నెస్ గైడ్",
      close: "బబుల్ గైడ్ మూసివేయండి",
      title: "బబుల్",
      welcome: "హాయ్! నేను బబుల్. ఈ పేజీ టూర్ కోసం నన్ను ట్యాప్ చేయండి.",
      closeHint: "ఈ పేజీని అర్థం చేసుకోవడానికి సహాయం కావాలంటే ఎప్పుడైనా నన్ను ట్యాప్ చేయండి.",
      listen: "వినండి",
      stop: "ఆపండి",
      closeBtn: "మూసివేయి"
    }
  };

  // Pick a random variation of the message
  function messageFor(section) {
    var entry = MESSAGES[section] || MESSAGES.hero;
    var variations = entry[lang()] || entry.en;
    var idx = Math.floor(Math.random() * variations.length);
    return { text: variations[idx], index: idx };
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
      en: { rate: 0.96, pitch: 1.0, volume: 1.0 },
      te: { rate: 0.94, pitch: 1.0, volume: 1.0 }
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

    var audioEl = new Audio();
    var currentSynth = null;
    var ttsFallback = function(req) {
      if (!supported || !req || !req.text) { if (req && req.onEnd) req.onEnd(); return false; }
      try { synth.cancel(); } catch (e) {}
      var L = req.lang === "te" ? "te" : "en";
      currentSynth = new window.SpeechSynthesisUtterance(req.text);
      currentSynth.lang = L === "te" ? "te-IN" : "en-IN";
      var v = cache[L];
      if (v === undefined) { resolve(); v = cache[L]; }
      if (v) currentSynth.voice = v;
      var tune = TUNING[L];
      currentSynth.rate = tune.rate; currentSynth.pitch = tune.pitch; currentSynth.volume = tune.volume;
      currentSynth.onstart = req.onStart || null;
      currentSynth.onend = req.onEnd || null;
      currentSynth.onerror = req.onEnd || null;
      try { synth.speak(currentSynth); return true; }
      catch (e) { if (req.onEnd) req.onEnd(); return false; }
    };

    return {
      isSupported: function () { return true; }, // Supported by HTML5 Audio
      refresh: resolve,
      stop: function () {
        audioEl.pause();
        audioEl.currentTime = 0;
        if (synth) { 
          try { 
            synth.pause(); 
            synth.cancel(); 
          } catch (e) {} 
        }
      },
      speak: function (req) {
        if (!req || !req.text) { if (req && req.onEnd) req.onEnd(); return false; }
        this.stop();
        var L = req.lang === "te" ? "te" : "en";
        // Attempt to load the pre-recorded MP3 variation
        audioEl.src = "audio/bubble/" + L + "/" + req.section + "_" + (req.index || 0) + ".mp3";
        audioEl.onplay = req.onStart || null;
        audioEl.onended = req.onEnd || null;
        audioEl.onerror = function() {
          // If the audio file is missing or fails to load, fall back to TTS
          ttsFallback(req);
        };
        audioEl.play().catch(function(e) {
          if (e) {
            if (e.name === 'AbortError') return; // Intentional stop
            if (e.name === 'NotAllowedError') {
              // Browser blocked autoplay (e.g. lost user gesture during language switch)
              if (req.onEnd) req.onEnd();
              return;
            }
          }
          // For other errors (like network failures), fall back to TTS
          ttsFallback(req);
        });
        return true;
      }
    };
  }

  var voice = createVoiceService();
  var canSpeak = voice.isSupported();

  function setSpeaking(on) {
    panel.classList.toggle("speaking", on);
  }
  function stopSpeech() { voice.stop(); setSpeaking(false); }

  /* Speaks one message; onDone (optional) runs when it finishes,
     which lets us chain the intro into the section narration. */
  function speakSection(section, onDone) {
    if (!canSpeak) { if (onDone) onDone(); return; }
    
    var text = msgEl.textContent;
    var idx = parseInt(msgEl.getAttribute("data-msg-idx") || "0", 10);
    
    voice.speak({
      section: section,
      index: idx,
      lang: lang(),
      text: text,
      onStart: function () { setSpeaking(true); },
      onEnd: function () { setSpeaking(false); if (onDone) onDone(); }
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
  var introing = false;   // true while the opening self-introduction plays
  var tipTimer = null;

  function applyStaticLabels() {
    var L = UI[lang()];
    titleEl.textContent = L.title;
    panel.setAttribute("aria-label", L.title);
    closeBtn.setAttribute("aria-label", L.closeBtn);
    avatar.setAttribute("aria-label", open ? L.close : L.open);
  }

  function renderMessage(section) {
    var msgData = messageFor(section || monitor.current() || "hero");
    msgEl.textContent = msgData.text;
    msgEl.setAttribute("data-msg-idx", msgData.index);
  }

  function showTip(text, ms) {
    tip.textContent = text;
    tip.classList.add("show");
    if (tipTimer) clearTimeout(tipTimer);
    if (ms) tipTimer = setTimeout(hideTip, ms);
  }
  function hideTip() { tip.classList.remove("show"); }

  /* Open → enter Active Guide Mode. On the FIRST activation of the
     session Bubble plays its full introduction; on any later re-open
     it plays a short, funny reactivation line instead. Either way it
     then narrates whatever section the visitor is on — no matter
     where on the page they opened it. */
  function openPanel() {
    if (open) return;
    open = true;
    hideTip();
    monitor.start();
    panel.classList.add("open");
    avatar.setAttribute("aria-expanded", "true");
    avatar.setAttribute("aria-label", UI[lang()].close);
    try { panel.focus({ preventScroll: true }); } catch (e) { panel.focus(); }

    if (canSpeak) {
      // First open this page load → full intro; re-open → skip intro and just explain the section.
      var lead = hasIntroduced ? null : "intro";
      hasIntroduced = true;
      
      if (lead) {
        introing = true;
        renderMessage(lead);
        speakSection(lead, function () {   // when the intro finishes…
          introing = false;
          if (!open) return;
          var sec = monitor.current() || "hero";  // …explain the current section
          renderMessage(sec);
          speakSection(sec);
        });
      } else {
        var sec = monitor.current() || "hero";
        renderMessage(sec);
        speakSection(sec);
      }
    } else {
      renderMessage(monitor.current() || "hero");  // no speech → show section text
    }
  }
  /* Close → leave Guide Mode: stop speech AND stop all monitoring. */
  function closePanel(withHint) {
    if (!open) return;
    open = false;
    introing = false;
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
    if (!open || introing) return;   // let the self-introduction finish first
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
      introing = false;           // switch straight to the section in the new language
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
