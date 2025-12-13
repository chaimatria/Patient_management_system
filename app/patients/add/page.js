'use client';
// Page for adding or editing a patient

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import Sidebar from '@/SharedComponents/Sidebar';
import Navbar from '@/SharedComponents/Navbar';
import Footer from '@/SharedComponents/Footer';

import PatientForm from '@/components/PatientForm';

export default function AddPatientPage() {
  const router = useRouter(); 
  

  const searchParams = useSearchParams(); 
  // searchParams stands for parameters allows us to read things from the URL (like ?id=123)

  const patientId = searchParams.get('id'); 
  // if id is there we edit , unless we do not


  const [patientData, setPatientData] = useState(null);
  // var to hold patient info

  const [isLoading, setIsLoading] = useState(false);
  // Loading.. as the one in mobdev

  useEffect(() => {
    // This code runs when the page first loads
    if (patientId) {
      
      loadPatientData(patientId);
    } else {
      // If no patientId  we are adding a new patient, reset patientData
      setPatientData(null);
      setIsLoading(false);
    }
  }, [patientId]);
  // This re-runs only if patientId changes

  const loadPatientData = async (id) => {
    //  loads the data of the patient we want to edit
    setIsLoading(true); // Show loading screen

    try {
      // Fetch all patients from the JSON file via API
      const response = await fetch('/api/patients');
      
      if (!response.ok) {
        throw new Error('Failed to load patients');
      }

      const patients = await response.json();
      
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
    //save 

    try {
      // are we creating a new patient or updating an existing one
      const method = patientId ? 'PUT' : 'POST';
      const url = '/api/patients';

      // send the data to the API
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

      // reset patientData before navigation to ensure clean state
      setPatientData(null);
      
      alert('Patient saved successfully!');

      // use setTimeout to ensure state is reset before navigation (important for Electron) 
      // the problem that i faced of the blocking forms maybe hare , but tested with removing this part but it is stiil not working 
      // So i kept it to pmanually reset the state before navigation
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
    

    if (window.confirm('Discard changes?')) {
      router.push('/patients'); 
      
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
          {/* Back Navigation */}
          <div className="max-w-5xl mx-auto pt-8 px-8">
            <button
              onClick={() => router.push('/patients')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Patients List</span>
            </button>
          </div>

          {isLoading ? (
          
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            
            <PatientForm
              key={patientId || 'new'} 
              patientData={patientData} 
              onSave={handleSave}       
              onCancel={handleCancel}   
            />
          )}
        </div>

        {/* Bottom of page */}
        <Footer />
      </div>
    </div>
  );
}
