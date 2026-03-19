import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Calendar, 
  Users, 
  FileCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { title: 'Companies', icon: <Building2 size={20} />, path: '/admin/companies' },
    { title: 'Placement Drives', icon: <Briefcase size={20} />, path: '/admin/drives' },
    { title: 'Interviews', icon: <Users size={20} />, path: '/admin/interviews' },
    { title: 'Calendar', icon: <Calendar size={20} />, path: '/admin/calendar' },
    { title: 'Leaderboard', icon: <Trophy size={20} />, path: '/admin/leaderboard' },
    { title: 'Students', icon: <Users size={20} />, path: '/admin/students' },
    { title: 'Verification', icon: <FileCheck size={20} />, path: '/admin/verification' },
    { title: 'Analytics', icon: <BarChart3 size={20} />, path: '/admin/analytics' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col z-20">
      <div className="p-6 pb-2">
        <h1 className="brand-logo font-display tracking-tight">
          PLACEMATE
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl
              ${isActive ? 'active' : 'text-slate-500'}
            `}
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
