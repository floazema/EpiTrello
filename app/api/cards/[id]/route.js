import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// PATCH - Update a card
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

    const body = await request.json();
    const { title, description, priority, due_date, tags, color } = body;
    const assigned_to = body.assigned_to;

    // Verify user has access to the board containing this card
    const cardCheck = await query(
      `SELECT ca.id FROM cards ca
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

    const result = await query(
      `UPDATE cards SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        priority = COALESCE($3, priority),
        due_date = CASE WHEN $4::text IS NULL THEN due_date ELSE $4::date END,
        tags = CASE WHEN $5::text[] IS NULL THEN tags ELSE $5::text[] END,
        color = COALESCE($6, color),
        assigned_to = CASE WHEN $7::text = '__unset__' THEN NULL ELSE COALESCE($7::integer, assigned_to) END,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $8 RETURNING *`,
      [title, description, priority, due_date, tags, color, assigned_to === null ? '__unset__' : (assigned_to || null), id]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Card mise à jour avec succès',
        card: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a card
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

    // Verify user has access to the board containing this card
    const cardCheck = await query(
      `SELECT ca.id FROM cards ca
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

    await query('DELETE FROM cards WHERE id = $1', [id]);

    return NextResponse.json(
      {
        success: true,
        message: 'Card supprimée avec succès',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

