import React, { useState, useEffect } from 'react';
import { Users, Plus, Building2, Mail, Phone } from 'lucide-react';
import { dealerApi } from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import CreateDealerForm from '../components/admin/CreateDealerForm';
import { Table, TableBody, TableCell, TableRow } from '../components/ui/table';
import Button from '../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <Loader message="Loading Dealers..." />
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <Alert type="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
                {error}
              </Alert>
            </div>
          ) : dealers.length > 0 ? (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Dealers</h2>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-brand-orange hover:bg-brand-gray-orange text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Dealer
                  </Button>
                </div>
                <Accordion type="multiple" className="w-full">
                  {dealers.map((dealer) => (
                    <AccordionItem key={dealer.dealer_id} value={dealer.dealer_id} className="border-gray-200">
                      <AccordionTrigger className="hover:bg-gray-50 px-6 py-4">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-black/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-brand-black" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900">{dealer.company_name}</div>
                              <div className="text-sm text-gray-500">{dealer.customer_code}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm py-4">
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</h4>
                            <div className="space-y-3">
                              {dealer.contact_person && (
                                <div>
                                  <p className="text-xs text-gray-500">Contact Person</p>
                                  <p className="text-gray-900">{dealer.contact_person}</p>
                                </div>
                              )}
                              {dealer.contact_number && (
                                <div>
                                  <p className="text-xs text-gray-500">Phone</p>
                                  <p className="text-gray-900">{dealer.contact_number}</p>
                                </div>
                              )}
                              {dealer.user?.contact_number && (
                                <div>
                                  <p className="text-xs text-gray-500">Account Phone</p>
                                  <p className="text-gray-900">{dealer.user.contact_number}</p>
                                </div>
                              )}
                            </div>
                          </div>
                           
                          {dealer.billing_address && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Billing Address</h4>
                              <p className="text-gray-900 whitespace-pre-line">{dealer.billing_address}</p>
                            </div>
                          )}
                           
                          {dealer.shipping_address && dealer.shipping_address !== dealer.billing_address && (
                            <div>
                              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h4>
                              <p className="text-gray-900 whitespace-pre-line">{dealer.shipping_address}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No dealers yet</h3>
              <p className="text-gray-600 mb-6">Create your first dealer account to get started</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-brand-orange hover:bg-brand-gray-orange text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Dealer
              </Button>
            </div>
          )}

          {/* Create Dealer Dialog */}
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">Add New Dealer</DialogTitle>
              </DialogHeader>
              <div className="mt-6">
                <CreateDealerForm
                  onSubmit={async (data) => {
                    await handleCreateDealer(data);
                    setShowCreateForm(false);
                  }}
                  onCancel={() => setShowCreateForm(false)}
                  loading={submitting}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDealersPage;
