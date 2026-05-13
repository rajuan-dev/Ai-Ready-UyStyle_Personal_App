param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ExpoArgs
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$driveRoot = Split-Path -Qualifier $projectRoot
$junctionCandidates = @("uapp", "uystyle-app", "expo-app-short")
$shortProjectRoot = $null
$createdJunction = $false

foreach ($name in $junctionCandidates) {
    $candidatePath = Join-Path $driveRoot $name

    if (Test-Path $candidatePath) {
        $item = Get-Item $candidatePath -Force
        $target = $item.Target

        if ($item.LinkType -eq "Junction" -and $target -and $target[0] -ieq $projectRoot) {
            $shortProjectRoot = $candidatePath
            break
        }

        continue
    }

    cmd /c "mklink /J `"$candidatePath`" `"$projectRoot`""

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create a temporary junction for $projectRoot"
    }

    $shortProjectRoot = $candidatePath
    $createdJunction = $true
    break
}

if (-not $shortProjectRoot) {
    throw "No short-path junction location was available. Checked: $($junctionCandidates -join ', ')"
}

try {
    Push-Location $shortProjectRoot
    & npx expo run:android @ExpoArgs

    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location

    if ($createdJunction) {
        cmd /c "rmdir `"$shortProjectRoot`"" | Out-Null
    }
}
