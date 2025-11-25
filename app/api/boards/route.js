import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// GET - List all boards for current user
export async function GET(request) {
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

    const result = await query(
      'SELECT id, name, description, color, created_at FROM boards WHERE owner_id = $1 ORDER BY created_at DESC',
      [decoded.userId]
    );

    return NextResponse.json(
      {
        success: true,
        boards: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Create a new board
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

    const { name, description, color } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Le nom du board est requis' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO boards (name, description, color, owner_id) VALUES ($1, $2, $3, $4) RETURNING id, name, description, color, created_at',
      [name.trim(), description || '', color || 'zinc', decoded.userId]
    );

    const board = result.rows[0];

    // Create default columns
    const defaultColumns = ['To Do', 'In Progress', 'Done'];
    for (let i = 0; i < defaultColumns.length; i++) {
      await query(
        'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3)',
        [board.id, defaultColumns[i], i]
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Board créé avec succès',
        board: board,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

