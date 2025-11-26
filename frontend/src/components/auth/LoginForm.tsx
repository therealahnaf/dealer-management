import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/input';
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
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <img src="/ask_logo_transparent.png" alt="ASK International" className="h-40 w-40 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-gray-600 mt-2">Sign in to your dealer account</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="relative group">
            <Mail className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-brand-orange transition-colors duration-200 z-10" />
            <Input
              type="email"
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="pl-10 border-gray-200 focus:border-brand-orange focus:ring-brand-orange/20"
              placeholder="Enter your email"
            />
          </div>

          {/* Password Field */}
          <div className="relative group">
            <Lock className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-brand-orange transition-colors duration-200 z-10" />
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="pl-10 border-gray-200 focus:border-brand-orange focus:ring-brand-orange/20"
              placeholder="Enter your password"
            />
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full mt-8"
          >
            Sign In
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Dealer Management Platform by ASK International
      </p>
    </div>
  );
};

export default LoginForm;