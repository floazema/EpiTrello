# Development Setup

## Prerequisites

Ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm** (comes with Node.js)
- **Docker** and **Docker Compose**
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EpiTrello
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- next (15.5.6)
- react (19.1.0)
- react-dom (19.1.0)
- pg (8.16.3) - PostgreSQL client
- bcryptjs (3.0.2) - Password hashing
- jsonwebtoken (9.0.2) - JWT tokens
- tailwindcss (4) - Styling
- lucide-react (0.546.0) - Icons

### 3. Start with Docker (Recommended)

```bash
docker compose up
```

This command will:
1. Start PostgreSQL database
2. Wait for database to be healthy
3. Initialize the database schema
4. Start the Next.js development server on port 3000

Access the application at: `http://localhost:3000`

### 4. Manual Setup (Alternative)

If you prefer not to use Docker for the app:

```bash
# Start only the database
docker compose up postgres -d

# Initialize the database
npm run init-db

# Start the development server
npm run dev
```

## Project Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Initialize/reset database
npm run init-db
```

## Environment Variables

Create a `.env.local` file in the root directory (optional, defaults are provided):

```env
# Database
PGHOST=localhost
PGDATABASE=taskly_db
PGUSER=postgres
PGPASSWORD=postgres
PGPORT=5432

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Application
NODE_ENV=development
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Docker Configuration

The project uses two services defined in `docker-compose.yml`:

### PostgreSQL Service
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Database**: taskly_db
- **Credentials**: postgres/postgres
- **Volume**: Persistent data storage

### App Service
- **Build**: From Dockerfile
- **Port**: 3000
- **Depends**: Waits for PostgreSQL to be healthy
- **Volumes**: Live reload enabled

## Development Workflow

1. **Make changes** to files in `app/`, `components/`, or `lib/`
2. **Save** - Hot reload will update the browser automatically
3. **Test** your changes in the browser
4. **Commit** your changes with git

## Troubleshooting

### Port 3000 already in use
```bash
# Stop the conflicting process or use a different port
docker compose down
# or
PORT=3001 npm run dev
```

### Database connection error
```bash
# Ensure PostgreSQL is running
docker compose up postgres -d

# Check database logs
docker compose logs postgres
```

### "next: command not found"
```bash
# Install dependencies
npm install
```

## Next Steps

Use the navigation on the right to explore:
- **Database Schema** - Understand the database structure
- **API Reference** - Learn about the API endpoints
- **Frontend Pages** - Explore the pages and components
- **Docker Configuration** - Review the Docker setup

