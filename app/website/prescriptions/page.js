"use client";

import { useState } from 'react';
import PatientSelector from './components/PatientSelector.js';
import MedicationForm from './components/MedicationForm.js';
import PrescriptionActions from './components/PrescriptionActions.js';
import PrescriptionPrintView from './components/PrescriptionPrintView.js';

export default function PrescriptionGeneratorPage() {
  const [selectedPatient, setSelectedPatient] = useState('P001');
  const [medications, setMedications] = useState([
    {
      id: 1,
      drugName: '',
      dosage: '',
      instructions: '',
      duration: '',
      quantity: ''
    }
  ]);

  // Sample data
  const patients = [
    {
      id: 'P001',
      name: 'Alice Johnson',
      dob: '1990-05-15',
      age: 34,
      address: '456 Oak Ave, Wellness City',
      phone: '555-1234'
    },
    {
      id: 'P002',
      name: 'John Doe',
      dob: '1985-03-20',
      age: 39,
      address: '123 Main St, Health Town',
      phone: '555-5678'
    },
    {
      id: 'P003',
      name: 'Jane Smith',
      dob: '1992-08-10',
      age: 32,
      address: '789 Pine Rd, Medical City',
      phone: '555-9012'
    }
  ];

  const clinicInfo = {
    name: 'DocLink Clinic',
    address: '123 Health Ave, Wellness City, 10001',
    phone: '(123) 456-7890',
    email: 'clinic@doclink.com'
  };

  const doctorInfo = {
    name: 'Dr. (Your Name)',
    specialty: 'General Practitioner',
    license: 'MD-12345'
  };

  const currentPatient = patients.find(p => p.id === selectedPatient);

  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: medications.length + 1,
        drugName: '',
        dosage: '',
        instructions: '',
        duration: '',
        quantity: ''
      }
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('PDF download functionality would be implemented here using libraries like jsPDF or react-pdf');
  };

  const handleSave = () => {
    console.log('Saving prescription draft...', {
      patient: currentPatient,
      medications: medications.filter(m => m.drugName || m.dosage || m.instructions)
    });
    alert('Prescription draft saved successfully!');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the form? This action cannot be undone.')) {
      setMedications([
        {
          id: 1,
          drugName: '',
          dosage: '',
          instructions: '',
          duration: '',
          quantity: ''
        }
      ]);
    }
  };

  const hasActiveMedications = medications.some(med => 
    med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 print:hidden">
        <div className="max-w-7xl mx-auto">
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">DocLink</h1>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-6">Prescription Generator</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 space-y-6">
              <PatientSelector
                patients={patients}
                selectedPatient={selectedPatient}
                onPatientChange={setSelectedPatient}
              />

              <MedicationForm
                medications={medications}
                onUpdate={updateMedication}
                onAdd={addMedication}
                onRemove={removeMedication}
              />

              <PrescriptionActions
                onPrint={handlePrint}
                onDownload={handleDownload}
                onSave={handleSave}
                onClear={handleClear}
                hasContent={hasActiveMedications}
              />
            </div>

          </div>

          
          <div className="text-center mt-8 text-sm text-gray-500">
            © 2025 DocLink. All rights reserved.
          </div>
        </div>
      </div>

     
      <PrescriptionPrintView
        patient={currentPatient}
        medications={medications}
        clinicInfo={clinicInfo}
        doctorInfo={doctorInfo}
      />
    </>
  );
}