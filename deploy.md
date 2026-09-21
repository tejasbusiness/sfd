# Deploying the SFD website

## The one-line way (recommended)

From the project folder, in PowerShell or Command Prompt, run:

```
npm run deploy
```

or double-click **`deploy.bat`** in the project folder (or run `.\deploy.bat`). It does everything in this file for you, stops at the first problem, asks for confirmation before it touches production, and checks the live site at the end. It reads the SSH details from your `.env-local`, so no variables need to be set.

What it does, in order: preflight (tools, key, git state) → `validate` → `test:validation` → `build:production` (and checks that the build is clean) → checks server access and what changed (dependencies, migrations, nginx redirects) → shows a summary and asks **"Deploy to PRODUCTION now?"** → uploads → backs up the current site as `dist.bak` and swaps in the new one → installs dependencies if `composer.lock` changed → offers to apply new migrations → reminds you if the nginx redirects changed → verifies the live site (status codes and page bodies).

Options (add after `--` with npm, or directly after `deploy.bat`):

| Command | What it does |
|---|---|
| `npm run deploy` | Normal deploy, with confirmations. |
| `npm run deploy -- -Yes` | No prompts (it still never applies migrations unless you also pass `-Migrate`). |
| `npm run deploy -- -UploadEnv` | Also uploads your production `.env` (only when you changed it; it refuses to upload a non-production file). |
| `npm run deploy -- -Migrate` | Applies pending database migrations after the swap. |
| `npm run deploy -- -BuildOnly` | Validates, tests and builds locally; deploys nothing. |
| `npm run deploy -- -VerifyOnly` | Only runs the live-site checks (read-only, safe any time). |
| `npm run deploy -- -Rollback` | Restores the previous static site (`dist.bak`). |

Two things the script cannot do for you: pasting new nginx redirects into the CloudPanel vhost (it tells you when they changed and copies them to your clipboard; see Step 9) and changing the CloudPanel or server settings in Appendix B.

The script is `scripts/deploy.ps1` (with the `deploy.bat` wrapper). **The manual steps below are the same procedure written out**: use them to understand what the script does, or to deploy by hand if the script cannot run.

---

This file is self-contained: you can follow it from a fresh PowerShell window at any time. Run the steps in order. Each step says what it does, the exact commands, and what you should see.

**What gets deployed:** the static site (`dist/`), the small PHP API (`api/`), the SQL migrations (`migrations/`) and, only when it changed, the production `.env`. The server is a Contabo VPS running CloudPanel (nginx, PHP-FPM). The site is `https://synergyfirstdigital.com`.

**Where to type commands:** PowerShell on your Windows PC, in the project folder. Nothing is typed inside an SSH session: every `ssh` line connects, runs one command on the server and returns to your prompt.

**Secrets:** the production `.env` (database and SMTP passwords) lives only on your PC (gitignored) and on the server. Never commit it, paste it into chat or put it in `dist/`.

---

## Quick reference (a normal deploy, about 5 minutes)

1. Step 1: open PowerShell and set the variables.
2. Step 2: get the latest code.
3. Step 3: validate and build for production.
4. Step 4: check server access.
5. Step 5: upload.
6. Step 6: swap in (with a backup).
7. Steps 7 to 9: only when needed (dependencies, migrations, nginx redirects).
8. Step 10: verify the live site.
9. Step 11: test the forms in a browser.

If anything goes wrong, jump to **Rollback** and **Troubleshooting** at the bottom.

---

## Step 1: Open PowerShell and set the variables

Run this **first, in every new window**. The other steps use these variables. If you ever see an error like "Identity file … not accessible", or a command that looks empty, the variables are missing: run this step again.

```powershell
cd "c:\Users\victus\Downloads\03 - Business - SynergyFirst Digital\sfd-2026-v2"
$KEY  = "C:/Users/victus/.ssh/sfd"
$SRV  = "sfd-deploy@5.189.168.218"
$SITE = "/home/synergyfirstdigital-2026/htdocs/synergyfirstdigital.com"
$KEY; $SRV; $SITE
```

You should see the three values printed. If any line is blank, stop and fix it before continuing.

---

## Step 2: Get the latest code

```powershell
git status
git pull
```

- `git status` should say "nothing to commit, working tree clean". If you have uncommitted changes, decide whether they belong in this deploy (deploying builds from your working folder, not from GitHub).
- `git pull` says "Already up to date" if you work only on this PC.

