# EpiTrello Test Plan - Quick Reference Guide

## Overview

A comprehensive 3-level testing strategy (Unit, Integration, E2E) aligned with all user story acceptance criteria.

---

## Quick Test Commands

```bash
# Run all tests
npm run test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only E2E tests
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Test Pyramid Distribution

```
        /\
       /  \         E2E Tests: 10%
      / E2E \       (Critical user paths)
     /-------\
    /         \
   / Integrtn \ Integration: 20%
  /-----------\ (API, database)
 /             \
/   Unit Tests   \ Unit: 70%
\(70% coverage)   / (Functions, components)
 \               /
  \-----------/
   \         /
```

---

## Test Coverage by Feature

### ✅ Phase 1: Authentication (COMPLETE)

| Feature | Unit | Integration | E2E | Status |
|---------|------|-------------|-----|--------|
| Register | ✅ | ✅ | ✅ | Done |
| Login | ✅ | ✅ | ✅ | Done |
| Logout | ✅ | ✅ | ✅ | Done |
| Session Management | ✅ | ✅ | ✅ | Done |
| Password Hashing | ✅ | ✅ | ✅ | Done |
| JWT Tokens | ✅ | ✅ | ✅ | Done |
| Protected Routes | ✅ | ✅ | ✅ | Done |

### 🔄 Phase 2: Boards & Cards (IN PROGRESS)

| Feature | Unit | Integration | E2E | Status |
|---------|------|-------------|-----|--------|
| Create Board | - | ✅ | ✅ | Ready |
| View Boards | - | ✅ | ✅ | Ready |
| Delete Board | - | ✅ | ✅ | Ready |
| Create Card | - | ✅ | ✅ | Ready |
| Edit Card | - | ✅ | ✅ | Ready |
| Delete Card | - | ✅ | ✅ | Ready |
| Move Card (Drag & Drop) | - | ✅ | ✅ | Ready |
| Add Column | - | ✅ | ✅ | Ready |
| Rename Column | - | ✅ | ✅ | Ready |
| Delete Column | - | ✅ | ✅ | Ready |

### 📋 Phase 3: Collaboration (PLANNED)

| Feature | Unit | Integration | E2E | Status |
|---------|------|-------------|-----|--------|
| Invite Users | - | 🔄 | 🔄 | Planned |
| Manage Members | - | 🔄 | 🔄 | Planned |
| Assign Cards | - | 🔄 | 🔄 | Planned |

---

## Unit Tests Structure

```
unitTest/
├── lib/
│   ├── auth.test.js          # Password hashing, JWT tokens
│   └── utils.test.js         # Utility functions
└── components/
    └── ui/
        ├── button.test.jsx   # Button component
        ├── input.test.jsx    # Input component
        └── modal.test.jsx    # Modal component
```

### Key Unit Tests

**Authentication (`lib/auth.test.js`)**
- ✅ Password hashing with bcrypt
- ✅ Password comparison
- ✅ JWT token generation
- ✅ JWT token verification
- ✅ Token expiration (7 days)
- ✅ Invalid token handling

**UI Components**
- ✅ Button variants and sizes
- ✅ Input types and states
- ✅ Modal open/close behavior
- ✅ Modal keyboard shortcuts (Escape)
- ✅ Form field validation

**Utilities**
- ✅ Tailwind class merging
- ✅ Conditional class application
- ✅ Conflict resolution

---

## Integration Tests Structure

```
__tests__/integration/
├── auth.integration.test.js     # Auth API routes
├── boards.integration.test.js   # Board management
└── cards.integration.test.js    # Cards & columns
```

### Key Integration Tests

**Authentication API**
- ✅ POST /api/auth/register - Registration flow
- ✅ POST /api/auth/login - Login flow
- ✅ GET /api/auth/me - Current user
- ✅ POST /api/auth/logout - Logout
- ✅ Database password hashing
- ✅ Cookie management
- ✅ Error handling

**Boards API**
- ✅ POST /api/boards - Create board with columns
- ✅ GET /api/boards - List user boards
- ✅ GET /api/boards/[id] - View board details
- ✅ PATCH /api/boards/[id] - Update board
- ✅ DELETE /api/boards/[id] - Delete board
- ✅ Ownership validation

**Cards API**
- ✅ POST /api/cards - Create card
- ✅ PATCH /api/cards/[id] - Update card
- ✅ DELETE /api/cards/[id] - Delete card
- ✅ POST /api/cards/[id]/move - Move card
- ✅ Priority and due date handling
- ✅ Tags and colors

**Columns API**
- ✅ POST /api/columns - Create column
- ✅ PATCH /api/columns/[id] - Update column
- ✅ DELETE /api/columns/[id] - Delete column
- ✅ POST /api/columns/[id]/move - Reorder columns

---

## End-to-End Tests Structure

```
e2e/
├── auth.spec.js               # Registration, login, logout flows
└── boards.spec.js             # Board and card management workflows
```

### Key E2E Test Scenarios

**Authentication**
- ✅ Complete registration flow
- ✅ Duplicate email validation
- ✅ Login with valid credentials
- ✅ Login failure with wrong password
- ✅ Password length validation (6 chars minimum)
- ✅ Password mismatch validation
- ✅ Unauthenticated access protection

**Kanban Board**
- ✅ Create board
- ✅ View board with default columns (To Do, In Progress, Done)
- ✅ Create card in column
- ✅ Edit card details
- ✅ Delete card
- ✅ Drag and drop card between columns
- ✅ Add new column
- ✅ Rename column
- ✅ Delete column

---

## Test Data Management

### Fixtures & Factories

For integration and E2E tests:

```javascript
// User fixture
const testUser = {
  email: 'test@example.com',
  password: 'TestPass123!',
  name: 'Test User'
};

