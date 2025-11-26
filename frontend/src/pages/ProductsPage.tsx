import React, { useState, useEffect, useCallback } from 'react';
import { ProductRead } from '../types/api';
import api from '../services/api';
import Layout from '../components/layout/Layout';
import Alert from '../components/ui/Alert';
import useDebounce from '../hooks/useDebounce';
import { useCart } from '../contexts/CartContext';
import Loader from '../components/ui/Loader';
import { Search, ShoppingCart, Package, Grid, List } from 'lucide-react';
import { getProductImageUrl } from '../utils/imageUtils';
import { Card, CardContent, CardTitle } from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Button from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

interface ProductListResponse {
  items: ProductRead[];
  total: number;
  skip: number;
  limit: number;
}

// --- EXTRACTED COMPONENTS (Moved Outside) ---

interface ProductItemProps {
  product: ProductRead;
  quantity: string;
  validationError?: string;
  onQuantityChange: (productId: string, value: string) => void;
  onAddToCart: (product: ProductRead) => void;
}

const ProductCard: React.FC<ProductItemProps> = ({ 
  product, 
  quantity, 
  validationError, 
  onQuantityChange, 
  onAddToCart 
}) => {
  const imageUrl = getProductImageUrl(product.image);
  const [imageError, setImageError] = useState(false);
  const displayPrice = product.mrp || product.trade_price_incl_vat;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <div className="relative bg-brand-white h-48 flex items-center justify-center overflow-hidden p-4">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImageError(true)}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-16 h-16 text-brand-brown group-hover:scale-110 transition-transform duration-300" />
        )}
        <Badge variant="secondary" className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm">
          In Stock
        </Badge>
      </div>

      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1">
          <CardTitle className="text-sm mb-1 line-clamp-2 group-hover:text-gray-600 transition-colors" title={product.name}>
            {product.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {product.pack_size}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-600">{displayPrice.toFixed(2)} ৳</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={() => {
                  const currentValue = parseInt(quantity || '1') || 1;
                  const newValue = Math.max(0, currentValue - 1);
                  onQuantityChange(product.product_id, newValue.toString());
                }}
                className="px-2 py-1 hover:bg-gray-200 transition-colors text-gray-600 text-sm"
              >
                −
              </button>
              <input
                type="text"
                value={quantity}
                onChange={(e) => onQuantityChange(product.product_id, e.target.value)}
                className="w-12 py-1 text-center border-0 bg-transparent font-semibold text-gray-800 focus:outline-none text-sm"
                placeholder="1"
              />
              <button
                onClick={() => {
                  const currentValue = parseInt(quantity || '1') || 1;
                  const newValue = currentValue + 1;
                  onQuantityChange(product.product_id, newValue.toString());
                }}
                className="px-2 py-1 hover:bg-gray-200 transition-colors text-gray-600 text-sm"
              >
                +
              </button>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAddToCart(product)}
              className="flex-1"
            >
              <ShoppingCart className="w-3 h-3" />
            </Button>
          </div>
          {validationError && (
            <div className="text-xs text-red-600 mt-1">
              {validationError}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProductTableRow: React.FC<ProductItemProps> = ({ 
  product, 
  quantity, 
  validationError, 
  onQuantityChange, 
  onAddToCart 
}) => {
  const imageUrl = getProductImageUrl(product.image);
  const [imageError, setImageError] = useState(false);
  const displayPrice = product.mrp || product.trade_price_incl_vat;

  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell className="w-[100px]">
        <div className="w-16 h-16 bg-white rounded-md border border-gray-100 flex items-center justify-center overflow-hidden p-1">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={product.name}
              onError={() => setImageError(true)}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <Package className="w-8 h-8 text-gray-300" />
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 line-clamp-1" title={product.name}>
            {product.name}
          </span>
          <span className="text-xs text-gray-500 mt-1">{product.pack_size}</span>
        </div>
      </TableCell>

      <TableCell>
        <div className="font-semibold text-gray-700">
          {displayPrice.toFixed(2)} ৳
        </div>
      </TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white h-9">
            <button
              onClick={() => {
                const currentValue = parseInt(quantity || '1') || 1;
                const newValue = Math.max(0, currentValue - 1);
                onQuantityChange(product.product_id, newValue.toString());
              }}
              className="px-2 hover:bg-gray-100 text-gray-600 h-full flex items-center justify-center"
            >
              −
            </button>
            <input
              type="text"
              value={quantity}
              onChange={(e) => onQuantityChange(product.product_id, e.target.value)}
              className="w-12 text-center border-0 bg-transparent text-sm font-medium focus:outline-none h-full"
              placeholder="1"
            />
            <button
              onClick={() => {
                const currentValue = parseInt(quantity || '1') || 1;
                const newValue = currentValue + 1;
                onQuantityChange(product.product_id, newValue.toString());
              }}
              className="px-2 hover:bg-gray-100 text-gray-600 h-full flex items-center justify-center"
            >
              +
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAddToCart(product)}
            className="h-9 px-4 bg-gray-900 text-white hover:bg-gray-800"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
        {validationError && (
          <div className="text-xs text-red-600 mt-1 text-right">
            {validationError}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
};

// --- MAIN COMPONENT ---

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize] = useState(20);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async (search: string, page: number) => {
    setLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const response = await api.productApi.get<ProductListResponse>('/products/', {
        params: { search: search || undefined, skip, limit: pageSize },
      });
      setProducts(response.data.items);
      setTotalProducts(response.data.total);
      setError('');
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchProducts(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage, fetchProducts]);

  const handleQuantityChange = (productId: string, value: string) => {
    setQuantities(prev => ({ ...prev, [productId]: value }));
    if (validationErrors[productId]) {
      setValidationErrors(prev => ({ ...prev, [productId]: '' }));
    }
  };

  const validateQuantity = (quantity: string): { isValid: boolean; message: string; number?: number } => {
    if (!quantity || quantity.trim() === '') {
      return { isValid: false, message: 'Please enter a quantity' };
    }
    const num = parseInt(quantity.trim());
    if (isNaN(num)) return { isValid: false, message: 'Please enter a valid number' };
    if (num < 0) return { isValid: false, message: 'Quantity cannot be negative' };
    if (num > 99999) return { isValid: false, message: 'Quantity cannot exceed 99,999' };
    return { isValid: true, message: '', number: num };
  };

  const handleAddToCart = (product: ProductRead) => {
    const quantityValue = quantities[product.product_id] || '1';
    const validation = validateQuantity(quantityValue);
    
    if (!validation.isValid) {
      setValidationErrors(prev => ({ ...prev, [product.product_id]: validation.message }));
      return;
    }
    
    if (validation.number === 0) {
      setValidationErrors(prev => ({ ...prev, [product.product_id]: 'Cannot add 0 items to cart' }));
      return;
    }
    
    addToCart({
      product_id: product.product_id,
      name: product.name,
      quantity: validation.number!,
      unit_price: product.mrp || product.trade_price_incl_vat,
    });
    
    setQuantities(prev => ({ ...prev, [product.product_id]: '1' }));
    setValidationErrors(prev => ({ ...prev, [product.product_id]: '' }));
  };

  // Sort and filter products
  const processedProducts = products
    .sort((a, b) => {
      if (sortBy === 'price') {
        const priceA = a.mrp || a.trade_price_incl_vat;
        const priceB = b.mrp || b.trade_price_incl_vat;
        return priceA - priceB;
      }
      return a.name.localeCompare(b.name);
    });

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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 bg-gray-50 focus:bg-white text-sm"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Sort */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'price')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">{processedProducts.length}</span> of{' '}
                  <span className="font-semibold text-gray-800">{totalProducts}</span> products
                </p>
              </div>

              {processedProducts.length > 0 ? (
                <>
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                      {processedProducts.map((product) => (
                        <ProductCard 
                          key={product.product_id} 
                          product={product} 
                          quantity={quantities[product.product_id] || ''}
                          validationError={validationErrors[product.product_id]}
                          onQuantityChange={handleQuantityChange}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-[100px] text-center">Image</TableHead>
                            <TableHead>Product Details</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right pr-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedProducts.map((product) => (
                            <ProductTableRow 
                              key={product.product_id} 
                              product={product} 
                              quantity={quantities[product.product_id] || ''}
                              validationError={validationErrors[product.product_id]}
                              onQuantityChange={handleQuantityChange}
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination */}
                  <div className="mt-8 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Page <span className="font-semibold">{currentPage}</span> of{' '}
                        <span className="font-semibold">{Math.ceil(totalProducts / pageSize)}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil(totalProducts / pageSize)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium text-gray-700"
                    >
                      Next
                    </button>
                  </div>
                </>
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
                    <Button
                      variant="secondary"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div >
      </div >
    </Layout >
  );
};

export default ProductsPage;