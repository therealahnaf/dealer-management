import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  BarChart3,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import Layout from '../components/layout/Layout';
import Loader from '../components/ui/Loader';
import { getDashboardStats, DashboardStats } from '../services/dashboardService';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Area,
  AreaChart,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import { Badge } from '../components/ui/badge';
import Button from '../components/ui/Button';

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
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(value);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'; // Using default as green-ish in many themes or map to explicit colors
      case 'submitted': return 'secondary';
      case 'draft': return 'outline';
      case 'delivered': return 'default';
      default: return 'secondary';
    }
  };

  const revenueChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  };

  const topProductsChartConfig = {
    sales: { label: "Sales", color: "hsl(var(--chart-2))" },
  };

  return (
    <Layout>
      {loading ? (
        <Loader message="Loading Dashboard..." />
      ) : (
        <div className="space-y-4 pb-8 pt-4">

          {/* KPI Section - Compact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                  <h3 className="text-xl font-semibold text-gray-900 mt-1">{formatCurrency(data?.outstanding_amount || 0)}</h3>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
                  <h3 className="text-xl font-semibold text-gray-900 mt-1">{data?.total_orders || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Dealers</p>
                  <h3 className="text-xl font-semibold text-gray-900 mt-1">{data?.total_dealers || 0}</h3>
                </div>
                <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid: 2/3 Left, 1/3 Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* LEFT COLUMN (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Revenue Chart - Reduced Height */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[200px] w-full">
                    <ChartContainer config={revenueChartConfig} className="h-full w-full">
                      <AreaChart data={data?.monthly_revenue || []}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false} 
                          axisLine={false} 
                          tickMargin={8} 
                          fontSize={12}
                          stroke="#6b7280"
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => `${value / 1000}k`}
                          fontSize={12}
                          stroke="#6b7280"
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders - Dense Table */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold text-gray-800">Recent Orders</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 text-xs">View All</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                          <th className="px-4 py-2">PO Number</th>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Status</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data?.recent_orders?.slice(0, 5).map((order) => (
                          <tr key={order.po_id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">{order.po_number}</td>
                            <td className="px-4 py-3 text-gray-500">{new Date(order.po_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <Badge variant={getStatusVariant(order.status) as any} className="capitalize font-normal">
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              {formatCurrency(order.total_inc_vat)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(!data?.recent_orders?.length) && (
                    <div className="p-4 text-center text-gray-500 text-sm">No recent orders found.</div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* RIGHT COLUMN (1/3 width) */}
            <div className="space-y-4">
              
              {/* Top Products - Compact Vertical List Chart */}
              <Card className="shadow-sm h-fit">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Top Products
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-[200px] w-full">
                    <ChartContainer config={topProductsChartConfig} className="h-full w-full">
                      <BarChart data={data?.top_products || []} layout="vertical" margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={85} 
                          tick={{ fontSize: 11, fill: '#6b7280' }} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <ChartTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={16}>
                          {data?.top_products?.map((_, index) => (
                             <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Top Dealers - Compact List */}
              <Card className="shadow-sm h-fit">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    Top Dealers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="space-y-3">
                    {data?.dealer_stats?.slice(0, 5).map((dealer, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm group">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-600 rounded flex items-center justify-center text-xs font-semibold group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-700 truncate max-w-[100px]" title={dealer.name}>
                            {dealer.name}
                          </span>
                        </div>
                        <span className="text-gray-900 font-semibold text-xs">
                          {new Intl.NumberFormat('en-BD', { notation: "compact" }).format(dealer.value)}
                        </span>
                      </div>
                    ))}
                    {(!data?.dealer_stats?.length) && (
                      <p className="text-center text-gray-500 py-2 text-xs">No dealer data.</p>
                    )}
                  </div>
                  <Button variant="ghost" className="w-full mt-2 text-xs h-8 text-gray-500 hover:text-gray-900">
                    View All Dealers <ArrowRight className="w-3 h-3 ml-1"/>
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DashboardPage;