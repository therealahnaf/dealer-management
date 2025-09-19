import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Package, 
  ShoppingCart, 
  FileText, 
  CreditCard, 
  Users, 
  TrendingUp, 
  Settings 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const dealerNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
];

const buyerNavigation = [
  { name: 'Dealer Profile', href: '/dealer', icon: Building2 },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
  { name: 'Invoices', href: '/invoices', icon: FileText },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  if (!user) return null;
  const navigation = user.role === 'admin' ? dealerNavigation : buyerNavigation;

  return (
    <div className="bg-white/80 backdrop-blur-md w-64 min-h-screen shadow-soft border-r border-gray-200/50">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-50/80 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;