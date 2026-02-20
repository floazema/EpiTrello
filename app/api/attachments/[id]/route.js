import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

// DELETE - Delete an attachment
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, message: 'Token invalide' }, { status: 401 });
        }

        // Verify user has access to the board containing this attachment
        const attachmentCheck = await query(
            `SELECT a.filename FROM attachments a
       JOIN cards ca ON a.card_id = ca.id
       JOIN columns c ON ca.column_id = c.id
       JOIN board_members bm ON c.board_id = bm.board_id
       WHERE a.id = $1 AND bm.user_id = $2`,
            [id, decoded.userId]
        );

        if (attachmentCheck.rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Pièce jointe non trouvée ou accès refusé' }, { status: 404 });
        }

        const filename = attachmentCheck.rows[0].filename;

        // Delete from DB
        await query('DELETE FROM attachments WHERE id = $1', [id]);

        // Delete file from disk
        try {
            const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
            await unlink(filepath);
        } catch (err) {
            // File may not exist, that's ok
            console.warn('Could not delete file:', err.message);
        }

        return NextResponse.json({ success: true, message: 'Pièce jointe supprimée' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting attachment:', error);
        return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
    }
}
