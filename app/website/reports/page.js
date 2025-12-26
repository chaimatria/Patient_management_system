// app/reports/page.js
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, FileDown } from 'lucide-react';
import StatsCard from './components/StatsCard';
import ConsultationsTrend from './components/ConsultationsTrend';
import ConsultationStatus from './components/ConsultationStatus';
import CommonPathologies from './components/CommonPathologies';
import PathologiesByCount from './components/PathologiesByCount';

export default function ReportsPage() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports data');
        }
        
        const data = await response.json();
        setReportsData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rapports...</p>
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

  if (!reportsData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Consultations"
          value={`${reportsData.stats.totalConsultations.toLocaleString()}`}
          change="+12.5%"
          isPositive={true}
        />
        <StatsCard
          title="Avg. Consultations/Day"
          value={`${reportsData.stats.avgConsultationsPerDay}`}
          change="-2.1%"
          isPositive={false}
        />
        <StatsCard
          title="Successful Resolutions"
          value={`${reportsData.stats.successRate}%`}
          change="+0.8%"
          isPositive={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsultationsTrend data={reportsData.trends} />
        <ConsultationStatus data={reportsData.consultationStatus} />
      </div>

      {/* Pathologies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommonPathologies data={reportsData.pathologies.common} />
        <PathologiesByCount data={reportsData.pathologies.byCount} />
      </div>
    </div>
  );
}
