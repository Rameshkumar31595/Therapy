const fs = require('fs');
const files = [
    'c:/Users/HP/OneDrive/Desktop/Therapy/js/bubble.js',
    'c:/Users/HP/OneDrive/Desktop/Therapy/generate-bubble.py',
    'c:/Users/HP/OneDrive/Desktop/Therapy/index.html'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // English replacements
    content = content.replace(/\bhealing\b/gi, 'soothing');
    content = content.replace(/\bheal\b/gi, 'soothe');
    content = content.replace(/\bcure\b/gi, 'comfort');
    content = content.replace(/\bcuring\b/gi, 'comforting');
    content = content.replace(/\bmedicinal\b/gi, 'natural');
    content = content.replace(/\bmedical\b/gi, 'therapeutic');
    content = content.replace(/\btreat yourself\b/gi, 'pamper yourself');
    content = content.replace(/\bTreat yourself\b/gi, 'Pamper yourself');
    
    // Check if 'treatment' still somehow exists (just in case)
    content = content.replace(/\btreatments\b/gi, 'massage therapies');
    content = content.replace(/\btreatment\b/gi, 'massage therapy');
    content = content.replace(/\bTreatments\b/gi, 'Massage therapies');
    content = content.replace(/\bTreatment\b/gi, 'Massage therapy');
    
    // Telugu replacements
    content = content.replace(/వైద్యం/g, 'మసాజ్');
    content = content.replace(/వైద్య/g, 'మసాజ్'); // Covers వైద్యాన్ని (becomes మసాజ్న్ని, which is fine enough, or let's be precise)
    content = content.replace(/వైద్యాన్ని/g, 'మసాజ్‌ను');
    content = content.replace(/స్వస్థతను/g, 'హాయిని');
    content = content.replace(/స్వస్థత/g, 'ఉపశమనం');
    content = content.replace(/చికిత్సలకు/g, 'థెరపీలకు');
    content = content.replace(/చికిత్సలను/g, 'థెరపీలను');
    content = content.replace(/చికిత్సలలో/g, 'థెరపీలలో');
    content = content.replace(/చికిత్సకు/g, 'థెరపీకి');
    content = content.replace(/చికిత్సలు/g, 'థెరపీలు');
    content = content.replace(/చికిత్స/g, 'థెరపీ');

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed', file);
});
