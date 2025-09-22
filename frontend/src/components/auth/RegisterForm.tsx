import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

const RegisterForm: React.FC = () => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    contact_number: '',
    role: UserRole.BUYER
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        contact_number: formData.contact_number || undefined,
        role: formData.role
      });
      setSuccess('Registration successful! You are now logged in.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Fixed ASK International Branding - Left Side */}
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

      {/* Scrollable Form Content - Right Side */}
      <div className="ml-96 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="w-full max-w-lg">
          <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-2xl shadow-black/10 p-8 relative">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Create Account</h1>
                <p className="text-gray-600 mt-3 text-lg">Join the ASK International dealer network</p>
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
          <User className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
          <Input
            type="text"
            name="full_name"
            label="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            required
            className="pl-12 bg-white/50 border-white/30 focus:bg-white focus:border-blue-400 transition-all duration-200"
            placeholder="Enter your full name"
          />
        </div>

        <div className="relative group">
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
          <Phone className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
          <Input
            type="tel"
            name="contact_number"
            label="Contact Number (Optional)"
            value={formData.contact_number}
            onChange={handleChange}
            className="pl-12 bg-white/50 border-white/30 focus:bg-white focus:border-blue-400 transition-all duration-200"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
            Account Type
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
          >
            <option value={UserRole.BUYER}>Buyer</option>
            <option value={UserRole.ADMIN}>Admin</option>
          </select>
        </div>

        <div className="relative group">
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
            helperText="Must be at least 8 characters long"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="pl-12 bg-white/50 border-white/30 focus:bg-white focus:border-blue-400 transition-all duration-200"
            placeholder="Confirm your password"
          />
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/50 focus:bg-white transition-all duration-200"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors duration-200">
              Privacy Policy
            </Link>
          </label>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <Button
            type="submit"
            loading={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
            size="lg"
          >
            Create Account
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200">
            Sign in here
          </Link>
        </p>
      </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;