const fs = require('fs');

const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/voice-guide.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py',
    'c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-audio.py'
];

const forbidden = [
    { word: 'clinic', regex: /\bclinic\b/i },
    { word: 'treatment', regex: /\btreatment\b/i },
    { word: 'treatments', regex: /\btreatments\b/i },
    { word: 'ayurveda', regex: /\bayurveda\b/i },
    { word: 'ayurvedic', regex: /\bayurvedic\b/i },
    { word: 'herb', regex: /\bherb\b/i },
    { word: 'herbs', regex: /\bherbs\b/i },
    { word: 'herbal', regex: /\bherbal\b/i },
    { word: 'చికిత్స', regex: /చికిత్స/ },
    { word: 'వైద్యం', regex: /వైద్యం/ },
    { word: 'వైద్య', regex: /వైద్య/ },
    { word: 'స్వస్థత', regex: /స్వస్థత/ },
    { word: 'మూలిక', regex: /మూలిక/ }
];

let totalHits = 0;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
        forbidden.forEach(f => {
            if (f.regex.test(line)) {
                // Ignore code comments, config variables, or helper script checks to focus on actual UI text
                // However, let's print everything first to be completely sure.
                console.log(`[FOUND] file: ${file}:${index + 1} | Pattern: ${f.word} | Content: ${line.trim()}`);
                totalHits++;
            }
        });
    });
});

console.log(`Total Hits: ${totalHits}`);
