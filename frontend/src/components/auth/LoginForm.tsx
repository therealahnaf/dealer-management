import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const LoginForm: React.FC = () => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - ASK International Branding */}
      <div className="fixed left-8 top-1/2 transform -translate-y-1/2 z-50 w-1/2 flex items-center justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">

        </div>
        
        {/* Subtle animated orbs */}
        
        <div className="text-center relative z-10">
          <h1 className="text-9xl font-black text-black mb-6 tracking-tight" style={{fontFamily: "'Playfair Display', serif"}}>ASK</h1>
          <h2 className="text-3xl font-bold text-black mb-6">INTERNATIONAL</h2>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto mb-8 rounded-full"></div>
          <p className="text-lg font-medium text-slate-400 uppercase tracking-wider">Dealer Management Platform</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="ml-96 min-h-screen flex items-center justify-center p-8 relative overflow-hidde">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-black/10 p-8 relative">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Welcome Back</h1>
                <p className="text-gray-600 mt-3 text-lg">Sign in to your dealer account</p>
              </div>

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          {/* Icon positioned relative to the input field, accounting for the label */}
          <Mail className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="pl-12 bg-white/50 border-white/30 focus:bg-white focus:border-blue-400 transition-all duration-200"
            placeholder="Enter your email"
          />
        </div>

        <div className="relative group">
          {/* Icon positioned relative to the input field, accounting for the label */}
          <Lock className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
          <Input
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="pl-12 bg-white/50 border-white/30 focus:bg-white focus:border-blue-400 transition-all duration-200"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">

          <Link
            to="/reset-password"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
          >
            Forgot your password?
          </Link>
        </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;