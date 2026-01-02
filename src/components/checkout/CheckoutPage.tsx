import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { MapPin, CreditCard, Package, ArrowLeft, Check } from 'lucide-react';

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export function CheckoutPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [step, setStep] = useState<'address' | 'payment' | 'review'>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!user) return;

    try {
      const res = (await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false }) as any);
      const data = res.data as Address[] | null;
      const error = res.error;

      if (error) throw error;
      setAddresses(data || []);
      
      if (data && data.length > 0) {
        const defaultAddr = (data as any[]).find(a => a.is_default) || data[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const saveAddress = async () => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('addresses')
        .insert({
          ...newAddress,
          user_id: user.id,
        });

      if (error) throw error;
      await loadAddresses();
      setShowAddressForm(false);
      setNewAddress({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'USA',
      });
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address');
    }
  };

  const placeOrder = async () => {
    if (!user || !selectedAddress) return;

    setProcessing(true);
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const orderRes = (await (supabase as any)
        .from('orders')
        .insert({
          order_number: orderNumber,
          buyer_id: user.id,
          total_amount: totalAmount,
          shipping_address: selectedAddress,
          billing_address: selectedAddress,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single());

      const order = orderRes.data;
      const orderError = orderRes.error;
      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        seller_id: item.products.seller_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        commission_amount: item.price * item.quantity * 0.1, // 10% commission
        status: 'pending',
      }));

      const itemsRes = await (supabase as any)
        .from('order_items')
        .insert(orderItems);
      const itemsError = itemsRes.error;

      if (itemsError) throw itemsError;

      // Create transaction
      const txRes = await (supabase as any)
        .from('transactions')
        .insert({
          order_id: order.id,
          transaction_type: 'payment',
          amount: totalAmount,
          payment_method: 'card',
          status: 'pending',
        });

      const transactionError = txRes.error;
      if (transactionError) throw transactionError;

      // Clear cart
      await clearCart();

      alert('Order placed successfully! Order Number: ' + orderNumber);
      onBack();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const shippingCost = 0; // Free shipping
  const tax = totalAmount * 0.08; // 8% tax
  const grandTotal = totalAmount + shippingCost + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cart
        </button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm">
              {['address', 'payment', 'review'].map((s, idx) => (
                <div key={s} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step === s
                        ? 'bg-blue-600 text-white'
                        : idx < ['address', 'payment', 'review'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {idx < ['address', 'payment', 'review'].indexOf(step) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className="font-medium capitalize hidden sm:inline">{s}</span>
                  {idx < 2 && <div className="w-12 h-0.5 bg-gray-300 ml-3" />}
                </div>
              ))}
            </div>

            {/* Address Step */}
            {step === 'address' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {showAddressForm ? 'Cancel' : '+ Add New'}
                  </button>
                </div>

                {showAddressForm && (
                  <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                    <h3 className="font-semibold mb-4">New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                        className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        value={newAddress.address_line1}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                        className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="text"
                        placeholder="Address Line 2 (Optional)"
                        value={newAddress.address_line2}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                        className="col-span-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                    <button
                      onClick={saveAddress}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Save Address
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => setSelectedAddress(address)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedAddress?.id === address.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{address.full_name}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                        </div>
                        {address.is_default && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {addresses.length === 0 && !showAddressForm && (
                    <p className="text-gray-500 text-center py-8">
                      No saved addresses. Add one to continue.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setStep('payment')}
                  disabled={!selectedAddress}
                  className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border-2 border-blue-600 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">Credit / Debit Card</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Secure payment processing via Stripe
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-600">
                      💳 Demo Mode: Payment processing is simulated
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep('address')}
                    className="flex-1 border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('review')}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Review Step */}
            {step === 'review' && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold">Review Order</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping To:</h3>
                    {selectedAddress && (
                      <div className="text-sm text-gray-600">
                        <p>{selectedAddress.full_name}</p>
                        <p>{selectedAddress.address_line1}</p>
                        {selectedAddress.address_line2 && <p>{selectedAddress.address_line2}</p>}
                        <p>
                          {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Items ({items.length}):</h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.products.name} x {item.quantity}
                          </span>
                          <span className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep('payment')}
                    disabled={processing}
                    className="flex-1 border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={processing}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                <p>✓ Secure checkout</p>
                <p>✓ 30-day money-back guarantee</p>
                <p>✓ Free returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
