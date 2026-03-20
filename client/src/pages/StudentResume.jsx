import React from 'react';
import StudentLayout from '../components/StudentLayout';
import ResumeManagement from '../components/ResumeManagement';

const StudentResume = () => {
  return (
    <StudentLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">Resume Management</h2>
          <p className="text-slate-500">Upload and manage your placement resumes.</p>
        </div>
        <ResumeManagement />
      </div>
    </StudentLayout>
  );
};

export default StudentResume;
