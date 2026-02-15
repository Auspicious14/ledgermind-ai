'use client';

import { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';

interface ExportButtonProps {
  businessId: string;
  businessName: string;
}

export function ExportButton({ businessId, businessName }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExportHTML = async () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const response = await fetch(`/api/report?businessId=${businessId}&format=html`);
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${businessName}-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPDF = async () => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const response = await fetch(`/api/report?businessId=${businessId}&format=html`);
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const html = await response.text();
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print dialog
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to open print dialog. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generating...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export Report
          </>
        )}
      </button>

      {showMenu && !isExporting && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          ></div>
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
            <button
              onClick={handlePrintPDF}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <div>
                <div className="font-medium text-sm">Print as PDF</div>
                <div className="text-xs text-gray-500">Use browser print dialog</div>
              </div>
            </button>
            <button
              onClick={handleExportHTML}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              <div>
                <div className="font-medium text-sm">Download HTML</div>
                <div className="text-xs text-gray-500">Viewable in any browser</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}