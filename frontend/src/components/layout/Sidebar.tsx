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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'All Purchase Orders', href: '/admin/purchase-orders', icon: ShoppingCart },
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
  const navigation = user.role === 'admin' ? adminNavigation : buyerNavigation;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white w-64 min-h-screen shadow-lg border-r border-gray-200/50 backdrop-blur-sm relative">

      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md'
                      : 'text-gray-800 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-600'
                    }`}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user.full_name || user.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;