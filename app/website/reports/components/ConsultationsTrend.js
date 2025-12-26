// components/ConsultationsTrend.jsx
'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';

export default function ConsultationsTrend() {
  const [activeTab, setActiveTab] = useState('weekly');

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
          <text x="20" y="20" className="text-xs fill-gray-500">180</text>
          <text x="20" y="70" className="text-xs fill-gray-500">135</text>
          <text x="20" y="120" className="text-xs fill-gray-500">90</text>
          <text x="20" y="170" className="text-xs fill-gray-500">45</text>
          <text x="20" y="195" className="text-xs fill-gray-500">0</text>

          {/* Grid lines */}
          <line x1="50" y1="20" x2="580" y2="20" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="50" y1="70" x2="580" y2="70" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="50" y1="120" x2="580" y2="120" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="50" y1="170" x2="580" y2="170" stroke="#f3f4f6" strokeWidth="1" />

          {/* Completed Line */}
          <path
            d="M 50,80 L 125,60 L 200,75 L 275,55 L 350,50 L 425,40 L 500,50 L 580,45"
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          />

          {/* Pending Line */}
          <path
            d="M 50,165 L 125,160 L 200,155 L 275,158 L 350,150 L 425,152 L 500,148 L 580,150"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />

          {/* Canceled Line */}
          <path
            d="M 50,175 L 125,172 L 200,170 L 275,173 L 350,168 L 425,165 L 500,162 L 580,160"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
          />

          {/* X-axis labels */}
          <text x="50" y="195" className="text-xs fill-gray-500">Week 1</text>
          <text x="125" y="195" className="text-xs fill-gray-500">Week 2</text>
          <text x="200" y="195" className="text-xs fill-gray-500">Week 3</text>
          <text x="275" y="195" className="text-xs fill-gray-500">Week 4</text>
          <text x="350" y="195" className="text-xs fill-gray-500">Week 5</text>
          <text x="425" y="195" className="text-xs fill-gray-500">Week 6</text>
          <text x="500" y="195" className="text-xs fill-gray-500">Week 7</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
          <span className="text-xs text-gray-600">Canceled</span>
        </div>
      </div>
    </div>
  );
}