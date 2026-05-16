param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ExpoArgs
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $projectRoot "android"
$applicationId = "com.rajuan.dev.personal_stylist_app"
$sdkCandidates = @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    (Join-Path $env:LOCALAPPDATA "Android\\Sdk"),
    (Join-Path $env:USERPROFILE "AppData\\Local\\Android\\Sdk"),
    "C:\\Android\\Sdk"
) | Where-Object { $_ }

function Convert-ToGradleSdkDir([string]$Path) {
    return $Path.Replace("\", "\\").Replace(":", "\:")
}

function Initialize-AndroidSdk {
    $sdkPath = $sdkCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

    if (-not $sdkPath) {
        throw "Android SDK not found. Set ANDROID_HOME or install the SDK under %LOCALAPPDATA%\\Android\\Sdk."
    }

    $resolvedSdkPath = (Resolve-Path $sdkPath).Path
    $env:ANDROID_HOME = $resolvedSdkPath
    $env:ANDROID_SDK_ROOT = $resolvedSdkPath

    $localPropertiesPath = Join-Path $androidDir "local.properties"
    $expectedLocalProperties = "sdk.dir=$(Convert-ToGradleSdkDir $resolvedSdkPath)"
    $currentLocalProperties = if (Test-Path $localPropertiesPath) {
        (Get-Content $localPropertiesPath -Raw).Trim()
    } else {
        $null
    }

    if ($currentLocalProperties -ne $expectedLocalProperties) {
        Set-Content -Path $localPropertiesPath -Value $expectedLocalProperties -Encoding ascii
    }
}

function Clear-AndroidNodeModuleBuildDirs {
    $nodeModulesDir = Join-Path $projectRoot "node_modules"

    if (-not (Test-Path $nodeModulesDir)) {
        return
    }

    Get-ChildItem -Path $nodeModulesDir -Directory -Recurse -Filter build -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -like "*\android\build" } |
        ForEach-Object {
            attrib -R $_.FullName /S /D 2>$null | Out-Null
            Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
}

function Get-AdbPath {
    $adbCandidates = @(
        (Join-Path $env:ANDROID_HOME "platform-tools\adb.exe"),
        (Join-Path $env:ANDROID_SDK_ROOT "platform-tools\adb.exe"),
        "adb"
    ) | Where-Object { $_ }

    foreach ($candidate in $adbCandidates) {
        if ($candidate -eq "adb") {
            $adbCommand = Get-Command adb -ErrorAction SilentlyContinue
            if ($adbCommand) {
                return $adbCommand.Source
            }
            continue
        }

        if (Test-Path $candidate) {
            return $candidate
        }
    }

    return $null
}

function Remove-ConflictingInstalledApp {
    $adbPath = Get-AdbPath
    if (-not $adbPath) {
        return
    }

    $deviceLines = & $adbPath devices 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $deviceLines) {
        return
    }

    $deviceIds = $deviceLines |
        Select-Object -Skip 1 |
        Where-Object { $_ -match "\tdevice$" } |
        ForEach-Object { ($_ -split "\t")[0].Trim() } |
        Where-Object { $_ }

    foreach ($deviceId in $deviceIds) {
        Write-Host "Removing conflicting install from $deviceId if present..."
        & $adbPath -s $deviceId uninstall $applicationId 2>$null | Out-Null
    }
}

try {
    Initialize-AndroidSdk
    Clear-AndroidNodeModuleBuildDirs
    Remove-ConflictingInstalledApp
    Push-Location $projectRoot
    & npx expo run:android @ExpoArgs

    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}
