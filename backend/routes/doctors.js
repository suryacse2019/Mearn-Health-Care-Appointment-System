const express = require('express');
const {
  registerDoctor,
  getMyDoctorProfile,
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getAvailableSlots,
} = require('../controllers/doctorController');
const auth = require('../middleware/auth');

const router = express.Router();

// Doctor management
router.post('/register', auth, registerDoctor);
router.get('/me', auth, getMyDoctorProfile);
router.put('/me', auth, updateDoctorProfile);

// Public doctor search
router.get('/search', getAllDoctors);
router.get('/:id', getDoctorById);

// Appointment slots
router.get('/slots/:doctorId', getAvailableSlots);

module.exports = router;