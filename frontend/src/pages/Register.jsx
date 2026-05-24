import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1); // 1 = basic info + role, 2 = role-specific fields
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'PATIENT',
    // Patient fields
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    // Doctor fields
    specialization: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, registerPatient } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const paths = { ADMIN: '/admin', DOCTOR: '/doctor', RECEPTIONIST: '/receptionist', PATIENT: '/patient' };
      navigate(paths[user.role] || '/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    const { username, password, confirmPassword, fullName, email, phone, role } = formData;
    if (!username || !password || !fullName || !email || !phone) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerPatient(formData);
      const paths = { ADMIN: '/admin', DOCTOR: '/doctor', RECEPTIONIST: '/receptionist', PATIENT: '/patient' };
      navigate(paths[formData.role] || '/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed. Username may already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Hospital Management System</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Create your account</h2>
          <p className="text-sm text-gray-500">
            {step === 1 ? 'Fill in your basic information and select a role.' : 'Complete your profile details.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Step indicators */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {/* STEP 1 — Basic Info + Role */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="johndoe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="9876543210" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="••••••••" />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Register as *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'PATIENT', label: 'Patient', desc: 'Book appointments & view prescriptions' },
                    { value: 'DOCTOR', label: 'Doctor', desc: 'Manage patients & write prescriptions' },
                    { value: 'RECEPTIONIST', label: 'Receptionist', desc: 'Handle bookings & billing' },
                    { value: 'ADMIN', label: 'Admin', desc: 'Full system administration' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData({...formData, role: r.value})}
                      className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                        formData.role === r.value
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`text-sm font-medium ${formData.role === r.value ? 'text-blue-700' : 'text-gray-800'}`}>{r.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors cursor-pointer mt-2"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2 — Role-Specific Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">
                  {formData.role === 'DOCTOR' ? 'Doctor Details' :
                   formData.role === 'PATIENT' ? 'Patient Details' :
                   'Account Details'}
                </h3>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  ← Back
                </button>
              </div>

              {/* Patient-specific fields */}
              {formData.role === 'PATIENT' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Your permanent address" />
                  </div>
                </>
              )}

              {/* Doctor-specific fields */}
              {formData.role === 'DOCTOR' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Cardiology" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Cardiology" />
                  </div>
                </div>
              )}

              {/* Admin / Receptionist — no extra fields needed */}
              {(formData.role === 'ADMIN' || formData.role === 'RECEPTIONIST') && (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-500">No additional details needed for <strong>{formData.role.toLowerCase()}</strong> role.</p>
                  <p className="text-xs text-gray-400 mt-1">You're all set — click below to complete registration.</p>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Account Summary</p>
                <div className="grid grid-cols-2 gap-y-1 text-sm">
                  <span className="text-gray-500">Name:</span>
                  <span className="text-gray-800 font-medium">{formData.fullName}</span>
                  <span className="text-gray-500">Username:</span>
                  <span className="text-gray-800 font-medium">{formData.username}</span>
                  <span className="text-gray-500">Role:</span>
                  <span className="text-gray-800 font-medium capitalize">{formData.role.toLowerCase()}</span>
                  <span className="text-gray-500">Email:</span>
                  <span className="text-gray-800 font-medium">{formData.email}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Creating account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
