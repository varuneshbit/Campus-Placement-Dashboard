import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { ArrowRight, LogOut } from 'lucide-react';

const StudentLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
       <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-12">
            <Link to="/student/dashboard" className="brand-logo">
              PlaceMate
            </Link>
            <nav className="hidden md:flex items-center gap-8 mt-1">
               <NavLink to="/student/dashboard" className={({isActive}) => `text-sm font-semibold text-slate-600 nav-link ${isActive ? 'active' : ''}`}>Drives</NavLink>
               <NavLink to="/student/interviews" className={({isActive}) => `text-sm font-semibold text-slate-600 nav-link ${isActive ? 'active' : ''}`}>Interviews</NavLink>
               <NavLink to="/student/calendar" className={({isActive}) => `text-sm font-semibold text-slate-600 nav-link ${isActive ? 'active' : ''}`}>Calendar</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
             </div>
             <button 
                onClick={logout} 
                className="p-2.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl border border-slate-100 transition-all flex items-center gap-2"
                title="Logout"
             >
                <LogOut size={18} />
             </button>
          </div>
       </header>
       <main className="p-8 max-w-7xl mx-auto">
          {children}
       </main>
    </div>
  );
};

export default StudentLayout;
