import React, { useState, useEffect } from 'react';
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
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';
import { getDashboardStats, DashboardStats } from '../services/dashboardService';
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getDashboardStats();
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(value);
  };

  const stats = [
    {
      name: 'Total Orders',
      value: data?.total_orders || 0,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      name: 'Total Sales Amount',
      value: formatCurrency(data?.outstanding_amount || 0),
      icon: DollarSign,
      color: 'red'
    },
    {
      name: 'Total Dealers',
      value: data?.total_dealers || 0,
      icon: Users,
      color: 'purple'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
  };

  const topProductsChartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Layout>
      {loading ? (
        <Loader message="Loading Dashboard..." />
      ) : (
        <div className="space-y-8 pb-8">
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold text-brand-brown mb-2">
                Dashboard
              </h1>
              <p className="text-brand-gray-orange text-lg">
                Welcome back, {user?.full_name || user?.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Card key={stat.name} hover={true} className="relative overflow-hidden">
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <div className="w-full">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.name}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Trend */}
            <Card>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
                  Revenue Trend
                </h3>
              </div>
              <div className="h-[300px] w-full">
                <ChartContainer config={revenueChartConfig} className="h-full w-full">
                  <AreaChart data={data?.monthly_revenue || []}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </Card>

            {/* Top Products */}
            <Card>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-purple-600" />
                  Top Selling Products
                </h3>
              </div>
              <div className="h-[300px] w-full">
                <ChartContainer config={topProductsChartConfig} className="h-full w-full">
                  <BarChart data={data?.top_products || []} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {data?.top_products?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={[
                      '#3b82f6', // blue
                      '#10b981', // green
                      '#f59e0b', // amber
                      '#ef4444', // red
                      '#8b5cf6', // purple
                    ][index % 5]} />
                  ))}
                </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <Card className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ShoppingCart className="h-6 w-6 mr-3 text-blue-600" />
                  Recent Orders
                </h3>
              </div>
              <div className="space-y-4">
                {data?.recent_orders?.map((order) => (
                  <div key={order.po_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">{order.po_number}</p>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span>{new Date(order.po_date).toLocaleDateString()}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(order.total_inc_vat)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!data?.recent_orders || data.recent_orders.length === 0) && (
                  <p className="text-center text-gray-500 py-4">No recent orders found.</p>
                )}
              </div>
            </Card>

            {/* Top Dealers */}
            <Card>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-6 w-6 mr-3 text-green-600" />
                  Top Dealers
                </h3>
              </div>
              <div className="space-y-4">
                {data?.dealer_stats?.map((dealer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="font-medium text-gray-900 truncate max-w-[120px]" title={dealer.name}>{dealer.name}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatCurrency(dealer.value)}</p>
                  </div>
                ))}
                {(!data?.dealer_stats || data.dealer_stats.length === 0) && (
                  <p className="text-center text-gray-500 py-4">No dealer data available.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;