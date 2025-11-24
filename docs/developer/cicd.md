# CI/CD Setup

This guide explains how to set up continuous integration and continuous deployment for EpiTrello.

## Overview

EpiTrello uses GitHub Actions for automated testing, building, and deployment. The workflows are located in `.github/workflows/`.

## Available Workflows

### 1. CI (Continuous Integration)

**File:** `.github/workflows/ci.yml`
**Triggers:** Push or PR to `main` or `develop`

**Steps:**
1. Sets up Node.js and PostgreSQL
2. Installs dependencies
3. Runs linting
4. Initializes database
5. Builds the application
6. Tests Docker configuration

**Purpose:** Ensures code quality and catches issues early.

### 2. Deploy (Production)

**File:** `.github/workflows/deploy.yml`
**Triggers:** Push to `main` branch

**Steps:**
1. Builds the application
2. Deploys to Vercel production
3. Creates deployment summary

**Purpose:** Automatically deploy to production after merging to main.

### 3. Docker Publish

**File:** `.github/workflows/docker-publish.yml`
**Triggers:** Push to `main`, version tags

**Steps:**
1. Builds Docker image
2. Pushes to GitHub Container Registry
3. Tags with version/branch/SHA

**Purpose:** Publish Docker images for easy deployment.

### 4. Security Scan

**File:** `.github/workflows/security-scan.yml`
**Triggers:** Push, PR, weekly schedule

**Steps:**
1. Runs npm audit
2. Checks outdated packages
3. Scans Docker image with Trivy
4. Reports to GitHub Security

**Purpose:** Identify security vulnerabilities.

### 5. Preview Deployment

**File:** `.github/workflows/preview.yml`
**Triggers:** Pull requests

**Steps:**
1. Builds the application
2. Deploys preview to Vercel
3. Comments preview URL on PR

**Purpose:** Test changes before merging.

## Setup Instructions

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Link Your Project

```bash
vercel link
```

This creates `.vercel/project.json` with your project details.

### Step 4: Get Vercel Token

```bash
vercel token
```

Copy the generated token.

### Step 5: Add GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

Add these secrets:

**Vercel Credentials:**
- `VERCEL_TOKEN` - Token from step 4
- `VERCEL_ORG_ID` - From `.vercel/project.json`
- `VERCEL_PROJECT_ID` - From `.vercel/project.json`

**Database (Production):**
- `PGHOST` - Your production database host (e.g., Neon, Supabase)
- `PGDATABASE` - Database name
- `PGUSER` - Database username
- `PGPASSWORD` - Database password

**Application:**
- `JWT_SECRET` - Random secret key for JWT signing

### Step 6: Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy and add as `JWT_SECRET` secret.

## Using Docker Images

After pushing to main, Docker images are available at:

```
ghcr.io/yourusername/epitrello:main
```

Pull and run:

```bash
docker pull ghcr.io/yourusername/epitrello:main
docker run -p 3000:3000 ghcr.io/yourusername/epitrello:main
```

## Workflow Status

View workflow runs:
1. Go to your GitHub repository
2. Click **Actions** tab
3. See all workflow runs and their status

## Adding Status Badges

Add to your `README.md`:

```markdown
![CI](https://github.com/yourusername/epitrello/workflows/CI/badge.svg)
![Deploy](https://github.com/yourusername/epitrello/workflows/Deploy%20to%20Production/badge.svg)
```

## Troubleshooting

### CI Fails

**Problem:** Build fails with "Cannot find module"
**Solution:** Make sure all dependencies are in `package.json` and run `npm install`

**Problem:** Database connection fails
**Solution:** Check PostgreSQL service is running in CI workflow

### Deploy Fails

**Problem:** "Invalid Vercel token"
**Solution:** Regenerate token with `vercel token` and update secret

**Problem:** "Build failed"
**Solution:** Check Vercel logs in the Actions tab for detailed error

### Docker Build Fails

**Problem:** "No space left on device"
**Solution:** GitHub Actions runners have limited space, reduce image size

**Problem:** "Permission denied"
**Solution:** Check repository has packages write permission enabled

## Environment-Specific Configuration

### Development
- Uses `.env.local`
- Connects to local PostgreSQL

### Preview (PR)
- Uses preview database
- Temporary deployment URL
- Auto-deleted after merge

### Production
- Uses production database (Neon/Supabase)
- Permanent deployment URL
- Requires all secrets configured

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets
2. **Use environment-specific configs** - Different DBs for dev/prod
3. **Regular security scans** - Weekly automated scans
4. **Update dependencies** - Dependabot creates PRs automatically
5. **Review PRs carefully** - Check preview deployments

## Dependabot

Configured in `.github/dependabot.yml`:
- Updates npm packages weekly
- Updates GitHub Actions weekly
- Updates Docker images weekly
- Creates PRs automatically

Review and merge Dependabot PRs regularly.

## Manual Deployment

If you need to deploy manually:

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

## Advanced: Custom Workflows

To add a new workflow:

1. Create `.github/workflows/your-workflow.yml`
2. Define triggers and jobs
3. Test with a PR first

Example workflow:

```yaml
name: Custom Workflow

on:
  push:
    branches: [ main ]

jobs:
  custom-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run custom script
        run: ./scripts/custom.sh
```

## Monitoring

### View Logs

1. Go to Actions tab
2. Click on a workflow run
3. Click on a job
4. Expand steps to see logs

### Deployment URLs

After deployment, find URLs in:
- Workflow summary
- PR comments (for preview)
- Vercel dashboard

## Cost Considerations

**GitHub Actions:**
- Free for public repositories
- 2000 minutes/month for private repos (free tier)

**Vercel:**
- Free tier includes:
  - Unlimited deployments
  - Automatic HTTPS
  - 100GB bandwidth/month

**Container Registry:**
- Free for public images
- 500MB storage for private images (free tier)

## Next Steps

1. Set up GitHub Secrets
2. Push to main to trigger first deployment
3. Create a PR to test preview deployment
4. Monitor workflows in Actions tab
5. Configure Dependabot alerts

