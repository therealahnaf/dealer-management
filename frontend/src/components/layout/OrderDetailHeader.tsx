import React from 'react';
import { PurchaseOrder } from '../../types/purchaseOrder';
import { Calendar, FileText, Hash, CheckCircle, Clock, AlertCircle, Receipt } from 'lucide-react';

interface OrderDetailHeaderProps {
  order: PurchaseOrder;
  isDownloading?: boolean;
  onDownload?: () => void;
  actionButtons?: React.ReactNode;
}

const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({ order, actionButtons }) => {
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
    <div className="bg-white rounded-2xl shadow-xl border border-brand-orange/20 overflow-hidden mb-8">
      <div className="bg-brand-orange px-8 py-2 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Hash className="w-6 h-6" />
              <h1 className="text-xl font-bold">Order {order.po_number}</h1>
            </div>
            <div className="flex flex-wrap gap-4 text-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(order.po_date)}</span>
              </div>
              {order.external_ref_code && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Ref: {order.external_ref_code}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(order.status)} bg-white/20 backdrop-blur-sm`}>
              {getStatusIcon(order.status)}
              <span className="font-semibold text-white">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            {actionButtons && <div className="flex gap-2">{actionButtons}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailHeader;
