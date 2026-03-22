const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Review = require('../models/Review');

// Register as Doctor
exports.registerDoctor = async (req, res) => {
  try {
    const {
      specialization,
      licenseNumber,
      yearsOfExperience,
      consultationFee,
      bio,
      availability,
    } = req.body;

    // Check if already registered
    let doctor = await Doctor.findOne({ userId: req.user.id });
    if (doctor) {
      return res.status(400).json({ message: 'Doctor profile already exists' });
    }

    // Validate license number is unique
    const existingLicense = await Doctor.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({ message: 'License number already registered' });
    }

    doctor = new Doctor({
      userId: req.user.id,
      specialization,
      licenseNumber,
      yearsOfExperience,
      consultationFee,
      bio,
      availability: availability || getDefaultAvailability(),
    });

    await doctor.save();

    // Update user profile status
    await User.findByIdAndUpdate(req.user.id, { profileCompleted: true });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my doctor profile
exports.getMyDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('userId', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Get reviews and ratings
    const reviews = await Review.find({ doctorId: doctor._id })
      .populate('patientId', 'name');

    res.json({
      doctor,
      reviews,
      avgRating: doctor.rating,
      totalReviews: doctor.numberOfReviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all doctors with filtering
exports.getAllDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let filter = {};

    if (specialization) {
      filter.specialization = specialization;
    }

    let doctors = await Doctor.find(filter)
      .populate('userId', 'name email phone')
      .sort({ rating: -1 });

    // Search by name if provided
    if (search) {
      const user = await User.find({
        name: { $regex: search, $options: 'i' },
      });
      const userIds = user.map((u) => u._id);
      doctors = doctors.filter((doc) => userIds.includes(doc.userId));
    }

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor by ID (with reviews)
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate('userId', 'name email phone');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const reviews = await Review.find({ doctorId: id })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      doctor,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile
exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const { specialization, consultationFee, bio, availability } = req.body;

    if (specialization) doctor.specialization = specialization;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (bio) doctor.bio = bio;
    if (availability) doctor.availability = availability;

    await doctor.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available slots for a doctor
exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get day of week
    const appointmentDate = new Date(date);
    const dayName = getDayName(appointmentDate.getDay());

    // Get doctor's availability for that day
    const dayAvailability = doctor.availability[dayName.toLowerCase()];
    if (!dayAvailability) {
      return res.json({ slots: [] });
    }

    // Get booked appointments for that day
    const Appointment = require('../models/Appointment');
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
        $lt: new Date(appointmentDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ['scheduled', 'completed'] },
    });

    // Generate time slots
    const slots = generateTimeSlots(
      dayAvailability.start,
      dayAvailability.end,
      bookedAppointments
    );

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
function getDefaultAvailability() {
  return {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '10:00', end: '14:00' },
    sunday: null,
  };
}

function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex];
}

function generateTimeSlots(startTime, endTime, bookedAppointments) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);
  const end = new Date();
  end.setHours(endHour, endMin, 0, 0);

  // 30-minute slots
  while (current < end) {
    const slotTime = current.toTimeString().slice(0, 5);
    const isBooked = bookedAppointments.some((apt) => apt.appointmentTime === slotTime);

    if (!isBooked) {
      slots.push(slotTime);
    }

    current = new Date(current.getTime() + 30 * 60000); // Add 30 minutes
  }

  return slots;
}

module.exports = exports;