// components/PathologiesByCount.jsx
export default function PathologiesByCount({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Pathologies by Count</h2>
          <p className="text-sm text-gray-500">Visual breakdown of most frequent pathologies.</p>
        </div>
        <p className="text-gray-500 text-center py-8">No pathology data available</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Pathologies by Count</h2>
        <p className="text-sm text-gray-500">Visual breakdown of most frequent pathologies.</p>
      </div>

      <div className="space-y-4">
        {data.map((pathology, idx) => {
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
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-4 px-32 text-xs text-gray-500">
        <span>0</span>
        <span>{Math.round(maxCount * 0.25)}</span>
        <span>{Math.round(maxCount * 0.5)}</span>
        <span>{Math.round(maxCount * 0.75)}</span>
        <span>{maxCount}</span>
      </div>
    </div>
  );
}