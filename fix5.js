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
    { search: /Ayurvedic/g, replace: 'Massage' },
    { search: /Ayurveda/g, replace: 'Massage' },
    { search: /Hot Herbal Potli/g, replace: 'Hot Potli' },
    { search: /Herbal Pouch/g, replace: 'Warm Pouch' },
    { search: /herbal pouch/g, replace: 'warm pouch' },
    { search: /Kerala herbs/g, replace: 'natural ingredients' },
    { search: /deco-herb/g, replace: 'deco-leaf' },
    { search: /herb-leaf/g, replace: 'deco-leaf-icon' },
    { search: /herbs & warm golden light/g, replace: 'nature & warm golden light' }
]);

// 2. js/booking.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js', [
    { search: /Hot Herbal Potli/g, replace: 'Hot Potli' },
    { search: /హాట్ హెర్బల్ పోట్లి/g, replace: 'హాట్ పోట్లి' }
]);

// 3. js/bubble.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js', [
    { search: /Ayurvedic/g, replace: 'Massage' },
    { search: /Ayurveda/g, replace: 'Massage tradition' },
    { search: /Herbal Potli/g, replace: 'Hot Potli' },
    { search: /herbal pouches/g, replace: 'warm pouches' },
    { search: /medicinal herbs/g, replace: 'natural ingredients' }
]);

// 4. generate-bubble.py
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py', [
    { search: /Ayurvedic/g, replace: 'Massage' },
    { search: /Ayurveda/g, replace: 'Massage tradition' },
    { search: /Herbal Potli/g, replace: 'Hot Potli' },
    { search: /herbal pouches/g, replace: 'warm pouches' },
    { search: /medicinal herbs/g, replace: 'natural ingredients' }
]);

// 5. js/voice-guide.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/voice-guide.js', [
    { search: /Hot Herbal Potli/g, replace: 'Hot Potli' },
    { search: /హాట్ హెర్బల్ పోట్లి/g, replace: 'హాట్ పోట్లి' },
    { search: /Herbal Pouch Massage/g, replace: 'Warm Pouch Massage' },
    { search: /హెర్బల్ పోట్లి మసాజ్/g, replace: 'వామ్ పోట్లి మసాజ్' }
]);

// 6. js/certificates.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/certificates.js', [
    { search: /Ayurveda Therapist/g, replace: 'Massage Therapist' },
    { search: /Sree Chithra Ayurveda/g, replace: 'Sree Chithra Kerala Massage' }
]);

// 7. narration/scripts.json
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json', [
    { search: /In Kerala Ayurveda/g, replace: 'In the Kerala massage tradition' },
    { search: /Ayurveda's finest/g, replace: 'our finest' },
    { search: /Hot Herbal Potli/g, replace: 'Hot Potli' },
    { search: /bundles of herbs/g, replace: 'warm natural bundles' },
    { search: /Kerala herbs/g, replace: 'natural ingredients' },
    { search: /aroma of the herbs/g, replace: 'natural aroma' }
]);
