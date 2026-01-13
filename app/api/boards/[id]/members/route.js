// app/api/boards/[id]/members/route.js
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

    // Get all members with user info
    const members = await db.query(
      `SELECT bm.*, u.email, u.name FROM board_members bm
       JOIN users u ON bm.user_id = u.id
       WHERE bm.board_id = $1
       ORDER BY bm.created_at ASC`,
      [id]
    );

    return Response.json(members.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    return Response.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { email, role = 'member' } = await request.json();

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
      return Response.json({ error: 'Only board owner can add members' }, { status: 403 });
    }

    // Find user by email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const newUser = userResult.rows[0];

    // Check if already member
    const existingMember = await db.query(
      'SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2',
      [id, newUser.id]
    );

    if (existingMember.rows.length > 0) {
      return Response.json(
        { error: 'User is already a member' },
        { status: 400 }
      );
    }

    // Add member
    const result = await db.query(
      'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
      [id, newUser.id, role]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return Response.json(
      { error: 'Failed to add member' },
      { status: 500 }
    );
  }
}