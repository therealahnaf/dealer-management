// frontend/src/pages/AdminPurchaseOrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPurchaseOrderDetailsByDealerAndPoId, approvePurchaseOrder } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';

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
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Order #{order.po_number}</h1>
                <p className="text-sm text-gray-500">Date: {formatDate(order.po_date)}</p>
              </div>
              <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                order.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                order.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-b">Dealer Information</h2>
                {order.dealer ? (
                  <div className="space-y-2 text-sm">
                    <p><strong>Company Name:</strong> {order.dealer.company_name}</p>
                    <p><strong>Contact Person:</strong> {order.dealer.contact_person}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Dealer information not available</p>
                )}
              </div>

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
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Items</h2>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
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

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Link 
                to="/admin/purchase-orders" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                &larr; Back to Orders
              </Link>
              {order.status !== 'approved' && (
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {approving ? 'Approving...' : 'Approve Order'}
                </button>
              )}
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

export default AdminPurchaseOrderDetailPage;
