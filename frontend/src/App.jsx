import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoleLogin from './components/RoleLogin';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import ExamInterface from './components/ExamInterface';
import ResultsPage from './components/ResultsPage';
import { authAPI } from './api';
import LandingPage from './components/LandingPage';
import PracticeList from './components/PracticeList';
import PracticeExam from './components/PracticeExam';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // Verify token is still valid
      authAPI.getCurrentUser()
        .then(response => {
          setCurrentUser(response.data);
        })
        .catch((err) => {
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            // Backend may have restarted (in-memory users lost) or temporary error.
            // Preserve session using saved local data.
            try {
              setCurrentUser(JSON.parse(savedUser));
            } catch {}
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route path="/home" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            (currentUser || localStorage.getItem('token')) ? (
              <Navigate to="/dashboard" />
            ) : (
              <RoleLogin onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            currentUser ? (
              <Navigate to={currentUser.role === 'admin' || currentUser.role === 'faculty' ? '/admin' : '/student'} />
            ) : (
              <Signup onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            (() => {
              const token = localStorage.getItem('token');
              const saved = localStorage.getItem('user');
              const effectiveUser = currentUser || (saved ? JSON.parse(saved) : null);
              if (!effectiveUser && !token) return <Navigate to="/login" />;
              if (effectiveUser && (effectiveUser.role === 'admin' || effectiveUser.role === 'faculty')) {
                return <Navigate to="/admin" />;
              }
              return <Navigate to="/student" />;
            })()
          }
        />
        <Route
          path="/admin"
          element={
            (() => {
              const token = localStorage.getItem('token');
              const saved = localStorage.getItem('user');
              const effectiveUser = currentUser || (saved ? JSON.parse(saved) : null);
              if (!effectiveUser && !token) return <Navigate to="/login" />;
              if (effectiveUser && (effectiveUser.role === 'admin' || effectiveUser.role === 'faculty')) {
                return <AdminDashboard currentUser={effectiveUser} onLogout={handleLogout} />;
              }
              return <Navigate to="/login" />;
            })()
          }
        />
        <Route
          path="/student"
          element={
            (() => {
              const token = localStorage.getItem('token');
              const saved = localStorage.getItem('user');
              const effectiveUser = currentUser || (saved ? JSON.parse(saved) : null);
              if (!effectiveUser && !token) return <Navigate to="/login" />;
              // If token exists but user not yet loaded, still allow student dashboard to render
              if (!effectiveUser && token) {
                return <StudentDashboard currentUser={null} onLogout={handleLogout} />;
              }
              if (effectiveUser && effectiveUser.role === 'student') {
                return <StudentDashboard currentUser={effectiveUser} onLogout={handleLogout} />;
              }
              return <Navigate to="/login" />;
            })()
          }
        />
        <Route
          path="/practice"
          element={
            currentUser && currentUser.role === 'student' ? (
              <PracticeList />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/practice/:id"
          element={
            currentUser && currentUser.role === 'student' ? (
              <PracticeExam />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/exam/:examId"
          element={
            (() => {
              const token = localStorage.getItem('token');
              const saved = localStorage.getItem('user');
              const effectiveUser = currentUser || (saved ? JSON.parse(saved) : null);
              if (!effectiveUser && !token) return <Navigate to="/login" />;
              return <ExamInterface currentUser={effectiveUser} />;
            })()
          }
        />
        <Route
          path="/results/:examId"
          element={
            currentUser ? (
              <ResultsPage currentUser={currentUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

