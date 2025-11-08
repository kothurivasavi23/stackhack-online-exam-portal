import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import ExamPortalLogo from './Logo';
import { examAPI } from '../api';

const exportToPDF = (results, examTitle) => {
  const printWindow = window.open('', '_blank');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Exam Results - ${examTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          .score { font-size: 24px; font-weight: bold; color: #4F46E5; }
          .details { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Exam Results - ${examTitle}</h1>
        <div class="details">
          <p class="score">Score: ${results.score} / ${results.total} (${results.percentage}%)</p>
          <p>Tab Switches: ${results.tabSwitches || 0}</p>
          <p>Submitted At: ${new Date(results.submittedAt).toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};

const ResultsPage = ({ currentUser }) => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results || null;
  const [examTitle, setExamTitle] = useState('Exam');

  useEffect(() => {
    // Load exam title if available
    if (examId) {
      examAPI.getExam(examId)
        .then(response => setExamTitle(response.data.title))
        .catch(() => {});
    }
  }, [examId]);

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Results not found</p>
          <button onClick={() => navigate('/student')} className="mt-4 text-blue-600">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ExamPortalLogo size="large" />
          </div>
          <div className="flex justify-center mb-2">
            {results.percentage >= 70 ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Completed!</h1>
          <p className="text-gray-600">Your results are ready</p>
        </div>

        <div className="space-y-6">
          <div className={`rounded-lg p-6 ${
            results.percentage >= 70 ? 'bg-green-50' : 
            results.percentage >= 50 ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className="text-center">
              <p className={`text-4xl font-bold ${
                results.percentage >= 70 ? 'text-green-600' : 
                results.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {results.percentage}%
              </p>
              <p className="text-gray-600 mt-2">
                Score: {results.score} / {results.total}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {results.percentage >= 70 ? 'Excellent!' : 
                 results.percentage >= 50 ? 'Good effort!' : 'Keep practicing!'}
              </p>
            </div>
          </div>

          {results.tabSwitches > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-5 h-5" />
                <span>
                  Warning: {results.tabSwitches} tab switch{results.tabSwitches !== 1 ? 'es' : ''} detected during exam
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => exportToPDF(results, examTitle || 'Exam')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Download PDF
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/student')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;

