"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [validFields, setValidFields] = useState({});

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
    
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
    }
  
    setIsLoading(false);
    setErrors({});
    setTouched({});
    setValidFields({});
  }, [patientData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Real-time validation for better UX
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    const newValidFields = { ...validFields };
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
          delete newValidFields.fullName;
        } else if (value.trim().length < 3) {
          newErrors.fullName = 'Full name must be at least 3 characters';
          delete newValidFields.fullName;
        } else if (value.trim().length > 50) {
          newErrors.fullName = 'Full name must not exceed 50 characters';
          delete newValidFields.fullName;
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim())) {
          newErrors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
          delete newValidFields.fullName;
        } else {
          delete newErrors.fullName;
          newValidFields.fullName = true;
        }
        break;
        
      case 'dateOfBirth':
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
          delete newValidFields.dateOfBirth;
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const minDate = new Date();
          minDate.setFullYear(today.getFullYear() - 150);
          
          if (isNaN(birthDate.getTime())) {
            newErrors.dateOfBirth = 'Invalid date format';
            delete newValidFields.dateOfBirth;
          } else if (birthDate > today) {
            newErrors.dateOfBirth = 'Date of birth cannot be in the future';
            delete newValidFields.dateOfBirth;
          } else if (birthDate < minDate) {
            newErrors.dateOfBirth = 'Please enter a valid date of birth (max 120 years ago)';
            delete newValidFields.dateOfBirth;
          } else {
            delete newErrors.dateOfBirth;
            newValidFields.dateOfBirth = true;
          }
        }
        break;
        
      case 'patientId':
        if (!value.trim()) {
          newErrors.patientId = 'Patient ID is required';
          delete newValidFields.patientId;
        } else if (!/^[A-Z0-9-]+$/.test(value.trim())) {
          newErrors.patientId = 'Patient ID can only contain uppercase letters, numbers, and hyphens';
          delete newValidFields.patientId;
        } else if (value.trim().length < 3) {
          newErrors.patientId = 'Patient ID must be at least 3 characters';
          delete newValidFields.patientId;
        } else if (value.trim().length > 50) {
          newErrors.patientId = 'Patient ID must not exceed 50 characters';
          delete newValidFields.patientId;
        } else {
          delete newErrors.patientId;
          newValidFields.patientId = true;
        }
        break;
        
