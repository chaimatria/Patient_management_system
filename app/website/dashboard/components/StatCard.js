export default function StatCard({ title, value, subtitle, icon, subtitleColor }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
          <p className={`text-sm ${subtitleColor}`}>{subtitle}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
