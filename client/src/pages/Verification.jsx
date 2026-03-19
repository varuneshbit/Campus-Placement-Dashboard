import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  FileCheck, 
  ShieldCheck, 
  User, 
  Search, 
  Filter, 
  ArrowRight,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from 'lucide-react';

const Verification = () => {
    const [pendingRequests, setPendingRequests] = useState([
        {
            id: 1,
            student: 'Robert Fox',
            type: 'Documents',
            submittedAt: '2 hours ago',
            files: ['MarkSheet_10.pdf', 'MarkSheet_12.pdf', 'ID_Proof.pdf'],
            status: 'Pending'
        },
        {
            id: 2,
            student: 'Cody Fisher',
            type: 'Profile Edit',
            submittedAt: '5 hours ago',
            files: [],
            status: 'In Review'
        }
    ]);

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-display">Document Verification</h2>
                        <p className="text-slate-500">Verify student identities and academic credentials.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Main Verification List */}
                    <div className="xl:col-span-2 space-y-6">
                        {pendingRequests.map(request => (
                            <div key={request.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all border-l-4 border-l-primary">
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary border border-slate-100">
                                                <User size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">{request.student}</h3>
                                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                    <Clock size={14} /> Submitted {request.submittedAt}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 ${
                                            request.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-primary/5 text-primary'
                                        }`}>
                                            <ShieldCheck size={16} /> {request.status}
                                        </div>
                                    </div>

                                    {request.files.length > 0 && (
                                        <div className="space-y-3 mb-8">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enclosed Documents</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {request.files.map((file, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-white hover:border-primary transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                                                                <FileText size={20} />
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-700">{file}</span>
                                                        </div>
                                                        <ExternalLink size={16} className="text-slate-300 group-hover:text-primary" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                                        <button className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all border border-transparent">
                                            Request Changes
                                        </button>
                                        <button className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all">
                                            Reject
                                        </button>
                                        <button className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2">
                                            <CheckCircle size={18} /> Approve All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Verification Stats */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <FileCheck size={100} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-6">Verification Health</h3>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-500">Verified Students</span>
                                        <span className="font-bold">84%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: '84%' }}></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                        <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Total Verified</p>
                                        <p className="text-2xl font-bold text-emerald-700 text-slate-900">1,204</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                                        <p className="text-xs text-amber-600 font-bold uppercase mb-1">Requires Attention</p>
                                        <p className="text-2xl font-bold text-amber-700 text-slate-900">12</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                             <h3 className="text-xl font-bold mb-4">Security Policy</h3>
                             <p className="text-white/60 text-sm mb-6 leading-relaxed italic">"All primary identity documents must be verified within 72 hours of submission to maintain recruitment eligibility."</p>
                             <div className="flex items-center gap-3 text-xs font-bold text-primary">
                                 <ShieldCheck size={16} /> 256-BIT ENCRYPTION ACTIVE
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Verification;
