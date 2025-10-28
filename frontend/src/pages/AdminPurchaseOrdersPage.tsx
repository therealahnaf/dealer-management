// frontend/src/pages/AdminPurchaseOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Receipt, ShoppingCart, FileText, Calendar, Building2, Hash, Eye } from 'lucide-react';
import { getAllPurchaseOrders } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';

const AdminPurchaseOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllPurchaseOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to fetch purchase orders');
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);


  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <Loader message="Loading Purchase Orders..." />
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <Alert type="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
                {error}
              </Alert>
            </div>
          ) : orders.length > 0 ? (
            <div className="max-w-6xl mx-auto">

              {/* Orders Table */}
              <div className="bg-white rounded-2xl shadow-lg border border-brand-orange/20 overflow-hidden">
                <div className="bg-brand-light-orange px-6 py-4 border-b border-brand-orange/20">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-brand-orange" />
                    <h2 className="text-lg font-bold text-brand-brown">All Orders</h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            Order #
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Dealer
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date
                          </div>
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.po_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-700 leading-tight">
                                  {order.po_number}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Order #{order.po_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Building2 className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 leading-tight">
                                  {order.dealer?.company_name || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{order.dealer?.contact_person || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-700 font-medium">
                              {new Date(order.po_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'draft'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'invoiced'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-lg font-bold text-gray-600">
                              {order.total_inc_vat.toFixed(2)} tk
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <Link
                              to={`/admin/purchase-orders/${order.dealer_id}/${order.po_id}`}
                              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <div className="text-sm text-gray-500">
                  Showing {orders.length} purchase {orders.length === 1 ? 'order' : 'orders'}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Purchase Orders Found</h3>
                <p className="text-gray-500 mb-6">There are currently no purchase orders in the system.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPurchaseOrdersPage;
