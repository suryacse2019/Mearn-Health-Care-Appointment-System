const express = require('express');
const {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  addPrescriptionAndDiagnosis,
  updateAppointmentStatus,
  getAppointmentStats,
  getMedicalRecords,
} = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Scheduling
router.post('/', auth, createAppointment);

// View Appointments
router.get('/patient/list', auth, getPatientAppointments);
router.get('/doctor/list', auth, getDoctorAppointments);
router.get('/stats', auth, getAppointmentStats);
router.get('/medical-records', auth, getMedicalRecords);
router.get('/:id', auth, getAppointmentById);

// Manage Appointments
router.put('/:id/cancel', auth, cancelAppointment);
router.put('/:id/reschedule', auth, rescheduleAppointment);
router.put('/:id/status', auth, updateAppointmentStatus);

// Medical Records
router.post('/:id/prescription', auth, addPrescriptionAndDiagnosis);

module.exports = router;