// components/ConsultationStatus.jsx
export default function ConsultationStatus() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Consultation Status</h2>
        <p className="text-sm text-gray-500">Distribution of consultation outcomes.</p>
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
            {/* Completed - 68% (Red) - starts at top */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#ef4444"
              strokeWidth="40"
              strokeDasharray="300 1000"
              strokeDashoffset="0"
            />
            {/* Canceled - 16% (Gray) - after completed */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#374151"
              strokeWidth="40"
              strokeDasharray="68 1000"
              strokeDashoffset="-300"
            />
            {/* Pending - 16% (Green) - last segment */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#10b981"
              strokeWidth="40"
              strokeDasharray="68 1000"
              strokeDashoffset="-368"
            />
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6">
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