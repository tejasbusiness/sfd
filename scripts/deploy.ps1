<#
.SYNOPSIS
  One-command production deploy for the SynergyFirst Digital website.
  Runs the same steps as deploy.md: checks, production build, upload, backup and swap,
  optional dependency/migration steps, and a live verification. Stops at the first failure.

.EXAMPLE
  npm run deploy                     # normal deploy, asks for confirmation before touching production
  npm run deploy -- -Yes             # no prompts (still never applies migrations unless -Migrate)
  npm run deploy -- -UploadEnv       # also upload the production .env (only when it changed)
  npm run deploy -- -Migrate         # apply pending database migrations
  npm run deploy -- -BuildOnly       # validate, test and build locally, deploy nothing
  npm run deploy -- -VerifyOnly      # only run the live-site checks (read-only)
  npm run deploy -- -Rollback        # put the previous static site (dist.bak) back

  Also: deploy.bat (double-click, or run .\deploy.bat with the same switches).

  Keep this script and deploy.md in sync. Keep this file ASCII-only (Windows PowerShell 5.1).
#>
[CmdletBinding()]
param(
  [switch]$Yes,
  [switch]$UploadEnv,
  [switch]$Migrate,
  [switch]$Rollback,
  [switch]$BuildOnly,
  [switch]$VerifyOnly
)

$ErrorActionPreference = 'Continue'   # native commands are checked through $LASTEXITCODE
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

# ---------------------------------------------------------------- configuration
$Site     = '/home/synergyfirstdigital-2026/htdocs/synergyfirstdigital.com'
$SiteUrl  = 'https://synergyfirstdigital.com'
$Key      = 'C:/Users/victus/.ssh/sfd'
$HostName = '5.189.168.218'
$User     = 'sfd-deploy'
$Port     = '22'

# SSH details are already in .env-local (used by `npm run tunnel`); use them when present.
if (Test-Path '.env-local') {
  foreach ($line in Get-Content '.env-local') {
    if ($line -match '^\s*(SSH_HOST|SSH_USER|SSH_PORT|SSH_KEY_PATH)\s*=\s*(.*?)\s*$') {
      $v = $Matches[2].Trim('"', "'")
      if ($v) {
        switch ($Matches[1]) {
          'SSH_HOST'     { $HostName = $v }
          'SSH_USER'     { $User = $v }
          'SSH_PORT'     { $Port = $v }
          'SSH_KEY_PATH' { $Key = $v }
        }
      }
    }
  }
}
$Srv = "$User@$HostName"

# ---------------------------------------------------------------- helpers
function Step([string]$n, [string]$text) { Write-Host ''; Write-Host "== $n. $text" -ForegroundColor Cyan }
function Ok([string]$text)   { Write-Host "  OK   $text" -ForegroundColor Green }
function Warn([string]$text) { Write-Host "  !!   $text" -ForegroundColor Yellow }
function Info([string]$text) { Write-Host "       $text" }
function Fail([string]$text) {
  Write-Host ''
  Write-Host "FAILED: $text" -ForegroundColor Red
  exit 1
}
function Confirm-Step([string]$question) {
  if ($Yes) { return $true }
  $answer = Read-Host "$question [y/N]"
  return ($answer -match '^(y|yes)$')
}
function Invoke-Remote([string]$command) {
  $out = & ssh -i $Key -p $Port -o BatchMode=yes -o ConnectTimeout=15 $Srv $command
  $script:SshExit = $LASTEXITCODE
  return $out
}
function Run-Npm([string]$script) {
  & npm run $script
  if ($LASTEXITCODE -ne 0) { Fail "npm run $script failed (see the output above)." }
}
function Http-Code([string]$path) {
  return (& curl.exe -s -o NUL -w '%{http_code}' --max-time 30 "$SiteUrl$path")
}

