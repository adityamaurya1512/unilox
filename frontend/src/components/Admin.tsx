import { useState, useEffect } from 'react';
import { getAdminStats, generateDiscountCode } from '../api';

interface AdminStats {
  totalOrders: number;
  totalPurchaseAmount: number;
  discountCodes: Array<{
    code: string;
    isUsed: boolean;
    orderIndexCondition: number;
  }>;
  totalDiscountAmount: number;
}

/**
 * Admin Dashboard Component
 * Displays statistics and allows generating discount codes
 */
export function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true);
      setCodeMessage(null);
      const result = await generateDiscountCode();
      
      if (result.code) {
        setCodeMessage({ 
          type: 'success', 
          text: `Code generated: ${result.code}` 
        });
        // Reload stats to show new code
        await loadStats();
      } else {
        setCodeMessage({ 
          type: 'error', 
          text: result.message || 'Code not available. Next order is not the nth order.' 
        });
      }
    } catch (err) {
      setCodeMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Failed to generate code' 
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading admin stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p className="font-medium mb-1">Error</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-1">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm">Manage discount codes and view statistics</p>
          </div>
          <button
            onClick={loadStats}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Generate Discount Code Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="text-gray-900 text-base font-semibold mb-4">Generate Discount Code</h2>
          <button
            onClick={handleGenerateCode}
            disabled={generatingCode}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-md transition-colors"
          >
            {generatingCode ? 'Generating...' : 'Generate Discount Code'}
          </button>
          {codeMessage && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              codeMessage.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <p>{codeMessage.text}</p>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Total Orders */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-gray-500 text-xs font-medium uppercase mb-2 tracking-wide">Total Orders</h3>
            <p className="text-gray-900 text-3xl font-bold">{stats.totalOrders}</p>
          </div>

          {/* Total Purchase Amount */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-gray-500 text-xs font-medium uppercase mb-2 tracking-wide">Total Purchase Amount</h3>
            <p className="text-gray-900 text-3xl font-bold">{formatPrice(stats.totalPurchaseAmount)}</p>
          </div>

          {/* Total Discount Amount */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-gray-500 text-xs font-medium uppercase mb-2 tracking-wide">Total Discount Given</h3>
            <p className="text-green-600 text-3xl font-bold">
              {formatPrice(stats.totalDiscountAmount)}
            </p>
          </div>

          {/* Active Discount Codes Count */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
            <h3 className="text-gray-500 text-xs font-medium uppercase mb-2 tracking-wide">Discount Codes</h3>
            <p className="text-gray-900 text-3xl font-bold">
              {stats.discountCodes.length}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {stats.discountCodes.filter(c => !c.isUsed).length} unused
            </p>
          </div>
        </div>

        {/* Discount Codes List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h2 className="text-gray-900 text-base font-semibold mb-4">Discount Codes</h2>
          {stats.discountCodes.length === 0 ? (
            <p className="text-gray-500 text-sm">No discount codes generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Code</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-xs font-medium uppercase tracking-wide">Order Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.discountCodes.map((discount, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-gray-900 font-mono text-xs bg-gray-50 px-2 py-1 rounded">{discount.code}</code>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          discount.isUsed
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {discount.isUsed ? 'Used' : 'Available'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {discount.orderIndexCondition}th order
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
