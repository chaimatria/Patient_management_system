"use client";

import { useState } from 'react';
import PatientSelector from './components/PatientSelector';
import MedicationForm from './components/MedicationForm';
import PrescriptionPreview from './components/PrescriptionPreview';
import PrescriptionActions from './components/PrescriptionActions';
import PrescriptionPrintView from './components/PrescriptionPrintView';

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

  const patients = [
    {
      id: 'P001',
      name: 'Alice Johnson',
      dob: '1990-05-15',
      age: 34,
      address: '456 Oak Ave, Wellness City',
      phone: '555-1234',
      email: 'alice.johnson@email.com'  
    },
    {
      id: 'P002',
      name: 'John Doe',
      dob: '1985-03-20',
      age: 39,
      address: '123 Main St, Health Town',
      phone: '555-5678',
      email: 'john.doe@email.com'  },
    {
      id: 'P003',
      name: 'Jane Smith',
      dob: '1992-08-10',
      age: 32,
      address: '789 Pine Rd, Medical City',
      phone: '555-9012',
      email: 'jane.smith@email.com'  
    }
  ];

 
  const clinicInfo = {
    name: 'DocLink Clinic',
    city: 'Alger',
    address: '123 Health Ave, Wellness City, 10001',
    phone: '0552265120',
    email: 'clinic@doclink.com'
  };

  const doctorInfo = {
    name: 'Dr. Bendounan Djilali',
    specialty: 'Cardiologue',
    license: 'MD-12345',
    orderNumber: '00152017'
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
    const hasContent = medications.some(med => 
      med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
    );
    
    if (!hasContent) {
      alert('Veuillez ajouter au moins un médicament avant d\'imprimer.');
      return;
    }
    
    window.print();
  };

  const handleDownload = async () => {
    const hasContent = medications.some(med => 
      med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
    );
    
    if (!hasContent) {
      alert('Veuillez ajouter au moins un médicament avant de télécharger.');
      return;
    }
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.getElementById('prescription-print-content');
      
      if (!element) {
        throw new Error('Prescription content not found');
      }

     
      const clone = element.cloneNode(true);
      clone.style.display = 'block';
      clone.style.position = 'relative';
      clone.style.left = '0';
      clone.style.backgroundColor = 'white';
      clone.style.padding = '40px';
      clone.style.width = '210mm';
      clone.style.minHeight = '297mm';
      
      
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.appendChild(clone);
      document.body.appendChild(container);
      
      const opt = {
        margin: 10,
        filename: `ordonnance-${currentPatient?.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794, 
          windowHeight: 1123 
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };
      
      await html2pdf().set(opt).from(clone).save();
      
      
      document.body.removeChild(container);
      
      alert('PDF téléchargé avec succès!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Erreur lors de la génération du PDF.\n\nSolution alternative:\n1. Cliquez sur "Imprimer l\'ordonnance"\n2. Choisissez "Enregistrer au format PDF"\n3. Cliquez sur Enregistrer\n\nOu installez: npm install html2pdf.js');
    }
  };

  const handleSave = () => {
    const prescriptionData = {
      patient: currentPatient,
      medications: medications.filter(m => m.drugName || m.dosage || m.instructions),
      date: new Date().toISOString(),
      clinicInfo,
      doctorInfo
    };
    
    try {
      const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      savedPrescriptions.push(prescriptionData);
      localStorage.setItem('prescriptions', JSON.stringify(savedPrescriptions));
      alert('Ordonnance sauvegardée avec succès!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleClear = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer le formulaire?')) {
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

  const handleEmail = () => {
    if (!currentPatient?.email) {
      alert('Le patient n\'a pas d\'adresse email enregistrée.\n\nVeuillez ajouter une adresse email dans les informations du patient.');
      return;
    }

    
    const medicationsList = medications
      .filter(m => m.drugName || m.dosage || m.instructions)
      .map((med, index) => 
        `${index + 1}. ${med.drugName} ${med.dosage}\n   ${med.instructions}\n   ${med.duration ? `Durée: ${med.duration}` : ''}`
      )
      .join('\n\n');

    const subject = `Ordonnance Médicale - ${currentPatient.name}`;
    const body = `Cher(e) ${currentPatient.name},

Veuillez trouver ci-dessous votre ordonnance médicale du ${new Date().toLocaleDateString('fr-FR')}.

MÉDICAMENTS PRESCRITS:
${medicationsList}

INSTRUCTIONS IMPORTANTES:
- Suivez attentivement la posologie indiquée
- Cette ordonnance est valable 30 jours
- Contactez-nous en cas d'effets indésirables

Cordialement,
${doctorInfo.name}
${doctorInfo.specialty}
${clinicInfo.phone}`;
    
   
    window.location.href = `mailto:${currentPatient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const hasActiveMedications = medications.some(med => 
    med.drugName.trim() !== '' || med.dosage.trim() !== '' || med.instructions.trim() !== ''
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6 print:hidden">
        <div className="max-w-7xl mx-auto">
          {/* header */}
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

          <h2 className="text-3xl font-bold text-gray-900 mb-6">Générateur d'Ordonnance</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* left column - form */}
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
                onEmail={handleEmail}
                hasContent={hasActiveMedications}
              />
            </div>

            {/* right column - preview */}
            <div className="lg:col-span-1">
              <PrescriptionPreview
                patient={currentPatient}
                medications={medications}
                clinicInfo={clinicInfo}
                doctorInfo={doctorInfo}
              />
            </div>
          </div>

          {/* footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            © 2025 DocLink. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* print view */}
      <PrescriptionPrintView
        patient={currentPatient}
        medications={medications}
        clinicInfo={clinicInfo}
        doctorInfo={doctorInfo}
      />
    </>
  );
}
