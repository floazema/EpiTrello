# EpiTrello - Project Overview

## What is EpiTrello?

EpiTrello is a Kanban board web application for project management, inspired by Toyota's Kanban method. It allows users to organize projects into visual boards with cards representing tasks that can be moved between columns to track progress.

## Current Status

The project is currently in **Phase 1** - Authentication and User Management. 

### Implemented Features
✅ User registration with email and password  
✅ User login with JWT authentication  
✅ Protected dashboard  
✅ User session management  
✅ Secure logout  
✅ Modern, responsive UI with dark mode

### Planned Features (Not Yet Implemented)
🔜 Kanban boards creation and management  
🔜 Columns within boards  
🔜 Tasks/cards with drag & drop  
🔜 Task assignment to team members  
🔜 Priority levels and due dates  
🔜 Board sharing and collaboration  
🔜 Real-time updates

## Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** for UI components
- **Tailwind CSS 4** for styling
- **Lucide Icons** for iconography
- **shadcn/ui** component library

### Backend
- **Next.js API Routes** for serverless functions
- **PostgreSQL** for data persistence
- **JWT** for authentication tokens
- **bcryptjs** for password hashing

### DevOps
- **Docker & Docker Compose** for containerization
- **PostgreSQL** containerized database

## Project Structure

```
EpiTrello/
├── app/                      # Next.js App Router
│   ├── api/auth/            # Authentication endpoints
│   │   ├── login/           # Login route
│   │   ├── register/        # Registration route
│   │   ├── logout/          # Logout route
│   │   └── me/              # Get current user
│   ├── dashboard/           # Protected dashboard page
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── page.jsx             # Landing page
├── components/ui/           # Reusable UI components
├── docs/                    # Project documentation
├── lib/                     # Utility functions
│   ├── auth.js             # Authentication helpers
│   ├── db.js               # Database connection
│   └── utils.js            # General utilities
├── scripts/                 # Setup scripts
│   └── init-db.js          # Database initialization
├── docker-compose.yml       # Docker configuration
└── Dockerfile              # Application container

```

## Key Design Decisions

### Authentication
- JWT tokens stored in httpOnly cookies for security
- 7-day token expiration
- Password hashing with bcrypt (10 salt rounds)
- Secure cookie flags in production

### Database
- PostgreSQL chosen for reliability and ACID compliance
- Connection pooling for performance
- Parameterized queries to prevent SQL injection

### UI/UX
- Sober, professional design with black/white/gray palette
- Dark mode support throughout
- Responsive design for all screen sizes
- Subtle geometric backgrounds for visual interest

## Getting Started

See the **Setup Guide** in the Developer Guide section for installation instructions.

## Documentation Structure

This documentation is organized into two main categories:

### User Documentation
- **Account Management** - Registration, login, and profile

### Developer Documentation
- **Setup Guide** - Installation and configuration
- **Database Schema** - Database structure
- **API Reference** - API endpoints
- **Frontend Pages** - Pages and components
- **Docker Configuration** - Container setup
- **CI/CD Setup** - GitHub Actions workflows

