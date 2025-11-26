// frontend/src/pages/AdminPurchaseOrderDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPurchaseOrderDetailsByDealerAndPoId, approvePurchaseOrder, downloadPO, downloadInvoice } from '../services/purchaseOrderService';
import { PurchaseOrder } from '../types/purchaseOrder';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import Button from '../components/ui/Button';
import {
  ArrowLeft,
  CheckCircle,
  Receipt,
  Download,
  Calendar,
  CreditCard,
  ShieldCheck,
  FileText
} from 'lucide-react';
import DealerInfoCard from '../components/dealer/DealerInfoCard';
import OrderItemsTable from '../components/tables/OrderItemsTable';

const AdminPurchaseOrderDetailPage: React.FC = () => {
  const { dealerId, poId } = useParams<{ dealerId: string; poId: string }>();
  const navigate = useNavigate();
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
      const fileExtension = contentType.includes('pdf') ? 'pdf' : 'docx';
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', `PO-${order.po_number}.${fileExtension}`);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Error downloading PO:', err);
    } finally {
      setDownloadingPO(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!poId || !order) return;
    setDownloadingInvoice(true);
    try {
      const { blob, contentType } = await downloadInvoice(parseInt(poId));
      const fileExtension = contentType.includes('pdf') ? 'pdf' : 'docx';
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.setAttribute('href', url);
      element.setAttribute('download', `Invoice-${order.po_number}.${fileExtension}`);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Error downloading invoice:', err);
    } finally {
      setDownloadingInvoice(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) return <Layout><div className="p-8"><Loader message="Loading Order Details..." /></div></Layout>;

  if (error || !order) return (
    <Layout>
      <div className="container mx-auto p-8 max-w-2xl">
        <Alert type="error" className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100">
          {error || 'Order not found'}
        </Alert>
        <Button variant="ghost" onClick={() => navigate('/admin/purchase-orders')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin Orders
        </Button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50 py-6">
        <div className="container mx-auto px-4 max-w-7xl">

          <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
            {/* Compact Header Bar */}
            <div className="border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/admin/purchase-orders')}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Back to Admin Orders"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-gray-900">{order.po_number}</h1>
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(order.status)} capitalize`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ordered on {formatDate(order.po_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row min-h-[600px]">

                {/* LEFT SIDEBAR: Actions, Context & Summary (30% Width) */}
                <div className="w-full lg:w-[320px] bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-6 shrink-0">

                  {/* SECTION 1: ADMIN ACTIONS */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> Admin Actions
                    </h3>
                    <div className="grid gap-2">
                      {order.status !== 'approved' && (
                        <Button
                          onClick={handleApprove}
                          loading={approving}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {approving ? 'Approving...' : 'Approve Order'}
                        </Button>
                      )}

                      <Button
                        onClick={handleDownloadPO}
                        loading={downloadingPO}
                        variant="outline"
                        className="w-full border-green-200 text-green-700 hover:bg-green-200 bg-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {downloadingPO ? 'Downloading...' : 'Download PO'}
                      </Button>

                      {order.status === 'approved' && (
                        <Button
                          onClick={handleDownloadInvoice}
                          loading={downloadingInvoice}
                          variant="outline"
                          className="w-full border-blue-200 text-blue-700 hover:bg-blue-200 bg-white"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* SECTION 2: DEALER DETAILS */}
                  <div className="space-y-3">
                     <DealerInfoCard dealer={order.dealer} />
                  </div>

                  {/* SECTION 3: FINANCIALS */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-3 h-3" /> Financials
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-900">{order.total_ex_vat.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">VAT ({order.vat_percent}%)</span>
                        <span className="font-medium text-gray-900">{order.vat_amount.toFixed(2)}</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="font-bold text-lg text-brand-orange">{order.total_inc_vat.toFixed(2)} ৳</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT MAIN AREA: Items Table */}
                <div className="flex-1 bg-white p-6 overflow-x-auto">
                  <div className="min-w-full">
                    <OrderItemsTable items={order.items} />
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default AdminPurchaseOrderDetailPage;