const {
  withAndroidManifest,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withAndroidNetworkSecurity(config) {
  // Спочатку додаємо посилання в AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;

    // Додаємо network security config до application
    if (manifest.application && manifest.application[0]) {
      manifest.application[0].$["android:networkSecurityConfig"] =
        "@xml/network_security_config";
      manifest.application[0].$["android:usesCleartextTraffic"] = "true";
    }

    return config;
  });

  // Потім копіюємо XML файл до Android ресурсів
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const { platformProjectRoot } = config.modRequest;
      const xmlDir = path.join(platformProjectRoot, "app/src/main/res/xml");
      const xmlFilePath = path.join(xmlDir, "network_security_config.xml");

      // Створюємо директорію xml якщо не існує
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }

      // Копіюємо наш XML файл
      const sourceXmlPath = path.join(
        config.modRequest.projectRoot,
        "android-network-security-config.xml"
      );
      if (fs.existsSync(sourceXmlPath)) {
        fs.copyFileSync(sourceXmlPath, xmlFilePath);
      }

      return config;
    },
  ]);

  return config;
};
