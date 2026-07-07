const fs = require('fs');

const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/certificates.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json',
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/booking.js'
];

files.forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf8');

    // Replace English
    content = content.replace(/\bClinic\b/g, 'Massage Therapy Center');
    content = content.replace(/\bclinic\b/g, 'massage therapy center');
    content = content.replace(/\bCLINIC\b/g, 'MASSAGE THERAPY CENTER');

    // Replace Telugu
    content = content.replace(/క్లినిక్‌లో/g, 'మసాజ్ థెరపీ సెంటర్‌లో');
    content = content.replace(/క్లినిక్‌కు/g, 'మసాజ్ థెరపీ సెంటర్‌కు');
    content = content.replace(/క్లినిక్‌ను/g, 'మసాజ్ థెరపీ సెంటర్‌ను');
    content = content.replace(/క్లినిక్‌కి/g, 'మసాజ్ థెరపీ సెంటర్‌కి');
    content = content.replace(/క్లినిక్/g, 'మసాజ్ థెరపీ సెంటర్');

    // Revert JS variable names that might have been broken by \bClinic\b or \bclinic\b or \bCLINIC\b 
    // Wait, \b matches boundary, so it wouldn't match CLINIC_ADDRESS, but it might match "Clinic" inside a string, which is what we want.
    // If there is any id="clinic" we should be careful. Let's fix specific IDs or classes if they broke.
    content = content.replace(/id="massage therapy center"/g, 'id="clinic"');
    content = content.replace(/class="massage therapy center/g, 'class="clinic');
    content = content.replace(/value="At Massage Therapy Center"/g, 'value="At Clinic"');
    
    // In booking.js, we have variables like atClinicVal. It's fine if the value changes to "At Massage Therapy Center".
    // But let's restore the variable name just in case. Wait, JS variables are camelCase so "atClinicVal" won't match \bclinic\b.

    fs.writeFileSync(filepath, content, 'utf8');
});