case 'phoneNumber':
  if (value && value.trim()) {
    const cleanPhone = value.replace(/[\s\-\(\)\+]/g, ''); // strip formatting chars
    const trimmed = value.trim();

    // Must be exactly 10 digits
    if (!/^\d{10}$/.test(cleanPhone)) {
      newErrors.phoneNumber = 'Phone number must contain exactly 10 digits';
      delete newValidFields.phoneNumber;
      break;
    }

    // Original value too long (e.g. typing many spaces or "+213 ...")
    if (trimmed.length > 20) {
      newErrors.phoneNumber = 'Phone number format is too long';
      delete newValidFields.phoneNumber;
      break;
    }

    // Valid phone number
    delete newErrors.phoneNumber;
    newValidFields.phoneNumber = true;

  } else {
    // Empty: no validation error
    delete newErrors.phoneNumber;
    delete newValidFields.phoneNumber;
  }
  break;

        
      default:
        break;
    }
    
    setErrors(newErrors);
    setValidFields(newValidFields);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate full name
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Full name must not exceed 100 characters';
    } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120);
      
      if (isNaN(birthDate.getTime())) {
        newErrors.dateOfBirth = 'Invalid date format';
      } else if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      } else if (birthDate < minDate) {
        newErrors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    // Validate patient ID
    if (!formData.patientId?.trim()) {
      newErrors.patientId = 'Patient ID is required';
    } else if (!/^[A-Z0-9-]+$/.test(formData.patientId.trim())) {
      newErrors.patientId = 'Patient ID can only contain uppercase letters, numbers, and hyphens';
    } else if (formData.patientId.trim().length < 3) {
      newErrors.patientId = 'Patient ID must be at least 3 characters';
    } else if (formData.patientId.trim().length > 50) {
      newErrors.patientId = 'Patient ID must not exceed 50 characters';
    }
    
   
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)\+]/g, '');
      if (!/^\d{9,15}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Phone number must contain 9-15 digits';
      } else if (formData.phoneNumber.trim().length > 20) {
        newErrors.phoneNumber = 'Phone number format is too long';
      }
    }
    
    setErrors(newErrors);
    setTouched({
      fullName: true,
      dateOfBirth: true,
      patientId: true,
      phoneNumber: true,
    });
    
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSubmit = async () => {
    if (isLoading) return;

    if (!validateForm()) {
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
      const dataToSave = {
        ...formData,
        id: formData.id || Date.now().toString(),
        lastVisit: formData.lastVisit || new Date().toISOString().split('T')[0]
      };
      
      await onSave(dataToSave);
      
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
        setValidFields({});
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

 const generatePatientId = async () => {
  try {
    // Fetch existing patients to ensure uniqueness
    const response = await fetch('/api/patients');
    if (!response.ok) throw new Error('Failed to fetch patients');
    
    const existingPatients = await response.json();
    const existingIds = new Set(existingPatients.map(p => p.patientId));
    
    let newId;
    let attempts = 0;
    const maxAttempts = 100;
    const year = new Date().getFullYear();
    
    // Try to generate a unique ID
    do {
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      newId = `PAT-${year}-${random}`;
      attempts++;
    } while (existingIds.has(newId) && attempts < maxAttempts);
    
    // If max attempts reached, use timestamp as fallback
    if (attempts >= maxAttempts) {
      newId = `PAT-${year}-${Date.now().toString().slice(-6)}`;
    }
    
    setFormData(prev => ({ ...prev, patientId: newId }));
    setTouched(prev => ({ ...prev, patientId: true }));
    validateField('patientId', newId);
  } catch (error) {
    console.error('Error generating patient ID:', error);
    // Fallback to timestamp-based ID if API fails
    const year = new Date().getFullYear();
    const newId = `PAT-${year}-${Date.now().toString().slice(-6)}`;
    setFormData(prev => ({ ...prev, patientId: newId }));
    setTouched(prev => ({ ...prev, patientId: true }));
    validateField('patientId', newId);
  }
};

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all";
    
    if (errors[fieldName] && touched[fieldName]) {
      return `${baseClass} border-red-500 focus:ring-red-500 bg-red-50`;
    }
    
    if (validFields[fieldName] && touched[fieldName]) {
      return `${baseClass} border-green-500 focus:ring-green-500 bg-green-50`;
    }
    
    return `${baseClass} border-gray-300 focus:ring-blue-500`;
  };

  const renderFieldIcon = (fieldName) => {
    if (!touched[fieldName]) return null;
    
    if (errors[fieldName]) {
      return <AlertCircle size={18} className="text-red-500" />;
    }
    
    if (validFields[fieldName]) {
      return <CheckCircle size={18} className="text-green-500" />;
    }
    
    return null;
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
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="relative">
              <input
                ref={firstInputRef}
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClassName('fullName')}
                placeholder="Enter full name"
                required
                maxLength={100}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {renderFieldIcon('fullName')}
              </div>
            </div>
            {errors.fullName && touched.fullName && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.fullName}
              </p>
            )}
            {validFields.fullName && touched.fullName && !errors.fullName && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={12} />
                Looks good!
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                onBlur={handleBlur}
                max={new Date().toISOString().split('T')[0]}
                className={getInputClassName('dateOfBirth')}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {renderFieldIcon('dateOfBirth')}
              </div>
            </div>
            {errors.dateOfBirth && touched.dateOfBirth ? (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.dateOfBirth}
              </p>
            ) : formData.dateOfBirth && !errors.dateOfBirth ? (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={12} />
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
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500"
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
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Female</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClassName('patientId')}
                placeholder="PAT-2025-0001"
                required
                maxLength={50}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {renderFieldIcon('patientId')}
              </div>
            </div>
            {errors.patientId && touched.patientId && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.patientId}
              </p>
            )}
            {validFields.patientId && touched.patientId && !errors.patientId && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={12} />
                Valid Patient ID
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={getInputClassName('phoneNumber')}
                placeholder="06 1234 5678 or +212 6 12 34 56 78"
                maxLength={10}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {renderFieldIcon('phoneNumber')}
              </div>
            </div>
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {errors.phoneNumber}
              </p>
            )}
            {validFields.phoneNumber && touched.phoneNumber && !errors.phoneNumber && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle size={12} />
                Valid phone number
              </p>
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
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.pathology.length}/1000 characters
          </p>
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
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.familyHistory.length}/1000 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergies
          </label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter known allergies"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.allergies.length}/500 characters
          </p>
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
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.previousTreatments.length}/1000 characters
          </p>
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
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.currentTreatment.length}/1000 characters
          </p>
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
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.notes.length}/2000 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              Saving...
            </>
          ) : (
            patientData ? 'Update Patient' : 'Save Patient'
          )}
        </button>
      </div>
    </div>
  );
}