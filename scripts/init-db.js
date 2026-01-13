// scripts/init-db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'epitrello_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const createTablesSQL = `
  -- Users table
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Boards table
  CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Columns table
  CREATE TABLE IF NOT EXISTS columns (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tasks table
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    deadline TIMESTAMP,
    assigned_to INTEGER REFERENCES users(id),
    position INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Board members table
  CREATE TABLE IF NOT EXISTS board_members (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(board_id, user_id)
  );

  -- Invitations table
  CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_boards_created_by ON boards(created_by);
  CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_board_members_board_id ON board_members(board_id);
  CREATE INDEX IF NOT EXISTS idx_board_members_user_id ON board_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_invitations_board_id ON invitations(board_id);
`;

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Starting database initialization...');
    
    // Split by semicolons and execute each statement
    const statements = createTablesSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      await client.query(statement);
      console.log('✓ Executed:', statement.split('\n')[0]);
    }

    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();