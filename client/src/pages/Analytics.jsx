import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar
} from 'lucide-react';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState({
        placementRatio: '0%',
        avgCTC: '0 LPA',
        totalCompanies: 0,
        totalOffers: 0,
        placementData: [],
        industryData: [],
        driveTrends: []
    });

    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setAnalyticsData(res.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch analytics', err);
                toast.error('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const handleExport = async () => {
        const toastId = toast.loading('Generating report...');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/reports/students?format=excel', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Student_Placement_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast.success('Report generated successfully!', { id: toastId });
        } catch (err) {
            toast.error('Failed to generate report', { id: toastId });
        }
    };

    return (
        <AdminLayout>
            <Toaster position="top-right" />
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-display">Placement Analytics</h2>
                        <p className="text-slate-500">Deep dive into recruitment trends and student performance metrics.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-slate-200 rounded-xl flex items-center p-1">
                            <button className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-lg">Real-time</button>
                            <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900">Historical</button>
                        </div>
                        <button onClick={handleExport} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all">
                            <Download size={18} /> Generate Report
                        </button>
                    </div>
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Placement Ratio', value: analyticsData.placementRatio, icon: <Award className="text-emerald-600" />, bg: 'bg-emerald-50' },
                        { title: 'Avg. CTC', value: analyticsData.avgCTC, icon: <TrendingUp className="text-primary" />, bg: 'bg-indigo-50' },
                        { title: 'Total Companies', value: analyticsData.totalCompanies, icon: <Briefcase className="text-purple-600" />, bg: 'bg-purple-50' },
                        { title: 'Total Offers', value: analyticsData.totalOffers, icon: <Users className="text-pink-600" />, bg: 'bg-pink-50' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                            <h4 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h4>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Placement Trends Chart */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp size={20} className="text-primary" /> Hiring Statistics by Year
                            </h3>
                            <button className="text-slate-400 hover:text-slate-900"><Filter size={18} /></button>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData.placementData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="placed" fill="#6366f1" radius={[6, 6, 0, 0]} name="Placed Students" barSize={40} />
                                    <Bar dataKey="total" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Total Eligible" barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Industrial Breakdown */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase size={20} className="text-purple-600" /> Sector Wise Breakdown
                            </h3>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analyticsData.industryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analyticsData.industryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Drive Trends */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Calendar size={20} className="text-pink-600" /> Monthly Drive Trends (Active vs Target)
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData.driveTrends}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Analytics;
