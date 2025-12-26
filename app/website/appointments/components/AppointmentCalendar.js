export default function AppointmentCalendar({ currentDate, appointments, view, customDateRange, onSelectDate, selectedDate }) {
  const getWeekDays = (date) => {
    const days = [];
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(diff + i);
      days.push(d);
    }
    
    return days;
  };

  const getCustomRangeDays = () => {
    if (!customDateRange) return [];
    
    const days = [];
    const current = new Date(customDateRange.start);
    
    while (current <= customDateRange.end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDaysToDisplay = () => {
    if (view === 'day') {
      return [currentDate];
    } else if (view === 'custom' && customDateRange) {
      return getCustomRangeDays();
    } else {
      return getWeekDays(currentDate);
    }
  };

  const days = getDaysToDisplay();
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getAppointmentsForDay = (date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      case 'no-show':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  if (view === 'day') {
    const dayAppointments = getAppointmentsForDay(currentDate);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);

    return (
      <div className="bg-white">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
        </div>

        <div className="border rounded-lg overflow-hidden">
          {hours.map(hour => {
            const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const appotsAtThisHour = dayAppointments.filter(apt => 
              apt.time.startsWith(hour.toString().padStart(2, '0'))
            );

            return (
              <div key={hour} className="flex border-b last:border-b-0">
                <div className="w-20 p-3 bg-gray-50 border-r text-sm font-medium text-gray-600 flex-shrink-0">
                  {`${hour}:00`}
                </div>
                <div className="flex-1 p-2 min-h-[60px]">
                  {appotsAtThisHour.map(apt => (
                    <div
                      key={apt.id}
                      className={`${getStatusColor(apt.status)} text-white text-xs p-2 rounded mb-1 cursor-pointer transition-colors`}
                      onClick={() => onSelectDate(currentDate)}
                    >
                      <div className="font-semibold">{apt.time} - {apt.patientName}</div>
                      <div className="text-white opacity-90">{apt.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full">
      {/* day headers */}
      <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((day, idx) => (
          <div key={idx} className="text-center">
            <div className="text-sm font-medium text-gray-600">
              {view === 'custom' ? 
                day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) :
                `${dayNames[day.getDay()]}`
              }
            </div>
            <div className="text-lg font-bold text-gray-900">
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/*calendar grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const today = isToday(day);
          const selected = isSelected(day);
          
          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`border-2 rounded-lg p-3 cursor-pointer transition-all min-h-[150px] flex flex-col ${
                selected 
                  ? 'bg-blue-50 border-blue-400 shadow-md' 
                  : today
                  ? 'border-blue-400 bg-white'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* date number */}
              <div className={`text-center font-bold mb-2 ${today ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>

              {/* appointments list */}
              <div className="space-y-1 flex-1 overflow-y-auto">
                {dayAppointments.length > 0 ? (
                  dayAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className={`${getStatusColor(apt.status)} text-white text-xs p-1.5 rounded cursor-pointer transition-colors truncate`}
                      title={`${apt.time} - ${apt.patientName}`}
                    >
                      <div className="font-semibold truncate">{apt.time}</div>
                      <div className="text-white opacity-90 truncate">{apt.patientName}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 text-xs py-2">
                    Aucun
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}