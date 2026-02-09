import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { query, initializeDatabase } from '@/lib/db.js';
import { hashPassword, generateToken } from '@/lib/auth.js';

describe('Boards API Integration', () => {
  let testUserId;
  let authToken;
  let authCookie;

  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    // Clear tables
    await query('DELETE FROM board_invitations');
    await query('DELETE FROM cards');
    await query('DELETE FROM board_members');
    await query('DELETE FROM columns');
    await query('DELETE FROM boards');
    await query('DELETE FROM users');

    // Create test user
    const hashedPassword = await hashPassword('TestPass123!');
    const userResult = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      ['board.test@example.com', hashedPassword, 'Board Tester']
    );
    testUserId = userResult.rows[0].id;
    authToken = generateToken({ userId: testUserId, email: 'board.test@example.com' });
    authCookie = `auth_token=${authToken}`;
  });

  describe('POST /api/boards', () => {
    it('should create a new board with default columns', async () => {
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          name: 'My First Board',
          description: 'A test board',
          color: 'blue',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.board.name).toBe('My First Board');
      expect(data.board.description).toBe('A test board');

      // Verify default columns created
      const columnsResult = await query(
        'SELECT * FROM columns WHERE board_id = $1 ORDER BY position',
        [data.board.id]
      );

      expect(columnsResult.rows.length).toBe(3); // To Do, In Progress, Done
      expect(columnsResult.rows[0].name).toBe('To Do');
      expect(columnsResult.rows[1].name).toBe('In Progress');
      expect(columnsResult.rows[2].name).toBe('Done');
    });

    it('should require board name', async () => {
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          name: '',
          description: 'Missing name',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Unauthorized Board',
          description: 'No auth',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/boards', () => {
    beforeEach(async () => {
      // Create test boards
      const board1 = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Board 1', testUserId]
      );
      const board2 = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Board 2', testUserId]
      );

      // Create another user's board
      const otherUserResult = await query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
        ['other@example.com', await hashPassword('Pass123!'), 'Other User']
      );
      await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Other Board', otherUserResult.rows[0].id]
      );
    });

    it('should list only user\'s own boards', async () => {
      const response = await fetch('http://localhost:3000/api/boards', {
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.boards.length).toBe(2); // Only owned boards
      expect(data.boards.every(b => b.name.includes('Board'))).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await fetch('http://localhost:3000/api/boards');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/boards/[id]', () => {
    let boardId;
    let columnId;

    beforeEach(async () => {
      const boardResult = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Detail Board', testUserId]
      );
      boardId = boardResult.rows[0].id;

      const columnResult = await query(
        'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id',
        [boardId, 'To Do', 0]
      );
      columnId = columnResult.rows[0].id;

      // Add a card
      await query(
        'INSERT INTO cards (column_id, title, position) VALUES ($1, $2, $3)',
        [columnId, 'Task 1', 0]
      );
    });

    it('should retrieve board with columns and cards', async () => {
      const response = await fetch(`http://localhost:3000/api/boards/${boardId}`, {
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.board.name).toBe('Detail Board');
      expect(data.board.columns.length).toBeGreaterThan(0);
      expect(data.board.columns[0].cards.length).toBe(1);
    });

    it('should return 404 for non-existent board', async () => {
      const response = await fetch('http://localhost:3000/api/boards/99999', {
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/boards/[id]', () => {
    it('should delete board and associated data', async () => {
      const boardResult = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Delete Board', testUserId]
      );
      const boardId = boardResult.rows[0].id;

      const response = await fetch(`http://localhost:3000/api/boards/${boardId}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify board is deleted
      const checkResult = await query('SELECT * FROM boards WHERE id = $1', [boardId]);
      expect(checkResult.rows.length).toBe(0);
    });

    it('should only allow owner to delete', async () => {
      // Create board as different user
      const otherUserResult = await query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
        ['other@example.com', await hashPassword('Pass123!'), 'Other']
      );

      const boardResult = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Other Board', otherUserResult.rows[0].id]
      );

      // Try to delete as different user
      const response = await fetch(`http://localhost:3000/api/boards/${boardResult.rows[0].id}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});