const toIco = require("to-ico");
const fs = require("fs");
const path = require("path");

async function generateIco() {
  try {
    const resourcesDir = path.join(__dirname, "../src/resources");

    const pngFiles = [
      path.join(resourcesDir, "icon-16.png"),
      path.join(resourcesDir, "icon-32.png"),
      path.join(resourcesDir, "icon-64.png"),
      path.join(resourcesDir, "icon-128.png"),
      path.join(resourcesDir, "icon-256.png"),
    ];

    const pngBuffers = pngFiles.map((file) => fs.readFileSync(file));

    const icoBuffer = await toIco(pngBuffers);
    const icoPath = path.join(resourcesDir, "icon.ico");

    fs.writeFileSync(icoPath, icoBuffer);
    console.log("Generated icon.ico successfully!");
  } catch (error) {
    console.error("Error generating ICO:", error);
  }
}

generateIco();
