import React, { useState, useEffect, useCallback } from 'react';
import { ProductRead } from '../types/api';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import useDebounce from '../hooks/useDebounce';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Products</h1>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.product_id} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="p-6">
                    <h2 className="text-l font-semibold text-gray-800 break-words" title={product.name}>{product.name}</h2>
                    <p className="text-sm text-gray-600 mt-2">{product.pack_size}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-lg font-bold text-blue-600">{product.mrp.toFixed(2)} tk</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-600">No products found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
