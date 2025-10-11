import React, { useState, useEffect, useCallback } from 'react';
import { ProductRead } from '../types/api';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import useDebounce from '../hooks/useDebounce';
import { useCart } from '../contexts/CartContext';
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
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
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
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative">
      {/* Product Image Placeholder */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center overflow-hidden">
        <Package className="w-16 h-16 text-gray-600 group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-600">
          In Stock
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
      </div>

      <div className="p-6 pb-20">
        {/* Product Info */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {product.pack_size}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-600">{product.mrp.toFixed(2)} ৳</span>
          </div>
        </div>
      </div>

      {/* Add to Cart Section - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <button
              onClick={() => handleQuantityChange(product.product_id, Math.max(1, (quantities[product.product_id] || 1) - 1))}
              className="px-3 py-2 hover:bg-gray-200 transition-colors text-gray-600 font-semibold"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              value={quantities[product.product_id] || 1}
              onChange={(e) => handleQuantityChange(product.product_id, Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 py-2 text-center border-0 bg-transparent font-semibold text-gray-800 focus:outline-none"
            />
            <button
              onClick={() => handleQuantityChange(product.product_id, (quantities[product.product_id] || 1) + 1)}
              className="px-3 py-2 hover:bg-gray-200 transition-colors text-gray-600 font-semibold"
            >
              +
            </button>
          </div>
          <button
            onClick={() => handleAddToCart(product)}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" /> +
          </button>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-6 text-white">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-6 h-6" />
                    <h1 className="text-3xl font-bold">Our Products</h1>
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-100">
                    <div className="flex items-center gap-2">
                      <span>Premium collection with competitive prices</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="relative flex-1 w-full lg:max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, SKU, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-5 h-5" />
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
            <div className="text-center py-20">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-gray-600 border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Products...</h3>
              <p className="text-gray-500">Please wait while we fetch the latest products</p>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-800">{processedProducts.length}</span> products
                </p>
              </div>

              {/* Products Grid/List */}
              {processedProducts.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
