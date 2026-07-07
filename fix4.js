const fs = require('fs');

function replaceAll(filepath, replacements) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filepath, content, 'utf8');
}

// 1. Fix hero.t3 in index.html
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/index.html', [
    {
        search: /<span class="gold-italic" data-i18n="hero\.t3" style="white-space: nowrap; font-size: 0\.75em;">At Our Massage Therapy Center Or In Your Home<\/span>/,
        replace: '<span class="gold-italic" data-i18n="hero.t3" style="font-size: 0.75em;">At Our Massage Therapy Center<br class="hide-desktop"> Or In Your Home</span>'
    },
    { search: /Herbal Steam/g, replace: 'Hot Steam Bath' },
    { search: /Herbal steam/g, replace: 'Hot steam bath' },
    { search: /herbal steam/g, replace: 'hot steam bath' }
]);

// 2. Fix js/main.js (Telugu translations)
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js', [
    { search: /హెర్బల్ స్టీమ్/g, replace: 'హాట్ స్టీమ్ బాత్' }
]);

// 3. Fix js/booking.js
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js', [
    { search: /"Herbal Steam"/g, replace: '"Hot Steam Bath"' },
    { search: /"హెర్బల్ స్టీమ్"/g, replace: '"హాట్ స్టీమ్ బాత్"' }
]);

// Note: Ensure the JS comments are fine. booking.js has "// Herbal Steam is massage therapy center-only" etc. which we can leave as is or update.
replaceAll('c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js', [
    { search: /Herbal Steam/g, replace: 'Hot Steam Bath' }
]);
