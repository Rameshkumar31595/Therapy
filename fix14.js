const fs = require('fs');
const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/voice-guide.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json'
];

const replacements = [
    { search: /Hot Herbal Potli/gi, replace: 'Hot Potli' },
    { search: /Herbal Pouch/gi, replace: 'Warm Pouch' },
    { search: /herbal pouch/gi, replace: 'warm pouch' },
    { search: /Kerala herbs/gi, replace: 'natural ingredients' },
    { search: /medicinal herbs/gi, replace: 'natural ingredients' },
    { search: /aroma of the herbs/gi, replace: 'natural aroma' },
    { search: /bundles of herbs/gi, replace: 'natural bundles' },
    { search: /scent of herbs/gi, replace: 'scent of nature' },
    { search: /herbal leaves/gi, replace: 'natural leaves' },
    { search: /\bherbs\b/gi, replace: 'natural ingredients' },
    { search: /\bherbal\b/gi, replace: 'natural' }
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated', file);
    }
});
