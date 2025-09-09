// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth, AllowRoles, PublicOnly } from './components/RouteGuards';
import { homeForRole } from './roles';

// Pages (adjust import paths/names if needed)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage';
import DealerPage from './pages/DealerPage';
// import InvoicesPage from './pages/InvoicesPage';

import DashboardPage from './pages/DashboardPage';
import { useAuth } from './contexts/AuthContext';
// ...any other admin pages

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PUBLIC (auth) ---------- */}
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ---------- AUTHENTICATED ONLY ---------- */}
        <Route element={<RequireAuth />}>
          {/* Buyer + Admin can see buyer surface listed below */}
          <Route element={<AllowRoles roles={['buyer', 'admin']} />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="/dealer" element={<DealerPage />} />
            {/* <Route path="/invoices" element={<InvoicesPage />} /> */}
          </Route>

          {/* Admin-only: ALL other app pages go here */}
          <Route element={<AllowRoles roles={['admin']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Add every other route that should be admin-only */}
            {/* <Route path="/admin/something" element={<Something />} /> */}
          </Route>
        </Route>

        {/* ---------- DEFAULT LANDING / FALLBACK ---------- */}
        {/* If you want '/' to auto-route based on role */}
        <Route
          path="/"
          element={<Autoland />}
        />

        {/* Unknown route fallback */}
        <Route path="*" element={<UnknownRouteFallback />} />
      </Routes>
    </BrowserRouter>
  );
}

function Loader() {
  return <div style={{ padding: 24, textAlign: 'center' }}>Loading…</div>;
}

function Autoland() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeForRole(user.role)} replace />;
}

function UnknownRouteFallback() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to={homeForRole(user.role)} replace />;
  return <Navigate to="/login" replace />;
}
