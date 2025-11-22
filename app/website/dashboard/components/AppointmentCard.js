export default function AppointmentCard({ time, patientName, appointmentType }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div>
        <p className="font-medium text-gray-900">{time}</p>
        <p className="text-sm text-gray-600">{patientName}</p>
      </div>
      <p className="text-sm text-gray-500">{appointmentType}</p>
    </div>
  );
}
