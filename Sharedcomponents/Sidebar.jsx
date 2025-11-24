'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, FileText, Settings, X, ClipboardListIcon } from 'lucide-react';





export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: 'Tableau de bord', href: '/website/dashboard' },
    { icon: Users, label: 'Patients', href: 'patients' },
    { icon: Calendar, label: 'Rendez-vous', href: '/website/appointments' },
    { icon: FileText, label: 'Rapports', href: '/website/reports' },
    { icon: Settings, label: 'Paramètres', href: '/website/settings' },
    { icon: ClipboardListIcon, label: 'Ordonnances', href: '/website/prescriptions' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">MediCare</h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                DR
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Dr. Martin</p>
                <p className="text-xs text-gray-500">Médecin généraliste</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}