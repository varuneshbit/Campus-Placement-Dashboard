import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import StudentLayout from '../components/StudentLayout';
import { Trophy, Award, Star, TrendingUp, User, Briefcase, GraduationCap } from 'lucide-react';

const Leaderboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('cgpa');
    const [data, setData] = useState({ topCGPA: [], topInterviews: [], topPlaced: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/leaderboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const Layout = user?.role === 'admin' ? AdminLayout : StudentLayout;

    const renderRankCard = (item, index, type) => {
        const studentInfo = type === 'cgpa' ? item.user : (type === 'interviews' ? item.student : item.student);
        const profile = type === 'cgpa' ? item : (type === 'interviews' ? item.profile : item.profile);
        
        return (
            <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all relative overflow-hidden">
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
                            {studentInfo?.name?.[0] || 'S'}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors capitalize">{studentInfo?.name || 'Unknown Student'}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><GraduationCap size={14} className="text-primary/70" /> {profile?.branch || 'General'}</span>
                                {type === 'placed' && <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"><Briefcase size={12} /> {item.company}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right z-10">
                    {type === 'cgpa' && (
                        <div>
                            <p className="text-xl font-black text-slate-900">{item.cgpa}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">CGPA</p>
                        </div>
                    )}
                    {type === 'interviews' && (
                        <div>
                            <p className="text-xl font-black text-primary">{item.count}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cleared</p>
                        </div>
                    )}
                    {type === 'placed' && (
                        <div>
                            <p className="text-xl font-black text-emerald-600">{item.salary}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">LPA</p>
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
                            { id: 'cgpa', label: 'Academic', icon: <GraduationCap size={16} /> },
                            { id: 'interviews', label: 'Technicals', icon: <TrendingUp size={16} /> },
                            { id: 'placed', label: 'Placements', icon: <Briefcase size={16} /> }
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

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                        {activeTab === 'cgpa' && data.topCGPA.map((item, idx) => renderRankCard(item, idx, 'cgpa'))}
                        {activeTab === 'interviews' && data.topInterviews.map((item, idx) => renderRankCard(item, idx, 'interviews'))}
                        {activeTab === 'placed' && data.topPlaced.map((item, idx) => renderRankCard(item, idx, 'placed'))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Leaderboard;
