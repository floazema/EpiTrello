import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// GET - Get all comments for a card
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

        // Verify user has access to the board containing this card
        const accessCheck = await query(
            `SELECT ca.id FROM cards ca
       JOIN columns c ON ca.column_id = c.id
       JOIN boards b ON c.board_id = b.id
       JOIN board_members bm ON b.id = bm.board_id
       WHERE ca.id = $1 AND bm.user_id = $2`,
            [id, decoded.userId]
        );

        if (accessCheck.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Card non trouvée ou accès refusé' },
                { status: 404 }
            );
        }

        // Get comments with user details
        const result = await query(
            `SELECT 
        com.id,
        com.content,
        com.created_at,
        com.updated_at,
        com.user_id,
        u.name as user_name,
        u.email as user_email
      FROM comments com
      JOIN users u ON com.user_id = u.id
      WHERE com.card_id = $1
      ORDER BY com.created_at ASC`,
            [id]
        );

        return NextResponse.json(
            {
                success: true,
                comments: result.rows,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// POST - Create a new comment
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

        const { content } = await request.json();

        if (!content || content.trim() === '') {
            return NextResponse.json(
                { success: false, message: 'Le contenu du commentaire est requis' },
                { status: 400 }
            );
        }

        // Verify user has access to the board containing this card
        const accessCheck = await query(
            `SELECT ca.id FROM cards ca
       JOIN columns c ON ca.column_id = c.id
       JOIN boards b ON c.board_id = b.id
       JOIN board_members bm ON b.id = bm.board_id
       WHERE ca.id = $1 AND bm.user_id = $2`,
            [id, decoded.userId]
        );

        if (accessCheck.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Card non trouvée ou accès refusé' },
                { status: 404 }
            );
        }

        // Create comment
        const result = await query(
            'INSERT INTO comments (card_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [id, decoded.userId, content.trim()]
        );

        // Get user details for response
        const userResult = await query(
            'SELECT name, email FROM users WHERE id = $1',
            [decoded.userId]
        );

        const comment = {
            ...result.rows[0],
            user_name: userResult.rows[0].name,
            user_email: userResult.rows[0].email,
        };

        return NextResponse.json(
            {
                success: true,
                message: 'Commentaire ajouté avec succès',
                comment,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
