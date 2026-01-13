// app/api/boards/[id]/columns/route.js
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const columns = await db.query(
      'SELECT * FROM columns WHERE board_id = $1 ORDER BY position ASC',
      [id]
    );

    return Response.json(columns.rows);
  } catch (error) {
    console.error('Error fetching columns:', error);
    return Response.json(
      { error: 'Failed to fetch columns' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
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

    // Get max position
    const maxPosition = await db.query(
      'SELECT MAX(position) as max_pos FROM columns WHERE board_id = $1',
      [id]
    );

    const position = (maxPosition.rows[0]?.max_pos || 0) + 1;

    // Create column
    const result = await db.query(
      'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING *',
      [id, name, position]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating column:', error);
    return Response.json(
      { error: 'Failed to create column' },
      { status: 500 }
    );
  }
}