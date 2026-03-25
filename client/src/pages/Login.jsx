import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, LogIn } from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    branch: '',
    batch: '',
    role: 'student' // Force student profile for self-registration
  });
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(formData);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-premium p-8 transition-all">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2 font-display">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-500">
            {isRegistering ? 'Register as a new student' : 'Sign in to your placement portal'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 italic">
            {error}
          </div>
        )}

        {isRegistering ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
               <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="John Doe" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                 <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="CSE2024001" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                  <select name="branch" value={formData.branch} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white">
                    <option value="">Select</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="EEE">EEE</option>
                    <option value="IT">IT</option>
                  </select>
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Batch (Year)</label>
               <input type="text" name="batch" value={formData.batch} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="2024" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
               <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="name@university.edu" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
               <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="••••••••" minLength="6" />
             </div>
             <button type="submit" className="w-full mt-2 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
               <UserPlus size={18} /> Register
             </button>
             <p className="text-center text-sm text-slate-500 mt-6 pb-2">
                Already have an account? <span className="text-primary font-bold cursor-pointer hover:underline" onClick={() => {setIsRegistering(false); setError('');}}>Sign In</span>
             </p>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="name@university.edu" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="••••••••" />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
              <LogIn size={18} /> Sign In
            </button>
            <p className="text-center text-sm text-slate-500 mt-6 pb-2">
               Don't have an account? <span className="text-primary font-bold cursor-pointer hover:underline" onClick={() => {setIsRegistering(true); setError('');}}>Register Here</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
