const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
  },
  
  // Medical Information
  reason: {
    type: String,
    required: true,
  },
  symptoms: String,
  notes: String,
  
  // After Appointment
  diagnosis: String,
  prescriptions: [{
    medicineName: String,
    dosage: String,
    frequency: String,
    duration: String,
    notes: String,
  }],
  medicalNotes: String,
  
  // Appointment Status
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled',
  },
  
  // Consultation Details
  consultationType: {
    type: String,
    enum: ['in-person', 'video-call', 'phone'],
    default: 'in-person',
  },
  meetingLink: String,
  
  // Rescheduling
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  rescheduledTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

module.exports = mongoose.model('Appointment', appointmentSchema);