// Board fixture
const testBoard = {
  name: 'Test Board',
  description: 'A test board',
  color: 'zinc'
};

// Card fixture
const testCard = {
  title: 'Test Card',
  description: 'A test card',
  priority: 'medium',
  due_date: '2025-12-31'
};
```

### Database Reset Strategy

```javascript
// Before each test
beforeEach(async () => {
  // Clear in reverse dependency order
  await query('DELETE FROM cards');
  await query('DELETE FROM columns');
  await query('DELETE FROM board_members');
  await query('DELETE FROM boards');
  await query('DELETE FROM users');
});
```

---

## Coverage Requirements

### Coverage Goals

| Metric | Target |
|--------|--------|
| Unit Tests | 80%+ code coverage |
| Integration Tests | 70%+ API coverage |
| E2E Tests | Critical paths covered |
| **Overall** | **75%+ coverage** |

### Measuring Coverage

```bash
# Generate coverage report
npm run test:coverage

# View coverage in terminal
npm run test:coverage -- --reporter=text

# Generate HTML report
npm run test:coverage -- --reporter=html
```

---

## Test Naming Convention

### Unit Tests

```javascript
describe('[Component/Function Name]', () => {
  describe('[Feature]', () => {
    it('should [action] when [condition]', () => {
      // Test implementation
    });
  });
});
```

Example:
```javascript
describe('hashPassword', () => {
  it('should hash password with bcrypt', async () => {});
  it('should create different hashes for same password', async () => {});
});
```

### Integration Tests

```javascript
describe('[API Endpoint]', () => {
  it('should [expected behavior] with [conditions]', async () => {
    // Test implementation
  });
});
```

Example:
```javascript
describe('POST /api/auth/register', () => {
  it('should successfully register a new user', async () => {});
  it('should reject duplicate email', async () => {});
});
```

### E2E Tests

```javascript
test('user can [action] to [achieve goal]', async ({ page }) => {
  // Test implementation
});
```

Example:
```javascript
test('user can register and login successfully', async ({ page }) => {});
test('user can create and move cards between columns', async ({ page }) => {});
```

---

## Continuous Integration

### GitHub Actions Integration

Tests run automatically on:
- ✅ Every push to `main` and `develop`
- ✅ Every pull request
- ✅ Weekly schedule (security scanning)

### CI Workflow

1. **Install dependencies** - `npm ci`
2. **Lint code** - `npm run lint`
3. **Run unit tests** - `npm run test:unit`
4. **Run integration tests** - `npm run test:integration` (with test DB)
5. **Build application** - `npm run build`
6. **Run E2E tests** - `npm run test:e2e` (full app)

### Failure Handling

- ❌ Failed tests block merge
- ❌ Coverage drop below threshold blocks merge
- ⚠️ Warnings don't block but are reported

---

## Best Practices

### DO ✅

- Keep tests focused and isolated
- Use descriptive test names
- Test behavior, not implementation
- Use fixtures for consistent data
- Mock external dependencies
- Run tests before committing
- Update tests when features change
- Review test coverage regularly

### DON'T ❌

- Test implementation details
- Create interdependent tests
- Skip failing tests
- Commit without running tests
- Ignore coverage drops
- Use vague test names
- Test multiple behaviors per test
- Make tests too complex

---

## Acceptance Criteria Mapping

### How Tests Align with User Stories

Each user story has acceptance criteria that map directly to tests:

**Example: User Registration**

User Story:
> As a visitor, I can register with email and password so I can create an account.

Acceptance Criteria:
1. Valid email/password → success → redirected to login
2. Email format validated
3. Password ≥ 6 characters
4. Duplicate email rejected

Tests:
- ✅ **Unit**: `hashPassword`, `comparePassword` functions
- ✅ **Integration**: POST /api/auth/register validation
- ✅ **E2E**: Complete registration flow

---

## Running Tests Locally

### Setup

```bash
# Install dependencies
npm install

# Start database
docker compose up postgres -d

# Run tests
npm test
```

### Development Workflow

```bash
# Terminal 1: Run tests in watch mode
npm run test:watch

# Terminal 2: Continue development
# Your changes automatically trigger test re-runs
```

### Before Committing

```bash
# Run full test suite
npm test

# Check coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## Documentation References

- **Full Test Plan**: `TEST_PLAN.md` (this directory)
- **User Stories**: `user_stories.md` (root directory)
- **Project Overview**: `Cahier_des_charges.md` (root directory)
- **API Reference**: `docs/developer/api.md`
- **Database Schema**: `docs/developer/database.md`

---

## Support & Questions

For questions about the test plan:

1. Check the full `TEST_PLAN.md` document
2. Review test examples in `__tests__/` and `e2e/` directories
3. Consult user stories for acceptance criteria
4. Review GitHub Actions logs for CI failures

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2025 | Initial comprehensive test plan |
| | | - Unit tests for auth, UI, utils |
| | | - Integration tests for API routes |
| | | - E2E tests for auth & board workflows |
| | | - 75%+ coverage target |

**Status**: ✅ Active Development

---

**Last Updated**: February 2025  
**Next Review**: Monthly  
**Test Lead**: Development Team