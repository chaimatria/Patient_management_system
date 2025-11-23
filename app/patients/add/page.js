'use client'; 
// This tells Next.js that this page should run in the browser.

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// These are layout components (just UI)
import Sidebar from '@/SharedComponents/Sidebar';
import Navbar from '@/SharedComponents/Navbar';
import Footer from '@/SharedComponents/Footer';

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
  // This re-runs only if patientId changes

  const loadPatientData = async (id) => {
    // This function loads the data of the patient we want to edit
    setIsLoading(true); // Show loading screen

    try {
      // In a real app, this should get the patient from the DATABASE
      // But for now we use fake data ("mock data") to test the UI

       // DATABASE: Load patient data
      // const data = await window.electron.ipcRenderer.invoke('get-patient', id);
      // setPatientData(data);
      
      //mock data for testing
      setPatientData({
        fullName: 'John Doe',
        dateOfBirth: '1980-05-15',
        gender: 'male',
        patientId: id,
        phoneNumber: '+1 (555) 123-4567',
        pathology: 'Test pathology',
        familyHistory: '',
        allergies: 'Penicillin',
        previousTreatments: '',
        currentTreatment: '',
        notes: ''
      });
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
      // Here we would normally send the data to the database
      // Example: save new patient or update patient

      // DATABASE: Save or update patient
      // if (patientId) {
      //   await window.electron.ipcRenderer.invoke('update-patient', formData);
      // } else {
      //   await window.electron.ipcRenderer.invoke('create-patient', formData);
      // }
      alert('Patient saved successfully!');

      router.push('/patients');
      // After saving, go back to the patients list
    } catch (error) {
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
