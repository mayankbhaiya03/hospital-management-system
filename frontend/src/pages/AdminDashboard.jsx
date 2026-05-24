import React, { useState, useEffect } from 'react';
import { 
  dashboardAPI, 
  doctorAPI, 
  patientAPI, 
  appointmentAPI,
  bedAPI,
  operationTheaterAPI,
  surgeryAPI,
  billingAPI
} from '../services/api';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Search, 
  Bed, 
  Sliders
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#10b981'];

const AdminDashboard = ({ activeTab }) => {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [ots, setOts] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & form editing
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [showOTModal, setShowOTModal] = useState(false);

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editingBed, setEditingBed] = useState(null);
  const [editingOT, setEditingOT] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const [doctorForm, setDoctorForm] = useState({
    username: '', password: 'doc123', fullName: '', email: '', phone: '',
    specialization: '', department: '', experience: '', consultationFee: '', availabilityStatus: 'AVAILABLE'
  });

  const [patientForm, setPatientForm] = useState({
    username: '', fullName: '', email: '', phone: '',
    dateOfBirth: '', gender: 'Male', bloodGroup: 'O+', address: '', medicalHistory: ''
  });

  const [bedForm, setBedForm] = useState({
    bedNumber: '', type: 'GENERAL_WARD', status: 'AVAILABLE', dailyCharges: 500
  });

  const [otForm, setOTForm] = useState({
    name: '', status: 'AVAILABLE', baseCharges: 1500
  });

  useEffect(() => {
    fetchData(false);
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [statsRes, doctorsRes, patientsRes, bedsRes, otsRes, surgRes, billRes] = await Promise.all([
        dashboardAPI.getStats(),
        doctorAPI.getAll(),
        patientAPI.getAll(),
        bedAPI.getAll(),
        operationTheaterAPI.getAll(),
        surgeryAPI.getAll(),
        billingAPI.getAll()
      ]);
      setStats(statsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setBeds(bedsRes.data);
      setOts(otsRes.data);
      setSurgeries(surgRes.data);
      setBillings(billRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Doctor CRUD
  const openAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorForm({ username: '', password: 'doc123', fullName: '', email: '', phone: '', specialization: '', department: '', experience: '', consultationFee: '', availabilityStatus: 'AVAILABLE' });
    setShowDoctorModal(true);
  };
  const openEditDoctor = (doc) => {
    setEditingDoctor(doc);
    setDoctorForm({ username: doc.username || '', password: '', fullName: doc.fullName || '', email: doc.email || '', phone: doc.phone || '', specialization: doc.specialization || '', department: doc.department || '', experience: doc.experience || '', consultationFee: doc.consultationFee || '', availabilityStatus: doc.availabilityStatus || 'AVAILABLE' });
    setShowDoctorModal(true);
  };
  const handleSaveDoctor = async () => {
    try {
      if (editingDoctor) {
        await doctorAPI.update(editingDoctor.id, doctorForm);
      } else {
        await doctorAPI.create(doctorForm);
      }
      setShowDoctorModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data || 'Error saving doctor'); }
  };
  const handleDeleteDoctor = async (id) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    try { await doctorAPI.delete(id); fetchData(); } catch (err) { alert('Error deleting doctor'); }
  };

  // Patient CRUD
  const openAddPatient = () => {
    setEditingPatient(null);
    setPatientForm({ username: '', fullName: '', email: '', phone: '', dateOfBirth: '', gender: 'Male', bloodGroup: 'O+', address: '', medicalHistory: '' });
    setShowPatientModal(true);
  };
  const openEditPatient = (pat) => {
    setEditingPatient(pat);
    setPatientForm({ username: pat.username || '', fullName: pat.fullName || '', email: pat.email || '', phone: pat.phone || '', dateOfBirth: pat.dateOfBirth || '', gender: pat.gender || 'Male', bloodGroup: pat.bloodGroup || 'O+', address: pat.address || '', medicalHistory: pat.medicalHistory || '' });
    setShowPatientModal(true);
  };
  const handleSavePatient = async () => {
    try {
      if (editingPatient) {
        await patientAPI.update(editingPatient.id, patientForm);
      } else {
        await patientAPI.create(patientForm);
      }
      setShowPatientModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data || 'Error saving patient'); }
  };
  const handleDeletePatient = async (id) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try { await patientAPI.delete(id); fetchData(); } catch (err) { alert('Error deleting patient'); }
  };

  // Bed CRUD
  const openAddBed = () => {
    setEditingBed(null);
    setBedForm({ bedNumber: '', type: 'GENERAL_WARD', status: 'AVAILABLE', dailyCharges: 500 });
    setShowBedModal(true);
  };
  const openEditBed = (bed) => {
    setEditingBed(bed);
    setBedForm({ bedNumber: bed.bedNumber || '', type: bed.type || 'GENERAL_WARD', status: bed.status || 'AVAILABLE', dailyCharges: bed.dailyCharges || 500 });
    setShowBedModal(true);
  };
  const handleSaveBed = async () => {
    try {
      const payload = editingBed ? { ...bedForm, id: editingBed.id } : bedForm;
      await bedAPI.createOrUpdate(payload);
      setShowBedModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data || 'Error saving bed'); }
  };
  const handleDeleteBed = async (id) => {
    if (!confirm('Are you sure you want to delete this bed?')) return;
    try { await bedAPI.delete(id); fetchData(); } catch (err) { alert('Error deleting bed'); }
  };

  // OT CRUD
  const openAddOT = () => {
    setEditingOT(null);
    setOTForm({ name: '', status: 'AVAILABLE', baseCharges: 1500 });
    setShowOTModal(true);
  };
  const openEditOT = (ot) => {
    setEditingOT(ot);
    setOTForm({ name: ot.name || '', status: ot.status || 'AVAILABLE', baseCharges: ot.baseCharges || 1500 });
    setShowOTModal(true);
  };
  const handleSaveOT = async () => {
    try {
      const payload = editingOT ? { ...otForm, id: editingOT.id } : otForm;
      await operationTheaterAPI.createOrUpdate(payload);
      setShowOTModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data || 'Error saving operation theater'); }
  };
  const handleDeleteOT = async (id) => {
    if (!confirm('Are you sure you want to delete this operation theater?')) return;
    try { await operationTheaterAPI.delete(id); fetchData(); } catch (err) { alert('Error deleting operation theater'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading analytics console...</span>
        </div>
      </div>
    );
  }

  // ===== OVERVIEW TAB =====
  if (activeTab === 'overview') {
    // 1. Calculate Bed Occupancy percentages
    const icuBeds = beds.filter(b => b.type === 'ICU');
    const occupiedIcu = icuBeds.filter(b => b.status === 'OCCUPIED').length;
    const icuOccRate = icuBeds.length > 0 ? Math.round((occupiedIcu / icuBeds.length) * 100) : 0;

    const generalBeds = beds.filter(b => b.type === 'GENERAL_WARD' || b.type === 'PRIVATE');
    const occupiedGen = generalBeds.filter(b => b.status === 'OCCUPIED').length;
    const genOccRate = generalBeds.length > 0 ? Math.round((occupiedGen / generalBeds.length) * 100) : 0;

    // 2. Dynamic Revenue Category Breakdowns
    const paidBills = billings.filter(b => b.status === 'PAID');
    const consultRev = paidBills.reduce((sum, b) => sum + (b.consultationFees || 0), 0);
    const roomRev = paidBills.reduce((sum, b) => sum + (b.roomCharges || 0), 0);
    const surgRev = paidBills.reduce((sum, b) => sum + (b.surgeryFees || 0), 0);
    const pharmacyRev = paidBills.reduce((sum, b) => sum + (b.otherCharges || 0), 0);

    const revenueCategoryData = [
      { name: 'Consultations', value: consultRev },
      { name: 'Room Stays', value: roomRev },
      { name: 'Surgeries', value: surgRev },
      { name: 'Pharmacy & Tests', value: pharmacyRev }
    ].filter(item => item.value > 0);

    const fallbackCategoryData = [
      { name: 'Consultations', value: stats?.totalRevenue || 1200 },
      { name: 'Pharmacy & Tests', value: 800 }
    ];

    const chartCategoryData = revenueCategoryData.length > 0 ? revenueCategoryData : fallbackCategoryData;
    const computedTotalRevenue = stats?.totalRevenue || 0;

    return (
      <div className="space-y-8 font-sans">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Doctors', value: doctors.length, icon: Stethoscope, bg: 'bg-indigo-50 border-indigo-100', color: 'text-indigo-600' },
            { label: 'Total Patients', value: patients.length, icon: Users, bg: 'bg-teal-50 border-teal-100', color: 'text-teal-650' },
            { label: 'Completed Surgeries', value: surgeries.filter(s => s.status === 'COMPLETED').length, icon: Activity, bg: 'bg-rose-50 border-rose-100', color: 'text-rose-600' },
            { label: 'Total Platform Revenue', value: `₹${computedTotalRevenue.toLocaleString()}`, icon: DollarSign, bg: 'bg-emerald-50 border-emerald-100', color: 'text-emerald-600' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl border p-5 ${card.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450">{card.label}</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{card.value}</h3>
                </div>
                <card.icon className={`w-8 h-8 ${card.color} opacity-40`} />
              </div>
            </div>
          ))}
        </div>

        {/* ICU / Ward Occupancy rate cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wide">ICU Bed Occupancy Rate</h4>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{icuOccRate}%</h3>
              <p className="text-[11px] text-slate-400 mt-1">{occupiedIcu} of {icuBeds.length} ICU beds currently occupied</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm">
              {icuOccRate}%
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wide">General & Private Ward Occupancy</h4>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{genOccRate}%</h3>
              <p className="text-[11px] text-slate-400 mt-1">{occupiedGen} of {generalBeds.length} general/private beds in use</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {genOccRate}%
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trends */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800">Weekly Revenue Trends</h3>
            <p className="text-xs text-slate-400 mb-6">Aggregate transactions recorded</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats?.revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Category Pie chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800">Revenue by Source</h3>
            <p className="text-xs text-slate-400 mb-6">Financial breakdown by department</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={chartCategoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {chartCategoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-4">
              {chartCategoryData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== DOCTORS TAB =====
  if (activeTab === 'doctors') {
    const filteredDoctors = doctors.filter(d =>
      (d.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Doctor Management</h2>
            <p className="text-xs text-slate-400 mt-1">{doctors.length} registered doctors</p>
          </div>
          <button onClick={openAddDoctor} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Add Doctor
          </button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search doctors..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Name', 'Specialization', 'Department', 'Exp.', 'Fee', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{doc.fullName?.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-slate-800">{doc.fullName}</p>
                        <p className="text-[11px] text-slate-400">{doc.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{doc.specialization}</td>
                  <td className="px-6 py-4 text-slate-600">{doc.department}</td>
                  <td className="px-6 py-4 text-slate-600">{doc.experience} yrs</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">₹{doc.consultationFee}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doc.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {doc.availabilityStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditDoctor(doc)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors cursor-pointer"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteDoctor(doc.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Doctor Modal */}
        {showDoctorModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
                <button onClick={() => setShowDoctorModal(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                {!editingDoctor && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Username *</label>
                      <input type="text" value={doctorForm.username} onChange={e => setDoctorForm({...doctorForm, username: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Password</label>
                      <input type="text" value={doctorForm.password} onChange={e => setDoctorForm({...doctorForm, password: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" placeholder="doc123" />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Full Name *</label>
                    <input type="text" value={doctorForm.fullName} onChange={e => setDoctorForm({...doctorForm, fullName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Email *</label>
                    <input type="email" value={doctorForm.email} onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Phone</label>
                    <input type="text" value={doctorForm.phone} onChange={e => setDoctorForm({...doctorForm, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Specialization *</label>
                    <input type="text" value={doctorForm.specialization} onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Department</label>
                    <input type="text" value={doctorForm.department} onChange={e => setDoctorForm({...doctorForm, department: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Experience (yrs)</label>
                    <input type="number" value={doctorForm.experience} onChange={e => setDoctorForm({...doctorForm, experience: parseInt(e.target.value) || 0})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Consultation Fee</label>
                    <input type="number" value={doctorForm.consultationFee} onChange={e => setDoctorForm({...doctorForm, consultationFee: parseFloat(e.target.value) || 0})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Availability</label>
                  <select value={doctorForm.availabilityStatus} onChange={e => setDoctorForm({...doctorForm, availabilityStatus: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="BUSY">Busy</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button onClick={() => setShowDoctorModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-650 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleSaveDoctor} className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer">Save Doctor</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== PATIENTS TAB =====
  if (activeTab === 'patients') {
    const filteredPatients = patients.filter(p =>
      (p.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.bloodGroup || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-sans">Patient Directory</h2>
            <p className="text-xs text-slate-400 mt-1">{patients.length} registered patients</p>
          </div>
          <button onClick={openAddPatient} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Add Patient
          </button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search patients..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Name', 'Gender', 'Blood Group', 'D.O.B.', 'Phone', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(pat => (
                <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-655 font-bold text-sm">{pat.fullName?.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-slate-800">{pat.fullName}</p>
                        <p className="text-[11px] text-slate-400">{pat.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{pat.gender}</td>
                  <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">{pat.bloodGroup}</span></td>
                  <td className="px-6 py-4 text-slate-600 text-xs">{pat.dateOfBirth}</td>
                  <td className="px-6 py-4 text-slate-600">{pat.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditPatient(pat)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors cursor-pointer"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeletePatient(pat.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Patient Modal */}
        {showPatientModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
                <button onClick={() => setShowPatientModal(false)} className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                {!editingPatient && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Username *</label>
                    <input type="text" value={patientForm.username} onChange={e => setPatientForm({...patientForm, username: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Full Name *</label>
                    <input type="text" value={patientForm.fullName} onChange={e => setPatientForm({...patientForm, fullName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Email *</label>
                    <input type="email" value={patientForm.email} onChange={e => setPatientForm({...patientForm, email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Phone</label>
                    <input type="text" value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Date of Birth</label>
                    <input type="date" value={patientForm.dateOfBirth} onChange={e => setPatientForm({...patientForm, dateOfBirth: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Gender</label>
                    <select value={patientForm.gender} onChange={e => setPatientForm({...patientForm, gender: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Blood Group</label>
                    <select value={patientForm.bloodGroup} onChange={e => setPatientForm({...patientForm, bloodGroup: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400">
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Address</label>
                  <textarea value={patientForm.address} onChange={e => setPatientForm({...patientForm, address: e.target.value})} rows="2" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Medical History</label>
                  <textarea value={patientForm.medicalHistory} onChange={e => setPatientForm({...patientForm, medicalHistory: e.target.value})} rows="2" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button onClick={() => setShowPatientModal(false)} className="px-5 py-2.5 text-sm font-medium text-slate-650 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">Cancel</button>
                <button onClick={handleSavePatient} className="px-5 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer">Save Patient</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== BEDS & OTS CONFIGURATION TAB =====
  if (activeTab === 'beds-ots') {
    return (
      <div className="space-y-10 font-sans">
        
        {/* Beds Management */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Bed & ICU Ward Inventory</h3>
              <p className="text-xs text-slate-400 mt-0.5">Configure hospital stay beds and daily room charges</p>
            </div>
            <button onClick={openAddBed} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Bed Room
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Bed Number', 'Ward Type', 'Daily Rent Charge', 'Occupancy Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beds.map(bed => (
                  <tr key={bed.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{bed.bedNumber}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-semibold">{bed.type}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{bed.dailyCharges?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        bed.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' :
                        bed.status === 'OCCUPIED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                      }`}>{bed.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditBed(bed)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteBed(bed.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operation Theaters Management */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Operation Theaters (OT)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Configure surgery theatres and base OT operational charges</p>
            </div>
            <button onClick={openAddOT} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add OT Room
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Theater Name', 'Base Use Fee', 'Operational Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ots.map(ot => (
                  <tr key={ot.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{ot.name}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">₹{ot.baseCharges?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        ot.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' :
                        ot.status === 'OCCUPIED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                      }`}>{ot.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditOT(ot)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500 transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteOT(ot.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bed Modal */}
        {showBedModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm">{editingBed ? 'Edit Bed Specifications' : 'Add New Hospital Bed'}</h3>
                <button onClick={() => setShowBedModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Bed Number *</label>
                  <input type="text" value={bedForm.bedNumber} onChange={e => setBedForm({...bedForm, bedNumber: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400" placeholder="e.g., ICU-104" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ward Room Type</label>
                    <select value={bedForm.type} onChange={e => setBedForm({...bedForm, type: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                      <option value="GENERAL_WARD">General Ward</option>
                      <option value="PRIVATE">Private Room</option>
                      <option value="ICU">Intensive Care Unit (ICU)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Daily Rent (₹)</label>
                    <input type="number" value={bedForm.dailyCharges} onChange={e => setBedForm({...bedForm, dailyCharges: parseFloat(e.target.value) || 0})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Operational Status</label>
                  <select value={bedForm.status} onChange={e => setBedForm({...bedForm, status: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Under Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
                <button onClick={() => setShowBedModal(false)} className="px-4 py-2 border border-slate-250 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button onClick={handleSaveBed} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer">Save Bed</button>
              </div>
            </div>
          </div>
        )}

        {/* OT Modal */}
        {showOTModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm">{editingOT ? 'Edit OT Configuration' : 'Add New Operation Theater'}</h3>
                <button onClick={() => setShowOTModal(false)} className="text-slate-400 hover:text-slate-650 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Theater Name *</label>
                  <input type="text" value={otForm.name} onChange={e => setOTForm({...otForm, name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400" placeholder="e.g., OT-3" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">OT Base Entry Fee (₹)</label>
                  <input type="number" value={otForm.baseCharges} onChange={e => setOTForm({...otForm, baseCharges: parseFloat(e.target.value) || 0})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Operational Status</label>
                  <select value={otForm.status} onChange={e => setOTForm({...otForm, status: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Under Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
                <button onClick={() => setShowOTModal(false)} className="px-4 py-2 border border-slate-250 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">Cancel</button>
                <button onClick={handleSaveOT} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer">Save Theater</button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
};

export default AdminDashboard;
