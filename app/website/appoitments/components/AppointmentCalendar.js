
export default function AppointmentCalendar({ currentDate, appointments, view, onSelectDate, selectedDate }) {
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

  const weekDays = getWeekDays(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  return (
    <div className="bg-white">
      
      <div className="grid grid-cols-7 gap-4 mb-4">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-1">
              {dayNames[idx]}
            </div>
          </div>
        ))}
      </div>

      
      <div className="grid grid-cols-7 gap-4" style={{ minHeight: '500px' }}>
        {weekDays.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const today = isToday(day);
          const selected = isSelected(day);
          
          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`border rounded-lg p-2 cursor-pointer transition-colors ${
                selected ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
              } ${today ? 'border-blue-400 border-2' : ''}`}
            >
              
              <div className={`text-center font-semibold mb-2 ${today ? 'text-blue-600' : 'text-gray-700'}`}>
                {day.getDate()}
              </div>

             
              <div className="space-y-1">
                {dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="bg-blue-500 text-white text-xs p-1.5 rounded cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <div className="font-semibold">{apt.time} {apt.patientName}</div>
                    {apt.type && (
                      <div className="text-blue-100 truncate">{apt.type}</div>
                    )}
                  </div>
                ))}
              </div>

              
              {dayAppointments.length === 0 && (
                <div className="h-12"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}