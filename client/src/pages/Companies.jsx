import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  History, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  X
} from 'lucide-react';
import axios from 'axios';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinSalary, setFilterMinSalary] = useState('');
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      companyName: '',
      salary: '',
      location: '',
      companyDescription: '',
      hiringStats: { previousOffers: 0, lastHiringYear: '', topSkills: [] }
    }
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/companies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      reset({
        companyName: company.companyName,
        salary: company.salary,
        location: company.location,
        companyDescription: company.companyDescription || '',
        hiringStats: {
          previousOffers: company.hiringStats?.previousOffers || 0,
          lastHiringYear: company.hiringStats?.lastHiringYear || '',
          topSkills: company.hiringStats?.topSkills || []
        }
      });
    } else {
      setEditingCompany(null);
      reset({
        companyName: '',
        salary: '',
        location: '',
        companyDescription: '',
        hiringStats: { previousOffers: 0, lastHiringYear: '', topSkills: [] }
      });
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (editingCompany) {
        await axios.put(`http://localhost:5000/api/companies/${editingCompany._id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/companies', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCompanies();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const hasActiveFilter = filterLocation.trim() !== '' || filterMinSalary.trim() !== '';

  const filteredCompanies = companies.filter(c => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyDescription && c.companyDescription.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = filterLocation.trim() === '' ||
      c.location.toLowerCase().includes(filterLocation.trim().toLowerCase());

    const salaryNum = parseFloat((c.salary || '').replace(/[^0-9.]/g, ''));
    const matchesSalary = filterMinSalary.trim() === '' ||
      (!isNaN(salaryNum) && salaryNum >= parseFloat(filterMinSalary));

    return matchesSearch && matchesLocation && matchesSalary;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Company Management</h2>
            <p className="text-slate-500">Add and manage recruiters & hiring partners.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Add Company
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search companies by name, location, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilter(prev => !prev)}
              className={`relative p-2.5 rounded-xl border transition-all ${
                showFilter || hasActiveFilter
                  ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                  : 'text-slate-500 hover:bg-slate-50 border-slate-100'
              }`}
              title="Toggle Filters"
            >
              <Filter size={20} />
              {hasActiveFilter && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilter && (
            <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Filter by Location</label>
                <input
                  type="text"
                  placeholder="e.g. Bangalore"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Min Salary (LPA)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  min="0"
                  value={filterMinSalary}
                  onChange={(e) => setFilterMinSalary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              {hasActiveFilter && (
                <div className="flex items-end">
                  <button
                    onClick={() => { setFilterLocation(''); setFilterMinSalary(''); }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-rose-100"
                  >
                    <X size={14} /> Clear Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Company Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Company</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description & Salary</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Hiring Stats</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-500">Loading companies...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-slate-500">No companies found.</td></tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-primary font-bold">
                        {company.companyName[0]}
                      </div>
                      <span className="font-semibold text-slate-900">{company.companyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900 truncate max-w-[200px]" title={company.companyDescription}>{company.companyDescription || 'No description'}</div>
                    <div className="text-xs text-emerald-600 font-semibold mt-0.5">{company.salary}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin size={14} />
                      {company.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-slate-900">{company.hiringStats?.previousOffers || 0} Offers</div>
                    <div className="text-[10px] text-slate-400">Last: {company.hiringStats?.lastHiringYear || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(company)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(company._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-900 font-display">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:bg-white hover:text-slate-900 rounded-xl transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    {...register('companyName', { required: 'Company Name is required' })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  {errors.companyName && <p className="text-rose-500 text-xs mt-1">{errors.companyName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Salary Package</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 12 LPA"
                    {...register('salary', { required: 'Salary is required' })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  {errors.salary && <p className="text-rose-500 text-xs mt-1">{errors.salary.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                  <input 
                    type="text" 
                    {...register('location', { required: 'Location is required' })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                  {errors.location && <p className="text-rose-500 text-xs mt-1">{errors.location.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Previous Offers</label>
                  <input 
                    type="number" 
                    {...register('hiringStats.previousOffers')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company Description</label>
                <textarea 
                  rows="3"
                  {...register('companyDescription', { maxLength: { value: 1000, message: 'Max 1000 characters' }})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
                {errors.companyDescription && <p className="text-rose-500 text-xs mt-1">{errors.companyDescription.message}</p>}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all"
                >
                  {editingCompany ? 'Update Details' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Companies;
