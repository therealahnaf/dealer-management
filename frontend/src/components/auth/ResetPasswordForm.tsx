import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const ResetPasswordForm: React.FC = () => {
  const { resetPassword, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.new_password !== formData.confirm_new_password) {
      setError('Passwords do not match');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await resetPassword(formData);
      setSuccess('Password reset successfully! You can now sign in with your new password.');
      setFormData({ email: '', new_password: '', confirm_new_password: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-black/10 p-8 relative">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-violet-500/25">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Reset Password</h1>
            <p className="text-gray-600 mt-3 text-lg">Enter your email and new password</p>
          </div>

      {error && (
        <Alert type="error" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" className="mb-6">
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-200" />
          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="pl-12 bg-white/50 border-white/30 focus:bg-white focus:border-violet-400 transition-all duration-200"
            placeholder="Enter your email"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-200" />
          <Input
            type="password"
            name="new_password"
            label="New Password"
            value={formData.new_password}
            onChange={handleChange}
            required
            className="pl-12 bg-white/50 border-white/30 focus:bg-white focus:border-violet-400 transition-all duration-200"
            placeholder="Enter your new password"
            helperText="Must be at least 8 characters long"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-200" />
          <Input
            type="password"
            name="confirm_new_password"
            label="Confirm New Password"
            value={formData.confirm_new_password}
            onChange={handleChange}
            required
            className="pl-12 bg-white/50 border-white/30 focus:bg-white focus:border-violet-400 transition-all duration-200"
            placeholder="Confirm your new password"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-200 transform hover:scale-[1.02]"
          size="lg"
        >
          Reset Password
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-violet-600 hover:text-violet-500 font-medium transition-colors duration-200">
            Sign in here
          </Link>
        </p>
      </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;