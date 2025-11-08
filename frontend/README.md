# Online Examination Portal - Frontend

Frontend application for the Online Examination Portal built with React and Vite.

## Features

- Modern, responsive UI with Tailwind CSS
- User authentication (Login/Signup)
- Role-based dashboards (Admin, Faculty, Student)
- Online exam interface with timer
- Tab switching detection
- Results display
- Beautiful gradient designs

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode:
```bash
npm run dev
```

The application will run on `http://localhost:3000`

### Build for Production:
```bash
npm run build
```

### Preview Production Build:
```bash
npm run preview
```

## Default Credentials

- **Admin Username:** `admin12`
- **Admin Password:** `admin123`
- **Students/Faculty:** Create account via Sign Up page

## Project Structure

```
frontend/
├── src/
│   ├── components/       # React components
│   │   ├── Logo.jsx      # Logo component
│   │   ├── Login.jsx     # Login page
│   │   ├── Signup.jsx    # Signup page
│   │   ├── AdminDashboard.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── ExamInterface.jsx
│   │   └── ResultsPage.jsx
│   ├── App.jsx          # Main app component with routing
│   ├── api.js           # API client configuration
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
└── README.md           # This file
```

## Features Overview

### Authentication
- Secure login and signup
- JWT token management
- Automatic token refresh handling
- Protected routes

### Student Features
- View available exams
- Start and take exams
- Timer countdown
- Navigate between questions
- Submit exam
- View results

### Admin/Faculty Features
- Dashboard with exam statistics
- View all exams
- Create and manage exams (coming soon)

### Security Features
- Tab switching detection
- Time-based exam restrictions
- Secure API communication

## Technology Stack

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS (via CDN)
- Lucide React (Icons)

## Notes

- Make sure the backend server is running on `http://localhost:5000` before starting the frontend
- The frontend is configured to proxy API requests to the backend automatically
- All API calls include authentication tokens automatically

