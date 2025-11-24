# Frontend Pages

## Overview

EpiTrello's frontend is built with Next.js 15 App Router, React 19, and Tailwind CSS 4. All pages are located in the `app/` directory.

## Page Structure

```
app/
├── page.jsx              # Landing page (public)
├── login/
│   └── page.jsx         # Login page (public)
├── register/
│   └── page.jsx         # Registration page (public)
└── dashboard/
    └── page.jsx         # Dashboard (protected)
```

## Pages

### Landing Page (`app/page.jsx`)

**Route:** `/`  
**Type:** Server Component  
**Authentication:** Not required

**Purpose:**
The main marketing/welcome page introducing EpiTrello.

**Features:**
- Navigation bar with Docs, Features, Sign In, and Sign Up links
- Hero section with call-to-action buttons
- Visual demo of a Kanban board (3 columns: To Do, In Progress, Done)
- Features section highlighting key capabilities
- Dark mode support
- Geometric background patterns

**Key Components:**
- Navbar with LayoutDashboard icon
- Hero with Zap icon badge
- Kanban board demo with status indicators
- Feature cards with Layers, Zap, and CheckCircle2 icons

---

### Login Page (`app/login/page.jsx`)

**Route:** `/login`  
**Type:** Client Component (`'use client'`)  
**Authentication:** Not required

**Purpose:**
Authenticate existing users.

**State Management:**
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

**Form Fields:**
- Email (required, type="email")
- Password (required, type="password")

**Behavior:**
1. User fills form
2. On submit: POST to `/api/auth/login`
3. If successful: redirect to `/dashboard`
4. If error: display error message
5. Loading state shows spinner in button

**UI Features:**
- Card-based form layout
- LogIn icon in header
- Back to home link in top-left
- Error display in red banner
- Loading spinner with "Signing in..." text
- Link to registration page
- Geometric background

---

### Registration Page (`app/register/page.jsx`)

**Route:** `/register`  
**Type:** Client Component (`'use client'`)  
**Authentication:** Not required

**Purpose:**
Create new user accounts.

**State Management:**
```javascript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

**Form Fields:**
- Full Name (required, type="text")
- Email (required, type="email")
- Password (required, type="password", min 6 chars)
- Confirm Password (required, type="password")

**Client-Side Validation:**
```javascript
if (formData.password !== formData.confirmPassword) {
  setError("Passwords do not match");
  return;
}
if (formData.password.length < 6) {
  setError("Password must be at least 6 characters");
  return;
}
```

**Behavior:**
1. User fills form
2. Validate passwords match
3. On submit: POST to `/api/auth/register`
4. If successful: redirect to `/dashboard`
5. If error: display error message

**UI Features:**
- Card-based form layout
- UserPlus icon in header
- Back to home link
- Error display in red banner
- Loading state
- Link to login page

---

### Dashboard Page (`app/dashboard/page.jsx`)

**Route:** `/dashboard`  
**Type:** Client Component (`'use client'`)  
**Authentication:** Required (JWT token)

**Purpose:**
Protected page showing user information after login.

**State Management:**
```javascript
const [user, setUser] = useState(null);
const [error, setError] = useState('');
```

**Data Loading:**
```javascript
useEffect(() => {
  async function loadUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
    } else {
      setError(data.message || "Not authenticated");
    }
  }
  loadUser();
}, []);
```

**Features:**
- Fetches current user on mount
- Displays user name and email
- Logout button
- Shows loading state while fetching
- Shows error if not authenticated

**Logout Function:**
```javascript
const logout = async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
};
```

**Current UI:**
- Simple centered card
- Welcome message with user name
- Logout button
- *Note: Will be expanded with boards/tasks in future*

---

## UI Components

Located in `components/ui/`:

### Button (`components/ui/button.jsx`)
Pre-styled button component with variants

### Card (`components/ui/card.jsx`)
Card container with header, title, description, content, and footer sections

### Input (`components/ui/input.jsx`)
Styled input field

### Label (`components/ui/label.jsx`)
Form label component

## Styling

### Tailwind CSS Configuration

The project uses Tailwind CSS 4 with a zinc-based color palette:

**Colors:**
- zinc-50 to zinc-950 for grayscale
- White and black for primary elements
- No bright colors (sober design)

**Dark Mode:**
Enabled with `dark:` prefix, responds to system preferences

### Global Styles (`app/globals.css`)

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### Common Patterns

**Page Layout:**
```jsx
<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
  {/* Content */}
</div>
```

**Card Styling:**
```jsx
<Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
```

**Buttons:**
```jsx
<Button className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
```

## Icons

Using Lucide React:

```jsx
import { LogIn, UserPlus, ArrowLeft, Loader2, LayoutDashboard } from 'lucide-react';

<LogIn className="h-6 w-6" />
<Loader2 className="mr-2 h-4 w-4 animate-spin" />
```

## Navigation

### Client-Side Navigation

```jsx
import Link from 'next/link';

<Link href="/dashboard">Dashboard</Link>
```

### Programmatic Navigation

```jsx
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/dashboard');
```

## Form Handling Pattern

All forms follow this pattern:

1. **State** for form data and UI state (error, loading)
2. **handleChange** to update form fields
3. **handleSubmit** to send data to API
4. **Error display** in red banner
5. **Loading state** disables form and shows spinner

## Background Decorations

All pages include subtle geometric backgrounds:

```jsx
<div className="absolute inset-0 -z-10">
  <div className="absolute ... bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full blur-[120px] opacity-40"></div>
  {/* More gradient blobs */}
</div>
```

## Responsive Design

All pages are responsive using Tailwind breakpoints:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

Breakpoints:
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px

## Future Pages (Planned)

- `/boards` - List all user boards
- `/boards/[id]` - View specific board with columns and tasks
- `/boards/[id]/settings` - Board settings and member management
- `/profile` - User profile and settings

