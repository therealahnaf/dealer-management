// frontend/src/pages/AdminPurchaseOrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { getAllPurchaseOrders } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import OrdersTable from '../components/tables/OrdersTable';

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

              <OrdersTable orders={orders} showDealerColumn={true} isAdminPage={true} />

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
