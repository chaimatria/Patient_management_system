// components/ConsultationsTrend.jsx
'use client';

import { useState } from 'react';
import { FileDown, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export default function ConsultationsTrend({ data }) {
  const [activeTab, setActiveTab] = useState('daily');
  const [isExporting, setIsExporting] = useState(false);

  if (!data) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  const trendData = data[activeTab] || [];
  const maxCount = Math.max(...trendData.map(d => d.count), 1);

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('Rapport de Tendance des Consultations', 20, 20);

      // Add metadata
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Période: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 20, 30);
      pdf.text(`Généré: ${new Date().toLocaleDateString('fr-FR')}`, 20, 37);

      // Add table header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('Date', 30, 50);
      pdf.text('Consultations', 120, 50);

      // Add table data
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      let yPosition = 60;

      trendData.forEach((point, index) => {
        pdf.text(point.label || point.timestamp, 30, yPosition);
        pdf.text(String(point.count), 120, yPosition);
        yPosition += 8;

        // Add new page if needed
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
      });

      // Add summary
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      yPosition += 10;
      pdf.text(`Total Consultations: ${trendData.reduce((sum, p) => sum + p.count, 0)}`, 30, yPosition);
      pdf.text(`Moyenne: ${Math.round(trendData.reduce((sum, p) => sum + p.count, 0) / trendData.length)}`, 30, yPosition + 8);

      // Download PDF
      pdf.save(`consultations-trend-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Échec de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    try {
      setIsExporting(true);
      
      // Prepare CSV headers
      const headers = ['Date', 'Consultations'];
      
      // Prepare CSV rows
      const rows = trendData.map(point => [
        point.label || point.timestamp,
        point.count
      ]);

      // Add summary
      rows.push(['']);
      rows.push(['Total', trendData.reduce((sum, p) => sum + p.count, 0)]);
      rows.push(['Average', Math.round(trendData.reduce((sum, p) => sum + p.count, 0) / trendData.length)]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `consultations-trend-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Impossible d\'exporter CSV');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Tendance des Consultations</h2>
        <p className="text-sm text-gray-500">Nombre de consultations au fil du temps.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'daily'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Quotidien
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Hebdomadaire
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'monthly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Mensuel
          </button>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToPDF}
            disabled={isExporting || trendData.length === 0}
            className="flex items-center justify-center sm:justify-start gap-2 flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Export en cours...' : 'PDF'}</span>
          </button>
          <button 
            onClick={exportToCSV}
            disabled={isExporting || trendData.length === 0}
            className="flex items-center justify-center sm:justify-start gap-2 flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isExporting ? 'Export en cours...' : 'CSV'}</span>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative w-full h-64 bg-gray-50 rounded-lg p-4 overflow-x-auto">
        {trendData.length > 0 ? (
          <svg className="w-full h-full min-w-full" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
            {/* Y-axis */}
            <line x1="40" y1="20" x2="40" y2="170" stroke="#e5e7eb" strokeWidth="1" />
            
            {/* X-axis */}
            <line x1="40" y1="170" x2="580" y2="170" stroke="#e5e7eb" strokeWidth="1" />

            {/* Y-axis labels */}
            <text x="30" y="25" className="text-xs fill-gray-500" textAnchor="end">{maxCount}</text>
            <text x="30" y="70" className="text-xs fill-gray-500" textAnchor="end">{Math.round(maxCount * 0.75)}</text>
            <text x="30" y="120" className="text-xs fill-gray-500" textAnchor="end">{Math.round(maxCount * 0.5)}</text>
            <text x="30" y="170" className="text-xs fill-gray-500" textAnchor="end">{Math.round(maxCount * 0.25)}</text>

            {/* Grid lines */}
            <line x1="40" y1="20" x2="580" y2="20" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="40" y1="70" x2="580" y2="70" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="40" y1="120" x2="580" y2="120" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="40" y1="170" x2="580" y2="170" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2,2" />

            {/* Data line with gradient area */}
            {trendData.length > 0 && (
              <>
                {/* Area under line */}
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                
                {/* Filled area */}
                <path
                  d={`${trendData.map((point, idx) => {
                    const x = 40 + (idx / (trendData.length - 1 || 1)) * 540;
                    const y = 170 - (point.count / maxCount) * 150;
                    return idx === 0 ? `M ${x},${y}` : `L ${x},${y}`;
                  }).join(' ')} L ${40 + 540},170 L 40,170 Z`}
                  fill="url(#lineGradient)"
                />
                
                {/* Line */}
                <path
                  d={trendData.map((point, idx) => {
                    const x = 40 + (idx / (trendData.length - 1 || 1)) * 540;
                    const y = 170 - (point.count / maxCount) * 150;
                    return idx === 0 ? `M ${x},${y}` : `L ${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {trendData.map((point, idx) => {
                  const x = 40 + (idx / (trendData.length - 1 || 1)) * 540;
                  const y = 170 - (point.count / maxCount) * 150;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="1"
                    />
                  );
                })}
              </>
            )}

            {/* X-axis labels */}
            {trendData.length > 0 && trendData.slice(0, Math.min(8, trendData.length)).map((point, idx) => {
              const step = Math.max(1, Math.floor(trendData.length / 7));
              const actualIdx = idx * step;
              
              if (actualIdx >= trendData.length) return null;
              
              const actualPoint = trendData[actualIdx];
              const x = 40 + (actualIdx / (trendData.length - 1)) * 540;
              
              return (
                <text 
                  key={idx} 
                  x={x} 
                  y="185" 
                  className="text-xs fill-gray-500" 
                  textAnchor="middle"
                >
                  {(actualPoint.label || actualPoint.timestamp)?.substring(0, 6) || ''}
                </text>
              );
            })}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Aucune donnée disponible</p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      {trendData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Total</p>
            <p className="text-xl font-bold text-gray-800">{trendData.reduce((sum, p) => sum + p.count, 0)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Moyenne</p>
            <p className="text-xl font-bold text-gray-800">{Math.round(trendData.reduce((sum, p) => sum + p.count, 0) / trendData.length)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Pic</p>
            <p className="text-xl font-bold text-gray-800">{maxCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}