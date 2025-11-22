// components/StatsCard.jsx
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, change, isPositive }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
      <div className="flex items-center space-x-1">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-600" />
        )}
        <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}