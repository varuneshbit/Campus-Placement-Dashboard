import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Companies from './pages/Companies';
import AdminDrives from './pages/AdminDrives';
import Interviews from './pages/Interviews';
import Students from './pages/Students';
import Verification from './pages/Verification';
import Analytics from './pages/Analytics';
import StudentDashboard from './pages/StudentDashboard';
import StudentInterviews from './pages/StudentInterviews';
import PlacementCalendar from './pages/PlacementCalendar';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import StudentProfile from './pages/StudentProfile';
import StudentDrives from './pages/StudentDrives';
import StudentResume from './pages/StudentResume';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/companies" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Companies />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/drives" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDrives />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/interviews" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Interviews />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/students" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Students />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/verification" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Verification />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/drives" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDrives />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/resume" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentResume />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/interviews" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentInterviews />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/calendar" 
            element={
              <ProtectedRoute roles={['admin']}>
                <PlacementCalendar />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/calendar" 
            element={
              <ProtectedRoute roles={['student']}>
                <PlacementCalendar />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin/leaderboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/leaderboard" 
            element={
              <ProtectedRoute roles={['student']}>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/student/profile" 
            element={
              <ProtectedRoute roles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
