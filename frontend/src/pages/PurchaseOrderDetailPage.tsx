// frontend/src/pages/PurchaseOrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPurchaseOrderDetails } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import { 
  ArrowLeft, 
  Download, 
  Receipt,
  Eye
} from 'lucide-react';
import DealerInfoCard from '../components/dealer/DealerInfoCard';
import OrderItemsTable from '../components/tables/OrderItemsTable';
import OrderDetailHeader from '../components/layout/OrderDetailHeader';

const PurchaseOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching purchase order details for ID:', id);
        const data = await getPurchaseOrderDetails(parseInt(id));
        console.log('Processed order data:', data);
        
        if (data) {
          console.log('Dealer data:', data.dealer);
          console.log('Order items with products:', data.items?.map(item => ({
            ...item,
            product: item.product ? 'Product loaded' : 'No product data'
          })));
          setOrder(data);
        } else {
          setError('No order data received');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        if ((err as any)?.response?.status === 401) {
          setError('Your session has expired. Redirecting to login...');
          setTimeout(() => {
            navigate('/login', { 
              state: { from: window.location.pathname },
              replace: true 
            });
          }, 1500);
        } else {
          setError('Failed to fetch purchase order details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, navigate]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadInvoice = async () => {
    if (!order || order.status !== 'approved') return;
    
    setDownloadingInvoice(true);
    try {
      const { downloadInvoice } = await import('../services/purchaseOrderService');
      const { blob, contentType } = await downloadInvoice(order.po_id);
      
      // Determine file extension based on content type
      const fileExtension = contentType.includes('pdf') ? 'pdf' : 'docx';
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', `invoice-${order.po_number}.${fileExtension}`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setDownloadingInvoice(false);
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
              <div className="flex justify-between items-center mb-6">
                <Link 
                  to="/purchase-orders" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Orders
                </Link>
              </div>

              <OrderDetailHeader 
                order={order} 
                actionButtons={(
                  <>
                    {order.status === 'approved' && (
                      <button
                        onClick={handleDownloadInvoice}
                        disabled={downloadingInvoice}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-300 disabled:opacity-50"
                      >
                        {downloadingInvoice ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
                      </button>
                    )}
                  </>
                )}
              />

              {/* Main Content */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Dealer Info & Summary */}
                <div className="xl:col-span-1 space-y-6">
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
                          <span className="font-semibold">{order.total_ex_vat.toFixed(2)} ৳</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">VAT ({order.vat_percent}%):</span>
                          <span className="font-semibold">{order.vat_amount.toFixed(2)} ৳</span>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">Total:</span>
                            <span className="text-xl font-bold text-gray-600">{order.total_inc_vat.toFixed(2)} ৳</span>
                          </div>
                        </div>
                        
                        {order.combined_po_id && (
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <p className="text-sm text-gray-800">
                                <strong>Note:</strong> This order is combined with PO #{order.combined_po_id}
                              </p>
                            </div>
                          </div>
                        )}
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
                  to="/purchase-orders" 
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

export default PurchaseOrderDetailPage;
