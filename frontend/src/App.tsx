import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types/api';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Protected Pages
import DashboardPage from './pages/DashboardPage';
import DealerPage from './pages/DealerPage';
import ProductsPage from './pages/ProductsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage';
import CartPage from './pages/CartPage';

// Placeholder pages for future routes
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">This page will be implemented in future updates.</p>
    </div>
  </div>
);

// Component to handle home page redirection based on user role
const HomeRedirector = () => {
  const { isAuthenticated, hasRole, user, loading } = useAuth();
  const location = useLocation();
  
  console.log('HomeRedirector - Initial State:', { 
    loading,
    isAuthenticated, 
    user, 
    hasBuyerRole: hasRole(UserRole.BUYER), 
    hasAdminRole: hasRole(UserRole.ADMIN) 
  });
  
  // Show loading state
  if (loading) {
    console.log('HomeRedirector - Loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('HomeRedirector - User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check for buyer role first
  const isBuyer = hasRole(UserRole.BUYER);
  console.log('HomeRedirector - Buyer check:', { isBuyer, userRole: user?.role });
  
  if (isBuyer) {
    console.log('HomeRedirector - User is a buyer, redirecting to products');
    return <Navigate to="/products" replace />;
  }
  
  // Check for admin role
  const isAdmin = hasRole(UserRole.ADMIN);
  console.log('HomeRedirector - Admin check:', { isAdmin, userRole: user?.role });
  
  if (isAdmin) {
    console.log('HomeRedirector - User is an admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Fallback for users with no matching role
  console.error('HomeRedirector - No matching role found for user:', {
    user,
    userRole: user?.role,
    expectedRoles: [UserRole.BUYER, UserRole.ADMIN]
  });
  
  return <Navigate to="/unauthorized" replace />;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unauthorized" element={<PlaceholderPage title="Unauthorized" />} />
            
            {/* Buyer Routes */}
            <Route path="/" element={<HomeRedirector />} />
            
            <Route path="/products" element={
              <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.ADMIN]}>
                <ProductsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/cart" element={
              <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.ADMIN]}>
                <CartPage />
              </ProtectedRoute>
            } />

            <Route path="/purchase-orders" element={
              <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.ADMIN]}>
                <PurchaseOrdersPage />
              </ProtectedRoute>
            } />
            
            <Route path="/purchase-orders/:id" element={
              <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.ADMIN]}>
                <PurchaseOrderDetailPage />
              </ProtectedRoute>
            } />
            
            <Route path="/dealer" element={
              <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.ADMIN]}>
                <DealerPage />
              </ProtectedRoute>
            } />
            
            {/* Admin-only Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/invoices" element={
              <ProtectedRoute>
                <PlaceholderPage title="Invoices" />
              </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
              <ProtectedRoute>
                <PlaceholderPage title="Payments" />
              </ProtectedRoute>
            } />
            
            <Route path="/suppliers" element={
              <ProtectedRoute>
                <PlaceholderPage title="Suppliers" />
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <PlaceholderPage title="Analytics" />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <PlaceholderPage title="Settings" />
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;