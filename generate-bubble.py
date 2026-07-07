import os
import json
import asyncio
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
AUDIO_DIR = ROOT / "audio" / "bubble"

# Bubble Scripts
MESSAGES = {
    "intro": {
      "en": "Hi! I'm Bubble, your wellness guide. Welcome to Sushruta Kerala Massage Therapy. I'll be right here if you need help exploring our treatments, facilities, or booking options.",
      "te": "హలో! నేను బబుల్, మీ వెల్‌నెస్ గైడ్‌ని. సుశ్రుత కేరళ మసాజ్ థెరపీకి స్వాగతం. మా ప్రామాణిక ఆయుర్వేద చికిత్సలు, సదుపాయాలు మరియు బుకింగ్ వివరాలను అర్థం చేసుకోవడంలో మీకు సహాయం చేస్తాను."
    },
    "hero": {
      "en": "We offer authentic Kerala Ayurvedic therapies right here at our clinic. We even offer relaxing treatments like Padaabhyanga and Abhyanga as convenient home services.",
      "te": "మేము మా ప్రత్యేక క్లినిక్‌లో ప్రామాణిక కేరళ ఆయుర్వేద థెరపీలను అందిస్తున్నాము. పాదాభ్యంగ మరియు అభ్యంగ వంటి కొన్ని చికిత్సలను మీ ఇంటి వద్ద కూడా అందిస్తాము."
    },
    "about": {
      "en": "Sushruta is run by a certified therapist couple. Our goal is to bring the true, traditional essence of Kerala Ayurveda straight to Narasaraopet.",
      "te": "సుశ్రుత కేరళ ఆయుర్వేద కేంద్రాన్ని ఒక సర్టిఫైడ్ థెరపిస్ట్ దంపతులు నిర్వహిస్తున్నారు. నరసరావుపేటలో నిజమైన కేరళ ఆయుర్వేద వైద్యాన్ని అందించడమే మా లక్ష్యం."
    },
    "certificates": {
      "en": "Our certifications show our deep professional training in traditional Ayurveda, so you can always rest assured you are in expert hands.",
      "te": "మా సర్టిఫికేట్లు సాంప్రదాయ ఆయుర్వేద పద్ధతుల్లో మా వృత్తిపరమైన శిక్షణ మరియు నైపుణ్యాన్ని ప్రతిబింబిస్తాయి. అత్యుత్తమ నాణ్యమైన చికిత్సకు ఇవే నిదర్శనం."
    },
    "therapies": {
      "en": "Take a look at our therapies, like Padaabhyanga, Abhyanga, Shirodhara, Pizhichil, and Herbal Potli. You can tap 'Listen to Therapy' on any card to hear exactly how it works.",
      "te": "పాదాభ్యంగ, అభ్యంగ, శిరోధార, పిజిచిల్ మరియు హెర్బల్ పోట్లి వంటి మా థెరపీలను అన్వేషించండి. ప్రతి చికిత్స గురించి మరింత తెలుసుకోవడానికి కార్డ్‌పై 'వినండి' నొక్కండి."
    },
    "therapy-detail": {
      "en": "If you want to know what to expect, just tap 'Listen to Therapy' to hear a soothing explanation in your own language.",
      "te": "ఏదైనా కార్డ్‌పై థెరపీ వినండి నొక్కితే, ఆ చికిత్స ఎలా పనిచేస్తుందో మీ భాషలో వినవచ్చు."
    },
    "why-us": {
      "en": "Our guests love us for our certified expertise, and our strict dedication to authentic Kerala massage techniques. We also provide distinct care options for men and women.",
      "te": "అతిథులు మమ్మల్ని ఎందుకు విశ్వసిస్తారంటే, మా సర్టిఫైడ్ నైపుణ్యం, పురుషులకు మరియు స్త్రీలకు ప్రత్యేకమైన సేవలు మరియు అసలైన కేరళ మసాజ్ పద్ధతుల పట్ల మా నిబద్ధత."
    },
    "timings": {
      "en": "We're open every day from 9 AM to 8 PM, except on Mondays when we close early at 1 PM. It's always best to book your appointment in advance.",
      "te": "మేము ప్రతిరోజూ ఉదయం 9 గంటల నుండి రాత్రి 8 గంటల వరకు తెరిచి ఉంటాము, సోమవారం మాత్రం మధ్యాహ్నం 1 గంట వరకు మాత్రమే. మీరు ముందుగా అపాయింట్‌మెంట్ బుక్ చేసుకోవడం సూచించబడింది."
    },
    "experience": {
      "en": "You'll experience profound relaxation here, with warm herbal oils and a deeply peaceful atmosphere inspired by Kerala's heritage.",
      "te": "వెచ్చని హెర్బల్ నూనెలు, ప్రశాంతమైన వ్యక్తిగత సేవ మరియు కేరళ సంప్రదాయ స్ఫూర్తితో కూడిన ప్రశాంత వాతావరణంలో గొప్ప ఉపశమనాన్ని అనుభవించండి."
    },
    "location": {
      "en": "Here is where you can find our clinic in Narasaraopet. Just tap 'Directions' and Google Maps will guide you right to our door.",
      "te": "ఇది నరసరావుపేటలో మా క్లినిక్ ఉన్న ప్రదేశం. మా వద్దకు చేరుకోవడానికి, 'డైరెక్షన్స్' పై నొక్కండి, గూగుల్ మ్యాప్స్ మీకు మార్గదర్శకత్వం చేస్తుంది."
    },
    "booking": {
      "en": "Ready to relax? Just choose your service, therapy, and time. Your booking will be quickly confirmed over WhatsApp.",
      "te": "విశ్రాంతి తీసుకోవడానికి సిద్ధంగా ఉన్నారా? మీకు కావలసిన సేవ, థెరపీ, తేదీ మరియు సమయాన్ని ఎంచుకోండి. మీ బుకింగ్ అభ్యర్థన వాట్సాప్ ద్వారా నిర్ధారించబడుతుంది."
    },
    "contact": {
      "en": "We are always here to help. Feel free to call us or send a WhatsApp message anytime.",
      "te": "మేము మీకు సహాయం చేయడానికి ఎల్లప్పుడూ సిద్ధంగా ఉన్నాము. కాల్ లేదా వాట్సాప్ ద్వారా మమ్మల్ని సంప్రదించండి, లేదా నేరుగా రావడానికి మ్యాప్ మార్గాన్ని పొందండి."
    },
    "footer": {
      "en": "Thanks for exploring our therapies! You'll find all our contact details and quick links right down here at the bottom.",
      "te": "మా సేవలను పరిశీలించినందుకు ధన్యవాదాలు. మీరు మా పూర్తి సంప్రదింపు వివరాలు, చిరునామా మరియు ముఖ్యమైన లింక్‌లను ఇక్కడ పేజీ చివరన కనుగొనవచ్చు."
    }
}

async def generate():
    os.makedirs(AUDIO_DIR / "en", exist_ok=True)
    os.makedirs(AUDIO_DIR / "te", exist_ok=True)
    
    for section, scripts in MESSAGES.items():
        # English
        en_text = scripts["en"]
        en_out = AUDIO_DIR / "en" / f"{section}.mp3"
        print(f"Generating EN: {section}")
        edge_tts_bin = os.environ.get("LOCALAPPDATA", ROOT) + r"\SushrutaTTS\venv\Scripts\edge-tts.exe"
        subprocess.run([edge_tts_bin, "--voice", "en-IN-NeerjaNeural", "--rate", "+5%", "--text", en_text, "--write-media", str(en_out)], check=True)

        # Telugu
        te_text = scripts["te"]
        te_out = AUDIO_DIR / "te" / f"{section}.mp3"
        print(f"Generating TE: {section}")
        subprocess.run([edge_tts_bin, "--voice", "te-IN-ShrutiNeural", "--rate", "+0%", "--text", te_text, "--write-media", str(te_out)], check=True)

if __name__ == "__main__":
    asyncio.run(generate())
