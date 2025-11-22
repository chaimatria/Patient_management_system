export default function ActivityItem({ icon, message, time }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
