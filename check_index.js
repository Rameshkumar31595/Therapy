const fs = require('fs');

function checkFile(path) {
    const buf = fs.readFileSync(path);
    // Check if it is UTF-16LE
    let content = '';
    if (buf[0] === 0xff && buf[1] === 0xfe) {
        content = buf.toString('utf16le');
        console.log(`${path} is UTF-16LE`);
    } else {
        content = buf.toString('utf8');
        console.log(`${path} is UTF-8/other`);
    }

    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('bk.')) {
            console.log(`Found bk. on line ${i+1}: ${line.trim()}`);
        }
        if (line.toLowerCase().includes('clinic')) {
            console.log(`Found clinic on line ${i+1}: ${line.trim()}`);
        }
        if (line.toLowerCase().includes('treatment')) {
            console.log(`Found treatment on line ${i+1}: ${line.trim()}`);
        }
    });
}

checkFile('c:/Users/HP/OneDrive/Desktop/Therapy/index.html');
