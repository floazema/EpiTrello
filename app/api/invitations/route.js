import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/invitations - Get pending invitations for current user
export async function GET() {
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

        // Get pending invitations for this user (by email)
        const userResult = await query('SELECT email FROM users WHERE id = $1', [decoded.userId]);
        if (userResult.rows.length === 0) {
            return Response.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const userEmail = userResult.rows[0].email;

        const result = await query(`
      SELECT 
        bi.id,
        bi.board_id,
        bi.status,
        bi.created_at,
        b.name as board_name,
        u.name as inviter_name,
        u.email as inviter_email
      FROM board_invitations bi
      JOIN boards b ON bi.board_id = b.id
      JOIN users u ON bi.inviter_id = u.id
      WHERE bi.invitee_email = $1 AND bi.status = 'pending'
      ORDER BY bi.created_at DESC
    `, [userEmail]);

        return Response.json({ success: true, invitations: result.rows });
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return Response.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
