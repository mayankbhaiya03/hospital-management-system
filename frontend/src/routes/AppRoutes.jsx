import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/AdminDashboard';
import DoctorDashboard from '../pages/DoctorDashboard';
import ReceptionistDashboard from '../pages/ReceptionistDashboard';
import PatientDashboard from '../pages/PatientDashboard';

// Route Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized user to their respective home dashboard
    const defaultPaths = {
      'ADMIN': '/admin',
      'DOCTOR': '/doctor',
      'RECEPTIONIST': '/receptionist',
      'PATIENT': '/patient'
    };
    return <Navigate to={defaultPaths[user.role] || '/login'} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Root Redirect Component
const RootRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const defaultPaths = {
    'ADMIN': '/admin',
    'DOCTOR': '/doctor',
    'RECEPTIONIST': '/receptionist',
    'PATIENT': '/patient'
  };
  return <Navigate to={defaultPaths[user.role] || '/login'} replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Protected Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard activeTab="overview" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/doctors" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard activeTab="doctors" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/patients" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard activeTab="patients" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/beds-ots" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard activeTab="beds-ots" />
          </ProtectedRoute>
        } 
      />

      {/* Doctor Protected Routes */}
      <Route 
        path="/doctor" 
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard activeTab="appointments" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/doctor/admissions" 
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard activeTab="admissions" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/doctor/surgeries" 
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DoctorDashboard activeTab="surgeries" />
          </ProtectedRoute>
        } 
      />

      {/* Receptionist Protected Routes */}
      <Route 
        path="/receptionist" 
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard activeTab="overview" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/receptionist/register-patient" 
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard activeTab="register" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/receptionist/book-appointment" 
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard activeTab="book" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/receptionist/admissions" 
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard activeTab="admissions" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/receptionist/surgeries" 
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard activeTab="surgeries" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/receptionist/billing" 
        element={
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <ReceptionistDashboard activeTab="billing" />
          </ProtectedRoute>
        } 
      />

      {/* Patient Protected Routes */}
      <Route 
        path="/patient" 
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard activeTab="overview" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient/admissions" 
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard activeTab="admissions" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient/surgeries" 
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard activeTab="surgeries" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient/prescriptions" 
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard activeTab="prescriptions" />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patient/payments" 
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientDashboard activeTab="payments" />
          </ProtectedRoute>
        } 
      />

      {/* Fallbacks */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
