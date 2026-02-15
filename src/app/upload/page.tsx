'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CSVUploader } from '@/components/upload/csv-uploader';
import { fetchBusinesses, createBusiness } from '@/lib/api-client';
import { BarChart3, Plus, Building2 } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBusinessIndustry, setNewBusinessIndustry] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingBusiness, setCreatingBusiness] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const { businesses: bizList } = await fetchBusinesses();
      setBusinesses(bizList);
      
      // Auto-select first business if available
      if (bizList.length > 0) {
        const existingId = localStorage.getItem('currentBusinessId');
        const businessToSelect = bizList.find(b => b.id === existingId) || bizList[0];
        setSelectedBusinessId(businessToSelect.id);
        localStorage.setItem('currentBusinessId', businessToSelect.id);
      }
    } catch (error) {
      console.error('Failed to load businesses:', error);
    } finally {
      setLoading(false);
    }
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
      setSelectedBusinessId(business.id);
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

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusinessId(businessId);
    localStorage.setItem('currentBusinessId', businessId);
  };

  const handleUploadSuccess = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LedgerMind AI</h1>
              <p className="text-sm text-gray-600">Upload your transaction data</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Business Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Business</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Business
            </button>
          </div>

          {businesses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No businesses yet. Create one to get started.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Business
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businesses.map((business) => (
                <button
                  key={business.id}
                  onClick={() => handleBusinessSelect(business.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedBusinessId === business.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{business.name}</h3>
                  {business.industry && (
                    <p className="text-sm text-gray-500 mb-2">{business.industry}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {business._count?.transactions || 0} transactions
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CSV Uploader */}
        {selectedBusinessId && (
          <CSVUploader
            businessId={selectedBusinessId}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
      </main>

      {/* Create Business Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Business</h3>
            
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
