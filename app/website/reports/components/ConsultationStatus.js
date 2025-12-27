// components/ConsultationStatus.jsx
export default function ConsultationStatus({ data }) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  const completed = data.completed.percentage || 0;
  const pending = data.pending.percentage || 0;
  const cancelled = data.cancelled.percentage || 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Statut de la Consultation</h2>
        <p className="text-sm text-gray-500">Distribution des résultats de consultation.</p>
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
            {/* Completed segment */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#ef4444"
              strokeWidth="40"
              strokeDasharray={`${completed * 4.4} 1000`}
              strokeDashoffset="0"
            />
            {/* Pending segment */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#10b981"
              strokeWidth="40"
              strokeDasharray={`${pending * 4.4} 1000`}
              strokeDashoffset={`-${completed * 4.4}`}
            />
            {/* Cancelled segment */}
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke="#374151"
              strokeWidth="40"
              strokeDasharray={`${cancelled * 4.4} 1000`}
              strokeDashoffset={`-${(completed + pending) * 4.4}`}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-bold text-gray-800">{data.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Terminé</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{data.completed.count} ({data.completed.percentage}%)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">En attente</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{data.pending.count} ({data.pending.percentage}%)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
            <span className="text-sm text-gray-600">Annélé</span>
          </div>
          <span className="text-sm font-medium text-gray-800">{data.cancelled.count} ({data.cancelled.percentage}%)</span>
        </div>
      </div>
    </div>
  );
}