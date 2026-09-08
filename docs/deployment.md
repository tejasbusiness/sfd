# Deploying to the Contabo CloudPanel Server

The GitHub workflow in `.github/workflows/deploy-contabo.yml` builds the static site and publishes the generated files from `dist/client` to:

```text
/home/synergyfirstdigital-com/htdocs/synergyfirstdigital.com
```

It runs automatically on every push to `main`. It can also be started manually from GitHub Actions.

## Required GitHub Secrets

Add these repository secrets in GitHub under **Settings > Secrets and variables > Actions**:

```text
CONTABO_HOST
CONTABO_USER
CONTABO_SSH_KEY
CONTABO_PORT
```

`CONTABO_PORT` is optional if SSH uses port `22`.

`CONTABO_SSH_KEY` should be a private key that can SSH into the CloudPanel site user or another user with write access to:

```text
/home/synergyfirstdigital-com/htdocs/synergyfirstdigital.com
```

## What Gets Deployed

The workflow installs dependencies with `npm ci`, builds the static site, validates the export, uploads `dist/client`, and then syncs it into the CloudPanel document root using `rsync --delete`.

That final sync removes files from the old website when they are no longer present in the updated static build.
