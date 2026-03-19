import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Briefcase,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';

const StudentInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/interviews/student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInterviews(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <StudentLayout>
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-900 font-display">Interview Schedule</h2>
                <p className="text-slate-500">View and join your upcoming recruitment rounds.</p>
            </div>

                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center gap-6">
                                    <div className="skeleton-box w-16 h-16 rounded-2xl flex-shrink-0"></div>
                                    <div className="flex-1 space-y-4">
                                        <div className="skeleton-box h-6 w-1/3"></div>
                                        <div className="skeleton-box h-4 w-1/4"></div>
                                    </div>
                                    <div className="skeleton-box h-12 w-32 rounded-2xl"></div>
                                </div>
                            ))}
                        </div>
                    ) : interviews.length > 0 ? interviews.map(item => (
                        <div key={item._id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                <Calendar size={120} />
                            </div>

                            <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10 w-full pl-6 border-l-2 border-slate-100 py-2">
                                {/* Timeline UI Custom CSS */}
                                <div className={`absolute -left-[11px] top-6 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
                                    item.result === 'selected' ? 'bg-emerald-500' :
                                    item.result === 'rejected' ? 'bg-rose-500' : 'bg-primary'
                                }`}></div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                            {item.round}
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                            item.result === 'selected' ? 'bg-emerald-50 text-emerald-600' : 
                                            item.result === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                            'bg-slate-100 text-slate-500'
                                        }`}>
                                            {item.result === 'pending' ? item.status : item.result}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{item.driveId?.driveName}</h3>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(item.interviewDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={16} /> {new Date(item.interviewDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {item.meetingLink ? (
                                        <button 
                                            onClick={() => window.open(item.meetingLink, '_blank')}
                                            className="px-8 py-4 btn-modern bg-gradient-to-r from-primary to-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                        >
                                            <Video size={20} /> Join Interview
                                        </button>
                                    ) : (
                                        <div className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-medium border border-slate-100">
                                            Link Pending
                                        </div>
                                    )}
                                </div>
                            </div>

                            {item.status === 'completed' && (
                                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <CheckCircle size={16} className="text-emerald-500" /> This interview was completed.
                                    </p>
                                    {item.result !== 'pending' && (
                                        <p className="text-sm font-bold">
                                            Result: <span className={item.result === 'selected' ? 'text-emerald-600' : 'text-rose-600'}>{item.result.toUpperCase()}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="p-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-100 shadow-sm card-modern">
                            <div className="w-24 h-24 bg-primary/5 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Calendar size={48} className="opacity-80" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No Interviews Scheduled</h3>
                            <p className="text-slate-500 max-w-sm mb-8">You haven't been scheduled for any interviews yet. They will appear here once a company selects your profile.</p>
                            <button 
                                onClick={() => navigate('/student/dashboard')} 
                                className="px-8 py-4 btn-modern bg-slate-900 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-slate-900/20"
                            >
                                <Briefcase size={20} /> Browse Drives
                            </button>
                        </div>
                    )}
                </div>
           </StudentLayout>
    );
};

export default StudentInterviews;
