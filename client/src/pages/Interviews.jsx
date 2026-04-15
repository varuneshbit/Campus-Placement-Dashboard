import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import Pagination from '../components/Pagination';
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
  ExternalLink,
  Pencil,
  Trash2,
  Users,
  Search,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ExcelJS from 'exceljs';

const Interviews = () => {
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Bulk Modal State
  const [bulkStep, setBulkStep] = useState(1);
  const [bulkDriveId, setBulkDriveId] = useState('');
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [bulkSelectedStudents, setBulkSelectedStudents] = useState([]);
  const [bulkSearch, setBulkSearch] = useState('');
  const [bulkFilter, setBulkFilter] = useState({ batch: '', department: '' });
  const [loadingEligible, setLoadingEligible] = useState(false);
  
  const [bulkConfig, setBulkConfig] = useState({
    startDate: '',
    startTime: '09:00',
    slotDuration: 30,
    round: '1',
    mode: 'Online'
  });

  const [editingInterview, setEditingInterview] = useState(null);
  const [deletingInterview, setDeletingInterview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    round: 1,
    mode: 'Online',
    status: 'scheduled',
    result: 'pending',
    feedback: ''
  });

  useEffect(() => {
    fetchData(1);
    // Check for query params to pre-fill modal
    const params = new URLSearchParams(location.search);
    const studentId = params.get('studentId');
    const driveId = params.get('driveId');
    if (studentId || driveId) {
      setSingleForm(prev => ({
        ...prev,
        selectedStudents: studentId ? [studentId] : [],
        driveId: driveId || ''
      }));
      setShowModal(true);
    }
  }, [location]);

  const fetchData = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const [intRes, driveRes, studRes] = await Promise.all([
        axios.get(`/api/interviews?page=${page}&limit=8`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/drives', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/students?limit=1000', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setInterviews(intRes.data.data || intRes.data.interviews || []);
      setPagination(intRes.data.pagination);
      setDrives(driveRes.data.data || []);
      setStudents(studRes.data.students || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Interviews');
    
    worksheet.columns = [
      { header: 'RollNumber', key: 'roll', width: 20 },
      { header: 'DriveName', key: 'drive', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 15 },
      { header: 'Round', key: 'round', width: 15 },
      { header: 'Mode', key: 'mode', width: 15 }
    ];

    worksheet.addRow({ roll: 'BTECH/CSE/2026/001', drive: 'Software Developer', date: '2026-05-15', time: '10:00', round: 'Technical', mode: 'Online' });
    worksheet.addRow({ roll: 'BTECH/IT/2026/042', drive: 'Systems Engineer', date: '2026-05-15', time: '11:30', round: 'HR', mode: 'Offline' });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Interview_Import_Template.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportFile(file);
    setImportResult(null);
    setImportPreview([]);
    
    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.worksheets[0];
      
      const preview = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        if (preview.length < 5) {
          preview.push({
            rollNumber: row.getCell(1).value?.toString() || '',
            driveName: row.getCell(2).value?.toString() || '',
            date: row.getCell(3).value?.toString() || '',
            time: row.getCell(4).value?.toString() || '',
            round: row.getCell(5).value?.toString() || '',
            mode: row.getCell(6).value?.toString() || ''
          });
        }
      });
      setImportPreview(preview);
    } catch (err) {
      toast.error('Failed to read Excel file preview');
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    setIsImporting(true);
    setImportResult(null);
    
    const formData = new FormData();
    formData.append('file', importFile);
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/interviews/import-excel', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setImportResult(res.data);
      if (res.data.created > 0) fetchData();
      toast.success(res.data.message || `Imported ${res.data.created} interviews`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed entirely');
    } finally {
      setIsImporting(false);
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

  const handleEditClick = (interview) => {
    let date;
    try {
      date = new Date(interview.interviewDate);
    } catch (err) {
      date = new Date();
    }
    setEditForm({
      scheduledDate: date.toISOString().split('T')[0],
      scheduledTime: date.toTimeString().slice(0, 5),
      round: interview.round || 1,
      mode: interview.mode || 'Online',
      status: interview.status || 'scheduled',
      result: interview.result || 'pending',
      feedback: interview.feedback || ''
    });
    setEditingInterview(interview);
    setShowEditModal(true);
  };

  const handleDeleteClick = (interview) => {
    setDeletingInterview(interview);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `/api/interviews/${editingInterview._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Ensure returning 'interview' which we sent as res.data.data
      const updatedInt = res.data.data || res.data.interview;
      setInterviews(prev =>
        prev.map(i => i._id === editingInterview._id ? updatedInt : i)
      );
      setShowEditModal(false);
      setEditingInterview(null);
      toast.success('Interview updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update interview');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/interviews/${deletingInterview._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInterviews(prev => prev.filter(i => i._id !== deletingInterview._id));
      setShowDeleteModal(false);
      setDeletingInterview(null);
      toast.success('Interview deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete interview');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchEligibleStudents = async (driveId) => {
    try {
      setLoadingEligible(true);
      const token = localStorage.getItem('token');
      const selectedDrive = drives.find(d => d._id === driveId);
      if (!selectedDrive) return;

      const params = new URLSearchParams();
      // Always pass driveId so only applicants of that drive are returned
      params.append('driveId', driveId);

      const res = await axios.get(`/api/students/eligible?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEligibleStudents(res.data.students || []);
    } catch (err) {
      toast.error('Failed to fetch eligible students');
    } finally {
      setLoadingEligible(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!bulkDriveId || bulkSelectedStudents.length === 0 || !bulkConfig.startDate || !bulkConfig.startTime) {
      toast.error('Please complete all fields to schedule.');
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseTime = new Date(`${bulkConfig.startDate}T${bulkConfig.startTime}`).getTime();
      
      const payload = bulkSelectedStudents.map((studentId, index) => {
        const slotTime = new Date(baseTime + index * bulkConfig.slotDuration * 60000);
        return {
          student: studentId,
          drive: bulkDriveId,
          scheduledDate: slotTime,
          round: bulkConfig.round || '1',
          mode: bulkConfig.mode || 'Online',
          status: 'scheduled',
          result: 'pending'
        };
      });

      const res = await axios.post('/api/interviews/bulk', 
        { interviews: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(res.data.message || 'Bulk interviews scheduled successfully');
      setShowBulkModal(false);
      fetchData();
      setBulkStep(1);
      setBulkDriveId('');
      setBulkSelectedStudents([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk scheduling failed');
    } finally {
      setActionLoading(false);
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 border-2 border-emerald-500 text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 hover:-translate-y-1 transition-all"
            >
              <FileSpreadsheet size={20} /> Import via Excel
            </button>
            <button
              onClick={() => {
                setBulkStep(1);
                setBulkDriveId('');
                setBulkSelectedStudents([]);
                setShowBulkModal(true);
              }}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
            >
              <Plus size={20} /> Schedule Interview
            </button>
          </div>
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
                        <p className="text-sm font-bold text-slate-900">{new Date(item.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-slate-500">{new Date(item.interviewDate).toLocaleDateString()}</p>
                      </div>
                      <div className="relative group/status">
                        <button className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
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
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit interview"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete interview"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
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

      {/* IMPORT EXCEL MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setShowImportModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full z-10 transition-colors">
              <X size={24} />
            </button>
            <div className="flex-shrink-0 mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Import via Excel</h3>
              <p className="text-sm text-slate-500">Upload a spreadsheet to bulk-schedule interviews across multiple drives and students.</p>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-6 custom-scrollbar">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 mb-1">Need the correct format?</h4>
                  <p className="text-sm text-emerald-700">Download our pre-configured template with example rows.</p>
                </div>
                <button 
                  onClick={downloadTemplate}
                  className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl shadow-sm border border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet size={18} /> Download Template
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:bg-slate-50 transition-colors relative group">
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-700 mb-1">
                  {importFile ? importFile.name : 'Click or drag file here to upload'}
                </h4>
                <p className="text-sm text-slate-500">Supports .xlsx and .xls formats</p>
              </div>

              {importPreview.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <Search size={18} className="text-slate-400" /> Preview First 5 Rows
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Roll Number</th>
                          <th className="px-4 py-3">Drive</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">Round</th>
                          <th className="px-4 py-3">Mode</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{row.rollNumber}</td>
                            <td className="px-4 py-3 text-slate-600">{row.driveName}</td>
                            <td className="px-4 py-3 text-slate-600">{row.date}</td>
                            <td className="px-4 py-3 text-slate-600">{row.time}</td>
                            <td className="px-4 py-3 text-slate-600">{row.round}</td>
                            <td className="px-4 py-3 text-slate-600">{row.mode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importResult && (
                <div className={`p-6 rounded-2xl border ${importResult.errors?.length > 0 && importResult.created === 0 ? 'bg-rose-50 border-rose-100' : 'bg-green-50 border-green-100'}`}>
                  <h4 className="font-bold text-slate-900 mb-2">Import Summary</h4>
                  <div className="flex gap-4 text-sm mb-4">
                    <span className="text-green-700 font-bold bg-green-100 px-3 py-1 rounded-full">{importResult.created} Created</span>
                    <span className="text-amber-700 font-bold bg-amber-100 px-3 py-1 rounded-full">{importResult.skipped} Skipped</span>
                    <span className="text-rose-700 font-bold bg-rose-100 px-3 py-1 rounded-full">{importResult.errors?.length || 0} Errors</span>
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                      {importResult.errors.map((err, idx) => (
                        <div key={idx} className="text-xs text-rose-600 bg-white px-3 py-2 rounded-lg border border-rose-100 flex items-start gap-2">
                          <span className="font-bold whitespace-nowrap">Row {err.row}:</span> {err.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 mt-4 flex-shrink-0">
              <button 
                onClick={handleImportSubmit} 
                disabled={!importFile || isImporting} 
                className="w-full py-5 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Import...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={20} />
                    Upload and Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INTERVIEW MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Edit Interview</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700 ml-1">Student</label>
                <div className="px-5 py-4 bg-slate-50 rounded-2xl text-slate-600 border border-slate-100 mt-2">
                  {editingInterview?.studentId?.name || 'Unknown Student'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Date</label>
                  <input
                    type="date"
                    value={editForm.scheduledDate}
                    onChange={e => setEditForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Time</label>
                  <input
                    type="time"
                    value={editForm.scheduledTime}
                    onChange={e => setEditForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Round</label>
                  <input
                    type="text"
                    value={editForm.round}
                    onChange={e => setEditForm(prev => ({ ...prev, round: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Mode</label>
                  <select
                    value={editForm.mode}
                    onChange={e => setEditForm(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all capitalize"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="deferred">Deferred</option>
                    <option value="no show">No Show</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Result</label>
                  <select
                    value={editForm.result}
                    onChange={e => setEditForm(prev => ({ ...prev, result: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all capitalize"
                  >
                    <option value="pending">Pending</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                    <option value="on hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Feedback <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={editForm.feedback}
                  onChange={e => setEditForm(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={2}
                  placeholder="Add interview feedback..."
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 size={24} className="text-rose-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Delete Interview</h3>
                <p className="text-sm text-slate-500 font-medium">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-600 mb-8 leading-relaxed">
              Are you sure you want to delete the interview for{' '}
              <span className="font-bold text-slate-900">
                {deletingInterview?.studentId?.name}
              </span>
              {' '}scheduled on{' '}
              <span className="font-bold text-slate-900">
                {deletingInterview?.interviewDate ? new Date(deletingInterview.interviewDate).toLocaleDateString() : ''}
              </span>?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50 transition-all"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK SCHEDULE MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setShowBulkModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-50 rounded-full z-10">
              <X size={24} />
            </button>
            <div className="flex-shrink-0 mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Bulk Schedule Interviews</h3>
              <div className="flex items-center gap-4 mt-4">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${bulkStep === step ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : bulkStep > step ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {bulkStep > step ? <CheckCircle size={16} className="text-emerald-600" /> : step}
                    </div>
                    {step < 3 && <div className={`w-12 h-1 transition-all ${bulkStep > step ? 'bg-emerald-100' : 'bg-slate-100'}`}></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
              {/* STEP 1: Select Drive */}
              {bulkStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-4">Step 1: Choose Placement Drive</h4>
                    <p className="text-sm text-slate-500 mb-4">Select the drive you want to schedule interviews for. We will automatically load the students who meet this drive's eligibility criteria.</p>
                  </div>
                  <div className="grid gap-3">
                    {drives.map(drive => (
                      <label key={drive._id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${bulkDriveId === drive._id ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}>
                        <div className="flex items-center gap-4">
                          <input 
                            type="radio" 
                            name="bulkDrive" 
                            className="w-5 h-5 text-primary focus:ring-primary/20" 
                            checked={bulkDriveId === drive._id}
                            onChange={() => setBulkDriveId(drive._id)}
                          />
                          <div>
                            <p className="font-bold text-slate-900">{drive.company?.name || drive.companyId?.companyName || drive.driveName}</p>
                            <p className="text-sm text-slate-500">{drive.jobRole} • Min CGPA: {drive.eligibility?.minCGPA || 0}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Select Students */}
              {bulkStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
                  <div className="flex-shrink-0">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Step 2: Select Students Who Applied</h4>
                    <p className="text-sm text-slate-500 mb-4">Found {eligibleStudents.length} students who applied for this drive.</p>
                    
                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:border-primary transition-all">
                          <Search size={18} className="text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search students by name or roll number..."
                            className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
                            value={bulkSearch}
                            onChange={(e) => setBulkSearch(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="bg-white border text-sm border-slate-200 rounded-xl px-4 py-3 focus:ring-primary/20 focus:border-primary outline-none"
                            value={bulkFilter.batch}
                            onChange={(e) => setBulkFilter({ ...bulkFilter, batch: e.target.value })}
                          >
                            <option value="">All Batches</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                            <option value="2027">2027</option>
                          </select>
                          <select
                            className="bg-white border text-sm border-slate-200 rounded-xl px-4 py-3 focus:ring-primary/20 focus:border-primary outline-none max-w-[120px]"
                            value={bulkFilter.department}
                            onChange={(e) => setBulkFilter({ ...bulkFilter, department: e.target.value })}
                          >
                            <option value="">All Branches</option>
                            <option value="CSE">CSE</option>
                            <option value="IT">IT</option>
                            <option value="ECE">ECE</option>
                            <option value="EEE">EEE</option>
                            <option value="MECH">MECH</option>
                            <option value="CIVIL">CIVIL</option>
                            <option value="BCA">BCA</option>
                            <option value="MCA">MCA</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={() => {
                        const filtered = eligibleStudents.filter(s => 
                          (bulkFilter.batch ? s.batch === bulkFilter.batch : true) &&
                          (bulkFilter.department ? s.branch === bulkFilter.department : true) &&
                          (s.name.toLowerCase().includes(bulkSearch.toLowerCase()) || 
                          (s.rollNumber && s.rollNumber.toLowerCase().includes(bulkSearch.toLowerCase())))
                        );
                        if (bulkSelectedStudents.length >= filtered.length && filtered.length > 0) {
                          setBulkSelectedStudents([]);
                        } else {
                          setBulkSelectedStudents([...new Set([...bulkSelectedStudents, ...filtered.map(s => s._id)])]);
                        }
                      }} className="w-full py-3 bg-slate-100 font-bold text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
                        Select / Deselect Generated Filter
                      </button>
                    </div>
                  </div>

                  {loadingEligible ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl p-2 max-h-[400px] custom-scrollbar">
                      {eligibleStudents.filter(s => 
                        (bulkFilter.batch ? s.batch === bulkFilter.batch : true) &&
                        (bulkFilter.department ? s.branch === bulkFilter.department : true) &&
                        (s.name.toLowerCase().includes(bulkSearch.toLowerCase()) || 
                        (s.rollNumber && s.rollNumber.toLowerCase().includes(bulkSearch.toLowerCase())))
                      ).map(s => (
                        <label key={s._id} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${bulkSelectedStudents.includes(s._id) ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded text-primary focus:ring-primary/20 border-slate-300"
                              checked={bulkSelectedStudents.includes(s._id)}
                              onChange={(e) => {
                                if (e.target.checked) setBulkSelectedStudents(prev => [...prev, s._id]);
                                else setBulkSelectedStudents(prev => prev.filter(id => id !== s._id));
                              }}
                            />
                            <div>
                              <p className="font-bold text-slate-900">{s.name}</p>
                              <p className="text-xs text-slate-500 font-medium">{s.rollNumber} • {s.branch} • CGPA: {s.cgpa}</p>
                            </div>
                          </div>
                          {bulkSelectedStudents.includes(s._id) && bulkConfig.startDate && bulkConfig.startTime && (
                            <div className="text-xs font-bold text-primary bg-white px-3 py-1.5 rounded-lg border border-primary/20 shadow-sm">
                              {new Date(new Date(`${bulkConfig.startDate}T${bulkConfig.startTime}`).getTime() + bulkSelectedStudents.indexOf(s._id) * bulkConfig.slotDuration * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          )}
                        </label>
                      ))}
                      {eligibleStudents.length === 0 && !loadingEligible && (
                         <div className="p-8 text-center text-slate-500">No students who applied were found.</div>
                      )}
                    </div>
                  )}
                  <div className="text-right mt-2 font-bold text-primary">
                    {bulkSelectedStudents.length} Students Selected
                  </div>
                </div>
              )}

              {/* STEP 3: Configure Time Slots */}
              {bulkStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <h4 className="text-lg font-bold text-slate-800 mb-4">Step 3: Configure Interview Slots</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Start Date</label>
                        <input
                          type="date"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={bulkConfig.startDate}
                          onChange={e => setBulkConfig({...bulkConfig, startDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">First Interview Start Time</label>
                        <input
                          type="time"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          value={bulkConfig.startTime}
                          onChange={e => setBulkConfig({...bulkConfig, startTime: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Duration per Student</label>
                        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200">
                          {[15, 30, 45, 60].map(mins => (
                            <button
                              key={mins}
                              type="button"
                              onClick={() => setBulkConfig({ ...bulkConfig, slotDuration: mins })}
                              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${bulkConfig.slotDuration === mins ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              {mins}m
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Round Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Technical 1"
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={bulkConfig.round}
                            onChange={(e) => setBulkConfig({ ...bulkConfig, round: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Mode</label>
                          <select
                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={bulkConfig.mode}
                            onChange={(e) => setBulkConfig({ ...bulkConfig, mode: e.target.value })}
                          >
                            <option>Online</option>
                            <option>Offline</option>
                            <option>Hybrid</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-3xl h-full flex flex-col justify-center">
                      <h4 className="font-bold text-indigo-900 mb-6 text-xl font-display">Live Preview</h4>
                      
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                          <span className="text-slate-500 font-medium">Total Interviews</span>
                          <span className="text-xl font-bold text-indigo-600">{bulkSelectedStudents.length}</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                          <span className="text-slate-500 font-medium">Total Duration</span>
                          <span className="text-xl font-bold text-indigo-600">
                            {Math.floor((bulkSelectedStudents.length * bulkConfig.slotDuration) / 60)}h {(bulkSelectedStudents.length * bulkConfig.slotDuration) % 60}m
                          </span>
                        </div>

                        {bulkConfig.startDate && bulkConfig.startTime && bulkSelectedStudents.length > 0 ? (
                          <div className="bg-white p-4 rounded-2xl space-y-3 shadow-sm">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">First Slot:</span>
                              <span className="font-bold text-slate-900">{new Date(`${bulkConfig.startDate}T${bulkConfig.startTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Last Slot Ends:</span>
                              <span className="font-bold text-slate-900">{new Date(new Date(`${bulkConfig.startDate}T${bulkConfig.startTime}`).getTime() + (bulkSelectedStudents.length * bulkConfig.slotDuration) * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/50 border border-transparent p-4 rounded-2xl text-center text-indigo-400 text-sm font-medium">
                            Set start date & time to see slot projection
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-2 flex-shrink-0 bg-white">
              {bulkStep > 1 ? (
                <button 
                  onClick={() => setBulkStep(prev => prev - 1)} 
                  className="px-6 py-4 font-bold text-slate-600 hover:bg-slate-50 rounded-2xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={20} /> Back
                </button>
              ) : <div></div>}
              
              {bulkStep < 3 ? (
                <button 
                  onClick={() => {
                     if (bulkStep === 1) {
                        if (!bulkDriveId) return toast.error('Please select a drive');
                        fetchEligibleStudents(bulkDriveId);
                     }
                     if (bulkStep === 2) {
                        if (bulkSelectedStudents.length === 0) return toast.error('Please select at least one student');
                     }
                     setBulkStep(prev => prev + 1);
                  }}
                  className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
                >
                  Next Step <ChevronRight size={20} />
                </button>
              ) : (
                <button 
                  onClick={handleBulkSubmit}
                  disabled={actionLoading || !bulkConfig.startDate || bulkSelectedStudents.length === 0}
                  className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Scheduling...' : `Schedule ${bulkSelectedStudents.length} Interviews`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Interviews;
