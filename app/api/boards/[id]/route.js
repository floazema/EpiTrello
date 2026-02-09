import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// GET - Get a specific board
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    // Check user has access to this board
    const accessCheck = await query(
      'SELECT bm.role FROM board_members bm WHERE bm.board_id = $1 AND bm.user_id = $2',
      [id, decoded.userId]
    );

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board non trouvé ou accès refusé' },
        { status: 404 }
      );
    }

    const userRole = accessCheck.rows[0].role;

    const boardResult = await query(
      'SELECT id, name, description, color, created_at FROM boards WHERE id = $1',
      [id]
    );

    const board = boardResult.rows[0];

    // Get columns for this board
    const columnsResult = await query(
      'SELECT id, name, position FROM columns WHERE board_id = $1 ORDER BY position',
      [id]
    );

    // Get cards for all columns in this board with comment counts
    const cardsResult = await query(
      `SELECT c.*, COUNT(com.id) as comment_count
       FROM cards c
       JOIN columns col ON c.column_id = col.id
       LEFT JOIN comments com ON c.id = com.card_id
       WHERE col.board_id = $1
       GROUP BY c.id
       ORDER BY c.position`,
      [id]
    );

    // Organize cards by column
    const columns = columnsResult.rows.map(column => ({
      ...column,
      cards: cardsResult.rows.filter(card => card.column_id === column.id)
    }));

    return NextResponse.json(
      {
        success: true,
        board: {
          ...board,
          role: userRole,
          columns,
          userRole,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a board
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    // Verify user is owner
    const ownerCheck = await query(
      'SELECT bm.role FROM board_members bm WHERE bm.board_id = $1 AND bm.user_id = $2',
      [id, decoded.userId]
    );

    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].role !== 'owner') {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire peut supprimer le board' },
        { status: 403 }
      );
    }

    const result = await query(
      'DELETE FROM boards WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Board supprimé avec succès',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting board:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Update a board
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }

    const { name, description, color } = await request.json();

    // Verify user is owner
    const ownerCheck = await query(
      'SELECT bm.role FROM board_members bm WHERE bm.board_id = $1 AND bm.user_id = $2',
      [id, decoded.userId]
    );

    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].role !== 'owner') {
      return NextResponse.json(
        { success: false, message: 'Seul le propriétaire peut modifier le board' },
        { status: 403 }
      );
    }

    const result = await query(
      'UPDATE boards SET name = COALESCE($1, name), description = COALESCE($2, description), color = COALESCE($3, color), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, name, description, color, updated_at',
      [name, description, color, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Board mis à jour avec succès',
        board: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

