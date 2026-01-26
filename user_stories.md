# EpiTrello User Stories

## Authentication & Accounts
- As a visitor, I can register with email and password so I can create an account.
  - Acceptance: Given valid email/password, when I submit, then I see success and I’m redirected to login.
  - Validation: Email format validated; password must meet minimum complexity; duplicate email is rejected.

- As a user, I can log in so I can access my dashboard.
  - Acceptance: Given correct credentials, when I log in, then a session token is created and I reach the dashboard.
  - Security: Token is httpOnly; expires in 7 days.

- As a user, I can log out so my session ends.
  - Acceptance: When I click logout, then my token is invalidated and I’m returned to the landing page.

## Boards
- As a user, I can create a board to organize a project.
  - Acceptance: Board has name, optional description, color; I become the owner.

- As a user, I can view a list of my boards on the dashboard.
  - Acceptance: Boards show name/color; empty state when none.

- As a board owner, I can delete a board I own.
  - Acceptance: When I confirm delete, then board and its columns/cards are removed.

## Columns
- As a board owner, I can add columns to a board (e.g., "To Do", "In Progress", "Done").
  - Acceptance: Column has name and position; appears on the board in order.

- As a user, I can reorder columns to reflect workflow.
  - Acceptance: Drag-and-drop updates position and persists.

## Cards
- As a user, I can create a card in a column to track tasks.
  - Acceptance: Card has title, optional description, priority, due_date, tags, color.

- As a user, I can move a card between columns to update status.
  - Acceptance: Drag-and-drop updates column_id and position; UI updates without reload.

- As a user, I can edit a card’s details.
  - Acceptance: Updates persist and are visible to board collaborators.

## Collaboration
- As a board owner, I can invite users to my board to collaborate.
  - Acceptance: Invited users can view and modify cards per role.

- As a user, I can assign a card to a team member.
  - Acceptance: Card shows assignee; filter by assignee on board.

## Productivity
- As a user, I can set priority and due date on cards to manage urgency.
  - Acceptance: Priority options include low/medium/high; due date picker; overdue indicators.

- As a user, I can filter cards by tag, assignee, or priority.
  - Acceptance: Filters apply instantly; clear-all resets view.

## Real-Time & UX
- As a user, I see real-time updates when teammates change cards.
  - Acceptance: Board updates without manual refresh.

- As a user, I can use the app comfortably in dark mode.
  - Acceptance: UI respects global dark theme; consistent styles.

## Non-Functional
- Performance: Board interactions are responsive (<100ms UI updates).
- Security: Passwords hashed with bcrypt; JWT verification on protected routes.
- Reliability: DB schema uses referential integrity and indexes on key fields.

## Phasing
- Phase 1 (Complete): Registration, login, protected dashboard, logout.
- Phase 2: Boards, columns, cards CRUD + drag-and-drop.
- Phase 3: Collaboration, assignment, filters.
- Phase 4: Real-time updates and advanced UX.