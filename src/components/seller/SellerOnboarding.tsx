import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Store, FileText, CreditCard, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingData {
  businessName: string;
  businessType: string;
  description: string;
  phone: string;
  taxId: string;
  bankAccount: string;
  routingNumber: string;
}

export function SellerOnboarding({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    businessType: 'individual',
    description: '',
    phone: '',
    taxId: '',
    bankAccount: '',
    routingNumber: '',
  });

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create seller profile
      const sellerRes = (await (supabase as any)
        .from('sellers')
        .insert({
          user_id: user.id,
          business_name: data.businessName,
          business_type: data.businessType,
          description: data.description,
          verification_status: 'pending',
          trust_score: 5.0,
          total_sales: 0,
          commission_rate: 0.10,
          status: 'active',
        }));

      const sellerError = sellerRes.error;
      if (sellerError) throw sellerError;

      // Update user profile with phone
      const { error: profileError } = await (supabase as any)
        .from('user_profiles')
        .update({ phone: data.phone })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // In a real application, you would:
      // 1. Upload verification documents
      // 2. Set up payment processing with Stripe Connect
      // 3. Verify bank account details

      alert('Seller account created successfully! Your account is pending verification.');
      onComplete();
    } catch (error) {
      console.error('Error creating seller account:', error);
      alert('Failed to create seller account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.businessName && data.businessType && data.description && data.phone;
      case 2:
        return data.taxId;
      case 3:
        return data.bankAccount && data.routingNumber;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
          <h1 className="text-3xl font-bold mb-2">Become a Seller</h1>
          <p className="text-blue-100">Complete the onboarding process to start selling</p>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pt-6">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition ${
                    step >= num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > num ? <CheckCircle className="w-6 h-6" /> : num}
                </div>
                {num < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 transition ${
                      step > num ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Store className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold">Business Information</h2>
                  <p className="text-gray-600">Tell us about your business</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={data.businessName}
                  onChange={(e) => setData({ ...data, businessName: e.target.value })}
                  placeholder="Enter your business name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={data.businessType}
                  onChange={(e) => setData({ ...data, businessType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="individual">Individual / Sole Proprietor</option>
                  <option value="company">Company / LLC</option>
                  <option value="partnership">Partnership</option>
                  <option value="nonprofit">Non-Profit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  placeholder="Describe what you sell and what makes your business unique..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {data.description.length} / 500 characters
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold">Verification</h2>
                  <p className="text-gray-600">Verify your business identity</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> This information is required for tax purposes and to
                  comply with regulations. Your data is securely encrypted and protected.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tax ID / EIN *
                </label>
                <input
                  type="text"
                  value={data.taxId}
                  onChange={(e) => setData({ ...data, taxId: e.target.value })}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  For individuals, you can use your SSN. For businesses, use your EIN.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">Upload Verification Documents</p>
                <p className="text-sm text-gray-500 mb-4">
                  Business license, tax documents, or ID (Coming Soon)
                </p>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  Choose Files
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold">Payment Setup</h2>
                  <p className="text-gray-600">Configure how you'll receive payments</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  <strong>Commission Rate:</strong> 10% per transaction
                  <br />
                  <strong>Payout Schedule:</strong> Weekly (every Monday)
                  <br />
                  <strong>Processing Time:</strong> 2-3 business days
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Account Number *
                </label>
                <input
                  type="text"
                  value={data.bankAccount}
                  onChange={(e) => setData({ ...data, bankAccount: e.target.value })}
                  placeholder="Enter your bank account number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Routing Number *
                </label>
                <input
                  type="text"
                  value={data.routingNumber}
                  onChange={(e) => setData({ ...data, routingNumber: e.target.value })}
                  placeholder="9-digit routing number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>Demo Mode:</strong> In production, we would integrate with Stripe
                  Connect for secure payment processing. Your banking information would be
                  securely handled by Stripe.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
