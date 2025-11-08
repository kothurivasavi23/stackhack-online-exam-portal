import React, { useState, useEffect } from 'react';
import { X, Eye, Code, FileText, CheckCircle } from 'lucide-react';
import { examAPI } from '../api';

const ViewQuestions = ({ examId, examTitle, onClose }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [examId]);

  const loadQuestions = async () => {
    try {
      const response = await examAPI.getExamQuestions(examId);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load questions. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionIcon = (type) => {
    switch (type) {
      case 'mcq':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'coding':
        return <Code className="w-5 h-5 text-green-600" />;
      case 'short':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            View Questions - {examTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No questions uploaded yet.</p>
            <p className="text-sm mt-2">Click "Upload Qs" to add questions to this exam.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={q.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  {getQuestionIcon(q.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">
                        Question {index + 1} ({q.type.toUpperCase()})
                      </span>
                      <span className="text-sm text-gray-500">Marks: {q.marks || 1}</span>
                    </div>
                    <p className="text-gray-900 font-medium">{q.question}</p>
                  </div>
                </div>

                {q.type === 'mcq' && q.options && (
                  <div className="ml-8 space-y-2">
                    {q.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`flex items-center gap-2 p-2 rounded ${
                          optIndex === q.correctAnswer
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className={optIndex === q.correctAnswer ? 'font-medium text-green-700' : 'text-gray-700'}>
                          {option}
                        </span>
                        {optIndex === q.correctAnswer && (
                          <span className="ml-auto text-green-600 text-sm font-semibold">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'coding' && q.placeholder && (
                  <div className="ml-8 mt-2">
                    <p className="text-sm text-gray-600 mb-1">Code Template:</p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {q.placeholder}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewQuestions;

