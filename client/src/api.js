// client/src/api.js — centralised REST API client (replaces all FB.* and Store.* calls)
import axios from 'axios';

const http = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
http.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ayurdash_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

const unwrap = (res) => res.data.data;

// ── Auth ──────────────────────────────────────────────────────
export const login    = (email, password)  => http.post('/auth/login',    { email, password }).then(r => r.data);
export const register = (body)             => http.post('/auth/register',  body).then(r => r.data);
export const getMe    = ()                 => http.get('/auth/me').then(unwrap);

// ── Patients ──────────────────────────────────────────────────
export const getPatient            = (id)           => http.get(`/patients/${id}`).then(unwrap);
export const updatePatient         = (id, data)     => http.put(`/patients/${id}`, data).then(r => r.data);
export const updatePatientPriority = (id, priority) => http.patch(`/patients/${id}/priority`, { priority }).then(r => r.data);
export const updatePrivacy         = (id, privacy)  => http.put(`/patients/${id}/privacy`, privacy).then(r => r.data);
export const getPatientFull        = (id)           => http.get(`/patients/${id}/full`).then(unwrap);

// ── Doctors ───────────────────────────────────────────────────
export const getDoctorPatients = (doctorId) => http.get(`/doctors/${doctorId}/patients`).then(unwrap);

// ── Medicines ─────────────────────────────────────────────────
export const getMedicines  = ()   => http.get('/medicines').then(unwrap);
export const getMedicine   = (id) => http.get(`/medicines/${id}`).then(unwrap);

// ── Prescriptions ─────────────────────────────────────────────
export const addPrescription         = (body)      => http.post('/prescriptions', body).then(unwrap);
export const getPatientPrescriptions = (patientId) => http.get(`/prescriptions/patient/${patientId}`).then(unwrap);
export const getDoctorPrescriptions  = (doctorId)  => http.get(`/prescriptions/doctor/${doctorId}`).then(unwrap);

// ── Reminders ─────────────────────────────────────────────────
export const getReminders         = (userId) => http.get(`/reminders/${userId}`).then(unwrap);
export const getPatientReminders  = (patientId) => http.get(`/reminders/patient/${patientId}`).then(unwrap);
export const addReminder          = (body)   => http.post('/reminders', body).then(unwrap);
export const updateReminderStatus = (id, body) => http.patch(`/reminders/${id}/status`, body).then(r => r.data);
export const deleteReminder       = (id)     => http.delete(`/reminders/${id}`).then(r => r.data);

// ── Dinacharya ────────────────────────────────────────────────
export const getDinacharyaTasks  = (userId, date)              => http.get(`/dinacharya/${userId}/${date}`).then(unwrap);
export const toggleDinacharyaTask = (userId, date, idx, body) => http.put(`/dinacharya/${userId}/${date}/${idx}`, body).then(r => r.data);

// ── Vega Bouts ────────────────────────────────────────────────
export const getVegaBouts = (patientId) => http.get(`/vegabouts/${patientId}`).then(unwrap);
export const logVegaBout  = (body)      => http.post('/vegabouts', body).then(unwrap);

// ── Chat ──────────────────────────────────────────────────────
export const getChatHistory = (userId) => http.get(`/chat/${userId}`).then(unwrap);
export const saveChat       = (body)   => http.post('/chat', body).then(unwrap);
