import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Plus,
  ShoppingCart,
  Eye,
  Calendar,
  Hash,
  DollarSign
} from 'lucide-react';
import { getApprovedPurchaseOrders } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';

const InvoicesPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    const fetchApprovedOrders = async () => {
      try {
        const data = await getApprovedPurchaseOrders();
        setOrders(data);
      } catch (err) {
        setError('Failed to fetch approved purchase orders');
      }
      setLoading(false);
    };

    fetchApprovedOrders();
  }, []);

  const handleDownloadInvoice = async (orderId: number, poNumber: string) => {
    setDownloadingInvoice(prev => ({ ...prev, [orderId]: true }));
    try {
      // Simulate invoice download - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a dummy PDF download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVGl0bGUgKEludm9pY2UpCj4+CmVuZG9iagp4cmVmCjAgMQowMDAwMDAwMDAwIDY1NTM1IGYgCnRyYWlsZXIKPDwKL1NpemUgMQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMTMwCiUlRU9G');
      element.setAttribute('download', `invoice-${poNumber}.pdf`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setDownloadingInvoice(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <Loader message="Loading Invoices..." />
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <Alert type="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
                {error}
              </Alert>
            </div>
          ) : orders.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              {/* Minimal Header with Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
                </div>
                <Link
                  to="/cart"
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Order
                </Link>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-bold text-gray-800">Approved Orders</h2>
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
                            <Calendar className="w-4 h-4" />
                            Date
                          </div>
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.po_id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 leading-tight">
                                  {order.po_number}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Order #{order.po_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-900 font-medium">
                              {formatDate(order.po_date)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-lg font-bold text-gray-600">
                                {order.total_inc_vat.toFixed(2)} tk
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <Link
                                to={`/purchase-orders/${order.po_id}`}
                                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                              >
                                <Eye className="w-4 h-4" />
                                View Order
                              </Link>
                              <button
                                onClick={() => handleDownloadInvoice(order.po_id, order.po_number)}
                                disabled={downloadingInvoice[order.po_id]}
                                className="inline-flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 px-4 py-2 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
                              >
                                {downloadingInvoice[order.po_id] ? (
                                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                                {downloadingInvoice[order.po_id] ? 'Downloading...' : 'Download'}
                              </button>
                            </div>
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
                  Showing {orders.length} approved purchase {orders.length === 1 ? 'order' : 'orders'}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Approved Orders Yet</h3>
                <p className="text-gray-500 mb-6">You don't have any approved purchase orders to generate invoices for.</p>
                <Link
                  to="/purchase-orders"
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors font-semibold"
                >
                  <ShoppingCart className="w-4 h-4" />
                  View All Orders
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InvoicesPage;
