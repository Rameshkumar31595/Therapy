const fs = require('fs');

const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/voice-guide.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py',
    'c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json'
];

function replaceAll(file, replacements) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(([regex, replacement]) => {
        content = content.replace(regex, replacement);
    });
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}

const replacements = [
    // 1. Clinic
    [/At Clinic/g, 'At Massage Therapy Center'],
    [/\bClinic\b/gi, 'Massage Therapy Center'],
    [/CLINIC_ADDRESS/g, 'CENTER_ADDRESS'],
    [/CLINIC_MAPS/g, 'CENTER_MAPS'],
    [/CLINIC_THERAPIES/g, 'CENTER_THERAPIES'],
    [/atClinicVal/g, 'atCenterVal'],
    [/bk\.clinic/g, 'bk.center'],

    // 2. Herbal / Herbs (English)
    [/\bHerbal\b/gi, 'Natural'],
    [/\bherbal\b/gi, 'natural'],
    [/\bherbs\b/gi, 'natural ingredients'],
    [/\bherb\b/gi, 'natural ingredient'],

    // 3. Herbal / Herbs (Telugu)
    [/మూలికా/g, 'సహజ'],
    [/మూలికల/g, 'సహజ పదార్థాల'],
    [/మూలికలతో/g, 'సహజ పదార్థాలతో'],
    [/మూలికలు/g, 'సహజ పదార్థాలు'],
    [/మూలిక/g, 'సహజ పదార్థం'],
    [/ఔషధ సహజ పదార్థాల/g, 'సహజ నూనెల'],

    // 4. Ayurveda
    [/\bAyurvedic\b/gi, 'Kerala'],
    [/\bayurvedic\b/gi, 'kerala'],
    [/\bAyurveda\b/gi, 'Kerala Massage'],
    [/\bayurveda\b/gi, 'kerala massage'],

    // 5. Treatment / Cure / Heal
    [/\bTreatments\b/gi, 'Therapies'],
    [/\btreatments\b/gi, 'therapies'],
    [/\bTreatment\b/gi, 'Therapy'],
    [/\btreatment\b/gi, 'therapy'],
    [/\bcure\b/gi, 'soothe'],
    [/\bheal\b/gi, 'comfort'],
    [/\bhealing\b/gi, 'comforting'],
    
    // 6. Treatment (Telugu)
    [/చికిత్సలు/g, 'థెరపీలు'],
    [/చికిత్స/g, 'థెరపీ'],
    [/వైద్యం/g, 'థెరపీ'],
    [/స్వస్థత/g, 'విశ్రాంతి']
];

files.forEach(file => {
    replaceAll(file, replacements);
});

console.log("Scrubbing complete!");
