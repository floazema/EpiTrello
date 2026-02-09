import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST /api/invitations/[id]/accept - Accept an invitation
export async function POST(request, { params }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return Response.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const { id } = await params;
        const invitationId = parseInt(id);

        // Get user email
        const userResult = await query('SELECT email FROM users WHERE id = $1', [decoded.userId]);
        if (userResult.rows.length === 0) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const userEmail = userResult.rows[0].email;

        // Check if invitation exists and belongs to this user
        const invitationResult = await query(
            'SELECT * FROM board_invitations WHERE id = $1 AND invitee_email = $2 AND status = $3',
            [invitationId, userEmail, 'pending']
        );

        if (invitationResult.rows.length === 0) {
            return Response.json({ success: false, message: 'Invitation not found' }, { status: 404 });
        }

        const invitation = invitationResult.rows[0];

        // Update invitation status
        await query(
            'UPDATE board_invitations SET status = $1, invitee_id = $2, updated_at = NOW() WHERE id = $3',
            ['accepted', decoded.userId, invitationId]
        );

        // Add user as board member
        await query(
            'INSERT INTO board_members (board_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (board_id, user_id) DO NOTHING',
            [invitation.board_id, decoded.userId, 'member']
        );

        return Response.json({ success: true, message: 'Invitation accepted' });
    } catch (error) {
        console.error('Error accepting invitation:', error);
        return Response.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
