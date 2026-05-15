const fs = require("fs");
const path = require("path");

const gradlePropsTargetFile = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo",
  "node_modules",
  "@expo",
  "cli",
  "build",
  "src",
  "run",
  "android",
  "resolveGradlePropsAsync.js"
);

const gradleTargetFile = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo",
  "node_modules",
  "@expo",
  "cli",
  "build",
  "src",
  "start",
  "platforms",
  "android",
  "gradle.js"
);

function patchResolveGradleProps() {
  const marker = "function preferPrimaryArchitecture";

  if (!fs.existsSync(gradlePropsTargetFile)) {
    console.warn(`[patch-expo-cli] Target file not found: ${gradlePropsTargetFile}`);
    return false;
  }

  const original = fs.readFileSync(gradlePropsTargetFile, "utf8");

  if (original.includes(marker)) {
    console.log("[patch-expo-cli] Expo CLI ABI patch already applied");
    return false;
  }

  const search = `async function getConnectedDeviceABIS(buildType, device, allArch) {
    // Follow the same behavior as iOS, only enable this for debug builds
    // Support both 'debug' and 'debugOptimized' build types
    const isDebugBuild = buildType === 'debug' || buildType === 'debugOptimized';
    if (allArch || !isDebugBuild) {
        return '';
    }
    const abis = await (0, _adb.getDeviceABIsAsync)(device);
    const validAbis = abis.filter((abi)=>VALID_ARCHITECTURES.includes(abi));
    return validAbis.filter((abi, i, arr)=>arr.indexOf(abi) === i).join(',');
}`;

  const replacement = `function preferPrimaryArchitecture(abis) {
    const uniqueAbis = abis.filter((abi, i, arr)=>arr.indexOf(abi) === i);
    if (uniqueAbis.includes('arm64-v8a') && uniqueAbis.includes('armeabi-v7a')) {
        return uniqueAbis.filter((abi)=>abi !== 'armeabi-v7a');
    }
    if (uniqueAbis.includes('x86_64') && uniqueAbis.includes('x86')) {
        return uniqueAbis.filter((abi)=>abi !== 'x86');
    }
    return uniqueAbis;
}
async function getConnectedDeviceABIS(buildType, device, allArch) {
    // Follow the same behavior as iOS, only enable this for debug builds
    // Support both 'debug' and 'debugOptimized' build types
    const isDebugBuild = buildType === 'debug' || buildType === 'debugOptimized';
    if (allArch || !isDebugBuild) {
        return '';
    }
    const abis = await (0, _adb.getDeviceABIsAsync)(device);
    const validAbis = abis.filter((abi)=>VALID_ARCHITECTURES.includes(abi));
    return preferPrimaryArchitecture(validAbis).join(',');
}`;

  if (!original.includes(search)) {
    throw new Error("[patch-expo-cli] Expected Expo CLI ABI source shape was not found");
  }

  fs.writeFileSync(gradlePropsTargetFile, original.replace(search, replacement));
  console.log("[patch-expo-cli] Expo CLI patched for primary ABI preference");
  return true;
}

