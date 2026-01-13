// app/api/tasks/[id]/route.js
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await db.query(
      `SELECT t.* FROM tasks t
       JOIN columns c ON t.column_id = c.id
       JOIN board_members bm ON c.board_id = (SELECT board_id FROM columns WHERE id = c.id) AND bm.user_id = $1
       WHERE t.id = $2`,
      [user.id, id]
    );

    if (task.rows.length === 0) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    return Response.json(task.rows[0]);
  } catch (error) {
    console.error('Error fetching task:', error);
    return Response.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { columnId, title, description, priority, deadline, assignedTo, position } = await request.json();

    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current task and verify access
    const taskCheck = await db.query(
      `SELECT t.*, c.board_id FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE t.id = $1`,
      [id]
    );

    if (taskCheck.rows.length === 0) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    const boardId = taskCheck.rows[0].board_id;

    // Verify user has access
    const memberCheck = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [boardId, user.id]
    );

    if (memberCheck.rows.length === 0) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update task
    let query = 'UPDATE tasks SET updated_at = NOW()';
    let values = [id];
    let paramCount = 2;

    if (title !== undefined) {
      query += `, title = $${paramCount}`;
      values.splice(1, 0, title);
      paramCount++;
    }

    if (description !== undefined) {
      query += `, description = $${paramCount}`;
      values.splice(values.length - 1, 0, description);
      paramCount++;
    }

    if (priority !== undefined) {
      query += `, priority = $${paramCount}`;
      values.splice(values.length - 1, 0, priority);
      paramCount++;
    }

    if (deadline !== undefined) {
      query += `, deadline = $${paramCount}`;
      values.splice(values.length - 1, 0, deadline);
      paramCount++;
    }

    if (assignedTo !== undefined) {
      query += `, assigned_to = $${paramCount}`;
      values.splice(values.length - 1, 0, assignedTo);
      paramCount++;
    }

    if (columnId !== undefined) {
      query += `, column_id = $${paramCount}`;
      values.splice(values.length - 1, 0, columnId);
      paramCount++;
    }

    if (position !== undefined) {
      query += `, position = $${paramCount}`;
      values.splice(values.length - 1, 0, position);
      paramCount++;
    }

    query += ` WHERE id = $1 RETURNING *`;

    const result = await db.query(query, values);

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    return Response.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get task and verify access
    const taskCheck = await db.query(
      `SELECT t.*, c.board_id FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE t.id = $1`,
      [id]
    );

    if (taskCheck.rows.length === 0) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    const boardId = taskCheck.rows[0].board_id;

    // Verify user has access
    const memberCheck = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [boardId, user.id]
    );

    if (memberCheck.rows.length === 0) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete task
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);

    return Response.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return Response.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}