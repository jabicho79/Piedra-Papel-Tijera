# GitHub Actions CI/CD Pipeline Setup Guide

This document explains how to configure and use the GitHub Actions CI/CD pipeline for the Piedra-Papel-Tijera application.

## Overview

The pipeline consists of three workflows:

1. **Quality Checks** (`quality-checks.yml`) - Validates code and builds
2. **Build and Push** (`build-and-push.yml`) - Builds Docker image and pushes to Docker Hub
3. **Deploy to Azure** (`deploy-to-azure.yml`) - Deploys to Azure App Service

## Prerequisites

Before setting up the pipeline, you'll need:

- GitHub repository access with Admin privileges
- Docker Hub account
- Azure subscription with App Service
- Azure credentials for authentication

## Step 1: Configure GitHub Secrets

GitHub Secrets are encrypted environment variables used by workflows. Add the following secrets to your repository:

### GitHub UI Method

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Required Secrets

#### For Docker Hub Push

```
DOCKER_USERNAME = <your-docker-hub-username>
DOCKER_PASSWORD = <your-docker-hub-access-token>
```

**How to get Docker Hub credentials:**
- Username: Your Docker Hub account username
- Password/Token: Go to Docker Hub → Account Settings → Security → Access Tokens → Create new token

#### For Azure Deployment

```
AZURE_CREDENTIALS = <azure-service-principal-json>
AZURE_APP_SERVICE_NAME = <your-app-service-name>
AZURE_PUBLISH_PROFILE = <publish-profile-xml>
```

**How to get Azure credentials:**

1. **Azure Service Principal (for login):**
   ```bash
   az ad sp create-for-rbac \
     --name "github-actions-piedra-papel" \
     --role contributor \
     --scopes /subscriptions/<SUBSCRIPTION_ID>
   ```
   Copy the entire JSON output and paste it as `AZURE_CREDENTIALS`

2. **App Service Name:**
   - Your Azure App Service name (e.g., `piedras-dec6h7ggbufbe9an`)

3. **Publish Profile:**
   ```bash
   az webapp deployment list-publishing-profiles \
     --resource-group <resource-group> \
     --name <app-service-name> \
     --query [0].publishUrl
   ```
   Or download directly from Azure Portal:
   - Go to App Service → Overview → Download publish profile
   - Copy the XML content and paste as `AZURE_PUBLISH_PROFILE`

## Step 2: Create GitHub Environments (Optional)

For better organization, create environments for staging and production:

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Create two environments: `staging` and `production`
4. (Optional) Add approval requirements for `production`

## Step 3: Understand the Workflows

### Quality Checks Workflow

**File:** `.github/workflows/quality-checks.yml`

**Triggers:** On every push and pull request to main

**What it does:**
- Validates HTML, CSS, and JavaScript syntax
- Validates Dockerfile
- Checks project file structure
- Builds Docker image to verify Dockerfile
- Verifies image contents

**Status badge:** You can add to README:
```markdown
![CI/CD Pipeline](https://github.com/your-username/Piedra-Papel-Tijera/actions/workflows/quality-checks.yml/badge.svg)
```

### Build and Push Workflow

**File:** `.github/workflows/build-and-push.yml`

**Triggers:** 
- On push to main (with changes to src/ or Dockerfile)
- Pulls (validation only, no push)

**What it does:**
- Builds multi-platform Docker image (linux/amd64, linux/arm64)
- Pushes to Docker Hub (only on main branch)
- Creates multiple tags: `latest`, branch name, commit SHA
- Updates Docker Hub repository description
- Uses build cache for faster builds

### Deploy to Azure Workflow

**File:** `.github/workflows/deploy-to-azure.yml`

**Triggers:**
- Manual dispatch (workflow_dispatch) with environment selection
- Automatic on push to main (optional - currently disabled by path)

**What it does:**
- Logs in to Azure
- Deploys latest Docker image to App Service
- Runs health checks to verify deployment
- Provides deployment notifications

## Step 4: First-Time Setup

