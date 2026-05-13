const fs = require("fs");
const path = require("path");

const targetFile = path.join(
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

const marker = "function preferPrimaryArchitecture";

if (!fs.existsSync(targetFile)) {
  console.warn(`[patch-expo-cli] Target file not found: ${targetFile}`);
  process.exit(0);
}

const original = fs.readFileSync(targetFile, "utf8");

if (original.includes(marker)) {
  console.log("[patch-expo-cli] Expo CLI patch already applied");
  process.exit(0);
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
  console.error("[patch-expo-cli] Expected Expo CLI source shape was not found");
  process.exit(1);
}

fs.writeFileSync(targetFile, original.replace(search, replacement));
console.log("[patch-expo-cli] Expo CLI patched for primary ABI preference");
