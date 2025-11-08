# Online Examination Portal - Backend

Backend API server for the Online Examination Portal built with Node.js and Express.

## Features

- JWT-based authentication
- User signup and login
- Role-based access control (Admin, Faculty, Student)
- Exam management
- Question management
- Exam submission and auto-grading
- Tab switching detection

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Default Credentials

- **Admin Username:** `admin12`
- **Admin Password:** `admin123`

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - Login user
- `GET /api/me` - Get current user (requires auth)

### Exams
- `GET /api/exams` - Get all exams (requires auth)
- `GET /api/exams/:id` - Get exam by ID (requires auth)
- `GET /api/exams/:id/questions` - Get exam questions (requires auth)
- `POST /api/exams/:id/submit` - Submit exam (requires auth)
- `POST /api/exams` - Create exam (Admin/Faculty only)

## Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env.example      # Environment variables example
└── README.md         # This file
```

## Notes

- Currently uses in-memory storage. For production, integrate with MongoDB, PostgreSQL, or your preferred database.
- Admin password is automatically hashed on server start.
- Students and Faculty can sign up via the `/api/signup` endpoint.

