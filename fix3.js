const fs = require('fs');

const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py',
    'c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json',
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html'
];

files.forEach(filepath => {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');

    // English replaces
    content = content.replace(/herbal oils/gi, 'natural oils');
    content = content.replace(/herbal oil/gi, 'natural oil');
    content = content.replace(/medicated oils/gi, 'natural oils');
    content = content.replace(/medicated oil/gi, 'natural oil');

    // Telugu replaces
    content = content.replace(/హెర్బల్ నూనెలు/g, 'సహజ నూనెలు');
    content = content.replace(/హెర్బల్ నూనెలతో/g, 'సహజ నూనెలతో');
    content = content.replace(/హెర్బల్ నూనె/g, 'సహజ నూనె');
    content = content.replace(/హెర్బల్ నూనెతో/g, 'సహజ నూనెతో');
    content = content.replace(/ఔషధ నూనెలు/g, 'సహజ నూనెలు');
    content = content.replace(/ఔషధ నూనెలో/g, 'సహజ నూనెలో');
    content = content.replace(/ఔషధ నూనె/g, 'సహజ నూనె');
    content = content.replace(/ఔషధ నూనెతో/g, 'సహజ నూనెతో');

    fs.writeFileSync(filepath, content, 'utf8');
});
