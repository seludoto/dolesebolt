import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus, AlertCircle, BarChart3 } from 'lucide-react';
import { SellerOnboarding } from './SellerOnboarding';
import { ProductManager } from './ProductManager';
import { OrderManagement } from './OrderManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface SellerProfile {
  id: string;
  business_name: string;
  verification_status: string;
  trust_score: number;
  total_sales: number;
}

export function SellerDashboard() {
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'analytics'>('overview');

  useEffect(() => {
    loadSellerData();
  }, [user]);

  const loadSellerData = async () => {
    if (!user) return;

    try {
      const sellerRes = (await (supabase as any)
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle());
      const sellerData = sellerRes.data;
      const sellerError = sellerRes.error;

      if (sellerError) throw sellerError;

      if (!sellerData) {
        setShowOnboarding(true);
        setLoading(false);
        return;
      }

      setSeller(sellerData);

      const { count: productsCount } = await (supabase as any)
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerData.id);

      const { count: ordersCount } = await (supabase as any)
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerData.id);

      const { count: pendingCount } = await (supabase as any)
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerData.id)
        .eq('status', 'pending');

      const revenueRes = await (supabase as any)
        .from('order_items')
        .select('total_price')
        .eq('seller_id', sellerData.id);
      const revenueData = revenueRes.data as any[] | null;

      const totalRevenue = revenueData?.reduce((sum, item) => sum + item.total_price, 0) || 0;

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        pendingOrders: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error loading seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <SellerOnboarding onComplete={() => {
      setShowOnboarding(false);
      loadSellerData();
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {seller?.business_name}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                seller?.verification_status === 'verified'
                  ? 'bg-green-100 text-green-700'
                  : seller?.verification_status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {seller?.verification_status === 'verified' ? 'Verified Seller' :
                 seller?.verification_status === 'pending' ? 'Verification Pending' :
                 'Not Verified'}
              </span>
              <div className="flex items-center gap-1 text-gray-600">
                <span className="text-sm">Trust Score:</span>
                <span className="font-semibold text-blue-600">{seller?.trust_score.toFixed(1)}/5.0</span>
              </div>
            </div>
          </div>
          {activeTab === 'products' && (
            <button 
              onClick={() => {/* Will be handled by ProductManager */}}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Orders
            {stats.pendingOrders > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.pendingOrders}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <>
            {seller?.verification_status !== 'verified' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Complete Verification</h3>
                  <p className="text-sm text-yellow-800">
                    Your account is pending verification. Complete the verification process to start selling.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ${stats.totalRevenue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingOrders}</div>
                <div className="text-sm text-gray-600">Pending Orders</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <p className="text-gray-500 mb-4">Quick actions to get started</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Manage Products
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
                >
                  View Orders
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </div>
    </div>
  );
}
