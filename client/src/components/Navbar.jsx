import React, { useState, useEffect } from 'react';
import { Bell, Search, UserCircle, Check, X, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data);
      setUnreadCount(res.data.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search for students, companies..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-premium border border-slate-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-all group ${!notif.isRead ? 'bg-primary/[0.02]' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
                              <Clock size={10} />
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {!notif.isRead && (
                            <button 
                              onClick={() => markAsRead(notif._id)}
                              className="p-1 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Mark as read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      <Bell size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Administrator'}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-800 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
            {user?.name?.[0] || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
