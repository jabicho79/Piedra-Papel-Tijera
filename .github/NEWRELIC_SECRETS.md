# New Relic API Key Integration with GitHub Secrets

This guide explains how to securely store and use your New Relic API Key in the CI/CD pipeline.

## Overview

The New Relic API Key is stored securely in GitHub Secrets and automatically injected into:
1. Docker image during build (via build arguments)
2. HTML at runtime (via environment variable injection)
3. CI/CD pipeline workflows

## Step-by-Step Setup

### Step 1: Get Your New Relic License Key

1. Go to https://one.newrelic.com
2. Click your profile icon → **Account settings** (bottom left)
3. Go to **API keys** section
4. Look for **Browser license key** or create a new one
5. Copy the license key (it's a long alphanumeric string)

**Important:** Keep this key secure. It identifies your New Relic account.

### Step 2: Add to GitHub Secrets

#### Via GitHub UI (Recommended)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Fill in:
   - **Name:** `NEW_RELIC_LICENSE_KEY`
   - **Value:** (paste your license key from Step 1)
5. Click **Add secret**

#### Via GitHub CLI

```bash
gh secret set NEW_RELIC_LICENSE_KEY --body "your-license-key-here" \
  --repo jabicho79/Piedra-Papel-Tijera
```

### Step 3: Verify Secret is Set

```bash
# List all secrets (shows names only)
gh secret list --repo jabicho79/Piedra-Papel-Tijera
```

You should see `NEW_RELIC_LICENSE_KEY` in the list.

## How It Works

### CI/CD Pipeline Flow

```
1. GitHub Secret (secure storage)
   ↓
2. Build Workflow reads secret
   ↓
3. Pass as build argument to Docker
   ↓
4. Dockerfile injects into HTML
   ↓
5. HTML embeds in New Relic agent config
   ↓
6. Browser sends metrics to New Relic
```

### Dockerfile Injection

The Dockerfile uses `sed` to replace placeholders with the actual license key:

```dockerfile
ARG NEW_RELIC_LICENSE_KEY=""
ARG NEW_RELIC_APP_NAME="Piedra-Papel-Tijera"

# Inject license key into HTML
RUN if [ -n "$NEW_RELIC_LICENSE_KEY" ]; then \
  sed -i "s|NEW_RELIC_LICENSE_KEY_PLACEHOLDER|$NEW_RELIC_LICENSE_KEY|g" index.html; \
  fi
```

### HTML Template

The HTML contains placeholders that get replaced:

```html
<!-- New Relic Browser Monitoring -->
<script>
  var licenseKey = 'NEW_RELIC_LICENSE_KEY_PLACEHOLDER';
  var appName = 'NEW_RELIC_APP_NAME_PLACEHOLDER';
  
  if (licenseKey && licenseKey !== 'NEW_RELIC_LICENSE_KEY_PLACEHOLDER') {
    window.NREUM.licenseKey = licenseKey;
    window.NREUM.applicationID = appName;
    // Initialize New Relic agent...
  }
</script>
```

### Build Arguments in CI/CD

The workflow passes secrets as build arguments:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    build-args: |
      NEW_RELIC_LICENSE_KEY=${{ secrets.NEW_RELIC_LICENSE_KEY || '' }}
      NEW_RELIC_APP_NAME=Piedra-Papel-Tijera
```

## Security Best Practices

### What's Protected

✅ **GitHub Secrets:**
- Encrypted at rest
- Only decrypted in workflows
- Not visible in logs
- Only accessible to authorized users

✅ **Docker Build Arguments:**
- Passed securely during build
- NOT stored in image layers
- NOT visible in Docker history (when using secrets)

✅ **Build Logs:**
- Secrets are masked in workflow logs
- Appear as `***` when printed

### What's NOT Protected

⚠️ **Once in HTML:**
- License key is visible in page source
- Visible to browser console
- Visible in network requests

**Note:** This is normal and expected. Browser license keys are meant to be public (unlike API keys for backend).

## Verification

### Check Secret is Available in Workflow

Add this to your workflow to verify (without revealing the key):

```yaml
- name: Verify New Relic secret
  run: |
    if [ -z "${{ secrets.NEW_RELIC_LICENSE_KEY }}" ]; then
      echo "⚠️  NEW_RELIC_LICENSE_KEY not set!"
      exit 1
    else
      echo "✅ NEW_RELIC_LICENSE_KEY is configured"
    fi
```

### Check Secret in Image

Build image locally and verify:

```bash
docker build \
  --build-arg NEW_RELIC_LICENSE_KEY="test-key" \
  --build-arg NEW_RELIC_APP_NAME="test" \
  -t test-image .

# Check if license key appears in image
docker run test-image grep "test-key" /usr/share/nginx/html/index.html
# Should show the key was injected
```

## Troubleshooting

### Secret Not Found in Build

**Error:** `docker: failed to solve with frontend dockerfile.v0`

**Solution:**
1. Verify secret exists in GitHub:
   ```bash
   gh secret list --repo jabicho79/Piedra-Papel-Tijera
   ```
2. Verify secret name is `NEW_RELIC_LICENSE_KEY` (exact case)
3. Re-push to trigger workflow with fresh secret access

### License Key Not in HTML

**Symptom:** New Relic not reporting data

**Solutions:**
1. Check HTML source for the key:
   ```bash
   curl https://your-app.azurewebsites.net | grep -i newrelic
   ```
2. If you see `NEW_RELIC_LICENSE_KEY_PLACEHOLDER`, the injection failed
3. Verify secret is set in GitHub Settings
4. Re-run the build workflow

### HTML Injection Failed

**Symptoms:**
- Script shows placeholder text
- No New Relic data in console

**Debug steps:**
```bash
# Check Dockerfile logic
docker build --build-arg NEW_RELIC_LICENSE_KEY="test" -t debug .

# Check file after injection
docker run debug cat /usr/share/nginx/html/index.html | grep -A 5 "licenseKey"

# Verify sed worked
docker run debug grep "test" /usr/share/nginx/html/index.html
```

## Updating the Secret

If you need to rotate your New Relic license key:

1. Get new license key from New Relic
2. Go to GitHub → Settings → Secrets
3. Click on `NEW_RELIC_LICENSE_KEY`
4. Click **Update secret**
5. Paste new key and save
6. Push a new commit to trigger rebuild:
   ```bash
   git commit --allow-empty -m "Rotate New Relic license key"
   git push origin main
   ```

## Removing the Secret

If you want to disable New Relic monitoring:

1. Go to GitHub → Settings → Secrets
2. Click on `NEW_RELIC_LICENSE_KEY`
3. Click **Delete secret**
4. The HTML will still have the placeholder, but monitoring won't work (safe fallback)

## Multi-Environment Setup

For different environments (dev/staging/prod), create separate secrets:

```
NEW_RELIC_LICENSE_KEY          # Production
NEW_RELIC_LICENSE_KEY_STAGING  # Staging
NEW_RELIC_LICENSE_KEY_DEV      # Development
```

Then update workflow:
```yaml
build-args: |
  NEW_RELIC_LICENSE_KEY=${{ 
    env.ENVIRONMENT == 'prod' 
    && secrets.NEW_RELIC_LICENSE_KEY 
    || secrets.NEW_RELIC_LICENSE_KEY_DEV 
  }}
```

## References

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [New Relic Browser License Key](https://docs.newrelic.com/docs/browser/new-relic-browser/configuration/retrieve-your-browser-monitoring-license-key)
- [Docker Build Arguments](https://docs.docker.com/engine/reference/commandline/build/#build-arg)
- [Best Practices for GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#best-practices)
