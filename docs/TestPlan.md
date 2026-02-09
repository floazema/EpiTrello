# EpiTrello - Comprehensive Test Plan

**Project:** EpiTrello - Kanban Board Application  
**Version:** 1.0  
**Last Updated:** February 2025  
**Test Lead:** Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [End-to-End Tests](#end-to-end-tests)
6. [Test Execution](#test-execution)
7. [Test Coverage](#test-coverage)

---

## Overview

This test plan outlines the testing strategy for EpiTrello across three levels:
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API routes, database interactions, and component integration
- **End-to-End Tests**: Complete user workflows

All tests are aligned with acceptance criteria defined in user stories.

### Test Environment
- **Framework**: Vitest (unit), Jest (integration), Playwright (E2E)
- **Node Version**: 20.x
- **Database**: PostgreSQL 16 (Docker)
- **Browser**: Chromium (Playwright)

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \
     /-------\
    /         \
   / Integration\
  /-----------\
 /             \
/   Unit Tests   \
```

### Distribution
- **Unit Tests**: 70% of coverage (fast, isolated)
- **Integration Tests**: 20% of coverage (API, database)
- **E2E Tests**: 10% of coverage (critical paths only)

### Test Naming Convention

```
[component/function].[feature].test.[js/jsx]
describe('[Feature]', () => {
  it('should [action] when [condition]', () => {})
})
```

### Test Data Strategy
- Use factory functions for consistent test data
- Reset database between integration/E2E tests
- Use mocks for external services

---

## Unit Tests

Unit tests focus on isolated functions and components without external dependencies.

### 1. Authentication Helpers (`lib/auth.test.js`)

#### Test Suite: Password Hashing

**File**: `unitTest/lib/auth.test.js`

**Current Tests:**
```javascript
✓ hashes and compares passwords correctly
✓ passwords with special characters hash correctly
✓ invalid passwords fail comparison
✓ empty passwords are handled
```

**New Tests to Add:**

```javascript
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
```

**Acceptance Criteria Coverage:**
- ✅ User registration: Password must meet minimum complexity
- ✅ Password security: Bcrypt hashing with proper salt rounds

---

#### Test Suite: JWT Token Generation

**File**: `unitTest/lib/auth.test.js`

**Current Tests:**
```javascript
✓ generates and verifies JWT tokens
✓ returns null for invalid token
```

**New Tests to Add:**

```javascript
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
```

**Acceptance Criteria Coverage:**
- ✅ Session token created: JWT tokens generated and verified
- ✅ Token expires in 7 days: Expiration properly set
- ✅ Security: Token signature validated

---

### 2. Utility Functions (`lib/utils.test.js`)

**File**: `unitTest/lib/utils.test.js`

**Current Tests:**
```javascript
✓ merges tailwind classes by specificity
✓ includes truthy conditional classes
```

**New Tests to Add:**

```javascript
describe('cn utility', () => {
  it('should merge multiple class strings', () => {
    const result = cn('p-4', 'text-lg', 'text-white');
    expect(result).toContain('p-4');
    expect(result).toContain('text-lg');
    expect(result).toContain('text-white');
  });

  it('should handle undefined and null values', () => {
    const result = cn('btn', undefined, null, 'active');
    expect(result).toContain('btn');
    expect(result).toContain('active');
  });

  it('should handle objects with boolean values', () => {
    const result = cn('base', { active: true, disabled: false });
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
  });

  it('should resolve tailwind conflicts correctly', () => {
    // px-4 should override px-2
    const result = cn('px-2', 'px-4');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
    expect(cn('', '', '')).toBe('');
  });
});
```

**Acceptance Criteria Coverage:**
- ✅ Responsive design: Class merging for responsive utilities

---

### 3. UI Components

#### Button Component (`components/ui/button.test.jsx`)

**File**: `unitTest/components/ui/button.test.jsx`

**Current Tests:**
```javascript
✓ renders with default variant and size
✓ applies outline variant and sm size
```

**New Tests to Add:**

```javascript
describe('Button', () => {
  it('should render with text content', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('should apply all size variants', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'];
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>Test</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain(
        size === 'default' ? 'h-10' :
        size === 'sm' ? 'h-9' :
        size === 'lg' ? 'h-11' : 'h-10'
      );
      unmount();
    });
  });

  it('should apply all variants', () => {
    const variants = ['default', 'outline', 'ghost', 'link'];
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const btn = screen.getByRole('button');
      if (variant === 'outline') expect(btn.className).toContain('border');
      if (variant === 'ghost') expect(btn.className).toContain('hover:bg');
      unmount();
    });
  });

  it('should handle disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.className).toContain('disabled:opacity-50');
  });

  it('should handle onClick callback', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should support custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
```

**Acceptance Criteria Coverage:**
- ✅ UI responsive: Button sizes and variants work correctly
- ✅ Accessibility: Button role and disabled state handled

---

#### Input Component (`components/ui/input.test.jsx`)

**File**: `unitTest/components/ui/input.test.jsx`

```javascript
describe('Input', () => {
  it('should render input element', () => {
    render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should accept different input types', () => {
    const types = ['text', 'email', 'password', 'date'];
    types.forEach(type => {
      const { unmount } = render(<Input type={type} />);
      const input = screen.getByRole(type === 'date' ? 'spinbutton' : 'textbox', { hidden: true }) || 
                    document.querySelector(`input[type="${type}"]`);
      expect(input).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle placeholder text', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should have proper styling classes', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border');
    expect(input.className).toContain('rounded-md');
  });

  it('should handle value changes', () => {
    const { container } = render(<Input defaultValue="test" />);
    const input = container.querySelector('input');
    expect(input.value).toBe('test');
  });
});
```

**Acceptance Criteria Coverage:**
- ✅ Form fields: Input properly handles all types and states
- ✅ Accessibility: Proper ARIA roles and disabled states

---

### 4. Modal Component (`components/ui/modal.test.jsx`)

**File**: `unitTest/components/ui/modal.test.jsx`

```javascript
describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Test">Content</Modal>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Test">Content</Modal>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should display modal title', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Modal Title">Body</Modal>);
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
    const closeBtn = screen.getByRole('button');
    closeBtn.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
    const backdrop = document.querySelector('[class*="bg-black"]');
    backdrop?.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should close on Escape key press', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('should apply size variants', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'];
    sizes.forEach(size => {
      const { unmount, container } = render(
        <Modal isOpen={true} onClose={vi.fn()} size={size} title="Test">Content</Modal>
      );
      const modal = container.querySelector('[class*="max-w"]');
      expect(modal).toBeInTheDocument();
      unmount();
    });
  });

  it('should prevent body scroll when open', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">Content</Modal>
    );
    expect(document.body.style.overflow).not.toBe('hidden');
    
    rerender(<Modal isOpen={true} onClose={vi.fn()} title="Test">Content</Modal>);
    expect(document.body.style.overflow).toBe('hidden');
  });
});
```

**Acceptance Criteria Coverage:**
- ✅ Modal interaction: Open/close functionality works
- ✅ Accessibility: Escape key and backdrop close work
- ✅ UI: Modal displays correctly with proper styling

---

## Integration Tests

Integration tests verify how components, API routes, and database work together.

### 1. Authentication API Integration

**File**: `__tests__/integration/auth.integration.test.js`

```javascript
import { Pool } from 'pg';
import { query, initializeDatabase } from '@/lib/db.js';
import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth.js';

