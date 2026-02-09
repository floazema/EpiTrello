# EpiTrello - Technical Documentation

## Table of Contents
1. [Data Model](#data-model)
2. [API Endpoints](#api-endpoints)
3. [Workflow & Data Flow](#workflow--data-flow)
4. [System Architecture](#system-architecture)
5. [Security Implementation](#security-implementation)
6. [Performance Considerations](#performance-considerations)

---

## Data Model

### Overview
EpiTrello uses a relational database architecture with PostgreSQL. The model supports user authentication, Kanban board management, columns, cards/tasks, and team collaboration.

### Database Schema

#### 1. Users Table
Stores user account information and authentication credentials.

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique identifier | PRIMARY KEY, AUTO INCREMENT |
| `email` | VARCHAR(255) | Email address for login | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | Bcrypt hashed password | NOT NULL |
| `name` | VARCHAR(255) | Display name | NOT NULL |
| `created_at` | TIMESTAMP | Account creation date | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update timestamp | DEFAULT NOW() |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email` (automatic with UNIQUE constraint)

**Relationships:**
- One-to-Many → `boards` (owner_id)
- One-to-Many → `cards` (future: assigned_to)

**Example Data:**
```json
{
  "id": 1,
  "email": "alice@example.com",
  "name": "Alice Johnson",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

#### 2. Boards Table
Represents individual Kanban boards created by users.

```sql
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT 'zinc',
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique board identifier | PRIMARY KEY |
| `name` | VARCHAR(255) | Board name | NOT NULL |
| `description` | TEXT | Board description | NULLABLE |
| `color` | VARCHAR(50) | Theme color | DEFAULT 'zinc' |
| `owner_id` | INTEGER | Board owner user ID | NOT NULL, FOREIGN KEY |
| `created_at` | TIMESTAMP | Creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Update timestamp | DEFAULT NOW() |

**Foreign Keys:**
- `owner_id` → `users(id)` ON DELETE CASCADE

**Relationships:**
- Many-to-One → `users` (owner)
- One-to-Many → `columns`
- One-to-Many → `board_members` (planned)

**Example Data:**
```json
{
  "id": 5,
  "name": "Q1 2025 - Product Roadmap",
  "description": "Planning for first quarter development",
  "color": "blue",
  "owner_id": 1,
  "created_at": "2025-01-15T10:35:00Z",
  "updated_at": "2025-01-15T10:35:00Z"
}
```

**Cascade Rules:**
- Deleting a user cascades to all their boards
- Deleting a board cascades to all its columns and cards

---

#### 3. Columns Table
Represents workflow stages within a board (e.g., "To Do", "In Progress", "Done").

```sql
CREATE TABLE IF NOT EXISTS columns (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique column identifier | PRIMARY KEY |
| `board_id` | INTEGER | Parent board ID | NOT NULL, FOREIGN KEY |
| `name` | VARCHAR(255) | Column name | NOT NULL |
| `position` | INTEGER | Display order | NOT NULL, DEFAULT 0 |
| `created_at` | TIMESTAMP | Creation timestamp | DEFAULT NOW() |

**Foreign Keys:**
- `board_id` → `boards(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- COMPOSITE INDEX on (board_id, position) for sorting

**Relationships:**
- Many-to-One → `boards`
- One-to-Many → `cards`

**Example Data:**
```json
{
  "id": 12,
  "board_id": 5,
  "name": "In Progress",
  "position": 1,
  "created_at": "2025-01-15T10:35:15Z"
}
```

**Position Strategy:**
- Positions are 0-indexed and sequential per board
- When a column is deleted, remaining columns maintain order
- When moving columns, positions are recalculated

---

#### 4. Cards Table
Represents individual tasks/work items within columns.

```sql
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  color VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| `id` | SERIAL | Unique card identifier | PRIMARY KEY |
| `column_id` | INTEGER | Parent column ID | NOT NULL, FOREIGN KEY |
| `title` | VARCHAR(255) | Card title | NOT NULL |
| `description` | TEXT | Detailed description | NULLABLE |
| `position` | INTEGER | Card order in column | NOT NULL, DEFAULT 0 |
| `priority` | VARCHAR(20) | Priority level | DEFAULT 'medium' |
| `due_date` | DATE | Task deadline | NULLABLE |
| `tags` | TEXT[] | Array of tags | NULLABLE |
| `color` | VARCHAR(50) | Visual indicator | NULLABLE |
| `created_at` | TIMESTAMP | Creation timestamp | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Update timestamp | DEFAULT NOW() |

**Foreign Keys:**
- `column_id` → `columns(id)` ON DELETE CASCADE

**Indexes:**
- PRIMARY KEY on `id`
- COMPOSITE INDEX on (column_id, position)

**Relationships:**
- Many-to-One → `columns`
- Many-to-One → `users` (future: assigned_to)

**Priority Levels:**
```
'low'     - Green priority indicator
'medium'  - Yellow priority indicator
'high'    - Orange priority indicator
'urgent'  - Red priority indicator
```

**Example Data:**
```json
{
  "id": 42,
  "column_id": 12,
  "title": "Implement user authentication",
  "description": "Add JWT-based auth with bcrypt hashing",
  "position": 0,
  "priority": "high",
  "due_date": "2025-01-31",
  "tags": ["backend", "security", "auth"],
  "color": "blue",
  "created_at": "2025-01-15T10:36:00Z",
  "updated_at": "2025-01-15T14:20:00Z"
}
```

---

### Entity Relationship Diagram

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ name        │
└──────┬──────┘
       │ (1)
       │ owns
       │ (M)
       ↓
┌─────────────────┐
│    boards       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ owner_id (FK)───┼──→ users.id
│ description     │
│ color           │
└────────┬────────┘
         │ (1)
         │ contains
         │ (M)
         ↓
┌──────────────────┐
│    columns       │
├──────────────────┤
│ id (PK)          │
│ board_id (FK)────┼──→ boards.id
│ name             │
│ position         │
└────────┬─────────┘
         │ (1)
         │ contains
         │ (M)
         ↓
┌──────────────────┐
│     cards        │
├──────────────────┤
│ id (PK)          │
│ column_id (FK)───┼──→ columns.id
│ title            │
│ description      │
│ position         │
│ priority         │
│ due_date         │
│ tags             │
│ color            │
└──────────────────┘
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Create a new user account.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 characters)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
```json
// 400 - Missing fields
{
  "success": false,
  "message": "All fields are required"
}

// 400 - Password too short
{
  "success": false,
  "message": "Password must contain at least 6 characters"
}

// 409 - Email already exists
{
  "success": false,
  "message": "This email is already in use"
}
```

**Side Effects:**
- Creates user in database with hashed password
- Generates JWT token
- Sets `auth_token` httpOnly cookie (7-day expiration)

---

#### POST /api/auth/login
Authenticate an existing user.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
```json
// 401 - Invalid credentials
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### GET /api/auth/me
Get current authenticated user information.

**Request:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Cookie: auth_token=<jwt_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
```json
// 401 - Not authenticated
{
  "success": false,
  "message": "Not authenticated"
}

// 401 - Invalid token
{
  "success": false,
  "message": "Invalid token"
}
```

---

#### POST /api/auth/logout
Log out the current user.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: auth_token=<jwt_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Side Effects:**
- Clears `auth_token` cookie (sets maxAge to 0)

---

### Boards Endpoints

#### GET /api/boards
Get all boards for the authenticated user.

**Request:**
```bash
curl http://localhost:3000/api/boards \
  -H "Cookie: auth_token=<jwt_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "boards": [
    {
      "id": 5,
      "name": "Q1 2025 - Roadmap",
      "description": "Planning for Q1",
      "color": "blue",
      "created_at": "2025-01-15T10:35:00Z"
    }
  ]
}
```

---

#### POST /api/boards
Create a new board.

**Request:**
```bash
curl -X POST http://localhost:3000/api/boards \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{
    "name": "New Project",
    "description": "Project description",
    "color": "blue"
  }'
```

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "color": "string (optional, default: zinc)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Board created successfully",
  "board": {
    "id": 6,
    "name": "New Project",
    "description": "Project description",
    "color": "blue",
    "created_at": "2025-01-15T10:40:00Z"
  }
}
```

**Side Effect:**
- Creates 3 default columns: "To Do", "In Progress", "Done"

---

#### GET /api/boards/:id
Get a specific board with all columns and cards.

**Request:**
```bash
curl http://localhost:3000/api/boards/5 \
  -H "Cookie: auth_token=<jwt_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "board": {
    "id": 5,
    "name": "Q1 2025 - Roadmap",
    "description": "Planning for Q1",
    "color": "blue",
    "created_at": "2025-01-15T10:35:00Z",
    "columns": [
      {
        "id": 12,
        "name": "To Do",
        "position": 0,
        "cards": [
          {
            "id": 42,
            "title": "Implement authentication",
            "description": "Add JWT auth",
            "position": 0,
            "priority": "high",
            "due_date": "2025-01-31",
            "tags": ["backend", "security"],
            "color": "blue"
          }
        ]
      }
    ]
  }
}
```

---

#### PATCH /api/boards/:id
Update board information.

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/boards/5 \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{
    "name": "Updated Name",
    "color": "red"
  }'
```

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "color": "string (optional)"
}
```

---

#### DELETE /api/boards/:id
Delete a board and all its content.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/boards/5 \
  -H "Cookie: auth_token=<jwt_token>"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Board deleted successfully"
}
```

---

### Columns Endpoints

#### POST /api/columns
Create a new column in a board.

**Request:**
```bash
curl -X POST http://localhost:3000/api/columns \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{
    "board_id": 5,
    "name": "Testing"
  }'
```

**Request Body:**
```json
{
  "board_id": "integer (required)",
  "name": "string (required)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Column created successfully",
  "column": {
    "id": 15,
    "board_id": 5,
    "name": "Testing",
    "position": 2,
    "cards": []
  }
}
```

---

#### PATCH /api/columns/:id
Update column name.

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/columns/12 \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{
    "name": "In Review"
  }'
```

---

#### POST /api/columns/:id/move
Move column to a different position.

**Request:**
```bash
curl -X POST http://localhost:3000/api/columns/12/move \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{
    "position": 1
  }'
```

**Request Body:**
```json
{
  "position": "integer (required, 0-based index)"
}
```

---

#### DELETE /api/columns/:id
Delete a column and all its cards.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/columns/12 \
  -H "Cookie: auth_token=<jwt_token>"
```

---

### Cards Endpoints

#### POST /api/cards
Create a new card in a column.

**Request:**
```bash
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{
    "column_id": 12,
    "title": "New Task",
    "description": "Task details",
    "priority": "high",
    "due_date": "2025-02-01",
    "tags": ["bug", "urgent"],
    "color": "red"
  }'
```

**Request Body:**
```json
{
  "column_id": "integer (required)",
  "title": "string (required)",
  "description": "string (optional)",
  "priority": "string (optional, default: medium)",
  "due_date": "string (optional, ISO format)",
  "tags": "array (optional)",
  "color": "string (optional)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Card created successfully",
  "card": {
    "id": 50,
    "column_id": 12,
    "title": "New Task",
    "description": "Task details",
    "position": 1,
    "priority": "high",
    "due_date": "2025-02-01",
    "tags": ["bug", "urgent"],
    "color": "red",
    "created_at": "2025-01-15T14:30:00Z"
  }
}
```

---

#### PATCH /api/cards/:id
Update card details.

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/cards/50 \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{
    "title": "Updated Task",
    "priority": "urgent",
    "due_date": "2025-01-31"
  }'
```

---

#### POST /api/cards/:id/move
Move card to different column or position.

**Request:**
```bash
curl -X POST http://localhost:3000/api/cards/50/move \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<jwt_token>" \
  -d '{
    "column_id": 13,
    "position": 0
  }'
```

**Request Body:**
```json
{
  "column_id": "integer (required)",
  "position": "integer (required, 0-based index)"
}
```

---

#### DELETE /api/cards/:id
Delete a card.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/cards/50 \
  -H "Cookie: auth_token=<jwt_token>"
```

---

## Workflow & Data Flow

### User Registration Flow

```
┌──────────────┐
│  User Input  │
└──────┬───────┘
       │ "Register" click
       ↓
┌──────────────────────────┐
│  Client Validation       │
│  - Email format          │
│  - Password length (≥6)  │
│  - Password match        │
└──────┬───────────────────┘
       │ If valid
       ↓
┌──────────────────────────┐
│  POST /api/auth/register │
│  Payload: email, password│
└──────┬───────────────────┘
       │ HTTP Request
       ↓
┌──────────────────────────┐
│  Server Validation       │
│  - Check email unique    │
│  - Validate password     │
└──────┬───────────────────┘
       │ If valid
       ↓
┌──────────────────────────┐
│  Hash Password (bcrypt)  │
│  Salt rounds: 10         │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  INSERT INTO users       │
│  Store hashed password   │
└──────┬───────────────────┘
       │ Success
       ↓
┌──────────────────────────┐
│  Generate JWT Token      │
│  Payload:                │
│  - userId, email         │
│  - Expiration: 7 days    │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  Set httpOnly Cookie     │
│  - Secure flag           │
│  - SameSite: lax         │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  Return User Data        │
│  Redirect to Dashboard   │
└──────────────────────────┘
```

### Login Flow

```
┌──────────────┐
│  User Input  │
│  email/pwd   │
└──────┬───────┘
       │ "Login" click
       ↓
┌──────────────────────────┐
│  Client Validation       │
│  - Required fields       │
└──────┬───────────────────┘
       │ If valid
       ↓
┌──────────────────────────┐
│  POST /api/auth/login    │
└──────┬───────────────────┘
       │ HTTP Request
       ↓
┌──────────────────────────┐
│  Query users by email    │
│  SELECT * FROM users     │
│  WHERE email = $1        │
└──────┬───────────────────┘
       │
       ├─ Not Found
       │  └→ Return 401
       │
       └─ Found
         ↓
┌──────────────────────────┐
│  Compare Password        │
│  bcrypt.compare(pwd, db) │
└──────┬───────────────────┘
       │
       ├─ Mismatch
       │  └→ Return 401
       │
       └─ Match
         ↓
┌──────────────────────────┐
│  Generate JWT Token      │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  Set httpOnly Cookie     │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  Return User + Redirect  │
│  to /dashboard           │
└──────────────────────────┘
```

### Kanban Board Workflow

#### Creating a Board

```
┌─────────────────┐
│  User Input:    │
│  - Board name   │
│  - Description  │
│  - Color        │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────┐
│  POST /api/boards           │
│  Include: JWT token         │
└────────┬────────────────────┘
         │ HTTP Request
         ↓
┌─────────────────────────────┐
│  Verify JWT Token           │
│  Extract userId from token  │
└────────┬────────────────────┘
         │ Valid
         ↓
┌─────────────────────────────┐
│  Validate Input             │
│  - Board name required      │
│  - Length constraints       │
└────────┬────────────────────┘
         │ Valid
         ↓
┌─────────────────────────────┐
│  INSERT INTO boards         │
│  - owner_id = userId        │
│  - timestamp = NOW()        │
└────────┬────────────────────┘
         │ Success
         ↓
┌─────────────────────────────┐
│  Create Default Columns:    │
│  1. "To Do"    (position 0) │
│  2. "Progress" (position 1) │
│  3. "Done"     (position 2) │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  Return Board Data          │
│  - board info               │
│  - columns array            │
│  - empty cards array        │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│  UI: Redirect to board page │
│  Display board with columns │
└─────────────────────────────┘
```

#### Moving a Card Between Columns

```
┌──────────────────────┐
│  User Action:        │
│  Drag card from Col1 │
│  to Col2             │
└────────┬─────────────┘
         │ Drag started
         ↓
┌──────────────────────────────┐
│  UI: Optimistic Update       │
│  - Remove from Col1          │
│  - Add to Col2               │
│  - Show visual feedback      │
└────────┬─────────────────────┘
         │ Drag ended
         ↓
┌──────────────────────────────┐
│  POST /api/cards/:id/move    │
│  Payload:                    │
│  - column_id: Col2 ID        │
│  - position: new index       │
└────────┬─────────────────────┘
         │ HTTP Request
         ↓
┌──────────────────────────────┐
│  Verify JWT & Ownership      │
│  - User owns the board       │
│  - Card exists               │
│  - Target column valid       │
└────────┬─────────────────────┘
         │ Valid
         ↓
┌──────────────────────────────┐
│  Transaction:                │
│  1. Update card column_id    │
│  2. Update card position     │
│  3. Reorder other cards      │
│  4. Commit all changes       │
└────────┬─────────────────────┘
         │ Success
         ↓
┌──────────────────────────────┐
│  Return Updated Card Data    │
└────────┬─────────────────────┘
         │
         ├─ Success: Keep UI changes
         │
         └─ Error: Revert UI to previous
               state
```

#### Protected Route Access

```
┌──────────────────┐
│  User Request:   │
│  GET /dashboard  │
└────────┬─────────┘
         │ Browser sends
         │ auth_token cookie
         ↓
┌──────────────────────────────┐
│  Next.js checks cookie       │
│  Calls GET /api/auth/me      │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Extract JWT from cookie     │
│  Verify signature            │
│  Check expiration            │
└────────┬─────────────────────┘
         │
         ├─ Invalid/Expired
         │  └→ Redirect to /login
         │
         └─ Valid
           ↓
┌──────────────────────────────┐
│  Extract userId              │
│  Query user from database    │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Return user data            │
│  Render dashboard page       │
└──────────────────────────────┘
```

---

## System Architecture

### Technology Stack

```
┌─────────────────────────────────────────┐
│         Browser / Client                 │
│  - React 19 Components                   │
│  - Tailwind CSS Styling                  │
│  - JavaScript Event Handling             │
└──────────────┬──────────────────────────┘
               │ HTTP/HTTPS
┌──────────────▼──────────────────────────┐
│        Next.js 15 App Router             │
│  - Server Components                     │
│  - Client Components (use client)        │
│  - Static & Dynamic Pages                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Next.js API Routes (Handler)        │
│  - /api/auth/* (Authentication)          │
│  - /api/boards/* (Boards CRUD)           │
│  - /api/columns/* (Columns CRUD)         │
│  - /api/cards/* (Cards CRUD)             │
└──────────────┬──────────────────────────┘
               │ SQL Queries
┌──────────────▼──────────────────────────┐
│         PostgreSQL Database              │
│  - Connection Pool (20 max)              │
│  - Parameterized Queries                 │
│  - Transaction Support                   │
│  - Referential Integrity                 │
└──────────────────────────────────────────┘
```

### Request Processing Pipeline

```
1. HTTP Request Arrives
   ↓
2. Next.js Routing
   ↓
3. Middleware Execution (cookies)
   ↓
4. Request Handler (POST/GET/PATCH/DELETE)
   ↓
5. Authentication Check
   - Extract JWT from cookie
   - Verify signature & expiration
   - Extract userId
   ↓
6. Authorization Check
   - Verify user owns resource
   - Check permissions
   ↓
7. Input Validation
   - Type checking
   - Required fields
   - Length constraints
   - Format validation
   ↓
8. Database Operation
   - Parameterized query
   - Transaction if needed
   - Error handling
   ↓
9. Response Construction
   - Success/Error object
   - HTTP Status code
   - JSON body
   ↓
10. HTTP Response Sent
```

---

## Security Implementation

### Password Security

**Hashing Algorithm:** bcryptjs v3.0.2
```javascript
// Registration
const hashedPassword = await bcrypt.hash(password, 10);

// Login
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

**Configuration:**
- Salt rounds: 10 (security vs performance balance)
- Hash length: ~60 characters
- Time complexity: ~1 second per hash

**Database Storage:**
```sql
-- Password stored as bcrypt hash (never plain text)
password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36p4/KFm'
```

### JWT Token Implementation

**Library:** jsonwebtoken v9.0.2

**Token Structure:**
```
Header.Payload.Signature
```

**Payload:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1705315800,      // Issued at
  "exp": 1705920600       // Expires in 7 days
}
```

**Configuration:**
```javascript
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
```

### Cookie Security

**HttpOnly Cookies:**
```javascript
response.cookies.set('auth_token', token, {
  httpOnly: true,              // Prevent JavaScript access (XSS protection)
  secure: NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',            // CSRF protection
  maxAge: 60 * 60 * 24 * 7,   // 7 days
  path: '/'                    // Available site-wide
});
```

**Benefits:**
- Cannot be accessed by JavaScript (protection against XSS)
- Only transmitted over HTTPS in production
- Protected against CSRF attacks
- Automatic expiration after 7 days
- Cleared on logout

### SQL Injection Prevention

**Parameterized Queries:**
```javascript
// ✅ CORRECT - Parameterized (safe)
const result = await query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
);

// ❌ WRONG - String concatenation (vulnerable)
const result = await query(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

**Implementation:**
- All queries use numbered parameters ($1, $2, etc.)
- Values separated from SQL string
- Database driver handles escaping

### Authorization & Ownership Verification

**Board Ownership Check:**
```javascript
const boardCheck = await query(
  'SELECT id FROM boards WHERE id = $1 AND owner_id = $2',
  [boardId, userId]
);

if (boardCheck.rows.length === 0) {
  // User doesn't own this board
  return 401 Unauthorized
}
```

**Card Access Verification:**
```javascript
const cardCheck = await query(
  `SELECT ca.id FROM cards ca
   JOIN columns c ON ca.column_id = c.id
   JOIN boards b ON c.board_id = b.id
   WHERE ca.id = $1 AND b.owner_id = $2`,
  [cardId, userId]
);
```

---

## Performance Considerations

### Database Connection Pooling

**Configuration:**
```javascript
const pool = new Pool({
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close after 30 seconds idle
  connectionTimeoutMillis: 10000 // Fail after 10 seconds
});
```

**Benefits:**
- Reuse connections instead of creating new ones
- Reduces connection overhead
- Better resource utilization
- Faster query execution

### Query Optimization

**Indexes:**
```sql
-- Primary keys (automatic)
CREATE TABLE users (
  id SERIAL PRIMARY KEY
);

-- Unique indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Composite indexes for sorting
CREATE INDEX idx_cards_by_column_position 
  ON cards(column_id, position);
```

### Caching Strategies

**Frontend Optimization:**
1. **Optimistic Updates** - Update UI before server response
2. **State Management** - Keep board data in component state
3. **Lazy Loading** - Load boards on demand

**Example - Optimistic Card Move:**
```javascript
// 1. Update UI immediately (optimistic)
setBoard(prev => ({
  ...prev,
  columns: prev.columns.map(col => {
    // Move card locally
  })
}));

// 2. Make API request
const response = await fetch('/api/cards/:id/move', {
  method: 'POST',
  body: JSON.stringify(moveData)
});

// 3. If error, revert
if (!response.ok) {
  loadBoard(); // Reload from server
}
```

### Response Time Targets

- Authentication endpoints: < 200ms
- GET board (with columns/cards): < 500ms
- Create/Update/Delete: < 300ms
- Drag-drop move: < 100ms (optimistic)

---

## Common Operations

### Transaction Example - Moving Card

```javascript
// Atomic operation: move card and reorder positions
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // 1. Update moved card
  await client.query(
    'UPDATE cards SET column_id = $1, position = $2 WHERE id = $3',
    [newColumnId, newPosition, cardId]
  );
  
  // 2. Reorder other cards
  await client.query(
    `UPDATE cards SET position = position - 1
     WHERE column_id = $1 AND position > $2`,
    [oldColumnId, oldPosition]
  );
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### Cascading Deletes

```sql
-- Delete board cascades to all related data
DELETE FROM boards WHERE id = 123;

-- Cascade path:
-- boards(123) → columns → cards
```

---

## Error Handling

### Standard Error Responses

```javascript
// 400 - Validation Error
{
  "success": false,
  "message": "Email is required"
}

// 401 - Authentication/Authorization
{
  "success": false,
  "message": "Not authenticated" or "Unauthorized"
}

// 404 - Not Found
{
  "success": false,
  "message": "Board not found"
}

// 409 - Conflict (duplicate)
{
  "success": false,
  "message": "Email already exists"
}

// 500 - Server Error
{
  "success": false,
  "message": "Server error during operation"
}
```

---

This technical documentation provides a comprehensive overview of EpiTrello's architecture, APIs, and workflows. For implementation details, refer to the source code in the repository.