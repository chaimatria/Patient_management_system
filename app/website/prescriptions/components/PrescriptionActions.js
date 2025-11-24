export default function PrescriptionActions({ onPrint, onDownload, onSave, onClear, hasContent }) {
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          Print Prescription
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v16h16V4H4zm8 4v8m-3-3l3 3 3-3"
            />
          </svg>
          Download PDF
        </button>

       
        <div className="pt-3 border-t border-gray-200 space-y-2">

          
          <button
            onClick={onSave}
            disabled={!hasContent}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              hasContent
                ? 'text-green-600 hover:bg-green-50 border border-green-200'
                : 'text-gray-400 border border-gray-200 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save Draft
          </button>

        
          <button
            onClick={onClear}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-red-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear Form
          </button>
        </div>

       
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</p>

          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-gray-200 transition-colors">
              View History
            </button>
            <button className="px-3 py-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded border border-gray-200 transition-colors">
              Templates
            </button>
          </div>
        </div>

      </div>

     
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${hasContent ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <span className="text-gray-600">
            {hasContent ? 'Ready to print' : 'Add medications to continue'}
          </span>
        </div>
      </div>

    </div>
  );
}
