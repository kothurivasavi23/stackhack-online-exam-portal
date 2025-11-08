import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { practiceTests } from '../practiceData';

const PracticeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const test = useMemo(() => practiceTests.find(t => t.id === id), [id]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => (test ? test.duration * 60 : 0));

  // Reset timer if test changes
  useEffect(() => {
    if (test) {
      setSecondsLeft(test.duration * 60);
      setSubmitted(false);
      setAnswers({});
    }
  }, [test]);

  // Countdown effect, auto-submit on timeout
  useEffect(() => {
    if (!test || submitted) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test, submitted]);

  const formatTime = (total) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = Math.floor(total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Practice test not found.</p>
          <button className="text-blue-600" onClick={() => navigate('/practice')}>Back to Practice List</button>
        </div>
      </div>
    );
  }

  const score = submitted
    ? test.questions.reduce((s, q, idx) => s + (answers[idx] === q.answerIndex ? 1 : 0), 0)
    : 0;

  const handleSelect = (qIndex, optIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-gray-600 text-sm">{test.category} • {test.duration} minutes • {test.totalQuestions} questions</p>
          </div>
          <div className="flex items-center gap-4">
            {!submitted && (
              <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold" aria-label="time remaining">
                {formatTime(secondsLeft)}
              </div>
            )}
            <button onClick={() => navigate('/practice')} className="text-blue-600 hover:text-blue-800">Exit</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!submitted ? (
          <div className="space-y-6">
            {test.questions.map((q, qi) => (
              <div key={q.id} className="bg-white rounded-xl shadow p-6 border">
                <h3 className="font-semibold text-gray-900 mb-4">Q{qi + 1}. {q.text}</h3>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${answers[qi] === oi ? 'bg-purple-50 border-purple-300' : 'hover:bg-gray-50'}`}>
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        checked={answers[qi] === oi}
                        onChange={() => handleSelect(qi, oi)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 text-center border">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Score</h2>
            <p className="text-4xl font-extrabold text-purple-700">{score} / {test.totalQuestions}</p>
            <p className="text-gray-600 mt-2">Great job! Review and try another test.</p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg" onClick={() => navigate('/practice')}>
                Back to Practice List
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PracticeExam;
