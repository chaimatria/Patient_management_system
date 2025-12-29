'use client'; 
// This tells Next.js that this page should run in the browser.

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// These are layout components (just UI)


// The patient form component where the user fills the data
import PatientForm from '@/components/PatientForm';

export default function AddPatientPage() {
  const router = useRouter(); 
  // router is used to move to another page

  const searchParams = useSearchParams(); 
  // searchParams allows us to read things from the URL (like ?id=123)

  const patientId = searchParams.get('id'); 
  // we read the "id" that is in the URL. 
  // If it's there → we are editing a patient
  // If not → we are adding a new patient

  const [patientData, setPatientData] = useState(null);
  // This variable will hold the patient information

  const [isLoading, setIsLoading] = useState(false);
  // This is used to show "Loading..." while we fetch data

  useEffect(() => {
    // This code runs when the page first loads
    if (patientId) {
      // If the URL contains an id → we are editing
      loadPatientData(patientId);
    }
  }, [patientId]);

  const loadPatientData = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients?id=${id}`);
      if (!response.ok) throw new Error('Failed to load patient');
      const data = await response.json();
      // populate form with existing patient
      setPatientData(data);
    } catch (error) {
      console.error('Error loading patient:', error);
      alert('Erreur lors du chargement des données du patient');
    } finally {
      setIsLoading(false);
    }
  };


  const handleSave = async (formData) => {
    // This runs when the user clicks "Save" in the form

    try {
      // Call backend API to save or update
      if (patientId) {
        const response = await fetch('/api/patients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, patientId })
        });
        if (!response.ok) throw new Error('Failed to update patient');
      } else {
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to create patient');
      }

      alert('Patient enregistré avec succès!');

      router.push('/website/patients');
      // After saving, go back to the patients list
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Erreur lors de l\'enregistrement du patient: ' + (error.message || 'Erreur inconnue'));
      throw error; // If something goes wrong
    }
  };

  const handleCancel = () => {
    // This runs when the user clicks "Cancel"

    if (window.confirm('Abandonner les modifications?')) {
      router.push('/website/patients'); 
      // If user confirms → go back to patients list
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">Chargement...</p>
        </div>
      ) : (
        <PatientForm
          patientData={patientData}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
