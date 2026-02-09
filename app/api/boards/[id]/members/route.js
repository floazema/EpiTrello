import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET /api/boards/[id]/members - Get all members of a board
export async function GET(request, { params }) {
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
        const boardId = parseInt(id);

        // Check if user has access to this board (owner or member)
        const accessCheck = await query(`
      SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
      UNION
      SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2
    `, [boardId, decoded.userId]);

        if (accessCheck.rows.length === 0) {
            return Response.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        // Get board owner
        const ownerResult = await query(`
      SELECT u.id, u.name, u.email, 'owner' as role
      FROM boards b
      JOIN users u ON b.owner_id = u.id
      WHERE b.id = $1
    `, [boardId]);

        // Get all members
        const membersResult = await query(`
      SELECT u.id, u.name, u.email, bm.role, bm.created_at as joined_at
      FROM board_members bm
      JOIN users u ON bm.user_id = u.id
      WHERE bm.board_id = $1
      ORDER BY bm.created_at
    `, [boardId]);

        // Get pending invitations
        const invitationsResult = await query(`
      SELECT id, invitee_email, status, created_at
      FROM board_invitations
      WHERE board_id = $1 AND status = 'pending'
      ORDER BY created_at DESC
    `, [boardId]);

        const owner = ownerResult.rows[0];
        const members = membersResult.rows;
        const pendingInvitations = invitationsResult.rows;

        return Response.json({
            success: true,
            owner,
            members,
            pendingInvitations
        });
    } catch (error) {
        console.error('Error fetching board members:', error);
        return Response.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// POST /api/boards/[id]/members - Invite a user to the board
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
        const boardId = parseInt(id);
        const { email } = await request.json();

        if (!email) {
            return Response.json({ success: false, message: 'Email is required' }, { status: 400 });
        }

        // Check if user is owner of this board
        const boardResult = await query('SELECT * FROM boards WHERE id = $1 AND owner_id = $2', [boardId, decoded.userId]);
        if (boardResult.rows.length === 0) {
            return Response.json({ success: false, message: 'Only board owner can invite members' }, { status: 403 });
        }

        // Check if the email is the owner's email
        const ownerCheck = await query('SELECT email FROM users WHERE id = $1', [decoded.userId]);
        if (ownerCheck.rows[0].email.toLowerCase() === email.toLowerCase()) {
            return Response.json({ success: false, message: 'You cannot invite yourself' }, { status: 400 });
        }

        // Check if user is already a member
        const userResult = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (userResult.rows.length > 0) {
            const existingMember = await query(
                'SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2',
                [boardId, userResult.rows[0].id]
            );
            if (existingMember.rows.length > 0) {
                return Response.json({ success: false, message: 'User is already a member' }, { status: 400 });
            }
        }

        // Check if there's already a pending invitation
        const existingInvite = await query(
            'SELECT 1 FROM board_invitations WHERE board_id = $1 AND invitee_email = $2 AND status = $3',
            [boardId, email.toLowerCase(), 'pending']
        );
        if (existingInvite.rows.length > 0) {
            return Response.json({ success: false, message: 'Invitation already sent to this email' }, { status: 400 });
        }

        // Create invitation
        const inviteeId = userResult.rows.length > 0 ? userResult.rows[0].id : null;
        const result = await query(
            `INSERT INTO board_invitations (board_id, inviter_id, invitee_email, invitee_id, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
            [boardId, decoded.userId, email.toLowerCase(), inviteeId]
        );

        return Response.json({
            success: true,
            message: 'Invitation sent',
            invitation: result.rows[0]
        });
    } catch (error) {
        console.error('Error sending invitation:', error);
        return Response.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// DELETE /api/boards/[id]/members - Remove a member or cancel invitation
export async function DELETE(request, { params }) {
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
        const boardId = parseInt(id);
        const { searchParams } = new URL(request.url);
        const memberId = searchParams.get('memberId');
        const invitationId = searchParams.get('invitationId');

        // Check if user is owner of this board
        const boardResult = await query('SELECT * FROM boards WHERE id = $1 AND owner_id = $2', [boardId, decoded.userId]);
        if (boardResult.rows.length === 0) {
            return Response.json({ success: false, message: 'Only board owner can remove members' }, { status: 403 });
        }

        if (memberId) {
            // Remove member
            await query('DELETE FROM board_members WHERE board_id = $1 AND user_id = $2', [boardId, parseInt(memberId)]);
            return Response.json({ success: true, message: 'Member removed' });
        }

        if (invitationId) {
            // Cancel invitation
            await query('DELETE FROM board_invitations WHERE id = $1 AND board_id = $2', [parseInt(invitationId), boardId]);
            return Response.json({ success: true, message: 'Invitation cancelled' });
        }

        return Response.json({ success: false, message: 'memberId or invitationId required' }, { status: 400 });
    } catch (error) {
        console.error('Error removing member:', error);
        return Response.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
