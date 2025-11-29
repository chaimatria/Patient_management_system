export default function MedicationForm({ medications, onUpdate, onAdd, onRemove }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Liste des Médicaments</h3>
      
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
          Ajouter un médicament
        </button>
      </div>
    </div>
  );
}

function MedicationItem({ medication, index, canRemove, onUpdate, onRemove }) {
  const commonDrugs = [
    'Amoxicillin',
    'Ibuprofen',
    'Paracetamol',
    'Aspirin',
    'Omeprazole',
    'Metformin',
    'Lisinopril',
    'Atorvastatin',
    'DOLIPRANE',
    'AMOXILAN',
    'AUGMENTIN',
    'VOLTARENE'
  ];

  const commonInstructions = [
    '1 comprimé 3 fois par jour avec les repas',
    '1 comprimé 2 fois par jour (matin et soir)',
    '1 comprimé par jour le matin à jeun',
    '1 comprimé au coucher',
    '2 comprimés en cas de douleur (max 6 par jour)',
    '1 comprimé toutes les 8 heures',
    'Appliquer 2 fois par jour sur la zone affectée',
    '1 cuillère à soupe 3 fois par jour',
    '1 COMP PAR PRISE, 2 COMP PAR PRISE',
    'ACIDE CLAVULAN EN AMOXIVAL LINE / ACIDE CLAVULANIQUE POTASSIQUE'
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
          title="Supprimer le médicament"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* medicament name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du médicament *
          </label>
          <input
            type="text"
            list={`drugs-${medication.id}`}
            value={medication.drugName}
            onChange={(e) => onUpdate(medication.id, 'drugName', e.target.value)}
            placeholder="ex: DOLIPRANE"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <datalist id={`drugs-${medication.id}`}>
            {commonDrugs.map(drug => (
              <option key={drug} value={drug} />
            ))}
          </datalist>
        </div>

        {/* dosage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dosage *
          </label>
          <input
            type="text"
            value={medication.dosage}
            onChange={(e) => onUpdate(medication.id, 'dosage', e.target.value)}
            placeholder="ex: 1G COMP. 8/08"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* instructions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions (Posologie) * 
            <span className="text-xs text-gray-500 ml-2">- Ces instructions apparaîtront sur l'ordonnance</span>
          </label>
          <textarea
            value={medication.instructions}
            onChange={(e) => onUpdate(medication.id, 'instructions', e.target.value)}
            placeholder="ex: 1 CP SI FIEVRE/MALAI, 2 COMP PAR PRISE ou ACIDE CLAVULAN 62 ACUAMOXIC AMOX ACID 875..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="mt-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onUpdate(medication.id, 'instructions', e.target.value);
                }
              }}
              className="text-xs w-full px-2 py-1 border border-gray-200 rounded text-gray-600"
            >
              <option value="">-- Ou choisir une instruction courante --</option>
              {commonInstructions.map((instruction, idx) => (
                <option key={idx} value={instruction}>{instruction}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Durée (Optionnel)
          </label>
          <input
            type="text"
            value={medication.duration || ''}
            onChange={(e) => onUpdate(medication.id, 'duration', e.target.value)}
            placeholder="ex: 8 jours"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Quantité (Optionnel)
          </label>
          <input
            type="text"
            value={medication.quantity || ''}
            onChange={(e) => onUpdate(medication.id, 'quantity', e.target.value)}
            placeholder="ex: 21 comprimés"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* preview of what will appear on prescription */}
      {(medication.drugName || medication.dosage || medication.instructions) && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs font-semibold text-blue-800 mb-2">
            ✓ Aperçu sur l'ordonnance:
          </p>
          <div className="text-sm">
            {medication.drugName && medication.dosage && (
              <p className="font-bold text-gray-900 uppercase">
                {medication.drugName} {medication.dosage}
              </p>
            )}
            {medication.instructions && (
              <p className="text-gray-700 mt-1 leading-relaxed">
                {medication.instructions}
              </p>
            )}
            {medication.duration && (
              <p className="text-gray-600 text-xs mt-1">
                Durée: {medication.duration}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}