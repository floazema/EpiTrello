import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { query, initializeDatabase } from '@/lib/db.js';
import { hashPassword, generateToken } from '@/lib/auth.js';

describe('Cards and Columns Integration', () => {
  let testUserId;
  let boardId;
  let columnId;
  let authCookie;

  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    // Setup: Create user, board, and column
    const hashedPassword = await hashPassword('Test123!');
    const userResult = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      ['cards.test@example.com', hashedPassword, 'Cards Tester']
    );
    testUserId = userResult.rows[0].id;
    authCookie = `auth_token=${generateToken({ userId: testUserId })}`;

    const boardResult = await query(
      'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
      ['Card Test Board', testUserId]
    );
    boardId = boardResult.rows[0].id;

    const columnResult = await query(
      'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id',
      [boardId, 'To Do', 0]
    );
    columnId = columnResult.rows[0].id;
  });

  afterEach(async () => {
    await query('DELETE FROM cards WHERE column_id IN (SELECT id FROM columns WHERE board_id = $1)', [boardId]);
    await query('DELETE FROM columns WHERE board_id = $1', [boardId]);
    await query('DELETE FROM boards WHERE id = $1', [boardId]);
    await query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  describe('POST /api/cards - Create Card', () => {
    it('should create card with required fields', async () => {
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: columnId,
          title: 'New Task',
          description: 'Task description',
          priority: 'high',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.card.title).toBe('New Task');
      expect(data.card.priority).toBe('high');
    });

    it('should require column_id and title', async () => {
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          // missing column_id
          title: 'Task',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should set priority to medium if not provided', async () => {
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: columnId,
          title: 'Default Priority Task',
        }),
      });

      const data = await response.json();

      expect(data.card.priority).toBe('medium');
    });

    it('should assign position to card', async () => {
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: columnId,
          title: 'Positioned Task',
        }),
      });

      const data = await response.json();

      expect(data.card.position).toBeDefined();
      expect(typeof data.card.position).toBe('number');
    });
  });

  describe('PATCH /api/cards/[id] - Update Card', () => {
    let cardId;

    beforeEach(async () => {
      const cardResult = await query(
        'INSERT INTO cards (column_id, title, priority, position) VALUES ($1, $2, $3, $4) RETURNING id',
        [columnId, 'Original Title', 'low', 0]
      );
      cardId = cardResult.rows[0].id;
    });

    it('should update card fields', async () => {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          title: 'Updated Title',
          priority: 'urgent',
          description: 'Updated description',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.card.title).toBe('Updated Title');
      expect(data.card.priority).toBe('urgent');
      expect(data.card.description).toBe('Updated description');
    });

    it('should update individual fields', async () => {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          priority: 'high',
        }),
      });

      const data = await response.json();

      expect(data.card.priority).toBe('high');
      expect(data.card.title).toBe('Original Title'); // Unchanged
    });

    it('should handle due_date updates', async () => {
      const dueDate = '2025-12-31';
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          due_date: dueDate,
        }),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.card.due_date).toBeDefined();
    });
  });

  describe('DELETE /api/cards/[id]', () => {
    let cardId;

    beforeEach(async () => {
      const cardResult = await query(
        'INSERT INTO cards (column_id, title, position) VALUES ($1, $2, $3) RETURNING id',
        [columnId, 'Delete Me', 0]
      );
      cardId = cardResult.rows[0].id;
    });

    it('should delete card', async () => {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify deletion
      const checkResult = await query('SELECT * FROM cards WHERE id = $1', [cardId]);
      expect(checkResult.rows.length).toBe(0);
    });
  });

  describe('POST /api/cards/[id]/move - Move Card', () => {
    let cardId;
    let toDoColumnId;
    let inProgressColumnId;

    beforeEach(async () => {
      // Create two columns
      const toDoResult = await query(
        'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id',
        [boardId, 'To Do', 0]
      );
      toDoColumnId = toDoResult.rows[0].id;

      const inProgressResult = await query(
        'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id',
        [boardId, 'In Progress', 1]
      );
      inProgressColumnId = inProgressResult.rows[0].id;

      // Create card in To Do
      const cardResult = await query(
        'INSERT INTO cards (column_id, title, position) VALUES ($1, $2, $3) RETURNING id',
        [toDoColumnId, 'Movable Task', 0]
      );
      cardId = cardResult.rows[0].id;
    });

    it('should move card to different column', async () => {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: inProgressColumnId,
          position: 0,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.card.column_id).toBe(inProgressColumnId);
    });

    it('should update card position within column', async () => {
      // Create another card
      const card2Result = await query(
        'INSERT INTO cards (column_id, title, position) VALUES ($1, $2, $3) RETURNING id',
        [columnId, 'Second Task', 1]
      );

      const response = await fetch(`http://localhost:3000/api/cards/${cardId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: columnId,
          position: 1,
        }),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.card.position).toBe(1);
    });
  });

  describe('POST /api/columns - Create Column', () => {
    it('should create column in board', async () => {
      const response = await fetch('http://localhost:3000/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          board_id: boardId,
          name: 'New Column',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.column.name).toBe('New Column');
      expect(data.column.board_id).toBe(boardId);
    });

    it('should require board_id and name', async () => {
      const response = await fetch('http://localhost:3000/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          name: 'No Board ID',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('PATCH /api/columns/[id]', () => {
    it('should update column name', async () => {
      const response = await fetch(`http://localhost:3000/api/columns/${columnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          name: 'Updated Column Name',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.column.name).toBe('Updated Column Name');
    });
  });

  describe('DELETE /api/columns/[id]', () => {
    it('should delete column', async () => {
      const response = await fetch(`http://localhost:3000/api/columns/${columnId}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});