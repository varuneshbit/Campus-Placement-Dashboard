import React, { useState } from 'react';
import { Code, X, Plus } from 'lucide-react';

const SUGGESTED_SKILLS = ['React', 'Node.js', 'JavaScript', 'Python', 'Java', 'SQL', 'MongoDB', 'C++', 'AWS', 'Docker', 'Express.js', 'TypeScript', 'HTML/CSS'];
const MAX_SKILLS = 10;

const SkillsSection = ({ skills = [], onSkillsChange, isEditing }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleAddSkill = (skillToAdd) => {
    setError('');
    const trimmedSkill = skillToAdd.trim();
    
    if (!trimmedSkill) return;
    
    if (skills.length >= MAX_SKILLS) {
      setError(`You can only add up to ${MAX_SKILLS} skills.`);
      return;
    }
    
    // Case-insensitive check for duplicates
    const isDuplicate = skills.some(s => s.toLowerCase() === trimmedSkill.toLowerCase());
    
    if (isDuplicate) {
      setError(`'${trimmedSkill}' is already added.`);
      return;
    }
    
    onSkillsChange([...skills, trimmedSkill]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(inputValue);
    }
  };

  const removeSkill = (skillToRemove) => {
    onSkillsChange(skills.filter(s => s !== skillToRemove));
    setError('');
  };

  // Filter out suggestions that are already in the user's skills
  const availableSuggestions = SUGGESTED_SKILLS.filter(
    suggested => !skills.some(s => s.toLowerCase() === suggested.toLowerCase())
  ).slice(0, 5); // Show top 5 available suggestions

  return (
    <div className="bg-white rounded-2xl shadow-premium p-6 border border-slate-100 h-full flex flex-col">
      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Code className="text-primary" size={20} /> Skills
      </h2>
      
      {isEditing && (
        <div className="mb-6">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => { setInputValue(e.target.value); setError(''); }} 
              onKeyDown={handleKeyDown}
              disabled={skills.length >= MAX_SKILLS}
              placeholder={skills.length >= MAX_SKILLS ? "Maximum limit reached" : "Type skill & press Enter"} 
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all outline-none text-sm disabled:opacity-60" 
            />
            <button 
              type="button" 
              onClick={() => handleAddSkill(inputValue)}
              disabled={!inputValue.trim() || skills.length >= MAX_SKILLS}
              className="px-5 py-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary flex items-center gap-1"
            >
              <Plus size={18} /> Add
            </button>
          </div>
          
          {error && <p className="text-red-500 text-xs font-semibold mt-2 ml-1">{error}</p>}
          
          {availableSuggestions.length > 0 && skills.length < MAX_SKILLS && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Suggested</p>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} /> {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render Skills */}
      <div className="flex-grow">
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-1.5 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200 shadow-sm transition-all duration-200 animate-in zoom-in-95">
                {skill}
                {isEditing && (
                  <button 
                    type="button" 
                    onClick={() => removeSkill(skill)} 
                    className="p-0.5 rounded-full hover:bg-blue-200 hover:text-red-500 text-blue-500 transition-colors ml-1 focus:outline-none"
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Code size={32} className="text-slate-300 mb-2" />
            <p className="text-slate-500 font-bold text-sm">No skills added yet</p>
            {isEditing ? (
              <p className="text-slate-400 text-xs mt-1">Use the input above to get started</p>
            ) : (
              <p className="text-primary/80 font-semibold text-xs mt-1">Click "Edit Profile" below to add skills!</p>
            )}
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400 text-right">
          {skills.length} / {MAX_SKILLS} skills added
        </div>
      )}
    </div>
  );
};

export default SkillsSection;
