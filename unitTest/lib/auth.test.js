// import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth.js'

// describe('auth helpers', () => {
//   it('hashes and compares passwords correctly', async () => {
//     const pwd = 'S3cureP@ss!'
//     const hash = await hashPassword(pwd)
//     expect(hash).not.toBe(pwd)
//     expect(await comparePassword(pwd, hash)).toBe(true)
//     expect(await comparePassword('wrong', hash)).toBe(false)
//   })

//   it('generates and verifies JWT tokens', () => {
//     const payload = { id: 123, email: 'test@example.com' }
//     const token = generateToken(payload)
//     const decoded = verifyToken(token)
//     expect(decoded.id).toBe(123)
//     expect(decoded.email).toBe('test@example.com')
//   })

//   it('returns null for invalid token', () => {
//     expect(verifyToken('not.a.valid.token')).toBeNull()
//   })
// })

// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// // Mock environment variables for JWT
// process.env.JWT_SECRET = 'test_secret';

// describe('Authentication Tests', () => {
//   let password = 'mySecurePassword';
//   let hashedPassword;
//   let token;

//   // Test Password Hashing
//   it('should hash the password correctly', async () => {
//     hashedPassword = await bcrypt.hash(password, 10);
//     expect(hashedPassword).not.toEqual(password);
//     expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
//   });

//   // Test Token Generation
//   it('should generate a token', () => {
//     token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     expect(token).toBeDefined();
//     expect(typeof token).toBe('string');
//     expect(token.split('.').length).toBe(3); // Check token structure
//   });

//   // Test Token Verification
//   it('should verify a valid token', () => {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     expect(decoded.userId).toBe(1);
//   });

//   it('should fail to verify an invalid token', () => {
//     expect(() => {
//       jwt.verify('invalidToken', process.env.JWT_SECRET);
//     }).toThrow();
//   });
// });

import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth';

describe('hashPassword', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'SecurePass123!';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are ~60 chars
  });

  it('should create different hashes for same password', async () => {
    const password = 'Test123!';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2); // Different salts
  });

  it('should handle minimum length passwords', async () => {
    const password = '123456'; // Minimum 6 chars
    const hash = await hashPassword(password);
    expect(hash).toBeDefined();
  });

  it('should reject null or undefined passwords', async () => {
    await expect(hashPassword(null)).rejects.toThrow();
    await expect(hashPassword(undefined)).rejects.toThrow();
  });
});

describe('comparePassword', () => {
  it('should return true for correct password', async () => {
    const password = 'MyPassword123!';
    const hash = await hashPassword(password);
    const isValid = await comparePassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password', async () => {
    const password = 'MyPassword123!';
    const hash = await hashPassword(password);
    const isValid = await comparePassword('WrongPassword', hash);
    expect(isValid).toBe(false);
  });

  it('should be case-sensitive', async () => {
    const password = 'MyPassword123!';
    const hash = await hashPassword(password);
    const isValid = await comparePassword('mypassword123!', hash);
    expect(isValid).toBe(false);
  });
});

describe('generateToken', () => {
  it('should generate a valid JWT token', () => {
    const payload = { userId: 1, email: 'test@example.com' };
    const token = generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
  });

  it('should encode payload in token', () => {
    const payload = { userId: 123, email: 'user@test.com' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(123);
    expect(decoded.email).toBe('user@test.com');
  });

  it('should set expiration to 7 days', () => {
    const payload = { userId: 1 };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.exp).toBeDefined();
    // Approximately 7 days from now
    const expiresIn = (decoded.exp - decoded.iat) / 86400; // seconds to days
    expect(expiresIn).toBeGreaterThan(6.9);
    expect(expiresIn).toBeLessThan(7.1);
  });

  it('should handle missing payload', () => {
    const token = generateToken({});
    const decoded = verifyToken(token);
    expect(decoded).toBeDefined();
  });
});

describe('verifyToken', () => {
  it('should verify valid token', () => {
    const payload = { userId: 1, email: 'test@example.com' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(1);
    expect(decoded.email).toBe('test@example.com');
  });

  it('should return null for expired token', () => {
    // Use old token with expiration in past
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTUwMDAwMDAwMCwiZXhwIjoxNTAwMDAwMDAxfQ.test';
    const result = verifyToken(expiredToken);
    expect(result).toBeNull();
  });

  it('should return null for tampered token', () => {
    const payload = { userId: 1 };
    const token = generateToken(payload);
    const tamperedToken = token.slice(0, -1) + 'X'; // Modify signature
    const result = verifyToken(tamperedToken);
    expect(result).toBeNull();
  });

  it('should return null for invalid token format', () => {
    expect(verifyToken('not.a.token')).toBeNull();
    expect(verifyToken('single')).toBeNull();
    expect(verifyToken('')).toBeNull();
  });
});