// frontend/src/pages/AdminPurchaseOrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPurchaseOrderDetailsByDealerAndPoId, approvePurchaseOrder, downloadPO, downloadInvoice } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import {
  ArrowLeft,
  CheckCircle,
  Receipt,
  Eye,
  Check,
  Download
} from 'lucide-react';
import DealerInfoCard from '../components/dealer/DealerInfoCard';
import OrderItemsTable from '../components/tables/OrderItemsTable';
import OrderDetailHeader from '../components/layout/OrderDetailHeader';

const AdminPurchaseOrderDetailPage: React.FC = () => {
  const { dealerId, poId } = useParams<{ dealerId: string; poId: string }>();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<boolean>(false);
  const [downloadingPO, setDownloadingPO] = useState<boolean>(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState<boolean>(false);

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

  const handleDownloadPO = async () => {
    if (!poId || !order) return;
    
    setDownloadingPO(true);
    try {
      const { blob, contentType } = await downloadPO(parseInt(poId));
      
      // Determine file extension based on content type
      const fileExtension = contentType.includes('pdf') ? 'pdf' : 'docx';
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', `PO-${order.po_number}.${fileExtension}`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PO:', err);
      setError('Failed to download PO');
    } finally {
      setDownloadingPO(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!poId || !order) return;
    
    setDownloadingInvoice(true);
    try {
      const { blob, contentType } = await downloadInvoice(parseInt(poId));
      
      // Determine file extension based on content type
      const fileExtension = contentType.includes('pdf') ? 'pdf' : 'docx';
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', `Invoice-${order.po_number}.${fileExtension}`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading invoice:', err);
      setError('Failed to download invoice');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <div className="flex justify-between items-center mb-6">
                <Link 
                  to="/admin/purchase-orders" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Orders
                </Link>
              </div>
              <OrderDetailHeader order={order} />

              {/* Main Content */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Dealer Info & Summary */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Dealer Information */}
                                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-bold text-gray-800">Admin Actions</h2>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      {order.status !== 'approved' && (
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
                      )}
                      <button
                        onClick={handleDownloadPO}
                        disabled={downloadingPO}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
                      >
                        {downloadingPO ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloadingPO ? 'Generating...' : 'Download PO'}
                      </button>
                      {order.status === 'approved' && (
                        <button
                          onClick={handleDownloadInvoice}
                          disabled={downloadingInvoice}
                          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-xl transition-colors font-semibold"
                        >
                          {downloadingInvoice ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Receipt className="w-4 h-4" />
                          )}
                          {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
                        </button>
                      )}
                    </div>
                  </div>
                  <DealerInfoCard dealer={order.dealer} />

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

                <div className="xl:col-span-2">
                  <OrderItemsTable items={order.items} />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-right">
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
