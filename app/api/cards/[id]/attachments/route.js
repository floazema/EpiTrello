import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// GET - List attachments for a card
export async function GET(request, { params }) {
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

        // Verify user has access
        const accessCheck = await query(
            `SELECT 1 FROM cards ca
       JOIN columns c ON ca.column_id = c.id
       JOIN board_members bm ON c.board_id = bm.board_id
       WHERE ca.id = $1 AND bm.user_id = $2`,
            [id, decoded.userId]
        );

        if (accessCheck.rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
        }

        const result = await query(
            `SELECT a.*, u.name as user_name
       FROM attachments a
       JOIN users u ON a.user_id = u.id
       WHERE a.card_id = $1
       ORDER BY a.created_at DESC`,
            [id]
        );

        return NextResponse.json({ success: true, attachments: result.rows }, { status: 200 });
    } catch (error) {
        console.error('Error fetching attachments:', error);
        return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
    }
}

// POST - Upload an attachment
export async function POST(request, { params }) {
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

        // Verify user has access
        const accessCheck = await query(
            `SELECT 1 FROM cards ca
       JOIN columns c ON ca.column_id = c.id
       JOIN board_members bm ON c.board_id = bm.board_id
       WHERE ca.id = $1 AND bm.user_id = $2`,
            [id, decoded.userId]
        );

        if (accessCheck.rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Accès refusé' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ success: false, message: 'Aucun fichier' }, { status: 400 });
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ success: false, message: 'Fichier trop volumineux (max 10MB)' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create upload dir
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const ext = path.extname(file.name);
        const filename = `${randomUUID()}${ext}`;
        const filepath = path.join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Save to DB
        const result = await query(
            `INSERT INTO attachments (card_id, user_id, filename, original_name, size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, decoded.userId, filename, file.name, file.size, file.type || 'application/octet-stream']
        );

        const attachment = result.rows[0];
        attachment.user_name = decoded.name || 'You';

        return NextResponse.json({ success: true, attachment }, { status: 201 });
    } catch (error) {
        console.error('Error uploading attachment:', error);
        return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 });
    }
}
