import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  Package, 
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Layout from '../components/layout/Layout';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Orders',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      name: 'Pending Orders',
      value: '8',
      change: '+4.75%',
      changeType: 'positive',
      icon: AlertCircle,
      color: 'yellow'
    },
    {
      name: 'Total Invoices',
      value: '16',
      change: '+54.02%',
      changeType: 'positive',
      icon: FileText,
      color: 'green'
    },
    {
      name: 'Outstanding Amount',
      value: '$12,450',
      change: '-3.2%',
      changeType: 'negative',
      icon: DollarSign,
      color: 'red'
    }
  ];

  const recentOrders = [
    { id: 'PO-001', date: '2025-01-14', items: 15, status: 'Approved', amount: '$2,340' },
    { id: 'PO-002', date: '2025-01-13', items: 8, status: 'Pending', amount: '$1,250' },
    { id: 'PO-003', date: '2025-01-12', items: 22, status: 'Delivered', amount: '$3,480' },
    { id: 'PO-004', date: '2025-01-11', items: 12, status: 'Processing', amount: '$1,890' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-blue-700 bg-blue-100';
      case 'Pending': return 'text-yellow-700 bg-yellow-100';
      case 'Delivered': return 'text-green-700 bg-green-100';
      case 'Processing': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.full_name || user?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                Recent Orders
              </h3>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>{order.date}</span>
                      <span>{order.items} items</span>
                      <span className="font-medium">{order.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">New Order</p>
                <p className="text-sm text-gray-600">Create purchase order</p>
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">View Invoices</p>
                <p className="text-sm text-gray-600">Check pending invoices</p>
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <p className="font-medium text-gray-900">Profile</p>
                <p className="text-sm text-gray-600">Update dealer info</p>
              </button>
              <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left">
                <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
                <p className="font-medium text-gray-900">Reports</p>
                <p className="text-sm text-gray-600">View analytics</p>
              </button>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-900">System Status: All services operational</span>
            </div>
            <span className="text-xs text-gray-500">Last updated: 2 minutes ago</span>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;