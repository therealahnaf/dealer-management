import React, { useState, useEffect, useCallback } from 'react';
import { ProductRead } from '../types/api';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useDebounce from '../hooks/useDebounce';
import { useCart } from '../contexts/CartContext';
import { Search, Package, Plus, Minus } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async (search: string) => {
    setLoading(true);
    try {
      const response = await api.productApi.get<ProductRead[]>('/products/', {
        params: { search },
      });
      setProducts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedSearchTerm);
  }, [debouncedSearchTerm, fetchProducts]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, quantity) }));
  };

  const handleAddToCart = (product: ProductRead) => {
    const quantity = quantities[product.product_id] || 1;
    if (quantity > 0) {
      addToCart({
        product_id: product.product_id,
        name: product.name,
        quantity: quantity,
        unit_price: product.mrp,
      });
      // Reset quantity after adding
      setQuantities(prev => ({ ...prev, [product.product_id]: 1 }));
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Our Products
          </h1>
          <p className="text-gray-600 text-lg">Discover our premium product collection</p>
        </div>
        
        {/* Search */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {error && (
          <Alert type="error" className="max-w-2xl mx-auto">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 animate-pulse">
              <Package className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <Card 
                  key={product.product_id} 
                  className="group overflow-hidden" 
                  hover={true}
                  padding={false}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        In Stock
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors" title={product.name}>
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-3">{product.pack_size}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ৳{product.mrp.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">MRP</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                          onClick={() => handleQuantityChange(product.product_id, (quantities[product.product_id] || 1) - 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                          disabled={(quantities[product.product_id] || 1) <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
                          {quantities[product.product_id] || 1}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(product.product_id, (quantities[product.product_id] || 1) + 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1"
                        size="sm"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">No products found</p>
                <p className="text-gray-500">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;