# API Reference

All API routes are located in the `app/api/` directory and follow Next.js API route conventions.

## Base URL

Development: `http://localhost:3000/api`

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Validation:**
- All fields are required
- Password must be at least 6 characters
- Email must be unique (not already registered)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

400 - Missing fields:
```json
{
  "success": false,
  "message": "Tous les champs sont requis"
}
```

400 - Password too short:
```json
{
  "success": false,
  "message": "Le mot de passe doit contenir au moins 6 caractères"
}
```

409 - Email already exists:
```json
{
  "success": false,
  "message": "Cet email est déjà utilisé"
}
```

**Side Effects:**
- Creates user in database with hashed password
- Generates JWT token
- Sets `auth_token` httpOnly cookie (7-day expiration)

---

### POST /api/auth/login

Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**

400 - Missing credentials:
```json
{
  "success": false,
  "message": "Email et mot de passe requis"
}
```

401 - Invalid credentials:
```json
{
  "success": false,
  "message": "Email ou mot de passe incorrect"
}
```

**Side Effects:**
- Verifies password with bcrypt
- Generates JWT token
- Sets `auth_token` httpOnly cookie (7-day expiration)

---

### GET /api/auth/me

Get current authenticated user information.

**Authentication Required:** Yes (JWT token in cookie)

**Request Headers:**
```
Cookie: auth_token=<jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

401 - Not authenticated:
```json
{
  "success": false,
  "message": "Non authentifié"
}
```

401 - Invalid token:
```json
{
  "success": false,
  "message": "Token invalide"
}
```

404 - User not found:
```json
{
  "success": false,
  "message": "Utilisateur non trouvé"
}
```

---

### POST /api/auth/logout

Log out the current user.

**Authentication Required:** No (but cookie must exist to clear)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

**Side Effects:**
- Clears `auth_token` cookie (sets maxAge to 0)

---

## Authentication Flow

### Registration Flow

```
1. User submits registration form
2. Frontend sends POST /api/auth/register
3. Backend validates input
4. Backend checks if email exists
5. Backend hashes password with bcrypt
6. Backend inserts user into database
7. Backend generates JWT token
8. Backend sets httpOnly cookie
9. Backend returns user data
10. Frontend redirects to dashboard
```

### Login Flow

```
1. User submits login form
2. Frontend sends POST /api/auth/login
3. Backend retrieves user by email
4. Backend compares password hashes
5. Backend generates JWT token
6. Backend sets httpOnly cookie
7. Backend returns user data
8. Frontend redirects to dashboard
```

### Protected Route Flow

```
1. User visits protected page (e.g., dashboard)
2. Frontend sends GET /api/auth/me
3. Backend reads auth_token from cookie
4. Backend verifies JWT token
5. Backend retrieves user from database
6. Backend returns user data
7. Frontend displays user info
```

## JWT Token Structure

Tokens are generated in `lib/auth.js` with the following payload:

```javascript
{
  userId: 1,
  email: "john@example.com",
  iat: 1705315800,  // Issued at
  exp: 1705920600   // Expires in 7 days
}
```

**Configuration:**
- Secret: `process.env.JWT_SECRET`
- Expiration: 7 days
- Algorithm: HS256 (default)

## Cookie Configuration

```javascript
{
  httpOnly: true,              // Prevents JavaScript access
  secure: NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'lax',            // CSRF protection
  maxAge: 60 * 60 * 24 * 7,   // 7 days in seconds
  path: '/'                    // Available site-wide
}
```

## Error Handling

All API routes follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Server Error

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Signing**: Tokens signed with secret key
3. **HttpOnly Cookies**: Prevents XSS attacks
4. **Parameterized Queries**: Prevents SQL injection
5. **Token Expiration**: 7-day automatic expiration
6. **Secure Flag**: HTTPS-only cookies in production
7. **SameSite**: CSRF protection

## Testing API Endpoints

Using curl:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt

# Get current user (using saved cookie)
curl http://localhost:3000/api/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

