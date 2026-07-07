const fs = require('fs');

function replaceAll(filepath, replacements) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filepath, content, 'utf8');
}

// 1. index.html
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/index.html', [
    { search: /Monday 9 AM to 1 PM/g, replace: 'Saturday 9 AM to 1 PM' }
]);

// 2. js/main.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js', [
    { search: /సోమవారం 9 AM నుండి 1 PM/g, replace: 'శనివారం 9 AM నుండి 1 PM' }
]);

// 3. js/bubble.js & generate-bubble.py
const bubbleFiles = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py'
];

for (let file of bubbleFiles) {
    replaceAll(file, [
        { search: /except on Mondays when we close early at 1 PM/g, replace: 'except on Saturdays when we close early at 1 PM' },
        { search: /though we do close at 1 PM on Mondays/g, replace: 'though we do close at 1 PM on Saturdays' },
        { search: /and until 1 PM on Mondays/g, replace: 'and until 1 PM on Saturdays' }
    ]);
}
