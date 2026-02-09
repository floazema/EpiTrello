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

  test('user can login with correct credentials', async ({ page }) => {
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