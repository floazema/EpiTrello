# EpiTrello - Test Implementation Guide

This guide explains how to add and run the tests outlined in the test plan.

---

## Project Structure

Add these directories to your EpiTrello project:

```
EpiTrello/
├── unitTest/                    # Unit tests (already exists partially)
│   ├── lib/
│   │   ├── auth.test.js        # ✅ Partially complete
│   │   └── utils.test.js       # ✅ Partially complete
│   └── components/
│       └── ui/
│           ├── button.test.jsx # ✅ Partially complete
│           ├── input.test.jsx  # Need to create
│           └── modal.test.jsx  # Need to create
│
├── __tests__/                   # Integration & setup tests
│   └── integration/
│       ├── auth.integration.test.js
│       ├── boards.integration.test.js
│       └── cards.integration.test.js
│
├── e2e/                         # End-to-end tests
│   ├── auth.spec.js
│   └── boards.spec.js
│
├── setupTests.mjs              # ✅ Already exists
├── vitest.config.mjs           # ✅ Already exists
└── package.json                # Update with test scripts
```

---

## Step 1: Update package.json

Add test dependencies and scripts to your `package.json`:

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "jsdom": "^24.1.3",
    "vitest": "^2.1.9",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0"
  },
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "init-db": "node scripts/init-db.js",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run unitTest/",
    "test:integration": "vitest run __tests__/integration/",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

Then install:

```bash
npm install
```

---

## Step 2: Create Unit Test Files

### File: `unitTest/lib/auth.test.js`

Update the existing file with comprehensive tests:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { hashPassword, comparePassword, generateToken, verifyToken } from '@/lib/auth.js';

describe('Authentication Helpers', () => {
  describe('Password Hashing', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'SecurePass123!';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should create different hashes for same password', async () => {
      const password = 'Test123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });

    it('should compare passwords correctly', async () => {
      const password = 'MyPassword123!';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject invalid passwords', async () => {
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

  describe('JWT Tokens', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should verify valid token', () => {
      const payload = { userId: 1, email: 'test@example.com' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(1);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should set 7-day expiration', () => {
      const payload = { userId: 1 };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.exp).toBeDefined();
      const expiresIn = (decoded.exp - decoded.iat) / 86400;
      expect(expiresIn).toBeGreaterThan(6.9);
      expect(expiresIn).toBeLessThan(7.1);
    });

    it('should return null for invalid token', () => {
      expect(verifyToken('not.a.valid.token')).toBeNull();
      expect(verifyToken('single')).toBeNull();
      expect(verifyToken('')).toBeNull();
    });
  });
});
```

### File: `unitTest/lib/utils.test.js`

Update with extended tests:

```javascript
import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils.js';

describe('cn Utility Function', () => {
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

  it('should resolve tailwind conflicts correctly', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
  });

  it('should handle object with boolean values', () => {
    const result = cn('base', { active: true, disabled: false });
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
    expect(cn('', '', '')).toBe('');
  });
});
```

### File: `unitTest/components/ui/input.test.jsx`

Create new file:

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Input } from '@/components/ui/input.jsx';

describe('Input Component', () => {
  it('should render input element', () => {
    render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
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

  it('should support different input types', () => {
    const { container } = render(<Input type="email" />);
    const input = container.querySelector('input');
    expect(input.type).toBe('email');
  });
});
```

### File: `unitTest/components/ui/modal.test.jsx`

Create new file:

```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '@/components/ui/modal.jsx';

describe('Modal Component', () => {
  it('should not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Test">Content</Modal>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={vi.fn()} title="Test">Content</Modal>);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
    const closeBtn = screen.getByRole('button');
    closeBtn.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close on Escape key press', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
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

---

## Step 3: Create Integration Test Files

### File: `__tests__/integration/auth.integration.test.js`

```javascript
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { query, initializeDatabase } from '@/lib/db.js';
import { hashPassword, generateToken } from '@/lib/auth.js';

