const fs = require('fs');

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

// Fix natural natural ingredients typo in generate-bubble.py
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py', [
    [/natural natural ingredients/g, 'natural ingredients'],
    [/heated Natural bags/g, 'heated natural bags'],
    [/Hot Natural Potli/g, 'Hot Potli']
]);

// Fix lowercase matching key in main.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js', [
    [/"bk\.Massage Therapy Center"/g, '"bk.massage therapy center"']
]);
