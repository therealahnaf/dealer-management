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
  Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Dealers', href: '/admin/dealers', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'All Purchase Orders', href: '/admin/purchase-orders', icon: ShoppingCart },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
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
    <div className="bg-gradient-to-b from-brand-black to-brand-dark w-64 h-full flex flex-col shadow-lg border-r border-brand-gray-orange/20 backdrop-blur-sm relative">
      <nav className="flex-1 overflow-y-auto mt-5 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-orange text-white rounded-lg shadow-md'
                      : 'text-brand-light-orange hover:bg-brand-gray-orange/10 hover:text-brand-orange'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? 'text-white' : 'text-brand-gray-orange group-hover:text-brand-orange'
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-brand-orange rounded-full"></div>
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