# ---------------------------------------------------------------- live verification
function Verify-Live {
  Step 'V' 'Verifying the live site'
  $failures = 0
  $checks = @(
    @{ Name = 'Homepage';                     Path = '/';                                            Expect = '200' },
    @{ Name = 'Services / SEO page';          Path = '/services/seo/';                               Expect = '200' },
    @{ Name = 'Free Preview page';            Path = '/free-preview/';                               Expect = '200' },
    @{ Name = '.env is not public';           Path = '/.env';                                        Expect = '403' },
    @{ Name = 'API source is not public';     Path = '/api/composer.json';                           Expect = '404' },
    @{ Name = 'Unknown URL is a real 404';    Path = '/no-such-page/';                               Expect = '404' },
    @{ Name = 'Diagnostic page is absent';    Path = '/build-check/';                                Expect = '404' },
    @{ Name = 'Old Websites URL redirects';   Path = '/services/website-design-development/';        Expect = '301' },
    @{ Name = 'Old SEO URL redirects';        Path = '/services/local-seo-google-visibility/';       Expect = '301' },
    @{ Name = 'Old AI URL redirects';         Path = '/services/automation-custom-solutions/';       Expect = '301' },
    @{ Name = 'Old Insights URL redirects';   Path = '/resources/insights/';                         Expect = '301' },
    @{ Name = 'Sitemap';                      Path = '/sitemap.xml';                                 Expect = '200' },
    @{ Name = 'robots.txt';                   Path = '/robots.txt';                                  Expect = '200' }
  )
  foreach ($c in $checks) {
    $code = Http-Code $c.Path
    if ($code -eq $c.Expect) { Ok ("{0,-30} {1}" -f $c.Name, $code) }
    else { Write-Host ("  FAIL {0,-30} got {1}, expected {2}  ({3})" -f $c.Name, $code, $c.Expect, $c.Path) -ForegroundColor Red; $failures++ }
  }

  # A 200 alone can be misleading (a placeholder page answering every URL), so read the bodies too.
  $homeBody = (& curl.exe -s --max-time 30 "$SiteUrl/") -join "`n"
  if ($homeBody -match 'SynergyFirst') { Ok 'Homepage body is the real site' }
  else { Write-Host '  FAIL Homepage body does not look like the SFD site' -ForegroundColor Red; $failures++ }

  $envBody = (& curl.exe -s --max-time 30 "$SiteUrl/.env") -join "`n"
  if ($envBody -match 'DB_PASSWORD|SMTP_PASSWORD|APP_ENV=') { Write-Host '  FAIL /.env is EXPOSING secrets - fix the Root Directory/vhost NOW' -ForegroundColor Red; $failures++ }
  else { Ok '/.env body shows no secrets' }

  $api = (& curl.exe -s --max-time 30 "$SiteUrl/api/availability?timezone=UTC") -join ''
  if ($api -match '^\{"ok":true') { Ok 'API answers with JSON (PHP, .env and database work)' }
  else { Write-Host ('  FAIL API availability did not return {"ok":true...}: ' + $api.Substring(0, [Math]::Min(120, $api.Length))) -ForegroundColor Red; $failures++ }

  if ($failures -gt 0) {
    Write-Host ''
    Write-Host "$failures check(s) FAILED. To go back to the previous version run:  .\deploy.bat -Rollback" -ForegroundColor Red
    return $false
  }
  Write-Host ''
  Write-Host 'All live checks passed.' -ForegroundColor Green
  return $true
}

# ---------------------------------------------------------------- special modes
if ($VerifyOnly) {
  $good = Verify-Live
  if ($good) { exit 0 } else { exit 1 }
}

Step '0' 'Preflight'
foreach ($tool in 'node', 'npm', 'ssh', 'scp', 'tar', 'git') {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { Fail "'$tool' was not found on this PC." }
}
if (-not (Get-Command 'curl.exe' -ErrorAction SilentlyContinue)) { Fail "'curl.exe' was not found (Windows 10 or later includes it)." }
if (-not (Test-Path $Key)) { Fail "SSH key not found at $Key (set SSH_KEY_PATH in .env-local)." }
Ok "Tools found; server $Srv; site folder $Site"

