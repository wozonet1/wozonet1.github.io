# Compatibility loader for existing PowerShell profiles.
# Command implementations live in the private application repository.

if (-not $env:WOZONET_LIFE_ROOT) {
  Write-Warning "WOZONET_LIFE_ROOT is not set; private life commands were not loaded."
  return
}

$wozonetLifeCommands = Join-Path $env:WOZONET_LIFE_ROOT "scripts\wozonet-life.ps1"
if (-not (Test-Path -LiteralPath $wozonetLifeCommands -PathType Leaf)) {
  Write-Warning "Private application commands do not exist: $wozonetLifeCommands"
  return
}

. $wozonetLifeCommands
