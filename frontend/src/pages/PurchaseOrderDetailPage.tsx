// frontend/src/pages/PurchaseOrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPurchaseOrderDetails } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';

const PurchaseOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          // Handle unauthorized error by redirecting to login
          setError('Your session has expired. Redirecting to login...');
          // Redirect to login page after a short delay
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
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        ) : error ? (
          <Alert type="error">{error}</Alert>
        ) : order ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Order #{order.po_number}</h1>
                <p className="text-sm text-gray-500">Date: {formatDate(order.po_date)}</p>
                {order.external_ref_code && (
                  <p className="text-sm text-gray-500">Reference: {order.external_ref_code}</p>
                )}
                {order.combined_po_id && (
                  <p className="text-sm text-gray-500">Combined with PO: #{order.combined_po_id}</p>
                )}
              </div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                order.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                order.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                order.status === 'approved' ? 'bg-green-100 text-green-800' :
                order.status === 'invoiced' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Dealer and Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Dealer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Dealer Information</h2>
                {order.dealer ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Company Name:</strong> {order.dealer.company_name}</p>
                    <p><strong>Contact Person:</strong> {order.dealer.contact_person}</p>
                    <p><strong>Contact Number:</strong> {order.dealer.contact_number}</p>
                    {order.dealer.email && <p><strong>Email:</strong> {order.dealer.email}</p>}
                    <p className="mt-2"><strong>Billing Address:</strong></p>
                    <p className="pl-4 text-gray-600">{order.dealer.billing_address}</p>
                    <p className="mt-2"><strong>Shipping Address:</strong></p>
                    <p className="pl-4 text-gray-600">{order.dealer.shipping_address || order.dealer.billing_address}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Dealer information not available</p>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{order.total_ex_vat.toFixed(2)} tk</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT ({order.vat_percent}%):</span>
                    <span>{order.vat_amount.toFixed(2)} tk</span>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{order.total_inc_vat.toFixed(2)} tk</span>
                  </div>
                  {order.external_ref_code && (
                    <div className="mt-4 pt-2 border-t border-gray-200">
                      <p><strong>Reference:</strong> {order.external_ref_code}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Items</h2>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack Size</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map(item => (
                      <tr key={item.po_item_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || `Product ID: ${item.product_id}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.pack_size_snapshot}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {item.unit_price.toFixed(2)} tk
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {item.total_price.toFixed(2)} tk
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Link 
                to="/purchase-orders" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                &larr; Back to Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">Order not found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PurchaseOrderDetailPage;
