import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, ShoppingCart } from 'lucide-react';
import { getApprovedPurchaseOrders, downloadInvoice } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import OrdersTable from '../components/tables/OrdersTable';

const InvoicesPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingInvoices, setDownloadingInvoices] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [pageSize] = useState(20);

  useEffect(() => {
    const fetchApprovedOrders = async () => {
      setLoading(true);
      try {
        const skip = (currentPage - 1) * pageSize;
        const data = await getApprovedPurchaseOrders(skip, pageSize);
        setOrders(data.items);
        setTotalOrders(data.total);
      } catch (err) {
        setError('Failed to fetch approved purchase orders');
      }
      setLoading(false);
    };

    fetchApprovedOrders();
  }, [currentPage, pageSize]);

  const handleDownloadInvoice = async (orderId: number, poNumber: string) => {
    setDownloadingInvoices(prev => ({ ...prev, [orderId]: true }));
    try {
      const { blob, contentType } = await downloadInvoice(orderId);
      
      // Determine file extension based on content type
      const fileExtension = contentType.includes('pdf') ? 'pdf' : 'docx';
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', `invoice-${poNumber}.${fileExtension}`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setError('Failed to download invoice');
    } finally {
      setDownloadingInvoices(prev => ({ ...prev, [orderId]: false }));
    }
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

              <OrdersTable
                orders={orders}
                isInvoicePage={true}
                onDownloadInvoice={handleDownloadInvoice}
                downloadingInvoices={downloadingInvoices}
                showStatusColumn={false}
              />

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page <span className="font-semibold">{currentPage}</span> of{' '}
                    <span className="font-semibold">{Math.ceil(totalOrders / pageSize)}</span>
                  </span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalOrders / pageSize)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
                >
                  Next
                </button>
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
