'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  Stethoscope,
  FileText,
  Pill,
  AlertCircle,
  Users,
  Clock,
  Plus
} from 'lucide-react';
import Sidebar from '@/SharedComponents/Sidebar';
import Navbar from '@/SharedComponents/Navbar';
import Footer from '@/SharedComponents/Footer';

export default function PatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id;

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (patientId) {
      loadPatientData(patientId);
    }
  }, [patientId]);

  const loadPatientData = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to load patient');
      
      const patients = await response.json();
      const foundPatient = patients.find(p => p.patientId === id);
      
      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        alert('Patient not found');
        router.push('/patients');
      }
    } catch (error) {
      console.error('Error loading patient:', error);
      alert('Error loading patient data');
      router.push('/patients');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleEdit = () => {
    router.push(`/patients/add?id=${patientId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });

      if (!response.ok) throw new Error('Failed to delete patient');
      
      alert('Patient deleted successfully');
      router.push('/patients');
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Error deleting patient');
    }
  };

  const handleBack = () => {
    router.push('/patients');
  };

  const handleAddConsultation = () => {
    // Navigate to add consultation page
    router.push(`/consultations/add?patientId=${patientId}`);
  };

  const handleCreatePrescription = () => {
    // Navigate to create prescription page
    router.push(`/prescriptions/add?patientId=${patientId}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Loading patient data...</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'pathology', label: 'Pathology & Family History', icon: Stethoscope },
    { id: 'consultation', label: 'Consultation History', icon: FileText },
    { id: 'treatment', label: 'Treatment Plans', icon: Pill },
    { id: 'notes', label: 'Notes', icon: AlertCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-8">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Patients</span>
            </button>

            {/* Patient Header Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {patient.fullName.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Patient Info */}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {patient.fullName}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <strong className="text-blue-600">ID:</strong> {patient.patientId}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{patient.gender}</span>
                      <span>•</span>
                      <span>{calculateAge(patient.dateOfBirth)} years old</span>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      {patient.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-blue-500" />
                          <span>{patient.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" />
                        <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddConsultation}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    <Plus size={18} />
                    Add Consultation
                  </button>
                  <button
                    onClick={handleCreatePrescription}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    <Pill size={18} />
                    Create Prescription
                  </button>
                  <button
                    onClick={handleEdit}
                    className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Edit Patient"
                  >
                    <Edit size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2.5 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Patient"
                  >
                    <Trash2 size={20} className="text-red-600" />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Clock size={18} />
                    <span className="text-sm font-medium">Last Visit</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(patient.lastVisit)}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <FileText size={18} />
                    <span className="text-sm font-medium">Total Consultations</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">0</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Pill size={18} />
                    <span className="text-sm font-medium">Active Prescriptions</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {patient.currentTreatment ? 'Yes' : 'None'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {/* Personal Info Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Personal Information
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Full Name
                        </label>
                        <p className="text-base text-gray-900 font-medium">
                          {patient.fullName}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Date of Birth
                        </label>
                        <p className="text-base text-gray-900">
                          {formatDate(patient.dateOfBirth)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Age
                        </label>
                        <p className="text-base text-gray-900">
                          {calculateAge(patient.dateOfBirth)} years
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Gender
                        </label>
                        <p className="text-base text-gray-900 capitalize">
                          {patient.gender}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Patient ID
                        </label>
                        <p className="text-base text-blue-600 font-medium">
                          {patient.patientId}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Phone Number
                        </label>
                        <p className="text-base text-gray-900">
                          {patient.phoneNumber || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pathology & Family History Tab */}
                {activeTab === 'pathology' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Pathology & Family History
                    </h2>
                    
                    {/* Pathology */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Pathology (Medical History)
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.pathology || 'No pathology information recorded.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Family History */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Family Members with Same Disease
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.familyHistory || 'No family history recorded.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Allergies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Allergies
                      </label>
                      <div className={`rounded-lg p-4 border ${
                        patient.allergies 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        {patient.allergies && (
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle size={18} className="text-red-600 mt-0.5" />
                            <p className="text-sm font-medium text-red-600">
                              Patient has known allergies
                            </p>
                          </div>
                        )}
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.allergies || 'No known allergies.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consultation History Tab */}
                {activeTab === 'consultation' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Consultation History
                      </h2>
                      <button
                        onClick={handleAddConsultation}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Plus size={18} />
                        Add Consultation
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
                      <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No consultations yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Start documenting patient consultations to track their medical journey
                      </p>
                      <button
                        onClick={handleAddConsultation}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Add First Consultation
                      </button>
                    </div>
                  </div>
                )}

                {/* Treatment Plans Tab */}
                {activeTab === 'treatment' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Treatment Plans
                      </h2>
                      <button
                        onClick={handleCreatePrescription}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Pill size={18} />
                        Create Prescription
                      </button>
                    </div>
                    
                    {/* Previous Treatments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Previous Treatments
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.previousTreatments || 'No previous treatments recorded.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Current Treatment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Current Treatment
                      </label>
                      <div className={`rounded-lg p-4 border ${
                        patient.currentTreatment 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        {patient.currentTreatment && (
                          <div className="flex items-start gap-2 mb-2">
                            <Pill size={18} className="text-green-600 mt-0.5" />
                            <p className="text-sm font-medium text-green-600">
                              Active Treatment Plan
                            </p>
                          </div>
                        )}
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.currentTreatment || 'No active treatment plan.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Additional Notes
                    </h2>
                    
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-[300px]">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {patient.notes || 'No additional notes recorded.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}