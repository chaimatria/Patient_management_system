// File: my-app/app/website/dashboard/page.js
'use client';
import { Users, CalendarCheck, FileCheck, FileText, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { 
      label: 'Total Patients', 
      value: '120', 
      change: '4 nouveaux ce mois',
      changeType: 'positive',
      icon: Users 
    },
    { 
      label: 'Consultations à venir', 
      value: '15', 
      change: '3 annulations récentes',
      changeType: 'negative',
      icon: CalendarCheck 
    },
    { 
      label: 'Suivis en attente', 
      value: '7', 
      change: '2 urgents cette semaine',
      changeType: 'warning',
      icon: FileCheck 
    },
  ];

  const appointments = [
    { time: '09:00 - 09:45', patient: 'Mme. Dubois, Sophie', type: 'Consultation de routine' },
    { time: '10:00 - 10:30', patient: 'M. Garcia, Jean', type: 'Suivi post-opératoire' },
    { time: '11:00 - 11:30', patient: 'Mlle. Martin, Léa', type: 'Examen annuel' },
    { time: '14:00 - 14:30', patient: 'M. Petit, Louis', type: 'Renouvellement ordonnance' },
  ];

  const activities = [
    { text: 'Rendez-vous de Mme. Dubois confirmé pour demain.', time: 'Il y a 5 min', icon: CalendarCheck },
    { text: 'Nouveau patient, M. Louis Petit, ajouté à la base de données.', time: 'Il y a 30 min', icon: Users },
    { text: 'Dossier de Mme. Martin mis à jour avec de nouvelles informations médicales.', time: 'Il y a 1 heure', icon: FileText },
    { text: 'Rendez-vous de M. Garcia modifié pour jeudi prochain.', time: 'Il y a 2 heures', icon: Calendar },
    { text: 'Nouvelle ordonnance générée pour Mme. Dubois.', time: 'Il y a 4 heures', icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistiques Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-orange-600'
                }`}>
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rendez-vous du Jour</h3>
          <div className="space-y-4">
            {appointments.map((apt, idx) => (
              <div key={idx} className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{apt.time}</p>
                  <p className="text-sm text-gray-600">{apt.patient}</p>
                </div>
                <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  {apt.type}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">
            Voir tous les rendez-vous
          </button>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors">
              <Users className="w-5 h-5" />
              <span className="font-medium">Ajouter un patient</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors">
              <CalendarCheck className="w-5 h-5" />
              <span className="font-medium">Programmer un rendez-vous</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Voir les notes récentes</span>
            </button>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des Activités Récentes</h3>
        <div className="space-y-4">
          {activities.map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <div key={idx} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}