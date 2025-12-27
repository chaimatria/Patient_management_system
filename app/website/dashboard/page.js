// File: my-app/app/website/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CalendarCheck, FileCheck, FileText, Calendar } from 'lucide-react';

// Icon mapping object
const iconMap = {
  Users,
  CalendarCheck,
  FileCheck,
  FileText,
  Calendar
};

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    appointments: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistiques Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dashboardData.stats.map((stat, idx) => {
            const Icon = iconMap[stat.icon];
            return (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {Icon && <Icon className="w-5 h-5 text-gray-600" />}
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
            {dashboardData.appointments.map((apt, idx) => (
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
          <button 
            onClick={() => router.push('/website/appointments')}
            className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Voir tous les rendez-vous
          </button>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/website/patients/add')}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Ajouter un patient</span>
            </button>
            <button 
              onClick={() => router.push('/website/appointments')}
              className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors"
            >
              <CalendarCheck className="w-5 h-5" />
              <span className="font-medium">Programmer un rendez-vous</span>
            </button>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Historique des Activités Récentes</h3>
        <div className="space-y-4">
          {dashboardData.activities.map((activity, idx) => {
            const Icon = iconMap[activity.icon];
            return (
              <div key={idx} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  {Icon && <Icon className="w-4 h-4 text-gray-600" />}
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