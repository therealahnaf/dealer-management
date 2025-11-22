import React from 'react';
import { PurchaseOrderItem } from '../../types/purchaseOrder';
import { Package } from 'lucide-react';

interface OrderItemsTableProps {
  items: PurchaseOrderItem[];
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
          </div>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
            {items.length} {items.length === 1 ? 'item' : 'items'}
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
            {items.map((item, index) => (
              <tr key={item.po_item_id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
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
                  <span className="text-sm font-semibold text-gray-900">{item.unit_price.toFixed(2)} ৳</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                    {item.quantity}
                  </span>
                </td>
                <td className="py-4 px-2 text-right">
                  <span className="text-m font-bold text-gray-600">{item.total_price.toFixed(2)} ৳</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderItemsTable;
