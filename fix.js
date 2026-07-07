const fs = require('fs');

const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py',
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/certificates.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/narration/scripts.json',
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html'
];

files.forEach(filepath => {
    let content = fs.readFileSync(filepath, 'utf8');

    // Replace Telugu
    content = content.replace(/చికిత్సలకు/g, 'థెరపీలకు');
    content = content.replace(/చికిత్సలను/g, 'థెరపీలను');
    content = content.replace(/చికిత్సలలో/g, 'థెరపీలలో');
    content = content.replace(/చికిత్సకు/g, 'థెరపీకి');
    content = content.replace(/చికిత్సలు/g, 'థెరపీలు');
    content = content.replace(/చికిత్స/g, 'థెరపీ');

    content = content.replace(/కేరళ ఆయుర్వేద సంప్రదాయం/g, 'కేరళ మసాజ్ సంప్రదాయం');
    content = content.replace(/ఆయుర్వేద అనుభవం/g, 'మసాజ్ అనుభవం');
    content = content.replace(/ఆయుర్వేద పద్ధతుల్లో/g, 'మసాజ్ పద్ధతుల్లో');
    content = content.replace(/ఆయుర్వేద మరియు/g, 'మరియు');
    content = content.replace(/ఆయుర్వేద థెరపిస్ట్/g, 'థెరపిస్ట్');
    content = content.replace(/ఆయుర్వేద థెరపీ/g, 'మసాజ్ థెరపీ');
    content = content.replace(/ఆయుర్వేదాన్ని/g, 'మసాజ్ సంప్రదాయాన్ని');
    content = content.replace(/ఆయుర్వేద సర్టిఫికేట్లు/g, 'మసాజ్ సర్టిఫికేట్లు');
    content = content.replace(/ఆయుర్వేద సేవలు/g, 'మసాజ్ సేవలు');
    content = content.replace(/కేరళ ఆయుర్వేదంలో/g, 'కేరళ మసాజ్ సంప్రదాయంలో');
    content = content.replace(/ఆయుర్వేదం ఇచ్చే/g, 'కేరళ థెరపీ ఇచ్చే');
    content = content.replace(/ఆయుర్వేద/g, 'మసాజ్');
    content = content.replace(/ఆయుర్వేదం/g, 'మసాజ్ సంప్రదాయం');

    // Replace English
    content = content.replace(/Treatments/g, 'Massage therapies');
    content = content.replace(/treatments/g, 'massage therapies');
    content = content.replace(/Treatment/g, 'Massage therapy');
    content = content.replace(/treatment/g, 'massage therapy');

    fs.writeFileSync(filepath, content, 'utf8');
});
