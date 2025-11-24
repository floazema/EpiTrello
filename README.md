# EpiTrello

EpiTrello is an online project management tool, inspired by Toyota's Kanban method. It is based on the organization of projects into boards listing cards, each representing tasks. Cards are assignable to users and are movable from one board to another, reflecting their progress.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start with Docker (recommended)
docker compose up

# Access the application
open http://localhost:3000
```

## 📚 Documentation

For complete documentation, visit `/docs` or [Cahier des charges](./Cahier_des_charges.md)

The documentation includes:
- Project overview and features
- Technology stack
- Installation and setup guide
- Architecture overview
- Database schema
- Authentication system
- API reference
- Docker configuration
- Deployment guide
- Development guidelines

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes, PostgreSQL
- **Authentication:** JWT, bcryptjs
- **DevOps:** Docker, Docker Compose

## 📖 Project Structure

```
app/              # Next.js pages and API routes
components/       # Reusable React components
lib/              # Utility functions
scripts/          # Database initialization scripts
```

## 🔧 Development

```bash
# Start development server (without Docker)
npm run dev

# Initialize database manually
npm run init-db
```

## 📝 License

This project is part of Epitech curriculum.

---

For detailed documentation, visit the `/docs` page in the application.