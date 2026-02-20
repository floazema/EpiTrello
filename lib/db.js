import { Pool } from 'pg';

// Configuration de la connexion PostgreSQL
const createPool = (database = null) => new Pool({
  host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
  port: 5432,
  database: database || process.env.PGDATABASE || process.env.DB_NAME || 'epitrello_db',
  user: process.env.PGUSER || process.env.DB_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || 'postgres',
  // SSL désactivé par défaut (local/Docker/CI). Activé uniquement si DB_SSL=true
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const pool = createPool();

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Fonction pour initialiser la base de données
export const initializeDatabase = async () => {
  const dbName = process.env.PGDATABASE || process.env.DB_NAME || 'epitrello_db';

  // D'abord, connecter à la base 'postgres' pour créer notre base de données si nécessaire
  const adminPool = createPool('postgres');

  try {
    console.log(`Vérification de l'existence de la base de données ${dbName}...`);

    // Vérifier si la base existe
    const checkDb = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      console.log(`Création de la base de données ${dbName}...`);
      // La base n'existe pas, la créer
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Base de données ${dbName} créée avec succès`);
    } else {
      console.log(`✓ La base de données ${dbName} existe déjà`);
    }

    await adminPool.end();
  } catch (error) {
    await adminPool.end();
    console.error('Erreur lors de la création de la base de données:', error);
    throw error;
  }

  // Maintenant, créer les tables dans notre base de données
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createBoardsTable = `
    CREATE TABLE IF NOT EXISTS boards (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      color VARCHAR(50) DEFAULT 'zinc',
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createColumnsTable = `
    CREATE TABLE IF NOT EXISTS columns (
      id SERIAL PRIMARY KEY,
      board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createCardsTable = `
    CREATE TABLE IF NOT EXISTS cards (
      id SERIAL PRIMARY KEY,
      column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      priority VARCHAR(20) DEFAULT 'medium',
      due_date DATE DEFAULT NULL,
      tags TEXT[] DEFAULT NULL,
      color VARCHAR(50) DEFAULT NULL,
      assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createBoardMembersTable = `
    CREATE TABLE IF NOT EXISTS board_members (
      id SERIAL PRIMARY KEY,
      board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(board_id, user_id)
    );
  `;

  const createInvitationsTable = `
    CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      inviter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      invitee_email VARCHAR(255) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createCommentsTable = `
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_comments_card_id ON comments(card_id);
  `;

  const createAttachmentsTable = `
    CREATE TABLE IF NOT EXISTS attachments (
      id SERIAL PRIMARY KEY,
      card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      size INTEGER NOT NULL DEFAULT 0,
      mime_type VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_attachments_card_id ON attachments(card_id);
  `;

  try {
    console.log('Création des tables...');
    await query(createUsersTable);
    console.log('✓ Table users créée');
    await query(createBoardsTable);
    console.log('✓ Table boards créée');
    await query(createColumnsTable);
    console.log('✓ Table columns créée');
    await query(createCardsTable);
    console.log('✓ Table cards créée');
    await query(createBoardMembersTable);
    console.log('✓ Table board_members créée');
    await query(createInvitationsTable);
    console.log('✓ Table invitations créée');
    await query(createCommentsTable);
    console.log('✓ Table comments créée');
    await query(createAttachmentsTable);
    console.log('✓ Table attachments créée');

    // Migration: Add existing board owners to board_members
    console.log('Migration: Ajout des propriétaires existants à board_members...');
    await query(`
      INSERT INTO board_members (board_id, user_id, role, joined_at)
      SELECT id, owner_id, 'owner', created_at
      FROM boards
      WHERE NOT EXISTS (
        SELECT 1 FROM board_members 
        WHERE board_members.board_id = boards.id 
        AND board_members.user_id = boards.owner_id
      )
    `);
    console.log('✓ Migration terminée');

    // Migration: Add assigned_to column to cards if missing
    await query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cards' AND column_name='assigned_to') THEN
          ALTER TABLE cards ADD COLUMN assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    console.log('✓ Migration assigned_to terminée');

    console.log('✓ Toutes les tables ont été initialisées avec succès');
  } catch (error) {
    console.error('Erreur lors de la création des tables:', error);
    throw error;
  }
};

export default pool;