// components/CommonPathologies.jsx
export default function CommonPathologies() {
  const pathologies = [
    { name: 'Common Cold', count: 320, category: 'Respiratory' },
    { name: 'Influenza', count: 280, category: 'Respiratory' },
    { name: 'Hypertension', count: 250, category: 'Cardiovascular' },
    { name: 'Diabetes Mellitus', count: 210, category: 'Endocrine' },
    { name: 'Allergies', count: 180, category: 'Immunology' },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Most Common Pathologies</h2>
        <p className="text-sm text-gray-500">Top conditions diagnosed in consultations.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-sm font-medium text-gray-600 pb-3">Pathology</th>
              <th className="text-right text-sm font-medium text-gray-600 pb-3">Count</th>
              <th className="text-right text-sm font-medium text-gray-600 pb-3">Category</th>
            </tr>
          </thead>
          <tbody>
            {pathologies.map((pathology, idx) => (
              <tr key={idx} className="border-b border-gray-100 last:border-0">
                <td className="py-3 text-sm text-gray-800">{pathology.name}</td>
                <td className="py-3 text-sm text-gray-800 text-right font-medium">{pathology.count}</td>
                <td className="py-3 text-right">
                  <span className="inline-block px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                    {pathology.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

