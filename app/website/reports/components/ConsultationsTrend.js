// components/ConsultationsTrend.jsx
'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';

export default function ConsultationsTrend({ data }) {
  const [activeTab, setActiveTab] = useState('daily');

  if (!data) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  }

  const trendData = data[activeTab] || [];
  const maxCount = Math.max(...trendData.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Consultations Trend</h2>
        <p className="text-sm text-gray-500">Number of consultations over time.</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'daily'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'monthly'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
        </div>

        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FileDown className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <FileDown className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 bg-gray-50 rounded-lg p-4">
        {trendData.length > 0 ? (
          <svg className="w-full h-full" viewBox="0 0 600 200">
            {/* Y-axis labels */}
            <text x="20" y="20" className="text-xs fill-gray-500">{maxCount}</text>
            <text x="20" y="70" className="text-xs fill-gray-500">{Math.round(maxCount * 0.75)}</text>
            <text x="20" y="120" className="text-xs fill-gray-500">{Math.round(maxCount * 0.5)}</text>
            <text x="20" y="170" className="text-xs fill-gray-500">{Math.round(maxCount * 0.25)}</text>
            <text x="20" y="195" className="text-xs fill-gray-500">0</text>

            {/* Grid lines */}
            <line x1="50" y1="20" x2="580" y2="20" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="50" y1="70" x2="580" y2="70" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="50" y1="120" x2="580" y2="120" stroke="#f3f4f6" strokeWidth="1" />
            <line x1="50" y1="170" x2="580" y2="170" stroke="#f3f4f6" strokeWidth="1" />

            {/* Data line */}
            {trendData.length > 0 && (
              <path
                d={trendData.map((point, idx) => {
                  const x = 50 + (idx / (trendData.length - 1 || 1)) * 530;
                  const y = 170 - (point.count / maxCount) * 150;
                  return idx === 0 ? `M ${x},${y}` : `L ${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            )}

            {/* X-axis labels */}
            {trendData.slice(0, 8).map((point, idx) => (
              <text key={idx} x={50 + (idx / 7) * 530} y="195" className="text-xs fill-gray-500">
                {point.label?.substring(0, 5)}
              </text>
            ))}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}