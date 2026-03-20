import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, CheckCircle, RefreshCcw, Zap, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ResumeManagement = () => {
    const [resume, setResume] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/students/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.data.resumeURL) {
                setResume(res.data.data.resumeURL);
            }
            if (res.data.data.resumeAnalysis) {
                setAnalysisResult(res.data.data.resumeAnalysis);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('resume', file);

        setUploading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/students/profile/upload-resume', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            setResume(res.data.data);
            setMessage('Resume uploaded successfully!');
            toast.success('Resume uploaded successfully!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Upload failed';
            setMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = () => {
        if (!resume) return;
        window.open(`http://localhost:5000${resume}`, '_blank');
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/resume/analyze', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalysisResult(res.data.data);
            setMessage('Analysis complete!');
            toast.success('Resume Analysis complete!');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to analyze resume.';
            setMessage(errorMsg);
            toast.error(errorMsg);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                    <FileText size={24} className="text-indigo-600" /> Resume Management
                </h3>
            </div>

            {/* Upload Area & Controls */}
            {resume ? (
                <div className="flex flex-col md:flex-row items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                    <div className="flex flex-1 items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">Current Resume Active</p>
                            <p className="text-sm text-slate-500">Synced to your profile (PDF/DOCX)</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={handleAnalyze}
                            disabled={analyzing || !resume}
                            className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl transition-all shadow-sm ${
                                analyzing || !resume 
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20 hover:-translate-y-0.5'
                            }`}
                        >
                            <Zap size={18} className={analyzing ? "animate-pulse" : ""} /> 
                            {analyzing ? 'Analyzing with AI...' : (analysisResult ? 'Re-analyze' : 'AI Analyze')}
                        </button>
                        
                        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl">
                            <button 
                                onClick={handleDownload}
                                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Download"
                            >
                                <Download size={18} />
                            </button>
                            <div className="w-px h-5 bg-slate-200"></div>
                            <label className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Replace">
                                <RefreshCcw size={18} />
                                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx" disabled={uploading} />
                            </label>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto group-hover:text-indigo-500 group-hover:bg-indigo-100 transition-all">
                        <Upload size={32} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">No Resume Uploaded</p>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">Upload your academic resume (PDF or DOCX max 5MB) to begin applying for placement drives and get AI analysis.</p>
                    </div>
                    <div className="flex justify-center gap-3 mt-4">
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer">
                            {uploading ? 'Uploading...' : 'Upload Resume'}
                            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx" disabled={uploading} />
                        </label>
                        <button disabled className="px-6 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed flex items-center gap-2">
                            <Zap size={18} /> AI Analyze
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-2 text-sm font-bold ${message.includes('failed') || message.includes('missing') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    {message.includes('failed') ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    {message}
                </div>
            )}

            {/* AI Analysis Result Section */}
            {analysisResult && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="border-t border-slate-100 pt-8 mt-2"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                            <Zap size={20} />
                        </div>
                        <h4 className="text-2xl font-bold text-slate-900 font-display">AI Analysis Report</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Score Card */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center text-center"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
                            
                            <h5 className="font-bold text-slate-300 mb-2 relative z-10 tracking-widest uppercase text-sm">ATS Match Score</h5>
                            
                            <div className="relative z-10 my-4 flex items-end justify-center">
                                <span className="text-6xl font-black">{analysisResult.score || 0}</span>
                                <span className="text-2xl text-slate-400 font-bold mb-1 ml-1">/100</span>
                            </div>
                            
                            <div className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden relative z-10">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${analysisResult.score || 0}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className={`h-full rounded-full ${
                                        analysisResult.score >= 80 ? 'bg-emerald-400' : 
                                        analysisResult.score >= 50 ? 'bg-amber-400' : 'bg-red-400'
                                    }`}
                                ></motion.div>
                            </div>
                        </motion.div>

                        <div className="lg:col-span-2 space-y-6">
                            {/* Strengths & Weaknesses Grids */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <motion.div 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6"
                                >
                                    <h5 className="font-bold text-emerald-800 flex items-center gap-2 mb-4">
                                        <TrendingUp size={18} /> Core Strengths
                                    </h5>
                                    <ul className="space-y-3">
                                        {analysisResult.strengths?.length > 0 ? analysisResult.strengths.map((s, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5"></div>
                                                {s}
                                            </li>
                                        )) : <li className="text-sm text-slate-500">No major strengths identified.</li>}
                                    </ul>
                                </motion.div>

                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-rose-50/50 border border-rose-100 rounded-2xl p-6"
                                >
                                    <h5 className="font-bold text-rose-800 flex items-center gap-2 mb-4">
                                        <AlertCircle size={18} /> Weaknesses
                                    </h5>
                                    <ul className="space-y-3">
                                        {analysisResult.weaknesses?.length > 0 ? analysisResult.weaknesses.map((w, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5"></div>
                                                {w}
                                            </li>
                                        )) : <li className="text-sm text-slate-500">No major weaknesses identified!</li>}
                                    </ul>
                                </motion.div>
                            </div>

                            {/* Missing Skills */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-6"
                            >
                                <h5 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Recommended Skills to Add</h5>
                                <div className="flex flex-wrap gap-2">
                                    {analysisResult.missingSkills?.length > 0 ? analysisResult.missingSkills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg shadow-sm">
                                            + {skill}
                                        </span>
                                    )) : <span className="text-sm text-slate-500">Your skill list looks comprehensive based on standard IT profiles.</span>}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Suggestions Section */}
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
                    >
                        <h5 className="font-bold text-indigo-900 flex items-center gap-2 mb-4">
                            <Lightbulb size={20} className="text-indigo-600" /> Actionable Suggestions
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysisResult.suggestions?.length > 0 ? analysisResult.suggestions.map((sug, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-indigo-50 shadow-sm flex gap-3 items-start">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{sug}</p>
                                </div>
                            )) : <p className="text-sm text-slate-500">Your resume is perfectly tailored.</p>}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default ResumeManagement;
