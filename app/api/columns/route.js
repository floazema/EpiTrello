import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Create a new column
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

    const { board_id, name } = await request.json();

    if (!board_id || !name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Board ID et nom requis' },
        { status: 400 }
      );
    }

    // Verify user has access to the board
    const boardCheck = await query(
      'SELECT b.id FROM boards b JOIN board_members bm ON b.id = bm.board_id WHERE b.id = $1 AND bm.user_id = $2',
      [board_id, decoded.userId]
    );

    if (boardCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board non trouvé ou accès refusé' },
        { status: 404 }
      );
    }

    // Get the next position
    const positionResult = await query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_position FROM columns WHERE board_id = $1',
      [board_id]
    );

    const nextPosition = positionResult.rows[0].next_position;

    const result = await query(
      'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING *',
      [board_id, name.trim(), nextPosition]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Colonne créée avec succès',
        column: { ...result.rows[0], cards: [] },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating column:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

