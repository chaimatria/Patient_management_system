export default function PrescriptionPrintView({ patient, medications, clinicInfo, doctorInfo }) {
  const activeMedications = medications.filter(med => 
    med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
  );

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="hidden print:block fixed inset-0 bg-white z-50 p-12">
      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      
      <div className="border-b-4 border-blue-600 pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">{clinicInfo.name}</h1>
            <div className="text-sm text-gray-700 space-y-1">
              <p>{clinicInfo.address}</p>
              <p>Phone: {clinicInfo.phone} | Email: {clinicInfo.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">Ordonnance</p>
            <p className="text-xs text-gray-600">Date: {currentDate}</p>
          </div>
        </div>
      </div>

      
      {patient && (
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Informations sur le patient</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-semibold">Nom :</span> {patient.name}
            </div>
            <div>
              <span className="font-semibold">ID Patient :</span> {patient.id}
            </div>
            <div>
              <span className="font-semibold">Date de naissance:</span> {patient.dob}
            </div>
            <div>
              <span className="font-semibold">Âge :</span> {patient.age} ans
            </div>
            <div className="col-span-2">
              <span className="font-semibold">Adresse :</span> {patient.address}
            </div>
            <div>
              <span className="font-semibold">Téléphone :</span> {patient.phone}
            </div>
          </div>
        </div>
      )}

      
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-5xl font-serif font-bold text-blue-600">℞</div>
          <h2 className="text-2xl font-bold text-gray-800">Medications Prescribed</h2>
        </div>

        <div className="space-y-6">
          {activeMedications.map((med, index) => (
            <div key={med.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex gap-2">
                <span className="font-bold text-gray-700 text-lg">{index + 1}.</span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900">
                    {med.drugName} - {med.dosage}
                  </p>
                  <p className="text-base text-gray-700 mt-1">
                    <span className="font-semibold">Sig:</span> {med.instructions}
                  </p>
                  {(med.duration || med.quantity) && (
                    <div className="flex gap-6 mt-1 text-sm text-gray-600">
                      {med.duration && (
                        <span><span className="font-semibold">Durée :</span> {med.duration}</span>
                      )}
                      {med.quantity && (
                        <span><span className="font-semibold">Disp:</span> {med.quantity}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400">
        <p className="text-sm font-semibold text-gray-800 mb-1">Instructions importantes :</p>
        <p className="text-xs text-gray-700">
         Cette ordonnance est valable pendant 30 jours à compter de la date d’émission.
         Veuillez suivre attentivement les instructions de posologie.
         Contactez votre médecin immédiatement si vous ressentez des effets indésirables.
        </p>
      </div>

      
      <div className="mt-12 pt-6 border-t-2 border-gray-300">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-600 mb-1">Ceci est une ordonnance générée par ordinateur</p>
          </div>
          <div className="text-right">
            <div className="h-16 mb-2 border-b-2 border-gray-400 w-64"></div>
            <p className="font-bold text-gray-900 text-lg">{doctorInfo.name}</p>
            <p className="text-sm text-gray-700">{doctorInfo.specialty}</p>
            <p className="text-xs text-gray-600">Licence médicale : {doctorInfo.license}</p>
          </div>
        </div>
      </div>

      
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>© 2025 {clinicInfo.name}. Tous droits réservés.</p>
      </div>
    </div>
  );
}