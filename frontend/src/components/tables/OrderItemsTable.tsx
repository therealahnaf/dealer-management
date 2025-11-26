import React, { useState } from 'react';
import { PurchaseOrderItem } from '../../types/purchaseOrder';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import Button from '../ui/Button';

interface OrderItemsTableProps {
  items: PurchaseOrderItem[];
  pageSize?: number;
}

const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items, pageSize = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentItems = items.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };
  
  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
            {totalPages > 1 && (
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow>
              <TableHead className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Product</TableHead>
              <TableHead className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Pack Size</TableHead>
              <TableHead className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Price</TableHead>
              <TableHead className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</TableHead>
              <TableHead className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200">
            {currentItems.map((item, index) => (
              <TableRow key={item.po_item_id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {item.product?.name || `Product ID: ${item.product_id}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Item #{startIndex + index + 1}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {item.pack_size_snapshot}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-6 text-right">
                  <span className="text-sm font-semibold text-gray-900">{item.unit_price.toFixed(2)} ৳</span>
                </TableCell>
                <TableCell className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                    {item.quantity}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-2 text-right">
                  <span className="text-m font-bold text-gray-600">{item.total_price.toFixed(2)} ৳</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, items.length)} of {items.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="primary"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItemsTable;
