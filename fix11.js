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
    { search: /Hot Potli: Warm Pouch Massage/g, replace: 'Hot Herbal Potli: Herbal Pouch Massage' },
    { search: />Hot Potli</g, replace: '>Hot Herbal Potli<' },
    { search: />Warm Pouch Massage</g, replace: '>Herbal Pouch Massage<' },
    { search: /data-book="Hot Potli"/g, replace: 'data-book="Hot Herbal Potli"' },
    { search: /value="Hot Potli"/g, replace: 'value="Hot Herbal Potli"' },
    { search: /Hot Potli · 45 min/g, replace: 'Hot Herbal Potli · 45 min' },
    { search: /Warm muslin pouches filled with natural ingredients/g, replace: 'Warm muslin pouches filled with Kerala herbs' }
]);

// 2. js/booking.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js', [
    { search: /"Hot Potli"/g, replace: '"Hot Herbal Potli"' },
    { search: /"హాట్ పోట్లి"/g, replace: '"హాట్ హెర్బల్ పోట్లి"' }
]);

// 3. js/bubble.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js', [
    { search: /Hot Potli/g, replace: 'Hot Herbal Potli' },
    { search: /warm pouches/g, replace: 'herbal pouches' },
    { search: /natural ingredients/g, replace: 'medicinal herbs' },
    { search: /Our Potli therapy applies heated herbal bags/g, replace: 'Our Potli therapy applies heated herbal bags' } // it was originally herbal bags, let's just make sure "Hot Herbal Potli" is everywhere
]);

// 4. generate-bubble.py
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py', [
    { search: /Hot Potli/g, replace: 'Hot Herbal Potli' },
    { search: /warm pouches/g, replace: 'herbal pouches' },
    { search: /natural ingredients/g, replace: 'medicinal herbs' }
]);

// 5. js/voice-guide.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/voice-guide.js', [
    { search: /"Hot Potli"/g, replace: '"Hot Herbal Potli"' },
    { search: /"హాట్ పోట్లి"/g, replace: '"హాట్ హెర్బల్ పోట్లి"' },
    { search: /"Warm Pouch Massage"/g, replace: '"Herbal Pouch Massage"' },
    { search: /"వామ్ పోట్లి మసాజ్"/g, replace: '"హెర్బల్ పోట్లి మసాజ్"' }
]);

// 6. narration/scripts.json
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json', [
    { search: /Hot Potli/g, replace: 'Hot Herbal Potli' },
    { search: /warm natural bundles/g, replace: 'warm bundles of herbs' },
    { search: /natural ingredients into/g, replace: 'Kerala herbs into' },
    { search: /natural aroma/g, replace: 'aroma of the herbs' },
    { search: /హాట్ పోట్లి/g, replace: 'హాట్ హెర్బల్ పోట్లి' },
    { search: /వేడి మూటలతో/g, replace: 'వేడి మూలికల మూటలతో' },
    { search: /సహజ దినుసులను కట్టి/g, replace: 'కేరళ మూలికలను కట్టి' },
    { search: /సహజ సువాసన/g, replace: 'మూలికల సువాసన' }
]);
