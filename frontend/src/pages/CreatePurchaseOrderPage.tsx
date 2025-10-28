// frontend/src/pages/CreatePurchaseOrderPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPurchaseOrder } from '../services/purchaseOrderService';
import { PurchaseOrderItemCreate } from '../types/purchaseOrder';
import Loader from '../components/ui/Loader';

const CreatePurchaseOrderPage: React.FC = () => {
  const [dealerId, setDealerId] = useState('');
  const [items, setItems] = useState<PurchaseOrderItemCreate[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddItem = () => {
    if (productId && quantity > 0 && unitPrice > 0) {
      setItems([...items, { product_id: productId, quantity, unit_price: unitPrice }]);
      setProductId('');
      setQuantity(1);
      setUnitPrice(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId || items.length === 0) {
      setError('Dealer ID and at least one item are required.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await createPurchaseOrder({ dealer_id: dealerId, items });
      navigate('/purchase-orders');
    } catch (err) {
      setError('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light-orange p-4">
      {loading ? (
        <Loader message="Creating Purchase Order..." />
      ) : (
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl border border-brand-orange/20 overflow-hidden">
          <div className="bg-brand-orange px-8 py-6 text-white">
            <h1 className="text-3xl font-bold">Create New Purchase Order</h1>
          </div>
          
          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 m-6 rounded-lg">{error}</div>}
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-brand-brown uppercase mb-2">Dealer ID</label>
              <input
                type="text"
                value={dealerId}
                onChange={(e) => setDealerId(e.target.value)}
                className="w-full px-4 py-3 border border-brand-orange/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                required
              />
            </div>

            <div className="border-2 border-brand-orange/20 p-6 rounded-lg bg-brand-light-orange/30">
              <h2 className="text-xl font-bold text-brand-brown mb-4">Add Items</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Product ID"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="px-4 py-2 border border-brand-orange/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="px-4 py-2 border border-brand-orange/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                  className="px-4 py-2 border border-brand-orange/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <button type="button" onClick={handleAddItem} className="bg-brand-orange text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-semibold">
                Add Item
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-brand-brown mb-4">Order Items</h3>
              {items.length > 0 ? (
                <div className="space-y-2 border border-brand-orange/20 rounded-lg overflow-hidden">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between p-4 border-b border-brand-orange/10 hover:bg-brand-light-orange/30 transition-colors">
                      <span className="font-medium text-brand-brown">{item.product_id}</span>
                      <span className="text-brand-gray-orange">Qty: {item.quantity}</span>
                      <span className="font-semibold text-brand-brown">Price: ${item.unit_price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-brand-gray-orange/70 italic">No items added yet</p>
              )}
            </div>

            <button type="submit" className="w-full bg-brand-orange text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold text-lg mt-8">
              Create Order
            </button>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default CreatePurchaseOrderPage;
