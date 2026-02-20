import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Move a card to a different column or position
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

    const { column_id, position } = await request.json();

    if (!column_id || position === undefined) {
      return NextResponse.json(
        { success: false, message: 'Column ID et position requis' },
        { status: 400 }
      );
    }

    // Verify user has access to the board containing this card
    const cardCheck = await query(
      `SELECT ca.id, ca.column_id as old_column_id FROM cards ca
       JOIN columns c ON ca.column_id = c.id
       JOIN boards b ON c.board_id = b.id
       JOIN board_members bm ON b.id = bm.board_id
       WHERE ca.id = $1 AND bm.user_id = $2`,
      [id, decoded.userId]
    );

    if (cardCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Card non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    const oldColumnId = cardCheck.rows[0].old_column_id;

    // Verify target column belongs to a board user has access to
    const columnCheck = await query(
      `SELECT c.id FROM columns c
       JOIN boards b ON c.board_id = b.id
       JOIN board_members bm ON b.id = bm.board_id
       WHERE c.id = $1 AND bm.user_id = $2`,
      [column_id, decoded.userId]
    );

    if (columnCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Column cible non trouvée ou accès refusé' },
        { status: 404 }
      );
    }

    // Update card position and column
    await query(
      'UPDATE cards SET column_id = $1, position = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [column_id, position, id]
    );

    // Reorder cards in old column if it changed
    if (oldColumnId !== column_id) {
      await query(
        `UPDATE cards SET position = position - 1 
         WHERE column_id = $1 AND position > (
           SELECT position FROM cards WHERE id = $2
         )`,
        [oldColumnId, id]
      );
    }

    const result = await query('SELECT * FROM cards WHERE id = $1', [id]);

    return NextResponse.json(
      {
        success: true,
        message: 'Card déplacée avec succès',
        card: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error moving card:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

