import React, { useState } from 'react';
import { Mail, Lock, User, Building2, Phone, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';

interface CreateDealerFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CreateDealerForm: React.FC<CreateDealerFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    // User fields
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    contact_number: '',
    // Dealer fields
    customer_code: '',
    company_name: '',
    contact_person: '',
    billing_address: '',
    shipping_address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // Validation
    if (!formData.email || !formData.full_name) {
      setError('Email and full name are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!formData.customer_code || !formData.company_name) {
      setError('Customer code and company name are required');
      return;
    }

    try {
      await onSubmit({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        contact_number: formData.contact_number || undefined,
        customer_code: formData.customer_code,
        company_name: formData.company_name,
        contact_person: formData.contact_person || undefined,
        billing_address: formData.billing_address || undefined,
        shipping_address: formData.shipping_address || undefined,
      });
      setSuccess('Dealer account created successfully!');
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        contact_number: '',
        customer_code: '',
        company_name: '',
        contact_person: '',
        billing_address: '',
        shipping_address: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create dealer');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-brand-orange/20 overflow-hidden">
      {/* Header */}
      <div className="bg-brand-orange border-b border-brand-orange/20 p-6 text-white">
        <h2 className="text-2xl font-bold">Create New Dealer</h2>
        <p className="text-gray-100 text-sm mt-1">Add a new dealer account with user credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          {/* User Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-brand-brown mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-orange" />
              User Account Information
            </h3>
            <div className="space-y-4 bg-brand-light-orange p-4 rounded-lg">
              <div className="relative group">
                <Mail className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-12"
                  placeholder="dealer@example.com"
                />
              </div>

              <div className="relative group">
                <User className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10" />
                <Input
                  type="text"
                  name="full_name"
                  label="Full Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="pl-12"
                  placeholder="John Doe"
                />
              </div>

              <div className="relative group">
                <Phone className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
                <Input
                  type="tel"
                  name="contact_number"
                  label="Contact Number (Optional)"
                  value={formData.contact_number}
                  onChange={handleChange}
                  className="pl-12"
                  placeholder="+880 1234 567890"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
                <Input
                  type="password"
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-12"
                  placeholder="Enter password"
                  helperText="Must be at least 8 characters long"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-12"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Dealer Information Section */}
          <div>
            <h3 className="text-lg font-semibold text-brand-brown mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-orange" />
              Dealer Information
            </h3>
            <div className="space-y-4 bg-brand-light-orange p-4 rounded-lg">
              <div className="relative group">
                <Input
                  type="text"
                  name="customer_code"
                  label="Customer Code"
                  value={formData.customer_code}
                  onChange={handleChange}
                  required
                  placeholder="CUST-001"
                />
              </div>

              <div className="relative group">
                <Building2 className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
                <Input
                  type="text"
                  name="company_name"
                  label="Company Name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="pl-12"
                  placeholder="ABC Trading Ltd."
                />
              </div>

              <div className="relative group">
                <User className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
                <Input
                  type="text"
                  name="contact_person"
                  label="Contact Person (Optional)"
                  value={formData.contact_person}
                  onChange={handleChange}
                  className="pl-12"
                  placeholder="Jane Smith"
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
                <label htmlFor="billing_address" className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Address (Optional)
                </label>
                <textarea
                  id="billing_address"
                  name="billing_address"
                  value={formData.billing_address}
                  onChange={handleChange}
                  className="pl-12 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-500 transition-all duration-200"
                  placeholder="123 Main Street, City, Country"
                  rows={2}
                />
              </div>

              <div className="relative group">
                <MapPin className="absolute left-3 top-[38px] h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200 z-10" />
                <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address (Optional)
                </label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  className="pl-12 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-500 transition-all duration-200"
                  placeholder="456 Delivery Avenue, City, Country"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-brand-orange/20">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-brand-orange/30 rounded-lg text-brand-brown font-medium hover:bg-brand-light-orange/50 transition-colors duration-200"
            >
              Cancel
            </button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-brand-orange hover:bg-brand-gray-orange shadow-lg transition-all duration-200"
            >
              Create Dealer Account
            </Button>
          </div>
        </form>
    </div>
  );
};

export default CreateDealerForm;
