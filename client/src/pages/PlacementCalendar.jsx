import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import StudentLayout from '../components/StudentLayout';
import { Plus, X, Trash2, Info, Filter, Clock, ArrowRight, Briefcase, Video, CalendarDays } from 'lucide-react';

const localizer = momentLocalizer(moment);

const CustomToolbar = (toolbar) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  return (
    <div className="rbc-toolbar-custom">
      <div className="toolbar-controls">
        <button className="btn" onClick={goToCurrent}>Today</button>
        <button className="btn" onClick={goToBack}>Back</button>
        <button className="btn" onClick={goToNext}>Next</button>
      </div>
      <span className="toolbar-title">{toolbar.label}</span>
      <div className="toolbar-controls"></div>
    </div>
  );
};

const PlacementCalendar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeDate, setActiveDate] = useState(null);
  const [activeFilters, setActiveFilters] = useState(['drive', 'interview', 'result', 'other']);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'other',
    allDay: false
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Format dates for the calendar
      const formattedEvents = res.data.data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
      
      setEvents(formattedEvents);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/events', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchEvents();
      setFormData({ title: '', description: '', start: '', end: '', type: 'other', allDay: false });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if(!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event');
    }
  };

  const dayPropGetter = (date) => {
    const isToday = moment(date).isSame(moment(), 'day');
    const isActive = activeDate && moment(date).isSame(activeDate, 'day');
    
    let className = 'calendar-cell';
    if (isToday) className += ' calendar-cell-today';
    if (isActive) className += ' calendar-cell-active';

    return { className };
  };

  const handleSelectSlot = (slotInfo) => {
    setActiveDate(slotInfo.start);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = 'var(--color-primary)'; 
    if (event.type === 'drive') backgroundColor = '#10b981'; // Emerald
    if (event.type === 'interview') backgroundColor = '#8b5cf6'; // Violet
    if (event.type === 'result') backgroundColor = '#f59e0b'; // Amber
    
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.85rem',
        fontWeight: 'bold',
        padding: '3px 10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    };
  };

  const Layout = user?.role === 'admin' ? AdminLayout : StudentLayout;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 font-display">Placement Calendar</h2>
                <p className="text-slate-500">Track all recruitment activities in one place.</p>
            </div>
            {user?.role === 'admin' && (
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 btn-modern"
                >
                    <Plus size={20} /> Add Event
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {/* Sidebar: Filters & Upcoming */}
           <div className="lg:col-span-1 space-y-6">
               {/* Filters Card */}
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm card-modern">
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Filter size={18} className="text-primary"/> Filters</h3>
                   <div className="space-y-3">
                       {[
                           { id: 'drive', label: 'Placement Drives', color: 'text-emerald-500 bg-emerald-50' },
                           { id: 'interview', label: 'Interviews', color: 'text-violet-500 bg-violet-50' },
                           { id: 'result', label: 'Results', color: 'text-amber-500 bg-amber-50' },
                           { id: 'other', label: 'General Events', color: 'text-primary bg-primary/10' }
                       ].map(filter => (
                           <label key={filter.id} className="flex items-center gap-3 cursor-pointer group">
                               <input 
                                   type="checkbox" 
                                   checked={activeFilters.includes(filter.id)}
                                   onChange={(e) => {
                                       if(e.target.checked) setActiveFilters([...activeFilters, filter.id]);
                                       else setActiveFilters(activeFilters.filter(f => f !== filter.id));
                                   }}
                                   className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                               />
                               <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 flex-1">{filter.label}</span>
                               <span className={`w-3 h-3 rounded-full ${filter.color.split(' ')[1]}`}></span>
                           </label>
                       ))}
                   </div>
               </div>

               {/* Upcoming Events Card */}
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm card-modern">
                   <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-primary"/> Upcoming</h3>
                   <div className="space-y-4">
                       {events
                           .filter(e => new Date(e.start) >= new Date() && activeFilters.includes(e.type))
                           .sort((a,b) => new Date(a.start) - new Date(b.start))
                           .slice(0, 4)
                           .map(event => (
                               <div 
                                   key={event._id} 
                                   onClick={() => setSelectedEvent(event)}
                                   className="p-4 rounded-2xl border border-slate-50 hover:border-primary/20 hover:bg-primary/5 cursor-pointer transition-all group"
                               >
                                   <div className="flex items-start justify-between mb-1">
                                       <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-primary transition-colors">{event.type}</span>
                                       <span className="text-xs font-semibold text-slate-500">{moment(event.start).format('MMM D')}</span>
                                   </div>
                                   <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{event.title}</h4>
                               </div>
                           ))
                       }
                       {events.filter(e => new Date(e.start) >= new Date() && activeFilters.includes(e.type)).length === 0 && (
                           <p className="text-center text-sm text-slate-400 italic py-4">No upcoming events.</p>
                       )}
                   </div>
               </div>
           </div>

           {/* Calendar Container */}
           <div className="lg:col-span-3 flex flex-col gap-4">
               <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[700px] calendar-container">
                   {loading ? (
                       <div className="h-full flex items-center justify-center text-slate-400">
                           <div className="skeleton-box w-full h-full rounded-2xl"></div>
                       </div>
                   ) : (
                       <Calendar
                           className="custom-calendar-ui"
                           localizer={localizer}
                           events={events.filter(e => activeFilters.includes(e.type))}
                           date={currentDate}
                           onNavigate={(newDate) => setCurrentDate(newDate)}
                           startAccessor="start"
                           endAccessor="end"
                           style={{ height: '100%' }}
                           eventPropGetter={eventStyleGetter}
                           dayPropGetter={dayPropGetter}
                           selectable={true}
                           onSelectSlot={handleSelectSlot}
                           onSelectEvent={(event) => setSelectedEvent(event)}
                           components={{ toolbar: CustomToolbar }}
                           views={['month']}
                       />
                   )}
               </div>
           </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 relative">
                  <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                      <X size={20} />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                          selectedEvent.type === 'drive' ? 'bg-emerald-500' :
                          selectedEvent.type === 'interview' ? 'bg-violet-500' :
                          selectedEvent.type === 'result' ? 'bg-amber-500' : 'bg-primary'
                      }`}>
                          <Info size={24} />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-slate-900">{selectedEvent.title}</h3>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{selectedEvent.type}</span>
                      </div>
                  </div>

                  <div className="space-y-4 mb-8">
                      <div className="p-4 bg-slate-50 rounded-2xl">
                          <p className="text-sm font-semibold text-slate-500 mb-1">Timing</p>
                          <p className="text-sm font-bold text-slate-900">
                              {moment(selectedEvent.start).format('MMMM Do YYYY, h:mm a')} - {moment(selectedEvent.end).format('h:mm a')}
                          </p>
                      </div>
                      {selectedEvent.description && (
                          <div className="p-4 bg-slate-50 rounded-2xl">
                              <p className="text-sm font-semibold text-slate-500 mb-1">Description</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{selectedEvent.description}</p>
                          </div>
                      )}
                  </div>

                  {user?.role === 'admin' && selectedEvent.type === 'other' && (
                      <button 
                        onClick={() => handleDeleteEvent(selectedEvent._id)}
                        className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-all mt-4"
                      >
                          <Trash2 size={18} /> Delete Event
                      </button>
                  )}

                  {user?.role === 'student' && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                          {selectedEvent.type === 'drive' && (
                              <button onClick={() => {navigate('/student/dashboard'); window.scrollTo(0,0)}} className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all btn-modern">
                                  <Briefcase size={18} /> View Placement Drives
                              </button>
                          )}
                          {selectedEvent.type === 'interview' && (
                              <button onClick={() => navigate('/student/interviews')} className="w-full py-4 bg-violet-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 hover:bg-violet-600 transition-all btn-modern">
                                  <Video size={18} /> Go to My Interviews
                              </button>
                          )}
                          {(selectedEvent.type === 'result' || selectedEvent.type === 'other') && (
                              <button onClick={() => navigate('/student/dashboard')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all btn-modern">
                                  <ArrowRight size={18} /> Go to Dashboard
                              </button>
                          )}
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-900">Add New Event</h3>
                      <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                          <X size={20} />
                      </button>
                  </div>

                  <form onSubmit={handleCreateEvent} className="space-y-5">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
                          <input 
                              type="text" required 
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              placeholder="e.g. Result Announcement - TCS"
                              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                          <textarea 
                              rows="3"
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              placeholder="Add details about the event..."
                              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                          ></textarea>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                              <input 
                                  type="datetime-local" required
                                  value={formData.start}
                                  onChange={(e) => setFormData({...formData, start: e.target.value})}
                                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                              <input 
                                  type="datetime-local" required
                                  value={formData.end}
                                  onChange={(e) => setFormData({...formData, end: e.target.value})}
                                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Event Type</label>
                          <select 
                              value={formData.type}
                              onChange={(e) => setFormData({...formData, type: e.target.value})}
                              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          >
                              <option value="other">General Event</option>
                              <option value="result">Result Announcement</option>
                              <option value="drive">Drive Reminder</option>
                          </select>
                      </div>

                      <button type="submit" className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all mt-4">
                          Create Event
                      </button>
                  </form>
              </div>
          </div>
      )}
    </Layout>
  );
};

export default PlacementCalendar;
