import React from 'react';
import StudentLayout from '../components/StudentLayout';
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
  AreaChart, 
  Area,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';

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

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">Dashboard Overview</h2>
          <p className="text-slate-500">Welcome back, {user?.name || 'Student'}! Here's what's happening globally today.</p>
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
    </StudentLayout>
  );
};

export default StudentDashboard;
