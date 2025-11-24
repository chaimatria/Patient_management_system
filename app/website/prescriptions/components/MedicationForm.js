export default function MedicationForm({ medications, onUpdate, onAdd, onRemove }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication List</h3>
      
      <div className="space-y-4">
        {medications.map((med, index) => (
          <MedicationItem
            key={med.id}
            medication={med}
            index={index}
            canRemove={medications.length > 1}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}

        <button
          onClick={onAdd}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Medication
        </button>
      </div>
    </div>
  );
}

function MedicationItem({ medication, index, canRemove, onUpdate, onRemove }) {
  const commonDrugs = [
    'Amoxicillin', 'Ibuprofen', 'Paracetamol', 'Aspirin', 'Omeprazole',
    'Metformin', 'Lisinopril', 'Atorvastatin'
  ];

  const commonInstructions = [
    'Take once daily with food',
    'Take twice daily with food',
    'Take three times daily with food',
    'Take before bedtime',
    'Take on empty stomach',
    'Take as needed for pain',
    'Apply topically twice daily'
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-4 relative hover:border-blue-300 transition-colors">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md">
        {index + 1}
      </div>

      {canRemove && (
        <button
          onClick={() => onRemove(medication.id)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Remove medication"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drug Name
          </label>
          <input
            type="text"
            list={`drugs-${medication.id}`}
            value={medication.drugName}
            onChange={(e) => onUpdate(medication.id, 'drugName', e.target.value)}
            placeholder="e.g., Amoxicillin"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <datalist id={`drugs-${medication.id}`}>
            {commonDrugs.map(drug => (
              <option key={drug} value={drug} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosage
          </label>
          <input
            type="text"
            value={medication.dosage}
            onChange={(e) => onUpdate(medication.id, 'dosage', e.target.value)}
            placeholder="e.g., 250mg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <textarea
            list={`instructions-${medication.id}`}
            value={medication.instructions}
            onChange={(e) => onUpdate(medication.id, 'instructions', e.target.value)}
            placeholder="e.g., Take 3 times daily with food"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <datalist id={`instructions-${medication.id}`}>
            {commonInstructions.map(instruction => (
              <option key={instruction} value={instruction} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Duration (Optional)
          </label>
          <input
            type="text"
            value={medication.duration || ''}
            onChange={(e) => onUpdate(medication.id, 'duration', e.target.value)}
            placeholder="e.g., 7 days"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Quantity (Optional)
          </label>
          <input
            type="text"
            value={medication.quantity || ''}
            onChange={(e) => onUpdate(medication.id, 'quantity', e.target.value)}
            placeholder="e.g., 21 tablets"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}