if ($Rollback) {
  Step 'R' 'Rollback to the previous static site (dist.bak)'
  if (-not (Confirm-Step 'Replace the live site with the previous version?')) { Fail 'Cancelled.' }
  $out = Invoke-Remote "cd $Site && test -d dist.bak && rm -rf dist.failed && mv dist dist.failed && mv dist.bak dist && echo ROLLED_BACK"
  if (($out -join ' ') -notmatch 'ROLLED_BACK') { Fail 'Rollback did not run (is there a dist.bak on the server?).' }
  Ok 'Previous static site restored (the rolled-back version is kept as dist.failed).'
  $good = Verify-Live
  if ($good) { exit 0 } else { exit 1 }
}

# git state (deploys build from this working folder, not from GitHub)
$dirty = (& git status --porcelain) -join "`n"
if ($dirty) {
  Warn 'You have uncommitted changes. A deploy builds from this folder, not from GitHub:'
  $dirty.Split("`n") | Select-Object -First 12 | ForEach-Object { Info $_ }
  if (-not (Confirm-Step 'Deploy with these uncommitted changes?')) { Fail 'Cancelled. Commit or stash first.' }
}
$branch = (& git rev-parse --abbrev-ref HEAD)
if ($branch -ne 'main') { Warn "You are on branch '$branch', not 'main'."; if (-not (Confirm-Step 'Deploy this branch?')) { Fail 'Cancelled.' } }
$ahead = (& git rev-list --count '@{u}..HEAD' 2>$null)
if ($ahead -and [int]$ahead -gt 0) { Warn "$ahead local commit(s) are not pushed to GitHub yet (push after deploying)." }
$behind = (& git rev-list --count 'HEAD..@{u}' 2>$null)
if ($behind -and [int]$behind -gt 0) { Warn "GitHub has $behind newer commit(s) than this folder. Run 'git pull' first unless that is intended."; if (-not (Confirm-Step 'Continue anyway?')) { Fail 'Cancelled.' } }

# ---------------------------------------------------------------- build
Step '1' 'Validate, test and build for production'
Run-Npm 'validate'
Run-Npm 'test:validation'
Run-Npm 'build:production'
foreach ($required in 'dist\index.html', 'dist\404.html', 'dist\sitemap.xml', 'dist\robots.txt', 'dist\api\index.php', 'deploy\nginx-redirects.conf') {
  if (-not (Test-Path $required)) { Fail "Expected build output is missing: $required" }
}
if (Test-Path 'dist\build-check') { Fail 'dist\build-check exists: this is not a clean production build.' }
$pageCount = (Get-ChildItem dist -Recurse -Filter *.html | Measure-Object).Count
Ok "Production build ready ($pageCount pages)"

if ($BuildOnly) { Write-Host ''; Write-Host 'Build only: nothing was deployed.' -ForegroundColor Green; exit 0 }

# ---------------------------------------------------------------- server checks
Step '2' 'Checking server access'
$out = Invoke-Remote "touch $Site/.w && echo WRITE_OK && rm $Site/.w; which composer rsync"
$text = $out -join ' '
if ($text -notmatch 'WRITE_OK') { Fail "Cannot write to $Site as $User. Restore write permission in CloudPanel." }
if ($text -notmatch 'composer') { Fail 'composer is not installed on the server.' }
if ($text -notmatch 'rsync')    { Fail 'rsync is not installed on the server.' }
Ok 'Server reachable, site folder writable, composer and rsync present'

# what changed compared with the server (checked before the swap)
$localLock = (Get-FileHash 'api\composer.lock' -Algorithm SHA256).Hash.ToLower()
$remoteLock = ((Invoke-Remote "sha256sum $Site/api/composer.lock 2>/dev/null | cut -d' ' -f1") -join '').Trim()
$composerChanged = ($localLock -ne $remoteLock)

