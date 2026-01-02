import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { TrendingUp, DollarSign, Package, ShoppingCart, Eye, Calendar } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  revenueChange: number;
  ordersChange: number;
  recentOrders: any[];
  topProducts: any[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalViews: 0,
    revenueChange: 0,
    ordersChange: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      // Get seller ID
      const sellerRes = (await (supabase
        .from('sellers')
        .select('id')
        .eq('user_id', user.id)
        .single() as any));
      const seller = sellerRes.data;

      if (!seller) {
        setLoading(false);
        return;
      }

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      if (timeRange === '7d') startDate.setDate(now.getDate() - 7);
      else if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
      else if (timeRange === '90d') startDate.setDate(now.getDate() - 90);
      else startDate.setFullYear(2000); // All time

      // Get order items
      const orderItemsRes = (await (supabase
        .from('order_items')
        .select(`
          *,
          products (name, view_count),
          orders (created_at)
        `)
        .eq('seller_id', seller.id)
        .gte('orders.created_at', startDate.toISOString()) as any));
      const orderItems = orderItemsRes.data as any[] | null;

      // Get all products
      const productsRes = (await (supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller.id) as any));
      const products = productsRes.data as any[] | null;

      // Calculate metrics
      const totalRevenue = orderItems?.reduce((sum: number, item: any) => sum + item.total_price, 0) || 0;
      const totalOrders = orderItems?.length || 0;
      const totalProducts = products?.length || 0;
      const totalViews = products?.reduce((sum: number, p: any) => sum + p.view_count, 0) || 0;

      // Calculate previous period for comparison
      const prevStartDate = new Date(startDate);
      if (timeRange === '7d') prevStartDate.setDate(startDate.getDate() - 7);
      else if (timeRange === '30d') prevStartDate.setDate(startDate.getDate() - 30);
      else if (timeRange === '90d') prevStartDate.setDate(startDate.getDate() - 90);

      const prevRes = await (supabase as any)
        .from('order_items')
        .select('total_price')
        .eq('seller_id', seller.id)
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString());
      const prevOrderItems = prevRes.data as any[] | null;

      const prevRevenue = prevOrderItems?.reduce((sum, item) => sum + item.total_price, 0) || 0;
      const prevOrders = prevOrderItems?.length || 0;

      const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      const ordersChange = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

      // Top products
      const productSales = new Map();
      orderItems?.forEach(item => {
        const current = productSales.get(item.product_id) || { name: item.products?.name, sales: 0, revenue: 0 };
        current.sales += item.quantity;
        current.revenue += item.total_price;
        productSales.set(item.product_id, current);
      });

      const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Monthly revenue (last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthRes = await (supabase as any)
          .from('order_items')
          .select('total_price')
          .eq('seller_id', seller.id)
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());
        const monthItems = monthRes.data as any[] | null;

        const revenue = monthItems?.reduce((sum: number, item: any) => sum + item.total_price, 0) || 0;
        monthlyRevenue.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue,
        });
      }

      setData({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalViews,
        revenueChange,
        ordersChange,
        recentOrders: orderItems?.slice(0, 10) || [],
        topProducts,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Track your business performance</p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${data.totalRevenue.toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`w-4 h-4 ${data.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-medium ${data.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.revenueChange >= 0 ? '+' : ''}{data.revenueChange.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Orders</p>
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.totalOrders}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className={`w-4 h-4 ${data.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-sm font-medium ${data.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.ordersChange >= 0 ? '+' : ''}{data.ordersChange.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Products</p>
            <Package className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.totalProducts}</p>
          <p className="text-sm text-gray-500 mt-2">Listed products</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Views</p>
            <Eye className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.totalViews}</p>
          <p className="text-sm text-gray-500 mt-2">Product impressions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Monthly Revenue Trend
          </h3>
          <div className="space-y-4">
            {data.monthlyRevenue.map((month, idx) => {
              const maxRevenue = Math.max(...data.monthlyRevenue.map(m => m.revenue), 1);
              const width = (month.revenue / maxRevenue) * 100;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className="text-sm font-semibold text-blue-600">
                      ${month.revenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Top Performing Products
          </h3>
          {data.topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data yet</p>
          ) : (
            <div className="space-y-4">
              {data.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${product.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              ${data.totalOrders > 0 ? (data.totalRevenue / data.totalOrders).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Order Value</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {data.totalProducts > 0 ? Math.round(data.totalViews / data.totalProducts) : 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Views/Product</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {data.totalViews > 0 ? ((data.totalOrders / data.totalViews) * 100).toFixed(1) : '0.0'}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              ${(data.totalRevenue * 0.9).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Est. Payout (90%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
