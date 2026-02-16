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
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LedgerMind AI</h1>
                <p className="text-sm text-gray-600">Upload your transaction data</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* CSV Uploader */}
        {selectedBusinessId ? (
          <CSVUploader
            businessId={selectedBusinessId}
            onUploadSuccess={handleUploadSuccess}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              No business selected. Please choose a business first.
            </p>
            <button
              onClick={() => router.push('/businesses')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Business List
            </button>
          </div>
        )}
      </main>

      {/* Create Business Modal (no longer used on this page) */}
    </div>
  );
}
