import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Accept an invitation
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

        // Get user email
        const userResult = await query(
            'SELECT email FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        const userEmail = userResult.rows[0].email;

        // Check invitation exists and is pending
        const invitationResult = await query(
            'SELECT * FROM invitations WHERE id = $1 AND invitee_email = $2 AND status = $3',
            [id, userEmail, 'pending']
        );

        if (invitationResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invitation non trouvée' },
                { status: 404 }
            );
        }

        const invitation = invitationResult.rows[0];

        // Update invitation status
        await query(
            'UPDATE invitations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['accepted', id]
        );

        // Add user to board_members
        await query(
            'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3)',
            [invitation.board_id, decoded.userId, 'member']
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Invitation acceptée avec succès',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
