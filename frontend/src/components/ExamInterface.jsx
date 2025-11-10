import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import ExamPortalLogo from './Logo';
import { examAPI } from '../api';

const ExamInterface = ({ currentUser }) => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const submittingRef = useRef(false);
  const MAX_TAB_SWITCHES = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSwitchRef = useRef(0);

  useEffect(() => {
    loadExamData();
  }, [examId]);

  // (moved below, after handleExamSubmit is defined)

  const handleExamSubmit = useCallback(async () => {
    try {
      if (submittingRef.current || isSubmitting) return;
      submittingRef.current = true;
      setIsSubmitting(true);
      const response = await examAPI.submitExam(examId, {
        answers: studentAnswers,
        tabSwitches: tabSwitchCount
      });
      navigate(`/results/${examId}`, { state: { results: response.data } });
    } catch (error) {
      console.error('Failed to submit exam:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit exam. Please try again.';
      setErrorMsg(errorMessage);
      alert(errorMessage);
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [examId, studentAnswers, tabSwitchCount, navigate]);

  // Tab switching detection + auto-submit after MAX_TAB_SWITCHES
  useEffect(() => {
    const onTabSwitch = () => {
      if (!examStarted || !exam) return;
      if (submittingRef.current) return;
      const now = Date.now();
      if (now - lastSwitchRef.current < 1500) return; // debounce double events
      lastSwitchRef.current = now;
      setTabSwitchCount(prev => {
        const next = prev + 1;
        if (next >= MAX_TAB_SWITCHES) {
          alert(`Exam will be auto-submitted due to ${next} tab switches.`);
          handleExamSubmit();
        } else {
          const remaining = MAX_TAB_SWITCHES - next;
          alert(`Warning: Tab switch detected. ${remaining} ${remaining === 1 ? 'chance' : 'chances'} left before auto-submit.`);
        }
        return next;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) onTabSwitch();
    };
    const handleWindowBlur = () => onTabSwitch();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [examStarted, exam, handleExamSubmit]);

  // Timer functionality
  useEffect(() => {
    let timer;
    if (examStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleExamSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeRemaining, handleExamSubmit]);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadExamData = async () => {
    try {
      const [examResponse, questionsResponse] = await Promise.all([
        examAPI.getExam(examId),
        examAPI.getExamQuestions(examId)
      ]);
      setExam(examResponse.data);
      
      // Randomize question order for each student
      const allQuestions = Array.isArray(questionsResponse.data) ? questionsResponse.data : [];
      if (allQuestions.length === 0) {
        setErrorMsg('No questions available for this exam. Please contact the administrator.');
        return;
      }
      const randomizedQuestions = shuffleArray(allQuestions).map((q, index) => ({
        ...q,
        displayId: index + 1
      }));
      
      // Randomize options for MCQ questions
      const questionsWithShuffledOptions = randomizedQuestions.map(q => {
        if (q.type === 'mcq' && q.options && q.correctAnswer !== undefined) {
          const options = [...q.options];
          const correctAnswer = options[q.correctAnswer];
          const shuffledOptions = shuffleArray(options);
          const newCorrectAnswer = shuffledOptions.indexOf(correctAnswer);
          
          return {
            ...q,
            options: shuffledOptions,
            correctAnswer: newCorrectAnswer,
            originalCorrectAnswer: q.correctAnswer
          };
        }
        return q;
      });
      
      setQuestions(questionsWithShuffledOptions);
      setTimeRemaining(examResponse.data.duration * 60);
    } catch (error) {
      console.error('Failed to load exam:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to load exam. Please try again.';
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startExam = () => {
    if (!questions || questions.length === 0) {
      setErrorMsg('No questions available to start this exam.');
      return;
    }
    setExamStarted(true);
    setTabSwitchCount(0);
    setStudentAnswers({});
    setCurrentQuestionIndex(0);
    // Try to enter fullscreen to discourage switching
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    } catch {}
  };

  const handleAnswerChange = (questionId, answer) => {
    setStudentAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam || (!questions.length && !errorMsg)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ExamPortalLogo size="large" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{exam.title}</h1>
            <p className="text-gray-600">{exam.category} Exam</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Duration:</strong> {exam.duration} minutes</p>
              <p className="text-gray-700"><strong>Total Questions:</strong> {questions.length}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold mb-1">Important Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Do not switch tabs during the exam</li>
                    <li>Time will start as soon as you click "Start Exam"</li>
                    <li>You can navigate between questions using Previous/Next buttons</li>
                    <li>Submit your exam before the time runs out</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/student')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={startExam}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">No questions available for this exam.</p>
          <button className="text-blue-600" onClick={() => navigate('/student')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <ExamPortalLogo size="small" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
                <p className="text-gray-600">{exam.category} Exam</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{formatTime(timeRemaining)}</span>
              </div>
              {tabSwitchCount > 0 && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    {tabSwitchCount} tab switch{tabSwitchCount !== 1 ? 'es' : ''}
                    {tabSwitchCount < MAX_TAB_SWITCHES ? ` (max ${MAX_TAB_SWITCHES})` : ' (limit reached)'}
                  </span>
                </div>
              )}
              <button
                onClick={handleExamSubmit}
                disabled={isSubmitting}
                className={`px-3 py-1 rounded-lg text-white ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-semibold">{errorMsg}</p>
            <div className="mt-2">
              <button onClick={() => navigate('/student')} className="text-blue-600 underline">Back to Dashboard</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{currentQuestion.question}</h2>

            {currentQuestion.type === 'mcq' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={index}
                      checked={studentAnswers[currentQuestion.id] === index}
                      onChange={() => handleAnswerChange(currentQuestion.id, index)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'coding' && (
              <div>
                <textarea
                  value={studentAnswers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="w-full h-64 p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleExamSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamInterface;

