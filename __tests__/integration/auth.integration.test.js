import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { query, initializeDatabase } from '@/lib/db.js';
import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth.js';

describe('Authentication Integration', () => {
  let testUserId;

  beforeAll(async () => {
    // Initialize test database
    await initializeDatabase();
  });

  beforeEach(async () => {
    // Clear users table before each test
    await query('DELETE FROM users');
  });

  afterAll(async () => {
    // Clean up
    await query('DELETE FROM users');
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(userData.email);
      expect(data.user.name).toBe(userData.name);
      expect(data.message).toContain('créé');

      // Verify token is set in cookie
      const cookies = response.headers.get('set-cookie');
      expect(cookies).toContain('auth_token');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'duplicate@example.com',
        password: 'Pass123!',
      };

      // First registration
      await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      // Second registration with same email
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.message).toContain('email');
    });

    it('should reject password shorter than 6 characters', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Pass1',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('6');
    });

    it('should reject missing required fields', async () => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          // password missing
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should hash password before storing', async () => {
      const plainPassword = 'MySecurePassword123!';
      
      await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'hashtest@example.com',
          password: plainPassword,
        }),
      });

      // Retrieve user directly from DB
      const result = await query(
        'SELECT password FROM users WHERE email = $1',
        ['hashtest@example.com']
      );

      expect(result.rows[0].password).not.toBe(plainPassword);
      expect(result.rows[0].password.length).toBeGreaterThan(20); // bcrypt hashes are ~60 chars
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const hashedPassword = await hashPassword('TestPass123!');
      await query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
        ['test@example.com', hashedPassword, 'Test User']
      );
    });

    it('should successfully login with correct credentials', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPass123!',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('test@example.com');

      // Verify cookie is set
      const cookies = response.headers.get('set-cookie');
      expect(cookies).toContain('auth_token');
    });

    it('should reject login with incorrect password', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'TestPass123!',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject login with missing credentials', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          // password missing
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword('TestPass123!');
      await query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
        ['current@example.com', hashedPassword, 'Current User']
      );
    });

    it('should return current user when authenticated', async () => {
      // First login to get token
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'current@example.com',
          password: 'TestPass123!',
        }),
      });

      const cookies = loginResponse.headers.get('set-cookie');

      // Then fetch user info
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 'Cookie': cookies },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('current@example.com');
      expect(data.user.name).toBe('Current User');
    });

    it('should reject request without authentication', async () => {
      const response = await fetch('http://localhost:3000/api/auth/me');

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 'Cookie': 'auth_token=invalid.token.here' },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear auth token cookie', async () => {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();
      const cookies = response.headers.get('set-cookie');

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(cookies).toContain('auth_token=');
      expect(cookies).toContain('Max-Age=0');
    });
  });
});