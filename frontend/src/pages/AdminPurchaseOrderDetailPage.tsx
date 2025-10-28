// frontend/src/pages/AdminPurchaseOrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPurchaseOrderDetailsByDealerAndPoId, approvePurchaseOrder } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  FileText,
  Hash,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Eye,
  Check
} from 'lucide-react';

const AdminPurchaseOrderDetailPage: React.FC = () => {
  const { dealerId, poId } = useParams<{ dealerId: string; poId: string }>();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!dealerId || !poId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getPurchaseOrderDetailsByDealerAndPoId(dealerId, parseInt(poId));
        setOrder(data);
      } catch (err) {
        setError('Failed to fetch purchase order details.');
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [dealerId, poId]);

  const handleApprove = async () => {
    if (!dealerId || !poId) return;

    setApproving(true);
    setError(null);

    try {
      const updatedOrder = await approvePurchaseOrder(dealerId, parseInt(poId));
      setOrder(updatedOrder);
    } catch (err) {
      setError('Failed to approve purchase order.');
    }
    setApproving(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'submitted':
        return <AlertCircle className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'invoiced':
        return <Receipt className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'submitted':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'invoiced':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-2">
          {loading ? (
            <Loader message="Loading Order Details..." />
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <Alert type="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
                {error}
              </Alert>
            </div>
          ) : order ? (
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-brand-orange/20 overflow-hidden mb-8">
                <div className="bg-brand-orange px-8 py-6 text-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Hash className="w-6 h-6" />
                        <h1 className="text-3xl font-bold">Order {order.po_number}</h1>
                      </div>
                      <div className="flex flex-wrap gap-4 text-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(order.po_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)} bg-white/20 backdrop-blur-sm`}>
                        {getStatusIcon(order.status)}
                        <span className="font-semibold text-white">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Dealer Info & Summary */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Dealer Information */}
                                    {order.status !== 'approved' && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-gray-600" />
                          <h2 className="text-lg font-bold text-gray-800">Admin Actions</h2>
                        </div>
                      </div>

                      <div className="p-6">
                        <button
                          onClick={handleApprove}
                          disabled={approving}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
                        >
                          {approving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {approving ? 'Approving...' : 'Approve Order'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-bold text-gray-800">Dealer Information</h2>
                      </div>
                    </div>

                    <div className="p-6">
                      {order.dealer ? (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{order.dealer.company_name}</h3>
                            <p className="text-gray-600">{order.dealer.contact_person}</p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Phone className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{order.dealer.contact_number}</span>
                            </div>

                            {order.dealer.email && (
                              <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{order.dealer.email}</span>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                              <div className="text-sm text-gray-600">
                                <p className="font-medium mb-1">Billing Address:</p>
                                <p className="leading-relaxed">{order.dealer.billing_address}</p>
                                {order.dealer.shipping_address && order.dealer.shipping_address !== order.dealer.billing_address && (
                                  <>
                                    <p className="font-medium mt-3 mb-1">Shipping Address:</p>
                                    <p className="leading-relaxed">{order.dealer.shipping_address}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Dealer information not available</p>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold">${order.total_ex_vat.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">VAT ({order.vat_percent}%):</span>
                          <span className="font-semibold">${order.vat_amount.toFixed(2)}</span>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">Total:</span>
                            <span className="text-2xl font-bold text-gray-600">${order.total_inc_vat.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Order Items */}
                <div className="xl:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-gray-600" />
                          <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Pack Size</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Price</th>
                            <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {order.items.map((item, index) => (
                            <tr key={item.po_item_id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 leading-tight">
                                      {item.product?.name || `Product ID: ${item.product_id}`}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Item #{index + 1}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {item.pack_size_snapshot}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className="font-semibold text-gray-900">${item.unit_price.toFixed(2)}</span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-sm font-bold">
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className="text-lg font-bold text-gray-600">${item.total_price.toFixed(2)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <Link
                  to="/admin/purchase-orders"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Orders
                </Link>

                <div className="text-sm text-gray-500">
                  Last updated: {formatDate(order.po_date)}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Order Not Found</h3>
                <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or has been removed.</p>
                <Link
                  to="/admin/purchase-orders"
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Orders
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPurchaseOrderDetailPage;
