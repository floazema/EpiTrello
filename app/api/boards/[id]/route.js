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

    const boardResult = await query(
      'SELECT id, name, description, color, created_at FROM boards WHERE id = $1 AND owner_id = $2',
      [id, decoded.userId]
    );

    if (boardResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Board non trouvé' },
        { status: 404 }
      );
    }

    const board = boardResult.rows[0];

    // Get columns for this board
    const columnsResult = await query(
      'SELECT id, name, position FROM columns WHERE board_id = $1 ORDER BY position',
      [id]
    );

    return NextResponse.json(
      {
        success: true,
        board: {
          ...board,
          columns: columnsResult.rows,
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

    const result = await query(
      'DELETE FROM boards WHERE id = $1 AND owner_id = $2 RETURNING id',
      [id, decoded.userId]
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

    const result = await query(
      'UPDATE boards SET name = COALESCE($1, name), description = COALESCE($2, description), color = COALESCE($3, color), updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND owner_id = $5 RETURNING id, name, description, color, updated_at',
      [name, description, color, id, decoded.userId]
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

