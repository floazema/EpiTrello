# Docker Configuration

## Overview

EpiTrello uses Docker and Docker Compose to containerize the PostgreSQL database and the Next.js application for consistent development and deployment environments.

## Files

- `docker-compose.yml` - Orchestrates multiple containers
- `Dockerfile` - Defines the application container
- `.dockerignore` - Excludes files from Docker build

## Docker Compose Configuration

Located in `docker-compose.yml`:

### Services

#### 1. PostgreSQL Service

```yaml
postgres:
  image: postgres:16-alpine
  container_name: epitrello-postgres
  environment:
    POSTGRES_DB: epitrello_db
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 5s
    timeout: 5s
    retries: 10
  networks:
    - epitrello-network
```

**Configuration:**
- **Image:** postgres:16-alpine (lightweight Alpine Linux base)
- **Database:** epitrello_db
- **Credentials:** postgres/postgres
- **Port:** 5432 (accessible on host)
- **Volume:** postgres_data (persistent storage)
- **Healthcheck:** Ensures database is ready before app starts

#### 2. Application Service

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
  container_name: epitrello-app
  environment:
    - DB_HOST=postgres
    - DB_NAME=epitrello_db
    - DB_USER=postgres
    - DB_PASSWORD=postgres
    - DB_PORT=5432
  ports:
    - "3000:3000"
  volumes:
    - .:/app
    - /app/node_modules
    - /app/.next
  depends_on:
    postgres:
      condition: service_healthy
  networks:
    - epitrello-network
  restart: unless-stopped
```

**Configuration:**
- **Build:** Uses local Dockerfile
- **Environment:** Database connection variables
- **Port:** 3000 (accessible on host)
- **Volumes:**
  - `.:/app` - Mounts source code for live reload
  - `/app/node_modules` - Preserves npm modules
  - `/app/.next` - Preserves Next.js build cache
- **Depends on:** Waits for PostgreSQL to be healthy
- **Restart:** Always restart unless manually stopped

### Networks

```yaml
networks:
  epitrello-network:
    driver: bridge
```

Creates an isolated network for services to communicate.

### Volumes

```yaml
volumes:
  postgres_data:
    driver: local
```

Persistent volume for PostgreSQL data (survives container restarts).

## Dockerfile

Located in root directory:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Start script will handle DB initialization and app startup
CMD ["sh", "-c", "npm run init-db && npm run dev"]
```

**Build Process:**
1. Start from Node.js 20 Alpine image
2. Set working directory to /app
3. Copy package.json and package-lock.json
4. Install npm dependencies
5. Copy application source code
6. Expose port 3000
7. Run init-db then start dev server

**Why Alpine?**
- Smaller image size (~150MB vs ~900MB)
- Faster build and pull times
- Security benefits (minimal attack surface)

## .dockerignore

Excludes unnecessary files from Docker build:

```
node_modules
.next
npm-debug.log*
.DS_Store
.env*.local
*.log
.git
.gitignore
README.md
docker-compose.yml
Dockerfile
.dockerignore
```

**Benefits:**
- Faster builds
- Smaller image size
- No sensitive files in image

## Commands

### Start All Services

```bash
docker compose up
```

Starts both PostgreSQL and app in foreground (shows logs).

### Start in Background

```bash
docker compose up -d
```

Detached mode - runs in background.

### Stop Services

```bash
docker compose down
```

Stops and removes containers (data volumes persist).

### Stop and Remove Data

```bash
docker compose down -v
```

Also removes volumes (deletes database data).

### View Logs

```bash
docker compose logs          # All services
docker compose logs app      # App only
docker compose logs postgres # Database only
docker compose logs -f       # Follow logs (real-time)
```

### Check Status

```bash
docker compose ps
```

Shows running containers and their status.

### Rebuild

```bash
docker compose up --build
```

Rebuilds images before starting (use after Dockerfile changes).

### Run Commands in Containers

```bash
# Execute shell in app container
docker compose exec app sh

# Execute shell in postgres container
docker compose exec postgres sh

# Run npm command in app
docker compose exec app npm install new-package

# Access PostgreSQL CLI
docker compose exec postgres psql -U postgres epitrello_db
```

## Development Workflow

### Initial Setup

```bash
docker compose up
```

This will:
1. Download images (first time only)
2. Build app container
3. Start PostgreSQL
4. Wait for database to be ready
5. Initialize database schema
6. Start Next.js dev server

### Daily Development

```bash
# Start
docker compose up -d

# Check logs if needed
docker compose logs -f app

# Stop when done
docker compose down
```

### After Code Changes

No rebuild needed! The volume mount enables live reload:
- Save file
- Next.js automatically rebuilds
- Browser refreshes

### After Dependency Changes

```bash
# Rebuild container
docker compose up --build

# Or manually
docker compose exec app npm install
```

### Database Reset

```bash
docker compose down -v
docker compose up
```

## Troubleshooting

### Port Already in Use

```bash
# Stop conflicting process or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use different host port
```

### Container Won't Start

```bash
# Check logs
docker compose logs app
docker compose logs postgres

# Ensure no conflicting containers
docker ps -a
docker rm -f <container_name>
```

### Database Connection Failed

```bash
# Verify PostgreSQL is healthy
docker compose ps

# Check if healthcheck is passing
docker inspect epitrello-postgres | grep Health

# Restart postgres
docker compose restart postgres
```

### Volume Issues

```bash
# Remove volumes and restart
docker compose down -v
docker volume ls
docker volume rm epitrello_postgres_data
docker compose up
```

### Build Errors

```bash
# Clean build
docker compose down
docker compose build --no-cache
docker compose up
```

## Production Considerations

For production deployment, modify `docker-compose.yml`:

```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
  environment:
    - NODE_ENV=production
    - DB_HOST=${PGHOST}
    - DB_NAME=${PGDATABASE}
    - DB_USER=${PGUSER}
    - DB_PASSWORD=${PGPASSWORD}
    - JWT_SECRET=${JWT_SECRET}
  command: sh -c "npm run build && npm start"
```

**Changes:**
- Set `NODE_ENV=production`
- Use environment variables from .env
- Run `npm start` instead of `npm run dev`
- Remove volume mounts (bake code into image)
- Add resource limits
- Enable SSL for PostgreSQL

## Docker Hub / Registry

To push to a registry:

```bash
# Build with tag
docker build -t yourusername/epitrello:latest .

# Push
docker push yourusername/epitrello:latest
```

## Health Monitoring

The PostgreSQL healthcheck ensures:
- Database is accepting connections
- App doesn't start until DB is ready
- Automatic restart if DB fails

Monitor with:

```bash
docker compose ps
# Look for "healthy" status
```

## Resource Usage

Check resource consumption:

```bash
docker stats
```

Shows CPU, memory, network, and disk I/O for each container.

