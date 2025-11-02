// frontend/src/services/purchaseOrderService.ts
import { purchaseOrderApi } from './api';
import { PurchaseOrder, PurchaseOrderCreate } from '../types/purchaseOrder';

interface PurchaseOrderListResponse {
  items: PurchaseOrder[];
  total: number;
  skip: number;
  limit: number;
}

export const createPurchaseOrder = async (orderData: PurchaseOrderCreate): Promise<PurchaseOrder> => {
  const response = await purchaseOrderApi.post('/purchase-orders/', orderData);
  return response.data;
};

export const getMyPurchaseOrders = async (skip: number = 0, limit: number = 20): Promise<PurchaseOrderListResponse> => {
  const response = await purchaseOrderApi.get('/purchase-orders/my-orders', {
    params: { skip, limit }
  });
  return response.data;
};

export const getPurchaseOrderDetails = async (po_id: number): Promise<PurchaseOrder> => {
  const response = await purchaseOrderApi.get(`/purchase-orders/${po_id}`);
  return response.data;
};

export const getAllPurchaseOrders = async (skip: number = 0, limit: number = 20): Promise<PurchaseOrderListResponse> => {
    const response = await purchaseOrderApi.get('/purchase-orders/', {
      params: { skip, limit }
    });
    return response.data;
};

export const getPurchaseOrderDetailsByDealerAndPoId = async (dealer_id: string, po_id: number): Promise<PurchaseOrder> => {
    const response = await purchaseOrderApi.get(`/purchase-orders/${dealer_id}/${po_id}`);
    return response.data;
};

export const approvePurchaseOrder = async (dealer_id: string, po_id: number): Promise<PurchaseOrder> => {
    const response = await purchaseOrderApi.put(`/purchase-orders/${dealer_id}/${po_id}/approve`);
    return response.data;
};

export const getApprovedPurchaseOrders = async (skip: number = 0, limit: number = 20): Promise<PurchaseOrderListResponse> => {
  const response = await purchaseOrderApi.get('/purchase-orders/my-orders/approved', {
    params: { skip, limit }
  });
  return response.data;
};
