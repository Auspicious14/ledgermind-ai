'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadTransactions } from '@/lib/api-client';

interface CSVUploaderProps {
  businessId: string;
  onUploadSuccess?: () => void;
}

export function CSVUploader({ businessId, onUploadSuccess }: CSVUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSuccess(false);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadTransactions(file, businessId);
      setUploadResult(result);
      setSuccess(true);
      setFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onUploadSuccess) {
        setTimeout(onUploadSuccess, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Transaction Data</h3>
        <p className="text-sm text-gray-600">
          Upload a CSV file containing your transaction data to get started.
        </p>
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <label
          htmlFor="csv-upload"
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            file
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex flex-col items-center justify-center py-6">
            {file ? (
              <>
                <FileText className="w-12 h-12 text-blue-600 mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">CSV files only (max 10MB)</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            !file || uploading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload CSV
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {success && uploadResult && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-900 mb-1">{uploadResult.message}</p>
              <div className="text-sm text-green-700 space-y-1">
                <p>✓ {uploadResult.summary.validRows} rows imported successfully</p>
                {uploadResult.summary.errorRows > 0 && (
                  <p className="text-orange-600">
                    ⚠ {uploadResult.summary.errorRows} rows had errors
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900 mb-1">Upload failed</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* CSV Format Guide */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Required CSV Format:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>date</strong>: Transaction date (YYYY-MM-DD or MM/DD/YYYY)</li>
          <li>• <strong>productName</strong>: Name of the product</li>
          <li>• <strong>category</strong>: Product category (optional)</li>
          <li>• <strong>quantity</strong>: Number of units sold</li>
          <li>• <strong>revenue</strong>: Total revenue for this transaction</li>
          <li>• <strong>cost</strong>: Total cost for this transaction</li>
        </ul>
      </div>
    </div>
  );
}
