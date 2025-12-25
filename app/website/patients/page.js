'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Search, Edit, Trash2 } from 'lucide-react';
import PatientDetailPanel from '@/components/PatientDetailPanel';
//deefines a React functional component 
export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]); // list of alll patients 
  const [searchQuery, setSearchQuery] = useState('');// str for search output 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Load patients from database
  useEffect(() => {
    loadPatients();
  }, []);

  const openPatientPanel = async (patientId) => {
    try {
      const response = await fetch(`/api/patients?id=${patientId}`);
      if (!response.ok) throw new Error('Failed to load patient');
      const data = await response.json();
      setSelectedPatient(data);
    } catch (error) {
      console.error('Error loading patient:', error);
      alert('Error loading patient: ' + (error.message || 'Unknown error'));
    }
  };

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to load patients');
      const data = await response.json();
      // normalize shape and ensure an `id` field for react keys
      const formatted = data.map(p => ({ ...p, id: p.patientId }));
      setPatients(formatted);
    } catch (error) {
      console.error('Error loading patients:', error);
      alert('Error loading patients: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }; 

  const handleAddPatient = () => {
    router.push('/website/patients/add');
  };

  const handleEditPatient = (patientId) => {
    router.push(`/website/patients/add?id=${patientId}`);
  };
// f*delete functionality not in this sprint ( REMEMBER IN SPRINT TWO ) 
//************************************************************************ */
  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      // DATABASE: Delete patient
      // await window.electron.ipcRenderer.invoke('delete-patient', patientId);
      
      // Refresh list
      loadPatients();
      alert('Patient deleted successfully');
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error deleting patient: ' + error.message);
    }
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
//search bar functionality
//***********************************************//
  const filteredPatients = patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage patient records and information</p>
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
            placeholder="Search by name or patient ID..."
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
          <p className="text-gray-500 mb-6">{searchQuery ? 'Try adjusting your search' : 'Get started by adding a new patient'}</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} onClick={() => openPatientPanel(patient.patientId)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{patient.patientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calculateAge(patient.dateOfBirth)} years</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{patient.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.lastVisit || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditPatient(patient.patientId); }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePatient(patient.patientId); }}
                      className="text-red-600 hover:text-red-900"
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

      {/* Patient detail panel (right side) */}
      {selectedPatient && (
        <div className="fixed inset-y-0 right-0 z-50">
          <PatientDetailPanel
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
            onViewFullProfile={(id) => router.push(`/website/patients/profile/${id}`)}
          />
        </div>
      )}
    </div>
  );
}