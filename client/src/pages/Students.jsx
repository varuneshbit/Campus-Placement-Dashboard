import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  Award,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import axios from 'axios';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Mock data
        setStudents([
            {
                id: 1,
                name: 'Alex Johnson',
                email: 'alex.j@university.edu',
                roll: 'CS2021001',
                batch: '2024',
                branch: 'CSE',
                cgpa: 9.2,
                status: 'Placed',
                avatar: 'AJ'
            },
            {
                id: 2,
                name: 'Sarah Williams',
                email: 'sarah.w@university.edu',
                roll: 'EC2021045',
                batch: '2024',
                branch: 'ECE',
                cgpa: 8.7,
                status: 'Eligible',
                avatar: 'SW'
            },
            {
                id: 3,
                name: 'Michael Chen',
                email: 'm.chen@university.edu',
                roll: 'ME2021012',
                batch: '2024',
                branch: 'ME',
                cgpa: 8.1,
                status: 'Applied',
                avatar: 'MC'
            }
        ]);
        setLoading(false);
    }, []);

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-display">Student Management</h2>
                        <p className="text-slate-500">Monitor academic performance and placement status of all students.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
                            <Download size={18} /> Export Data
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
                        <select className="bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 font-medium">
                            <option>All Batches</option>
                            <option>2024</option>
                            <option>2025</option>
                        </select>
                        <select className="bg-slate-50 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 text-slate-600 font-medium">
                            <option>All Branches</option>
                            <option>CSE</option>
                            <option>ECE</option>
                            <option>ME</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
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
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-primary font-bold">
                                                {student.avatar}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-none">{student.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">{student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                                            {student.roll}
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
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                            student.status === 'Placed' ? 'bg-emerald-50 text-emerald-600' : 
                                            student.status === 'Applied' ? 'bg-indigo-50 text-indigo-600' :
                                            'bg-slate-50 text-slate-500'
                                        }`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="View Profile">
                                                <LayoutDashboard size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Send Email">
                                                <Mail size={18} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all">
                                                <MoreVertical size={18} />
                                            </button>
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
