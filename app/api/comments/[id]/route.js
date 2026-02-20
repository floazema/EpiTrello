import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

// DELETE - Delete a comment
export async function DELETE(request, { params }) {
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

        // Verify user is the comment author
        const commentCheck = await query(
            'SELECT id, user_id FROM comments WHERE id = $1',
            [id]
        );

        if (commentCheck.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Commentaire non trouvé' },
                { status: 404 }
            );
        }

        if (commentCheck.rows[0].user_id !== decoded.userId) {
            return NextResponse.json(
                { success: false, message: 'Seul l\'auteur peut supprimer ce commentaire' },
                { status: 403 }
            );
        }

        // Delete comment
        await query('DELETE FROM comments WHERE id = $1', [id]);

        return NextResponse.json(
            {
                success: true,
                message: 'Commentaire supprimé avec succès',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { success: false, message: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
