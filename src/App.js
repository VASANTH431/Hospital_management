import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageDoctors from './pages/Admin/ManageDoctors';
import ManagePatients from './pages/Admin/ManagePatients';
import ManageBeds from './pages/Admin/ManageBeds';
import DoctorDashboard from './pages/Doctor/Dashboard';
import Profile from './pages/Doctor/Profile';
import AttenderDashboard from './pages/Attender/Dashboard';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageDoctors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/patients"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManagePatients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/beds"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageBeds />
                </ProtectedRoute>
              }
            />

            {/* Doctor Protected Routes */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Patient Attender Protected Routes */}
            <Route
              path="/attender/dashboard"
              element={
                <ProtectedRoute allowedRoles={['attender']}>
                  <AttenderDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback to Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#1E293B',
                borderRadius: '12px',
                border: '1px solid rgba(222, 161, 147, 0.2)',
                fontSize: '13px',
                fontWeight: '500'
              },
            }}
          />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
