'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, User } from 'lucide-react';

export default function AppointmentsPage() {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Failed to load appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Error loading appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAppointment = async (appointmentData) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.conflictWith) {
          alert(`Time conflict! ${error.conflictWith.patientName} has an appointment at ${error.conflictWith.time}`);
        } else {
          throw new Error(error.error || 'Failed to create appointment');
        }
        return;
      }

      await loadAppointments();
      setIsAddModalOpen(false);
      alert('Appointment created successfully!');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateAppointment = async (appointmentData) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update appointment');
      }

      await loadAppointments();
      setEditingAppointment(null);
      alert('Appointment updated successfully!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const response = await fetch('/api/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      });

      if (!response.ok) throw new Error('Failed to delete appointment');

      await loadAppointments();
      alert('Appointment deleted successfully!');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error deleting appointment');
    }
  };

  const handleChangeStatus = async (appointmentId, newStatus) => {
    const appointment = appointments.find(a => a.appointment_id === appointmentId);
    if (!appointment) return;

    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          patientName: appointment.patient_name,
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          appointmentType: appointment.appointment_type,
          duration: appointment.duration,
          status: newStatus,
          notes: appointment.notes
        })
      });

      if (!response.ok) throw new Error('Failed to update status');

      await loadAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today));
    setSelectedDate(new Date(today));
  };

  const formatDateRange = (date) => {
    if (view === 'day') {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
      });
    } else {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments Management</h1>
          <p className="text-gray-600">Schedule and manage appointments (Independent of patient records)</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'day' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day View
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'week' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Week View
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => view === 'day' ? navigateDay(-1) : navigateWeek(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              
              <button
                onClick={goToToday}
                className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium"
              >
                Today
              </button>
              
              <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
                {formatDateRange(currentDate)}
              </span>
              
              <button
                onClick={() => view === 'day' ? navigateDay(1) : navigateWeek(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Plus size={20} />
              New Appointment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : (
              <AppointmentCalendar
                currentDate={currentDate}
                appointments={appointments}
                view={view}
                onSelectDate={setSelectedDate}
                selectedDate={selectedDate}
              />
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h3>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="mx-auto mb-2 text-gray-400" size={48} />
                  <p>No appointments scheduled</p>
                </div>
              ) : (
                filteredAppointments.map(apt => (
                  <div
                    key={apt.appointment_id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{apt.patient_name}</h4>
                        <p className="text-sm text-gray-600">
                          <Clock size={14} className="inline mr-1" />
                          {apt.appointment_time} - {apt.appointment_type}
                        </p>
                        {apt.notes && (
                          <p className="text-xs text-gray-500 mt-1">{apt.notes}</p>
                        )}
                        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                          apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          apt.status === 'no-show' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingAppointment(apt)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(apt.appointment_id)}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <select
                      value={apt.status}
                      onChange={(e) => handleChangeStatus(apt.appointment_id, e.target.value)}
                      className="w-full text-xs px-2 py-1 border border-gray-300 rounded mt-2"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No Show</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {(isAddModalOpen || editingAppointment) && (
        <AppointmentModal
          appointment={editingAppointment}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingAppointment(null);
          }}
          onSave={editingAppointment ? handleUpdateAppointment : handleAddAppointment}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}

function AppointmentCalendar({ currentDate, appointments, view, onSelectDate, selectedDate }) {
  const getWeekDays = (date) => {
    const days = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    
    return days;
  };

  const days = view === 'day' ? [currentDate] : getWeekDays(currentDate);

  const getAppointmentsForDay = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
      {days.map((day, idx) => {
        const dayAppointments = getAppointmentsForDay(day);
        const today = isToday(day);
        const selected = day.toDateString() === selectedDate.toDateString();
        
        return (
          <div
            key={idx}
            onClick={() => onSelectDate(day)}
            className={`border-2 rounded-lg p-3 cursor-pointer transition-all min-h-[150px] ${
              selected 
                ? 'bg-blue-50 border-blue-400 shadow-md' 
                : today
                ? 'border-blue-400 bg-white'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-center mb-2">
              <div className="text-xs text-gray-600 font-medium">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold ${today ? 'text-blue-600' : 'text-gray-900'}`}>
                {day.getDate()}
              </div>
            </div>

            <div className="space-y-1">
              {dayAppointments.map(apt => (
                <div
                  key={apt.appointment_id}
                  className={`text-xs p-1.5 rounded truncate ${
                    apt.status === 'completed' ? 'bg-green-500 text-white' :
                    apt.status === 'cancelled' ? 'bg-red-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}
                  title={`${apt.appointment_time} - ${apt.patient_name}`}
                >
                  {apt.appointment_time}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AppointmentModal({ appointment, onClose, onSave, selectedDate }) {
  const [formData, setFormData] = useState({
    patientName: appointment?.patient_name || '',
    appointmentDate: appointment?.appointment_date?.split('T')[0] || selectedDate.toISOString().split('T')[0],
    appointmentTime: appointment?.appointment_time || '09:00',
    appointmentType: appointment?.appointment_type || '',
    duration: appointment?.duration || 30,
    status: appointment?.status || 'scheduled',
    notes: appointment?.notes || ''
  });

  const minDate = new Date().toISOString().split('T')[0];
  const isToday = formData.appointmentDate === minDate;
  const currentTime = new Date().toTimeString().slice(0, 5);
  const minTime = isToday ? currentTime : '08:00';

  const handleSubmit = () => {
    if (!formData.patientName || !formData.appointmentType) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      ...formData,
      appointmentId: appointment?.appointment_id
    };
    
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter patient name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter any name - not linked to patient database
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                min={minDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                min={minTime}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              {isToday && (
                <p className="text-xs text-orange-600 mt-1">
                  Only future times available for today
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                value={formData.appointmentType}
                onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select type...</option>
                <option value="Initial Consultation">Initial Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Annual Checkup">Annual Checkup</option>
                <option value="Treatment">Treatment</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {[15, 30, 45, 60, 90, 120].map(min => (
                  <option key={min} value={min}>{min} minutes</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {appointment ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}