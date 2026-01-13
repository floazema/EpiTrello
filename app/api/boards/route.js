// app/api/boards/route.js
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get boards where user is a member
    const boards = await db.query(
      `SELECT DISTINCT b.* FROM boards b
       JOIN board_members bm ON b.id = bm.board_id
       WHERE bm.user_id = $1
       ORDER BY b.created_at DESC`,
      [user.id]
    );

    return Response.json(boards.rows);
  } catch (error) {
    console.error('Error fetching boards:', error);
    return Response.json(
      { error: 'Failed to fetch boards' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return Response.json(
        { error: 'Board name is required' },
        { status: 400 }
      );
    }

    // Create board
    const boardResult = await db.query(
      'INSERT INTO boards (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', user.id]
    );

    const board = boardResult.rows[0];

    // Add creator as member with owner role
    await db.query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)',
      [board.id, user.id, 'owner']
    );

    return Response.json(board, { status: 201 });
  } catch (error) {
    console.error('Error creating board:', error);
    return Response.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}