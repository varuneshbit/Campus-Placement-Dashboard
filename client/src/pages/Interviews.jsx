import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Briefcase,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Interviews = () => {
    const location = useLocation();
    const [interviews, setInterviews] = useState([]);
    const [drives, setDrives] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        driveId: '',
        studentId: '',
        round: '',
        interviewDate: '',
        meetingLink: ''
    });

    useEffect(() => {
        fetchData();
        // Check for query params to pre-fill modal
        const params = new URLSearchParams(location.search);
        const studentId = params.get('studentId');
        const driveId = params.get('driveId');
        if (studentId || driveId) {
            setFormData(prev => ({
                ...prev,
                studentId: studentId || '',
                driveId: driveId || ''
            }));
            setShowModal(true);
        }
    }, [location]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [intRes, driveRes, studRes] = await Promise.all([
                axios.get('/api/interviews', { headers: { Authorization: `Bearer ${token}` }}),
                axios.get('/api/drives', { headers: { Authorization: `Bearer ${token}` }}),
                axios.get('/api/auth/students', { headers: { Authorization: `Bearer ${token}` }}) // Simplified helper
            ]);
            setInterviews(intRes.data.data);
            setDrives(driveRes.data.data);
            setStudents(studRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleSchedule = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/interviews', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            fetchData();
            setFormData({ driveId: '', studentId: '', round: '', interviewDate: '', meetingLink: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Scheduling failed');
        }
    };

    const updateStatus = async (id, status, result) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/interviews/${id}`, { status, result }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert('Update failed');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-display">Interview Schedule</h2>
                        <p className="text-slate-500">Manage and track all scheduled interview rounds.</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
                    >
                        <Plus size={20} /> Schedule Interview
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900">Upcoming Interviews</h3>
                                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                    {interviews.length} Total
                                </span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {loading ? (
                                    <div className="space-y-4 p-6">
                                        {[1, 2, 3].map((n) => (
                                            <div key={n} className="flex items-center gap-4">
                                                <div className="skeleton-box w-12 h-12 rounded-2xl flex-shrink-0"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="skeleton-box h-4 w-1/3"></div>
                                                    <div className="skeleton-box h-3 w-1/4"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : interviews.length > 0 ? interviews.map(item => (
                                    <div key={item._id} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group card-modern/hover-only border-transparent hover:border-slate-100 my-1 rounded-2xl mx-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-bold shadow-inner">
                                                {item.studentId?.name?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.studentId?.name}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1.5"><Briefcase size={14} /> {item.driveId?.driveName}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className="text-primary font-bold tracking-wide uppercase text-[10px]">{item.round}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-bold text-slate-900">{new Date(item.interviewDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                                <p className="text-xs text-slate-500">{new Date(item.interviewDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="relative group/status">
                                                <button className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                                                    item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                    {item.status}
                                                </button>
                                                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl z-20 hidden group-status-hover:block p-2">
                                                    <button onClick={() => updateStatus(item._id, 'completed', 'pending')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 rounded-lg">Mark Completed</button>
                                                    <button onClick={() => updateStatus(item._id, 'scheduled', 'selected')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-emerald-50 text-emerald-600 rounded-lg">Mark Selected</button>
                                                    <button onClick={() => updateStatus(item._id, 'scheduled', 'rejected')} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-rose-50 text-rose-600 rounded-lg">Mark Rejected</button>
                                                </div>
                                            </div>
                                            {item.meetingLink && (
                                                <button onClick={() => window.open(item.meetingLink, '_blank')} className="p-2.5 text-primary bg-primary/5 hover:bg-primary-dark hover:text-white rounded-xl transition-all shadow-sm" title="Join Meeting">
                                                    <Video size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-20 flex flex-col items-center text-center text-slate-400">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                            <Calendar size={32} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-1">No Interviews Scheduled</h4>
                                        <p className="text-sm">When you schedule interviews, they will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-primary" /> Active Statistics
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-sm text-slate-500">Scheduled Today</span>
                                    <span className="font-bold text-slate-900">{interviews.filter(i => new Date(i.interviewDate).toDateString() === new Date().toDateString()).length}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <span className="text-sm text-emerald-600 font-medium">Pending Results</span>
                                    <span className="font-bold text-emerald-700">{interviews.filter(i => i.result === 'pending').length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative overflow-hidden">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                            <X size={24} />
                        </button>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Schedule Interview</h3>
                        
                        <form onSubmit={handleSchedule} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Placement Drive</label>
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                    value={formData.driveId}
                                    onChange={(e) => setFormData({...formData, driveId: e.target.value})}
                                >
                                    <option value="">Select Drive</option>
                                    {drives.map(d => <option key={d._id} value={d._id}>{d.driveName}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Student</label>
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    required
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                >
                                    <option value="">Select Student</option>
                                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Round Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Technical 1"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        required
                                        value={formData.round}
                                        onChange={(e) => setFormData({...formData, round: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Date & Time</label>
                                    <input 
                                        type="datetime-local"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        required
                                        value={formData.interviewDate}
                                        onChange={(e) => setFormData({...formData, interviewDate: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Meeting Link (Optional)</label>
                                <input 
                                    type="url"
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={formData.meetingLink}
                                    onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all mt-4">
                                Confirm Schedule
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Interviews;
