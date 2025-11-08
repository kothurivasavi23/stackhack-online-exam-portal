import React, { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { examAPI } from '../api';

const UploadQuestions = ({ examId, examTitle, onClose, onSuccess }) => {
  const [questions, setQuestions] = useState([
    { id: 1, type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }
  ]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions([...questions, {
      id: newId,
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        if (field === 'options') {
          const newOptions = [...q.options];
          newOptions[value.index] = value.value;
          return { ...q, options: newOptions };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await examAPI.uploadQuestions(examId, questions);
      alert('Questions uploaded successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to upload questions:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upload questions. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Upload Questions - {examTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900">Question {index + 1}</h3>
                <div className="flex gap-2">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="coding">Coding</option>
                    <option value="short">Short Answer</option>
                  </select>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question *
                  </label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Enter question text"
                  />
                </div>

                {q.type === 'mcq' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options *
                      </label>
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === optIndex}
                            onChange={() => updateQuestion(q.id, 'correctAnswer', optIndex)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateQuestion(q.id, 'options', { index: optIndex, value: e.target.value })}
                            required
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {q.type === 'coding' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code Template (Optional)
                    </label>
                    <textarea
                      value={q.placeholder || ''}
                      onChange={(e) => updateQuestion(q.id, 'placeholder', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="// Your code here\nfunction solution() {\n  // Write your code\n}"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marks *
                    </label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={(e) => updateQuestion(q.id, 'marks', parseInt(e.target.value))}
                      required
                      min="1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
            <div className="flex-1"></div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Questions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadQuestions;

