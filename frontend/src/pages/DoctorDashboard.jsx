import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  appointmentAPI, 
  admissionAPI, 
  surgeryAPI, 
  bedAPI 
} from '../services/api';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  X, 
  Pill, 
  Bed, 
  Activity, 
  HeartPulse, 
  DollarSign, 
  Search 
} from 'lucide-react';

const DoctorDashboard = ({ activeTab = 'appointments' }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prescription Modal
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescription, setPrescription] = useState('');
  const [recSurgery, setRecSurgery] = useState(false);
  const [surgType, setSurgType] = useState('General Surgery');

  // Admission Update Modal (Doctor updating recovery info)
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [admissionUpdateForm, setAdmissionUpdateForm] = useState({
    diagnosis: '', treatmentPlan: '', recoveryStatus: '', icuRecommended: false, bedId: ''
  });

  // Surgery Notes Modal (Doctor updating surgery details)
  const [showSurgeryModal, setShowSurgeryModal] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState(null);
  const [surgeryUpdateForm, setSurgeryUpdateForm] = useState({
    preOpNotes: '', postOpNotes: '', surgeryFee: 0, icuRecommended: false
  });

  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'appointments') {
        const res = await appointmentAPI.getByDoctor(user.doctorId);
        setAppointments(res.data);
      } else if (activeTab === 'admissions') {
        const [admRes, bedRes] = await Promise.all([
          admissionAPI.getAll(),
          bedAPI.getAll()
        ]);
        setAdmissions(admRes.data);
        setBeds(bedRes.data);
      } else if (activeTab === 'surgeries') {
        const res = await surgeryAPI.getByDoctor(user.doctorId);
        setSurgeries(res.data);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Saved Prescriptions
  const handleSavePrescription = async () => {
    if (!prescription.trim()) { alert('Please enter a prescription'); return; }
    try {
      await appointmentAPI.updatePrescription(selectedAppointment.id, prescription);
      if (recSurgery) {
        await surgeryAPI.schedule({
          patientId: selectedAppointment.patientId,
          surgeonId: user.doctorId,
          type: surgType,
          status: 'RECOMMENDED',
          surgeryFee: 5000.0,
          preOpNotes: 'Recommended during consultation.'
        });
      }
      alert(recSurgery ? 'Prescription saved & Surgery recommended!' : 'Prescription saved successfully!');
      setShowPrescriptionModal(false);
      setRecSurgery(false);
      setSurgType('General Surgery');
      fetchData();
    } catch (err) {
      alert('Failed to update prescription');
    }
  };

  // Confirm consult status
  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Save Ward Admission Recovery Updates
  const handleSaveAdmissionUpdates = async (e) => {
    e.preventDefault();
    try {
      await admissionAPI.update(selectedAdmission.id, admissionUpdateForm);
      alert('Admission recovery status updated successfully!');
      setShowAdmissionModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data || 'Failed to update admission details');
    }
  };

  // Save Surgery Clinical Details & Fee
  const handleSaveSurgeryUpdates = async (e) => {
    e.preventDefault();
    try {
      await surgeryAPI.updateClinical(selectedSurgery.id, surgeryUpdateForm);
      alert('Surgery clinical notes and fee saved successfully!');
      setShowSurgeryModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data || 'Failed to save surgery details');
    }
  };

  // Update Surgery Operation Status
  const handleUpdateSurgeryStatus = async (id, status) => {
    try {
      await surgeryAPI.updateStatus(id, status);
      alert(`Surgery status updated to ${status}`);
      fetchData();
    } catch (err) {
      alert('Failed to update surgery status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading medical data...</span>
        </div>
      </div>
    );
  }

  // Filter Admissions/Surgeries
  const filteredAdmissions = admissions.filter(adm => 
    adm.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.bedNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adm.recoveryStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSurgeries = surgeries.filter(surg => 
    surg.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surg.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surg.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== APPOINTMENTS TAB =====
  if (activeTab === 'appointments') {
    const filteredAppts = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);
    return (
      <div className="space-y-6 font-sans">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Appointments', value: appointments.length, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
            { label: 'Pending Response', value: appointments.filter(a => a.status === 'PENDING').length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
            { label: 'Confirmed Vis', value: appointments.filter(a => a.status === 'CONFIRMED').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { label: 'Completed Visits', value: appointments.filter(a => a.status === 'COMPLETED').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-slate-200 w-fit">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === f ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Patient', 'Date & Time', 'Reason', 'Status', 'Prescription Notes', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppts.map(appt => (
                <tr key={appt.id} className="hover:bg-slate-50/85 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-700">{appt.patientName}</td>
                  <td className="px-5 py-4 text-slate-600 text-xs">
                    {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate">{appt.reason || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      appt.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      appt.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs max-w-[150px] truncate">
                    {appt.prescription || <span className="italic text-slate-300">None yet</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {appt.status === 'PENDING' && (
                        <button onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')} className="px-2.5 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer">
                          Confirm
                        </button>
                      )}
                      {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                        <>
                          <button onClick={() => { setSelectedAppointment(appt); setPrescription(appt.prescription || ''); setShowPrescriptionModal(true); }} className="px-2.5 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-lg cursor-pointer flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5" /> Rx
                          </button>
                          <button onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')} className="px-2.5 py-1.5 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer">
                            Cancel
                          </button>
                        </>
                      )}
                      {appt.status === 'COMPLETED' && (
                        <button onClick={() => { setSelectedAppointment(appt); setPrescription(appt.prescription || ''); setShowPrescriptionModal(true); }} className="px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer">
                          View Rx
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAppts.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-400 text-sm">No scheduled consultations.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Prescription Write Modal */}
        {showPrescriptionModal && selectedAppointment && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-slate-100 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Write Prescription Note</h3>
                <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-slate-400 mb-4">Patient: <strong>{selectedAppointment.patientName}</strong> &bull; Reason: {selectedAppointment.reason}</p>
              <textarea 
                value={prescription} 
                onChange={e => setPrescription(e.target.value)} 
                rows="5" 
                readOnly={selectedAppointment.status === 'COMPLETED'}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white" 
                placeholder="Prescribe medicines, dosage schedules, medical tests, and recovery guidelines..."
              />
              {selectedAppointment.status !== 'COMPLETED' && (
                <div className="mt-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="recSurgery" 
                      checked={recSurgery} 
                      onChange={e => setRecSurgery(e.target.checked)} 
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="recSurgery" className="text-xs font-bold text-slate-600 uppercase">Recommend Surgical Procedure</label>
                  </div>
                  {recSurgery && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Enter Surgery Procedure Type</label>
                      <input 
                        type="text" 
                        value={surgType} 
                        onChange={e => setSurgType(e.target.value)} 
                        className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-teal-400 bg-white" 
                        placeholder="e.g., Cardiology Stent, Appendectomy"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer">Close</button>
                {selectedAppointment.status !== 'COMPLETED' && (
                  <button type="button" onClick={handleSavePrescription} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold cursor-pointer">Save & Complete Consult</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== WARDS & ADMISSIONS TAB =====
  if (activeTab === 'admissions') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-sans">Active Wards & Patient Recovery</h2>
          <p className="text-xs text-slate-400 mt-1">Review admitted patients, assign treatment plans, and recommend ICU bed shifts</p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search active patients by name, bed, diagnosis..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="text-sm text-slate-600 focus:outline-none w-full bg-transparent"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Patient', 'Bed Allocated', 'Ward Type', 'Admit Date', 'Primary Diagnosis', 'Recovery Status', 'ICU Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.map(adm => (
                <tr key={adm.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{adm.patientName}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{adm.bedNumber || '—'}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-bold">{adm.bedType || '—'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(adm.admissionDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate">{adm.diagnosis}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      adm.recoveryStatus === 'STABLE' ? 'bg-emerald-50 text-emerald-600' :
                      adm.recoveryStatus === 'CRITICAL' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>{adm.recoveryStatus || 'UNDER OBSERVATION'}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    {adm.icuRecommended ? (
                      <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">ICU REQ</span>
                    ) : (
                      <span className="text-slate-400">Regular</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {adm.status === 'ADMITTED' ? (
                      <button 
                        onClick={() => {
                          setSelectedAdmission(adm);
                          setAdmissionUpdateForm({
                            diagnosis: adm.diagnosis || '',
                            treatmentPlan: adm.treatmentPlan || '',
                            recoveryStatus: adm.recoveryStatus || 'UNDER_OBSERVATION',
                            icuRecommended: adm.icuRecommended || false,
                            bedId: adm.bedId || ''
                          });
                          setShowAdmissionModal(true);
                        }}
                        className="px-3 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-600 font-bold text-xs cursor-pointer border border-teal-200"
                      >
                        Clinical Checkup
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Discharged</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAdmissions.length === 0 && (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-sm">No ward patient stays found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Admission Clinical Update Modal */}
        {showAdmissionModal && selectedAdmission && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Patient Clinical Update & Treatment Plan</h3>
                <button onClick={() => setShowAdmissionModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveAdmissionUpdates} className="p-6 space-y-4">
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-slate-700">Patient: <strong className="font-bold">{selectedAdmission.patientName}</strong></p>
                  <p className="text-slate-500 mt-0.5">Current Room: Bed {selectedAdmission.bedNumber} ({selectedAdmission.bedType})</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Diagnosis</label>
                  <input 
                    type="text" 
                    value={admissionUpdateForm.diagnosis} 
                    onChange={e => setAdmissionUpdateForm({...admissionUpdateForm, diagnosis: e.target.value})} 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign Treatment Plan</label>
                  <textarea 
                    value={admissionUpdateForm.treatmentPlan} 
                    onChange={e => setAdmissionUpdateForm({...admissionUpdateForm, treatmentPlan: e.target.value})} 
                    rows="3" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white" 
                    placeholder="Describe specific drugs, fluid rates, and diagnostic tests..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Recovery Status</label>
                    <select 
                      value={admissionUpdateForm.recoveryStatus} 
                      onChange={e => setAdmissionUpdateForm({...admissionUpdateForm, recoveryStatus: e.target.value})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                    >
                      <option value="UNDER_OBSERVATION">Under Observation</option>
                      <option value="STABLE">Stable / Improving</option>
                      <option value="CRITICAL">Critical Condition</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transfer Bed Room</label>
                    <select 
                      value={admissionUpdateForm.bedId} 
                      onChange={e => setAdmissionUpdateForm({...admissionUpdateForm, bedId: e.target.value})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-teal-500 bg-white"
                    >
                      <option value="">-- Keep Current Bed --</option>
                      {beds.filter(b => b.status === 'AVAILABLE' || b.id === selectedAdmission.bedId).map(b => (
                        <option key={b.id} value={b.id}>{b.bedNumber} ({b.type})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="recommendIcu" 
                    checked={admissionUpdateForm.icuRecommended} 
                    onChange={e => setAdmissionUpdateForm({...admissionUpdateForm, icuRecommended: e.target.checked})} 
                    className="rounded border-slate-350 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="recommendIcu" className="text-xs font-semibold text-slate-600">Urgent ICU stay recommended</label>
                </div>
                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-3 text-xs font-bold transition-all cursor-pointer">
                  Save Clinical Plan
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
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-sans">Surgery Schedules & Operation Tracking</h2>
          <p className="text-xs text-slate-400 mt-1">Review assigned surgeries, track status, add pre/post op medical notes, and configure surgery fees</p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search surgeries by patient or type..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="text-sm text-slate-600 focus:outline-none w-full bg-transparent"
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Patient', 'OT Room', 'Surgery Date', 'Surgery Type', 'Surgery Fee', 'ICU Recommended', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurgeries.map(surg => (
                <tr key={surg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{surg.patientName}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{surg.operationTheaterName}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(surg.surgeryDate).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium text-xs">{surg.type}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">₹{surg.surgeryFee?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-semibold">
                    {surg.icuRecommended ? (
                      <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                      surg.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      surg.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      surg.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{surg.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 items-center">
                      <button 
                        onClick={() => {
                          setSelectedSurgery(surg);
                          setSurgeryUpdateForm({
                            preOpNotes: surg.preOpNotes || '',
                            postOpNotes: surg.postOpNotes || '',
                            surgeryFee: surg.surgeryFee || 5000,
                            icuRecommended: surg.icuRecommended || false
                          });
                          setShowSurgeryModal(true);
                        }}
                        className="px-2 py-1 rounded border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-[10px] cursor-pointer"
                      >
                        Clinical Notes & Fee
                      </button>
                      {surg.status === 'SCHEDULED' && (
                        <button 
                          onClick={() => handleUpdateSurgeryStatus(surg.id, 'IN_PROGRESS')}
                          className="px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-700 font-bold text-[10px]"
                        >
                          Start
                        </button>
                      )}
                      {surg.status === 'IN_PROGRESS' && (
                        <button 
                          onClick={() => handleUpdateSurgeryStatus(surg.id, 'COMPLETED')}
                          className="px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-550 font-bold text-[10px]"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSurgeries.length === 0 && (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-sm">No surgeries scheduled.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Surgery Note Modal */}
        {showSurgeryModal && selectedSurgery && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Surgical Clinical configuration</h3>
                <button onClick={() => setShowSurgeryModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveSurgeryUpdates} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Patient Name</label>
                    <p className="text-sm font-semibold text-slate-700">{selectedSurgery.patientName}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Configure Surgery Fee (₹)</label>
                    <input 
                      type="number" 
                      value={surgeryUpdateForm.surgeryFee} 
                      onChange={e => setSurgeryUpdateForm({...surgeryUpdateForm, surgeryFee: parseFloat(e.target.value) || 0})} 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pre-Operation Clinical Notes</label>
                  <textarea 
                    value={surgeryUpdateForm.preOpNotes} 
                    onChange={e => setSurgeryUpdateForm({...surgeryUpdateForm, preOpNotes: e.target.value})} 
                    rows="2.5" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white" 
                    placeholder="Patient vitals, fasting duration, blood requirements..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Post-Operation Recovery Notes</label>
                  <textarea 
                    value={surgeryUpdateForm.postOpNotes} 
                    onChange={e => setSurgeryUpdateForm({...surgeryUpdateForm, postOpNotes: e.target.value})} 
                    rows="2.5" 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-white" 
                    placeholder="Post-surgery recovery vitals, medications, diet..."
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="postSurgeryIcu" 
                    checked={surgeryUpdateForm.icuRecommended} 
                    onChange={e => setSurgeryUpdateForm({...surgeryUpdateForm, icuRecommended: e.target.checked})} 
                    className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="postSurgeryIcu" className="text-xs font-semibold text-slate-600">Transition patient to ICU Bed post-surgery</label>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-bold transition-all cursor-pointer">
                  Save Clinical Surgical Plan
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default DoctorDashboard;
