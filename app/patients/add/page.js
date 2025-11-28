'use client';
// Page for adding or editing a patient

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';


import Sidebar from '@/SharedComponents/Sidebar';
import Navbar from '@/SharedComponents/Navbar';
import Footer from '@/SharedComponents/Footer';


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
    } else {
      // If no patientId → we are adding a new patient, reset patientData
      setPatientData(null);
      setIsLoading(false);
    }
  }, [patientId]);
  // This re-runs only if patientId changes

  const loadPatientData = async (id) => {
    // This function loads the data of the patient we want to edit
    setIsLoading(true); // Show loading screen

    try {
      // Fetch all patients from the JSON file via API
      const response = await fetch('/api/patients');
      
      if (!response.ok) {
        throw new Error('Failed to load patients');
      }

      const patients = await response.json();
      // Find the specific patient with matching ID
      const patient = patients.find(p => p.patientId === id);

      if (patient) {
        setPatientData(patient);
      } else {
        alert('Patient not found');
        router.push('/patients');
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      alert('Error loading patient data');
    } finally {
      setIsLoading(false); // Hide loading screen
    }
  };

  const handleSave = async (formData) => {
    // This runs when the user clicks "Save" in the form

    try {
      // Determine if we're creating a new patient or updating an existing one
      const method = patientId ? 'PUT' : 'POST';
      const url = '/api/patients';

      // Send the data to the API endpoint
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save patient');
      }

      // Reset patientData before navigation to ensure clean state
      setPatientData(null);
      
      alert('Patient saved successfully!');

      // Use setTimeout to ensure state is reset before navigation (important for Electron)
      setTimeout(() => {
        router.push('/patients');
      }, 100);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient data: ' + error.message);
      throw error; // If something goes wrong
    }
  };

  const handleCancel = () => {
    // This runs when the user clicks "Cancel"

    if (window.confirm('Discard changes?')) {
      router.push('/patients'); 
      // If user confirms → go back to patients list
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left side menu */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <Navbar />

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">

          {isLoading ? (
            // If loading is true → show this
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            // Otherwise → show the Patient form
            <PatientForm
              key={patientId || 'new'} // Force remount when switching between new/edit
              patientData={patientData} // If null → new patient. If not null → edit.
              onSave={handleSave}       // Function that runs when user saves
              onCancel={handleCancel}   // Function that runs when user cancels
            />
          )}
        </div>

        {/* Bottom of page */}
        <Footer />
      </div>
    </div>
  );
}