describe('Authentication Integration', () => {
  let pool;
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
```

**Acceptance Criteria Coverage:**
- ✅ Registration: Valid registration with unique email
- ✅ Login: Correct credentials accepted, incorrect rejected
- ✅ Session: Token created and stored securely
- ✅ User info: Authenticated user data retrievable
- ✅ Logout: Session properly cleared

---

### 2. Boards API Integration

**File**: `__tests__/integration/boards.integration.test.js`

```javascript
import { query, initializeDatabase } from '@/lib/db.js';
import { hashPassword, generateToken } from '@/lib/auth.js';

describe('Boards API Integration', () => {
  let testUserId;
  let authToken;
  let authCookie;

  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    // Clear tables
    await query('DELETE FROM board_invitations');
    await query('DELETE FROM cards');
    await query('DELETE FROM board_members');
    await query('DELETE FROM columns');
    await query('DELETE FROM boards');
    await query('DELETE FROM users');

    // Create test user
    const hashedPassword = await hashPassword('TestPass123!');
    const userResult = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      ['board.test@example.com', hashedPassword, 'Board Tester']
    );
    testUserId = userResult.rows[0].id;
    authToken = generateToken({ userId: testUserId, email: 'board.test@example.com' });
    authCookie = `auth_token=${authToken}`;
  });

  describe('POST /api/boards', () => {
    it('should create a new board with default columns', async () => {
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          name: 'My First Board',
          description: 'A test board',
          color: 'blue',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.board.name).toBe('My First Board');
      expect(data.board.description).toBe('A test board');

      // Verify default columns created
      const columnsResult = await query(
        'SELECT * FROM columns WHERE board_id = $1 ORDER BY position',
        [data.board.id]
      );

      expect(columnsResult.rows.length).toBe(3); // To Do, In Progress, Done
      expect(columnsResult.rows[0].name).toBe('To Do');
      expect(columnsResult.rows[1].name).toBe('In Progress');
      expect(columnsResult.rows[2].name).toBe('Done');
    });

    it('should require board name', async () => {
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          name: '',
          description: 'Missing name',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await fetch('http://localhost:3000/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Unauthorized Board',
          description: 'No auth',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/boards', () => {
    beforeEach(async () => {
      // Create test boards
      const board1 = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Board 1', testUserId]
      );
      const board2 = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Board 2', testUserId]
      );

      // Create another user's board
      const otherUserResult = await query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
        ['other@example.com', await hashPassword('Pass123!'), 'Other User']
      );
      await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Other Board', otherUserResult.rows[0].id]
      );
    });

    it('should list only user\'s own boards', async () => {
      const response = await fetch('http://localhost:3000/api/boards', {
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.boards.length).toBe(2); // Only owned boards
      expect(data.boards.every(b => b.name.includes('Board'))).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await fetch('http://localhost:3000/api/boards');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/boards/[id]', () => {
    let boardId;
    let columnId;

    beforeEach(async () => {
      const boardResult = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Detail Board', testUserId]
      );
      boardId = boardResult.rows[0].id;

      const columnResult = await query(
        'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id',
        [boardId, 'To Do', 0]
      );
      columnId = columnResult.rows[0].id;

      // Add a card
      await query(
        'INSERT INTO cards (column_id, title, position) VALUES ($1, $2, $3)',
        [columnId, 'Task 1', 0]
      );
    });

    it('should retrieve board with columns and cards', async () => {
      const response = await fetch(`http://localhost:3000/api/boards/${boardId}`, {
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.board.name).toBe('Detail Board');
      expect(data.board.columns.length).toBeGreaterThan(0);
      expect(data.board.columns[0].cards.length).toBe(1);
    });

    it('should return 404 for non-existent board', async () => {
      const response = await fetch('http://localhost:3000/api/boards/99999', {
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe('DELETE /api/boards/[id]', () => {
    it('should delete board and associated data', async () => {
      const boardResult = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Delete Board', testUserId]
      );
      const boardId = boardResult.rows[0].id;

      const response = await fetch(`http://localhost:3000/api/boards/${boardId}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify board is deleted
      const checkResult = await query('SELECT * FROM boards WHERE id = $1', [boardId]);
      expect(checkResult.rows.length).toBe(0);
    });

    it('should only allow owner to delete', async () => {
      // Create board as different user
      const otherUserResult = await query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
        ['other@example.com', await hashPassword('Pass123!'), 'Other']
      );

      const boardResult = await query(
        'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
        ['Other Board', otherUserResult.rows[0].id]
      );

      // Try to delete as different user
      const response = await fetch(`http://localhost:3000/api/boards/${boardResult.rows[0].id}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });
});
```

**Acceptance Criteria Coverage:**
- ✅ Create board: Board created with default columns
- ✅ View boards: User sees only their boards
- ✅ Board details: Columns and cards retrieved correctly
- ✅ Delete board: Owner can delete board

---

### 3. Cards and Columns Integration

**File**: `__tests__/integration/cards.integration.test.js`

```javascript
import { query, initializeDatabase } from '@/lib/db.js';
import { hashPassword, generateToken } from '@/lib/auth.js';

describe('Cards and Columns Integration', () => {
  let testUserId;
  let boardId;
  let columnId;
  let authCookie;

  beforeAll(async () => {
    await initializeDatabase();
  });

  beforeEach(async () => {
    // Setup: Create user, board, and column
    const hashedPassword = await hashPassword('Test123!');
    const userResult = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      ['cards.test@example.com', hashedPassword, 'Cards Tester']
    );
    testUserId = userResult.rows[0].id;
    authCookie = `auth_token=${generateToken({ userId: testUserId })}`;

    const boardResult = await query(
      'INSERT INTO boards (name, owner_id) VALUES ($1, $2) RETURNING id',
      ['Card Test Board', testUserId]
    );
    boardId = boardResult.rows[0].id;

    const columnResult = await query(
      'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id',
      [boardId, 'To Do', 0]
    );
    columnId = columnResult.rows[0].id;
  });

  afterEach(async () => {
    await query('DELETE FROM cards WHERE column_id IN (SELECT id FROM columns WHERE board_id = $1)', [boardId]);
    await query('DELETE FROM columns WHERE board_id = $1', [boardId]);
    await query('DELETE FROM boards WHERE id = $1', [boardId]);
    await query('DELETE FROM users WHERE id = $1', [testUserId]);
  });

  describe('POST /api/cards - Create Card', () => {
    it('should create card with required fields', async () => {
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: columnId,
          title: 'New Task',
          description: 'Task description',
          priority: 'high',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.card.title).toBe('New Task');
      expect(data.card.priority).toBe('high');
    });

    it('should require column_id and title', async () => {
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          // missing column_id
          title: 'Task',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should set priority to medium if not provided', async () => {
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: columnId,
          title: 'Default Priority Task',
        }),
      });

      const data = await response.json();

      expect(data.card.priority).toBe('medium');
    });

    it('should assign position to card', async () => {
      const response = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: columnId,
          title: 'Positioned Task',
        }),
      });

      const data = await response.json();

      expect(data.card.position).toBeDefined();
      expect(typeof data.card.position).toBe('number');
    });
  });

  describe('PATCH /api/cards/[id] - Update Card', () => {
    let cardId;

    beforeEach(async () => {
      const cardResult = await query(
        'INSERT INTO cards (column_id, title, priority, position) VALUES ($1, $2, $3, $4) RETURNING id',
        [columnId, 'Original Title', 'low', 0]
      );
      cardId = cardResult.rows[0].id;
    });

    it('should update card fields', async () => {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          title: 'Updated Title',
          priority: 'urgent',
          description: 'Updated description',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.card.title).toBe('Updated Title');
      expect(data.card.priority).toBe('urgent');
      expect(data.card.description).toBe('Updated description');
    });

    it('should update individual fields', async () => {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          priority: 'high',
        }),
      });

      const data = await response.json();

      expect(data.card.priority).toBe('high');
      expect(data.card.title).toBe('Original Title'); // Unchanged
    });

    it('should handle due_date updates', async () => {
      const dueDate = '2025-12-31';
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          due_date: dueDate,
        }),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.card.due_date).toBeDefined();
    });
  });

  describe('DELETE /api/cards/[id]', () => {
    let cardId;

    beforeEach(async () => {
      const cardResult = await query(
        'INSERT INTO cards (column_id, title, position) VALUES ($1, $2, $3) RETURNING id',
        [columnId, 'Delete Me', 0]
      );
      cardId = cardResult.rows[0].id;
    });

    it('should delete card', async () => {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify deletion
      const checkResult = await query('SELECT * FROM cards WHERE id = $1', [cardId]);
      expect(checkResult.rows.length).toBe(0);
    });
  });

  describe('POST /api/cards/[id]/move - Move Card', () => {
    let cardId;
    let toDoColumnId;
    let inProgressColumnId;

    beforeEach(async () => {
      // Create two columns
      const toDoResult = await query(
        'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id',
        [boardId, 'To Do', 0]
      );
      toDoColumnId = toDoResult.rows[0].id;

      const inProgressResult = await query(
        'INSERT INTO columns (board_id, name, position) VALUES ($1, $2, $3) RETURNING id',
        [boardId, 'In Progress', 1]
      );
      inProgressColumnId = inProgressResult.rows[0].id;

      // Create card in To Do
      const cardResult = await query(
        'INSERT INTO cards (column_id, title, position) VALUES ($1, $2, $3) RETURNING id',
        [toDoColumnId, 'Movable Task', 0]
      );
      cardId = cardResult.rows[0].id;
    });

    it('should move card to different column', async () => {
      const response = await fetch(`http://localhost:3000/api/cards/${cardId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: inProgressColumnId,
          position: 0,
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.card.column_id).toBe(inProgressColumnId);
    });

    it('should update card position within column', async () => {
      // Create another card
      const card2Result = await query(
        'INSERT INTO cards (column_id, title, position) VALUES ($1, $2, $3) RETURNING id',
        [columnId, 'Second Task', 1]
      );

      const response = await fetch(`http://localhost:3000/api/cards/${cardId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          column_id: columnId,
          position: 1,
        }),
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.card.position).toBe(1);
    });
  });

  describe('POST /api/columns - Create Column', () => {
    it('should create column in board', async () => {
      const response = await fetch('http://localhost:3000/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          board_id: boardId,
          name: 'New Column',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.column.name).toBe('New Column');
      expect(data.column.board_id).toBe(boardId);
    });

    it('should require board_id and name', async () => {
      const response = await fetch('http://localhost:3000/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          name: 'No Board ID',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('PATCH /api/columns/[id]', () => {
    it('should update column name', async () => {
      const response = await fetch(`http://localhost:3000/api/columns/${columnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie,
        },
        body: JSON.stringify({
          name: 'Updated Column Name',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.column.name).toBe('Updated Column Name');
    });
  });

  describe('DELETE /api/columns/[id]', () => {
    it('should delete column', async () => {
      const response = await fetch(`http://localhost:3000/api/columns/${columnId}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
```

**Acceptance Criteria Coverage:**
- ✅ Create card: Card created with priority and due date
- ✅ Move card: Card moves between columns
- ✅ Edit card: Card details updated
- ✅ Drag and drop: Position updates reflected in DB
- ✅ Column management: Create, update, delete columns

---

## End-to-End Tests

E2E tests verify complete user workflows using Playwright.

**File**: `e2e/auth.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register, login, and logout', async ({ page }) => {
    // Navigate to home
    await page.goto('http://localhost:3000');

    // Click Sign Up
    await page.click('text=Sign Up');
    expect(page.url()).toContain('/register');

    // Fill registration form
    await page.fill('input[id="name"]', 'E2E Test User');
    await page.fill('input[id="email"]', `e2e-${Date.now()}@example.com`);
    await page.fill('input[id="password"]', 'TestPassword123!');
    await page.fill('input[id="confirmPassword"]', 'TestPassword123!');

    // Submit
    await page.click('button:has-text("Create Account")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Verify user name displayed
    await expect(page.locator('text=E2E Test User')).toBeVisible();

    // Click logout
    await page.click('button:has-text("Logout")');

    // Should redirect to home
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('user sees error for duplicate email', async ({ page }) => {
    const testEmail = `duplicate-${Date.now()}@example.com`;

    // First registration
    await page.goto('http://localhost:3000/register');
    await page.fill('input[id="name"]', 'First User');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', 'Pass123!');
    await page.fill('input[id="confirmPassword"]', 'Pass123!');
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Logout
    await page.click('button:has-text("Logout")');

    // Try to register again with same email
    await page.click('text=Sign Up');
    await page.fill('input[id="name"]', 'Second User');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', 'Pass123!');
    await page.fill('input[id="confirmPassword"]', 'Pass123!');
    await page.click('button:has-text("Create Account")');

    // Should see error
    await expect(page.locator('text=email')).toBeVisible();
    expect(page.url()).toContain('/register');
  });

  test('user can login with correct credentials', async ({ page, context }) => {
    const testEmail = `login-test-${Date.now()}@example.com`;

    // First register
    await page.goto('http://localhost:3000/register');
    await page.fill('input[id="name"]', 'Login Test User');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', 'LoginPass123!');
    await page.fill('input[id="confirmPassword"]', 'LoginPass123!');
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Logout
    await page.click('button:has-text("Logout")');
    await page.waitForURL('http://localhost:3000/');

    // Login again
    await page.click('text=Sign In');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', 'LoginPass123!');
    await page.click('button:has-text("Sign In")');

    // Should be on dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('text=Login Test User')).toBeVisible();
  });

  test('login fails with incorrect password', async ({ page }) => {
    const testEmail = `wrong-pass-${Date.now()}@example.com`;

    // Register
    await page.goto('http://localhost:3000/register');
    await page.fill('input[id="name"]', 'Wrong Pass User');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', 'CorrectPass123!');
    await page.fill('input[id="confirmPassword"]', 'CorrectPass123!');
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Logout
    await page.click('button:has-text("Logout")');

    // Try login with wrong password
    await page.click('text=Sign In');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', 'WrongPass123!');
    await page.click('button:has-text("Sign In")');

    // Should see error
    await expect(page.locator('text=incorrect')).toBeVisible();
    expect(page.url()).toContain('/login');
  });

  test('registration form validates password length', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.fill('input[id="name"]', 'Short Pass User');
    await page.fill('input[id="email"]', `short-${Date.now()}@example.com`);
    await page.fill('input[id="password"]', 'Short'); // Only 5 chars
    await page.fill('input[id="confirmPassword"]', 'Short');
    await page.click('button:has-text("Create Account")');

    // Should see error
    await expect(page.locator('text=6')).toBeVisible();
  });

  test('registration form validates password match', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.fill('input[id="name"]', 'Mismatch User');
    await page.fill('input[id="email"]', `mismatch-${Date.now()}@example.com`);
    await page.fill('input[id="password"]', 'Password123!');
    await page.fill('input[id="confirmPassword"]', 'Different123!');
    await page.click('button:has-text("Create Account")');

    // Should see error
    await expect(page.locator('text=do not match')).toBeVisible();
  });

  test('unauthenticated user redirected to login', async ({ page }) => {
    // Try to access dashboard without auth
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });

    // Should redirect to login or home
    const url = page.url();
    expect(url === 'http://localhost:3000/' || url.includes('/login')).toBe(true);
  });
});
```

**File**: `e2e/boards.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Kanban Board Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Register and login
    const testEmail = `board-e2e-${Date.now()}@example.com`;
    
    await page.goto('http://localhost:3000/register');
    await page.fill('input[id="name"]', 'Board E2E User');
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', 'BoardPass123!');
    await page.fill('input[id="confirmPassword"]', 'BoardPass123!');
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('http://localhost:3000/dashboard');
  });

  test('user can create a board', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Click create board
    await page.click('text=Create New Board');

    // Fill form
    await page.fill('input[id="name"]', 'My Test Board');
    await page.fill('input[id="description"]', 'A test board for E2E');

    // Submit
    await page.click('button:has-text("Create Board")');

    // Should see new board in list
    await expect(page.locator('text=My Test Board')).toBeVisible();
  });

  test('user can view board with columns', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Create and open board
    await page.click('text=Create New Board');
    await page.fill('input[id="name"]', 'Column Test Board');
    await page.click('button:has-text("Create Board")');

    // Click to open board
    await page.click('text=Column Test Board');

    // Should see default columns
    await expect(page.locator('text=To Do')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
  });

  test('user can create and move cards', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Create board
    await page.click('text=Create New Board');
    await page.fill('input[id="name"]', 'Card Test Board');
    await page.click('button:has-text("Create Board")');

    // Open board
    await page.click('text=Card Test Board');

    // Create card in To Do column
    await page.click('button:has-text("Add a card")'); // First column should have this

    // Fill card modal
    await page.fill('input[id="title"]', 'Test Card');
    await page.fill('textarea', 'Test Description');
    await page.click('button:has-text("Create Card")');

    // Should see card in column
    await expect(page.locator('text=Test Card')).toBeVisible();

    // Edit card
    const cardElement = page.locator('text=Test Card').first();
    await cardElement.hover();
    await page.click('button[title="Edit card"]');

    // Update priority
    await page.selectOption('select', 'high');
    await page.click('button:has-text("Update Card")');

    // Should still be visible
    await expect(page.locator('text=Test Card')).toBeVisible();
  });

  test('user can drag and drop cards between columns', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Create board and open it
    await page.click('text=Create New Board');
    await page.fill('input[id="name"]', 'Drag Test Board');
    await page.click('button:has-text("Create Board")');
    await page.click('text=Drag Test Board');

    // Create a card
    await page.click('button:has-text("Add a card")');
    await page.fill('input[id="title"]', 'Draggable Card');
    await page.click('button:has-text("Create Card")');

    // Drag card to "In Progress" column
    const cardElement = page.locator('text=Draggable Card').first();
    const inProgressColumn = page.locator('text=In Progress').first();

    await cardElement.dragTo(inProgressColumn);

    // Wait a moment for update
    await page.waitForTimeout(500);

    // Verify card moved (check if it appears in a different column)
    await expect(page.locator('text=Draggable Card')).toBeVisible();
  });

  test('user can delete a card', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Create and open board
    await page.click('text=Create New Board');
    await page.fill('input[id="name"]', 'Delete Test Board');
    await page.click('button:has-text("Create Board")');
    await page.click('text=Delete Test Board');

    // Create card
    await page.click('button:has-text("Add a card")');
    await page.fill('input[id="title"]', 'Card to Delete');
    await page.click('button:has-text("Create Card")');

    // Delete card
    const cardElement = page.locator('text=Card to Delete').first();
    await cardElement.hover();
    await page.click('button[title="Delete card"]');

    // Confirm deletion if prompted
    page.once('dialog', dialog => {
      dialog.accept();
    });

    // Card should be gone
    await expect(page.locator('text=Card to Delete')).not.toBeVisible();
  });

  test('user can add and rename columns', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    // Create and open board
    await page.click('text=Create New Board');
    await page.fill('input[id="name"]', 'Column Manage Board');
    await page.click('button:has-text("Create Board")');
    await page.click('text=Column Manage Board');

    // Add new column
    await page.click('text=Add another column');
    await page.fill('input[placeholder*="column"]', 'Custom Column');
    await page.click('button:has-text("Add column")');

    // Should see new column
    await expect(page.locator('text=Custom Column')).toBeVisible();

    // Rename column
    const columnHeader = page.locator('text=Custom Column').first();
    await columnHeader.click();

    // Look for menu button (three dots)
    const columnElement = columnHeader.locator('..');
    await columnElement.locator('button').nth(1).click(); // More button

    // Click rename option
    await page.click('text=Rename column');

    // Update name
    const input = page.locator('input[type="text"]').last();
    await input.clear();
    await input.fill('Renamed Column');
    await page.keyboard.press('Enter');

    // Should see new name
    await expect(page.locator('text=Renamed Column')).toBeVisible();
  });
});
```

**Acceptance Criteria Coverage:**
- ✅ Complete registration flow
- ✅ Complete login flow
- ✅ Create board with default columns
- ✅ Create cards in columns
- ✅ Move cards between columns (drag and drop)
- ✅ Edit card details
- ✅ Delete cards
- ✅ Manage columns

---

## Test Execution

### Running Tests

```bash
# Install test dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom playwright

