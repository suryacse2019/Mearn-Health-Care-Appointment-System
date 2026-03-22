const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// ===== CREATE & SCHEDULE =====

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, reason, symptoms, consultationType } = req.body;

    // Validate doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['scheduled', 'completed'] },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      symptoms,
      consultationType: consultationType || 'in-person',
    });

    await appointment.save();
    await appointment.populate([
      { path: 'patientId', select: 'name email phone' },
      { path: 'doctorId', select: 'userId specialization consultationFee' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== VIEW APPOINTMENTS =====

exports.getPatientAppointments = async (req, res) => {
  try {
    const { status, sortBy } = req.query;
    
    let query = { patientId: req.user.id };
    if (status) {
      query.status = status;
    }

    let sortOption = { appointmentDate: -1 };
    if (sortBy === 'oldest') {
      sortOption = { appointmentDate: 1 };
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'userId specialization consultationFee rating')
      .populate('patientId', 'name email phone')
      .sort(sortOption);

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const { status, date } = req.query;

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    let query = { doctorId: doctor._id };
    
    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.appointmentDate = { $gte: startDate, $lt: endDate };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone medicalHistory allergies')
      .populate('doctorId', 'specialization')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('doctorId', 'userId specialization consultationFee')
      .populate('patientId', 'name email phone dateOfBirth gender medicalHistory allergies');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access
    if (
      appointment.patientId._id.toString() !== req.user.id &&
      appointment.doctorId.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== CANCEL APPOINTMENT =====

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can cancel
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only patient can cancel' });
    }

    if (!['scheduled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot cancel completed appointments' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason || 'Cancelled by patient';
    appointment.cancelledBy = 'patient';
    appointment.updatedAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== RESCHEDULE APPOINTMENT =====

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user can reschedule
    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only patient can reschedule' });
    }

    if (!['scheduled'].includes(appointment.status)) {
      return res.status(400).json({ message: 'Can only reschedule scheduled appointments' });
    }

    // Check if new slot is available
    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      appointmentDate: new Date(newDate),
      appointmentTime: newTime,
      status: { $in: ['scheduled', 'completed'] },
      _id: { $ne: id },
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'New slot is not available' });
    }

    // Update original appointment
    const oldDate = appointment.appointmentDate;
    const oldTime = appointment.appointmentTime;

    appointment.appointmentDate = new Date(newDate);
    appointment.appointmentTime = newTime;
    appointment.updatedAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment,
      changes: {
        from: `${oldDate.toDateString()} at ${oldTime}`,
        to: `${new Date(newDate).toDateString()} at ${newTime}`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== ADD PRESCRIPTION & DIAGNOSIS =====

exports.addPrescriptionAndDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, prescriptions, medicalNotes } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify doctor is adding prescription for their appointment
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only doctor can add prescription' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only add prescription to completed appointments' });
    }

    // Update appointment with medical info
    appointment.diagnosis = diagnosis;
    appointment.prescriptions = prescriptions || [];
    appointment.medicalNotes = medicalNotes;
    appointment.updatedAt = new Date();

    await appointment.save();

    res.json({
      success: true,
      message: 'Prescription and diagnosis added successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== UPDATE APPOINTMENT STATUS =====

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verify user is doctor
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(403).json({ message: 'Only doctors can update appointment status' });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Can only update own appointments' });
    }

    appointment.status = status;
    appointment.updatedAt = new Date();

    if (status === 'completed') {
      appointment.completedAt = new Date();
    }

    await appointment.save();
    await appointment.populate('patientId', 'name email phone');

    res.json({
      success: true,
      message: `Appointment marked as ${status}`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GET APPOINTMENT STATISTICS =====

exports.getAppointmentStats = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({ patientId });

    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'scheduled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      noShow: appointments.filter(a => a.status === 'no-show').length,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== GET MEDICAL RECORDS =====

exports.getMedicalRecords = async (req, res) => {
  try {
    const patientId = req.user.id;

    const appointments = await Appointment.find({
      patientId,
      status: 'completed',
      diagnosis: { $exists: true, $ne: null },
    })
      .populate('doctorId', 'userId specialization')
      .sort({ completedAt: -1 });

    const medicalRecords = appointments.map(apt => ({
      appointmentId: apt._id,
      date: apt.completedAt,
      doctor: apt.doctorId,
      reason: apt.reason,
      symptoms: apt.symptoms,
      diagnosis: apt.diagnosis,
      prescriptions: apt.prescriptions,
      medicalNotes: apt.medicalNotes,
    }));

    res.json(medicalRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;