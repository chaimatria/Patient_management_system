// components/ConsultationStatus.jsx
export default function ConsultationStatus({ statusData = { completed: 68, pending: 16, cancelled: 16 } }) {
  const { completed = 0, pending = 0, cancelled = 0 } = statusData;
  
  // Calculate SVG stroke-dasharray for donut chart
  // Total circumference ≈ 440 (2π * 70)
  const completedDash = (completed / 100) * 440;
  const pendingDash = (pending / 100) * 440;
  const cancelledDash = (cancelled / 100) * 440;

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
            {/* Completed - Red */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#ef4444"
              strokeWidth="40"
              strokeDasharray={`${completedDash} 440`}
              strokeDashoffset="0"
            />
            {/* Pending - Green - after completed */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#10b981"
              strokeWidth="40"
              strokeDasharray={`${pendingDash} 440`}
              strokeDashoffset={-completedDash}
            />
            {/* Cancelled - Gray - last segment */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#374151"
              strokeWidth="40"
              strokeDasharray={`${cancelledDash} 440`}
              strokeDashoffset={-(completedDash + pendingDash)}
            />
          </svg>
          
          {/* Center text with percentages */}
          <div className="absolute text-center">
            <div className="text-2xl font-bold text-gray-800">{completed}%</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
      </div>

      {/* Legend with percentages */}
      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Completed ({completed}%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Pending ({pending}%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
          <span className="text-xs text-gray-600">Cancelled ({cancelled}%)</span>
        </div>
      </div>
    </div>
  );
}