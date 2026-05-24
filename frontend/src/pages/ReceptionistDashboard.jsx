import React, { useState, useEffect } from 'react';
import { 
  appointmentAPI, 
  patientAPI, 
  doctorAPI, 
  paymentAPI,
  bedAPI,
  operationTheaterAPI,
  admissionAPI,
  surgeryAPI,
  billingAPI
} from '../services/api';
import { 
  UserPlus, 
  Calendar, 
  CreditCard, 
  Users, 
  Stethoscope, 
  CheckCircle, 
  Clock, 
  X, 
  Search, 
  Bed, 
  Activity, 
  FileText, 
  ChevronRight, 
  TrendingUp, 
  DollarSign, 
  AlertCircle 
} from 'lucide-react';

const ReceptionistDashboard = ({ activeTab }) => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [ots, setOts] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms & Modal states
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [admissionForm, setAdmissionForm] = useState({
    patientId: '', bedId: '', diagnosis: '', treatmentPlan: '', icuRecommended: false
  });

  const [showSurgeryModal, setShowSurgeryModal] = useState(false);
  const [surgeryForm, setSurgeryForm] = useState({
    patientId: '', surgeonId: '', operationTheaterId: '', surgeryDate: '', type: '', surgeryFee: 5000
  });

  const [showBillModal, setShowBillModal] = useState(false);
  const [billingForm, setBillingForm] = useState({
    patientId: '', admissionId: '', surgeryId: '', otherCharges: 1500
  });
  const [estimatedBill, setEstimatedBill] = useState(null);
  const [calculatingBill, setCalculatingBill] = useState(false);

  // Patient Registration Form
  const [patientForm, setPatientForm] = useState({
    username: '', fullName: '', email: '', phone: '',
    dateOfBirth: '', gender: 'Male', bloodGroup: 'O+', address: ''
  });

  // Appointment Booking Form
  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '', doctorId: '', appointmentDate: '', reason: ''
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAll();
  }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, dRes, aRes, bedRes, otRes, admRes, surgRes, billRes] = await Promise.all([
        patientAPI.getAll(),
        doctorAPI.getAll(),
        appointmentAPI.getAll(),
        bedAPI.getAll(),
        operationTheaterAPI.getAll(),
        admissionAPI.getAll(),
        surgeryAPI.getAll(),
        billingAPI.getAll()
      ]);
      setPatients(pRes.data);
      setDoctors(dRes.data);
      setAppointments(aRes.data);
      setBeds(bedRes.data);
      setOts(otRes.data);
      setAdmissions(admRes.data);
      setSurgeries(surgRes.data);
      setBillings(billRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => { setSuccessMsg(msg); setErrorMsg(''); setTimeout(() => setSuccessMsg(''), 4000); };
  const showError = (msg) => { setErrorMsg(msg); setSuccessMsg(''); setTimeout(() => setErrorMsg(''), 4000); };

  // Register Patient
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    const { username, fullName, email, phone, dateOfBirth, address } = patientForm;
    if (!username || !fullName || !email || !phone || !dateOfBirth || !address) {
      showError('Please fill in all required fields');
      return;
    }
    try {
      await patientAPI.create(patientForm);
      showSuccess('Patient registered successfully!');
      setPatientForm({ username: '', fullName: '', email: '', phone: '', dateOfBirth: '', gender: 'Male', bloodGroup: 'O+', address: '' });
      fetchAll();
    } catch (err) {
      showError(err.response?.data || 'Failed to register patient');
    }
  };

  // Book Appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    const { patientId, doctorId, appointmentDate, reason } = appointmentForm;
    if (!patientId || !doctorId || !appointmentDate || !reason) {
      showError('Please fill in all required fields');
      return;
    }
    try {
      await appointmentAPI.create(appointmentForm);
      showSuccess('Appointment booked successfully!');
      setAppointmentForm({ patientId: '', doctorId: '', appointmentDate: '', reason: '' });
      fetchAll();
    } catch (err) {
      showError(err.response?.data || 'Failed to book appointment');
    }
  };

  // Admit Patient
  const handleAdmitPatient = async (e) => {
    e.preventDefault();
    const { patientId, bedId, diagnosis, treatmentPlan } = admissionForm;
    if (!patientId || !bedId || !diagnosis) {
      showError('Patient, Bed, and Diagnosis are required');
      return;
    }
    try {
      await admissionAPI.admit(admissionForm);
      showSuccess('Patient admitted and bed allocated successfully!');
      setAdmissionForm({ patientId: '', bedId: '', diagnosis: '', treatmentPlan: '', icuRecommended: false });
      setShowAdmitModal(false);
      fetchAll();
    } catch (err) {
      showError(err.response?.data || 'Failed to admit patient');
    }
  };

  // Discharge Patient
  const handleDischargePatient = async (admissionId) => {
    if (!window.confirm('Are you sure you want to discharge this patient?')) return;
    try {
      await admissionAPI.discharge(admissionId);
      showSuccess('Patient discharged successfully. Bed released!');
      
      // Auto-trigger Billing modal for this discharged patient
      const admission = admissions.find(a => a.id === admissionId);
      if (admission) {
        // Find if they also had surgeries
        const patientSurg = surgeries.find(s => s.patientId === admission.patientId && s.status !== 'COMPLETED');
        setBillingForm({
          patientId: admission.patientId,
          admissionId: admissionId,
          surgeryId: patientSurg ? patientSurg.id : '',
          otherCharges: 1500
        });
        handleCalculateBillEstimate(admission.patientId, admissionId, patientSurg ? patientSurg.id : '', 1500);
        setShowBillModal(true);
      }
      fetchAll();
    } catch (err) {
      showError(err.response?.data || 'Failed to discharge patient');
    }
  };

  // Schedule Surgery
  const handleScheduleSurgery = async (e) => {
    e.preventDefault();
    const { patientId, surgeonId, operationTheaterId, surgeryDate, type, surgeryFee } = surgeryForm;
    if (!patientId || !surgeonId || !operationTheaterId || !surgeryDate || !type) {
      showError('Please fill in all required fields');
      return;
    }
    try {
      await surgeryAPI.schedule(surgeryForm);
      showSuccess('Surgery scheduled successfully! Operation Theater allocated.');
      setSurgeryForm({ patientId: '', surgeonId: '', operationTheaterId: '', surgeryDate: '', type: '', surgeryFee: 5000 });
      setShowSurgeryModal(false);
      fetchAll();
    } catch (err) {
      showError(err.response?.data || 'Failed to schedule surgery');
    }
  };

  // Update Surgery Status
  const handleUpdateSurgeryStatus = async (id, status) => {
    try {
      await surgeryAPI.updateStatus(id, status);
      showSuccess(`Surgery status updated to ${status}!`);
      fetchAll();
    } catch (err) {
      showError(err.response?.data || 'Failed to update surgery status');
    }
  };

  // Calculate Bill Estimate
  const handleCalculateBillEstimate = async (pId, admId, surgId, oCharges) => {
    if (!pId) return;
    setCalculatingBill(true);
    try {
      const res = await billingAPI.calculate(pId, admId, surgId, oCharges);
      setEstimatedBill(res.data);
    } catch (err) {
      console.error(err);
      showError('Failed to calculate bill estimate');
    } finally {
      setCalculatingBill(false);
    }
  };

  // Confirm and Create Invoice
  const handleGenerateInvoice = async () => {
    if (!estimatedBill) return;
    try {
      await billingAPI.createBill(estimatedBill);
      showSuccess('Billing invoice generated successfully!');
      setShowBillModal(false);
      setEstimatedBill(null);
      fetchAll();
    } catch (err) {
      showError(err.response?.data || 'Failed to generate invoice');
    }
  };

  // Record Bill Payment (Simulating cash or Razorpay)
  const handleRecordPayment = async (billId, method) => {
    const payDetails = {
      paymentMethod: method,
      razorpayOrderId: method === 'ONLINE' ? 'order_' + Math.random().toString(36).substr(2, 9) : null,
      razorpayPaymentId: method === 'ONLINE' ? 'pay_' + Math.random().toString(36).substr(2, 9) : null
    };
    try {
      await billingAPI.pay(billId, payDetails);
      showSuccess(`Payment of INV-${String(billId).padStart(4, '0')} recorded via ${method}!`);
      fetchAll();
    } catch (err) {
      showError(err.response?.data || 'Failed to process payment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading reception data...</span>
        </div>
      </div>
    );
  }

  // Filter beds/patients/admissions by search
  const filteredAdmissions = admissions.filter(adm => 
    adm.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.bedNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSurgeries = surgeries.filter(surg => 
    surg.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surg.surgeonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surg.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBillings = billings.filter(bill => 
    bill.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== OVERVIEW TAB =====
  if (activeTab === 'overview') {
    return (
      <div className="space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: 'Total Patients', value: patients.length, icon: Users, bg: 'bg-sky-50 border-sky-100', color: 'text-sky-600' },
            { label: 'Active Admissions', value: admissions.filter(a => a.status === 'ADMITTED').length, icon: Bed, bg: 'bg-emerald-50 border-emerald-100', color: 'text-emerald-600' },
            { label: 'Total Surgeries', value: surgeries.length, icon: Activity, bg: 'bg-indigo-50 border-indigo-100', color: 'text-indigo-600' },
            { label: 'Pending Billings', value: billings.filter(b => b.status === 'PENDING').length, icon: CreditCard, bg: 'bg-amber-50 border-amber-100', color: 'text-amber-600' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl border p-5 ${card.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                  <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{card.value}</h3>
                </div>
                <card.icon className={`w-8 h-8 ${card.color} opacity-40`} />
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Appointments */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Appointments</h3>
                <p className="text-[11px] text-slate-400">Scheduled outpatient sessions</p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {appointments.slice(0, 5).map(appt => (
                <div key={appt.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">{appt.patientName}</h4>
                    <p className="text-[10px] text-slate-400">{appt.doctorName} &bull; {appt.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-slate-500 block">
                      {new Date(appt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>{appt.status}</span>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && <p className="p-6 text-center text-xs text-slate-400">No appointments recorded.</p>}
            </div>
          </div>

          {/* Active Wards & Beds */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Bed Occupancy</h3>
                <p className="text-[11px] text-slate-400">Current active ward stays</p>
              </div>
              <Bed className="w-4 h-4 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {admissions.filter(a => a.status === 'ADMITTED').slice(0, 5).map(adm => (
                <div key={adm.id} className="p-4 flex justify-between items-center hover:bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">{adm.patientName}</h4>
                    <p className="text-[10px] text-slate-400">Bed: {adm.bedNumber} ({adm.bedType}) &bull; {adm.recoveryStatus}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-bold">ADMITTED</span>
                </div>
              ))}
              {admissions.filter(a => a.status === 'ADMITTED').length === 0 && (
                <p className="p-6 text-center text-xs text-slate-400">No active patient admissions currently.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== REGISTER PATIENT TAB =====
  if (activeTab === 'register') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Register New Patient</h2>
              <p className="text-xs text-slate-400">Create a patient account (default password: pat123)</p>
            </div>
          </div>

          {successMsg && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">{successMsg}</div>}
          {errorMsg && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{errorMsg}</div>}

          <form onSubmit={handleRegisterPatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Username *</label>
                <input type="text" value={patientForm.username} onChange={e => setPatientForm({...patientForm, username: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" placeholder="e.g. pat_wayne" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Full Name *</label>
                <input type="text" value={patientForm.fullName} onChange={e => setPatientForm({...patientForm, fullName: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Email *</label>
                <input type="email" value={patientForm.email} onChange={e => setPatientForm({...patientForm, email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Phone *</label>
                <input type="text" value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Date of Birth *</label>
                <input type="date" value={patientForm.dateOfBirth} onChange={e => setPatientForm({...patientForm, dateOfBirth: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Gender</label>
                <select value={patientForm.gender} onChange={e => setPatientForm({...patientForm, gender: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Blood Group</label>
                <select value={patientForm.bloodGroup} onChange={e => setPatientForm({...patientForm, bloodGroup: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
                  {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Address *</label>
              <textarea value={patientForm.address} onChange={e => setPatientForm({...patientForm, address: e.target.value})} rows="2" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" placeholder="Street, City, ZIP" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 text-sm font-semibold transition-all cursor-pointer">
              Register Patient
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== BOOK APPOINTMENT TAB =====
  if (activeTab === 'book') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Book Appointment</h2>
              <p className="text-xs text-slate-400">Schedule a patient visit with a doctor. A payment record is auto-created.</p>
            </div>
          </div>

          {successMsg && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">{successMsg}</div>}
          {errorMsg && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">{errorMsg}</div>}

          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Select Patient *</label>
                <select value={appointmentForm.patientId} onChange={e => setAppointmentForm({...appointmentForm, patientId: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400">
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.bloodGroup})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Select Doctor *</label>
                <select value={appointmentForm.doctorId} onChange={e => setAppointmentForm({...appointmentForm, doctorId: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400">
                  <option value="">-- Select Doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.fullName} — {d.specialization} (₹{d.consultationFee})</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Appointment Date & Time *</label>
              <input type="datetime-local" value={appointmentForm.appointmentDate} onChange={e => setAppointmentForm({...appointmentForm, appointmentDate: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Reason for Visit *</label>
              <textarea value={appointmentForm.reason} onChange={e => setAppointmentForm({...appointmentForm, reason: e.target.value})} rows="3" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-400" placeholder="Describe symptoms or purpose of visit" />
            </div>
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-xl py-3 text-sm font-semibold transition-all cursor-pointer">
              Book Appointment
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== ADMISSIONS TAB =====
  if (activeTab === 'admissions') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-sans">Bed Allocation & Admissions</h2>
            <p className="text-xs text-slate-400 mt-1">Manage patient hospitalizations and ward status</p>
          </div>
          <button 
            onClick={() => {
              setAdmissionForm({ patientId: '', bedId: '', diagnosis: '', treatmentPlan: '', icuRecommended: false });
              setShowAdmitModal(true);
            }} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Bed className="w-4 h-4" />
            Admit Patient
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search admissions by patient, bed or status..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="text-sm text-slate-600 focus:outline-none w-full bg-transparent"
          />
        </div>

        {/* Admissions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Patient', 'Bed Allocated', 'Bed Type', 'Admit Date', 'Discharge Date', 'Diagnosis', 'Recovery Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.map(adm => (
                <tr key={adm.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{adm.patientName}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{adm.bedNumber || '—'}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {adm.bedType ? (
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        adm.bedType === 'ICU' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                      }`}>{adm.bedType}</span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(adm.admissionDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]" title={adm.diagnosis}>{adm.diagnosis}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      adm.recoveryStatus === 'STABLE' ? 'bg-emerald-50 text-emerald-600' :
                      adm.recoveryStatus === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>{adm.recoveryStatus || 'UNDER OBSERVATION'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {adm.status === 'ADMITTED' ? (
                      <button 
                        onClick={() => handleDischargePatient(adm.id)}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Discharge
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400">DISCHARGED</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAdmissions.length === 0 && (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-sm">No admissions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Admit Modal */}
        {showAdmitModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Patient Bed Admission Form</h3>
                <button onClick={() => setShowAdmitModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdmitPatient} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Patient *</label>
                  <select 
                    value={admissionForm.patientId} 
                    onChange={e => setAdmissionForm({...admissionForm, patientId: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.bloodGroup})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Available Bed *</label>
                  <select 
                    value={admissionForm.bedId} 
                    onChange={e => setAdmissionForm({...admissionForm, bedId: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="">-- Choose Available Bed --</option>
                    {beds
                      .filter(b => b.status === 'AVAILABLE' && (admissionForm.icuRecommended ? b.type === 'ICU' : b.type !== 'ICU'))
                      .map(b => (
                        <option key={b.id} value={b.id}>{b.bedNumber} — {b.type} (₹{b.dailyCharges}/day)</option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diagnosis / Reason *</label>
                  <input 
                    type="text" 
                    value={admissionForm.diagnosis} 
                    onChange={e => setAdmissionForm({...admissionForm, diagnosis: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500" 
                    placeholder="e.g., Severe acute appendicitis"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Treatment Plan</label>
                  <textarea 
                    value={admissionForm.treatmentPlan} 
                    onChange={e => setAdmissionForm({...admissionForm, treatmentPlan: e.target.value})} 
                    rows="2" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Initial medicine and observations"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="icuRecommended" 
                    checked={admissionForm.icuRecommended} 
                    onChange={e => setAdmissionForm({...admissionForm, icuRecommended: e.target.checked, bedId: ''})} 
                    className="rounded border-slate-350 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="icuRecommended" className="text-xs font-semibold text-slate-600">Patient requires ICU Admission</label>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 text-xs font-bold transition-all cursor-pointer">
                  Confirm Admission
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== SURGERIES TAB =====
  if (activeTab === 'surgeries') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-sans">Surgeries & OTs</h2>
            <p className="text-xs text-slate-400 mt-1">Schedule and monitor hospital surgical workflows</p>
          </div>
          <button 
            onClick={() => {
              setSurgeryForm({ patientId: '', surgeonId: '', operationTheaterId: '', surgeryDate: '', type: '', surgeryFee: 5000 });
              setShowSurgeryModal(true);
            }} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            Schedule Surgery
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search surgeries by patient, surgeon or type..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="text-sm text-slate-600 focus:outline-none w-full bg-transparent"
          />
        </div>

        {/* Surgeries Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Patient', 'Surgeon', 'OT', 'Date', 'Type', 'Surgery Fee', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurgeries.map(surg => (
                <tr key={surg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{surg.patientName}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{surg.surgeonName || '—'}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{surg.operationTheaterName || '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(surg.surgeryDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-semibold">{surg.type}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">₹{surg.surgeryFee?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      surg.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                      surg.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600' :
                      surg.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>{surg.status}</span>
                  </td>
                  <td className="px-6 py-4 flex gap-1">
                    {surg.status === 'RECOMMENDED' && (
                      <button 
                        onClick={() => {
                          setSurgeryForm({
                            id: surg.id,
                            patientId: surg.patientId,
                            surgeonId: surg.surgeonId,
                            operationTheaterId: surg.operationTheaterId || '',
                            surgeryDate: surg.surgeryDate ? surg.surgeryDate.substring(0, 16) : '',
                            type: surg.type,
                            surgeryFee: surg.surgeryFee || 5000
                          });
                          setShowSurgeryModal(true);
                        }}
                        className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] cursor-pointer"
                      >
                        Schedule Slot
                      </button>
                    )}
                    {surg.status === 'SCHEDULED' && (
                      <>
                        <button 
                          onClick={() => handleUpdateSurgeryStatus(surg.id, 'IN_PROGRESS')}
                          className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-[10px]"
                        >
                          Start
                        </button>
                        <button 
                          onClick={() => handleUpdateSurgeryStatus(surg.id, 'CANCELLED')}
                          className="px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[10px]"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {surg.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => handleUpdateSurgeryStatus(surg.id, 'COMPLETED')}
                        className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-[10px]"
                      >
                        Complete
                      </button>
                    )}
                    {surg.status === 'COMPLETED' && <span className="text-[10px] text-slate-400">FINALISED</span>}
                    {surg.status === 'CANCELLED' && <span className="text-[10px] text-rose-400">CANCELLED</span>}
                  </td>
                </tr>
              ))}
              {filteredSurgeries.length === 0 && (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-sm">No surgeries scheduled.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Surgery Modal */}
        {showSurgeryModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Schedule Surgery Form</h3>
                <button onClick={() => setShowSurgeryModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleScheduleSurgery} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient *</label>
                    <select 
                      value={surgeryForm.patientId} 
                      onChange={e => setSurgeryForm({...surgeryForm, patientId: e.target.value})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Select Patient --</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surgeon/Doctor *</label>
                    <select 
                      value={surgeryForm.surgeonId} 
                      onChange={e => setSurgeryForm({...surgeryForm, surgeonId: e.target.value})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Select Surgeon --</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.fullName} ({d.specialization})</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign OT Room *</label>
                    <select 
                      value={surgeryForm.operationTheaterId} 
                      onChange={e => setSurgeryForm({...surgeryForm, operationTheaterId: e.target.value})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Select OT --</option>
                      {ots.filter(ot => ot.status === 'AVAILABLE').map(ot => (
                        <option key={ot.id} value={ot.id}>{ot.name} (₹{ot.baseCharges})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surgery Date *</label>
                    <input 
                      type="datetime-local" 
                      value={surgeryForm.surgeryDate} 
                      onChange={e => setSurgeryForm({...surgeryForm, surgeryDate: e.target.value})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surgery Type *</label>
                    <input 
                      type="text" 
                      value={surgeryForm.type} 
                      onChange={e => setSurgeryForm({...surgeryForm, type: e.target.value})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" 
                      placeholder="e.g., Cardiology, Bypass"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surgery Fee (₹) *</label>
                    <input 
                      type="number" 
                      value={surgeryForm.surgeryFee} 
                      onChange={e => setSurgeryForm({...surgeryForm, surgeryFee: parseFloat(e.target.value)})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-bold transition-all cursor-pointer">
                  Schedule Surgery
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== BILLING TAB =====
  if (activeTab === 'billing') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-sans">Billing & Invoices</h2>
            <p className="text-xs text-slate-400 mt-1">Generate hospital stay invoices and collect patient payments</p>
          </div>
          <button 
            onClick={() => {
              setBillingForm({ patientId: '', admissionId: '', surgeryId: '', otherCharges: 1500 });
              setEstimatedBill(null);
              setShowBillModal(true);
            }} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            Generate Bill
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search bills by patient name or status..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="text-sm text-slate-600 focus:outline-none w-full bg-transparent"
          />
        </div>

        {/* Billing Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Invoice #', 'Patient Name', 'Consult Fees', 'Room Charges', 'Surgery Fees', 'Med/Test Charges', 'Total Bill', 'Status', 'Payment Info', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBillings.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">INV-{String(bill.id).padStart(4, '0')}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{bill.patientName}</td>
                  <td className="px-6 py-4 text-slate-600">₹{bill.consultationFees?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">₹{bill.roomCharges?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">₹{bill.surgeryFees?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">₹{bill.otherCharges?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">₹{bill.totalAmount?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>{bill.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {bill.status === 'PAID' ? (
                      <div>
                        <p className="font-semibold">{bill.paymentMethod}</p>
                        <p className="text-[9px] text-slate-400">
                          {bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString(undefined, { dateStyle: 'short' }) : ''}
                        </p>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 flex gap-1">
                    {bill.status === 'PENDING' ? (
                      <>
                        <button 
                          onClick={() => handleRecordPayment(bill.id, 'CASH')}
                          className="px-2 py-1 rounded bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold text-[10px]"
                        >
                          Paid Cash
                        </button>
                        <button 
                          onClick={() => handleRecordPayment(bill.id, 'ONLINE')}
                          className="px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[10px]"
                        >
                          Paid Online
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400">SETTLED</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBillings.length === 0 && (
                <tr><td colSpan="10" className="px-6 py-12 text-center text-slate-400 text-sm">No billing records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Generate Bill Modal */}
        {showBillModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Dynamic Invoice Calculator</h3>
                <button onClick={() => setShowBillModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient *</label>
                    <select 
                      value={billingForm.patientId} 
                      onChange={e => {
                        const val = e.target.value;
                        setBillingForm({...billingForm, patientId: val});
                        // Automatically update estimate
                        handleCalculateBillEstimate(val, billingForm.admissionId, billingForm.surgeryId, billingForm.otherCharges);
                      }} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- Select Patient --</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Admission Record</label>
                    <select 
                      value={billingForm.admissionId} 
                      onChange={e => {
                        const val = e.target.value;
                        setBillingForm({...billingForm, admissionId: val});
                        handleCalculateBillEstimate(billingForm.patientId, val, billingForm.surgeryId, billingForm.otherCharges);
                      }} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- No Stay (Outpatient) --</option>
                      {admissions.filter(a => a.patientId == billingForm.patientId).map(a => (
                        <option key={a.id} value={a.id}>Stay #{a.id} ({a.bedNumber}) — {a.status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surgery Record</label>
                    <select 
                      value={billingForm.surgeryId} 
                      onChange={e => {
                        const val = e.target.value;
                        setBillingForm({...billingForm, surgeryId: val});
                        handleCalculateBillEstimate(billingForm.patientId, billingForm.admissionId, val, billingForm.otherCharges);
                      }} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="">-- No Surgery --</option>
                      {surgeries.filter(s => s.patientId == billingForm.patientId).map(s => (
                        <option key={s.id} value={s.id}>{s.type} (₹{s.surgeryFee}) — {s.status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Medicines & Tests Cost (₹)</label>
                    <input 
                      type="number" 
                      value={billingForm.otherCharges} 
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setBillingForm({...billingForm, otherCharges: val});
                        handleCalculateBillEstimate(billingForm.patientId, billingForm.admissionId, billingForm.surgeryId, val);
                      }} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" 
                    />
                  </div>
                </div>

                {/* Estimate Preview */}
                {calculatingBill ? (
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center text-xs text-slate-500">Calculating hospital dues...</div>
                ) : estimatedBill ? (
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-2.5 font-sans">
                    <div className="flex justify-between items-center text-xs border-b border-dashed border-slate-200 pb-2">
                      <span className="font-semibold text-slate-500">Invoice Items</span>
                      <span className="font-semibold text-slate-500">Charges (INR)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Consultation & Appointment Fees</span>
                      <span className="font-mono text-slate-800 font-semibold">₹{estimatedBill.consultationFees?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Room Stay & Daily Charges</span>
                      <span className="font-mono text-slate-800 font-semibold">₹{estimatedBill.roomCharges?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Surgery & Surgeon Fees</span>
                      <span className="font-mono text-slate-800 font-semibold">₹{estimatedBill.surgeryFees?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Pharmacy & Diagnostics Cost</span>
                      <span className="font-mono text-slate-800 font-semibold">₹{estimatedBill.otherCharges?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-t border-slate-200 pt-2.5 text-slate-800">
                      <span>Total Amount Payable</span>
                      <span className="font-mono text-emerald-600">₹{estimatedBill.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/50 text-center text-xs text-indigo-600 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Select a patient to compute billing charges.
                  </div>
                )}

                <button 
                  disabled={!estimatedBill}
                  onClick={handleGenerateInvoice}
                  className={`w-full text-white rounded-xl py-3 text-xs font-bold transition-all cursor-pointer ${
                    estimatedBill ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Confirm & Generate Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ReceptionistDashboard;
