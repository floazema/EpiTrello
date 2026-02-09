import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// PATCH - Update a column
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

    const { name } = await request.json();

    // Verify user owns the board containing this column
    const columnCheck = await query(
      `SELECT c.id FROM columns c
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

    const result = await query(
      'UPDATE columns SET name = COALESCE($1, name) WHERE id = $2 RETURNING *',
      [name, id]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Colonne mise à jour avec succès',
        column: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating column:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a column
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

    // Verify user owns the board containing this column
    const columnCheck = await query(
      `SELECT c.id FROM columns c
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

    await query('DELETE FROM columns WHERE id = $1', [id]);

    return NextResponse.json(
      {
        success: true,
        message: 'Colonne supprimée avec succès',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting column:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

