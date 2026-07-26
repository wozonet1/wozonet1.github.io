function global:moment {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory, Position = 0, ValueFromRemainingArguments)]
    [string[]] $Text
  )

  if (-not $env:WOZONET_SITE) {
    throw "WOZONET_SITE is not set. Check ~/.config/wozonet-site/env.ps1."
  }

  if (-not (Test-Path -LiteralPath $env:WOZONET_SITE -PathType Container)) {
    throw "Site repository does not exist: $env:WOZONET_SITE"
  }

  $message = ($Text -join " ").Trim()
  if (-not $message) {
    throw 'Pass some text, for example: moment "A short update"'
  }

  Push-Location -LiteralPath $env:WOZONET_SITE
  try {
    & node ".\scripts\new-moment.mjs" "--publish" $message
    if ($LASTEXITCODE -ne 0) {
      throw "Publishing failed. A file or local commit may already exist; check the Git output above."
    }
  }
  finally {
    Pop-Location
  }
}