---

## Step 3: Validate, test and build for production

```powershell
npm install
npm run validate
npm run test:validation
npm run build:production
```

What each does:

- `npm install`: only needed on a new PC or after `package.json` changed.
- `validate`: checks all JSON data. It must end with "Validation passed".
- `test:validation`: must show `# fail 0`.
- `build:production`: **deletes `dist/` and `deploy/` first**, then builds the site into `dist/` and regenerates `deploy/nginx-redirects.conf`. It must end with "Build succeeded (mode=production)" and list 37 pages. It fails if a required SEO field or `assets/images/og-default.jpg` is missing.

Quick sanity check that the diagnostic page is not in the production build:

```powershell
Test-Path dist\build-check
```

It must print `False`.

**Do not run `npm run rebuild` or `npm run build` after this and then deploy.** Those are development builds. Always upload the output of `build:production`.

---

## Step 3b: Only if you changed the cookie or analytics setup

Not part of a normal deploy. If you added analytics or marketing tools, the Cookie Policy and Privacy Policy must be updated and `cookieConsent.version` in `data/footer.json` bumped before building (see docs/08).

---

## Step 4: Check server access

```powershell
ssh -i $KEY $SRV "ls -ld $SITE; touch $SITE/.w && echo WRITE_OK && rm $SITE/.w; which composer rsync; php -v | head -1"
```

You should see the site folder, `WRITE_OK`, the paths of `composer` and `rsync`, and the PHP version. If you do not get `WRITE_OK`, the `sfd-deploy` user has lost write permission on the site folder: fix it in CloudPanel (or ask for it to be restored) before continuing.

---

## Step 5: Upload

This packs what the server needs (not `node_modules`, not `api/vendor`) and uploads it to a staging folder.

```powershell
tar -czf release.tgz dist api/src api/bin api/public api/composer.json api/composer.lock migrations
scp -i $KEY release.tgz "${SRV}:${SITE}/release.tgz"
ssh -i $KEY $SRV "cd $SITE && rm -rf _release && mkdir _release && tar -xzf release.tgz -C _release && rm release.tgz"
Remove-Item release.tgz
```

Check it arrived:

```powershell
ssh -i $KEY $SRV "ls $SITE/_release"
```

You should see `api`, `dist` and `migrations`.

### Step 5b: Upload `.env` (only when it changed)

