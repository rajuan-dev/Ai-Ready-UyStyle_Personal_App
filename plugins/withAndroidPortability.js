const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  withDangerousMod,
  withProjectBuildGradle,
} = require("expo/config-plugins");

const BUILD_DIR_REDIRECT_TAG = "uystyle-node-modules-build-redirect";

function escapeSdkDir(sdkPath) {
  return sdkPath.replace(/\\/g, "\\\\");
}

function resolveAndroidSdkPath() {
  const homeDir = os.homedir();
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, "Android", "Sdk")
      : null,
    process.env.USERPROFILE
      ? path.join(process.env.USERPROFILE, "AppData", "Local", "Android", "Sdk")
      : null,
    homeDir ? path.join(homeDir, "AppData", "Local", "Android", "Sdk") : null,
    homeDir ? path.join(homeDir, "Library", "Android", "sdk") : null,
    homeDir ? path.join(homeDir, "Android", "Sdk") : null,
    "/opt/android-sdk",
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function withAndroidLocalProperties(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const sdkPath = resolveAndroidSdkPath();
      if (!sdkPath) {
        console.warn(
          "[withAndroidPortability] Android SDK not found; skipping local.properties generation."
        );
        return modConfig;
      }

      const localPropertiesPath = path.join(
        modConfig.modRequest.platformProjectRoot,
        "local.properties"
      );
      const contents = `sdk.dir=${escapeSdkDir(sdkPath)}\n`;
      fs.writeFileSync(localPropertiesPath, contents, "utf8");
      return modConfig;
    },
  ]);
}

function withNodeModuleBuildRedirect(config) {
  if (process.platform !== "win32") {
    return config;
  }

  return withProjectBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language !== "groovy") {
      return modConfig;
    }

    if (modConfig.modResults.contents.includes(BUILD_DIR_REDIRECT_TAG)) {
      return modConfig;
    }

    modConfig.modResults.contents += `

// ${BUILD_DIR_REDIRECT_TAG}
def ustyleNewArchEnabled = (findProperty('newArchEnabled') ?: 'false').toBoolean()
if (System.properties['os.name'].toLowerCase().contains('windows') && !ustyleNewArchEnabled) {
  def ustyleNodeModulesDir = new File(rootProject.projectDir, "../node_modules").canonicalFile
  subprojects { subproject ->
    def subprojectDir = subproject.projectDir.canonicalFile
    if (subprojectDir.path.startsWith(ustyleNodeModulesDir.path + File.separator)) {
      def safeProjectName = subproject.path.replace(':', '_')
      subproject.layout.buildDirectory.set(
        new File(rootProject.layout.buildDirectory.asFile.get(), "node-modules-android/" + safeProjectName)
      )
    }
  }
}
`;

    return modConfig;
  });
}

module.exports = function withAndroidPortability(config) {
  config = withAndroidLocalProperties(config);
  config = withNodeModuleBuildRedirect(config);
  return config;
};
