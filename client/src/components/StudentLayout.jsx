import React from 'react';
import StudentSidebar from './StudentSidebar';
import Navbar from './Navbar';

const StudentLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
