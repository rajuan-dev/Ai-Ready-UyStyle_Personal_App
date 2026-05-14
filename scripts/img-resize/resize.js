const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../../assets/images/logo.png');
const iconPath = path.join(__dirname, '../../assets/icon.png');
const adaptiveIconPath = path.join(__dirname, '../../assets/adaptive-icon.png');

async function processIcon() {
    try {
        console.log("Generating icon.png (opaque background)...");
        // For general icon (e.g. iOS), opaque white background is recommended
        await sharp(inputPath)
            .resize(600, 600, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 } // Resize first on transparent canvas
            })
            .extend({
                top: 212,
                bottom: 212,
                left: 212,
                right: 212,
                background: { r: 255, g: 255, b: 255, alpha: 1 } // Opaque white background
            })
            .toFile(iconPath);

        console.log("Generating adaptive-icon.png (transparent background)...");
        // For Android adaptive icon foreground, transparent background is needed
        await sharp(inputPath)
            .resize(600, 600, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .extend({
                top: 212,
                bottom: 212,
                left: 212,
                right: 212,
                background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
            })
            .toFile(adaptiveIconPath);

        console.log("Icons successfully generated.");
    } catch (error) {
        console.error("Error generating icons:", error);
    }
}

processIcon();
