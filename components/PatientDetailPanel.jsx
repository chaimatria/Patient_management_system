'use client';
import React from 'react';
import { X, ExternalLink, Phone, Mail, Calendar, User, Stethoscope } from 'lucide-react';

export default function PatientDetailPanel({ patient, onClose, onViewFullProfile }) {
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

  return (
    <>
      
      
      {/* Side Panel */}
      <div className="w-96 bg-white border-l border-gray-200 shadow-xl flex flex-col h-full animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Détails du patient</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">{patient.fullName}</h3>
            <div className="flex items-center gap-2 text-blue-100">
              <span className="text-sm">ID: {patient.patientId}</span>
              <span className="text-sm">•</span>
              <span className="text-sm capitalize">{patient.gender}</span>
              <span className="text-sm">•</span>
              <span className="text-sm">{calculateAge(patient.dateOfBirth)} ans</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Informations de contact
            </h4>
            
            {patient.phoneNumber && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Phone size={16} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <p className="text-sm font-medium">{patient.phoneNumber}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Date de naissance</p>
                <p className="text-sm font-medium">{formatDate(patient.dateOfBirth)}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Informations médicales
            </h4>
            
            {patient.pathology && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <Stethoscope size={16} className="text-gray-500 mt-0.5" />
                  <p className="text-xs font-medium text-gray-500">Pathologie</p>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{patient.pathology}</p>
              </div>
            )}
            
            {patient.allergies && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <p className="text-xs font-medium text-red-600 mb-1">⚠️ Allergies</p>
                <p className="text-sm text-gray-700 line-clamp-2">{patient.allergies}</p>
              </div>
            )}
            
            {patient.currentTreatment && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs font-medium text-green-600 mb-1">Traitement actuel</p>
                <p className="text-sm text-gray-700 line-clamp-2">{patient.currentTreatment}</p>
              </div>
            )}
          </div>

          {/* Last Visit */}
          {patient.lastVisit && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-medium text-blue-600 mb-1">Dernière visite</p>
              <p className="text-sm text-gray-700">{formatDate(patient.lastVisit)}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => onViewFullProfile(patient.patientId)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <ExternalLink size={18} />
              Voir le profil complet
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}