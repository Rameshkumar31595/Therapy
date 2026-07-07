const fs = require('fs');

function replaceAll(filepath, replacements) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filepath, content, 'utf8');
}

const bubbleFiles = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py'
];

for (let file of bubbleFiles) {
    replaceAll(file, [
        { search: /సోమవారం మధ్యాహ్నం/g, replace: 'శనివారం మధ్యాహ్నం' }
    ]);
}