1. **Commit and push the workflows:**
   ```bash
   git add .github/
   git commit -m "Add GitHub Actions CI/CD pipeline"
   git push origin main
   ```

2. **Monitor the workflows:**
   - Go to your repository
   - Click **Actions** tab
   - Watch the workflows run
   - Check logs for any errors

3. **Verify Docker Hub push:**
   - After first successful build, check Docker Hub
   - Your image should appear with tags: `latest`, `main-<commit-sha>`

## Usage

### Automatic Workflows

**Quality Checks** runs automatically on every push and PR. No action needed.

**Build and Push** runs automatically when you push to main with changes to src/ or Dockerfile.

### Manual Deployment

To manually deploy to Azure:

1. Go to **Actions** tab
2. Click **Deploy to Azure App Service**
3. Click **Run workflow**
4. Select environment: `staging` or `production`
5. Click **Run workflow**
6. Monitor the deployment in the logs

### Manual Trigger via CLI

```bash
# Trigger deployment workflow
gh workflow run deploy-to-azure.yml \
  -f environment=production \
  -r main
```

## Workflow Status Badges

Add these to your README.md to show workflow status:

```markdown
## CI/CD Status

![Quality Checks](https://github.com/jabicho79/Piedra-Papel-Tijera/actions/workflows/quality-checks.yml/badge.svg)
![Build and Push](https://github.com/jabicho79/Piedra-Papel-Tijera/actions/workflows/build-and-push.yml/badge.svg)
![Deploy to Azure](https://github.com/jabicho79/Piedra-Papel-Tijera/actions/workflows/deploy-to-azure.yml/badge.svg)
```

## Troubleshooting

### Docker Push Fails

**Error:** "unauthorized: authentication required"

**Solution:** 
1. Check `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets
2. Verify the token is still valid in Docker Hub
3. Ensure the username matches exactly (case-sensitive)

### Azure Deployment Fails

**Error:** "InvalidInputError: The provided credentials are invalid"

**Solution:**
1. Regenerate Azure Service Principal:
   ```bash
   az ad sp delete --id <app-id>
   az ad sp create-for-rbac --name "github-actions-piedra-papel"
   ```
2. Update `AZURE_CREDENTIALS` secret

**Error:** "Failed to authenticate"

**Solution:**
- Verify `AZURE_PUBLISH_PROFILE` is up to date
- Download fresh profile from Azure Portal

### Workflow Not Triggering

**Problem:** Workflows don't run on push

**Solutions:**
1. Check if workflows are enabled: Settings → Actions → General
2. Verify branch protection rules aren't blocking
3. Check if paths filter is preventing trigger
4. Ensure file changes match the `paths` filter

### Build Cache Not Working

**Solution:** GitHub Actions cache has a size limit. To reset:
1. Go to **Settings** → **Actions** → **General** → **Artifacts and logs**
2. Delete cached entries if needed

## Security Best Practices

1. **Rotate Secrets Regularly**
   ```bash
   # Regenerate Docker Hub token
   # Regenerate Azure Service Principal
   ```

2. **Use Separate Credentials for Each Environment**
   - Don't share secrets between staging and production

3. **Enable Branch Protection Rules**
   - Require status checks to pass before merging
   - Require approval for production deployments

4. **Audit Workflow Permissions**
   - Review who can trigger manual deployments
   - Use environments to control access

5. **Monitor Workflow Runs**
   - Review logs for suspicious activity
   - Alert on failures

## Advanced Configuration

### Conditional Deployments

To deploy only on successful builds:

Add to `deploy-to-azure.yml`:
```yaml
needs: build
if: success()
```

### Custom Notifications

Add Slack/Email notifications on deployment:

```yaml
- name: Notify Slack
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

### Run Tests

To add tests:

```yaml
- name: Run Tests
  run: npm test
```

### Deploy Only on Releases

Modify trigger:
```yaml
on:
  release:
    types: [published]
```

## Support

For more information on GitHub Actions:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build and Push Action](https://github.com/docker/build-push-action)
- [Azure WebApps Deploy Action](https://github.com/azure/webapps-deploy)

For project-specific issues, open an issue on the repository.
