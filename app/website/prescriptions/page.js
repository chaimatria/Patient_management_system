'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pill, User, Printer, Save, Trash2, Calendar, Download } from 'lucide-react';

export default function PrescriptionGeneratorPage() {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [manualPatientName, setManualPatientName] = useState('');
  const [manualPatientAge, setManualPatientAge] = useState('');
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicationsList, setMedicationsList] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medications, setMedications] = useState([
    { id: 1, drugName: '', dosage: '', instructions: '', duration: '', quantity: '' }
  ]);

 
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. Bouzourene',
    specialty: 'Médecin Généraliste',
    orderNumber: '00152017'
  });

  const [clinicInfo, setClinicInfo] = useState({
    name: 'DocLink Clinic',
    city: 'Alger',
    phone: '0552265120'
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    loadPatients();
    loadMedications();
  }, []);

  // Preselect a patient when navigated from a patient profile (e.g. ?patientId=...)
  useEffect(() => {
    const pid = searchParams.get('patientId');
    if (pid) {
      setSelectedPatientId(pid);
      setUseManualEntry(false);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log(' useEffect triggered - selectedPatientId:', selectedPatientId, 'useManualEntry:', useManualEntry);
    if (selectedPatientId && !useManualEntry) {
      loadPatientPrescriptions(selectedPatientId);
    } else {
      console.log('Not loading prescriptions - conditions not met');
      setPrescriptions([]);
    }
  }, [selectedPatientId, useManualEntry]);

  const loadPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to load patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadMedications = async () => {
    try {
      const response = await fetch('/api/medications');
      if (!response.ok) throw new Error('Failed to load medications');
      const data = await response.json();
      setMedicationsList(data);
    } catch (error) {
      console.error('Error loading medications:', error);
    }
  };

  const loadPatientPrescriptions = async (patientId) => {
    try {
      console.log(' Loading prescriptions for patient:', patientId);
      const response = await fetch(`/api/prescriptions?patientId=${patientId}`);
      if (!response.ok) throw new Error('Failed to load prescriptions');
      const data = await response.json();
      console.log(' Raw API response:', data);
      console.log(' Number of prescriptions:', data.length);
      if (data.length > 0) {
        console.log(' First prescription:', data[0]);
        console.log(' First prescription medications:', data[0].medications);
      }
      setPrescriptions(data);
    } catch (error) {
      console.error(' Error loading prescriptions:', error);
    }
  };

  const currentPatient = patients.find(p => p.patientId === selectedPatientId);

  const getPatientInfo = () => {
    if (useManualEntry) {
      return {
        fullName: manualPatientName,
        age: manualPatientAge,
        patientId: 'N/A',
        dateOfBirth: null
      };
    } else if (currentPatient) {
      return {
        fullName: currentPatient.fullName,
        age: new Date().getFullYear() - new Date(currentPatient.dateOfBirth).getFullYear(),
        patientId: currentPatient.patientId,
        dateOfBirth: currentPatient.dateOfBirth
      };
    }
    return null;
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now(), drugName: '', dosage: '', instructions: '', duration: '', quantity: '' }
    ]);
  };

  const removeMedication = (id) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id));
    }
  };

  const updateMedication = (id, field, value) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

