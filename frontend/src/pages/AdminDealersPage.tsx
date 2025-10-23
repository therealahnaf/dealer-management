import React, { useState, useEffect } from 'react';
import { Users, Plus, Mail, Phone, Building2, Hash } from 'lucide-react';
import CreateDealerForm from '../components/admin/CreateDealerForm';
import Alert from '../components/ui/Alert';
import Layout from '../components/layout/Layout';
import { dealerApi } from '../services/api';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-gray-600 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Dealers...</h3>
              <p className="text-gray-500">Please wait while we fetch all dealers</p>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <Alert type="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
                {error}
              </Alert>
            </div>
          ) : dealers.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-6 text-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6" />
                        <h1 className="text-3xl font-bold">All Dealers</h1>
                      </div>
                      <div className="flex flex-wrap gap-4 text-gray-100">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          <span>{dealers.length} {dealers.length === 1 ? 'dealer' : 'dealers'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Create Dealer
                    </button>
                  </div>
                </div>
              </div>

              {/* Dealers List */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-bold text-gray-800">Dealer List</h2>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {dealers.map((dealer) => (
                    <div key={dealer.dealer_id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{dealer.company_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">Code: {dealer.customer_code}</p>
                        </div>
                        <div className="bg-green-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
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

      {/* Create Dealer Modal */}
      {showCreateForm && (
        <CreateDealerForm
          onSubmit={handleCreateDealer}
          onCancel={() => setShowCreateForm(false)}
          loading={submitting}
        />
      )}
    </Layout>
  );
};

export default AdminDealersPage;
