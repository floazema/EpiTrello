// app/api/boards/[id]/columns/[columnId]/route.js
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const { id, columnId } = params;
    const { name } = await request.json();

    // Verify user is authenticated
    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is member of board
    const boardMember = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (boardMember.rows.length === 0) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update column
    const result = await db.query(
      'UPDATE columns SET name = $1 WHERE id = $2 AND board_id = $3 RETURNING *',
      [name, columnId, id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'Column not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating column:', error);
    return Response.json(
      { error: 'Failed to update column' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, columnId } = params;

    // Verify user is authenticated
    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is member of board
    const boardMember = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, user.id]
    );

    if (boardMember.rows.length === 0) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete tasks in column first
    await db.query(
      'DELETE FROM tasks WHERE column_id = $1',
      [columnId]
    );

    // Delete column
    const result = await db.query(
      'DELETE FROM columns WHERE id = $1 AND board_id = $2 RETURNING *',
      [columnId, id]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'Column not found' }, { status: 404 });
    }

    return Response.json({ message: 'Column deleted' });
  } catch (error) {
    console.error('Error deleting column:', error);
    return Response.json(
      { error: 'Failed to delete column' },
      { status: 500 }
    );
  }
}