$localMigrations = @(Get-ChildItem migrations -Filter *.sql | ForEach-Object { $_.Name })
$remoteMigrations = @((Invoke-Remote "ls $Site/migrations 2>/dev/null") | ForEach-Object { "$_".Trim() })
$newMigrations = @($localMigrations | Where-Object { $remoteMigrations -notcontains $_ })

$localNginx = (Get-FileHash 'deploy\nginx-redirects.conf' -Algorithm SHA256).Hash.ToLower()
$remoteNginx = ((Invoke-Remote "cat $Site/.nginx-redirects.sha256 2>/dev/null") -join '').Trim()

if ($UploadEnv) {
  if (-not (Test-Path '.env')) { Fail '.env not found in the project folder.' }
  if (-not (Select-String -Path '.env' -Pattern '^APP_ENV=production' -Quiet)) { Fail '.env is not the production file (APP_ENV is not production). Refusing to upload it.' }
}

Step '3' 'Summary'
Info "Server:              $Srv"
Info "New dependencies:    $(if ($composerChanged) { 'yes (composer install will run)' } else { 'no' })"
Info "New migrations:      $(if ($newMigrations.Count -gt 0) { $newMigrations -join ', ' } else { 'none' })"
Info "Upload .env:         $(if ($UploadEnv) { 'yes' } else { 'no' })"
Info "nginx redirects:     $(if (-not $remoteNginx) { 'no baseline yet' } elseif ($remoteNginx -ne $localNginx) { 'CHANGED (vhost needs a manual update)' } else { 'unchanged' })"
if (-not (Confirm-Step 'Deploy to PRODUCTION now?')) { Fail 'Cancelled. Nothing was changed on the server.' }

# ---------------------------------------------------------------- upload
Step '4' 'Uploading'
$tgz = Join-Path $env:TEMP 'sfd-release.tgz'
if (Test-Path $tgz) { Remove-Item $tgz -Force }
& tar -czf $tgz dist api/src api/bin api/public api/composer.json api/composer.lock migrations
if ($LASTEXITCODE -ne 0) { Fail 'Could not create the upload package (tar).' }
# scp can mistake a Windows drive path (C:\...) for a remote host, so upload by file name from its folder.
Push-Location (Split-Path $tgz)
& scp -i $Key -P $Port -o BatchMode=yes (Split-Path $tgz -Leaf) "${Srv}:${Site}/release.tgz"
$scpExit = $LASTEXITCODE
Pop-Location
Remove-Item $tgz -Force -ErrorAction SilentlyContinue
if ($scpExit -ne 0) { Fail 'Upload failed (scp).' }
if ($UploadEnv) {
  & scp -i $Key -P $Port -o BatchMode=yes '.env' "${Srv}:${Site}/.env.new"
  if ($LASTEXITCODE -ne 0) { Fail 'Uploading .env failed.' }
}
$out = Invoke-Remote "cd $Site && rm -rf _release && mkdir _release && tar -xzf release.tgz -C _release && rm release.tgz && test -f _release/dist/index.html && test -f _release/api/src/App.php && echo PACKAGE_OK"
if (($out -join ' ') -notmatch 'PACKAGE_OK') { Fail 'The uploaded package is incomplete. Nothing was changed on the live site.' }
Ok 'Package uploaded to the staging folder'

# ---------------------------------------------------------------- swap
Step '5' 'Swapping in the new version (previous site kept as dist.bak)'
$swap = "cd $Site && mkdir -p dist api migrations && rm -rf dist.bak && cp -a dist dist.bak && " +
  "rsync -rl --delete --omit-dir-times --no-perms _release/dist/ dist/ && " +
  "rsync -rl --delete --omit-dir-times --no-perms --exclude vendor _release/api/ api/ && " +
  "rsync -rl --delete --omit-dir-times --no-perms _release/migrations/ migrations/ && echo SWAP_OK; " +
  "find dist api migrations -user $User -type d -exec chmod 755 {} +; " +
  "find dist api migrations -user $User -type f -exec chmod 644 {} +; " +
  "rm -rf _release"
