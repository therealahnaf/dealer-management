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
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-gray-600 mt-2">Enter your email and new password</p>
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
        <div className="relative">
          <Mail className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="pl-10"
            placeholder="Enter your email"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
          <Input
            type="password"
            name="new_password"
            label="New Password"
            value={formData.new_password}
            onChange={handleChange}
            required
            className="pl-10"
            placeholder="Enter your new password"
            helperText="Must be at least 8 characters long"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
          <Input
            type="password"
            name="confirm_new_password"
            label="Confirm New Password"
            value={formData.confirm_new_password}
            onChange={handleChange}
            required
            className="pl-10"
            placeholder="Confirm your new password"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Reset Password
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;