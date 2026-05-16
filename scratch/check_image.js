const fs = require('fs');
const path = require('path');

// Basic PNG dimension reader
function getPngDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    if (buffer.toString('ascii', 1, 4) !== 'PNG') {
        return null;
    }
    const width = buffer.readInt32BE(16);
    const height = buffer.readInt32BE(20);
    return { width, height };
}

const iconPath = path.join('d:', 'VS_CODE', 'ustyle', 'Ai-Ready-UyStyle_Personal_App', 'assets', 'app-icon.png');
console.log(JSON.stringify(getPngDimensions(iconPath)));
