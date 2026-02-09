import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// GET - List board members
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

        // Verify user has access to board
        const accessCheck = await query(
            'SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2',
            [id, decoded.userId]
        );

        if (accessCheck.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Accès refusé' },
                { status: 403 }
            );
        }

        // Get board members with user details
        const result = await query(
            `SELECT 
        bm.id,
        bm.role,
        bm.joined_at,
        u.id as user_id,
        u.name,
        u.email
      FROM board_members bm
      JOIN users u ON bm.user_id = u.id
      WHERE bm.board_id = $1
      ORDER BY bm.role DESC, bm.joined_at ASC`,
            [id]
        );

        return NextResponse.json(
            {
                success: true,
                members: result.rows,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching board members:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
