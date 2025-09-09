import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { createPurchaseOrder } from '../services/purchaseOrderService';
import { getMyDealerProfile } from '../services/dealerService';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, clearCart, itemCount } = useCart();
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileError, setProfileError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDealerProfile = async () => {
      console.log('Attempting to fetch dealer profile...');
      try {
        const profile = await getMyDealerProfile();
        console.log('Dealer profile fetched:', profile);
        if (profile && profile.dealer_id) {
          setDealerId(profile.dealer_id);
        } else {
          console.log('No dealer ID found in profile.');
          setProfileError(true);
        }
      } catch (err: any) {
        console.error('Error fetching dealer profile:', err);
        if (err.response && err.response.status === 404) {
          console.log('Dealer profile not found (404).');
          setProfileError(true);
        } else {
          setError('Could not fetch dealer profile.');
        }
      }
    };

    fetchDealerProfile();
  }, []);

  const totalAmount = cartItems.reduce((total, item) => total + item.unit_price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (!dealerId) {
      setError('Dealer ID is required to submit the order.');
      return;
    }
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createPurchaseOrder({
        dealer_id: dealerId,
        items: cartItems.map(({ product_id, quantity, unit_price }) => ({ product_id, quantity, unit_price }))
      });
      clearCart();
      navigate('/purchase-orders'); // Redirect to the list of orders
    } catch (err) {
      setError('Failed to create purchase order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>
        {error && <Alert type="error" className="mb-6">{error}</Alert>}
        {itemCount > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Order Items ({itemCount})</h2>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.product_id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{(item.unit_price * item.quantity).toFixed(2)} tk</p>
                      <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 text-sm hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md h-fit">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{totalAmount.toFixed(2)} tk</span>
                </div>
                {/* Add VAT/tax calculation if needed */}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{totalAmount.toFixed(2)} tk</span>
                </div>
              </div>
              <div className="space-y-4">
                {profileError ? (
                  <div className="text-center p-4 border border-red-200 bg-red-50 rounded-lg">
                    <p className="text-red-700">No dealer profile found.</p>
                    <Link to="/dealer" className="text-blue-600 hover:underline">
                      Create a dealer profile to continue.
                    </Link>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={handleSubmitOrder} 
                      disabled={loading || !dealerId}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                      {loading ? 'Submitting...' : 'Submit Order'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600">Your cart is empty.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