describe('Authentication Integration Tests', () => {
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
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123!',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.name).toBe('Test User');
    });

    it('should reject duplicate email', async () => {
      const userData = {
        name: 'User One',
        email: 'same@example.com',
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
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword('TestPass123!');
      await query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
        ['login@example.com', hashedPassword, 'Login User']
      );
    });

    it('should successfully login with correct credentials', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'TestPass123!',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('login@example.com');
    });

    it('should reject login with incorrect password', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'WrongPassword',
        }),
      });

      const data = await response.json();

      expect(response.status).toBe(401);
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

    it('should return user when authenticated', async () => {
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
    });

    it('should reject request without authentication', async () => {
      const response = await fetch('http://localhost:3000/api/auth/me');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });
});
```

### Files: `__tests__/integration/boards.integration.test.js` and `__tests__/integration/cards.integration.test.js`

See the main TEST_PLAN.md for complete implementations.

---

## Step 4: Create E2E Test Files

### File: `e2e/auth.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Authentication E2E', () => {
  test('user can register and login', async ({ page }) => {
    // Navigate to home
    await page.goto('http://localhost:3000');

    // Click Sign Up
    await page.click('text=Sign Up');
    expect(page.url()).toContain('/register');

    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', `test-${timestamp}@example.com`);
    await page.fill('input[id="password"]', 'TestPass123!');
    await page.fill('input[id="confirmPassword"]', 'TestPass123!');

    // Submit
    await page.click('button:has-text("Create Account")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    await expect(page.locator('text=Test User')).toBeVisible();

    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('login fails with incorrect password', async ({ page }) => {
    // Register first
    await page.goto('http://localhost:3000/register');
    const timestamp = Date.now();
    await page.fill('input[id="name"]', 'Wrong Pass User');
    await page.fill('input[id="email"]', `wrongpass-${timestamp}@example.com`);
    await page.fill('input[id="password"]', 'CorrectPass123!');
    await page.fill('input[id="confirmPassword"]', 'CorrectPass123!');
    await page.click('button:has-text("Create Account")');
    await page.waitForURL('http://localhost:3000/dashboard');

    // Logout
    await page.click('button:has-text("Logout")');

    // Try login with wrong password
    await page.click('text=Sign In');
    await page.fill('input[id="email"]', `wrongpass-${timestamp}@example.com`);
    await page.fill('input[id="password"]', 'WrongPass123!');
    await page.click('button:has-text("Sign In")');

    // Should see error
    await expect(page.locator('text=incorrect')).toBeVisible();
    expect(page.url()).toContain('/login');
  });
});
```

### File: `e2e/boards.spec.js`

See the main TEST_PLAN.md for complete implementation.

---

## Step 5: Configure Playwright

### File: `playwright.config.js`

Create in root directory:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Step 6: Run Tests

### Start Database

```bash
docker compose up postgres -d
```

### Run Unit Tests

```bash
npm run test:unit
```

### Run Integration Tests

```bash
# Make sure app is running or start it first
npm run dev

# In another terminal:
npm run test:integration
```

### Run E2E Tests

```bash
npm run test:e2e
```

### Run All Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

---

## CI/CD Integration

### Update `.github/workflows/ci.yml`

Add test step:

```yaml
- name: Run unit tests
  run: npm run test:unit

- name: Run integration tests (with DB)
  run: npm run test:integration
  env:
    PGHOST: localhost
    PGDATABASE: epitrello_db
    PGUSER: postgres
    PGPASSWORD: postgres

- name: Run E2E tests
  run: npm run test:e2e
```

---

## Troubleshooting

### Tests Won't Run

```bash
# Check Node version
node --version  # Should be 20.x

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild Playwright
npx playwright install
```

### Database Connection Errors

```bash
# Start database
docker compose up postgres -d

# Initialize database
npm run init-db

# Check database
docker compose exec postgres psql -U postgres -d epitrello_db -c "\dt"
```

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### E2E Tests Timeout

```bash
# Increase timeout in playwright.config.js
use: {
  timeout: 30000,
}
```

---

## Next Steps

1. ✅ Add test files to project
2. ✅ Install dependencies (`npm install`)
3. ✅ Run tests locally (`npm test`)
4. ✅ Fix any failing tests
5. ✅ Add to CI/CD pipeline
6. ✅ Monitor coverage in GitHub Actions
7. ✅ Review coverage reports weekly

---

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com)
- [Playwright Docs](https://playwright.dev)
- [Jest Docs](https://jestjs.io)
- [Test Plan](./TEST_PLAN.md)
- [Project README](../README.md)

---

**Last Updated**: February 2025