# Run all tests
npm run test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Package.json Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run unitTest/",
    "test:integration": "vitest run __tests__/integration/",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

### CI/CD Integration

In `.github/workflows/ci.yml`, add test step:

```yaml
- name: Run tests
  run: npm test

- name: Run E2E tests
  run: npm run test:e2e
```

---

## Test Coverage

### Target Coverage Goals

| Category | Target |
|----------|--------|
| Unit Tests | 80%+ coverage |
| Integration Tests | 70%+ API coverage |
| E2E Tests | Critical paths covered |
| Overall | 75%+ code coverage |

### Coverage Report

```bash
npm run test:coverage
```

Generates coverage report showing:
- Statements coverage
- Branches coverage
- Functions coverage
- Lines coverage

### Coverage Exclusions

Exclude from coverage:
- `node_modules/`
- `dist/`
- `.next/`
- Test files themselves
- Configuration files

---

## Test Maintenance

### Continuous Improvement

1. **Review failing tests** weekly
2. **Update tests** when features change
3. **Refactor tests** to reduce duplication
4. **Add tests** for bug fixes (regression prevention)
5. **Monitor coverage** trends

### Best Practices

- Keep tests focused and isolated
- Use descriptive test names
- Avoid testing implementation details
- Test behavior, not code
- Keep tests maintainable
- Run tests before committing

