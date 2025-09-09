import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRead, Token, UserLogin, UserCreate, PasswordReset, UserRole, UserStatus } from '../types/api';
import { authApi } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

interface AuthContextType {
  user: UserRead | null;
  token: string | null;
  login: (credentials: UserLogin) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRead | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext - Initial load, token exists:', !!token);
    
    const initializeAuth = async () => {
      if (!token) {
        console.log('AuthContext - No token found, setting user to null');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log('AuthContext - Setting auth header with token');
        authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Decode the token to get user info
        console.log('AuthContext - Decoding token...');
        const decoded = jwtDecode<JwtPayload>(token);
        console.log('AuthContext - Decoded token:', decoded);
        
        if (!decoded.sub || !decoded.role) {
          throw new Error('Invalid token: missing required fields');
        }
        
        const userData: UserRead = {
          user_id: decoded.sub,
          email: decoded.email || '',
          role: decoded.role,
          status: UserStatus.ACTIVE
        };
        
        console.log('AuthContext - Setting user from token:', userData);
        setUser(userData);
        
        // Ensure localStorage is in sync
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
      } catch (error) {
        console.error('AuthContext - Error initializing auth:', error);
        // Clear invalid token and user data
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete authApi.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [token]);

  const login = async (credentials: UserLogin) => {
    setLoading(true);
    try {
      console.log('Attempting login with credentials:', { email: credentials.email });
      
      // Use the response to get the token
      const { data } = await authApi.post<Token>('/users/login', credentials);
      const { access_token } = data;
      
      console.log('Login successful, token received');
      
      // Decode the token to get user info
      const decoded = jwtDecode<JwtPayload>(access_token);
      console.log('Decoded token payload:', decoded);
      
      const userData: UserRead = {
        user_id: decoded.sub,
        email: decoded.email || credentials.email, // Fallback to credentials email if not in token
        role: decoded.role,
        status: UserStatus.ACTIVE
      };
      
      console.log('Setting user data:', userData);
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      authApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      console.log('Login flow completed, user state updated');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserCreate) => {
    setLoading(true);
    try {
      const response = await authApi.post<UserRead>('/users/register', userData);
      
      // After successful registration, automatically log in
      await login({ email: userData.email, password: userData.password });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (resetData: PasswordReset) => {
    setLoading(true);
    try {
      await authApi.post('/users/reset-password', resetData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete authApi.defaults.headers.common['Authorization'];
  };

  const hasRole = (role: UserRole): boolean => {
    const userRole = user?.role;
    const hasRole = userRole?.toLowerCase() === role.toLowerCase();
    
    console.log('Role check:', {
      requiredRole: role,
      userRole: userRole,
      normalizedRequired: role.toLowerCase(),
      normalizedUser: userRole?.toLowerCase(),
      hasRole,
      user: user
    });
    
    return hasRole;
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
      {!loading && children}
    </AuthContext.Provider>
  );
};