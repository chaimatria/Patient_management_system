'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Settings } from 'lucide-react';

export default function BottomBar() {
  const pathname = usePathname();

  const items = [
    { icon: Home, label: 'Accueil', href: '/website/dashboard' },
    { icon: Users, label: 'Patients', href: '/website/patients' },
    { icon: Calendar, label: 'Agenda', href: '/website/appointments' },
    { icon: Settings, label: 'Plus', href: '/website/settings' },
  ];

  return (
    <div className="lg:hidden bg-white border-t border-gray-200">
      <div className="flex items-center justify-around px-4 py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className="flex flex-col items-center space-y-1"
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-xs ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}