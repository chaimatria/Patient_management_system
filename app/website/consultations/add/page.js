'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar, FileText, Save, X } from 'lucide-react';


export default function AddConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const consultationId = searchParams.get('id');

  const [formData, setFormData] = useState({
    consultationDate: new Date().toISOString().split('T')[0],
    description: '',
    lastVisit: new Date().toISOString().split('T')[0]
  });

  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patientId) {
      loadPatientData(patientId);
    }
    if (consultationId) {
      loadConsultationData(consultationId);
    }
  }, [patientId, consultationId]);

  const loadPatientData = async (id) => {
    setIsLoadingPatient(true);
    try {
      const response = await fetch(`/api/patients?id=${id}`);
      if (!response.ok) throw new Error('Failed to load patient');
      const patientData = await response.json();
      setPatient(patientData);
    } catch (error) {
      console.error('Error loading patient:', error);
      alert('Error loading patient data');
      router.push('/website/patients');
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const loadConsultationData = async (id) => {
    try {
      const response = await fetch('/api/consultations');
      if (!response.ok) throw new Error('Failed to load consultations');
      const consultations = await response.json();
      const consultation = consultations.find(c => c.consultation_id === parseInt(id));
      
      if (consultation) {
        setFormData({
          consultationDate: consultation.consultation_date.split('T')[0],
          description: consultation.description || '',
          lastVisit: consultation.last_visit ? consultation.last_visit.split('T')[0] : consultation.consultation_date.split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error loading consultation:', error);
      alert('Error loading consultation data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.consultationDate) {
      newErrors.consultationDate = 'Consultation date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const method = consultationId ? 'PUT' : 'POST';
      const url = '/api/consultations';
      
      const payload = {
        ...formData,
        patientId: patientId,
        consultationDate: formData.consultationDate,
        lastVisit: formData.lastVisit || formData.consultationDate
      };

      if (consultationId) {
        payload.consultationId = parseInt(consultationId);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save consultation');
      }

      alert(consultationId ? 'Consultation updated successfully!' : 'Consultation created successfully!');
      
      // Navigate back to patient profile (use website routes)
      if (patientId) {
        router.push(`/website/patients/profile/${patientId}`);
      } else {
        router.push('/website/patients');
      }
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Error saving consultation: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Discard changes?')) {
      if (patientId) {
        router.push(`/website/patients/profile/${patientId}`);
      } else {
        router.push('/website/patients');
      }
    }
  };

  if (isLoadingPatient) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto p-8">
            {/* Back Navigation */}
            <button
              onClick={() => patientId ? router.push(`/website/patients/profile/${patientId}`) : router.push('/website/patients')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">
                {patientId ? 'Back to Patient Profile' : 'Back to Patients List'}
              </span>
            </button>

            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {consultationId ? 'Edit Consultation' : 'Add New Consultation'}
              </h1>
              {patient && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">Patient:</span>
                  <span className="text-gray-900">{patient.fullName}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-blue-600">{patient.patientId}</span>
                </div>
              )}
            </div>

            {/* Consultation Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Consultation Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Consultation Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.consultationDate ? 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all border-red-500 focus:ring-red-500 bg-red-50' : 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all border-gray-300 focus:ring-blue-500'}
                  required
                />
                {errors.consultationDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.consultationDate}</p>
                )}
              </div>

              {/* Last Visit Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Last Visit Date
                </label>
                <input
                  type="date"
                  name="lastVisit"
                  value={formData.lastVisit}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use consultation date
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  Consultation Notes / Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter consultation notes, diagnosis, observations, recommendations, etc."
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/5000 characters
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isLoading ? 'Saving...' : (consultationId ? 'Update Consultation' : 'Save Consultation')}
                </button>
              </div>
            </form>
          </div>
    </div>
  );
}

