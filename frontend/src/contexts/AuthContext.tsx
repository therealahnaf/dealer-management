import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRead, Token, UserLogin, UserCreate, PasswordReset, UserRole, UserStatus } from '../types/api';
import { authApi } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole | string; // tolerate backend variance
  exp: number;
  iat: number;
}

interface AuthContextType {
  user: UserRead | null;
  token: string | null;
  login: (credentials: UserLogin) => Promise<UserRead>;
  register: (userData: UserCreate) => Promise<void>;
  resetPassword: (resetData: PasswordReset) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helpers
const STORAGE_TOKEN_KEY = 'token';
const STORAGE_USER_KEY = 'user';
const isExpired = (exp?: number) => !exp || exp * 1000 < Date.now();
const normalizeRole = (r: unknown): UserRole =>
  String(r ?? '').toLowerCase() === 'buyer' ? ('buyer' as UserRole) : ('admin' as UserRole);

// (Optional export) central place to decide landings per role
export const homeForRole = (role?: string) => (String(role).toLowerCase() === 'buyer' ? '/products' : '/dashboard');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRead | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(STORAGE_TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<JwtPayload>(token);

        if (isExpired(decoded.exp)) {
          // stale token → clear everything
          setToken(null);
          setUser(null);
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
          delete authApi.defaults.headers.common['Authorization'];
          setLoading(false);
          return;
        }

        // Good token → set header + user
        authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const userData: UserRead = {
          user_id: decoded.sub,
          email: decoded.email || '',
          role: normalizeRole(decoded.role),
          status: UserStatus.ACTIVE,
        };

        setUser(userData);
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      } catch (error) {
        // invalid token → clear session
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
        delete authApi.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (credentials: UserLogin): Promise<UserRead> => {
    setLoading(true);
    try {
      const { data } = await authApi.post<Token>('/users/login', credentials);
      const { access_token } = data;

      const decoded = jwtDecode<JwtPayload>(access_token);
      if (isExpired(decoded.exp)) {
        throw new Error('Received an expired token. Please try again.');
      }

      const userData: UserRead = {
        user_id: decoded.sub,
        email: decoded.email || credentials.email,
        role: normalizeRole(decoded.role),
        status: UserStatus.ACTIVE,
      };

      setToken(access_token);
      setUser(userData);
      localStorage.setItem(STORAGE_TOKEN_KEY, access_token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      authApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return userData; // <- let the caller redirect by role immediately if desired
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserCreate) => {
    setLoading(true);
    try {
      await authApi.post<UserRead>('/users/register', userData);
      // Auto-login after register
      await login({ email: userData.email, password: userData.password });
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetData: PasswordReset) => {
    setLoading(true);
    try {
      await authApi.post('/users/reset-password', resetData);
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    delete authApi.defaults.headers.common['Authorization'];
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user?.role) return false;
    return String(user.role).toLowerCase() === String(role).toLowerCase();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        resetPassword,
        logout,
        loading,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
