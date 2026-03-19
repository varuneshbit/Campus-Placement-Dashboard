import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Trash2, CheckCircle, RefreshCcw, Eye, Zap } from 'lucide-react';
import axios from 'axios';

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
            const res = await axios.post('/api/students/resume', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            setResume(res.data.data);
            setMessage('Resume uploaded successfully!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Upload failed');
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
        setAnalysisResult(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/resume/analyze', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalysisResult(res.data.data);
            setMessage('Analysis complete!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to analyze resume.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                    <FileText size={24} className="text-primary" /> Resume Management
                </h3>
            </div>

            {resume ? (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                        <div className="flex items-center gap-4 flex-1 w-full relative">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900">Your Current Resume</p>
                                <p className="text-sm text-slate-500">Stored as PDF/DOCX format</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto relative z-10">
                            <button 
                                onClick={handleAnalyze}
                                disabled={analyzing}
                                className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-all shadow-sm flex-1 md:flex-none justify-center ${
                                    analyzing 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                                }`}
                                title="Analyze with AI"
                            >
                                <Zap size={18} /> {analyzing ? 'Analyzing...' : 'AI Analyze'}
                            </button>
                            <button 
                                onClick={handleDownload}
                                className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all bg-white border border-slate-200"
                                title="Download Resume"
                            >
                                <Download size={20} />
                            </button>
                            <label className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer bg-white border border-slate-200" title="Replace Resume">
                                <RefreshCcw size={20} />
                                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx" />
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium bg-emerald-50 p-3 rounded-xl">
                        <CheckCircle size={18} />
                        Successfully synced with your profile
                    </div>

                    {/* AI Analysis Results Section */}
                    {analysisResult && (
                        <div className="mt-8 border-t border-slate-100 pt-8 animate-fade-in">
                            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Zap className="text-amber-500" size={20} /> AI Analysis Report
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <p className="text-white/80 font-medium mb-1 relative z-10">ATS Match Score</p>
                                    <div className="text-5xl font-black relative z-10">{analysisResult.score}<span className="text-2xl text-white/70">/100</span></div>
                                    <p className="text-white/80 text-xs mt-2 relative z-10">{analysisResult.wordCount} words analyzed</p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 md:col-span-2">
                                    <h5 className="font-bold text-slate-900 mb-3 text-sm uppercase tracking-wider">Top Skills Detected</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisResult.extractedSkills.length > 0 ? (
                                            analysisResult.extractedSkills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg uppercase shadow-sm">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">No primary skills detected. Try adding more keywords.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                                    <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="text-emerald-500" size={18}/> Sections Found
                                    </h5>
                                    <ul className="space-y-2">
                                        {analysisResult.foundSections.length > 0 ? (
                                            analysisResult.foundSections.map((sec, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium capitalize">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> {sec}
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">No standard sections identified.</p>
                                        )}
                                    </ul>
                                </div>

                                <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
                                    <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <div className="w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">!</div> Missing Sections
                                    </h5>
                                    <ul className="space-y-2">
                                        {analysisResult.missingSections.length > 0 ? (
                                            analysisResult.missingSections.map((sec, i) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium capitalize">
                                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> {sec}
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500">All standard sections exist!</p>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                <h5 className="font-bold text-slate-900 mb-3">AI Suggestions</h5>
                                <ul className="space-y-2">
                                    {analysisResult.suggestions.map((sug, i) => (
                                        <li key={i} className="text-sm text-slate-700 font-medium flex items-start gap-2">
                                            <span className="text-amber-500 mt-0.5">•</span> {sug}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4 hover:border-primary transition-colors group">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto group-hover:text-primary group-hover:bg-primary/5 transition-all">
                        <Upload size={32} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">No Resume Uploaded</p>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">Upload your academic resume to start applying for placement drives. (PDF or DOCX max 5MB)</p>
                    </div>
                    <label className="inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all cursor-pointer">
                        {uploading ? 'Uploading...' : 'Upload Resume'}
                        <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx" />
                    </label>
                </div>
            )}

            {message && (
                <p className={`mt-4 text-sm font-medium ${message.includes('failed') || message.includes('supports') ? 'text-red-500' : 'text-emerald-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default ResumeManagement;