const handleSave = async () => {
  if (!useManualEntry && !selectedPatientId) {
    alert('Please select a patient or enter patient details manually');
    return;
  }

  if (useManualEntry && !manualPatientName) {
    alert('Please enter patient name');
    return;
  }

  const hasContent = medications.some(med => 
    med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
  );

  if (!hasContent) {
    alert('Please add at least one medication');
    return;
  }

  try {
    console.log('Saving prescription for patient:', selectedPatientId);
    
    // Update medication library
    for (const med of medications) {
      if (med.drugName.trim()) {
        const existsInList = medicationsList.some(
          m => m.drug_name.toLowerCase() === med.drugName.toLowerCase()
        );
        
        if (!existsInList) {
          try {
            await fetch('/api/medications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                drugName: med.drugName,
                commonDosages: med.dosage || null,
                commonInstructions: med.instructions || null,
                typicalDuration: med.duration || null,
                category: 'Custom'
              })
            });
          } catch (error) {
            console.log('Medication may already exist');
          }
        }
        
        try {
          await fetch('/api/medications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drugName: med.drugName })
          });
        } catch (error) {
          console.log('Could not update usage count');
        }
      }
    }
    
    await loadMedications();

    const prescriptionData = {
      patientId: useManualEntry ? null : selectedPatientId,
      medications: medications.filter(m => m.drugName || m.dosage || m.instructions),
      doctorName: doctorInfo.name,
      doctorSpecialty: doctorInfo.specialty,
      clinicName: clinicInfo.name,
      clinicAddress: clinicInfo.city,
      clinicPhone: clinicInfo.phone,
      prescriptionDate: new Date().toISOString()
    };

    const method = selectedPrescription ? 'PUT' : 'POST';
    if (selectedPrescription) {
      prescriptionData.prescriptionId = selectedPrescription.prescription_id;
    }

    console.log(' Prescription data to save:', prescriptionData);

    const response = await fetch('/api/prescriptions', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save prescription');
    }

    const savedPrescription = await response.json();
    console.log('Prescription saved:', savedPrescription);

    //  Reload prescriptions for database mode
    if (selectedPatientId && !useManualEntry) {
      console.log(' Reloading prescriptions for patient:', selectedPatientId);
      await loadPatientPrescriptions(selectedPatientId);
    }
    
    alert('Prescription saved successfully!');
    
    // Clear the form AFTER reload
    setMedications([
      { id: 1, drugName: '', dosage: '', instructions: '', duration: '', quantity: '' }
    ]);
    setSelectedPrescription(null);
    if (useManualEntry) {
      setManualPatientName('');
      setManualPatientAge('');
    }
  } catch (error) {
    console.error(' Error saving prescription:', error);
    alert('Error saving prescription: ' + error.message);
  }
};

  const handleLoadPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setMedications(prescription.medications.map(med => ({
      id: med.medication_id,
      drugName: med.drug_name,
      dosage: med.dosage,
      instructions: med.instructions,
      duration: med.duration || '',
      quantity: med.quantity || ''
    })));
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return;

    try {
      const response = await fetch('/api/prescriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId })
      });

      if (!response.ok) throw new Error('Failed to delete prescription');

      alert('Prescription deleted successfully!');
      await loadPatientPrescriptions(selectedPatientId);
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Error deleting prescription');
    }
  };

  const handlePrint = () => {
    const patientInfo = getPatientInfo();
    const hasContent = medications.some(med => 
      med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
    );

    if (!hasContent || !patientInfo || !patientInfo.fullName) {
      alert('Please enter patient information and add medications');
      return;
    }

    window.print();
  };

  const handleClear = () => {
    if (confirm('Clear current form?')) {
      setMedications([
        { id: 1, drugName: '', dosage: '', instructions: '', duration: '', quantity: '' }
      ]);
      setSelectedPrescription(null);
      if (useManualEntry) {
        setManualPatientName('');
        setManualPatientAge('');
      }
    }
  };

  const hasActiveMedications = medications.some(med => 
    med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
  );

  const patientInfo = getPatientInfo();

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 print:hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescription Generator</h1>
            <p className="text-gray-600">Create and manage patient prescriptions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Patient Information
                </h3>

                <div className="mb-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!useManualEntry}
                      onChange={() => {
                        setUseManualEntry(false);
                        setManualPatientName('');
                        setManualPatientAge('');
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Select from Patients </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={useManualEntry}
                      onChange={() => {
                        setUseManualEntry(true);
                        setSelectedPatientId('');
                        setPrescriptions([]);
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Enter manually</span>
                  </label>
                </div>
                
                {!useManualEntry ? (
                  <>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Choose a patient...</option>
                      {patients.map(patient => (
                        <option key={patient.patientId} value={patient.patientId}>
                          {patient.fullName} - {patient.patientId}
                        </option>
                      ))}
                    </select>

                    {currentPatient && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Name:</span>
                            <span className="ml-2 text-gray-900">{currentPatient.fullName}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Age:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date().getFullYear() - new Date(currentPatient.dateOfBirth).getFullYear()} years
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">ID:</span>
                            <span className="ml-2 text-gray-900">{currentPatient.patientId}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">DOB:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(currentPatient.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Name *
                      </label>
                      <input
                        type="text"
                        value={manualPatientName}
                        onChange={(e) => setManualPatientName(e.target.value)}
                        placeholder="Enter patient name..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Patient Age *
                      </label>
                      <input
                        type="text"
                        value={manualPatientAge}
                        onChange={(e) => setManualPatientAge(e.target.value)}
                        placeholder="Enter age..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    {manualPatientName && manualPatientAge && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Patient:</span> {manualPatientName}, {manualPatientAge} years old
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Pill size={20} className="text-green-600" />
                  Medications
                </h3>

                <div className="space-y-4">
                  {medications.map((med, index) => (
                    <MedicationItem
                      key={med.id}
                      medication={med}
                      index={index}
                      canRemove={medications.length > 1}
                      medicationsList={medicationsList}
                      onUpdate={updateMedication}
                      onRemove={removeMedication}
                    />
                  ))}

                  <button
                    onClick={addMedication}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span className="text-xl">+</span>
                    Add Medication
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={!hasActiveMedications || (!selectedPatientId && !manualPatientName)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    Save Prescription
                  </button>
                  <button
                    onClick={handlePrint}
                    disabled={!hasActiveMedications || !patientInfo?.fullName}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Printer size={18} />
                    Print
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                    Clear
                  </button>
                </div>
                

                
              
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prescription History
              </h3>

              {!selectedPatientId || useManualEntry ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Select a patient   to view history
                </p>
              ) : prescriptions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No prescriptions found for this patient
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {prescriptions.map(prescription => (
                    <div
                      key={prescription.prescription_id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            <Calendar size={14} className="inline mr-1" />
                            {new Date(prescription.prescription_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {prescription.medications?.length || 0} medication(s)
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleLoadPrescription(prescription)}
                            className="p-1 hover:bg-blue-50 rounded"
                            title="Load"
                          >
                            <Download size={14} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeletePrescription(prescription.prescription_id)}
                            className="p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {prescription.medications?.map((med, idx) => (
                          <div key={idx}>• {med.drug_name} {med.dosage}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PrescriptionPrintView
        patient={patientInfo}
        medications={medications}
        clinicInfo={clinicInfo}
        doctorInfo={doctorInfo}
      />
    </>
  );
}

function MedicationItem({ medication, index, canRemove, medicationsList, onUpdate, onRemove }) {
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const [showInstructionDropdown, setShowInstructionDropdown] = useState(false);
  const [selectedFromDatabase, setSelectedFromDatabase] = useState(null);

  const commonMedications = [
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
    '1 CP SI FIEVRE/MALAISE',
    '2 COMP PAR PRISE',
    '1 comprimé matin et soir après repas'
  ];

  const handleSelectMedication = async (dbMed) => {
    setSelectedFromDatabase(dbMed);
    onUpdate(medication.id, 'drugName', dbMed.drug_name);
    
    if (dbMed.common_dosages) {
      const dosages = dbMed.common_dosages.split(',');
      onUpdate(medication.id, 'dosage', dosages[0].trim());
    }
    
    if (dbMed.typical_duration) {
      onUpdate(medication.id, 'duration', dbMed.typical_duration);
    }
    
    setShowMedicationDropdown(false);
    
    try {
      await fetch('/api/medications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName: dbMed.drug_name })
      });
    } catch (error) {
      console.error('Failed to update usage count');
    }
  };

  const handleSelectMedicationName = (name) => {
    onUpdate(medication.id, 'drugName', name);
    setShowMedicationDropdown(false);
    
    // Check if it's from database
    const dbMed = medicationsList.find(m => m.drug_name === name);
    if (dbMed) {
      handleSelectMedication(dbMed);
    }
  };

  const handleSelectInstruction = (instruction) => {
    onUpdate(medication.id, 'instructions', instruction);
    setShowInstructionDropdown(false);
  };

  const getDatabaseInstructions = () => {
    if (!selectedFromDatabase || !selectedFromDatabase.common_instructions) return [];
    return selectedFromDatabase.common_instructions.split('|').map(i => i.trim());
  };

  const getAvailableDosages = () => {
    if (!selectedFromDatabase || !selectedFromDatabase.common_dosages) return [];
    return selectedFromDatabase.common_dosages.split(',').map(d => d.trim());
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 relative">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
        {index + 1}
      </div>

      {canRemove && (
        <button
          onClick={() => onRemove(medication.id)}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded text-xl"
        >
          ×
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Drug Name *
          </label>
          
          <div className="relative">
            <input
              type="text"
              value={medication.drugName}
              onChange={(e) => {
                const value = e.target.value;
                onUpdate(medication.id, 'drugName', value);
                setSelectedFromDatabase(null);
                setShowMedicationDropdown(true);
              }}
              onFocus={() => setShowMedicationDropdown(true)}
              onBlur={() => setTimeout(() => setShowMedicationDropdown(false), 200)}
              placeholder="Type or select medication..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Custom Dropdown */}
            {showMedicationDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {/* Database medications */}
                {medicationsList.length > 0 && (
                  <>
                    <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 sticky top-0">
                      
                    </div>
                    {medicationsList
                      .filter(med => 
                        !medication.drugName || 
                        med.drug_name.toLowerCase().includes(medication.drugName.toLowerCase())
                      )
                      .map(med => (
                        <div
                          key={med.medication_lib_id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectMedication(med);
                          }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                        >
                          <div className="font-medium text-gray-900">{med.drug_name}</div>
                          {med.usage_count > 0 && (
                            <div className="text-xs text-blue-600">Used {med.usage_count}x</div>
                          )}
                        </div>
                      ))
                    }
                  </>
                )}
                
                {/* Common medications */}
                <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 sticky top-0">
                   Common Medications
                </div>
                {commonMedications
                  .filter(med => 
                    !medication.drugName || 
                    med.toLowerCase().includes(medication.drugName.toLowerCase())
                  )
                  .filter(med => !medicationsList.some(dbMed => dbMed.drug_name === med))
                  .map((med, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectMedicationName(med);
                      }}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                    >
                      <div className="font-medium text-gray-900">{med}</div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dosage *
          </label>
          {getAvailableDosages().length > 0 ? (
            <select
              value={medication.dosage}
              onChange={(e) => onUpdate(medication.id, 'dosage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select dosage</option>
              {getAvailableDosages().map((dosage, idx) => (
                <option key={idx} value={dosage}>{dosage}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={medication.dosage}
              onChange={(e) => onUpdate(medication.id, 'dosage', e.target.value)}
              placeholder="e.g., 1G COMP"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions *
          </label>
          
          <div className="relative">
            <input
              type="text"
              value={medication.instructions}
              onChange={(e) => {
                onUpdate(medication.id, 'instructions', e.target.value);
                setShowInstructionDropdown(true);
              }}
              onFocus={() => setShowInstructionDropdown(true)}
              onBlur={() => setTimeout(() => setShowInstructionDropdown(false), 200)}
              placeholder="Type or select instruction..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Custom Dropdown for Instructions */}
            {showInstructionDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {/* Database-specific instructions */}
                {getDatabaseInstructions().length > 0 && (
                  <>
                    <div className="px-3 py-2 bg-blue-50 text-xs font-semibold text-blue-700 sticky top-0">
                     Saved for this medication
                    </div>
                    {getDatabaseInstructions()
                      .filter(inst => 
                        !medication.instructions || 
                        inst.toLowerCase().includes(medication.instructions.toLowerCase())
                      )
                      .map((instruction, idx) => (
                        <div
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectInstruction(instruction);
                          }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-sm"
                        >
                          {instruction}
                        </div>
                      ))
                    }
                  </>
                )}
                
                {/* Common instructions */}
                <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 sticky top-0">
                  Common Instructions
                </div>
                {commonInstructions
                  .filter(inst => 
                    !medication.instructions || 
                    inst.toLowerCase().includes(medication.instructions.toLowerCase())
                  )
                  .map((instruction, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectInstruction(instruction);
                      }}
                      className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-sm"
                    >
                      {instruction}
                    </div>
                  ))
                }
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
             Start typing or click to see suggestions
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <input
            type="text"
            value={medication.duration || ''}
            onChange={(e) => onUpdate(medication.id, 'duration', e.target.value)}
            placeholder="e.g., 7 days"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="text"
            value={medication.quantity || ''}
            onChange={(e) => onUpdate(medication.id, 'quantity', e.target.value)}
            placeholder="e.g., 21 tablets"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

function PrescriptionPrintView({ patient, medications, clinicInfo, doctorInfo }) {
  const activeMedications = medications.filter(med => 
    med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
  );

  if (!patient || activeMedications.length === 0) return null;

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="hidden print:block print:m-0 print:p-0" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      zIndex: 9999
    }}>
      <div style={{ 
        backgroundColor: 'white',
        padding: '40px',
        maxWidth: '210mm',
        margin: '0 auto',
        minHeight: '100vh'
      }}>
        <div style={{ borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'black' }}>
            {doctorInfo.name}
          </h1>
          <p style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: 'black' }}>
            {doctorInfo.specialty}
          </p>
          <p style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'black' }}>{clinicInfo.city}</p>
          <p style={{ fontSize: '12px', margin: '0 0 2px 0', color: 'black' }}>Tél : {clinicInfo.phone}</p>
          <p style={{ fontSize: '12px', margin: '0', color: 'black' }}>N° Ordre : {doctorInfo.orderNumber}</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: 'black' }}>Ordonnance</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', fontSize: '14px' }}>
          <div>
            <p style={{ margin: '0', color: 'black' }}><strong>Faite le :</strong> {currentDate}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 4px 0', color: 'black' }}><strong>Patient(e) :</strong> {patient.fullName}</p>
            <p style={{ margin: '0', fontSize: '12px', color: 'black' }}>Age : {patient.age} ans</p>
          </div>
        </div>

        <div style={{ marginBottom: '60px' }}>
          {activeMedications.map((med, index) => (
            <div key={index} style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0', color: 'black' }}>
                  {med.drugName} {med.dosage}
                </p>
                <p style={{ fontSize: '13px', fontWeight: '600', margin: '0', color: 'black' }}>
                  Qte: {med.quantity || (index + 1)}
                </p>
              </div>
              <p style={{ fontSize: '13px', margin: '8px 0 0 0', lineHeight: '1.6', color: 'black' }}>
                {med.instructions}
              </p>
              {med.duration && (
                <p style={{ fontSize: '13px', margin: '4px 0 0 0', color: 'black' }}>
                  Durée : {med.duration}
                </p>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '80px', paddingTop: '20px' }}>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0 4px 0', color: 'black' }}>
            {Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-0291
          </p>
         
        </div>
      </div>
    </div>
  );
}