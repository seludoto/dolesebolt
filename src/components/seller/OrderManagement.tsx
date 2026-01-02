import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package, Truck, CheckCircle, XCircle, Clock, Search } from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  tracking_number: string | null;
  products: {
    name: string;
  };
  orders: {
    order_number: string;
    created_at: string;
    buyer_id: string;
    shipping_address: any;
    user_profiles: {
      full_name: string;
      email: string;
    };
  };
}

export function OrderManagement() {
  const { user } = useAuth();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [user]);

  useEffect(() => {
    filterOrders();
  }, [orderItems, filter, searchQuery]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      // First get the seller ID
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

      const res = (await (supabase
        .from('order_items')
        .select(`
          *,
          products (
            name
          ),
          orders (
            order_number,
            created_at,
            buyer_id,
            shipping_address,
            user_profiles:buyer_id (
              full_name,
              email
            )
          )
        `)
        .eq('seller_id', seller.id)
        .order('created_at', { ascending: false }) as any));

      const data = res.data;
      const error = res.error;

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orderItems;

    if (filter !== 'all') {
      filtered = filtered.filter(item => item.status === filter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        item =>
          item.orders.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.orders.user_profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const updateOrderStatus = async (itemId: string, newStatus: string, trackingNumber?: string) => {
    setUpdating(itemId);
    try {
      const updateData: any = { status: newStatus };
      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      const { error } = await (supabase as any)
        .from('order_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;
      await loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const stats = {
    total: orderItems.length,
    pending: orderItems.filter(i => i.status === 'pending').length,
    processing: orderItems.filter(i => i.status === 'processing').length,
    shipped: orderItems.filter(i => i.status === 'shipped').length,
    delivered: orderItems.filter(i => i.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-yellow-800">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-blue-800">Processing</p>
          <p className="text-2xl font-bold text-blue-900">{stats.processing}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-purple-800">Shipped</p>
          <p className="text-2xl font-bold text-purple-900">{stats.shipped}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-green-800">Delivered</p>
          <p className="text-2xl font-bold text-green-900">{stats.delivered}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, product, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 text-sm">
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your filters'
              : 'Orders will appear here once customers make purchases'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        Order #{item.orders.order_number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(item.orders.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-gray-900 font-medium">{item.products.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ${item.unit_price.toFixed(2)} = $
                      {item.total_price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Customer: {item.orders.user_profiles.full_name} (
                      {item.orders.user_profiles.email})
                    </p>
                    {item.tracking_number && (
                      <p className="text-sm text-gray-600">
                        Tracking: <span className="font-mono">{item.tracking_number}</span>
                      </p>
                    )}
                  </div>

                  {/* Shipping Address */}
                  {item.orders.shipping_address && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Ship to:</p>
                      <p>{item.orders.shipping_address.full_name}</p>
                      <p>{item.orders.shipping_address.address_line1}</p>
                      {item.orders.shipping_address.address_line2 && (
                        <p>{item.orders.shipping_address.address_line2}</p>
                      )}
                      <p>
                        {item.orders.shipping_address.city}, {item.orders.shipping_address.state}{' '}
                        {item.orders.shipping_address.postal_code}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <select
                    value={item.status}
                    onChange={(e) => updateOrderStatus(item.id, e.target.value)}
                    disabled={updating === item.id}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {item.status === 'shipped' && !item.tracking_number && (
                    <button
                      onClick={() => {
                        const tracking = prompt('Enter tracking number:');
                        if (tracking) {
                          updateOrderStatus(item.id, 'shipped', tracking);
                        }
                      }}
                      disabled={updating === item.id}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                    >
                      Add Tracking
                    </button>
                  )}

                  {updating === item.id && (
                    <p className="text-sm text-gray-500 text-center">Updating...</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
