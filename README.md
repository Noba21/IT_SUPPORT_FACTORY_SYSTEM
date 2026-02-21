# Factory IT Support Management System

Full-stack web application for factory IT support, replacing WhatsApp-based issue communication.

## Tech Stack

- **Backend:** Node.js, Express, MySQL, JWT, bcrypt, Multer, Socket.io
- **Frontend:** React (Vite), Tailwind CSS, Axios, React Router, React Hook Form, Zod, Recharts, Socket.io client

## Setup

### 1. Database (WAMP / MySQL)

1. Start WAMP and ensure MySQL is running.
2. Create database and run schema:
   ```sql
   CREATE DATABASE it_support_factory;
   ```
3. Run `database/schema.sql` in MySQL.
4. Run `database/seed.sql` to add departments and default admin.

**Default admin:** `admin@factory.com` / `password`

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # or create .env with your DB credentials
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` with proxy to backend.

## Roles

- **Admin:** Reports, assign technicians, manage users, chat, filter issues
- **Department User:** Submit requests, view history, profile, mark fixed/not fixed, chat
- **Technician:** View assigned issues, update status, add resolution notes, chat

## API Overview

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (department only)
- `GET /api/auth/me` - Current user
- `GET /api/departments` - List departments (public)
- `GET/POST/PUT /api/issues` - Issues CRUD
- `GET/POST /api/chats/:issueId/messages` - Chat messages
- `GET /api/reports/*` - Admin reports
- `PUT /api/profile` - Update own profile
