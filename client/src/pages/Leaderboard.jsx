import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import StudentLayout from '../components/StudentLayout';
import Pagination from '../components/Pagination';
import { Trophy, Award, Star, TrendingUp, User, Briefcase, GraduationCap, X, Filter, Mail } from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('academic');
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [branchFilter, setBranchFilter] = useState('');
    const [batchFilter, setBatchFilter] = useState('');
    const [viewingStudent, setViewingStudent] = useState(null);

    const fetchLeaderboard = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `/api/leaderboard?page=${page}&limit=10&type=${activeTab}&batch=${batchFilter}&branch=${branchFilter}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setLeaderboard(res.data.students || res.data.data || []);
            setPagination(res.data.pagination);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchLeaderboard(1);
    }, [activeTab, branchFilter, batchFilter]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchLeaderboard(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const Layout = user?.role === 'admin' ? AdminLayout : StudentLayout;

    const renderRankCard = (item, index, type) => {
        return (
            <div 
                key={index} 
                onClick={() => setViewingStudent(item)}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all relative overflow-hidden cursor-pointer"
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-600' : 'bg-transparent'
                }`}></div>
                
                <div className="flex items-center gap-6 z-10">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-bold text-lg ${
                        index === 0 ? 'bg-amber-100 text-amber-600' : 
                        index === 1 ? 'bg-slate-100 text-slate-500' : 
                        index === 2 ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-400'
                    }`}>
                        #{index + 1}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold uppercase shadow-inner">
                            {item.name?.[0] || 'S'}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors capitalize">{item.name || 'Unknown Student'}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><GraduationCap size={14} className="text-primary/70" /> {item.branch || 'General'}</span>
                                {type === 'placements' && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"><Briefcase size={12} /> Placed</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right z-10">
                    {type === 'academic' && (
                        <div>
                            <p className="text-xl font-black text-slate-900">{item.cgpa}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CGPA</p>
                        </div>
                    )}
                    {type === 'placements' && (
                        <div>
                            <div className="flex items-center justify-center bg-emerald-100 text-emerald-700 w-10 h-10 rounded-full">
                              <Star size={16} className="fill-current" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-display">Hall of Fame</h2>
                        <p className="text-slate-500">Celebrating our top performers and their achievements.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                        {[
                            { id: 'academic', label: 'Academic', icon: <GraduationCap size={16} /> },
                            { id: 'placements', label: 'Placements', icon: <Briefcase size={16} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                    activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 relative z-10 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mr-2">
                        <Filter size={16} className="text-primary"/> Filters:
                    </div>
                    <select 
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 text-slate-700 min-w-[150px] font-medium"
                    >
                        <option value="">All Departments</option>
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="ME">ME</option>
                        <option value="CE">CE</option>
                        <option value="EEE">EEE</option>
                        <option value="IT">IT</option>
                    </select>
                    <select 
                        value={batchFilter}
                        onChange={(e) => setBatchFilter(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 text-slate-700 min-w-[150px] font-medium"
                    >
                        <option value="">All Batches</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : leaderboard.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                        {leaderboard.map((item, idx) => renderRankCard(item, ((currentPage - 1) * 10) + idx, activeTab))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500">No data available</div>
                )}
                
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>

            {/* Student Details Modal */}
            {viewingStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative z-[61]">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2"><User className="text-primary" size={20}/> Student Profile</h3>
                            <button onClick={() => setViewingStudent(null)} className="p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-xl transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-6 mb-2">
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-3xl uppercase shadow-inner">
                                    {viewingStudent.name?.[0] || 'S'}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-slate-900 capitalize">{viewingStudent.name || 'Unknown'}</h4>
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <p className="text-slate-500 font-medium">{viewingStudent.rollNumber || 'No Roll Number'}</p>
                                        {viewingStudent.email && (
                                            <a href={`mailto:${viewingStudent.email}`} className="inline-flex items-center w-fit gap-1.5 text-sm text-primary hover:text-primary-dark font-medium transition-colors bg-primary/5 px-2.5 py-1 rounded-lg">
                                                <Mail size={14} /> {viewingStudent.email}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-sm font-semibold text-slate-500 mb-1">Department</p>
                                    <p className="font-bold text-slate-900">{viewingStudent.branch || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-sm font-semibold text-slate-500 mb-1">Batch</p>
                                    <p className="font-bold text-slate-900">{viewingStudent.batch || 'N/A'}</p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                    <p className="text-sm font-semibold text-amber-600 mb-1">CGPA</p>
                                    <p className="font-bold text-amber-700">{viewingStudent.cgpa || 'N/A'}</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <p className="text-sm font-semibold text-emerald-600 mb-1">Status</p>
                                    <p className="font-bold text-emerald-700">{viewingStudent.placementStatus || 'Unplaced'}</p>
                                </div>
                            </div>
                            {(viewingStudent.skills && viewingStudent.skills.length > 0) && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-sm font-semibold text-slate-500 mb-3">Skills & Technologies</p>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingStudent.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium border border-slate-200">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Leaderboard;
