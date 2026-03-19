import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  Cell
} from 'recharts';

import axios from 'axios';
import { Download, FileText, Table, File } from 'lucide-react';

const stats = [
  { label: 'Total Students', value: '1,284', icon: <Users />, color: 'bg-blue-500', trend: '+12%' },
  { label: 'Total Companies', value: '48', icon: <Building2 />, color: 'bg-indigo-500', trend: '+5%' },
  { label: 'Placement Drives', value: '32', icon: <Briefcase />, color: 'bg-purple-500', trend: '+8%' },
  { label: 'Students Placed', value: '842', icon: <CheckCircle />, color: 'bg-emerald-500', trend: '82%' },
  { label: 'Highest Salary', value: '42 LPA', icon: <DollarSign />, color: 'bg-amber-500', trend: 'Microsoft' },
  { label: 'Average Salary', value: '8.4 LPA', icon: <TrendingUp />, color: 'bg-rose-500', trend: '+1.2L' },
];

const batchData = [
  { batch: '2021', placed: 420, total: 500 },
  { batch: '2022', placed: 480, total: 550 },
  { batch: '2023', placed: 520, total: 600 },
  { batch: '2024', placed: 580, total: 650 },
];

const hiringData = [
  { name: 'Google', count: 12 },
  { name: 'Amazon', count: 18 },
  { name: 'Microsoft', count: 15 },
  { name: 'TCS', count: 45 },
  { name: 'Infosys', count: 38 },
  { name: 'Accenture', count: 32 },
];

const trendData = [
  { month: 'Jan', drives: 4 },
  { month: 'Feb', drives: 6 },
  { month: 'Mar', drives: 12 },
  { month: 'Apr', drives: 18 },
  { month: 'May', drives: 10 },
  { month: 'Jun', drives: 8 },
];

const AdminDashboard = () => {
  const [showExportOptions, setShowExportOptions] = React.useState(false);
  const [exportType, setExportType] = React.useState('students');

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/reports/${exportType}?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = format === 'excel' ? 'xlsx' : format;
      const typeName = exportType.charAt(0).toUpperCase() + exportType.slice(1);
      link.setAttribute('download', `${typeName}_Report_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setShowExportOptions(false);
    } catch (err) {
      console.error("Export failed", err);
      alert('Error exporting report. Ensure you are logged in as admin.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Dashboard Overview</h2>
            <p className="text-slate-500">Welcome back, here's what's happening today.</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)} 
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
            >
              <Download size={18} /> Export Reports
            </button>
            
            {showExportOptions && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-5 z-50">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Generate Report</h3>
                
                <div className="mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Report Type</label>
                  <select 
                    value={exportType}
                    onChange={(e) => setExportType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-primary focus:border-primary block p-2.5 outline-none font-medium"
                  >
                    <option value="students">Student Placements</option>
                    <option value="companies">Company Records</option>
                    <option value="drives">Placement Drives</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleExport('csv')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-colors group">
                      <Table size={20} className="mb-1 text-slate-400 group-hover:text-primary" />
                      <span className="text-xs font-bold">CSV</span>
                    </button>
                    <button onClick={() => handleExport('excel')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors group">
                      <FileSpreadsheet size={20} className="mb-1 text-slate-400 group-hover:text-emerald-600" />
                      <span className="text-xs font-bold">Excel</span>
                    </button>
                    <button onClick={() => handleExport('pdf')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors group">
                      <FileText size={20} className="mb-1 text-slate-400 group-hover:text-rose-600" />
                      <span className="text-xs font-bold">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(stat.icon, { size: 24 })}
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <div className="flex items-end justify-between mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Placement by Batch */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Placement Statistics by Batch</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="batch" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="placed" fill="url(#colorPlaced)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(255, 65%, 60%)" stopOpacity={1}/>
                      <stop offset="95%" stopColor="hsl(255, 65%, 40%)" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Monthly Drive Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="drives" stroke="hsl(180, 70%, 45%)" fill="url(#colorDrives)" strokeWidth={3} />
                  <defs>
                    <linearGradient id="colorDrives" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(180, 70%, 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(180, 70%, 45%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Company Hiring */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Major Hiring Companies</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hiringData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {hiringData.map((entry, index) => (
                      <Cell key={index} fill={index % 2 === 0 ? 'hsl(255, 65%, 60%)' : 'hsl(180, 70%, 45%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
