import React from 'react';
import { Eye, Edit2, Trash2, Code } from 'lucide-react';

const ProjectCard = ({ project, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md hover:scale-[1.02] transition-all flex flex-col h-full cursor-default">
      <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{project.title}</h3>
      <p className="text-sm text-slate-500 mt-2 line-clamp-2 flex-grow">{project.description}</p>
      
      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {project.techStack.slice(0, 3).map((tech, idx) => (
            <span key={idx} className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold">
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full text-xs font-semibold">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mt-5 border-t border-slate-100 pt-4">
        <button type="button" onClick={() => onView(project)} className="flex items-center justify-center gap-1.5 py-1.5 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg text-sm font-semibold transition-colors">
          <Eye size={16} /> View
        </button>
        <button type="button" onClick={() => onEdit(project)} className="flex items-center justify-center gap-1.5 py-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-semibold transition-colors">
          <Edit2 size={16} /> Edit
        </button>
        <button type="button" onClick={() => onDelete(project._id)} className="flex items-center justify-center gap-1.5 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-semibold transition-colors">
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
