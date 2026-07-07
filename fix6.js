const fs = require('fs');

function replaceAll(filepath, replacements) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filepath, content, 'utf8');
}

// Fix Telugu in scripts.json
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json', [
    { search: /హాట్ హెర్బల్ పోట్లి/g, replace: 'హాట్ పోట్లి' },
    { search: /వేడి మూలికల మూటలతో/g, replace: 'వేడి మూటలతో' },
    { search: /కేరళ మూలికలను కట్టి/g, replace: 'సహజ దినుసులను కట్టి' },
    { search: /మూలికల సువాసన/g, replace: 'సహజ సువాసన' }
]);
