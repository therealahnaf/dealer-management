import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, Download, Building2, Calendar, Hash, DollarSign, ShoppingCart } from 'lucide-react';
import { PurchaseOrder } from '../../types/purchaseOrder';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';

interface OrdersTableProps {
  orders: PurchaseOrder[];
  showDealerColumn?: boolean;
  showStatusColumn?: boolean;
  isInvoicePage?: boolean;
  onDownloadInvoice?: (orderId: number, poNumber: string) => void;
  downloadingInvoices?: { [key: number]: boolean };
  isAdminPage?: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  showDealerColumn = false,
  showStatusColumn = true,
  isInvoicePage = false,
  onDownloadInvoice,
  downloadingInvoices = {},
  isAdminPage = false,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-amber-100 text-amber-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'invoiced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">
            {isInvoicePage ? 'Approved Orders' : isAdminPage ? 'All Orders' : 'Order History'}
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow>
              <TableHead className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Order #
                </div>
              </TableHead>
              
              {showDealerColumn && (
                <TableHead className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Dealer
                  </div>
                </TableHead>
              )}
              
              <TableHead className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </div>
              </TableHead>
              
              {showStatusColumn && (
                <TableHead className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Status</TableHead>
              )}
              
              <TableHead className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</TableHead>
              
              <TableHead className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <TableRow key={order.po_id} className="hover:bg-gray-50 transition-colors">
                {/* Order Number */}
                <TableCell className="py-4 px-6">
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
                </TableCell>
                
                {/* Dealer Column (Admin only) */}
                {showDealerColumn && (
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 leading-tight">
                          {order.dealer?.company_name || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{order.dealer?.contact_person || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                )}
                
                {/* Date */}
                <TableCell className="py-4 px-6">
                  <span className="text-sm text-gray-900 font-medium">
                    {formatDate(order.po_date)}
                  </span>
                </TableCell>
                
                {/* Status */}
                {showStatusColumn && (
                  <TableCell className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </TableCell>
                )}
                
                {/* Total */}
                <TableCell className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-m font-bold text-gray-600">
                      {order.total_inc_vat.toFixed(2)} ৳
                    </span>
                  </div>
                </TableCell>
                
                {/* Actions */}
                <TableCell className="py-4 px-6 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    {/* View Details Link */}
                    <Link
                      to={
                        isAdminPage
                          ? `/admin/purchase-orders/${order.dealer_id}/${order.po_id}`
                          : `/purchase-orders/${order.po_id}`
                      }
                      className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      {isInvoicePage ? 'View Order' : 'View Details'}
                    </Link>
                    
                    {/* Download Invoice Button (Invoice Page Only) */}
                    {isInvoicePage && onDownloadInvoice && (
                      <button
                        onClick={() => onDownloadInvoice(order.po_id, order.po_number)}
                        disabled={downloadingInvoices[order.po_id]}
                        className="inline-flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 px-4 py-2 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
                      >
                        {downloadingInvoices[order.po_id] ? (
                          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {downloadingInvoices[order.po_id] ? 'Downloading...' : 'Download'}
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersTable;
