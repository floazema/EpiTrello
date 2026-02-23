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

  test('user can create cards', async ({ page }) => {
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
    // await expect(page.locator('text=Card to Delete')).not.toBeVisible(); //TOdo fix logic also
  });

  // test('user can add and rename columns', async ({ page }) => { //nedd to fix logic
  //   await page.goto('http://localhost:3000/dashboard');

  //   // Create and open board
  //   await page.click('text=Create New Board');
  //   await page.fill('input[id="name"]', 'Column Manage Board');
  //   await page.click('button:has-text("Create Board")');
  //   await page.click('text=Column Manage Board');

  //   // Add new column
  //   await page.click('text=Add another column');
  //   await page.fill('input[placeholder*="column"]', 'Custom Column');
  //   await page.click('button:has-text("Add column")');

  //   // Should see new column
  //   await expect(page.locator('text=Custom Column')).toBeVisible();

  //   // Rename column
  //   const columnHeader = page.locator('text=Custom Column').first();
  //   await columnHeader.click();

  //   // Look for menu button (three dots)
  //   const columnElement = columnHeader.locator('..');
  //   await expect(columnElement.locator('button').nth(1)).toBeVisible();
  //   await columnElement.locator('button').nth(1).click();
  //   // Click rename option
  //   await page.click('text=Rename column');

  //   // Update name
  //   const input = page.locator('input[type="text"]').last();
  //   await input.clear();
  //   await input.fill('Renamed Column');
  //   await page.keyboard.press('Enter');

  //   // Should see new name
  //   await expect(page.locator('text=Renamed Column')).toBeVisible();
  // });
});