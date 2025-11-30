"use client";

import { useState } from 'react';
import AppointmentCalendar from './components/AppointmentCalendar';
import AppointmentList from './components/AppointmentList';
import AddAppointmentModal from './components/AddAppointmentModal';
import DateRangePicker from './components/DateRangePicker';

export default function AppointmentsPage() {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [customDateRange, setCustomDateRange] = useState(null);
  
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: 'Jean Dupont',
      time: '10:00',
      type: 'Bilan annuel',
      date: new Date(2023, 10, 15),
      duration: 30,
      status: 'scheduled'
    },
    {
      id: 2,
      patientName: 'Marie Martin',
      time: '11:30',
      type: 'Suivi médicamenteux',
      date: new Date(2023, 10, 15),
      duration: 30,
      status: 'scheduled'
    },
    {
      id: 3,
      patientName: 'Pierre Bernard',
      time: '14:00',
      type: 'Consultation initiale',
      date: new Date(2023, 10, 15),
      duration: 45,
      status: 'completed'
    }
  ]);

  const handleAddAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: appointments.length + 1,
      status: 'scheduled'
    };
    setAppointments([...appointments, newAppointment]);
    setIsAddModalOpen(false);
  };

  const handleEditAppointment = (id) => {
    const appointment = appointments.find(apt => apt.id === id);
    setEditingAppointment(appointment);
    setIsEditModalOpen(true);
  };

  const handleUpdateAppointment = (updatedAppointment) => {
    setAppointments(appointments.map(apt => 
      apt.id === updatedAppointment.id ? updatedAppointment : apt
    ));
    setIsEditModalOpen(false);
    setEditingAppointment(null);
  };

  const handleDeleteAppointment = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous?')) {
      setAppointments(appointments.filter(apt => apt.id !== id));
    }
  };

  const handleChangeStatus = (id, newStatus) => {
    setAppointments(appointments.map(apt => 
      apt.id === id ? { ...apt, status: newStatus } : apt
    ));
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
    setView('week');
  };

  const formatDateRange = (date) => {
    if (view === 'day') {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long', 
        year: 'numeric' 
      });
    } else if (view === 'custom' && customDateRange) {
      const start = customDateRange.start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const end = customDateRange.end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${start} - ${end}`;
    } else {
      const { start, end } = getWeekRange(new Date(date));
      return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    if (view === 'day') {
      return aptDate.toDateString() === selectedDate.toDateString();
    } else if (view === 'custom' && customDateRange) {
      return aptDate >= customDateRange.start && aptDate <= customDateRange.end;
    } else {
      return aptDate.toDateString() === selectedDate.toDateString();
    }
  });

  const handleCustomDateRange = (start, end) => {
    setCustomDateRange({ start, end });
    setView('custom');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full">
        {/* header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 rounded-lg p-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">DocLink</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Gestion des Rendez-vous</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* calendar Section */}
          <div className="flex-1 bg-white rounded-lg border-2 border-purple-200 p-6">
            {/* view toggle and navigation */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setView('day')}
                    className={`px-4 py-2 rounded whitespace-nowrap ${view === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Jour
                  </button>
                  <button
                    onClick={() => setView('week')}
                    className={`px-4 py-2 rounded whitespace-nowrap ${view === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    Semaine
                  </button>
                  <DateRangePicker onSelectRange={handleCustomDateRange} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  onClick={() => view === 'day' ? navigateDay(-1) : navigateWeek(-1)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Précédent"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded font-medium whitespace-nowrap"
                >
                  Aujourd'hui
                </button>
                
                <span className="text-sm font-medium text-gray-700 flex-1 text-center min-w-[200px]">
                  {formatDateRange(currentDate)}
                </span>
                
                <button
                  onClick={() => view === 'day' ? navigateDay(1) : navigateWeek(1)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Suivant"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* calendar grid */}
            <AppointmentCalendar
              currentDate={currentDate}
              appointments={appointments}
              view={view}
              customDateRange={customDateRange}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* appointments list sidebar */}
          <div className="w-full lg:w-96">
            <AppointmentList
              selectedDate={selectedDate}
              appointments={filteredAppointments}
              onAddClick={() => setIsAddModalOpen(true)}
              onEdit={handleEditAppointment}
              onDelete={handleDeleteAppointment}
              onChangeStatus={handleChangeStatus}
            />
          </div>
        </div>
      </div>

      {/* add appointment modal */}
      {isAddModalOpen && (
        <AddAppointmentModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddAppointment}
          selectedDate={selectedDate}
          existingAppointments={appointments}
        />
      )}

      {/* edit appointment modal */}
      {isEditModalOpen && editingAppointment && (
        <AddAppointmentModal
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAppointment(null);
          }}
          onSave={handleUpdateAppointment}
          selectedDate={selectedDate}
          existingAppointments={appointments}
        />
      )}
    </div>
  );
}