$out = Invoke-Remote $swap
if (($out -join ' ') -notmatch 'SWAP_OK') { Fail 'Copying the new files failed part way. Run .\deploy.bat -Rollback to restore the previous static site.' }
if ($UploadEnv) {
  $out = Invoke-Remote "cd $Site && mv .env.new .env && chmod 640 .env && echo ENV_OK"
  if (($out -join ' ') -notmatch 'ENV_OK') { Fail 'Installing the new .env failed.' }
  Ok '.env updated (mode 640)'
}
Ok 'New version is live'

if ($composerChanged) {
  Step '5b' 'Installing PHP dependencies (composer.lock changed)'
  $out = Invoke-Remote "cd $Site/api && composer install --no-dev --optimize-autoloader 2>&1 | tail -5"
  $out | ForEach-Object { Info $_ }
  if ($script:SshExit -ne 0) { Fail 'composer install failed. The API may not work until it is fixed.' }
  Ok 'Dependencies installed'
}

if ($newMigrations.Count -gt 0) {
  Step '5c' 'Database migrations'
  $out = Invoke-Remote "cd $Site && php api/bin/migrate.php --env=production --status"
  $out | ForEach-Object { Info $_ }
  $apply = $false
  if ($Migrate) { $apply = $true }
  elseif (-not $Yes) { $apply = Confirm-Step "Apply $($newMigrations.Count) new migration(s) now? (cannot be undone; forward-only)" }
  if ($apply) {
    $out = Invoke-Remote "cd $Site && php api/bin/migrate.php --env=production"
    $out | ForEach-Object { Info $_ }
    if ($script:SshExit -ne 0) { Fail 'Migration failed. Fix it and run: npm run deploy -- -Migrate' }
    Ok 'Migrations applied'
  } else {
    Warn 'New migrations were NOT applied. Run: npm run deploy -- -Migrate   (or see deploy.md step 8)'
  }
}

# nginx redirects: only the owner can paste them into the CloudPanel vhost
if (-not $remoteNginx) {
  Invoke-Remote "echo $localNginx > $Site/.nginx-redirects.sha256" | Out-Null
  Warn 'Recorded the current nginx redirects as the baseline (assumed to match the CloudPanel vhost).'
} elseif ($remoteNginx -ne $localNginx) {
  Write-Host ''
  Warn 'The nginx redirects changed (data/redirects.json). The vhost in CloudPanel must be updated by hand:'
  Info 'Sites > synergyfirstdigital.com > Vhost > third server block (listen 8080),'
  Info 'replace the text between the "SFD static site rules" and "end of SFD rules" markers'
  Info 'with deploy\nginx-redirects.conf (copied to your clipboard now), then Save. See deploy.md step 9.'
  Get-Content 'deploy\nginx-redirects.conf' -Raw | Set-Clipboard
  if (Confirm-Step 'Have you updated the vhost in CloudPanel?') {
    Invoke-Remote "echo $localNginx > $Site/.nginx-redirects.sha256" | Out-Null
    Ok 'Recorded. You will not be reminded again until the redirects change.'
  } else {
    Warn 'Not recorded: you will be reminded on the next deploy.'
  }
}

# ---------------------------------------------------------------- verify
Start-Sleep -Seconds 3
$good = Verify-Live
Write-Host ''
if ($good) {
  Write-Host 'Deploy finished.' -ForegroundColor Green
  Info 'Next: hard-refresh the browser with Ctrl+Shift+R (static files are cached for 1 day),'
  Info 'then submit each form once (deploy.md step 11). Push to GitHub if you have unpushed commits.'
  exit 0
}
exit 1
