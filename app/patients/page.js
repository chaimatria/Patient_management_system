'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Search, Edit, Trash2 } from 'lucide-react';
import Sidebar from '@/Sharedcomponents/Sidebar';
import Navbar from '@/Sharedcomponents/Navbar';
import Footer from '@/Sharedcomponents/Footer';
import PatientDetailPanel from '@/components/PatientDetailPanel';

// Defines a React functional component 
export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]); // list of all patients 
  const [searchQuery, setSearchQuery] = useState(''); // str for search output 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Load patients when component mounts
  useEffect(() => {
    loadPatients();
  }, []);

  // Load patients from JSON file via API
  const loadPatients = async () => {
    setIsLoading(true);
    
    try {
      // Fetch patients from the API 
      const response = await fetch('/api/patients');
      
      if (!response.ok) {
        throw new Error('Failed to load patients');
      }

      const result = await response.json();
      setPatients(result);
    } catch (error) {
      console.error('Error loading patients:', error);
      alert('Error loading patients: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = () => {
    router.push('/patients/add');
  };

  const handleEditPatient = (patientId, e) => {
    e.stopPropagation(); // Prevent triggering row click
    router.push(`/patients/add?id=${patientId}`);
  };


  const handleDeletePatient = async (patientId, e) => {
    e.stopPropagation(); // Prevent triggering row click
    
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      // Send DELETE request to API
      const response = await fetch('/api/patients', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      // Refresh the patient list
      await loadPatients();

      alert('Patient deleted successfully');
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error deleting patient: ' + error.message);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handleClosePanel = () => {
    setSelectedPatient(null);
  };

  const handleViewFullProfile = (patientId) => {
    router.push(`/patients/profile/${patientId}`);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  //  searches ALL visible fields in the table
  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase().trim();
    
    // If search is empty, show all patients
    if (!query) return true;
    
    //
    if (patient.fullName && patient.fullName.toLowerCase().includes(query)) {
      return true;
    }
    

if (patient.patientId && patient.patientId.toString().toLowerCase().includes(query)) {
  return true;
}
    

    if (patient.gender) {
      const gender = patient.gender.toLowerCase();
      // Check for exact match or if query is the start of gender
      if (gender === query || gender.startsWith(query)) {
        return true;
      }
    }
    
if (patient.phoneNumber) {
  const cleanPhone = patient.phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  const cleanQuery = query.replace(/[\s\-\(\)\+]/g, '');
  
  // Only match if the query appears as a contiguous sequence in the phone number
  if (cleanQuery.length > 0 && /^\d+$/.test(cleanQuery) && cleanPhone.includes(cleanQuery)) {
    return true;
  }
  
  // Also check original format for non-numeric queries
  if (!/^\d+$/.test(query) && patient.phoneNumber.toLowerCase().includes(query)) {
    return true;
  }
}
    

    if (patient.pathology && patient.pathology.toLowerCase().includes(query)) {
      return true;
    }
    
   
    if (patient.lastVisit && patient.lastVisit.toLowerCase().includes(query)) {
      return true;
    }
    
    
    if (patient.dateOfBirth) {
      const dob = patient.dateOfBirth;
      
      // Checking if search matches full date (YYYY-MM-DD)
      if (dob.includes(query)) {
        return true;
      }
      
      // Checking if search matches formatted date parts
      const dobFormatted = new Date(dob).toLocaleDateString('en-US'); // MM/DD/YYYY
      if (dobFormatted.toLowerCase().includes(query)) {
        return true;
      }
      
      //  matches year only ?
      const year = new Date(dob).getFullYear().toString();
      if (year.includes(query)) {
        return true;
      }
    }
    
    // Search by age 
    if (patient.dateOfBirth) {
      const age = calculateAge(patient.dateOfBirth);
      const ageStr = age.toString();
      
      // Match exact age or partial 
      if (ageStr.includes(query)) {
        return true;
      }
      
      // "25 years", "25years",? etc.
      if (query.includes(ageStr) || `${ageStr} years`.includes(query) || `${ageStr}years`.includes(query)) {
        return true;
      }
    }
    
    return false;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage patient records and information
                </p>
              </div>
              <button
                onClick={handleAddPatient}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={20} />
                Add New Patient
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, ID, phone, age, or any field..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Patients Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'Try adjusting your search' : 'Get started by adding a new patient'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleAddPatient}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add Your First Patient
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Visit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPatients.map((patient) => (
                      <tr 
                        key={patient.id} 
                        onClick={() => handlePatientClick(patient)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {patient.patientId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {calculateAge(patient.dateOfBirth)} years
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {patient.gender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.lastVisit || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => handleEditPatient(patient.patientId, e)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Edit Patient"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={(e) => handleDeletePatient(patient.patientId, e)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Patient"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <Footer />
      </div>

      {/* Patient Detail Panel */}
      {selectedPatient && (
        <PatientDetailPanel
          patient={selectedPatient}
          onClose={handleClosePanel}
          onViewFullProfile={handleViewFullProfile}
        />
      )}
    </div>
  );
}