import { useState, useEffect } from 'react';

export default function AddAppointmentModal({ onClose, onSave, selectedDate, existingAppointments = [] }) {
  const [formData, setFormData] = useState({
    patientName: '',
    date: selectedDate.toISOString().split('T')[0],
    time: '09:00',
    type: '',
    duration: 5
  });
  const [timeConflict, setTimeConflict] = useState(null);
  const [suggestedTime, setSuggestedTime] = useState(null);

  
  useEffect(() => {
    checkTimeConflict();
  }, [formData.date, formData.time, formData.duration]);

  const checkTimeConflict = () => {
    if (!formData.date || !formData.time) {
      setTimeConflict(null);
      setSuggestedTime(null);
      return;
    }

  
    const selectedDateStr = new Date(formData.date).toDateString();
    const dayAppointments = existingAppointments.filter(apt => 
      new Date(apt.date).toDateString() === selectedDateStr
    );

    // parse the selected time
    const [hours, minutes] = formData.time.split(':').map(Number);
    const selectedStart = hours * 60 + minutes; // Convert to minutes
    const selectedEnd = selectedStart + parseInt(formData.duration);

    // checking  conflicts ,appointments cannot overlap
    let conflict = null;
    for (const apt of dayAppointments) {
      const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
      const aptStart = aptHours * 60 + aptMinutes;
      const aptEnd = aptStart + parseInt(apt.duration);

      // Checking if times overlap
      if (
        (selectedStart >= aptStart && selectedStart < aptEnd) || // new starts during existing
        (selectedEnd > aptStart && selectedEnd <= aptEnd) ||     // new ends during existing
        (selectedStart <= aptStart && selectedEnd >= aptEnd)      // new completely overlaps existing
      ) {
        conflict = {
          patientName: apt.patientName,
          time: apt.time,
          duration: apt.duration,
          endTime: `${String(Math.floor(aptEnd / 60)).padStart(2, '0')}:${String(aptEnd % 60).padStart(2, '0')}`
        };
        break;
      }
    }

    setTimeConflict(conflict);

    // if there's a conflict, suggest next available time
    if (conflict) {
      const nextTime = findNextAvailableTime(selectedStart, dayAppointments, formData.duration);
      setSuggestedTime(nextTime);
    } else {
      setSuggestedTime(null);
    }
  };

  const findNextAvailableTime = (requestedStart, dayAppointments, duration) => {
    // sorting  appointments by time
    const sortedAppointments = [...dayAppointments].sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    });

    let testTime = requestedStart;
    const endOfDay = 19 * 60; 
    const durationNum = parseInt(duration);

    while (testTime + durationNum <= endOfDay) {
      let hasConflict = false;

      for (const apt of sortedAppointments) {
        const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
        const aptStart = aptHours * 60 + aptMinutes;
        const aptEnd = aptStart + parseInt(apt.duration);

        // check if test time overlaps with any appointment
        if (
          (testTime >= aptStart && testTime < aptEnd) ||
          (testTime + durationNum > aptStart && testTime + durationNum <= aptEnd) ||
          (testTime <= aptStart && testTime + durationNum >= aptEnd)
        ) {
          hasConflict = true;
          testTime = aptEnd; 
          break;
        }
      }

      if (!hasConflict) {
        const hours = Math.floor(testTime / 60);
        const mins = testTime % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      }
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (timeConflict) {
      const useConfirmed = confirm(
        `Conflit d'horaire détecté!\n\n` +
        `Un rendez-vous existe déjà avec ${timeConflict.patientName} de ${timeConflict.time} à ${timeConflict.endTime}.\n\n` +
        (suggestedTime ? 
          `Voulez-vous utiliser l'heure suggérée: ${suggestedTime}?` :
          `Aucun créneau disponible trouvé pour cette durée aujourd'hui.`)
      );

      if (useConfirmed && suggestedTime) {
        const appointment = {
          ...formData,
          time: suggestedTime,
          date: new Date(formData.date)
        };
        onSave(appointment);
      }
      return;
    }
    
    const appointment = {
      ...formData,
      date: new Date(formData.date)
    };
    
    onSave(appointment);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const useSuggestedTime = () => {
    if (suggestedTime) {
      setFormData(prev => ({
        ...prev,
        time: suggestedTime
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">

      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-900">Nouveau Rendez-vous</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du patient *
            </label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Entrez le nom du patient"
            />
          </div>

          {/* date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure *
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                timeConflict ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            
            {/* time conflict warning */}
            {timeConflict && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">Conflit d'horaire!</p>
                    <p className="text-xs text-red-700 mt-1">
                      Rendez-vous existant: {timeConflict.patientName} de {timeConflict.time} à {timeConflict.endTime}
                    </p>
                    {suggestedTime && (
                      <div className="mt-2">
                        <p className="text-xs text-red-700 mb-1">Prochain créneau disponible:</p>
                        <button
                          type="button"
                          onClick={useSuggestedTime}
                          className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          Utiliser {suggestedTime}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* no Conflict */}
            {!timeConflict && formData.time && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Créneau disponible</span>
              </div>
            )}
          </div>

          {/* duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée (minutes) *
            </label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
              <option value="25">25 minutes</option>
              <option value="30">30 minutes</option>
              <option value="35">35 minutes</option>
              <option value="40">40 minutes</option>
              <option value="45">45 minutes</option>
              <option value="50">50 minutes</option>
              <option value="55">55 minutes</option>
              <option value="60">60 minutes</option>
              <option value="65">65 minutes</option>
              <option value="70">70 minutes</option>
              <option value="75">75 minutes</option>
              <option value="80">80 minutes</option>
              <option value="85">85 minutes</option>
              <option value="90">90 minutes</option>
              <option value="95">95 minutes</option>
              <option value="100">100 minutes</option>
              <option value="105">105 minutes</option>
              <option value="110">110 minutes</option>
              <option value="115">115 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          {/* appointment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de consultation *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner le type</option>
              <option value="Consultation initiale">Consultation initiale</option>
              <option value="Suivi">Suivi</option>
              <option value="Bilan annuel">Bilan annuel</option>
              <option value="Traitement">Traitement</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                timeConflict 
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {timeConflict ? 'Forcer l\'ajout' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}