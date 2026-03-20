import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Briefcase, 
  CheckCircle, 
  MapPin, 
  DollarSign, 
  Zap,
  ClipboardList,
  Building2
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';

const StudentDrives = () => {
  const [drives, setDrives] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [driveRes, intRes] = await Promise.all([
        axios.get('/api/drives', { headers: { Authorization: `Bearer ${token}` }}),
        axios.get('/api/interviews/student', { headers: { Authorization: `Bearer ${token}` }})
      ]);
      setDrives(driveRes.data.data);
      setInterviews(intRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApply = async (driveId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/drives/${driveId}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Applied successfully!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed');
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">Placement Drives</h2>
          <p className="text-slate-500">Explore new opportunities and track your applications.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Briefcase size={24}/></div>
              <div><p className="text-sm text-slate-500">Applied Drives</p><p className="text-2xl font-bold">{drives.filter(d => d.applicants.some(a => a.studentId === user.id)).length}</p></div>
           </div>
           <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Zap size={24}/></div>
              <div><p className="text-sm text-slate-500">Open Opportunities</p><p className="text-2xl font-bold">{drives.filter(d => d.registrationStatus === 'open').length}</p></div>
           </div>
           <div 
             onClick={() => navigate('/student/interviews')}
             className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-500 transition-all"
           >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><Calendar size={24}/></div>
              <div><p className="text-sm text-slate-500">Upcoming Interviews</p><p className="text-2xl font-bold">{interviews.filter(i => i.status === 'scheduled').length}</p></div>
           </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <ClipboardList size={22} className="text-indigo-600" /> Eligible Placement Drives
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <p>Loading drives...</p>
            ) : drives.map(drive => {
              const isApplied = drive.applicants.some(a => a.studentId === user.id);
              return (
                <div key={drive._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{drive.driveName}</h4>
                      <p className="text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                        <Building2 size={16} /> {drive.companyId?.companyName}
                      </p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl">
                       <Briefcase size={20} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 mb-8">
                     <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="text-slate-400" /> {drive.companyId?.location}
                     </div>
                     <div className="flex items-center gap-2 text-sm text-emerald-600 font-bold">
                        <DollarSign size={16} /> {drive.salary}
                     </div>
                     <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={16} className="text-slate-400" /> {new Date(drive.date).toLocaleDateString()}
                     </div>
                     <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle size={16} className="text-slate-400" /> CGPA: {drive.eligibility?.minCGPA}+
                     </div>
                  </div>

                  <button 
                    disabled={isApplied || drive.registrationStatus !== 'open'}
                    onClick={() => handleApply(drive._id)}
                    className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                      isApplied 
                        ? 'bg-emerald-50 text-emerald-600 cursor-default' 
                        : drive.registrationStatus === 'open'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:-translate-y-1'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isApplied ? (
                      <><CheckCircle size={20} /> Applied Successfully</>
                    ) : drive.registrationStatus === 'open' ? (
                      <><Zap size={20} /> Apply Now</>
                    ) : (
                      'Registration Closed'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDrives;
