// app/reports/page.js
'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, FileDown } from 'lucide-react';
import StatsCard from './components/StatsCard';
import ConsultationsTrend from './components/ConsultationsTrend';
import ConsultationStatus from './components/ConsultationStatus';
import CommonPathologies from './components/CommonPathologies';
import PathologiesByCount from './components/PathologiesByCount';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reports</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Consultations"
          value="1,245"
          change="+12.5%"
          isPositive={true}
        />
        <StatsCard
          title="Avg. Consultations/Day"
          value="42"
          change="-2.1%"
          isPositive={false}
        />
        <StatsCard
          title="Successful Resolutions"
          value="92.5%"
          change="+0.8%"
          isPositive={true}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConsultationsTrend />
        <ConsultationStatus />
      </div>

      {/* Pathologies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommonPathologies />
        <PathologiesByCount />
      </div>
    </div>
  );
}
