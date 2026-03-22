import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Doctor API calls
export const doctorAPI = {
  registerDoctor: (doctorData) => api.post('/doctors/register', doctorData),
  getMyProfile: () => api.get('/doctors/me'),
  updateProfile: (doctorData) => api.put('/doctors/me', doctorData),
  getAllDoctors: (params) => api.get('/doctors/search', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getAvailableSlots: (doctorId, date) =>
    api.get('/doctors/slots/' + doctorId, { params: { date } }),
};

// Review API
export const reviewAPI = {
  addReview: (reviewData) => api.post('/reviews', reviewData),
  getDoctorReviews: (doctorId) => api.get(`/reviews/doctor/${doctorId}`),
};

// Appointment API calls
export const appointmentAPI = {
  createAppointment: (appointmentData) =>
    api.post('/appointments', appointmentData),
  getPatientAppointments: () => api.get('/appointments/patient'),
  getDoctorAppointments: () => api.get('/appointments/doctor'),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateStatus: (id, status) =>
    api.put(`/appointments/${id}/status`, { status }),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
};

export default api;