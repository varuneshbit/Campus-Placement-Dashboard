import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Users, Search, Filter, Download, UserPlus, UploadCloud,
  Mail, Phone, GraduationCap, Award, MoreVertical, LayoutDashboard, Database
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [filterBatch, setFilterBatch] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    
    // For file upload
    const fileInputRef = useRef(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` },
                params: { 
                    branch: filterBranch === 'All Branches' ? '' : filterBranch, 
                    batch: filterBatch === 'All Batches' ? '' : filterBatch, 
                    search: searchTerm 
                }
            });
            setStudents(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch students');
            setLoading(false);
        }
    };

    // Fast robust search and fetching
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchStudents();
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterBranch, filterBatch]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading('Uploading Excel file...');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/students/bulk-upload', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success(res.data.message || 'Upload successful', { id: toastId });
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed', { id: toastId });
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleExport = async () => {
        const toastId = toast.loading('Preparing download...');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/students/export', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'students.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success('Export started', { id: toastId });
        } catch (err) {
            toast.error('Export failed', { id: toastId });
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/students/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Status updated to ${newStatus}`);
            fetchStudents();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleBlockToggle = async (id, currentIsBlocked) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = currentIsBlocked ? 'unblock' : 'block';
            await axios.put(`http://localhost:5000/api/students/${id}/${endpoint}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(currentIsBlocked ? 'Student unblocked successfully' : 'Student blocked successfully');
            fetchStudents();
        } catch (err) {
            toast.error('Failed to update block status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this student record completely?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/students/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Student deleted');
            fetchStudents();
        } catch (err) {
            toast.error('Failed to delete student');
        }
    };

    return (
        <AdminLayout>
            <Toaster position="top-right" />
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-display">Student Management</h2>
                        <p className="text-slate-500">Monitor academic performance and placement status of all students.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                        >
                            <Download size={18} /> Export Data
                        </button>
                        
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-5 py-3 rounded-xl font-bold hover:bg-emerald-100 transition-all"
                        >
                            <UploadCloud size={18} /> Upload Excel
                        </button>
                        
                        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                            <UserPlus size={18} /> Add Student
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, roll number, or branch..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <select 
                            value={filterBatch} 
                            onChange={(e) => setFilterBatch(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 font-medium"
                        >
                            <option value="">All Batches</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                        <select 
                            value={filterBranch} 
                            onChange={(e) => setFilterBranch(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 font-medium"
                        >
                            <option value="">All Branches</option>
                            <option value="CSE">CSE</option>
                            <option value="ECE">ECE</option>
                            <option value="ME">ME</option>
                            <option value="CE">CE</option>
                            <option value="EEE">EEE</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No.</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">CGPA</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                // Adding loading skeletons
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-24 bg-slate-200 rounded"></div>
                                                    <div className="h-3 w-32 bg-slate-100 rounded"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><div className="h-6 w-20 bg-slate-200 rounded-lg"></div></td>
                                        <td className="px-6 py-5"><div className="h-4 w-12 bg-slate-200 rounded"></div></td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-2.5 bg-slate-200 rounded-full"></div>
                                                <div className="h-4 w-6 bg-slate-200 rounded"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5"><div className="h-6 w-16 bg-slate-200 rounded-full"></div></td>
                                        <td className="px-6 py-5"><div className="h-8 w-24 bg-slate-200 rounded-lg"></div></td>
                                    </tr>
                                ))
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Database className="w-12 h-12 text-slate-300 mb-4" />
                                            <p className="text-lg font-medium text-slate-900">No students found</p>
                                            <p className="text-sm">Try adjusting your filters or search terms.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : students.map(student => (
                                <tr key={student._id} className={`hover:bg-slate-50/50 transition-all group ${openDropdownId === student._id ? 'relative z-50' : 'relative z-0'}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary font-bold">
                                                {student.user?.name ? student.user.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-none">{student.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500 mt-1">{student.user?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                            {student.rollNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600 font-medium">{student.branch}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary" 
                                                    style={{ width: `${(student.cgpa / 10) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">{student.cgpa}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {student.isBlocked ? (
                                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                                Blocked
                                            </span>
                                        ) : (
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                                                (student.placementStatus || 'Not Placed') === 'Placed' 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                                {student.placementStatus || 'Not Placed'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 transition-opacity ${openDropdownId === student._id ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="View Profile">
                                                <LayoutDashboard size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Send Email">
                                                <Mail size={18} />
                                            </button>
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setOpenDropdownId(openDropdownId === student._id ? null : student._id)}
                                                    className={`p-2 rounded-lg transition-all ${openDropdownId === student._id ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                
                                                {openDropdownId === student._id && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden py-1">
                                                        <button 
                                                            onClick={() => {
                                                                handleStatusChange(student._id, (student.placementStatus || 'Not Placed') === 'Placed' ? 'Not Placed' : 'Placed');
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <Award size={16} className={`${(student.placementStatus || 'Not Placed') === 'Placed' ? 'text-slate-400' : 'text-emerald-500'}`} />
                                                            Mark as {(student.placementStatus || 'Not Placed') === 'Placed' ? 'Not Placed' : 'Placed'}
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                handleBlockToggle(student._id, student.isBlocked);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                                        >
                                                            {student.isBlocked ? <CheckCircle size={16} className="text-indigo-500" /> : <XCircle size={16} className="text-rose-500" />}
                                                            {student.isBlocked ? 'Unblock Student' : 'Block Student'}
                                                        </button>
                                                        <div className="h-px bg-slate-100 my-1"></div>
                                                        <button 
                                                            onClick={() => {
                                                                handleDelete(student._id);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                                        >
                                                            <XCircle size={16} /> Delete Record
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Students;
