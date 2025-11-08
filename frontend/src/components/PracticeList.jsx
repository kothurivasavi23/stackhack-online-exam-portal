import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { practiceTests } from '../practiceData';

const PracticeList = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BookOpen className="w-6 h-6" /> Practice Tests</h1>
          <button onClick={() => navigate('/student')} className="text-blue-600 hover:text-blue-800">Back to Dashboard</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {practiceTests.length === 0 ? (
          <div className="text-center text-gray-600">No practice tests available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {practiceTests.map(test => (
              <div key={test.id} className="bg-white rounded-xl shadow-md p-6 border">
                <h2 className="text-lg font-semibold text-gray-900">{test.title}</h2>
                <p className="text-gray-600 text-sm">{test.category} • {test.duration} minutes • {test.totalQuestions} questions</p>
                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/practice/${test.id}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Start Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PracticeList;
