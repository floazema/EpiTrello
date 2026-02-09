import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Reject an invitation
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

        // Update invitation status
        await query(
            'UPDATE invitations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['rejected', id]
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Invitation refusée',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error rejecting invitation:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