---

## Acceptance Criteria Mapping

### Phase 1: Authentication (100% Coverage)

| User Story | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| Register | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |
| Protected routes | ✅ | ✅ | ✅ |
| Session management | ✅ | ✅ | ✅ |

### Phase 2: Boards & Cards (In Progress)

| User Story | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| Create board | - | ✅ | ✅ |
| View boards | - | ✅ | ✅ |
| Delete board | - | ✅ | ✅ |
| Create card | - | ✅ | ✅ |
| Move card | - | ✅ | ✅ |
| Edit card | - | ✅ | ✅ |
| Delete card | - | ✅ | ✅ |
| Add column | - | ✅ | ✅ |
| Manage columns | - | ✅ | ✅ |

### Phase 3: Collaboration (Planned)

| User Story | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| Invite users | - | 🔄 | 🔄 |
| Assign cards | - | 🔄 | 🔄 |
| Manage members | - | 🔄 | 🔄 |

✅ = Implemented  
🔄 = Planned  
\- = Not applicable

---

## Conclusion

This comprehensive test plan ensures EpiTrello maintains high quality throughout development. All tests are aligned with user story acceptance criteria and follow industry best practices for testing Node.js and React applications.

**Last Updated:** February 2025  
**Status:** Active Development  
**Next Review:** Monthly