import React from 'react';
import { X, Code, ExternalLink, Github } from 'lucide-react';

const ProjectModal = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
          <X size={20} />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 pr-8">{project.title}</h2>
          
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
            
            {project.techStack && project.techStack.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Code size={16} className="text-primary" /> Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-full text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {(project.githubLink || project.liveDemoLink) && (
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
                    <Github size={18} /> Source Code
                  </a>
                )}
                {project.liveDemoLink && (
                  <a href={project.liveDemoLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium">
                    <ExternalLink size={18} /> Live Demo
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
