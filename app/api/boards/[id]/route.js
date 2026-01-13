// app/api/boards/[id]/route.js
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

    // Get board
    const board = await db.query(
      'SELECT * FROM boards WHERE id = $1',
      [id]
    );

    if (board.rows.length === 0) {
      return Response.json({ error: 'Board not found' }, { status: 404 });
    }

    return Response.json(board.rows[0]);
  } catch (error) {
    console.error('Error fetching board:', error);
    return Response.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, description } = await request.json();

    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is owner of board
    const member = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
      return Response.json({ error: 'Only board owner can update board' }, { status: 403 });
    }

    // Update board
    const result = await db.query(
      'UPDATE boards SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description || '', id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'Board not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating board:', error);
    return Response.json(
      { error: 'Failed to update board' },
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

    // Verify user is owner of board
    const member = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
      return Response.json({ error: 'Only board owner can delete board' }, { status: 403 });
    }

    // Delete all tasks in board
    const columns = await db.query(
      'SELECT id FROM columns WHERE board_id = $1',
      [id]
    );

    for (const col of columns.rows) {
      await db.query('DELETE FROM tasks WHERE column_id = $1', [col.id]);
    }

    // Delete all columns
    await db.query('DELETE FROM columns WHERE board_id = $1', [id]);

    // Delete all members
    await db.query('DELETE FROM board_members WHERE board_id = $1', [id]);

    // Delete board
    await db.query('DELETE FROM boards WHERE id = $1', [id]);

    return Response.json({ message: 'Board deleted' });
  } catch (error) {
    console.error('Error deleting board:', error);
    return Response.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}