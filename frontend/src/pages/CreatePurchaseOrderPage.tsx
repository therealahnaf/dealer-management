// frontend/src/pages/CreatePurchaseOrderPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPurchaseOrder } from '../services/purchaseOrderService';
import { PurchaseOrderItemCreate } from '../types/purchaseOrder';

const CreatePurchaseOrderPage: React.FC = () => {
  const [dealerId, setDealerId] = useState('');
  const [items, setItems] = useState<PurchaseOrderItemCreate[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
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
      await createPurchaseOrder({ dealer_id: dealerId, items });
      navigate('/purchase-orders');
    } catch (err) {
      setError('Failed to create purchase order');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Purchase Order</h1>
      {error && <div className="bg-red-500 text-white p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Dealer ID</label>
          <input
            type="text"
            value={dealerId}
            onChange={(e) => setDealerId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="border p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Add Items</h2>
          <div className="grid grid-cols-3 gap-4 mb-2">
            <input
              type="text"
              placeholder="Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Unit Price"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
              className="p-2 border rounded"
            />
          </div>
          <button type="button" onClick={handleAddItem} className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Item
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Order Items</h3>
          <ul>
            {items.map((item, index) => (
              <li key={index} className="flex justify-between p-2 border-b">
                <span>{item.product_id}</span>
                <span>Qty: {item.quantity}</span>
                <span>Price: ${item.unit_price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mt-4">
          Create Order
        </button>
      </form>
    </div>
  );
};

export default CreatePurchaseOrderPage;
