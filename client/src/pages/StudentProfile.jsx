import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, BookOpen, GraduationCap, Code, FileText, 
  Briefcase, Plus, X, Upload, Save, CheckCircle2, AlertCircle, Trash2, Camera, Edit2
} from 'lucide-react';
import StudentLayout from '../components/StudentLayout';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import ProjectForm from '../components/ProjectForm';
import SkillsSection from '../components/SkillsSection';
import { useAuth } from '../context/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profileData, setProfileData] = useState({
    rollNumber: '',
    batch: '',
    branch: '',
    phone: '',
    cgpa: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    backlogs: 0,
    skills: [],
    projects: [],
    resumeURL: '',
    profileImageURL: '',
    profileCompletion: 0
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Project Modals State
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submittingProject, setSubmittingProject] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/students/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setProfileData(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Error fetching profile', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };


  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsProjectFormOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    if(!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`/api/students/profile/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(prev => ({ ...prev, projects: res.data.data }));
      fetchProfile();
      setMessage({ text: 'Project deleted', type: 'success' });
    } catch(err) {
      setMessage({ text: err.response?.data?.message || 'Error deleting project', type: 'error' });
    }
  };

  const handleSaveProject = async (projectData) => {
    try {
      setSubmittingProject(true);
      const token = localStorage.getItem('token');
      let res;
      if (projectData._id) {
        res = await axios.put(`/api/students/profile/projects/${projectData._id}`, projectData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`/api/students/profile/projects`, projectData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setProfileData(prev => ({ ...prev, projects: res.data.data }));
      fetchProfile();
      setIsProjectFormOpen(false);
      setMessage({ text: 'Project saved successfully', type: 'success' });
    } catch(err) {
      setMessage({ text: err.response?.data?.message || 'Error saving project', type: 'error' });
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setUploadingImage(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/students/profile/upload-image', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfileData(prev => ({ ...prev, profileImageURL: res.data.data }));
      setMessage({ text: 'Profile image uploaded successfully', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error uploading image', type: 'error' });
    } finally {
      setUploadingImage(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      setUploadingResume(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/students/profile/upload-resume', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfileData(prev => ({ ...prev, resumeURL: res.data.data }));
      setMessage({ text: 'Resume uploaded successfully', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error uploading resume', type: 'error' });
    } finally {
      setUploadingResume(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (profileData.phone && profileData.phone.length !== 10) {
      setMessage({ text: 'Phone number must be 10 digits', type: 'error' });
      return;
    }
    if (profileData.cgpa > 10 || profileData.cgpa < 0) {
      setMessage({ text: 'CGPA must be between 0 and 10', type: 'error' });
      return;
    }
    if (profileData.tenthPercentage > 100 || profileData.twelfthPercentage > 100) {
      setMessage({ text: 'Percentages cannot exceed 100', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/students/profile/update', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
      fetchProfile(); // Refresh to get updated completion score
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Progress */}
        <div className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {profileData.profileImageURL ? (
                <img src={profileData.profileImageURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-slate-400" />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark transition-colors shadow-lg">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            )}
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
            <p className="text-slate-500">{user?.email}</p>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1 text-sm font-medium">
                <span className="text-slate-700">Profile Strength</span>
                <span className={profileData.profileCompletion === 100 ? 'text-emerald-500 font-bold' : 'text-primary'}>
                  {profileData.profileCompletion}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${profileData.profileCompletion === 100 ? 'bg-emerald-500' : 'bg-primary'} transition-all duration-500`}
                  style={{ width: `${profileData.profileCompletion}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="text-primary" size={20} /> Basic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" value={user?.name} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={user?.email} disabled className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="text" name="phone" value={profileData.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="10-digit number" className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                <input type="text" name="rollNumber" value={profileData.rollNumber} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g. 2022CS01" className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department / Branch</label>
                <select name="branch" value={profileData.branch} onChange={handleInputChange} disabled={!isEditing} className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:appearance-none disabled:border-transparent">
                  <option value="">Select Branch</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch</label>
                <input type="text" name="batch" value={profileData.batch} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g. 2022-2026" className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-transparent" />
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="text-primary" size={20} /> Academic Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CGPA (out of 10)</label>
                <input type="number" step="0.01" name="cgpa" value={profileData.cgpa} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g. 8.5" className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">10th Percentage</label>
                <input type="number" step="0.01" name="tenthPercentage" value={profileData.tenthPercentage} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g. 95" className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">12th Percentage</label>
                <input type="number" step="0.01" name="twelfthPercentage" value={profileData.twelfthPercentage} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g. 92" className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Active Backlogs</label>
                <input type="number" name="backlogs" value={profileData.backlogs} onChange={handleInputChange} disabled={!isEditing} className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-transparent" />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="h-full">
            <SkillsSection 
              skills={profileData.skills} 
              onSkillsChange={(newSkills) => setProfileData(prev => ({ ...prev, skills: newSkills }))} 
              isEditing={isEditing} 
            />
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="text-primary" size={20} /> Projects
              </h2>
              <button 
                type="button" 
                onClick={() => { setSelectedProject(null); setIsProjectFormOpen(true); }}
                className="flex items-center gap-1.5 text-sm bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white px-4 py-2 rounded-xl transition-all"
              >
                <Plus size={16} /> Add Project
              </button>
            </div>
            
            {profileData.projects && profileData.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {profileData.projects.map((proj, index) => (
                  <ProjectCard 
                    key={proj._id || index}
                    project={proj}
                    onView={handleViewProject}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No projects added yet</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">Showcase your skills by adding academic or personal projects.</p>
                <button 
                  type="button" 
                  onClick={() => { setSelectedProject(null); setIsProjectFormOpen(true); }}
                  className="inline-flex items-center gap-1.5 text-sm bg-primary text-white font-bold hover:bg-primary-dark px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 transition-all"
                >
                  <Plus size={16} /> Add First Project
                </button>
              </div>
            )}
          </div>

          {/* Resume Upload */}
          <div className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="text-primary" size={20} /> Resume
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <FileText size={28} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-slate-900">Upload Resume</h3>
                <p className="text-sm text-slate-500 mt-1">PDF or DOCX files up to 5MB</p>
                {profileData.resumeURL && (
                  <a href={profileData.resumeURL} target="_blank" rel="noreferrer" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
                    View Current Resume
                  </a>
                )}
              </div>
              {isEditing && (
                <label className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 cursor-pointer shadow-sm transition-all whitespace-nowrap">
                  {uploadingResume ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div> : <Upload size={18} />}
                  {uploadingResume ? 'Uploading...' : 'Choose File'}
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume} />
                </label>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-6 pb-6">
            {!isEditing ? (
              <button 
                type="button" 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all w-full sm:w-auto justify-center"
              >
                <Edit2 size={20} />
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); fetchProfile(); }}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all justify-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all justify-center"
                >
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        project={selectedProject} 
      />
      <ProjectForm 
        isOpen={isProjectFormOpen} 
        onClose={() => setIsProjectFormOpen(false)} 
        project={selectedProject} 
        onSubmit={handleSaveProject}
        submitting={submittingProject}
      />
    </StudentLayout>
  );
};

export default StudentProfile;
