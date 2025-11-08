import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, BarChart3, Upload, Eye, Plus, X, BarChart, Download } from 'lucide-react';
import ExamPortalLogo from './Logo';
import { examAPI } from '../api';
import UploadQuestions from './UploadQuestions';
import ViewQuestions from './ViewQuestions';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdminDashboard = ({ currentUser, onLogout }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [docxTargetExam, setDocxTargetExam] = useState(null);
  const [docxUploading, setDocxUploading] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    category: '',
    duration: 30,
    totalQuestions: 10
  });
  const navigate = useNavigate();
  const docxInputRef = useRef(null);

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

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await examAPI.createExam(newExam);
      alert('Exam created successfully!');
      setShowCreateModal(false);
      setNewExam({ title: '', category: '', duration: 30, totalQuestions: 10 });
      loadExams();
    } catch (error) {
      console.error('Failed to create exam:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create exam. Please try again.';
      alert(errorMessage);
    }
  };

  const handleUploadClick = (exam) => {
    setSelectedExam(exam);
    setShowUploadModal(true);
  };

  const handleViewClick = (exam) => {
    setSelectedExam(exam);
    setShowViewModal(true);
  };

  const handleAnalyticsClick = (exam) => {
    setSelectedExam(exam);
    setShowAnalyticsModal(true);
  };

  const handleUploadDOCXClick = (exam) => {
    setDocxTargetExam(exam);
    if (docxInputRef.current) {
      docxInputRef.current.click();
    }
  };

  const handleDOCXChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !docxTargetExam) return;
    setDocxUploading(true);
    try {
      const res = await examAPI.uploadQuestionsDOCX(docxTargetExam.id, file);
      const count = res?.data?.count;
      alert(count ? `DOCX uploaded successfully! ${count} questions added.` : 'DOCX uploaded successfully!');
      await loadExams();
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to upload DOCX. Please ensure the file is a valid .docx and format is correct.';
      alert(msg);
    } finally {
      setDocxUploading(false);
      setDocxTargetExam(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleExportExcel = async (examId) => {
    try {
      const response = await examAPI.exportExcel(examId);
      // Create Excel download
      const data = response.data.data;
      const csvContent = [
        ['Student Name', 'Roll Number', 'Score', 'Total', 'Percentage', 'Tab Switches', 'Submitted At'],
        ...data.map(row => [
          row['Student Name'],
          row['Roll Number'],
          row['Score'],
          row['Total'],
          row['Percentage'],
          row['Tab Switches'],
          row['Submitted At']
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${response.data.examTitle}_results.csv`;
      link.click();
      alert('Results exported successfully!');
    } catch (error) {
      console.error('Failed to export:', error);
      const errorMessage = error.response?.data?.error || 'Failed to export results. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <ExamPortalLogo size="normal" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentUser?.role === 'admin' ? 'Admin Dashboard' : 'Faculty Dashboard'}
                </h1>
                <p className="text-gray-600">Welcome back, {currentUser?.name}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Exams</h3>
                <p className="text-3xl font-bold text-blue-600">{exams.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Exams</h3>
                <p className="text-3xl font-bold text-green-600">
                  {exams.filter(e => e.status === 'active').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                <p className="text-3xl font-bold text-purple-600">100%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Available Exams</h2>
            {(currentUser?.role === 'admin' || currentUser?.role === 'faculty') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Exam
              </button>
            )}
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
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {exam.category} • {exam.duration} minutes • {exam.totalQuestions} questions
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUploadClick(exam)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Qs
                        </button>
                        <button
                          onClick={() => handleUploadDOCXClick(exam)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          disabled={docxUploading && docxTargetExam?.id === exam.id}
                          title="Upload Word (.docx)"
                        >
                          <Upload className="w-4 h-4" />
                          {docxUploading && docxTargetExam?.id === exam.id ? 'Uploading...' : 'Upload DOCX'}
                        </button>
                        <button
                          onClick={() => handleViewClick(exam)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleAnalyticsClick(exam)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          title="View Analytics"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportExcel(exam.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          title="Export Results"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Exam</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Title *
                </label>
                <input
                  type="text"
                  value={newExam.title}
                  onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter exam title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={newExam.category}
                  onChange={(e) => setNewExam({ ...newExam, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Technical, General"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Questions *
                  </label>
                  <input
                    type="number"
                    value={newExam.totalQuestions}
                    onChange={(e) => setNewExam({ ...newExam, totalQuestions: parseInt(e.target.value) })}
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Questions Modal */}
      {showUploadModal && selectedExam && (
        <UploadQuestions
          examId={selectedExam.id}
          examTitle={selectedExam.title}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedExam(null);
          }}
          onSuccess={() => {
            loadExams();
          }}
        />
      )}

      {/* View Questions Modal */}
      {showViewModal && selectedExam && (
        <ViewQuestions
          examId={selectedExam.id}
          examTitle={selectedExam.title}
          onClose={() => {
            setShowViewModal(false);
            setSelectedExam(null);
          }}
        />
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedExam && (
        <AnalyticsDashboard
          examId={selectedExam.id}
          examTitle={selectedExam.title}
          onClose={() => {
            setShowAnalyticsModal(false);
            setSelectedExam(null);
          }}
        />
      )}
      <input
        ref={docxInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleDOCXChange}
      />
    </div>
  );
};

export default AdminDashboard;

