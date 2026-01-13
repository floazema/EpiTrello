// lib/auth.js
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function verifyAuth(request) {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // If no header token, try cookies
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('token')?.value;
    }

    if (!token) {
      return null;
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password, hash) {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hash);
}