function patchGradle() {
  if (!fs.existsSync(gradleTargetFile)) {
    console.warn(`[patch-expo-cli] Target file not found: ${gradleTargetFile}`);
    return false;
  }

  let patched = fs.readFileSync(gradleTargetFile, "utf8");
  const windowsAttrMarker = "(0, _child_process().execFileSync)('attrib'";
  const alreadyPatched =
    patched.includes("function ensureAndroidLocalProperties(projectRoot)") &&
    patched.includes("function clearWindowsNodeModuleAndroidBuildDirs(projectRoot)") &&
    patched.includes(windowsAttrMarker) &&
    patched.includes("ensureAndroidLocalProperties(projectRoot);") &&
    patched.includes("clearWindowsNodeModuleAndroidBuildDirs(projectRoot);");

  if (alreadyPatched) {
    console.log("[patch-expo-cli] Expo CLI Android SDK patch already applied");
    return false;
  }

  const pathFsHelper = `function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}`;

  const childProcessHelper = `function _path() {
    const data = /*#__PURE__*/ _interop_require_default(require("path"));
    _path = function() {
        return data;
    };
    return data;
}
function _child_process() {
    const data = require("child_process");
    _child_process = function() {
        return data;
    };
    return data;
}
function _fs() {
    const data = /*#__PURE__*/ _interop_require_default(require("fs"));
    _fs = function() {
        return data;
    };
    return data;
}`;

  const helperBlock = `const debug = require('debug')('expo:start:platforms:android:gradle');
function ensureAndroidLocalProperties(projectRoot) {
    const sdkCandidates = [
        process.env.ANDROID_HOME,
        process.env.ANDROID_SDK_ROOT,
        process.env.LOCALAPPDATA ? _path().default.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : null,
        process.env.USERPROFILE ? _path().default.join(process.env.USERPROFILE, 'AppData', 'Local', 'Android', 'Sdk') : null,
        'C:\\\\Android\\\\Sdk'
    ].filter(Boolean);
    const sdkPath = sdkCandidates.find((candidate)=>_fs().default.existsSync(candidate));
    if (!sdkPath) {
        return;
    }
    process.env.ANDROID_HOME = sdkPath;
    process.env.ANDROID_SDK_ROOT = sdkPath;
    const androidRoot = _path().default.dirname(projectRoot);
    const localPropertiesPath = _path().default.join(androidRoot, 'local.properties');
    const sdkDir = sdkPath.replace(/\\\\/g, '\\\\\\\\');
    const localPropertiesContents = 'sdk.dir=' + sdkDir + '\\n';
    if (!_fs().default.existsSync(localPropertiesPath) || _fs().default.readFileSync(localPropertiesPath, 'utf8') !== localPropertiesContents) {
        _fs().default.writeFileSync(localPropertiesPath, localPropertiesContents, 'ascii');
    }
}
function clearWindowsNodeModuleAndroidBuildDirs(projectRoot) {
    if (process.platform !== 'win32') {
        return;
    }
    const nodeModulesRoot = _path().default.resolve(_path().default.dirname(projectRoot), '..', 'node_modules');
    if (!_fs().default.existsSync(nodeModulesRoot)) {
        return;
    }
    const stack = [
        nodeModulesRoot
    ];
    while(stack.length){
        const current = stack.pop();
        let entries = [];
        try {
            entries = _fs().default.readdirSync(current, {
                withFileTypes: true
            });
        } catch  {
            continue;
        }
        for (const entry of entries){
            const fullPath = _path().default.join(current, entry.name);
            if (!entry.isDirectory()) {
                continue;
            }
            if (entry.name === 'android') {
                try {
                    (0, _child_process().execFileSync)('attrib', [
                        '-R',
                        fullPath,
                        '/S',
                        '/D'
                    ], {
                        stdio: 'ignore'
                    });
                } catch  {}
            }
            if (entry.name === 'build' && _path().default.basename(_path().default.dirname(fullPath)) === 'android') {
                try {
                    (0, _child_process().execFileSync)('attrib', [
                        '-R',
                        fullPath,
                        '/S',
                        '/D'
                    ], {
                        stdio: 'ignore'
                    });
                } catch  {}
                try {
                    _fs().default.rmSync(fullPath, {
                        recursive: true,
                        force: true
                    });
                } catch  {}
                continue;
            }
            if (entry.name !== '.git' && entry.name !== '.gradle') {
                stack.push(fullPath);
            }
        }
    }
}
function upperFirst(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}`;

  const clearBuildDirsBlock = `function clearWindowsNodeModuleAndroidBuildDirs(projectRoot) {
    if (process.platform !== 'win32') {
        return;
    }
    const nodeModulesRoot = _path().default.resolve(_path().default.dirname(projectRoot), '..', 'node_modules');
    if (!_fs().default.existsSync(nodeModulesRoot)) {
        return;
    }
    const stack = [
        nodeModulesRoot
    ];
    while(stack.length){
        const current = stack.pop();
        let entries = [];
        try {
            entries = _fs().default.readdirSync(current, {
                withFileTypes: true
            });
        } catch  {
            continue;
        }
        for (const entry of entries){
            const fullPath = _path().default.join(current, entry.name);
            if (!entry.isDirectory()) {
                continue;
            }
            if (entry.name === 'android') {
                try {
                    (0, _child_process().execFileSync)('attrib', [
                        '-R',
                        fullPath,
                        '/S',
                        '/D'
                    ], {
                        stdio: 'ignore'
                    });
                } catch  {}
            }
            if (entry.name === 'build' && _path().default.basename(_path().default.dirname(fullPath)) === 'android') {
                try {
                    (0, _child_process().execFileSync)('attrib', [
                        '-R',
                        fullPath,
                        '/S',
                        '/D'
                    ], {
                        stdio: 'ignore'
                    });
                } catch  {}
                try {
                    _fs().default.rmSync(fullPath, {
                        recursive: true,
                        force: true
                    });
                } catch  {}
                continue;
            }
            if (entry.name !== '.git' && entry.name !== '.gradle') {
                stack.push(fullPath);
            }
        }
    }
}`;

  if (!patched.includes("function _child_process()")) {
    if (!patched.includes(pathFsHelper)) {
      console.warn(
        "[patch-expo-cli] Skipping Android SDK bootstrap patch because Expo CLI gradle helper block was not found"
      );
      return false;
    }
    patched = patched.replace(pathFsHelper, childProcessHelper);
  }

  if (!patched.includes("function ensureAndroidLocalProperties(projectRoot)")) {
    const debugBlock = `const debug = require('debug')('expo:start:platforms:android:gradle');
function upperFirst(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}`;
    if (!patched.includes(debugBlock)) {
      console.warn(
        "[patch-expo-cli] Skipping Android SDK bootstrap patch because Expo CLI gradle debug block was not found"
      );
      return false;
    }
    patched = patched.replace(debugBlock, helperBlock);
  } else {
    patched = patched.replace(
      /function clearWindowsNodeModuleAndroidBuildDirs\(projectRoot\) \{[\s\S]*?\n\}\nfunction upperFirst\(name\) \{/,
      `${clearBuildDirsBlock}\nfunction upperFirst(name) {`
    );
  }

  if (!patched.includes("ensureAndroidLocalProperties(projectRoot);")) {
    patched = patched.replace(
      "async function spawnGradleAsync(projectRoot, { port, architectures, args, env }) {\n    const gradlew = resolveGradleWPath(projectRoot);",
      "async function spawnGradleAsync(projectRoot, { port, architectures, args, env }) {\n    const gradlew = resolveGradleWPath(projectRoot);\n    ensureAndroidLocalProperties(projectRoot);\n    clearWindowsNodeModuleAndroidBuildDirs(projectRoot);"
    );
  }

  fs.writeFileSync(gradleTargetFile, patched);
  console.log("[patch-expo-cli] Expo CLI patched for Android SDK bootstrap");
  return true;
}

try {
  const changed = [patchResolveGradleProps(), patchGradle()].some(Boolean);
  if (!changed) {
    console.log("[patch-expo-cli] Expo CLI patches already applied");
  }
} catch (error) {
  console.warn(`[patch-expo-cli] Non-fatal patch error: ${error.message || error}`);
}
