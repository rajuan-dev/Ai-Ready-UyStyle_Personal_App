param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ExpoArgs
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $projectRoot "android"
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

try {
    Initialize-AndroidSdk
    Push-Location $projectRoot
    & npx expo run:android @ExpoArgs

    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}
