// components/PatientForm.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Stethoscope } from 'lucide-react';

export default function PatientForm({ patientData = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
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
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // this si the fun that fills the form fileds with the data of a patient that already exist when the modification will be made 
  // it runs whenevr the patientData prop changes
  useEffect(() => {
    if (patientData) {
      setFormData(patientData);
    }
  }, [patientData]);
// handle the form data with the new value entered by the user
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
// the gender has a sprate fun , not text generic as the one bellow cuz it is not a text 
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
// this fun checks required fileds , onsave func must be DEFINEDD LATER ( REMEMBER THIS WHEN THE DATABASES THINGS ARE IMPLEMENTED  )
//************************************************************************************ */
  const handleSubmit = async () => {
    if (!formData.fullName || !formData.dateOfBirth || !formData.patientId) {
      alert('Please fill in all required fields: Full Name, Date of Birth, and Patient ID');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      alert('Error saving patient: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePatientId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, patientId: `PAT-${year}-${random}` }));
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {patientData ? 'Edit Patient' : 'Add New Patient'}
        </h1>
        <button
          onClick={generatePatientId}
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
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.dateOfBirth && (
              <p className="text-xs text-gray-500 mt-1">
                Age: {calculateAge(formData.dateOfBirth)} years
              </p>
            )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="PAT-2025-001"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="06 6666 6666"
            />
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
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
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