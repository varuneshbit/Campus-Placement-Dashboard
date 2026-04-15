import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Briefcase, 
  CheckCircle, 
  MapPin, 
  DollarSign, 
  Zap,
  ClipboardList,
  Building2,
  X,
  Info
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';

const StudentDrives = () => {
  const [drives, setDrives] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [driveRes, intRes, profileRes] = await Promise.all([
        axios.get('/api/drives', { headers: { Authorization: `Bearer ${token}` }}),
        axios.get('/api/interviews/student', { headers: { Authorization: `Bearer ${token}` }}),
        axios.get('/api/students/profile', { headers: { Authorization: `Bearer ${token}` }})
      ]);
      setDrives(driveRes.data.data);
      setInterviews(intRes.data.data);
      setStudentProfile(profileRes.data.data);
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
              const minCGPA = drive.eligibility?.minCGPA || 0;
              const isEligible = studentProfile ? studentProfile.cgpa >= minCGPA : false;
              
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

                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => {
                        setSelectedDrive(drive);
                        setShowModal(true);
                      }}
                      className="flex-1 py-4 rounded-2xl font-bold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-2"
                    >
                      <Info size={18} /> Details
                    </button>
                    <button 
                      disabled={isApplied || drive.registrationStatus !== 'open' || !isEligible}
                      onClick={() => handleApply(drive._id)}
                      className={`flex-[1.5] py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                        isApplied 
                          ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100' 
                          : !isEligible 
                          ? 'bg-rose-50 text-rose-500 cursor-not-allowed border border-rose-100'
                          : drive.registrationStatus === 'open'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:-translate-y-1'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      {isApplied ? (
                        <><CheckCircle size={18} /> Applied</>
                      ) : !isEligible ? (
                        <><X size={18} /> Not Eligible</>
                      ) : drive.registrationStatus === 'open' ? (
                        <><Zap size={18} /> Apply Now</>
                      ) : (
                        'Closed'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drive Details Modal */}
      {showModal && selectedDrive && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative z-[61]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                 <h3 className="text-2xl font-bold text-slate-900 font-display">{selectedDrive.driveName}</h3>
                 <p className="text-indigo-600 font-semibold flex items-center gap-1.5 mt-1"><Building2 size={16}/> {selectedDrive.companyId?.companyName}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-xl transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 md:col-span-1">
                     <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Briefcase size={16}/> Job Role</p>
                     <p className="font-bold text-slate-900">{selectedDrive.jobRole || 'Not Specified'}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 col-span-2 md:col-span-1">
                     <p className="text-sm font-semibold text-emerald-600 mb-1 flex items-center gap-1.5"><DollarSign size={16}/> Salary Package</p>
                     <p className="font-bold text-emerald-700">{selectedDrive.salary}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 md:col-span-1 flex items-center justify-between">
                     <div>
                       <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Calendar size={16}/> Drive Date</p>
                       <p className="font-bold text-slate-900">{new Date(selectedDrive.date).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 md:col-span-1 flex items-center justify-between">
                     <div>
                       <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><CheckCircle size={16}/> Eligibility</p>
                       <p className="font-bold text-slate-900">{selectedDrive.eligibility?.minCGPA}+ CGPA | Batch: {selectedDrive.batch}</p>
                     </div>
                  </div>
               </div>

               <div>
                 <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><ClipboardList size={18} className="text-indigo-500"/> Job Description</h4>
                 <div className="p-5 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed text-sm whitespace-pre-wrap border border-slate-100">
                    {selectedDrive.jobDescription || 'No description provided.'}
                 </div>
               </div>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row items-center justify-end gap-3">
               <button onClick={() => setShowModal(false)} className="w-full md:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-white hover:text-slate-900 transition-all">Close Details</button>
               {selectedDrive && studentProfile && !selectedDrive.applicants.some(a => a.studentId === user.id) && selectedDrive.registrationStatus === 'open' && studentProfile.cgpa >= (selectedDrive.eligibility?.minCGPA || 0) && (
                  <button 
                    onClick={() => {
                        handleApply(selectedDrive._id); 
                        setShowModal(false);
                    }} 
                    className="w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                  >
                     <Zap size={18}/> Apply Now
                  </button>
               )}
               {selectedDrive && studentProfile && !selectedDrive.applicants.some(a => a.studentId === user.id) && selectedDrive.registrationStatus === 'open' && studentProfile.cgpa < (selectedDrive.eligibility?.minCGPA || 0) && (
                  <button disabled className="w-full md:w-auto px-6 py-3 rounded-xl bg-rose-50 text-rose-500 font-bold border border-rose-100 flex items-center justify-center gap-2 cursor-not-allowed">
                     <X size={18}/> Not Eligible (CGPA)
                  </button>
               )}
               {selectedDrive && selectedDrive.applicants.some(a => a.studentId === user.id) && (
                  <button disabled className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 flex items-center justify-center gap-2 cursor-default">
                     <CheckCircle size={18}/> Applied Successfully
                  </button>
               )}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentDrives;
