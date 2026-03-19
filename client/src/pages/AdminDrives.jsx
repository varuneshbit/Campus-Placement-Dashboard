import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Plus, 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  X,
  Building2,
  Users2,
  Download,
  DollarSign
} from 'lucide-react';
import axios from 'axios';

const AdminDrives = () => {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [currentApplicants, setCurrentApplicants] = useState([]);
  const [formData, setFormData] = useState({
    driveName: '',
    companyId: '',
    jobRole: '',
    salary: '',
    date: '',
    batch: '',
    eligibility: { minCGPA: 0, branches: [] },
    registrationStatus: 'upcoming'
  });

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, []);

  const fetchDrives = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/drives', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrives(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenApplicants = async (driveId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/drives/${driveId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentApplicants(res.data.data);
      setShowApplicantsModal(true);
    } catch (err) {
      alert('Failed to fetch applicants');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/drives', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchDrives();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create drive');
    }
  };

  const toggleStatus = async (drive) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = drive.registrationStatus === 'open' ? 'closed' : 'open';
      await axios.put(`http://localhost:5000/api/drives/${drive._id}`, 
        { registrationStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDrives();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Placement Drives</h2>
            <p className="text-slate-500">Schedule and manage recruitment events.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md"
          >
            <Plus size={20} /> Create Drive
          </button>
        </div>

        {/* Drive Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loading ? (
             <p>Loading drives...</p>
          ) : drives.map((drive) => (
            <div key={drive._id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-primary rounded-xl flex items-center justify-center font-bold text-lg">
                    {drive.companyId?.companyName?.[0] || 'C'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{drive.driveName}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Building2 size={14} /> {drive.companyId?.companyName}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  drive.registrationStatus === 'open' ? 'bg-emerald-100 text-emerald-700' : 
                  drive.registrationStatus === 'closed' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {drive.registrationStatus}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  {new Date(drive.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={16} className="text-slate-400" />
                  Batch: {drive.batch}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle size={16} className="text-slate-400" />
                  CGPA: {drive.eligibility?.minCGPA || 0}+
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <DollarSign size={16} />
                  {drive.salary}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => handleOpenApplicants(drive._id)}
                  className="flex-1 bg-slate-50 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <Users size={18} /> {drive.applicants?.length || 0} Applicants
                </button>
                <button 
                  onClick={() => toggleStatus(drive)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    drive.registrationStatus === 'open' ? 'text-rose-600 border border-rose-100 hover:bg-rose-50' : 'text-emerald-600 border border-emerald-100 hover:bg-emerald-50'
                  }`}
                >
                   {drive.registrationStatus === 'open' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                   {drive.registrationStatus === 'open' ? 'Close Reg' : 'Open Reg'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Drive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 font-display">Create Placement Drive</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-xl transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Drive Name</label>
                  <input type="text" required value={formData.driveName} onChange={(e) => setFormData({...formData, driveName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                  <select required value={formData.companyId} onChange={(e) => setFormData({...formData, companyId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all">
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c._id} value={c._id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Job Role</label>
                  <input type="text" required value={formData.jobRole} onChange={(e) => setFormData({...formData, jobRole: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Salary Package</label>
                  <input type="text" required value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Batch</label>
                  <input type="text" required placeholder="e.g. 2024" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Min CGPA</label>
                  <input type="number" step="0.1" required value={formData.eligibility.minCGPA} onChange={(e) => setFormData({...formData, eligibility: {...formData.eligibility, minCGPA: e.target.value}})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all">Create Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicantsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                <Users2 size={24} className="text-primary" /> Applicants
              </h3>
              <button onClick={() => setShowApplicantsModal(false)} className="p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-xl transition-all"><X size={20} /></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
               {currentApplicants.length === 0 ? (
                 <p className="text-center text-slate-500 py-10">No applicants yet.</p>
               ) : (
                 <div className="space-y-4">
                   {currentApplicants.map((app, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div>
                         <p className="font-bold text-slate-900">{app.studentId?.name}</p>
                         <p className="text-sm text-slate-500">{app.studentId?.email}</p>
                       </div>
                       <div className="flex items-center gap-3">
                         <button 
                           onClick={() => window.open(`/admin/interviews?studentId=${app.studentId?._id}&driveId=${drive._id}`, '_self')}
                           className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                           title="Schedule Interview"
                         >
                            <Calendar size={18} />
                         </button>
                         <button 
                           onClick={() => window.open(`http://localhost:5000${app.studentId?.resumeURL}`, '_blank')}
                           className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                           title="Download Resume"
                         >
                            <Download size={18} />
                         </button>
                         <div className="text-xs text-slate-400">
                           {new Date(app.appliedAt).toLocaleDateString()}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDrives;
