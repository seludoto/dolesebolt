import { useAuth } from '../../contexts/AuthContext';
import { Store, ShoppingCart, Package, LayoutDashboard, LogOut, User } from 'lucide-react';

export function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Dolese</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {profile?.role === 'buyer' && (
              <>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <Store className="w-4 h-4" />
                  <span className="font-medium">Browse</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Orders</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-medium">Cart</span>
                </a>
              </>
            )}
            {profile?.role === 'seller' && (
              <>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">Dashboard</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Products</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-medium">Orders</span>
                </a>
              </>
            )}
            {profile?.role === 'admin' && (
              <>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="font-medium">Admin Panel</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <User className="w-4 h-4" />
                  <span className="font-medium">Users</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
                  <Store className="w-4 h-4" />
                  <span className="font-medium">Sellers</span>
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-gray-900">{profile?.full_name}</div>
              <div className="text-xs text-gray-500 capitalize">{profile?.role}</div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
