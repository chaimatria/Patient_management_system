'use client';

import { useRouter } from 'next/navigation';
import { Menu, Clock, Calendar, LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('rememberMe');
    
    // Redirect to login using Next.js router
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Clock className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            <Calendar className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg group"
            title="Déconnexion"
          >
            <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </header>
  );
}