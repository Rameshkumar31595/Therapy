const fs = require('fs');

const content = fs.readFileSync('c:/Users/HP/OneDrive/Desktop/Therapy/js/main.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    if (line.toLowerCase().includes('bk.')) {
        console.log(`Line ${i+1}: ${line.trim()}`);
    }
});
