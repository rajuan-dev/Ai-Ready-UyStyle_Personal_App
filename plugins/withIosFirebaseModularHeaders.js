const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

const MODULAR_HEADERS_TAG = "uystyle-ios-firebase-modular-headers";

module.exports = function withIosFirebaseModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const podfilePath = path.join(
        modConfig.modRequest.platformProjectRoot,
        "Podfile"
      );

      if (!fs.existsSync(podfilePath)) {
        return modConfig;
      }

      let contents = fs.readFileSync(podfilePath, "utf8");

      if (!contents.includes(MODULAR_HEADERS_TAG)) {
        contents = contents.replace(
          /prepare_react_native_project!\r?\n/,
          `prepare_react_native_project!\n\n# ${MODULAR_HEADERS_TAG}\nuse_modular_headers!\n`
        );
      }

      fs.writeFileSync(podfilePath, contents, "utf8");
      return modConfig;
    },
  ]);
};
