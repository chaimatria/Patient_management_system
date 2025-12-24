// components/PathologiesByCount.jsx
export default function PathologiesByCount({ pathologies = [] }) {
  // Find max count for scaling
  const maxCount = pathologies && pathologies.length > 0 
    ? Math.max(...pathologies.map(p => p.count || 0))
    : 100;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Pathologies by Count</h2>
        <p className="text-sm text-gray-500">Visual breakdown of most frequent pathologies.</p>
      </div>

      <div className="space-y-4">
        {pathologies && pathologies.length > 0 ? (
          pathologies.map((pathology, idx) => {
            const percentage = (pathology.count / maxCount) * 100;
            
            return (
              <div key={idx} className="flex items-center space-x-4">
                <div className="w-32 text-sm text-gray-700 truncate">{pathology.name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gray-900 h-full rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-xs font-medium text-white">{pathology.count}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-gray-500">
            No pathology data available
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4 px-32">
        <span className="text-xs text-gray-500">0</span>
        <span className="text-xs text-gray-500">{Math.round(maxCount / 4)}</span>
        <span className="text-xs text-gray-500">{Math.round(maxCount / 2)}</span>
        <span className="text-xs text-gray-500">{Math.round((maxCount * 3) / 4)}</span>
        <span className="text-xs text-gray-500">{maxCount}</span>
      </div>
    </div>
  );
}