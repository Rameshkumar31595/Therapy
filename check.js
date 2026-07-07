const fs = require('fs');
const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/voice-guide.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py'
];

const patterns = [
    /ayurveda/i,
    /ayurvedic/i,
    /treatment/i,
    /treatments/i,
    /clinic/i,
    /herb\b/i,
    /herbs\b/i,
    /herbal\b/i,
    /చికిత్స/i,
    /స్వస్థత/i,
    /వైద్యం/i,
    /వైద్య/i,
    /మూలిక/i
];

let found = false;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
        patterns.forEach(pattern => {
            if (pattern.test(line)) {
                console.log(`Found ${pattern} in ${file}:${i + 1} -> ${line.trim()}`);
                found = true;
            }
        });
    });
});

if (!found) {
    console.log("No restricted terms found!");
}
