import React, { useState, useEffect, useCallback } from 'react';
import { ProductRead } from '../types/api';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import useDebounce from '../hooks/useDebounce';
import { useCart } from '../contexts/CartContext';
import Loader from '../components/ui/Loader';
import { Search, ShoppingCart, Package, Grid, List } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');

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
      // Show success feedback
      setQuantities(prev => ({ ...prev, [product.product_id]: 1 }));
    }
  };

  // Sort and filter products
  const processedProducts = products
    .sort((a, b) => {
      if (sortBy === 'price') {
        return a.mrp - b.mrp;
      }
      return a.name.localeCompare(b.name);
    });

  const ProductCard = ({ product }: { product: ProductRead }) => (
    <div className="group bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 flex flex-col h-full">
      {/* Product Image Placeholder */}
      <div className="relative bg-brand-light-orange h-32 flex items-center justify-center overflow-hidden">
        <Package className="w-12 h-12 text-brand-brown group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-600">
          In Stock
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {/* Product Info */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-gray-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {product.pack_size}
            </span>
          </div>
        </div>

        {/* Price and Add to Cart Section - Sticky at Bottom */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-600">{product.mrp.toFixed(2)} ৳</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={() => handleQuantityChange(product.product_id, Math.max(1, (quantities[product.product_id] || 1) - 1))}
                className="px-2 py-1 hover:bg-gray-200 transition-colors text-gray-600 text-sm"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantities[product.product_id] || 1}
                onChange={(e) => handleQuantityChange(product.product_id, Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 py-1 text-center border-0 bg-transparent font-semibold text-gray-800 focus:outline-none text-sm"
              />
              <button
                onClick={() => handleQuantityChange(product.product_id, (quantities[product.product_id] || 1) + 1)}
                className="px-2 py-1 hover:bg-gray-200 transition-colors text-gray-600 text-sm"
              >
                +
              </button>
            </div>
            <button
              onClick={() => handleAddToCart(product)}
              className="flex-1 bg-black text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-1 font-semibold text-sm"
            >
              <ShoppingCart className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductListItem = ({ product }: { product: ProductRead }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100">
      <div className="flex items-center gap-6">
        {/* Product Image */}
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Package className="w-8 h-8 text-gray-600" />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 mb-1 truncate" title={product.name}>
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{product.pack_size}</p>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold text-gray-600">{product.mrp.toFixed(2)} ৳</span>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => handleQuantityChange(product.product_id, Math.max(1, (quantities[product.product_id] || 1) - 1))}
              className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-600"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={quantities[product.product_id] || 1}
              onChange={(e) => handleQuantityChange(product.product_id, Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 py-1 text-center border-0 bg-transparent font-semibold focus:outline-none"
            />
            <button
              onClick={() => handleQuantityChange(product.product_id, (quantities[product.product_id] || 1) + 1)}
              className="px-2 py-1 hover:bg-gray-100 transition-colors text-gray-600"
            >
              +
            </button>
          </div>
          <button
            onClick={() => handleAddToCart(product)}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 font-semibold"
          >
            <ShoppingCart className="w-4 h-4" />
            +
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Minimal Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-orange" />
              <h1 className="text-2xl font-bold text-brand-brown">Products</h1>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 bg-gray-50 focus:bg-white text-sm"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert type="error" className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              {error}
            </Alert>
          )}

          {loading ? (
            <Loader message="Loading Products..." />
          ) : (
            <>
              {/* Results Header */}
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">{processedProducts.length}</span> products
                </p>
              </div>

              {/* Products Grid/List */}
              {processedProducts.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {processedProducts.map((product) => (
                      <ProductCard key={product.product_id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processedProducts.map((product) => (
                      <ProductListItem key={product.product_id} product={product} />
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? `No products match "${searchTerm}"` : 'No products available at the moment'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;