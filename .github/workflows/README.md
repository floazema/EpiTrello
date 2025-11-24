# GitHub Actions Workflows

This directory contains CI/CD workflows for the EpiTrello project.

## Workflows

### 🔧 CI (`ci.yml`)
**Trigger:** Push/PR to `main` or `develop` branches

**What it does:**
- Runs on every push and pull request
- Sets up PostgreSQL database
- Installs dependencies
- Runs linting (if configured)
- Initializes database
- Builds the Next.js application
- Builds Docker image (without pushing)
- Validates Docker Compose configuration

### 🚀 Deploy (`deploy.yml`)
**Trigger:** Push to `main` branch

**What it does:**
- Deploys to production on Vercel
- Requires secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- Sets environment variables for production
- Creates deployment summary

### 🐳 Docker Publish (`docker-publish.yml`)
**Trigger:** Push to `main`, version tags (`v*`)

**What it does:**
- Builds Docker image
- Pushes to GitHub Container Registry (ghcr.io)
- Tags with branch name, version, and commit SHA
- Uses build cache for faster builds

### 🔍 Security Scan (`security-scan.yml`)
**Trigger:** Push, PR, weekly schedule

**What it does:**
- Runs `npm audit` for dependency vulnerabilities
- Checks for outdated packages
- Scans Docker image with Trivy
- Uploads results to GitHub Security tab

### 👀 Preview (`preview.yml`)
**Trigger:** Pull requests

**What it does:**
- Creates preview deployment on Vercel
- Comments preview URL on PR
- Allows testing changes before merging

## Required Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

### For Vercel Deployment
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your Vercel project ID

### For Database (Production)
- `PGHOST` - PostgreSQL host
- `PGDATABASE` - Database name
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT tokens

## Getting Vercel Credentials

### 1. Get Vercel Token
```bash
npm i -g vercel
vercel login
vercel token
```

### 2. Get Project IDs
```bash
# Link your project
vercel link

# Get IDs from .vercel/project.json
cat .vercel/project.json
```

Or find them in your Vercel dashboard:
- Go to your project settings
- Copy `Project ID` and `Org ID`

## GitHub Container Registry

Images are automatically pushed to: `ghcr.io/yourusername/epitrello`

To pull the image:
```bash
docker pull ghcr.io/yourusername/epitrello:main
```

## Dependabot

Configured in `dependabot.yml` to:
- Update npm dependencies weekly
- Update GitHub Actions weekly
- Update Docker base images weekly
- Create PRs automatically

## Status Badges

Add these to your README.md:

```markdown
![CI](https://github.com/yourusername/epitrello/workflows/CI/badge.svg)
![Deploy](https://github.com/yourusername/epitrello/workflows/Deploy%20to%20Production/badge.svg)
![Security](https://github.com/yourusername/epitrello/workflows/Security%20Scan/badge.svg)
```

## Customization

### Change Node.js version
Edit `node-version: '20'` in all workflow files.

### Change database version
Edit `postgres:16-alpine` in `ci.yml`.

### Change deployment platform
Replace Vercel actions with:
- Railway: `railway deploy`
- Heroku: `heroku/deploy-action@v1`
- AWS: `aws-actions/configure-aws-credentials@v4`

### Add test runner
Add before the build step:
```yaml
- name: Run tests
  run: npm test
```

## Troubleshooting

### CI fails on build
- Check if all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check environment variables

### Deployment fails
- Verify Vercel secrets are correct
- Check database connection from production
- Review Vercel deployment logs

### Security scan fails
- Review vulnerabilities in GitHub Security tab
- Update dependencies: `npm audit fix`
- Update Docker base images

