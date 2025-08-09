import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRead, Token, UserLogin, UserCreate, PasswordReset } from '../types/api';
import { authApi } from '../services/api';

interface AuthContextType {
  user: UserRead | null;
  token: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  resetPassword: (resetData: PasswordReset) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
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
    if (token) {
      // Set default authorization header
      authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Try to get user info - in a real app you'd have a /me endpoint
      // For now, we'll decode the token or store user info in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (credentials: UserLogin) => {
    setLoading(true);
    try {
      const response = await authApi.post<Token>('/users/login', credentials);
      const { access_token } = response.data;
      
      setToken(access_token);
      localStorage.setItem('token', access_token);
      authApi.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // In a real app, you'd fetch user info here
      // For now, we'll create a mock user object
      const mockUser: UserRead = {
        user_id: '1',
        email: credentials.email,
        full_name: 'User', // This would come from the actual API
        role: undefined,
        status: undefined
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
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

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    login,
    register,
    resetPassword,
    logout,
    loading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};