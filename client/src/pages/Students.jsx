import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import Pagination from '../components/Pagination';
import {
    Users, Search, Filter, Download, UserPlus, UploadCloud,
    Mail, Phone, GraduationCap, Award, MoreVertical, LayoutDashboard, Database,
    Plus, X, CheckCircle, XCircle, AlertCircle, ChevronRight, Activity, Linkedin, Github
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [filterBatch, setFilterBatch] = useState('All Batches');
    const [filterAccountStatus, setFilterAccountStatus] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Drawer and profile viewing state
    const [viewingStudent, setViewingStudent] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);

    // Add Student state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '', email: '', rollNumber: '', branch: '', batch: '', cgpa: ''
    });

    // For file upload
    const fileInputRef = useRef(null);

    const fetchStudents = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page,
                    limit: 10,
                    branch: filterBranch === 'All Branches' ? '' : filterBranch,
                    batch: filterBatch === 'All Batches' ? '' : filterBatch,
                    accountStatus: filterAccountStatus === '' ? undefined : filterAccountStatus,
                    search: searchTerm
                }
            });
            setStudents(res.data.students || res.data.data || []);
            setPagination(res.data.pagination);
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
            fetchStudents(1);
            setCurrentPage(1);
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterBranch, filterBatch, filterAccountStatus]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchStudents(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getAccountBadge = (student) => {
        if (student.isBlocked) {
            return (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
                    Blocked
                </span>
            );
        }
        if (!student.isRegistered) {
            return (
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                    Pending signup
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                Active
            </span>
        );
    };

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
            const params = new URLSearchParams({
                branch: filterBranch === 'All Branches' ? '' : filterBranch,
                batch: filterBatch === 'All Batches' ? '' : filterBatch,
                accountStatus: filterAccountStatus || '',
                search: searchTerm
            }).toString();

            const res = await axios.get(`http://localhost:5000/api/students/export?${params}`, {
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
            fetchStudents(currentPage);
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
            if (viewingStudent?._id === id) {
                setViewingStudent(prev => ({ ...prev, isBlocked: !currentIsBlocked }));
            }
            fetchStudents(currentPage);
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
            if (viewingStudent?._id === id) {
                setShowDrawer(false);
            }
            fetchStudents(currentPage);
        } catch (err) {
            toast.error('Failed to delete student');
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Adding student...');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/students', newStudent, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Student added successfully', { id: toastId });
            setShowAddModal(false);
            setNewStudent({ name: '', email: '', rollNumber: '', branch: '', batch: '', cgpa: '' });
            fetchStudents(currentPage);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add student', { id: toastId });
        }
    };

    const handleViewProfile = (student) => {
        setViewingStudent(student);
        setShowDrawer(true);
        setOpenDropdownId(null);
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

                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
                        >
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
                            value={filterAccountStatus}
                            onChange={(e) => setFilterAccountStatus(e.target.value)}
                            className="bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 font-medium"
                        >
                            <option value="">All Accounts</option>
                            <option value="registered">Registered</option>
                            <option value="pending">Pending Signup</option>
                            <option value="blocked">Blocked</option>
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

                {/* Batch Scrollable Pills */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {['All Batches', '2022', '2023', '2024', '2025', '2026'].map((batchOption) => (
                        <button
                            key={batchOption}
                            onClick={() => setFilterBatch(batchOption)}
                            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${filterBatch === batchOption
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {batchOption}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Roll No.</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Account</th>
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
                                        <td className="px-6 py-5"><div className="h-6 w-16 bg-slate-200 rounded-full"></div></td>
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
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary font-bold overflow-hidden">
                                                {student.profileImageURL ? (
                                                    <img src={`http://localhost:5000${student.profileImageURL}`} className="w-full h-full object-cover" alt="Profile" />
                                                ) : (
                                                    student.name ? student.name.charAt(0).toUpperCase() : (student.user?.name ? student.user.name.charAt(0).toUpperCase() : 'U')
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-none">{student.name || student.user?.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-500 mt-1">{student.email || student.user?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                            {student.rollNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getAccountBadge(student)}
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
                                    <td className="px-6 py-4 relative group/tooltip">
                                        {student.isBlocked ? (
                                            <>
                                                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 cursor-help flex items-center gap-1 w-max">
                                                    <AlertCircle size={12} /> Blocked
                                                </span>
                                                <div className="absolute top-full left-6 mt-1 hidden group-hover/tooltip:block bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl w-48 z-50">
                                                    This student is blocked from participating in placement drives and activities automatically.
                                                </div>
                                            </>
                                        ) : (
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border w-max block ${(student.placementStatus || 'Not Placed') === 'Placed'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}>
                                                {student.placementStatus || 'Not Placed'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-2 transition-opacity ${openDropdownId === student._id ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'}`}>
                                            <button
                                                onClick={() => handleViewProfile(student)}
                                                className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                title="View Profile"
                                            >
                                                <LayoutDashboard size={18} />
                                            </button>
                                            <div className="relative z-50">
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

                <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>

            {/* Profile Side Drawer */}
            {showDrawer && viewingStudent && (
                <>
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => setShowDrawer(false)}></div>
                    <div className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform overflow-y-auto">
                        {/* Drawer Header */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-slate-900">Student Profile</h2>
                            <button onClick={() => setShowDrawer(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Profile Content */}
                        <div className="p-6 space-y-8">
                            {/* Blocked Banner */}
                            {viewingStudent.isBlocked && (
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
                                    <AlertCircle className="text-rose-500 mt-0.5 flex-shrink-0" size={20} />
                                    <div>
                                        <h4 className="text-rose-700 font-bold">Account Blocked</h4>
                                        <p className="text-rose-600 text-sm mt-1">This student cannot participate in any placement drives. Unblock to restore access.</p>
                                    </div>
                                </div>
                            )}

                            {/* Top Card */}
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-primary font-bold text-3xl overflow-hidden shadow-inner">
                                    {viewingStudent.profileImageURL ? (
                                        <img src={`http://localhost:5000${viewingStudent.profileImageURL}`} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        viewingStudent.name ? viewingStudent.name.charAt(0).toUpperCase() : (viewingStudent.user?.name ? viewingStudent.user.name.charAt(0).toUpperCase() : 'U')
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{viewingStudent.name || viewingStudent.user?.name || 'Unknown'}</h3>
                                    <p className="text-slate-500 font-medium">{viewingStudent.email || viewingStudent.user?.email || 'N/A'}</p>
                                    <div className="flex items-center gap-2 mt-2 font-medium text-sm">
                                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{viewingStudent.branch}</span>
                                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{viewingStudent.batch}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Placements & CGPA Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1 font-medium">
                                        <Award size={16} className="text-indigo-500" /> CGPA
                                    </div>
                                    <span className="text-2xl font-black text-slate-900">{viewingStudent.cgpa}</span>
                                </div>
                                <div className={`p-4 rounded-2xl border ${(viewingStudent.placementStatus || 'Not Placed') === 'Placed'
                                        ? 'bg-emerald-50 border-emerald-100'
                                        : 'bg-amber-50 border-amber-100'
                                    }`}>
                                    <div className={`flex items-center gap-2 mb-1 font-medium ${(viewingStudent.placementStatus || 'Not Placed') === 'Placed' ? 'text-emerald-700' : 'text-amber-700'
                                        }`}>
                                        <Activity size={16} /> Status
                                    </div>
                                    <span className={`text-xl font-bold ${(viewingStudent.placementStatus || 'Not Placed') === 'Placed' ? 'text-emerald-700' : 'text-amber-700'
                                        }`}>
                                        {viewingStudent.placementStatus || 'Not Placed'}
                                    </span>
                                </div>
                            </div>

                            {/* Details List */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                                    <h4 className="font-bold text-slate-900">Academic & Contact Information</h4>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    <div className="px-5 py-3 flex justify-between items-center">
                                        <span className="text-slate-500 font-medium text-sm">Roll Number</span>
                                        <span className="text-slate-900 font-bold">{viewingStudent.rollNumber}</span>
                                    </div>
                                    <div className="px-5 py-3 flex justify-between items-center">
                                        <span className="text-slate-500 font-medium text-sm">10th Percentage</span>
                                        <span className="text-slate-900 font-bold">{viewingStudent.tenthPercentage ? `${viewingStudent.tenthPercentage}%` : 'N/A'}</span>
                                    </div>
                                    <div className="px-5 py-3 flex justify-between items-center">
                                        <span className="text-slate-500 font-medium text-sm">12th Percentage</span>
                                        <span className="text-slate-900 font-bold">{viewingStudent.twelfthPercentage ? `${viewingStudent.twelfthPercentage}%` : 'N/A'}</span>
                                    </div>
                                    <div className="px-5 py-3 flex justify-between items-center">
                                        <span className="text-slate-500 font-medium text-sm">Active Backlogs</span>
                                        <span className={`font-bold ${viewingStudent.backlogs > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{viewingStudent.backlogs || 0}</span>
                                    </div>
                                    <div className="px-5 py-3 flex justify-between items-center">
                                        <span className="text-slate-500 font-medium text-sm">Phone Number</span>
                                        <span className="text-slate-900 font-bold">{viewingStudent.phone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Tag Section */}
                            <div>
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <CheckCircle size={18} className="text-emerald-500" /> Skills & Technical
                                </h4>
                                {viewingStudent.skills && viewingStudent.skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {viewingStudent.skills.map(s => (
                                            <span key={s} className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-400 text-sm italic">No skills listed yet.</p>
                                )}
                            </div>

                            {/* Actions area inside drawer */}
                            <div className="pt-4 mt-8 border-t border-slate-100 gap-3 grid grid-cols-2">
                                <button
                                    onClick={() => handleStatusChange(viewingStudent._id, (viewingStudent.placementStatus || 'Not Placed') === 'Placed' ? 'Not Placed' : 'Placed')}
                                    className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${(viewingStudent.placementStatus || 'Not Placed') === 'Placed'
                                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                >
                                    {(viewingStudent.placementStatus || 'Not Placed') === 'Placed' ? 'Unmark Placed' : 'Mark Placed'}
                                </button>
                                <button
                                    onClick={() => handleBlockToggle(viewingStudent._id, viewingStudent.isBlocked)}
                                    className="py-3 px-4 bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
                                >
                                    {viewingStudent.isBlocked ? 'Unblock Account' : 'Block Profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative z-[61]">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 font-display">Add New Student</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-xl transition-all shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddStudent} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                                    <input required type="text" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="e.g. John Doe" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                                    <input required type="email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="e.g. john@college.edu" />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number *</label>
                                    <input required type="text" value={newStudent.rollNumber} onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="e.g. CSE2024001" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Branch *</label>
                                    <select required value={newStudent.branch} onChange={e => setNewStudent({...newStudent, branch: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all bg-white">
                                        <option value="">Select Branch</option>
                                        <option value="CSE">CSE</option>
                                        <option value="ECE">ECE</option>
                                        <option value="ME">ME</option>
                                        <option value="CE">CE</option>
                                        <option value="EEE">EEE</option>
                                        <option value="IT">IT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Batch (Year) *</label>
                                    <input required type="text" value={newStudent.batch} onChange={e => setNewStudent({...newStudent, batch: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="e.g. 2024" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">CGPA</label>
                                    <input type="number" step="0.01" min="0" max="10" value={newStudent.cgpa} onChange={e => setNewStudent({...newStudent, cgpa: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="0.0 - 10.0" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all">Add Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Students;
