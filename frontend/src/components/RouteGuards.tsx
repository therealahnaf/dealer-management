// src/components/RouteGuards.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // <- adjust import path if needed
import { homeForRole, UserRole } from '../roles';

type AllowRolesProps = {
  roles: UserRole[];
};

export function RequireAuth() {
  const { user, loading } = useAuth(); // expects { user, loading }
  const location = useLocation();

  if (loading) return null; // or a spinner

  if (!user) {
    // Not logged in: kick to login, preserve where they tried to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function AllowRoles({ roles }: AllowRolesProps) {
  const { user } = useAuth(); // expects { user?: { role?: 'admin' | 'buyer' } }
  const role = user?.role as UserRole | undefined;

  if (!role || !roles.includes(role)) {
    // Logged in but not allowed here → send to that role’s home
    return <Navigate to={homeForRole(role)} replace />;
  }

  return <Outlet />;
}

/**
 * If user is already authenticated, keep them away from public auth pages.
 * e.g., /login, /register, /reset-password should bounce to their home once logged in.
 */
export function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={homeForRole(user.role as UserRole)} replace />;
  return <Outlet />;
}
