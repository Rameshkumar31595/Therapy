import os
import json
import asyncio
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
AUDIO_DIR = ROOT / "audio" / "bubble"

MESSAGES = {
    "intro": {
      "en": [
        "Hi! I'm Bubble, your wellness guide. Welcome to Sushruta Kerala Massage Therapy. I'll be right here if you need help exploring our treatments, facilities, or booking options.",
        "Hello! Welcome to Sushruta. I'm Bubble! Think of me as your personal guide to everything we offer here, from our therapies to booking an appointment.",
        "Namaste, and welcome to Sushruta Kerala Massage Therapy. I am Bubble. Feel free to tap me anytime you'd like a quick tour of what you're looking at."
      ],
      "te": [
        "హలో! నేను బబుల్, మీ వెల్‌నెస్ గైడ్‌ని. సుశ్రుత కేరళ మసాజ్ థెరపీకి స్వాగతం. మా చికిత్సలు మరియు బుకింగ్ వివరాలను తెలుసుకోవడంలో నేను మీకు సహాయం చేస్తాను.",
        "నమస్తే! సుశ్రుతకు స్వాగతం. నేను మీ గైడ్ బబుల్‌ని! మా థెరపీలు లేదా అపాయింట్‌మెంట్ బుకింగ్ గురించి ఏదైనా సహాయం కావాలంటే నేను ఇక్కడే ఉంటాను.",
        "సుశ్రుత కేరళ మసాజ్ థెరపీకి స్వాగతం. నేను బబుల్. ఈ పేజీలో మీకు అర్థం కాని విషయాలు ఉంటే, ఎప్పుడైనా నన్ను ట్యాప్ చేయండి."
      ]
    },
    "hero": {
      "en": [
        "We offer authentic Kerala Ayurvedic therapies right here at our clinic. We even offer relaxing treatments like Padaabhyanga and Abhyanga as convenient home services.",
        "At our specialized clinic, you can experience true Kerala Ayurveda. And for your ultimate comfort, treatments like Padaabhyanga are available right at your home.",
        "Experience the healing power of authentic Kerala therapies at our center. If you prefer to relax at home, our home services have you covered."
      ],
      "te": [
        "మేము మా ప్రత్యేక క్లినిక్‌లో ప్రామాణిక కేరళ ఆయుర్వేద థెరపీలను అందిస్తున్నాము. పాదాభ్యంగ మరియు అభ్యంగ వంటి కొన్ని చికిత్సలను మీ ఇంటి వద్ద కూడా అందిస్తాము.",
        "మా క్లినిక్‌లో మీరు నిజమైన కేరళ ఆయుర్వేదాన్ని అనుభవించవచ్చు. మీ సౌలభ్యం కోసం, పాదాభ్యంగ వంటి చికిత్సలను మీ ఇంటి వద్దకే తీసుకువస్తున్నాము.",
        "మా కేంద్రంలో కేరళ థెరపీల స్వస్థతను ఆస్వాదించండి. మీరు ఇంట్లోనే విశ్రాంతి తీసుకోవాలనుకుంటే, మా హోమ్ సర్వీసెస్ మీకు అందుబాటులో ఉన్నాయి."
      ]
    },
    "about": {
      "en": [
        "Sushruta is run by a certified therapist couple. Our goal is to bring the true, traditional essence of Kerala Ayurveda straight to Narasaraopet.",
        "Founded by a passionate and certified therapist couple, we are deeply committed to providing authentic Ayurvedic care to the Narasaraopet community.",
        "We are a husband and wife team of certified therapists, and our lifelong mission is bringing traditional Kerala healing practices directly to you."
      ],
      "te": [
        "సుశ్రుత కేరళ ఆయుర్వేద కేంద్రాన్ని ఒక సర్టిఫైడ్ థెరపిస్ట్ దంపతులు నిర్వహిస్తున్నారు. నరసరావుపేటలో నిజమైన కేరళ ఆయుర్వేద వైద్యాన్ని అందించడమే మా లక్ష్యం.",
        "అంకితభావం గల సర్టిఫైడ్ థెరపిస్ట్ దంపతులచే స్థాపించబడిన మా కేంద్రం, నరసరావుపేట వాసులకు అసలైన ఆయుర్వేద సేవలు అందించడానికి కట్టుబడి ఉంది.",
        "మేము సర్టిఫైడ్ థెరపిస్టులైన భార్యాభర్తలం. సాంప్రదాయ కేరళ వైద్య పద్ధతులను నేరుగా మీ దరికి చేర్చడమే మా జీవిత లక్ష్యం."
      ]
    },
    "certificates": {
      "en": [
        "Our certifications show our deep professional training in traditional Ayurveda, so you can always rest assured you are in expert hands.",
        "We pride ourselves on our rigorous professional training. These certifications guarantee you're receiving care of the absolute highest quality.",
        "Feel completely at ease knowing our expertise is backed by recognized Ayurvedic certifications. You are truly in safe, knowledgeable hands."
      ],
      "te": [
        "మా సర్టిఫికేట్లు సాంప్రదాయ ఆయుర్వేద పద్ధతుల్లో మా వృత్తిపరమైన శిక్షణ మరియు నైపుణ్యాన్ని ప్రతిబింబిస్తాయి. అత్యుత్తమ నాణ్యమైన చికిత్సకు ఇవే నిదర్శనం.",
        "మా వృత్తిపరమైన శిక్షణ పట్ల మేము గర్విస్తున్నాము. మీకు అత్యుత్తమ నాణ్యమైన చికిత్స అందుతుందని ఈ సర్టిఫికేట్లు హామీ ఇస్తున్నాయి.",
        "మా నైపుణ్యానికి గుర్తింపు పొందిన ఆయుర్వేద సర్టిఫికేట్లు ఉన్నాయి కాబట్టి మీరు నిశ్చింతగా ఉండవచ్చు. మీరు సురక్షితమైన మరియు నిపుణుల చేతుల్లో ఉన్నారు."
      ]
    },
    "therapies": {
      "en": [
        "Take a look at our therapies, like Padaabhyanga, Abhyanga, Shirodhara, Pizhichil, and Herbal Potli. You can tap 'Listen to Therapy' on any card to hear exactly how it works.",
        "We offer a wonderful range of traditional treatments. Browse through them below, and just tap the listen button to hear a detailed explanation of each one.",
        "From soothing Shirodhara to relaxing Pizhichil, explore all our healing therapies here. Don't forget to tap listen to learn the benefits of each."
      ],
      "te": [
        "పాదాభ్యంగ, అభ్యంగ, శిరోధార, పిజిచిల్ మరియు హెర్బల్ పోట్లి వంటి మా థెరపీలను అన్వేషించండి. ప్రతి చికిత్స గురించి మరింత తెలుసుకోవడానికి కార్డ్‌పై 'వినండి' నొక్కండి.",
        "మేము అద్భుతమైన సాంప్రదాయ చికిత్సలను అందిస్తున్నాము. కింద వాటిని పరిశీలించండి, మరియు ప్రతి దాని గురించి వివరంగా వినడానికి లిజన్ బటన్‌ను నొక్కండి.",
        "ప్రశాంతమైన శిరోధార నుండి ఉపశమనం కలిగించే పిజిచిల్ వరకు, మా థెరపీలన్నింటినీ ఇక్కడ అన్వేషించండి. ప్రతి చికిత్స ప్రయోజనాలను వినడం మర్చిపోకండి."
      ]
    },
    "therapy-detail": {
      "en": [
        "If you want to know what to expect, just tap 'Listen to Therapy' to hear a soothing explanation in your own language.",
        "Curious about a specific treatment? Tap 'Listen to Therapy' on the card and I'll explain how it works.",
        "Tap 'Listen to Therapy' on any treatment card below, and a detailed voice guide will tell you everything you need to know."
      ],
      "te": [
        "ఏదైనా కార్డ్‌పై థెరపీ వినండి నొక్కితే, ఆ చికిత్స ఎలా పనిచేస్తుందో మీ భాషలో వినవచ్చు.",
        "ఏదైనా నిర్దిష్ట చికిత్స గురించి ఆసక్తి ఉందా? కార్డ్‌పై 'థెరపీ వినండి' నొక్కండి, అది ఎలా పనిచేస్తుందో నేను వివరిస్తాను.",
        "కింద ఉన్న ఏదైనా ట్రీట్‌మెంట్ కార్డ్‌పై 'థెరపీ వినండి' నొక్కండి, వాయిస్ గైడ్ మీకు కావాల్సిన ప్రతి విషయాన్ని వివరిస్తుంది."
      ]
    },
    "why-us": {
      "en": [
        "Our guests love us for our certified expertise, and our strict dedication to authentic Kerala massage techniques. We also provide distinct care options for men and women.",
        "Why choose us? We offer specialized male and female care, certified traditional expertise, and a truly authentic Kerala experience.",
        "People trust us because we never compromise on authenticity. With certified therapists and dedicated options for everyone, you're always in the best hands."
      ],
      "te": [
        "అతిథులు మమ్మల్ని ఎందుకు విశ్వసిస్తారంటే, మా సర్టిఫైడ్ నైపుణ్యం, పురుషులకు మరియు స్త్రీలకు ప్రత్యేకమైన సేవలు మరియు అసలైన కేరళ మసాజ్ పద్ధతుల పట్ల మా నిబద్ధత.",
        "మమ్మల్ని ఎందుకు ఎంచుకోవాలి? మేము పురుషులకు మరియు స్త్రీలకు ప్రత్యేకమైన సంరక్షణను, ప్రామాణికమైన కేరళ అనుభవాన్ని అందిస్తున్నాము.",
        "మేము ప్రామాణికత విషయంలో రాజీపడము కాబట్టే ప్రజలు మమ్మల్ని విశ్వసిస్తారు. సర్టిఫైడ్ థెరపిస్టులు మరియు అందరికీ అనువైన ఆప్షన్స్‌తో, మీరు ఎల్లప్పుడూ అత్యుత్తమ సేవలు పొందుతారు."
      ]
    },
    "timings": {
      "en": [
        "We're open every day from 9 AM to 8 PM, except on Mondays when we close early at 1 PM. It's always best to book your appointment in advance.",
        "Our doors are open daily from 9 in the morning to 8 at night, though we do close at 1 PM on Mondays. Please remember to book ahead!",
        "You can visit us from 9 AM to 8 PM on most days, and until 1 PM on Mondays. We highly recommend scheduling your session before you arrive."
      ],
      "te": [
        "మేము ప్రతిరోజూ ఉదయం 9 గంటల నుండి రాత్రి 8 గంటల వరకు తెరిచి ఉంటాము, సోమవారం మాత్రం మధ్యాహ్నం 1 గంట వరకు మాత్రమే. మీరు ముందుగా అపాయింట్‌మెంట్ బుక్ చేసుకోవడం సూచించబడింది.",
        "సోమవారం మధ్యాహ్నం 1 గంట వరకు మినహా, మా తలుపులు ప్రతిరోజూ ఉదయం 9 నుండి రాత్రి 8 వరకు తెరిచి ఉంటాయి. దయచేసి ముందుగా బుక్ చేసుకోవడం మర్చిపోకండి!",
        "మీరు సోమవారం మధ్యాహ్నం 1 గంట వరకు మరియు మిగిలిన రోజులలో ఉదయం 9 నుండి రాత్రి 8 వరకు మమ్మల్ని సందర్శించవచ్చు. వచ్చే ముందు అపాయింట్‌మెంట్ తీసుకోవడం ఉత్తమం."
      ]
    },
    "experience": {
      "en": [
        "You'll experience profound relaxation here, with warm herbal oils and a deeply peaceful atmosphere inspired by Kerala's heritage.",
        "Immerse yourself in tranquility. Our unhurried care and warm herbal oils will leave you feeling completely rejuvenated and balanced.",
        "Step into a deeply calming space. The rich heritage of Kerala Ayurveda combined with our personalized care ensures a truly restorative experience."
      ],
      "te": [
        "వెచ్చని హెర్బల్ నూనెలు, ప్రశాంతమైన వ్యక్తిగత సేవ మరియు కేరళ సంప్రదాయ స్ఫూర్తితో కూడిన ప్రశాంత వాతావరణంలో గొప్ప ఉపశమనాన్ని అనుభవించండి.",
        "ప్రశాంతతలో మునిగిపోండి. మా శ్రద్ధతో కూడిన సేవ మరియు వెచ్చని హెర్బల్ నూనెలు మిమ్మల్ని పూర్తిగా ఉత్తేజపరుస్తాయి.",
        "ప్రశాంతమైన వాతావరణంలోకి అడుగుపెట్టండి. కేరళ ఆయుర్వేద సంప్రదాయం మరియు మా వ్యక్తిగత సేవ మీకు నిజమైన స్వస్థతను అందిస్తాయి."
      ]
    },
    "location": {
      "en": [
        "Here is where you can find our clinic in Narasaraopet. Just tap 'Directions' and Google Maps will guide you right to our door.",
        "Looking for us? This map shows our exact location in Narasaraopet. Tap directions for an easy route straight to the clinic.",
        "We are conveniently located right here in Narasaraopet. Feel free to use the map below to get instant directions to our center."
      ],
      "te": [
        "ఇది నరసరావుపేటలో మా క్లినిక్ ఉన్న ప్రదేశం. మా వద్దకు చేరుకోవడానికి, 'డైరెక్షన్స్' పై నొక్కండి, గూగుల్ మ్యాప్స్ మీకు మార్గదర్శకత్వం చేస్తుంది.",
        "మమ్మల్ని వెతుకుతున్నారా? ఈ మ్యాప్ నరసరావుపేటలో మా ఖచ్చితమైన స్థానాన్ని చూపుతుంది. నేరుగా క్లినిక్‌కి సులభమైన మార్గం కోసం డైరెక్షన్స్ నొక్కండి.",
        "మేము నరసరావుపేటలోనే సౌకర్యవంతంగా ఉన్నాము. మా కేంద్రానికి తక్షణ మార్గదర్శకత్వం పొందడానికి కింద ఉన్న మ్యాప్‌ను ఉపయోగించండి."
      ]
    },
    "booking": {
      "en": [
        "Ready to relax? Just choose your service, therapy, and time. Your booking will be quickly confirmed over WhatsApp.",
        "Booking is simple and fast. Select what you need, pick a time, and we'll confirm everything securely with you on WhatsApp.",
        "It's time to treat yourself. Use the form below to request an appointment, and look out for a WhatsApp message from us to confirm."
      ],
      "te": [
        "విశ్రాంతి తీసుకోవడానికి సిద్ధంగా ఉన్నారా? మీకు కావలసిన సేవ, థెరపీ, తేదీ మరియు సమయాన్ని ఎంచుకోండి. మీ బుకింగ్ అభ్యర్థన వాట్సాప్ ద్వారా నిర్ధారించబడుతుంది.",
        "బుకింగ్ చాలా సులభం మరియు వేగవంతమైనది. మీకు కావలసినదాన్ని ఎంచుకోండి, సమయాన్ని నిర్ణయించుకోండి, మేము వాట్సాప్‌లో అన్నీ ధృవీకరిస్తాము.",
        "ఇది మీకు మీరు సమయం కేటాయించుకునే వేళ. అపాయింట్‌మెంట్ కోసం కింద ఫారమ్‌ను ఉపయోగించండి, నిర్ధారణ కోసం మా వాట్సాప్ సందేశం కోసం వేచి ఉండండి."
      ]
    },
    "contact": {
      "en": [
        "We are always here to help. Feel free to call us or send a WhatsApp message anytime.",
        "Have a question? Don't hesitate to reach out! You can easily contact us via call or WhatsApp using the buttons below.",
        "We'd love to hear from you. Just tap below to call us instantly, or drop us a quick message on WhatsApp."
      ],
      "te": [
        "మేము మీకు సహాయం చేయడానికి ఎల్లప్పుడూ సిద్ధంగా ఉన్నాము. కాల్ లేదా వాట్సాప్ ద్వారా మమ్మల్ని సంప్రదించండి, లేదా నేరుగా రావడానికి మ్యాప్ మార్గాన్ని పొందండి.",
        "ఏదైనా ప్రశ్న ఉందా? మమ్మల్ని సంప్రదించడానికి వెనుకాడకండి! కింద ఉన్న బటన్ల ద్వారా మీరు సులభంగా కాల్ లేదా వాట్సాప్ చేయవచ్చు.",
        "మాతో మాట్లాడాలనుకుంటున్నారా. మాకు వెంటనే కాల్ చేయడానికి లేదా వాట్సాప్‌లో చిన్న సందేశం పంపడానికి కింద ట్యాప్ చేయండి."
      ]
    },
    "footer": {
      "en": [
        "Thanks for exploring our therapies! You'll find all our contact details and quick links right down here at the bottom.",
        "We appreciate you visiting our site. Down here in the footer, you can easily access our address, phone number, and quick links.",
        "That's everything! Thank you for your time. Feel free to use these footer links to navigate or contact us directly."
      ],
      "te": [
        "మా సేవలను పరిశీలించినందుకు ధన్యవాదాలు. మీరు మా పూర్తి సంప్రదింపు వివరాలు, చిరునామా మరియు ముఖ్యమైన లింక్‌లను ఇక్కడ పేజీ చివరన కనుగొనవచ్చు.",
        "మా వెబ్‌సైట్‌ను సందర్శించినందుకు ధన్యవాదాలు. కింద ఫూటర్‌లో, మీరు మా చిరునామా, ఫోన్ నంబర్ మరియు ముఖ్యమైన లింక్‌లను సులభంగా యాక్సెస్ చేయవచ్చు.",
        "అంతే! మీ సమయానికి ధన్యవాదాలు. నావిగేట్ చేయడానికి లేదా మమ్మల్ని నేరుగా సంప్రదించడానికి ఈ ఫూటర్ లింక్‌లను ఉపయోగించండి."
      ]
    }
}

async def generate():
    os.makedirs(AUDIO_DIR / "en", exist_ok=True)
    os.makedirs(AUDIO_DIR / "te", exist_ok=True)
    
    edge_tts_bin = os.environ.get("LOCALAPPDATA", ROOT) + r"\SushrutaTTS\venv\Scripts\edge-tts.exe"

    for section, scripts in MESSAGES.items():
        # English
        for i, en_text in enumerate(scripts["en"]):
            en_out = AUDIO_DIR / "en" / f"{section}_{i}.mp3"
            print(f"Generating EN: {section}_{i}")
            subprocess.run([edge_tts_bin, "--voice", "en-IN-NeerjaNeural", "--rate", "+5%", "--text", en_text, "--write-media", str(en_out)], check=True)

        # Telugu
        for i, te_text in enumerate(scripts["te"]):
            te_out = AUDIO_DIR / "te" / f"{section}_{i}.mp3"
            print(f"Generating TE: {section}_{i}")
            subprocess.run([edge_tts_bin, "--voice", "te-IN-ShrutiNeural", "--rate", "+0%", "--text", te_text, "--write-media", str(te_out)], check=True)

if __name__ == "__main__":
    asyncio.run(generate())