Skip this unless you changed a value in your production `.env` (for example a new SMTP password or turning Google on). The `.env` on your PC is the production file (`APP_ENV=production`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`). Your `.env-local` is for local development only and is never uploaded.

```powershell
scp -i $KEY .env "${SRV}:${SITE}/.env.new"
ssh -i $KEY $SRV "cd $SITE && mv .env.new .env && chmod 640 .env && ls -l .env"
```

The result should show `-rw-r-----` with the site group (`synergyfirstdigital-2026`). That mode lets PHP read the file and keeps it away from everyone else.

---

## Step 6: Swap in the new version (with a backup)

This keeps the previous `dist/` as `dist.bak`, syncs the new files and fixes file permissions. `.env` and `api/vendor` are never touched.

```powershell
ssh -i $KEY $SRV "cd $SITE && rm -rf dist.bak && cp -a dist dist.bak && rsync -rl --delete --omit-dir-times --no-perms _release/dist/ dist/ && rsync -rl --delete --omit-dir-times --no-perms --exclude vendor _release/api/ api/ && rsync -rl --delete --omit-dir-times --no-perms _release/migrations/ migrations/; find dist api migrations -user sfd-deploy -type d -exec chmod 755 {} +; find dist api migrations -user sfd-deploy -type f -exec chmod 644 {} +; rm -rf _release"
```

The site is now updated. No output means it worked. Continue to Step 10 and check it.

---

## Step 7: Install PHP dependencies (only if `api/composer.json` or `composer.lock` changed)

```powershell
ssh -i $KEY $SRV "cd $SITE/api && composer install --no-dev --optimize-autoloader"
```

Skip this on a normal deploy.

---

## Step 8: Run database migrations (only if you added files to `migrations/`)

First look (changes nothing):

```powershell
ssh -i $KEY $SRV "cd $SITE && php api/bin/migrate.php --env=production --status"
```

If it lists pending migrations, apply them:

```powershell
ssh -i $KEY $SRV "cd $SITE && php api/bin/migrate.php --env=production"
```

Migrations are forward-only and cannot be undone: never edit a migration that has been applied, add a new numbered file instead. You can preview with `--dry-run` first. Take a database backup in CloudPanel before running a destructive migration.

---

## Step 9: Update nginx redirects (only if `data/redirects.json` changed)

`deploy/nginx-redirects.conf` is generated by every build. When you add or change a redirect:

1. Copy its contents:
   ```powershell
   Get-Content deploy\nginx-redirects.conf | Set-Clipboard
   ```
   (Nothing prints when it works.)
2. In CloudPanel open **Sites, then synergyfirstdigital.com, then Vhost**.
3. In the **third** `server { }` block (the one that says `listen 8080;`), replace everything between the markers `# ---- SFD static site rules ...` and `# ---- end of SFD rules ----` with the new contents. Keep the markers.
4. Click **Save**. CloudPanel checks the nginx syntax and shows any error.

The full vhost is in **Appendix A** if you ever need to restore it.

---

## Step 10: Verify the live site

Use `curl.exe` (with the `.exe`, otherwise PowerShell uses a different command). Expected results are in the comments.

```powershell
curl.exe -s -o NUL -w "home            %{http_code}`n" https://synergyfirstdigital.com/                                   # 200
curl.exe -s -o NUL -w "services/seo     %{http_code}`n" https://synergyfirstdigital.com/services/seo/                     # 200
curl.exe -s -o NUL -w ".env             %{http_code}`n" https://synergyfirstdigital.com/.env                              # 403
curl.exe -s -o NUL -w "composer.json    %{http_code}`n" https://synergyfirstdigital.com/api/composer.json                 # 404
curl.exe -s -o NUL -w "no such page     %{http_code}`n" https://synergyfirstdigital.com/no-such-page/                     # 404
curl.exe -s -o NUL -w "build-check      %{http_code}`n" https://synergyfirstdigital.com/build-check/                      # 404
curl.exe -s -o NUL -w "old websites url %{http_code}`n" https://synergyfirstdigital.com/services/website-design-development/   # 301
curl.exe -s -o NUL -w "old seo url      %{http_code}`n" https://synergyfirstdigital.com/services/local-seo-google-visibility/  # 301
curl.exe -s -o NUL -w "sitemap          %{http_code}`n" https://synergyfirstdigital.com/sitemap.xml                       # 200
curl.exe -s -o NUL -w "robots           %{http_code}`n" https://synergyfirstdigital.com/robots.txt                        # 200
curl.exe -s "https://synergyfirstdigital.com/api/availability?timezone=UTC"                                               # JSON starting {"ok":true
```

**Important:** a `200` alone can be misleading if a placeholder page answers every URL. For `.env` and `composer.json`, look at the body too (`curl.exe -s https://synergyfirstdigital.com/.env`): it must not show passwords or JSON. A correct setup returns an error page, not "Hello World".

---

## Step 11: Test in a browser

1. Open the site and hard-refresh with **Ctrl+Shift+R**. Static files are cached for one day, so a normal refresh can show the old version.
2. Check the pages you changed, on desktop and on your phone.
3. If forms or emails changed, submit each one. These are real submissions: they create database rows and send real emails.
   - **Contact** page, the **Websites** hero form (topic `Websites`), **Free Preview**, the **playbook** sign-up (bottom of most pages) and the **booking** modal.
   - You should see: a spinner and disabled button, then a green toast within a second or two, and a blank form.
   - Emails should reach `hello@synergyfirstdigital.com` (owner) and your own address (visitor confirmation). Check spam.
4. Bookings are saved as `pending_calendar` while Google is off; add the call to your calendar by hand from the owner email.

If an email did not arrive, retry the outbox and check its status:

```powershell
ssh -i $KEY $SRV "php $SITE/api/bin/send-outbox.php"
```

A cron job (every 10 minutes, `php /home/synergyfirstdigital-2026/htdocs/synergyfirstdigital.com/api/bin/send-outbox.php`, as the site user) does this automatically once it is set up (Appendix B).

---

## Rollback (undo the last deploy)

Step 6 kept the previous static site as `dist.bak`. To go back:

```powershell
ssh -i $KEY $SRV "cd $SITE && rm -rf dist.failed && mv dist dist.failed && mv dist.bak dist"
```

Then hard-refresh. This restores the static files only. If the problem is in the API, redeploy the previous git commit instead: `git checkout <old commit>`, repeat Steps 3, 5 and 6, then `git checkout main`.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| "Identity file … not accessible", empty values in a command | The variables from Step 1 are not set in this window. Run Step 1 again. |
| `scp`/`ssh` asks for a password or is refused | Wrong key path, or the key is not authorised for `sfd-deploy`. Check `$KEY`. |
| Step 4 does not print `WRITE_OK` | `sfd-deploy` lost write permission on the site folder. Restore it in CloudPanel. |
| Site shows "Hello World :-)" for every URL | CloudPanel's Root Directory is not `synergyfirstdigital.com/dist`, or the vhost still has the default `try_files … /index.php`. See Appendix B and A. |
| API returns HTTP 500 | PHP cannot read `.env` (wrong owner or group) or a dependency is missing. Check `ls -l $SITE/.env`; run Step 7. Look at the PHP error log in CloudPanel. |
| Forms say "Too many attempts" | The per-visitor rate limit was hit (5 stored submissions per hour per form). Wait, or test from another network. |
| CSS or JS looks old after deploy | Browser cache. Hard-refresh with Ctrl+Shift+R (static files are cached for 1 day). |
| CloudPanel rejects the vhost | Duplicate `location /` or `error_page`, or a missing brace. Compare with Appendix A. |
| Emails not arriving but the outbox says `sent` | The mailbox side: check the `hello@` mailbox exists in Hostinger, its spam folder and any bounce in the `noreply@` mailbox. |
| Emails stuck as `queued` | Run the retry command in Step 11 and set up the cron (Appendix B). |
| `build:production` fails on validation | Read the listed errors (missing SEO fields, unknown redirect targets, missing `og-default.jpg`), fix, rebuild. |

---

## Appendix A: The full nginx vhost (CloudPanel, Sites → Vhost)

Use this to restore the vhost. The `{{ … }}` placeholders belong to CloudPanel: leave them exactly as they are. Only the third server block (port 8080) contains the SFD rules.

```nginx
server {
  listen 80;
  listen [::]:80;
  listen 443 quic;
  listen 443 ssl;
  listen [::]:443 quic;
  listen [::]:443 ssl;
  http2 on;
  http3 off;
  {{ssl_certificate_key}}
  {{ssl_certificate}}
  server_name www.synergyfirstdigital.com;
  return 301 https://synergyfirstdigital.com$request_uri;
}

server {
  listen 80;
  listen [::]:80;
  listen 443 quic;
  listen 443 ssl;
  listen [::]:443 quic;
  listen [::]:443 ssl;
  http2 on;
  http3 off;
  {{ssl_certificate_key}}
  {{ssl_certificate}}
  server_name synergyfirstdigital.com www1.synergyfirstdigital.com;
  {{root}}

  {{nginx_access_log}}
  {{nginx_error_log}}

  if ($scheme != "https") {
    rewrite ^ https://$host$request_uri permanent;
  }

  location ~ /.well-known {
    auth_basic off;
    allow all;
  }

  {{settings}}

  location / {
    {{varnish_proxy_pass}}
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_hide_header X-Varnish;
    proxy_redirect off;
    proxy_max_temp_file_size 0;
    proxy_connect_timeout      720;
    proxy_send_timeout         720;
    proxy_read_timeout         720;
    proxy_buffer_size          128k;
    proxy_buffers              4 256k;
    proxy_busy_buffers_size    256k;
    proxy_temp_file_write_size 256k;
  }

  location ~* ^.+\.(css|js|jpg|jpeg|gif|png|ico|gz|svg|svgz|ttf|otf|woff|woff2|eot|mp4|ogg|ogv|webm|webp|zip|swf|map|mjs)$ {
    add_header Access-Control-Allow-Origin "*";
    add_header alt-svc 'h3=":443"; ma=86400';
    expires 1d;
    access_log off;
  }

  location ~ /\.(ht|svn|git) {
    deny all;
  }

  if (-f $request_filename) {
    break;
  }
}

server {
  listen 8080;
  listen [::]:8080;
  server_name synergyfirstdigital.com www1.synergyfirstdigital.com;
  {{root}}

  include /etc/nginx/global_settings;

  index index.html;

  # ---- SFD static site rules (from deploy/nginx-redirects.conf) ----

  # Relative Location headers so redirects keep the public scheme/host.
  absolute_redirect off;

  # Real 404 status with the branded page. Never fall back to the homepage.
  error_page 404 /404.html;
  location = /404.html { internal; }

  # /some/path/index.html -> /some/path/ (one hop).
  if ($request_uri ~ ^(.*)/index\.html(\?.*)?$) { return 301 $1/$2; }

  # Never serve dotfiles (.env and friends).
  location ~ /\.(?!well-known) { deny all; }

  # Form and booking API: every /api/ path is handled by dist/api/index.php (PHP-FPM).
  location /api/ { try_files $uri /api/index.php?$query_string; }

  # /some/path -> /some/path/ (301) is done by nginx for directories; missing
  # paths fall through to error_page 404 above.
  location / { try_files $uri $uri/ =404; }

  # Permanent redirects for replaced URLs (data/redirects.json).
  location = /resources/insights/ { return 301 /resources/blog/; }
  location = /resources/insights { return 301 /resources/blog/; }
  location = /services/website-design-development/ { return 301 /services/websites/; }
  location = /services/website-design-development { return 301 /services/websites/; }
  location = /services/local-seo-google-visibility/ { return 301 /services/seo/; }
  location = /services/local-seo-google-visibility { return 301 /services/seo/; }
  location = /services/automation-custom-solutions/ { return 301 /services/ai-automation/; }
  location = /services/automation-custom-solutions { return 301 /services/ai-automation/; }

  # ---- end of SFD rules ----

  location ~ \.php$ {
    include fastcgi_params;
    fastcgi_intercept_errors on;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    try_files $uri =404;
    fastcgi_read_timeout 3600;
    fastcgi_send_timeout 3600;
    fastcgi_param HTTPS "on";
    fastcgi_param SERVER_PORT 443;
    fastcgi_pass 127.0.0.1:{{php_fpm_port}};
    fastcgi_param PHP_VALUE "{{php_settings}}";
  }

  if (-f $request_filename) {
    break;
  }
}
```

The redirect lines inside the markers are generated: after adding a redirect, paste the new contents of `deploy/nginx-redirects.conf` between the markers (Step 9), not the block above.

---

## Appendix B: One-time server setup (already done; kept for a rebuild or a new server)

1. **CloudPanel site:** PHP site for `synergyfirstdigital.com`, PHP 8.3 or 8.4, site user `synergyfirstdigital-2026`. Site folder: `/home/synergyfirstdigital-2026/htdocs/synergyfirstdigital.com/`.
2. **Root Directory:** Sites, then Settings, set **Root Directory to `synergyfirstdigital.com/dist`** (relative to `htdocs`). Do this **before** uploading `.env`, so `.env`, `api/` and `migrations/` are never inside the public folder.
3. **Vhost:** paste the config from Appendix A.
4. **Varnish:** turn it off for this site (Sites, then Varnish Cache).
5. **Deploy user:** `sfd-deploy` with key login and write access to the site folder (it must be in the site group). Its private key is on your PC at `C:/Users/victus/.ssh/sfd`.
6. **Database:** MySQL `sfd-2026-db` with user `sfd-2026-user`; migrations `001` to `010` applied. MySQL is never exposed to the internet; local development reaches it through `npm run tunnel` (SSH tunnel on port 3307).
7. **Production `.env`:** created from `.env.example` with real values (`APP_ENV=production`, `SITE_URL=https://synergyfirstdigital.com`, `ALLOWED_ORIGINS`, `RATE_LIMIT_SALT`, `DB_*`, `SMTP_*` for Hostinger, `MAIL_LOCAL=0`, `GOOGLE_ENABLED=0` until Google Calendar is set up). Upload with Step 5b.
8. **Outbox cron:** CloudPanel, Cron Jobs, every 10 minutes (`*/10 * * * *`), command exactly:
   `php /home/synergyfirstdigital-2026/htdocs/synergyfirstdigital.com/api/bin/send-outbox.php`
   (the leading `php` is required).
9. **DNS and mail:** the domain's A record points at the server; MX, SPF and DKIM point at Hostinger mail.
10. **First deploy order:** set the Root Directory (2) and vhost (3), then run Steps 1 to 8, then verify (Step 10).

---

## Related documents

- `docs/14-database-and-api.md`: API endpoints, rate limits, environment files and migrations.
- `docs/11-build-and-configuration-reference.md`: build modes and configuration.
- `docs/10-decisions-and-todos.md`: decisions and the deployment history.
