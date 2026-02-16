'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchBusinesses, createBusiness } from '@/lib/api-client';
import { BarChart3, Building2, Plus } from 'lucide-react';

export default function BusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBusinessIndustry, setNewBusinessIndustry] = useState('');
  const [creatingBusiness, setCreatingBusiness] = useState(false);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoading(true);
        const { businesses: bizList } = await fetchBusinesses();
        setBusinesses(bizList);
      } catch (error) {
        console.error('Failed to load businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const handleSelectBusiness = (businessId: string) => {
    localStorage.setItem('currentBusinessId', businessId);
    router.push('/dashboard');
  };

  const handleCreateBusiness = async () => {
    if (!newBusinessName.trim()) return;

    try {
      setCreatingBusiness(true);
      const { business } = await createBusiness({
        name: newBusinessName,
        industry: newBusinessIndustry || undefined,
      });

      setBusinesses([business, ...businesses]);
      localStorage.setItem('currentBusinessId', business.id);
      setShowCreateModal(false);
      setNewBusinessName('');
      setNewBusinessIndustry('');
    } catch (error) {
      console.error('Failed to create business:', error);
    } finally {
      setCreatingBusiness(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">LedgerMind AI</h1>
                <p className="text-sm text-gray-600">Select a business</p>
              </div>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Business
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              No businesses yet. Create one to get started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Business
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => handleSelectBusiness(business.id)}
                className="w-full p-4 rounded-lg border-2 border-gray-200 bg-white text-left hover:border-blue-600 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{business.name}</h3>
                    {business.industry && (
                      <p className="text-sm text-gray-500">{business.industry}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {business._count?.transactions || 0} transactions
                    </p>
                  </div>
                  <span className="text-sm font-medium text-blue-600">
                    View dashboard →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Business
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., My Coffee Shop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry (optional)
                </label>
                <input
                  type="text"
                  value={newBusinessIndustry}
                  onChange={(e) => setNewBusinessIndustry(e.target.value)}
                  className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="e.g., Food & Beverage"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleCreateBusiness}
                disabled={!newBusinessName.trim() || creatingBusiness}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {creatingBusiness ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create'
                )}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBusinessName('');
                  setNewBusinessIndustry('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

