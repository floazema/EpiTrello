// app/api/boards/[id]/tasks/route.js
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to board
    const memberCheck = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (memberCheck.rows.length === 0) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all tasks in board columns
    const tasks = await db.query(
      `SELECT t.* FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE c.board_id = $1
       ORDER BY t.column_id, t.position ASC`,
      [id]
    );

    return Response.json(tasks.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return Response.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { columnId, title, description, priority, deadline, assignedTo, position = 0 } = await request.json();

    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has access to board
    const memberCheck = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (memberCheck.rows.length === 0) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify column belongs to board
    const column = await db.query(
      'SELECT * FROM columns WHERE id = $1 AND board_id = $2',
      [columnId, id]
    );

    if (column.rows.length === 0) {
      return Response.json({ error: 'Column not found' }, { status: 404 });
    }

    // Create task
    const result = await db.query(
      `INSERT INTO tasks (column_id, title, description, priority, deadline, assigned_to, position, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [columnId, title, description || '', priority || 'medium', deadline || null, assignedTo || null, position, user.id]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return Response.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}