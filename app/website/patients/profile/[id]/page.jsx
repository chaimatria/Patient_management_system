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
import Sidebar from '@/Sharedcomponents/Sidebar';
import Navbar from '@/Sharedcomponents/Navbar';
import Footer from '@/Sharedcomponents/Footer';

export default function PatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id;

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [consultations, setConsultations] = useState([]);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatientData(patientId);
      loadConsultations(patientId);
    }
  }, [patientId]);

  // Refresh consultations when switching to consultation tab
  useEffect(() => {
    if (activeTab === 'consultation' && patientId) {
      loadConsultations(patientId);
    }
  }, [activeTab, patientId]);

  // Refresh consultations and patient data when page becomes visible (user returns from consultation add page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && patientId && activeTab === 'consultation') {
        loadConsultations(patientId);
        loadPatientData(patientId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [patientId, activeTab]);

  const loadPatientData = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patients?id=${id}`);
      if (!response.ok) throw new Error('Failed to load patient');
      
      const foundPatient = await response.json();
      
      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        alert('Patient non trouvé');
        router.push('/website/patients');
      }
    } catch (error) {
        console.error('Error loading patient:', error);
      alert('Erreur lors du chargement des données du patient');
      router.push('/website/patients');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsultations = async (id) => {
    setIsLoadingConsultations(true);
    try {
      const response = await fetch(`/api/consultations?patientId=${id}`);
      if (!response.ok) throw new Error('Failed to load consultations');
      
      const consultationsData = await response.json();
      setConsultations(consultationsData);
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setIsLoadingConsultations(false);
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
    try {
      // Handle both date and datetime strings from SQLite
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleEdit = () => {
    router.push(`/website/patients/add?id=${patientId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce patient? Cette action ne peut pas être annulée.')) {
      return;
    }

    try {
      const response = await fetch('/api/patients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });

      if (!response.ok) throw new Error('Failed to delete patient');
      
      alert('Patient supprimé avec succès');
      router.push('/website/patients');
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Erreur lors de la suppression du patient');
    }
  };

  const handleBack = () => {
    router.push('/website/patients');
  };

  const handleAddConsultation = () => {
    router.push(`/website/consultations/add?patientId=${patientId}`);
  };

  const handleEditConsultation = (consultationId) => {
    router.push(`/website/consultations/add?patientId=${patientId}&id=${consultationId}`);
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation?')) {
      return;
    }

    try {
      const response = await fetch('/api/consultations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultationId }),
      });

      if (!response.ok) throw new Error('Failed to delete consultation');
      
      alert('Consultation supprimée avec succès');
      // Reload consultations
      await loadConsultations(patientId);
      // Also refresh patient data to reflect any changes in last visit
      await loadPatientData(patientId);
    } catch (error) {
      console.error('Error deleting consultation:', error);
      alert('Erreur lors de la suppression de la consultation');
    }
  };

  // Mark a consultation as the patient's last visit (updates consultation.last_visit and patient.consultation_date)
  const handleMarkAsLastVisit = async (consultationId, consultationDate) => {
    if (!window.confirm('Définir cette consultation comme dernière visite du patient?')) return;
    try {
      const response = await fetch('/api/consultations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultationId,
          lastVisit: consultationDate,
          consultationDate: consultationDate
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to set last visit');
      }

      alert('Dernière visite mise à jour');
      await loadConsultations(patientId);
      await loadPatientData(patientId);
    } catch (error) {
      console.error('Error setting last visit:', error);
      alert('Erreur lors de la mise à jour de la dernière visite: ' + error.message);
    }
  };

  const handleCreatePrescription = () => {
    // Navigate to prescription page and preselect patient
    router.push(`/website/prescriptions?patientId=${patientId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Chargement des données du patient...</p>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const tabs = [
    { id: 'personal', label: 'Infos personnelles', icon: User },
    { id: 'pathology', label: 'Pathologie et antécédents familiaux', icon: Stethoscope },
    { id: 'consultation', label: 'Historique des consultations', icon: FileText },
    { id: 'treatment', label: 'Plans de traitement', icon: Pill },
    { id: 'notes', label: 'Remarques', icon: AlertCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Retour aux patients</span>
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
                    Ajouter une consultation
                  </button>
                  <button
                    onClick={handleCreatePrescription}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    <Pill size={18} />
                    Créer une ordonnance
                  </button>
                  <button
                    onClick={handleEdit}
                    className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Modifier le patient"
                  >
                    <Edit size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2.5 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    title="Supprimer le patient"
                  >
                    <Trash2 size={20} className="text-red-600" />
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Clock size={18} />
                    <span className="text-sm font-medium">Dernière visite</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(patient.lastVisit)}
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <FileText size={18} />
                    <span className="text-sm font-medium">Total des consultations</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{consultations.length}</p>
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
                      Informations personnelles
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Nom complet
                        </label>
                        <p className="text-base text-gray-900 font-medium">
                          {patient.fullName}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Date de naissance
                        </label>
                        <p className="text-base text-gray-900">
                          {formatDate(patient.dateOfBirth)}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Âge
                        </label>
                        <p className="text-base text-gray-900">
                          {calculateAge(patient.dateOfBirth)} ans
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Genre
                        </label>
                        <p className="text-base text-gray-900 capitalize">
                          {patient.gender}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Identifiant du patient
                        </label>
                        <p className="text-base text-blue-600 font-medium">
                          {patient.patientId}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Numéro de téléphone
                        </label>
                        <p className="text-base text-gray-900">
                          {patient.phoneNumber || 'Non fourni'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pathology & Family History Tab */}
                {activeTab === 'pathology' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Pathologie et antécédents familiaux
                    </h2>
                    
                    {/* Pathology */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Pathologie (Historique médical)
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.pathology || 'Aucune information de pathologie enregistrée.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Family History */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Membres de la famille atteints de la même maladie
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.familyHistory || 'Aucun antécédent familial enregistré.'}
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
                              Le patient a des allergies connues
                            </p>
                          </div>
                        )}
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.allergies || 'Aucune allergie connue.'}
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
                        Historique des consultations
                        {consultations.length > 0 && (
                          <span className="ml-2 text-sm font-normal text-gray-500">
                            ({consultations.length} {consultations.length === 1 ? 'consultation' : 'consultations'})
                          </span>
                        )}
                      </h2>
                      <button
                        onClick={handleAddConsultation}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Plus size={18} />
                        Ajouter une consultation
                      </button>
                    </div>
                    
                    {isLoadingConsultations ? (
                      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-500">Chargement des consultations...</p>
                      </div>
                    ) : consultations.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
                        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Aucune consultation pour le moment
                        </h3>
                        <p className="text-gray-500 mb-6">
                          Commencez à documenter les consultations des patients pour suivre leur parcours médical
                        </p>
                        <button
                          onClick={handleAddConsultation}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Ajouter la première consultation
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {consultations.map((consultation) => (
                          <div
                            key={consultation.consultation_id}
                            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <Calendar size={18} className="text-blue-500" />
                                  <span className="text-lg font-semibold text-gray-900">
                                    {formatDate(consultation.consultation_date)}
                                  </span>
                                  {consultation.total_consultations && (
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                      Consultation #{consultation.total_consultations}
                                    </span>
                                  )}
                                </div>
                                {consultation.last_visit && (
                                  <p className="text-sm text-gray-500 ml-7">
                                    Last Visit: {formatDate(consultation.last_visit)}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleMarkAsLastVisit(consultation.consultation_id, consultation.consultation_date)}
                                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="Marquer comme dernière visite"
                                >
                                  <Clock size={18} />
                                </button>
                                <button
                                  onClick={() => handleEditConsultation(consultation.consultation_id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Modifier la consultation"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteConsultation(consultation.consultation_id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer la consultation"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {consultation.description ? (
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {consultation.description}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Aucune description fournie</p>
                            )}
                            
                            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                              Créé le: {formatDateTime(consultation.created_at)}
                              {consultation.updated_at && consultation.updated_at !== consultation.created_at && (
                                <span className="ml-4">Mis à jour: {formatDateTime(consultation.updated_at)}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Treatment Plans Tab */}
                {activeTab === 'treatment' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Plans de traitement
                      </h2>
                      <button
                        onClick={handleCreatePrescription}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Pill size={18} />
                        Créer une ordonnance
                      </button>
                    </div>
                    
                    {/* Previous Treatments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Traitements antérieurs
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.previousTreatments || 'Aucun traitement antérieur enregistré.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Current Treatment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Traitement actuel
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
                              Plan de traitement actif
                            </p>
                          </div>
                        )}
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {patient.currentTreatment || 'Aucun plan de traitement actif.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Remarques supplémentaires
                    </h2>
                    
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-[300px]">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {patient.notes || 'Aucune remarque supplémentaire enregistrée.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
  );
}