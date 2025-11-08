import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, BarChart3 } from 'lucide-react';
import ExamPortalLogo from './Logo';
import { examAPI } from '../api';

const StudentDashboard = ({ currentUser, onLogout }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const response = await examAPI.getExams();
      setExams(response.data || []);
    } catch (error) {
      console.error('Failed to load exams:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load exams. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startExam = (exam) => {
    navigate(`/exam/${exam.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <ExamPortalLogo size="normal" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-gray-600">
                  Welcome, {currentUser?.name} {currentUser?.roll && `(${currentUser.roll})`}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Exams</h3>
            <p className="text-3xl font-bold text-blue-600">{exams.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Exams</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
            <p className="text-3xl font-bold text-purple-600">-</p>
          </div>
          <button
            onClick={() => navigate('/practice')}
            className="bg-white rounded-xl shadow-md p-6 text-left border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5" /> Practice Tests</h3>
                <p className="text-gray-600">Try mock exams to prepare</p>
              </div>
              <span className="text-purple-700 font-semibold">Start →</span>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Available Exams</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading exams...</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No exams available
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map(exam => (
                  <div key={exam.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {exam.category} • {exam.duration} minutes • {exam.totalQuestions} questions
                        </p>
                      </div>
                      <button
                        onClick={() => startExam(exam)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        Start Exam
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

