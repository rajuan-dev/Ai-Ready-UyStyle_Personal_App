const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

const MODULAR_HEADERS_TAG = "uystyle-ios-firebase-modular-headers";
const STATIC_FRAMEWORKS_TAG = "uystyle-ios-rnfirebase-static-frameworks";
const RNFB_BUILD_SETTINGS_TAG = "uystyle-ios-rnfirebase-build-settings";
const modularHeaderPods = [
  "FirebaseAuthInterop",
  "FirebaseAppCheckInterop",
  "GoogleUtilities",
  "RecaptchaInterop",
  "FirebaseFirestoreInternal",
];

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

      contents = contents.replace(
        /\n?# ustyle-ios-rnfirebase-static-frameworks[\s\S]*?\$RNFirebaseAsStaticFramework = true\s*\n/m,
        "\n"
      );
      contents = contents.replace(
        /\n?# ustyle-ios-firebase-modular-headers[\s\S]*?(?=\n\s*(target |post_integrate do|post_install do|end\s*$))/m,
        "\n"
      );
      contents = contents.replace(/\n\s*use_modular_headers!\s*\n/g, "\n");
      contents = contents.replace(
        /\n\s*use_frameworks!\s*:linkage\s*=>\s*:static\s*if\s+linkage\.nil\?\s*\n/g,
        "\n"
      );

      if (!contents.includes(STATIC_FRAMEWORKS_TAG)) {
        contents = contents.replace(
          /prepare_react_native_project!\r?\n/,
          `prepare_react_native_project!\n\n# ${STATIC_FRAMEWORKS_TAG}\n$RNFirebaseAsStaticFramework = true\n`
        );
      }

      if (!contents.includes(MODULAR_HEADERS_TAG)) {
        const podBlock = modularHeaderPods
          .map((podName) => `  pod '${podName}', :modular_headers => true`)
          .join("\n");

        contents = contents.replace(
          /target ['"][^'"]+['"] do\r?\n/,
          (match) =>
            `${match}  use_frameworks! :linkage => :static\n  # ${MODULAR_HEADERS_TAG}\n${podBlock}\n`
        );
      }

      const buildSettingsSnippet = `    # ${RNFB_BUILD_SETTINGS_TAG}
    installer.pods_project.targets.each do |target|
      next unless ['RNFBApp', 'RNFBAuth', 'RNFBFirestore', 'RNFBStorage'].include?(target.name)

      target.build_configurations.each do |build_configuration|
        build_configuration.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end
`;

      if (!contents.includes(RNFB_BUILD_SETTINGS_TAG)) {
        contents = contents.replace(
          /post_install do \|installer\|\r?\n/,
          (match) => `${match}${buildSettingsSnippet}`
        );
      }

      fs.writeFileSync(podfilePath, contents, "utf8");
      return modConfig;
    },
  ]);
};
