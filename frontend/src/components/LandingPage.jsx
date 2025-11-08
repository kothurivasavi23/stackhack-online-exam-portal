import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, Shield, Clock, BarChart3, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import ExamPortalLogo from './Logo';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Platform',
      description: 'Advanced security features with tab switching detection and time-based restrictions'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Real-time Timer',
      description: 'Live countdown timer ensures fair examination experience for all students'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Multiple Question Types',
      description: 'Support for MCQ and coding questions with instant auto-grading'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics and performance tracking for administrators'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <ExamPortalLogo size="normal" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Exam Portal
            </span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/login?role=student')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Student Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="mb-20">
          <div className="w-full bg-black text-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                  Online Exam Portal -
                  <br />
                  Technical and general tests
                </h1>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 hover:bg-gray-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                  </button>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="rounded-xl border-4 border-purple-500 p-1 bg-black shadow-[0_0_0_4px_rgba(124,58,237,0.3)]">
                  <img
                    src="https://images.unsplash.com/photo-1516321165247-4aa89a48be28?q=80&w=1200&auto=format&fit=crop"
                    alt="Online test on tablet"
                    className="w-full max-w-md rounded-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="text-center cursor-pointer hover:bg-blue-50 rounded-xl p-4 transition-colors"
              onClick={() => navigate('/login?role=student')}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Students</h3>
              <p className="text-gray-600">
                Take exams with ease, track your progress, and get instant results
              </p>
            </div>
            <div
              className="text-center cursor-pointer hover:bg-green-50 rounded-xl p-4 transition-colors"
              onClick={() => navigate('/login?role=faculty')}
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Faculty</h3>
              <p className="text-gray-600">
                Create and manage exams efficiently with comprehensive analytics
              </p>
            </div>
            <div
              className="text-center cursor-pointer hover:bg-purple-50 rounded-xl p-4 transition-colors"
              onClick={() => navigate('/login?role=admin')}
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">For Administrators</h3>
              <p className="text-gray-600">
                Complete control with dashboard analytics and user management
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users already using our platform for their examination needs
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
            >
              Login to Existing Account
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-gray-600">
          <p className="mb-2">© 2024 Online Examination Portal. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <button className="hover:text-blue-600 transition-colors">Privacy Policy</button>
            <button className="hover:text-blue-600 transition-colors">Terms of Service</button>
            <button className="hover:text-blue-600 transition-colors">Contact Us</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;

