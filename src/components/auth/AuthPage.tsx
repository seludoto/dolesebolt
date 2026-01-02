import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Store } from 'lucide-react';

export function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center gap-12">
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900">Dolese</h1>
            <p className="text-xl text-gray-600 max-w-md leading-relaxed">
              The world's premier marketplace connecting buyers and sellers globally
            </p>
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">1M+</div>
                <div className="text-sm text-gray-600 mt-1">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50K+</div>
                <div className="text-sm text-gray-600 mt-1">Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10M+</div>
                <div className="text-sm text-gray-600 mt-1">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">150+</div>
                <div className="text-sm text-gray-600 mt-1">Countries</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          {showLogin ? (
            <LoginForm onToggleForm={() => setShowLogin(false)} />
          ) : (
            <RegisterForm onToggleForm={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
