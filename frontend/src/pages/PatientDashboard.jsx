import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  appointmentAPI, 
  admissionAPI, 
  surgeryAPI, 
  billingAPI 
} from '../services/api';
import { 
  Calendar, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  Shield, 
  Sparkles, 
  IndianRupee, 
  Bed, 
  Activity 
} from 'lucide-react';

const PatientDashboard = ({ activeTab = 'overview' }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [billings, setBillings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulated Razorpay Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingBill, setPayingBill] = useState(null);
  const [paymentStep, setPaymentStep] = useState(0); // 0 = select method, 1 = processing, 2 = success
  const [selectedMethod, setSelectedMethod] = useState('UPI');

  // Detailed Bill Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const [aRes, admRes, surgRes, billRes] = await Promise.all([
          appointmentAPI.getByPatient(user.patientId),
          admissionAPI.getByPatient(user.patientId),
          surgeryAPI.getByPatient(user.patientId),
          billingAPI.getByPatient(user.patientId)
        ]);
        setAppointments(aRes.data);
        setAdmissions(admRes.data);
        setSurgeries(surgRes.data);
        setBillings(billRes.data);
      } else if (activeTab === 'admissions') {
        const res = await admissionAPI.getByPatient(user.patientId);
        setAdmissions(res.data);
      } else if (activeTab === 'surgeries') {
        const res = await surgeryAPI.getByPatient(user.patientId);
        setSurgeries(res.data);
      } else if (activeTab === 'prescriptions') {
        const res = await appointmentAPI.getByPatient(user.patientId);
        setAppointments(res.data);
      } else if (activeTab === 'payments') {
        const res = await billingAPI.getByPatient(user.patientId);
        setBillings(res.data);
      }
    } catch (err) {
      console.error('Error fetching patient dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (bill) => {
    setPayingBill(bill);
    setPaymentStep(0);
    setSelectedMethod('UPI');
    setShowPayModal(true);
  };

  const handleProcessPayment = async () => {
    setPaymentStep(1); // Processing animation
    setTimeout(async () => {
      try {
        const fakeOrderId = 'order_' + Math.random().toString(36).substring(2, 14);
        const fakePaymentId = 'pay_' + Math.random().toString(36).substring(2, 14);
        await billingAPI.pay(payingBill.id, {
          paymentMethod: selectedMethod,
          razorpayOrderId: fakeOrderId,
          razorpayPaymentId: fakePaymentId,
        });
        setPaymentStep(2); // Success
        fetchData();
      } catch (err) {
        alert('Payment processing failed. Please try again.');
        setShowPayModal(false);
      }
    }, 2000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-50 text-amber-600 border border-amber-100',
      CONFIRMED: 'bg-blue-50 text-blue-600 border border-blue-100',
      COMPLETED: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      CANCELLED: 'bg-rose-50 text-rose-600 border border-rose-100',
      PAID: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      FAILED: 'bg-rose-50 text-rose-600 border border-rose-100',
    };
    return styles[status] || 'bg-slate-50 text-slate-600 border border-slate-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  // ===== OVERVIEW TAB =====
  if (activeTab === 'overview') {
    return (
      <div className="space-y-8 font-sans">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: 'Consultations', value: appointments.length, icon: Calendar, bg: 'bg-sky-50 border-sky-100', color: 'text-sky-600' },
            { label: 'Hospital Stays', value: admissions.length, icon: Bed, bg: 'bg-indigo-50 border-indigo-100', color: 'text-indigo-600' },
            { label: 'Scheduled Surgeries', value: surgeries.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length, icon: Activity, bg: 'bg-teal-50 border-teal-100', color: 'text-teal-600' },
            { label: 'Unpaid Dues', value: billings.filter(b => b.status === 'PENDING').length, icon: CreditCard, bg: 'bg-amber-50 border-amber-100', color: 'text-amber-600' },
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

        {/* Dynamic Patient Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Admission details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bed className="w-4 h-4 text-emerald-500" /> Current Bed / Stay Information
            </h3>
            {admissions.find(a => a.status === 'ADMITTED') ? (
              (() => {
                const activeStay = admissions.find(a => a.status === 'ADMITTED');
                return (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Allocated Room / Bed</span>
                      <strong className="font-bold text-slate-800">{activeStay.bedNumber} ({activeStay.bedType})</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Admit Date</span>
                      <span className="text-slate-700 font-semibold">{new Date(activeStay.admissionDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Diagnosis</span>
                      <span className="text-slate-700 font-semibold max-w-[200px] truncate">{activeStay.diagnosis}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recovery Status</span>
                      <span className="text-rose-600 font-bold uppercase">{activeStay.recoveryStatus}</span>
                    </div>
                    {activeStay.treatmentPlan && (
                      <div className="border-t border-slate-200 pt-2.5">
                        <span className="text-slate-400 block mb-1">Active Treatment Plan</span>
                        <p className="text-slate-600 font-medium">{activeStay.treatmentPlan}</p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-slate-400 italic py-4">You are currently outpatient. No active ward admission.</p>
            )}
          </div>

          {/* Scheduled Surgeries */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Surgical Operations
            </h3>
            {surgeries.find(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED') ? (
              (() => {
                const activeSurg = surgeries.find(s => s.status !== 'COMPLETED' && s.status !== 'CANCELLED');
                return (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Surgery Type</span>
                      <strong className="font-bold text-slate-800">{activeSurg.type}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Surgeon</span>
                      <span className="text-slate-700 font-semibold">{activeSurg.surgeonName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Operation Theater</span>
                      <span className="text-slate-700 font-mono font-semibold">{activeSurg.operationTheaterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date & Time</span>
                      <span className="text-slate-700 font-semibold">{new Date(activeSurg.surgeryDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Operational Status</span>
                      <span className="text-indigo-600 font-bold uppercase">{activeSurg.status}</span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-slate-400 italic py-4">No surgical operations scheduled currently.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== ADMISSIONS TAB =====
  if (activeTab === 'admissions') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-sans">Hospital Admission History</h2>
          <p className="text-xs text-slate-400 mt-1">Review detail logs of your room accommodations, diagnoses, and medical treatment logs</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {admissions.map(adm => (
            <div key={adm.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Bed className="w-4 h-4" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Bed Allocation: {adm.bedNumber} ({adm.bedType})</h4>
                    <p className="text-[10px] text-slate-400">Admit Date: {new Date(adm.admissionDate).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  adm.status === 'ADMITTED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                }`}>{adm.status}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold mb-1">DIAGNOSIS</span>
                  <p className="text-slate-700 font-medium">{adm.diagnosis}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-1">RECOVERY STATUS</span>
                  <p className="text-rose-600 font-bold uppercase">{adm.recoveryStatus}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold mb-1">DISCHARGE DATE</span>
                  <p className="text-slate-700 font-medium">{adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleString() : 'Active hospitalization'}</p>
                </div>
              </div>
              {adm.treatmentPlan && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-400 block font-semibold mb-1">Primary Treatment Plan</span>
                  <p className="text-slate-600 font-medium">{adm.treatmentPlan}</p>
                </div>
              )}
            </div>
          ))}
          {admissions.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">No hospital stay records recorded.</div>
          )}
        </div>
      </div>
    );
  }

  // ===== SURGERIES TAB =====
  if (activeTab === 'surgeries') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-sans">Surgical Procedures</h2>
          <p className="text-xs text-slate-400 mt-1">Review scheduled surgery slots, surgical clinical notes, and post-surgery ICU warnings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {surgeries.map(surg => (
            <div key={surg.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{surg.type}</h4>
                  <p className="text-[10px] text-slate-400">Date: {new Date(surg.surgeryDate).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  surg.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                  surg.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                }`}>{surg.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Surgeon</span>
                  <span className="font-semibold text-slate-700">{surg.surgeonName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Operation Theater</span>
                  <span className="font-semibold text-slate-700 font-mono">{surg.operationTheaterName}</span>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                {surg.preOpNotes && (
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-semibold">Pre-Op Vitals / Instructions</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{surg.preOpNotes}</p>
                  </div>
                )}
                {surg.postOpNotes && (
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-semibold">Post-Op Recovery Instructions</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{surg.postOpNotes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {surgeries.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm">No surgery entries found.</div>
          )}
        </div>
      </div>
    );
  }

  // ===== PRESCRIPTIONS TAB =====
  if (activeTab === 'prescriptions') {
    const prescribed = appointments.filter(a => a.prescription);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">My Clinical Prescriptions</h2>
          <p className="text-xs text-slate-400 mt-1">{prescribed.length} prescriptions on file</p>
        </div>
        {prescribed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">No prescriptions written for you yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescribed.map(appt => (
              <div key={appt.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-100 text-teal-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{appt.doctorName}</p>
                      <p className="text-[10px] text-slate-400">
                        {appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusBadge(appt.status)}`}>{appt.status}</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason</p>
                  <p className="text-sm text-slate-600 mb-3">{appt.reason}</p>
                  <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-2">Prescription</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{appt.prescription}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ===== PAYMENTS TAB =====
  if (activeTab === 'payments') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Dynamic Billings & Payments</h2>
          <p className="text-xs text-slate-400 mt-1">{billings.length} invoices on file</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Invoice', 'Total Amount', 'Status', 'Paid Date', 'Payment Method', 'Action'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billings.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 text-slate-400 font-mono text-xs">INV-{String(bill.id).padStart(4, '0')}</td>
                  <td className="px-5 py-4 font-extrabold text-slate-800">₹{bill.totalAmount?.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(bill.status)}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {bill.paymentDate ? new Date(bill.paymentDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-semibold">{bill.paymentMethod || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setSelectedInvoice(bill); setShowInvoiceModal(true); }}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg transition-colors cursor-pointer"
                      >
                        Breakdown
                      </button>
                      {bill.status === 'PENDING' ? (
                        <button onClick={() => openPayModal(bill)} className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> Pay Now
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Paid</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {billings.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-400 text-sm">No billing records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Breakdown Modal */}
        {showInvoiceModal && selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">Detailed Invoice breakdown</h3>
                <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-xs border-b border-slate-150 pb-2">
                  <p className="text-slate-500">Invoice: <strong className="font-mono text-slate-700">INV-{String(selectedInvoice.id).padStart(4, '0')}</strong></p>
                  <p className="text-slate-500 mt-0.5">Status: <strong className="font-bold text-slate-800">{selectedInvoice.status}</strong></p>
                </div>
                <div className="space-y-3 font-sans text-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Doctor Consultation Fees</span>
                    <span className="font-mono text-slate-800 font-semibold">₹{selectedInvoice.consultationFees?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Bed Stay Daily Charges</span>
                    <span className="font-mono text-slate-800 font-semibold">₹{selectedInvoice.roomCharges?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Surgeon / Surgery Fees</span>
                    <span className="font-mono text-slate-800 font-semibold">₹{selectedInvoice.surgeryFees?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Pharmacy & Medicines</span>
                    <span className="font-mono text-slate-800 font-semibold">₹{selectedInvoice.otherCharges?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold border-t border-slate-200 pt-3 text-slate-800">
                    <span>Total Bill Dues</span>
                    <span className="font-mono text-emerald-600">₹{selectedInvoice.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => setShowInvoiceModal(false)} className="w-full bg-slate-800 text-white rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer">
                  Close Breakdown
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======= FAKE RAZORPAY PAYMENT MODAL ======= */}
        {showPayModal && payingBill && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              {/* Header — Razorpay Branding */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-5 text-white relative">
                <button onClick={() => setShowPayModal(false)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white/15"><Shield className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-base">Razorpay Checkout</h3>
                    <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">Secure Payment Gateway</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-blue-200">INV-{String(payingBill.id).padStart(4, '0')}</span>
                  <span className="text-lg font-extrabold flex items-center gap-0.5">
                    <IndianRupee className="w-4 h-4" />{payingBill.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {paymentStep === 0 && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Select Payment Method</p>
                    <div className="space-y-2">
                      {[
                        { id: 'UPI', label: 'UPI / Google Pay / PhonePe', icon: '📱' },
                        { id: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
                        { id: 'NETBANKING', label: 'Net Banking', icon: '🏦' },
                        { id: 'WALLET', label: 'Wallet (Paytm / Amazon Pay)', icon: '👛' },
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedMethod === method.id
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                          }`}
                        >
                          <span className="text-xl">{method.icon}</span>
                          <span className="text-sm font-medium text-slate-700">{method.label}</span>
                          {selectedMethod === method.id && <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleProcessPayment} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 mt-2">
                      <Shield className="w-4 h-4" /> Pay ₹{payingBill.totalAmount?.toLocaleString()}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-2">🔒 Secure simulated Razorpay demo sandbox</p>
                  </div>
                )}

                {paymentStep === 1 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-20" />
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center"><Shield className="w-8 h-8 text-blue-500" /></div>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">Authorizing Transaction...</h3>
                    <p className="text-xs text-slate-400">Do not refresh or click back</p>
                  </div>
                )}

                {paymentStep === 2 && (
                  <div className="flex flex-col items-center justify-center py-8 font-sans">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-5 animate-bounce">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800 mb-1">Invoice Payment Settled!</h3>
                    <p className="text-xs text-slate-500 mb-5">Your hospital account is now cleared.</p>
                    <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Paid Amount</span>
                        <span className="font-bold text-slate-800">₹{payingBill.totalAmount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transaction Mode</span>
                        <span className="text-slate-600 font-semibold">{selectedMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Receipt Status</span>
                        <span className="text-emerald-600 font-bold">PAID ✓</span>
                      </div>
                    </div>
                    <button onClick={() => setShowPayModal(false)} className="mt-6 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl text-xs font-semibold cursor-pointer">
                      Finish Checkout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default PatientDashboard;
