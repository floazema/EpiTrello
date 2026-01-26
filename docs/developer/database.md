# Database Schema

## Overview

EpiTrello uses **PostgreSQL 16** as its database. The current implementation includes user authentication with plans for boards, columns, and tasks in future iterations.

## Connection Configuration

Database connection is managed in `lib/db.js` using the `pg` library with connection pooling:

```javascript
{
  host: process.env.PGHOST || 'localhost',
  port: 5432,
  database: process.env.PGDATABASE || 'epitrello_db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  max: 20,                        // Maximum connections in pool
  idleTimeoutMillis: 30000,       // Close idle clients after 30s
  connectionTimeoutMillis: 10000  // Fail after 10s if can't connect
}
```

## Current Schema

### Users Table

The only table currently implemented:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Auto-incrementing primary key
- `email` - Unique email address for login
- `password` - Bcrypt hashed password (never stored in plain text)
- `name` - User's display name
- `created_at` - Timestamp of account creation
- `updated_at` - Timestamp of last update

**Indexes:**
- Primary key index on `id`
- Unique index on `email` (automatic with UNIQUE constraint)

## Database Operations

All database queries use the centralized `query` function from `lib/db.js`:

```javascript
import { query } from '@/lib/db';

const result = await query(
  'SELECT id, email, name FROM users WHERE email = $1',
  [email]
);
```

**Features:**
- Connection pooling for performance
- Automatic error handling
- Query logging with duration tracking
- Parameterized queries to prevent SQL injection

**Example from code:**
```javascript
const result = await query(
  'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
  [email, hashedPassword, name]
);
```

## Database Initialization

The database is initialized using the script `scripts/init-db.js`:

```bash
npm run init-db
```

This script:
1. Connects to PostgreSQL
2. Creates the `users` table if it doesn't exist
3. Logs success or error messages

The script is automatically run when starting with `docker compose up`.

## Security Best Practices

### 1. Password Storage
Passwords are **never** stored in plain text. They are hashed using bcrypt with 10 salt rounds:

```javascript
// lib/auth.js
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### 2. SQL Injection Prevention
All queries use parameterized statements:

```javascript
// ✅ CORRECT - Parameterized
query('SELECT * FROM users WHERE email = $1', [email])

// ❌ WRONG - String concatenation
query(`SELECT * FROM users WHERE email = '${email}'`)
```

### 3. Connection Security
- SSL enabled for production databases
- Limited connection pool to prevent resource exhaustion
- Timeouts configured to avoid hanging connections

## Planned Schema (Future)

These tables will be added in upcoming iterations:

### Boards
```sql
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Columns
```sql
CREATE TABLE columns (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(10),
  due_date TIMESTAMP,
  assigned_to INTEGER REFERENCES users(id),
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Database Maintenance

### Backup
```bash
docker compose exec postgres pg_dump -U postgres epitrello_db > backup.sql
```

### Restore
```bash
docker compose exec -T postgres psql -U postgres epitrello_db < backup.sql
```

### Reset Database
```bash
# Stop containers
docker compose down

# Remove volume
docker volume rm epitrello_postgres_data

# Restart (will recreate database)
docker compose up
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL container is running: `docker compose ps`
- Check logs: `docker compose logs postgres`

### Table Already Exists
- Normal if running init-db multiple times
- Tables use `IF NOT EXISTS` to avoid errors

### Authentication Failed
- Verify credentials in `.env.local` or `docker-compose.yml`
- Default: postgres/postgres

