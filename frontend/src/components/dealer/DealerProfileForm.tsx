import React, { useState, useEffect } from 'react';
import { DealerCreate, DealerUpdate, DealerBase } from '../../types/api';
import { dealerApi } from '../../services/api';
import { Building2, User, Phone, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import Card from '../ui/Card';

interface DealerProfileFormProps {
  dealer?: DealerBase;
  onSuccess: () => void;
  mode: 'create' | 'edit';
}

const DealerProfileForm: React.FC<DealerProfileFormProps> = ({ 
  dealer, 
  onSuccess, 
  mode 
}) => {
  const [formData, setFormData] = useState<DealerCreate>({
    customer_code: '',
    company_name: '',
    contact_person: '',
    contact_number: '',
    billing_address: '',
    shipping_address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (dealer && mode === 'edit') {
      setFormData({
        customer_code: dealer.customer_code || '',
        company_name: dealer.company_name || '',
        contact_person: dealer.contact_person || '',
        contact_number: dealer.contact_number || '',
        billing_address: dealer.billing_address || '',
        shipping_address: dealer.shipping_address || ''
      });
    }
  }, [dealer, mode]);

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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'create') {
        await dealerApi.post('/dealers/', formData);
        setSuccess('Dealer profile created successfully!');
      } else {
        const updateData: DealerUpdate = { ...formData };
        await dealerApi.put('/dealers/my-profile', updateData);
        setSuccess('Dealer profile updated successfully!');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${mode} dealer profile`);
    } finally {
      setLoading(false);
    }
  };

  const copyBillingToShipping = () => {
    setFormData(prev => ({
      ...prev,
      shipping_address: prev.billing_address
    }));
  };

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {mode === 'create' ? 'Create Dealer Profile' : 'Edit Dealer Profile'}
        </h2>
        <p className="text-gray-600">
          {mode === 'create' 
            ? 'Set up your dealer profile to start placing orders'
            : 'Update your dealer profile information'
          }
        </p>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              name="customer_code"
              label="Customer Code *"
              value={formData.customer_code}
              onChange={handleChange}
              required
              placeholder="Enter customer code"
              helperText="Unique identifier for your business"
            />
            <Input
              type="text"
              name="company_name"
              label="Company Name *"
              value={formData.company_name}
              onChange={handleChange}
              required
              placeholder="Enter company name"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="text"
              name="contact_person"
              label="Contact Person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="Enter contact person name"
            />
            <div className="relative">
              <Phone className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
              <Input
                type="tel"
                name="contact_number"
                label="Contact Number"
                value={formData.contact_number}
                onChange={handleChange}
                className="pl-10"
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Address Information
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Address
              </label>
              <textarea
                name="billing_address"
                value={formData.billing_address}
                onChange={handleChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter billing address"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Shipping Address
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyBillingToShipping}
                  className="text-xs"
                >
                  Copy from billing
                </Button>
              </div>
              <textarea
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter shipping address"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {mode === 'create' ? 'Create Profile' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DealerProfileForm;