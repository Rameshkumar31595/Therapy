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
        { search: /సోమవారం మాత్రం/g, replace: 'శనివారం మాత్రం' },
        { search: /సోమవారాల్లో/g, replace: 'శనివారాల్లో' }
    ]);
}
