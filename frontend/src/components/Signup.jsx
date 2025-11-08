import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Loader } from 'lucide-react';
import ExamPortalLogo from './Logo';
import { authAPI } from '../api';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    facultySubRole: '',
    name: '',
    roll: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const FACE_SIZE = 16;
  const [faceSaved, setFaceSaved] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterFaceNow = async () => {
    try {
      setError('');
      if (formData.role !== 'faculty') return;
      if (!formData.username) { setError('Enter username first'); return; }
      if (!videoRef.current || !streamRef.current) { setError('Camera not ready'); return; }
      await new Promise(r => setTimeout(r, 300));
      const canvas = document.createElement('canvas');
      canvas.width = FACE_SIZE; canvas.height = FACE_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, FACE_SIZE, FACE_SIZE);
      const { data } = ctx.getImageData(0, 0, FACE_SIZE, FACE_SIZE);
      const vec = [];
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        vec.push(gray);
      }
      const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
      const desc = vec.map(v => v / norm);
      localStorage.setItem(`face_desc_${formData.username.trim().toLowerCase()}`, JSON.stringify(desc));
      setFaceSaved(true);
    } catch (e) {
      setError('Failed to capture face');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // If faculty, capture a face descriptor and store locally for sign-in later
      if (formData.role === 'faculty') {
        if (!videoRef.current || !streamRef.current) {
          setError('Camera not ready. Please allow camera access.');
          setLoading(false);
          return;
        }
        // small delay
        await new Promise(r => setTimeout(r, 400));
        const canvas = document.createElement('canvas');
        canvas.width = FACE_SIZE; canvas.height = FACE_SIZE;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, FACE_SIZE, FACE_SIZE);
        const { data } = ctx.getImageData(0, 0, FACE_SIZE, FACE_SIZE);
        const vec = [];
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          vec.push(gray);
        }
        const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
        const desc = vec.map(v => v / norm);
        localStorage.setItem(`face_desc_${formData.username}`, JSON.stringify(desc));
        setFaceSaved(true);
      }

      const { confirmPassword, ...signupData } = formData;
      const response = await authAPI.signup(signupData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin(user);
      
      // Redirect back to login page after successful signup
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start/stop camera automatically when role is faculty
  useEffect(() => {
    const startCam = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        if (!streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        }
      } catch (e) {
        // ignore; user may deny permissions
      }
    };
    const stopCam = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
    if (formData.role === 'faculty') startCam(); else stopCam();
    return () => stopCam();
  }, [formData.role]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ExamPortalLogo size="large" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join the Online Examination Portal</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Choose a username (min 3 chars)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {formData.role === 'faculty' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty Role *
                </label>
                <select
                  name="facultySubRole"
                  value={formData.facultySubRole}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose role</option>
                  <option value="principal">Principal</option>
                  <option value="hod">HOD</option>
                  <option value="senior_professor">Senior Professor</option>
                  <option value="assistant_professor">Assistant Professor</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                Face will be captured automatically from your camera during signup for Faculty login.
              </div>
              <div className="mt-2">
                <video ref={videoRef} className="w-full rounded" muted playsInline />
                <p className="text-xs text-gray-500 mt-1">Allow camera permission to register your face.</p>
                <button
                  type="button"
                  onClick={handleRegisterFaceNow}
                  className="mt-2 w-full border border-blue-300 text-blue-700 hover:bg-blue-50 rounded-lg py-2"
                >
                  {faceSaved ? 'Face Registered ✔' : 'Register Face Now'}
                </button>
              </div>
            </>
          )}

          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number (Optional)
              </label>
              <input
                type="text"
                name="roll"
                value={formData.roll}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your roll number"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter password (min 6 chars)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

