export default function PrescriptionActions({ onPrint, onDownload, onClear, onEmail, hasContent }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
      
      <div className="space-y-3">
       
        <button
          onClick={onPrint}
          disabled={!hasContent}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            hasContent
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimer l'ordonnance
        </button>

        <button
          onClick={onDownload}
          disabled={!hasContent}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            hasContent
              ? 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
              : 'border-2 border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Télécharger PDF
        </button>

        
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <button
            onClick={onEmail}
            disabled={!hasContent}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              hasContent
                ? 'text-purple-600 hover:bg-purple-50 border border-purple-200'
                : 'text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Envoyer par email au patient
          </button>

          <button
            onClick={onClear}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-red-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Effacer le formulaire
          </button>
        </div>
      </div>

      {/* status  */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${hasContent ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-gray-600">
            {hasContent ? 'Prêt à imprimer' : 'Ajouter des médicaments pour continuer'}
          </span>
        </div>
      </div>

      {/* help Text */}
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>Conseil :</strong> Utilisez Imprimer pour enregistrer en PDF via la boîte de dialogue d'impression de votre navigateur, ou utilisez Télécharger PDF pour générer directement un PDF.
        </p>
      </div>
    </div>
  );
}