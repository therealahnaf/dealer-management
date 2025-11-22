import React, { useState, useEffect } from 'react';
import { Users, Plus, Building2, Mail, Phone } from 'lucide-react';
import { dealerApi } from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import CreateDealerForm from '../components/admin/CreateDealerForm';

interface Dealer {
  dealer_id: string;
  customer_code: string;
  company_name: string;
  contact_person?: string;
  contact_number?: string;
  billing_address?: string;
  shipping_address?: string;
  user_id?: string;
  user?: {
    email: string;
    full_name: string;
    contact_number?: string;
  };
}

const AdminDealersPage: React.FC = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await dealerApi.get('/dealers/admin/all');
      setDealers(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDealer = async (formData: any) => {
    try {
      setSubmitting(true);
      setError('');
      
      const response = await dealerApi.post('/dealers/admin/create', formData);
      
      setDealers(prev => [response.data, ...prev]);
      setSuccess('Dealer account created successfully!');
      setShowCreateForm(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to create dealer');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <Loader message="Loading Dealers..." />
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <Alert type="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
                {error}
              </Alert>
            </div>
          ) : showCreateForm ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-brand-orange hover:text-brand-gray-orange font-semibold text-sm flex items-center gap-2"
                >
                  ← Back to Dealers
                </button>
              </div>
              <CreateDealerForm
                onSubmit={handleCreateDealer}
                onCancel={() => setShowCreateForm(false)}
                loading={submitting}
              />
            </div>
          ) : dealers.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              {/* Minimal Header with Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-orange" />
                  <h1 className="text-2xl font-bold text-brand-brown">Dealers</h1>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 bg-brand-orange hover:bg-brand-gray-orange text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>
              </div>

              {/* Dealers List */}
              <div className="bg-white rounded-2xl shadow-lg border border-brand-orange/20 overflow-hidden">
                <div className="bg-brand-light-orange px-6 py-4 border-b border-brand-orange/20">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-brand-orange" />
                    <h2 className="text-lg font-bold text-brand-brown">Dealer List</h2>
                  </div>
                </div>

                <div className="divide-y divide-brand-orange/10">
                  {dealers.map((dealer) => (
                    <div key={dealer.dealer_id} className="p-6 hover:bg-brand-light-orange/50 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-brand-brown">{dealer.company_name}</h3>
                          <p className="text-sm text-brand-gray-orange/70 mt-1">Code: {dealer.customer_code}</p>
                        </div>
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Active
                        </div>
                      </div>

                      {/* User Information */}
                      {dealer.user && (
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Account</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span>{dealer.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span>{dealer.user.full_name}</span>
                            </div>
                            {dealer.user.contact_number && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{dealer.user.contact_number}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dealer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        {dealer.contact_person && (
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Contact Person</label>
                            <p className="text-gray-900 mt-1">{dealer.contact_person}</p>
                          </div>
                        )}
                        {dealer.contact_number && (
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                            <p className="text-gray-900 mt-1">{dealer.contact_number}</p>
                          </div>
                        )}
                        {dealer.billing_address && (
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Billing</label>
                            <p className="text-gray-900 mt-1 line-clamp-2">{dealer.billing_address}</p>
                          </div>
                        )}
                        {dealer.shipping_address && (
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Shipping</label>
                            <p className="text-gray-900 mt-1 line-clamp-2">{dealer.shipping_address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No dealers yet</h3>
              <p className="text-gray-600 mb-6">Create your first dealer account to get started</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                Create First Dealer
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDealersPage;
