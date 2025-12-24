// components/ConsultationsTrend.jsx
'use client';

import { useState, useMemo } from 'react';
import { FileDown } from 'lucide-react';

export default function ConsultationsTrend({ trendData = { weekly: [], monthly: [] } }) {
  const [activeTab, setActiveTab] = useState('weekly');

  // Get the active data based on tab
  const activeData = useMemo(() => {
    return activeTab === 'weekly' ? trendData.weekly : trendData.monthly;
  }, [activeTab, trendData]);

  // Calculate max value for scaling
  const maxValue = useMemo(() => {
    if (!activeData || activeData.length === 0) return 100;
    return Math.max(...activeData.map(d => d.count || 0), 100);
  }, [activeData]);

  // Generate SVG path for line chart
  const generatePath = () => {
    if (!activeData || activeData.length === 0) return '';
    
    const points = activeData.map((item, idx) => {
      const x = 50 + (idx / Math.max(activeData.length - 1, 1)) * 530;
      const y = 180 - (item.count / maxValue) * 160;
      return { x, y };
    });

    if (points.length === 0) return '';
    
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    return path;
  };

  // Generate X-axis labels
  const xLabels = useMemo(() => {
    if (!activeData || activeData.length === 0) return [];
    const step = Math.ceil(activeData.length / 4);
    const labels = [];
    for (let i = 0; i < activeData.length; i += step) {
      labels.push({
        idx: i,
        label: activeData[i].period.substring(activeData[i].period.length - 5),
        x: 50 + (i / Math.max(activeData.length - 1, 1)) * 530
      });
    }
    return labels;
  }, [activeData]);

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
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 600 200">
          {/* Y-axis labels */}
          <text x="20" y="20" className="text-xs fill-gray-500">{Math.round(maxValue)}</text>
          <text x="20" y="70" className="text-xs fill-gray-500">{Math.round(maxValue * 0.75)}</text>
          <text x="20" y="120" className="text-xs fill-gray-500">{Math.round(maxValue * 0.5)}</text>
          <text x="20" y="170" className="text-xs fill-gray-500">{Math.round(maxValue * 0.25)}</text>
          <text x="20" y="195" className="text-xs fill-gray-500">0</text>

          {/* Grid lines */}
          <line x1="50" y1="20" x2="580" y2="20" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="50" y1="70" x2="580" y2="70" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="50" y1="120" x2="580" y2="120" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="50" y1="170" x2="580" y2="170" stroke="#f3f4f6" strokeWidth="1" />

          {/* Data line */}
          {activeData && activeData.length > 0 && (
            <path
              d={generatePath()}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            />
          )}

          {/* Data points */}
          {activeData && activeData.map((item, idx) => {
            const x = 50 + (idx / Math.max(activeData.length - 1, 1)) * 530;
            const y = 180 - (item.count / maxValue) * 160;
            return (
              <circle key={idx} cx={x} cy={y} r="3" fill="#ef4444" />
            );
          })}

          {/* X-axis labels */}
          {xLabels.map((label, idx) => (
            <text key={idx} x={label.x} y="195" textAnchor="middle" className="text-xs fill-gray-500">
              {label.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}