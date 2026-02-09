import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Create a new card
export async function POST(request) {
  try {
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

    const { column_id, title, description, priority, due_date, tags, color } = await request.json();

    if (!column_id || !title || title.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Column ID et titre requis' },
        { status: 400 }
      );
    }

    // Verify user owns the board containing this column
    const columnCheck = await query(
      `SELECT c.id FROM columns c 
       JOIN boards b ON c.board_id = b.id 
       WHERE c.id = $1 AND b.owner_id = $2`,
      [column_id, decoded.userId]
    );

    if (columnCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Column non trouvée' },
        { status: 404 }
      );
    }

    // Get the next position
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM cards WHERE column_id = $1',
      [column_id]
    );

    const nextPosition = positionResult.rows[0].next_position;

    const result = await query(
      'INSERT INTO cards (column_id, title, description, priority, due_date, tags, color, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        column_id, 
        title.trim(), 
        description || '', 
        priority || 'medium',
        due_date || null,
        tags || null,
        color || null, 
        nextPosition
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Card créée avec succès',
        card: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

