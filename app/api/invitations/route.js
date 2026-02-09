import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// POST - Send a board invitation
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

        const { boardId, inviteeEmail } = await request.json();

        if (!boardId || !inviteeEmail) {
            return NextResponse.json(
                { success: false, message: 'Board ID et email requis' },
                { status: 400 }
            );
        }

        // Verify user is board owner
        const boardCheck = await query(
            'SELECT bm.role FROM board_members bm WHERE bm.board_id = $1 AND bm.user_id = $2',
            [boardId, decoded.userId]
        );

        if (boardCheck.rows.length === 0 || boardCheck.rows[0].role !== 'owner') {
            return NextResponse.json(
                { success: false, message: 'Seul le propriétaire peut inviter des membres' },
                { status: 403 }
            );
        }

        // Check if invitee is a registered user
        const userCheck = await query(
            'SELECT id, email, name FROM users WHERE email = $1',
            [inviteeEmail.toLowerCase()]
        );

        if (userCheck.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        const inviteeUser = userCheck.rows[0];

        // Check if user is already a member
        const memberCheck = await query(
            'SELECT 1 FROM board_members WHERE board_id = $1 AND user_id = $2',
            [boardId, inviteeUser.id]
        );

        if (memberCheck.rows.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Utilisateur déjà membre de ce board' },
                { status: 400 }
            );
        }

        // Check for existing pending invitation
        const existingInvite = await query(
            'SELECT id FROM invitations WHERE board_id = $1 AND invitee_email = $2 AND status = $3',
            [boardId, inviteeEmail.toLowerCase(), 'pending']
        );

        if (existingInvite.rows.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Invitation déjà envoyée' },
                { status: 400 }
            );
        }

        // Create invitation
        const result = await query(
            'INSERT INTO invitations (board_id, inviter_id, invitee_email, status) VALUES ($1, $2, $3, $4) RETURNING id, board_id, inviter_id, invitee_email, created_at',
            [boardId, decoded.userId, inviteeEmail.toLowerCase(), 'pending']
        );

        return NextResponse.json(
            {
                success: true,
                message: 'Invitation envoyée avec succès',
                invitation: result.rows[0],
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating invitation:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// GET - List current user's pending invitations
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

        // Get pending invitations with board and inviter details
        const result = await query(
            `SELECT 
        i.id, 
        i.board_id, 
        i.inviter_id,
        i.created_at,
        b.name as board_name,
        b.color as board_color,
        u.name as inviter_name,
        u.email as inviter_email
      FROM invitations i
      JOIN boards b ON i.board_id = b.id
      JOIN users u ON i.inviter_id = u.id
      WHERE i.invitee_email = $1 AND i.status = $2
      ORDER BY i.created_at DESC`,
            [userEmail, 'pending']
        );

        return NextResponse.json(
            {
                success: true,
                invitations: result.rows,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching invitations:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
