import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Upload, FileText, AlertCircle, Loader } from 'lucide-react';
import ExamPortalLogo from './Logo';
import { authAPI } from '../api';

const RoleLogin = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [facultySubRole, setFacultySubRole] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    // no-op mount effect; kept for parity if needed later
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get('role');
    if (role === 'faculty' || role === 'student' || role === 'admin') {
      setSelectedRole(role);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedRole) {
      setError('Please select a login role');
      return;
    }

    if (selectedRole === 'faculty' && !facultySubRole) {
      setError('Please select faculty role');
      return;
    }

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      const { token, user } = response.data;

      // Verify role matches selected role
      if (user.role !== selectedRole) {
        setError(`Please use ${selectedRole} credentials`);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin(user);
      
      // Navigate directly based on role to avoid transient redirect issues
      if (user.role === 'admin' || user.role === 'faculty') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ExamPortalLogo size="large" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Online Examination Portal</h1>
          <p className="text-gray-600">Secure Digital Learning & Assessment</p>
          <div className="mt-2">
            <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Go to Home</button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!selectedRole ? (
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('admin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Admin Login
            </button>
            <button
              onClick={() => handleRoleSelect('faculty')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Faculty Login
            </button>
            <button
              onClick={() => handleRoleSelect('student')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Student Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4 pb-4 border-b">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-gray-600 hover:text-gray-900 text-sm flex items-center gap-1"
              >
                ← Back to role selection
              </button>
              <div className={`mt-3 w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
                selectedRole === 'admin' ? 'bg-blue-600 text-white' :
                selectedRole === 'faculty' ? 'bg-green-600 text-white' :
                'bg-purple-600 text-white'
              }`}>
                {selectedRole === 'admin' && <Users className="w-5 h-5" />}
                {selectedRole === 'faculty' && <Upload className="w-5 h-5" />}
                {selectedRole === 'student' && <FileText className="w-5 h-5" />}
                <span className="font-semibold capitalize">{selectedRole} Login</span>
              </div>
            </div>

            {selectedRole === 'faculty' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select faculty role
                </label>
                <select
                  value={facultySubRole}
                  onChange={(e) => setFacultySubRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="">Choose role</option>
                  <option value="principal">Principal</option>
                  <option value="hod">HOD</option>
                  <option value="senior_professor">Senior Professor</option>
                  <option value="assistant_professor">Assistant Professor</option>
                  <option value="lecturer">Lecturer</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter ${selectedRole} username`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${
                selectedRole === 'admin' ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white' :
                selectedRole === 'faculty' ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white' :
                'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  {selectedRole === 'admin' && <Users className="w-5 h-5" />}
                  {selectedRole === 'faculty' && <Upload className="w-5 h-5" />}
                  {selectedRole === 'student' && <FileText className="w-5 h-5" />}
                  Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </>
              )}
            </button>

            
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleLogin;

