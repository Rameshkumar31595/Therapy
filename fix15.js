const fs = require('fs');

// 1. Fix Telugu "Herbal Potli"
const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/voice-guide.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace హెర్బల్ పోట్లి with హాట్ పోట్లి
    let newContent = content.replace(/హెర్బల్ పోట్లి/g, 'హాట్ పోట్లి');
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Fixed Telugu translation in', file);
    }
});

// 2. Add Advantages to scripts.json
let scriptsFile = 'c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json';
let scriptsData = JSON.parse(fs.readFileSync(scriptsFile, 'utf8'));

// Padaabhyanga
scriptsData.padaabhyanga.en = scriptsData.padaabhyanga.en.replace(
    'People choose this therapy to ease leg pain, to sleep better, and to let go of stress.',
    'The main advantages of this therapy include immediate relief from leg and foot pain, improved blood circulation, and much deeper sleep at night. It is a fantastic way to release the stress of a long day.'
);
scriptsData.padaabhyanga.te = scriptsData.padaabhyanga.te.replace(
    'కాళ్ల నొప్పులు తగ్గడానికి, మంచి నిద్ర కోసం, ఒత్తిడి తగ్గడానికి దీన్ని ఎంచుకుంటారు.',
    'ఈ థెరపీ వల్ల కలిగే ప్రధాన లాభాలు: కాళ్లు మరియు పాదాల నొప్పుల నుంచి తక్షణ ఉపశమనం, మెరుగైన రక్త ప్రసరణ, మరియు రాత్రిపూట చాలా లోతైన నిద్ర. రోజంతా పడిన ఒత్తిడిని దూరం చేయడానికి ఇది అద్భుతంగా పనిచేస్తుంది.'
);

// Abhyanga 45
scriptsData.abhyanga45.en = scriptsData.abhyanga45.en.replace(
    'People choose this therapy for body aches, tiredness, and sleep problems.',
    'The key advantages are complete relief from body aches, a significant boost in energy levels by removing tiredness, and deep nourishment for your skin and muscles.'
);
scriptsData.abhyanga45.te = scriptsData.abhyanga45.te.replace(
    'ఒళ్లు నొప్పులు, అలసట, నిద్ర సమస్యలు ఉన్నవారు దీన్ని ఎంచుకుంటారు.',
    'దీని ప్రధాన లాభాలు: ఒళ్లు నొప్పుల నుంచి పూర్తి ఉపశమనం, అలసటను తొలగించి కొత్త ఉత్సాహాన్ని ఇవ్వడం, మరియు మీ చర్మం, కండరాలకు లోతైన పోషణ అందడం.'
);

// Abhyanga 60
scriptsData.abhyanga60.en = scriptsData.abhyanga60.en.replace(
    'People choose this session for deep relaxation, and for easier, more flexible joints and muscles.',
    'The exceptional advantages of this full-hour session include total stress relief, highly improved flexibility in your joints, and the easing of long-standing muscle stiffness.'
);
scriptsData.abhyanga60.te = scriptsData.abhyanga60.te.replace(
    'డీప్ రిలాక్సేషన్ కోసం, కీళ్లు కండరాల ఫ్లెక్సిబిలిటీ కోసం దీన్ని ఎంచుకుంటారు.',
    'ఈ పూర్తి గంట సెషన్ వల్ల కలిగే అద్భుతమైన లాభాలు: ఒత్తిడి నుంచి పూర్తి విముక్తి, కీళ్లలో మెరుగైన కదలిక, మరియు దీర్ఘకాలిక కండరాల బిగువును వదిలించడం.'
);

// Potli
scriptsData.potli.en = scriptsData.potli.en.replace(
    'People choose this therapy for body pains, joint pains, and muscle stiffness.',
    'The wonderful advantages of Hot Potli are its ability to rapidly reduce inflammation, provide soothing relief for severe joint and muscle pain, and bring deep comfort to the whole body.'
);
scriptsData.potli.te = scriptsData.potli.te.replace(
    'ఒళ్లు నొప్పులు, కీళ్ల నొప్పులు, కండరాలు పట్టేయడం ఉన్నవారు దీన్ని ఎక్కువగా ఎంచుకుంటారు.',
    'హాట్ పోట్లి వల్ల కలిగే అద్భుత లాభాలు: వాపులను వేగంగా తగ్గించడం, కీళ్లు మరియు కండరాల నొప్పుల నుంచి హాయినిచ్చే ఉపశమనం, మరియు శరీరానికి లోతైన సౌకర్యాన్ని అందించడం.'
);

// Shirodhara
scriptsData.shirodhara.en = scriptsData.shirodhara.en.replace(
    'People choose this therapy to ease stress, headaches, and sleeplessness.',
    'The profound advantages of Shirodhara are that it deeply calms the nervous system, clears away headaches and mental fatigue, and is incredibly effective for overcoming sleeplessness.'
);
scriptsData.shirodhara.te = scriptsData.shirodhara.te.replace(
    'ఒత్తిడి, తలనొప్పి, నిద్రలేమి తగ్గడానికి దీన్ని ఎంచుకుంటారు.',
    'శిరోధార వల్ల కలిగే గొప్ప లాభాలు: నాడీ వ్యవస్థను లోతుగా ప్రశాంతపరచడం, తలనొప్పి మరియు మానసిక అలసటను దూరం చేయడం, నిద్రలేమిని జయించడంలో ఇది అద్భుతంగా పనిచేయడం.'
);

// Pizhichil
scriptsData.pizhichil.en = scriptsData.pizhichil.en.replace(
    'People choose this therapy for complete rejuvenation… for joint pains and stiffness… and it nourishes the skin beautifully as well.',
    'The royal advantages of Pizhichil include powerful anti-aging benefits, absolute relief from joint stiffness, deep tissue healing, and beautifully glowing, well-nourished skin.'
);
scriptsData.pizhichil.te = scriptsData.pizhichil.te.replace(
    'శరీరానికి పూర్తి పునరుత్తేజం కోరుకునేవారు, కీళ్ల నొప్పులు, బిగుసుకుపోవడం ఉన్నవారు దీన్ని ఎంచుకుంటారు… చర్మానికి మంచి పోషణ కూడా అందుతుంది.',
    'పిళిచిల్ యొక్క రాజసం ఉట్టిపడే లాభాలు: అద్భుతమైన యాంటీ ఏజింగ్ ప్రయోజనాలు, కీళ్ల బిగువు నుంచి సంపూర్ణ ఉపశమనం, కండరాల లోపలి భాగాలకు స్వస్థత, మరియు అందంగా మెరిసే మృదువైన చర్మం.'
);

fs.writeFileSync(scriptsFile, JSON.stringify(scriptsData, null, 2), 'utf8');
console.log('Updated scripts.json with advantages.');
