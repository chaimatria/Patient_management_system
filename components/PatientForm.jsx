"use client";
import React, { useState, useEffect, useRef } from 'react';

import { Calendar, Stethoscope } from 'lucide-react';


export default function PatientForm({ patientData = null, onSave, onCancel }) {
  const firstInputRef = useRef(null);
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    dateOfBirth: '',
    gender: 'male',
    patientId: '',
    phoneNumber: '',
    pathology: '',
    familyHistory: '',
    allergies: '',
    previousTreatments: '',
    currentTreatment: '',
    notes: '',
    lastVisit: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (patientData) {
      setFormData({
        id: patientData.id || '',
        fullName: patientData.fullName || '',
        dateOfBirth: patientData.dateOfBirth || '',
        gender: patientData.gender || 'male',
        patientId: patientData.patientId || '',
        phoneNumber: patientData.phoneNumber || '',
        pathology: patientData.pathology || '',
        familyHistory: patientData.familyHistory || '',
        allergies: patientData.allergies || '',
        previousTreatments: patientData.previousTreatments || '',
        currentTreatment: patientData.currentTreatment || '',
        notes: patientData.notes || '',
        lastVisit: patientData.lastVisit || ''
      });
    } else {
      setFormData({
        id: '',
        fullName: '',
        dateOfBirth: '',
        gender: 'male',
        patientId: '',
        phoneNumber: '',
        pathology: '',
        familyHistory: '',
        allergies: '',
        previousTreatments: '',
        currentTreatment: '',
        notes: '',
        lastVisit: ''
      });
    }
  
    setIsLoading(false);
    setErrors({});
    setTouched({});
  
    if (!patientData) {
      setFormData({
        id: '',
        fullName: '',
        dateOfBirth: '',
        gender: 'male',
        patientId: '',
        phoneNumber: '',
        pathology: '',
        familyHistory: '',
        allergies: '',
        previousTreatments: '',
        currentTreatment: '',
        notes: '',
        lastVisit: ''
      });
    
      // Focus the first input after resetting
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
    }
    
  }, [patientData]);
  

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle blur events to mark fields as touched
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  // Validate individual field
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          newErrors.fullName = 'Full name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
          newErrors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
        } else {
          delete newErrors.fullName;
        }
        break;
        
      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const maxDate = new Date();
          maxDate.setFullYear(today.getFullYear() - 120); // Max age 120 years
          
          if (birthDate > today) {
            newErrors.dateOfBirth = 'Date of birth cannot be in the future';
          } else if (birthDate < maxDate) {
            newErrors.dateOfBirth = 'Please enter a valid date of birth';
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;
        
      case 'patientId':
        if (!value.trim()) {
          newErrors.patientId = 'Patient ID is required';
        } else if (!/^[A-Z0-9-]+$/.test(value.trim())) {
          newErrors.patientId = 'Patient ID can only contain uppercase letters, numbers, and hyphens';
        } else if (value.trim().length < 3) {
          newErrors.patientId = 'Patient ID must be at least 3 characters';
        } else {
          delete newErrors.patientId;
        }
        break;
        
      case 'phoneNumber':
        if (value && value.trim()) {
          // Allow various phone formats: 06 1234 5678, 0612345678, +212 6 12 34 56 78, etc.
          const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
          if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
          } else {
            delete newErrors.phoneNumber;
          }
        } else {
          delete newErrors.phoneNumber; // Phone is optional
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() - 120);
      
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      } else if (birthDate < maxDate) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    if (!formData.patientId?.trim()) {
      newErrors.patientId = 'Patient ID is required';
    } else if (!/^[A-Z0-9-]+$/.test(formData.patientId.trim())) {
      newErrors.patientId = 'Patient ID can only contain uppercase letters, numbers, and hyphens';
    } else if (formData.patientId.trim().length < 3) {
      newErrors.patientId = 'Patient ID must be at least 3 characters';
    }
    
    // Validate optional phone number if provided
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        newErrors.phoneNumber = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    // Mark all fields as touched when validating
    setTouched({
      fullName: true,
      dateOfBirth: true,
      patientId: true,
      phoneNumber: true,
    });
    
    return Object.keys(newErrors).length === 0;
  };

  // Handle gender selection
  const handleGenderChange = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validate and submit form
  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isLoading) {
      return;
    }

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setIsLoading(true);
    try {
      // Generate a unique ID if creating a new patient
      const dataToSave = {
        ...formData,
        id: formData.id || Date.now().toString(),
        lastVisit: formData.lastVisit || new Date().toISOString().split('T')[0]
      };
      
      await onSave(dataToSave);
      
      // Reset form after successful save if adding a new patient
      if (!patientData) {
        setFormData({
          id: '',
          fullName: '',
          dateOfBirth: '',
          gender: 'male',
          patientId: '',
          phoneNumber: '',
          pathology: '',
          familyHistory: '',
          allergies: '',
          previousTreatments: '',
          currentTreatment: '',
          notes: '',
          lastVisit: ''
        });
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient: ' + (error.message || 'Unknown error'));
    } finally {
      // Always reset loading state, even on error
      setIsLoading(false);
    }
  };

  const generatePatientId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newId = `PAT-${year}-${random}`;
    setFormData(prev => ({ ...prev, patientId: newId }));
    // Clear any existing error for patientId
    if (errors.patientId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.patientId;
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {patientData ? 'Edit Patient' : 'Add New Patient'}
        </h1>
        <button
          onClick={generatePatientId}
          type="button"
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Generate Patient ID
        </button>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Patient Information</h2>
        <p className="text-sm text-gray-500 mb-6">Fill in the details to add a new patient record.</p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.fullName && touched.fullName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Enter full name"
              required
            />
            {errors.fullName && touched.fullName && (
              <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
            )}

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              onBlur={handleBlur}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.dateOfBirth && touched.dateOfBirth
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              required
            />
            {errors.dateOfBirth && touched.dateOfBirth ? (
              <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>
            ) : formData.dateOfBirth ? (
              <p className="text-xs text-gray-500 mt-1">
                Age: {calculateAge(formData.dateOfBirth)} years
              </p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={() => handleGenderChange('male')}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Male</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={() => handleGenderChange('female')}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Female</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.patientId && touched.patientId
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="PAT-2025-001"
              required
            />
            {errors.patientId && touched.patientId && (
              <p className="text-xs text-red-500 mt-1">{errors.patientId}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.phoneNumber && touched.phoneNumber
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="06 6666 6666"
            />
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Medical History</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pathology (Medical History)
          </label>
          <textarea
            name="pathology"
            value={formData.pathology}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter medical conditions, diagnoses, etc."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Family Members with Same Disease
          </label>
          <textarea
            name="familyHistory"
            value={formData.familyHistory}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter family medical history"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter known allergies"
          />
        </div>
      </div>

      {/* Treatment Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Treatment Details</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Previous Treatments
          </label>
          <textarea
            name="previousTreatments"
            value={formData.previousTreatments}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter previous treatments and medications"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Treatment
          </label>
          <textarea
            name="currentTreatment"
            value={formData.currentTreatment}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter current treatments and medications"
          />
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Notes</h2>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Enter any additional notes or observations"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (patientData ? 'Update Patient' : 'Save Patient')}
        </button>
      </div>
    </div>
  );
}