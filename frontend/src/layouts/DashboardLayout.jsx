import React from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Calendar,
  CreditCard,
  FileText,
  UserPlus,
  LogOut,
  Bed,
  Activity,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getNavItems = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
          { name: 'Patients', path: '/admin/patients', icon: Users },
          { name: 'Beds & OTs', path: '/admin/beds-ots', icon: Bed },
        ];
      case 'DOCTOR':
        return [
          { name: 'Appointments', path: '/doctor', icon: Calendar },
          { name: 'Wards & Admissions', path: '/doctor/admissions', icon: Bed },
          { name: 'Surgeries', path: '/doctor/surgeries', icon: Activity },
        ];
      case 'RECEPTIONIST':
        return [
          { name: 'Dashboard', path: '/receptionist', icon: LayoutDashboard },
          { name: 'Register Patient', path: '/receptionist/register-patient', icon: UserPlus },
          { name: 'Book Appointment', path: '/receptionist/book-appointment', icon: Calendar },
          { name: 'Admissions', path: '/receptionist/admissions', icon: Bed },
          { name: 'Surgeries', path: '/receptionist/surgeries', icon: Activity },
          { name: 'Billing', path: '/receptionist/billing', icon: CreditCard },
        ];
      case 'PATIENT':
        return [
          { name: 'Dashboard', path: '/patient', icon: LayoutDashboard },
          { name: 'My Admissions', path: '/patient/admissions', icon: Bed },
          { name: 'My Surgeries', path: '/patient/surgeries', icon: Activity },
          { name: 'Prescriptions', path: '/patient/prescriptions', icon: FileText },
          { name: 'Payments', path: '/patient/payments', icon: CreditCard },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    ADMIN: 'Administrator',
    DOCTOR: 'Doctor',
    RECEPTIONIST: 'Receptionist',
    PATIENT: 'Patient',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-white border-r border-gray-200">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">HMS</span>
        </div>

        {/* User */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
              {user.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-400">{roleLabel[user.role] || user.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">
            {navItems.find((i) => i.path === location.pathname)?.name || 'Dashboard'}
          </h2>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
