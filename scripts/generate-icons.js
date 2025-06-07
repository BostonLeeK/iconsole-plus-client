const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const iconSizes = [16, 32, 64, 128, 256, 512, 1024];
const svgPath = path.join(__dirname, "../src/resources/icon.svg");
const outputDir = path.join(__dirname, "../src/resources");

async function generateIcons() {
  try {
    const svgBuffer = fs.readFileSync(svgPath);

    for (const size of iconSizes) {
      const pngPath = path.join(outputDir, `icon-${size}.png`);
      await sharp(svgBuffer).resize(size, size).png().toFile(pngPath);
      console.log(`Generated ${pngPath}`);
    }

    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(outputDir, "icon.png"));
    console.log("Generated icon.png");

    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
