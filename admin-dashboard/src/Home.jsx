import React, { useState } from 'react';
import { Shield, ChevronRight, Lock, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [hoveredButton, setHoveredButton] = useState(null);            
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login');
    console.log('Login clicked');
  };

  const handleSignup = () => {
    navigate('/signup');
    console.log('Signup clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Shield className="absolute top-20 left-20 w-8 h-8 text-purple-300 opacity-30 animate-bounce" style={{animationDelay: '0s'}} />
        <Shield className="absolute top-32 right-32 w-6 h-6 text-cyan-300 opacity-30 animate-bounce" style={{animationDelay: '1s'}} />
        <Shield className="absolute bottom-32 left-32 w-7 h-7 text-pink-300 opacity-30 animate-bounce" style={{animationDelay: '2s'}} />
        <Shield className="absolute bottom-20 right-20 w-8 h-8 text-purple-300 opacity-30 animate-bounce" style={{animationDelay: '0.5s'}} />
      </div>

      {/* Main Welcome Card */}
      <div className="relative z-10 bg-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 max-w-md w-full transform transition-all duration-700 hover:scale-105">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your platform with ease
          </p>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <p className="text-xl text-gray-200 font-medium">
            Welcome to your Dashboard
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            onMouseEnter={() => setHoveredButton('login')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25 flex items-center justify-center group"
          >
            <Lock className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
            Sign In to Dashboard
            <ChevronRight className={`w-5 h-5 ml-3 transition-transform duration-300 ${hoveredButton === 'login' ? 'translate-x-1' : ''}`} />
          </button>

          <button
            onClick={handleSignup}
            onMouseEnter={() => setHoveredButton('signup')}
            onMouseLeave={() => setHoveredButton(null)}
            className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-6 rounded-2xl border-2 border-white/20 hover:border-white/30 shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center justify-center group backdrop-blur-sm"
          >
            <UserPlus className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" />
            Create Admin Account
            <ChevronRight className={`w-5 h-5 ml-3 transition-transform duration-300 ${hoveredButton === 'signup' ? 'translate-x-1' : ''}`} />
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-center text-gray-400 text-sm">
            Secure • Reliable • Powerful
          </p>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
}