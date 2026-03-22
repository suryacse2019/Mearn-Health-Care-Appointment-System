import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doctorAPI, appointmentAPI } from '../services/api';
import AppointmentCalendar from '../components/AppointmentCalendar';
import '../styles/Appointment.css';

const AppointmentBook = () => {
  const { doctorId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [appointmentData, setAppointmentData] = useState({
    reason: '',
    symptoms: '',
    consultationType: 'in-person',
  });

  useEffect(() => {
    fetchDoctor();
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await doctorAPI.getDoctorById(doctorId);
      setDoctor(response.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      setError('Please select a date and time');
      return;
    }

    if (!appointmentData.reason) {
      setError('Please provide reason for appointment');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await appointmentAPI.createAppointment({
        doctorId,
        appointmentDate: selectedSlot.date,
        appointmentTime: selectedSlot.time,
        reason: appointmentData.reason,
        symptoms: appointmentData.symptoms,
        consultationType: appointmentData.consultationType,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return <div className="loading">Loading doctor information...</div>;
  }

  return (
    <div className="appointment-book-container">
      <h1>Book Appointment</h1>

      <div className="appointment-layout">
        {/* Doctor Info */}
        <div className="doctor-info-section">
          <div className="doctor-card">
            <div className="doctor-initials">
              {doctor.userId.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <h2>{doctor.userId.name}</h2>
            <p>{doctor.specialization}</p>
            <p className="experience">{doctor.yearsOfExperience} years experience</p>
            <p className="fee">Consultation Fee: ₹{doctor.consultationFee}</p>
            <p className="rating">Rating: ⭐ {doctor.rating || 'New'}</p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="booking-form-section">
          <form onSubmit={handleBookAppointment}>
            {error && <div className="error-message">{error}</div>}

            {/* Calendar */}
            <div className="form-group">
              <label>Select Date & Time</label>
              <AppointmentCalendar
                doctorId={doctorId}
                onDateSelect={setSelectedSlot}
              />
              {selectedSlot && (
                <p className="selected-slot">
                  Selected: {selectedSlot.date.toDateString()} at {selectedSlot.time}
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="form-group">
              <label htmlFor="reason">Reason for Appointment *</label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={appointmentData.reason}
                onChange={handleInputChange}
                placeholder="e.g., Regular checkup, Consultation"
                required
              />
            </div>

            {/* Symptoms */}
            <div className="form-group">
              <label htmlFor="symptoms">Symptoms/Additional Info</label>
              <textarea
                id="symptoms"
                name="symptoms"
                value={appointmentData.symptoms}
                onChange={handleInputChange}
                placeholder="Describe your symptoms or any additional information..."
                rows="4"
              />
            </div>

            {/* Consultation Type */}
            <div className="form-group">
              <label htmlFor="consultationType">Consultation Type</label>
              <select
                id="consultationType"
                name="consultationType"
                value={appointmentData.consultationType}
                onChange={handleInputChange}
              >
                <option value="in-person">In-Person</option>
                <option value="video-call">Video Call</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="book-btn">
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBook;