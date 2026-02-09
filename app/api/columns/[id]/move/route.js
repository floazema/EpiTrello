import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Move a column to a different position
export async function POST(request, { params }) {
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

    const { position } = await request.json();

    if (position === undefined || position === null) {
      return NextResponse.json(
        { success: false, message: 'Position requise' },
        { status: 400 }
      );
    }

    // Verify user owns the board containing this column
    const columnCheck = await query(
      `SELECT c.id, c.board_id, c.position as old_position FROM columns c
       JOIN boards b ON c.board_id = b.id
       WHERE c.id = $1 AND b.owner_id = $2`,
      [id, decoded.userId]
    );

    if (columnCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Colonne non trouvée' },
        { status: 404 }
      );
    }

    const { board_id, old_position } = columnCheck.rows[0];

    // Update positions of other columns
    if (position > old_position) {
      // Moving right: decrease position of columns in between
      await query(
        `UPDATE columns 
         SET position = position - 1 
         WHERE board_id = $1 AND position > $2 AND position <= $3`,
        [board_id, old_position, position]
      );
    } else if (position < old_position) {
      // Moving left: increase position of columns in between
      await query(
        `UPDATE columns 
         SET position = position + 1 
         WHERE board_id = $1 AND position >= $2 AND position < $3`,
        [board_id, position, old_position]
      );
    }

    // Update the column's position
    await query(
      'UPDATE columns SET position = $1 WHERE id = $2',
      [position, id]
    );

    // Get updated columns
    const updatedColumns = await query(
      'SELECT * FROM columns WHERE board_id = $1 ORDER BY position',
      [board_id]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Colonne déplacée avec succès',
        columns: updatedColumns.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error moving column:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

