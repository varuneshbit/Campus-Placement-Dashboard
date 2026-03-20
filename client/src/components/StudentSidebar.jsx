import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  Briefcase, 
  Calendar, 
  Users,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentSidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/student/dashboard' },
    { title: 'Drives', icon: <Briefcase size={20} />, path: '/student/drives' },
    { title: 'Resume Management', icon: <FileText size={20} />, path: '/student/resume' },
    { title: 'Interviews', icon: <Users size={20} />, path: '/student/interviews' },
    { title: 'Calendar', icon: <Calendar size={20} />, path: '/student/calendar' },
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

export default StudentSidebar;
