import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const authAPI = {
  login: (username, password) => API.post('/auth/login', { username, password }),
  register: (patientData) => API.post('/auth/register', patientData),
};

export const doctorAPI = {
  getAll: () => API.get('/doctors'),
  getById: (id) => API.get(`/doctors/${id}`),
  create: (data) => API.post('/doctors', data),
  update: (id, data) => API.put(`/doctors/${id}`, data),
  delete: (id) => API.delete(`/doctors/${id}`),
};

export const patientAPI = {
  getAll: () => API.get('/patients'),
  getById: (id) => API.get(`/patients/${id}`),
  create: (data) => API.post('/patients', data),
  update: (id, data) => API.put(`/patients/${id}`, data),
  delete: (id) => API.delete(`/patients/${id}`),
};

export const appointmentAPI = {
  getAll: () => API.get('/appointments'),
  getByDoctor: (doctorId) => API.get(`/appointments/doctor/${doctorId}`),
  getByPatient: (patientId) => API.get(`/appointments/patient/${patientId}`),
  create: (data) => API.post('/appointments', data),
  updateStatus: (id, status) => API.put(`/appointments/${id}/status?status=${status}`),
  updatePrescription: (id, prescription) => API.put(`/appointments/${id}/prescription`, { prescription }),
  delete: (id) => API.delete(`/appointments/${id}`),
};

export const paymentAPI = {
  getAll: () => API.get('/payments'),
  getByPatient: (patientId) => API.get(`/payments/patient/${patientId}`),
  getByAppointment: (appointmentId) => API.get(`/payments/appointment/${appointmentId}`),
  pay: (appointmentId, paymentDetails) => API.post(`/payments/appointment/${appointmentId}/pay`, paymentDetails),
};

export const bedAPI = {
  getAll: () => API.get('/beds'),
  getAvailable: () => API.get('/beds/available'),
  createOrUpdate: (data) => API.post('/beds', data),
  updateStatus: (id, status) => API.put(`/beds/${id}/status?status=${status}`),
  delete: (id) => API.delete(`/beds/${id}`),
};

export const operationTheaterAPI = {
  getAll: () => API.get('/operation-theaters'),
  getAvailable: () => API.get('/operation-theaters/available'),
  createOrUpdate: (data) => API.post('/operation-theaters', data),
  updateStatus: (id, status) => API.put(`/operation-theaters/${id}/status?status=${status}`),
  delete: (id) => API.delete(`/operation-theaters/${id}`),
};

export const admissionAPI = {
  getAll: () => API.get('/admissions'),
  getByPatient: (patientId) => API.get(`/admissions/patient/${patientId}`),
  getById: (id) => API.get(`/admissions/${id}`),
  admit: (data) => API.post('/admissions', data),
  update: (id, data) => API.put(`/admissions/${id}`, data),
  discharge: (id) => API.post(`/admissions/${id}/discharge`),
};

export const surgeryAPI = {
  getAll: () => API.get('/surgeries'),
  getByDoctor: (doctorId) => API.get(`/surgeries/doctor/${doctorId}`),
  getByPatient: (patientId) => API.get(`/surgeries/patient/${patientId}`),
  schedule: (data) => API.post('/surgeries', data),
  updateStatus: (id, status) => API.put(`/surgeries/${id}/status?status=${status}`),
  updateClinical: (id, data) => API.put(`/surgeries/${id}/clinical`, data),
};

export const billingAPI = {
  getAll: () => API.get('/billing'),
  getByPatient: (patientId) => API.get(`/billing/patient/${patientId}`),
  getById: (id) => API.get(`/billing/${id}`),
  calculate: (patientId, admissionId, surgeryId, otherCharges) => 
    API.get(`/billing/calculate?patientId=${patientId}${admissionId ? `&admissionId=${admissionId}` : ''}${surgeryId ? `&surgeryId=${surgeryId}` : ''}${otherCharges ? `&otherCharges=${otherCharges}` : ''}`),
  createBill: (data) => API.post('/billing', data),
  pay: (id, data) => API.post(`/billing/${id}/pay`, data),
};

export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

export default API;

