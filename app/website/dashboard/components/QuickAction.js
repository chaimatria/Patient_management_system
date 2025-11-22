export default function QuickActions() {
  return (
    <div className="space-y-3">
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2">
        <span>+</span>
        <span>Ajouter un patient</span>
      </button>
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2">
        <span>📅</span>
        <span>Programmer un rendez-vous</span>
      </button>
      <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2">
        <span>📄</span>
        <span>Voir les notes récentes</span>
      </button>
    </div>
  );
}
