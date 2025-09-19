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
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
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
      case 'Approved': return 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100';
      case 'Pending': return 'text-yellow-700 bg-gradient-to-r from-yellow-50 to-yellow-100';
      case 'Delivered': return 'text-green-700 bg-gradient-to-r from-green-50 to-green-100';
      case 'Processing': return 'text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100';
      default: return 'text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome back, {user?.full_name || user?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name} hover={true} className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r from-${stat.color}-100 to-${stat.color}-200`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingCart className="h-6 w-6 mr-3 text-blue-600" />
                Recent Orders
              </h3>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">{order.id}</p>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <span>{order.date}</span>
                      <span>{order.items} items</span>
                      <span className="font-medium text-gray-900">{order.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
                Quick Actions
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="ghost" 
                className="p-6 h-auto flex-col items-start text-left bg-gradient-to-r from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 border border-blue-200"
              >
                <Package className="h-8 w-8 text-blue-600 mb-3" />
                <p className="font-medium text-gray-900 mb-1">New Order</p>
                <p className="text-sm text-gray-600">Create purchase order</p>
              </Button>
              
              <Button 
                variant="ghost" 
                className="p-6 h-auto flex-col items-start text-left bg-gradient-to-r from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50 border border-green-200"
              >
                <FileText className="h-8 w-8 text-green-600 mb-3" />
                <p className="font-medium text-gray-900 mb-1">View Invoices</p>
                <p className="text-sm text-gray-600">Check pending invoices</p>
              </Button>
              
              <Button 
                variant="ghost" 
                className="p-6 h-auto flex-col items-start text-left bg-gradient-to-r from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 border border-purple-200"
              >
                <Users className="h-8 w-8 text-purple-600 mb-3" />
                <p className="font-medium text-gray-900 mb-1">Profile</p>
                <p className="text-sm text-gray-600">Update dealer info</p>
              </Button>
              
              <Button 
                variant="ghost" 
                className="p-6 h-auto flex-col items-start text-left bg-gradient-to-r from-yellow-50 to-yellow-100/50 hover:from-yellow-100 hover:to-yellow-200/50 border border-yellow-200"
              >
                <TrendingUp className="h-8 w-8 text-yellow-600 mb-3" />
                <p className="font-medium text-gray-900 mb-1">Reports</p>
                <p className="text-sm text-gray-600">View analytics</p>
              </Button>
            </div>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <span className="font-medium text-green-900">System Status: All services operational</span>
            </div>
            <span className="text-sm text-green-700">Last updated: 2 minutes ago</span>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;