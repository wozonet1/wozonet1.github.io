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

function global:moment-edit {
  [CmdletBinding()]
  param()

  if (-not $env:WOZONET_SITE) {
    throw "WOZONET_SITE is not set. Check ~/.config/wozonet-site/env.ps1."
  }

  $momentRoot = Join-Path $env:WOZONET_SITE "src\content\moments"
  if (-not (Test-Path -LiteralPath $momentRoot -PathType Container)) {
    throw "Moment directory does not exist: $momentRoot"
  }

  $latestMoment = Get-ChildItem -LiteralPath $momentRoot -Recurse -File -Filter "*.md" |
    Sort-Object -Property FullName -Descending |
    Select-Object -First 1

  if (-not $latestMoment) {
    Write-Host "No moments exist yet."
    return
  }

  $codeCommand = Get-Command code -ErrorAction SilentlyContinue
  if (-not $codeCommand) {
    throw "VS Code command 'code' is not available in PATH."
  }

  $chinaTimeZone = [System.TimeZoneInfo]::FindSystemTimeZoneById("China Standard Time")
  $now = [System.TimeZoneInfo]::ConvertTimeFromUtc(
    [DateTime]::UtcNow,
    $chinaTimeZone
  )
  $todayDirectory = Join-Path $momentRoot $now.ToString("yyyy")
  $todayDirectory = Join-Path $todayDirectory $now.ToString("MM")
  $todayDirectory = Join-Path $todayDirectory $now.ToString("dd")

  if ($latestMoment.DirectoryName -ne $todayDirectory) {
    Write-Warning "The latest moment is not from today. moment-sync only publishes today's moment changes."
  }

  Write-Host "Opening $($latestMoment.FullName)"
  & $codeCommand.Source "--reuse-window" $latestMoment.FullName
  if ($LASTEXITCODE -ne 0) {
    throw "VS Code could not open the latest moment."
  }
}

function global:note-new {
  [CmdletBinding()]
  param()

  if (-not $env:WOZONET_SITE) {
    throw "WOZONET_SITE is not set. Check ~/.config/wozonet-site/env.ps1."
  }

  if (-not (Test-Path -LiteralPath $env:WOZONET_SITE -PathType Container)) {
    throw "Site repository does not exist: $env:WOZONET_SITE"
  }

  $codeCommand = Get-Command code -ErrorAction SilentlyContinue
  if (-not $codeCommand) {
    throw "VS Code command 'code' is not available in PATH."
  }

  Push-Location -LiteralPath $env:WOZONET_SITE
  try {
    $output = @(& node ".\scripts\new-daily-note.mjs")
    if ($LASTEXITCODE -ne 0 -or $output.Count -eq 0) {
      throw "Could not create a new daily note."
    }

    $createdFile = $output[-1]
    if (-not (Test-Path -LiteralPath $createdFile -PathType Leaf)) {
      throw "The note script returned an invalid path: $createdFile"
    }

    Write-Host "Opening $createdFile"
    & $codeCommand.Source "--reuse-window" $createdFile
    if ($LASTEXITCODE -ne 0) {
      throw "VS Code could not open the new daily note."
    }
  }
  finally {
    Pop-Location
  }
}

function Publish-WozonetDailyFiles {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [string] $RelativeRoot,

    [Parameter(Mandatory)]
    [string] $Kind,

    [Parameter(Mandatory)]
    [string] $RequiredUpstreamPath
  )

  if (-not $env:WOZONET_SITE) {
    throw "WOZONET_SITE is not set. Check ~/.config/wozonet-site/env.ps1."
  }

  if (-not (Test-Path -LiteralPath $env:WOZONET_SITE -PathType Container)) {
    throw "Site repository does not exist: $env:WOZONET_SITE"
  }

  $chinaTimeZone = [System.TimeZoneInfo]::FindSystemTimeZoneById("China Standard Time")
  $now = [System.TimeZoneInfo]::ConvertTimeFromUtc(
    [DateTime]::UtcNow,
    $chinaTimeZone
  )
  $datePath = $now.ToString("yyyy/MM/dd")
  $relativeDirectory = "$RelativeRoot/$datePath"

  Push-Location -LiteralPath $env:WOZONET_SITE
  try {
    & git cat-file -e "@{upstream}:$RequiredUpstreamPath" 2>$null
    if ($LASTEXITCODE -ne 0) {
      throw "The remote site does not support $Kind entries yet. Commit and push the feature code first."
    }

    $trackedFiles = @(& git ls-files -- $relativeDirectory)
    if (
      -not (Test-Path -LiteralPath (Join-Path $env:WOZONET_SITE $relativeDirectory)) -and
      $trackedFiles.Count -eq 0
    ) {
      Write-Host "No $Kind entries exist for today."
      return
    }

    $changes = @(& git status --porcelain -- $relativeDirectory)
    if ($LASTEXITCODE -ne 0) {
      throw "Git could not inspect today's $Kind entries."
    }

    if ($changes.Count -eq 0) {
      Write-Host "No $Kind changes for today."
      return
    }

    & git add -A -- $relativeDirectory
    if ($LASTEXITCODE -ne 0) {
      throw "Git could not stage today's $Kind changes."
    }

    $commitMessage = "${Kind}: update $($now.ToString('yyyy-MM-dd'))"
    & git commit --only -m $commitMessage -- $relativeDirectory
    if ($LASTEXITCODE -ne 0) {
      throw "Git could not commit today's $Kind changes."
    }

    & git push
    if ($LASTEXITCODE -ne 0) {
      throw "Push failed. The $Kind update is committed locally and can be pushed later."
    }

    Write-Host "Today's $Kind changes are published."
  }
  finally {
    Pop-Location
  }
}

function global:moment-sync {
  [CmdletBinding()]
  param()

  Publish-WozonetDailyFiles `
    -RelativeRoot "src/content/moments" `
    -Kind "moment" `
    -RequiredUpstreamPath "src/utils/moments.ts"
}

function global:note-sync {
  [CmdletBinding()]
  param()

  Publish-WozonetDailyFiles `
    -RelativeRoot "src/content/daily-notes" `
    -Kind "note" `
    -RequiredUpstreamPath "src/components/DailyNoteEntry.astro"
}
