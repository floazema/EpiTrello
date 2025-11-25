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

## Required Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`) if you want to deploy to production:

### For Production Database (Optional)
- `PGHOST` - Production PostgreSQL host
- `PGDATABASE` - Database name
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT tokens

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
![Security](https://github.com/yourusername/epitrello/workflows/Security%20Scan/badge.svg)
![Docker](https://github.com/yourusername/epitrello/workflows/Build%20and%20Push%20Docker%20Image/badge.svg)
```

## Customization

### Change Node.js version
Edit `node-version: '20'` in all workflow files.

### Change database version
Edit `postgres:16-alpine` in `ci.yml`.

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

### Security scan fails
- Review vulnerabilities in GitHub Security tab
- Update dependencies: `npm audit fix`
- Update Docker base images

