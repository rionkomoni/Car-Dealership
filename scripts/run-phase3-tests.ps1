param(
  [switch]$SkipNewman,
  [switch]$SkipE2E,
  [switch]$SkipPerformance1k
)

$ErrorActionPreference = "Stop"

$root = "C:\xampp\htdocs\Car-Dealership"
Set-Location $root

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logDir = Join-Path $root "tests\reports"
if (!(Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}
$logFile = Join-Path $logDir "phase3-qa-$timestamp.log"

function Run-Step {
  param(
    [string]$Title,
    [string]$Command
  )

  Write-Host ""
  Write-Host "===================================================="
  Write-Host "STEP: $Title"
  Write-Host "CMD : $Command"
  Write-Host "===================================================="
  Write-Host ""

  Add-Content -Path $logFile -Value ""
  Add-Content -Path $logFile -Value "===================================================="
  Add-Content -Path $logFile -Value "STEP: $Title"
  Add-Content -Path $logFile -Value "CMD : $Command"
  Add-Content -Path $logFile -Value "===================================================="

  Invoke-Expression "$Command 2>&1" | Tee-Object -FilePath $logFile -Append
  if ($LASTEXITCODE -ne 0) {
    throw "Step failed: $Title"
  }
}

Write-Host "Phase III test runner started..."
Write-Host "Log file: $logFile"

Run-Step -Title "Coverage (Jest)" -Command "npm run test:coverage"

if (-not $SkipNewman) {
  Run-Step -Title "Integration (Newman)" -Command "npm run test:integration:newman"
}

if (-not $SkipE2E) {
  Run-Step -Title "E2E (Cypress)" -Command "npm run test:e2e:run"
}

Run-Step -Title "Performance baseline" -Command "npm run test:performance"

if (-not $SkipPerformance1k) {
  Run-Step -Title "Performance 1k users preset" -Command "npm run test:performance:1k"
}

Write-Host ""
Write-Host "All selected Phase III tests passed."
Write-Host "Saved log: $logFile"

