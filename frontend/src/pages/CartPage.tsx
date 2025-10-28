import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Package, Receipt, ArrowLeft, Trash2, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { createPurchaseOrder } from '../services/purchaseOrderService';
import { getMyDealerProfile } from '../services/dealerService';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Loader from '../components/ui/Loader';

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
      setError('Your cart is empty. Please add some items before submitting your order.');
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
      <div className="min-h-screen bg-brand-light-orange">
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <Loader message="Processing Order..." />
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <Alert type="error" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
                {error}
              </Alert>
            </div>
          ) : itemCount > 0 ? (
            <div className="max-w-6xl mx-auto">
              {/* Header Section */}
              <div className="bg-white rounded-2xl shadow-xl border border-brand-orange/20 overflow-hidden mb-8">
                <div className="bg-brand-orange px-8 py-6 text-white">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <ShoppingCart className="w-6 h-6" />
                        <h1 className="text-3xl font-bold">Your Cart</h1>
                      </div>
                      <div className="flex flex-wrap gap-4 text-gray-100">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          to="/products"
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-300"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column - Order Summary */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Order Summary */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold">{totalAmount.toFixed(2)} tk</span>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">Total:</span>
                            <span className="text-2xl font-bold text-gray-600">{totalAmount.toFixed(2)} tk</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        {profileError ? (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <h3 className="font-semibold text-red-800">Profile Required</h3>
                            </div>
                            <p className="text-red-700 text-sm mb-3">No dealer profile found.</p>
                            <Link
                              to="/dealer"
                              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                            >
                              Create Dealer Profile
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={handleSubmitOrder}
                            disabled={loading || !dealerId}
                            className="w-full bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                          >
                            {loading ? 'Submitting Order...' : 'Submit Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Cart Items */}
                <div className="xl:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-gray-600" />
                          <h2 className="text-lg font-bold text-gray-800">Cart Items</h2>
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                            <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Unit Price</th>
                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                            <th className="text-center py-4 px-6 text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <tr key={item.product_id} className="hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 leading-tight">
                                      {item.name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-sm font-bold">
                                  {item.quantity}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className="font-semibold text-gray-900">{item.unit_price.toFixed(2)} tk</span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className="text-lg font-bold text-gray-600">{(item.unit_price * item.quantity).toFixed(2)} tk</span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => removeFromCart(item.product_id)}
                                  className="inline-flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg transition-colors text-sm font-semibold"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Products
                </Link>

                <div className="text-sm text-gray-500">
                  Ready to place your order
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Cart is Empty</h3>
                <p className="text-gray-500 mb-6">Add some products to your cart to get started.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors font-semibold"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Browse Products
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
