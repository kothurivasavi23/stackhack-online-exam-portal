import React, { useState, useEffect } from 'react';
import { X, BarChart3, Users, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { examAPI } from '../api';

const AnalyticsDashboard = ({ examId, examTitle, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [examId]);

  const loadAnalytics = async () => {
    try {
      const response = await examAPI.getAnalytics(examId);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load analytics. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics - {examTitle}
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
            <p className="mt-2 text-gray-600">Loading analytics...</p>
          </div>
        ) : !analytics ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.totalSubmissions}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.averageScore}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Passed</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics.passCount}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{analytics.failCount}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Pass Rate */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Pass Rate</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${analytics.passRate}%` }}
                  ></div>
                </div>
                <span className="text-lg font-bold text-gray-900">{analytics.passRate}%</span>
              </div>
            </div>

            {/* Submissions List */}
            {analytics.submissions && analytics.submissions.length > 0 && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <h3 className="font-semibold text-gray-900">All Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Student</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Roll</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Score</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Percentage</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tab Switches</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analytics.submissions.map((sub, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{sub.studentName}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{sub.rollNumber || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{sub.score}/{sub.total}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`font-semibold ${sub.percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                              {sub.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">{sub.tabSwitches || 0}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              sub.percentage >= 70 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {sub.percentage >= 70 ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

