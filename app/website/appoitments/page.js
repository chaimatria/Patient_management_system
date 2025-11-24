"use client";

import { useState } from 'react';
import Sidebar from '@/SharedComponents/Sidebar';
import Navbar from '@/SharedComponents/Navbar';
import Footer from '@/SharedComponents/Footer';
import AppointmentCalendar from './components/AppointmentCalendar';
import AppointmentList from './components/AppointmentList';
import AddAppointmentModal from './components/AddAppointmentModal';

export default function AppointmentsPage() {
  const [view, setView] = useState('week'); // 'day' or 'week'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: 'John Doe',
      time: '10:00',
      type: 'Annual Check-up',
      date: new Date(2023, 10, 15),
      duration: 60
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      time: '11:30',
      type: 'Follow-up on medication',
      date: new Date(2023, 10, 15),
      duration: 30
    },
    {
      id: 3,
      patientName: 'Peter Jones',
      time: '14:00',
      type: 'New patient consultation',
      date: new Date(2023, 10, 15),
      duration: 45
    },
    {
      id: 4,
      patientName: 'John Doe',
      time: '10:00',
      type: 'Follow-up',
      date: new Date(2023, 10, 15),
      duration: 30
    },
    {
      id: 5,
      patientName: 'Alice Johnson',
      time: '09:00',
      type: 'Initial Consultation',
      date: new Date(2023, 10, 16),
      duration: 60
    },
    {
      id: 6,
      patientName: 'Bob Williams',
      time: '13:00',
      type: 'Treatment',
      date: new Date(2023, 10, 16),
      duration: 90
    },
    {
      id: 7,
      patientName: 'Clara Davis',
      time: '16:00',
      type: 'Check-up',
      date: new Date(2023, 10, 17),
      duration: 30
    }
  ]);

  const handleAddAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: appointments.length + 1
    };
    setAppointments([...appointments, newAppointment]);
    setIsModalOpen(false);
  };

  const handleEditAppointment = (id) => {
    console.log('Edit appointment:', id);
    // Implement edit functionality
  };

  const handleDeleteAppointment = (id) => {
    setAppointments(appointments.filter(apt => apt.id !== id));
  };

  const getWeekRange = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));
    const saturday = new Date(date.setDate(diff + 6));
    
    return {
      start: new Date(sunday),
      end: new Date(saturday)
    };
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const formatDateRange = (date) => {
    const { start, end } = getWeekRange(new Date(date));
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">DocLink</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Appointment Scheduling</h2>
        </div>

        <div className="flex gap-6">
          {/* Calendar Section */}
          <div className="flex-1 bg-white rounded-lg border-2 border-purple-200 p-6">
            {/* View Toggle and Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setView('day')}
                  className={`px-4 py-2 rounded ${view === 'day' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Day
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded ${view === 'week' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Week
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
                  {formatDateRange(currentDate)}
                </span>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="w-20"></div>
            </div>

            {/* Calendar Grid */}
            <AppointmentCalendar
              currentDate={currentDate}
              appointments={appointments}
              view={view}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* Appointments List Sidebar */}
          <div className="w-80">
            <AppointmentList
              selectedDate={selectedDate}
              appointments={filteredAppointments}
              onAddClick={() => setIsModalOpen(true)}
              onEdit={handleEditAppointment}
              onDelete={handleDeleteAppointment}
            />
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {isModalOpen && (
        <AddAppointmentModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddAppointment}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
}