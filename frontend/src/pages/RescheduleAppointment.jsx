import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI, doctorAPI } from '../services/api';
import AppointmentCalendar from '../components/AppointmentCalendar';
import '../styles/RescheduleAppointment.css';

const RescheduleAppointment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await appointmentAPI.getAppointmentById(appointmentId);
      setAppointment(response.data);
    } catch (err) {
      setError('Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) {
      setError('Please select a new date and time');
      return;
    }

    setSubmitting(true);
    try {
      await appointmentAPI.rescheduleAppointment(appointmentId, {
        newDate: selectedSlot.date.toISOString().split('T')[0],
        newTime: selectedSlot.time,
      });

      navigate('/appointments', {
        state: { message: 'Appointment rescheduled successfully' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reschedule');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading appointment...</div>;
  if (!appointment) return <div className="error-message">Appointment not found</div>;

  return (
    <div className="reschedule-container">
      <h1>Reschedule Appointment</h1>

      <div className="reschedule-layout">
        {/* Current Appointment Info */}
        <div className="appointment-info">
          <h2>Current Appointment</h2>
          <div className="info-card">
            <p>
              <strong>Doctor:</strong> {appointment.doctorId?.userId?.name}
            </p>
            <p>
              <strong>Specialty:</strong> {appointment.doctorId?.specialization}
            </p>
            <p>
              <strong>Current Date:</strong>{' '}
              {new Date(appointment.appointmentDate).toDateString()}
            </p>
            <p>
              <strong>Current Time:</strong> {appointment.appointmentTime}
            </p>
            <p>
              <strong>Type:</strong> {appointment.consultationType}
            </p>
          </div>
        </div>

        {/* Calendar for New Slot */}
        <div className="calendar-section">
          <h2>Select New Date & Time</h2>

          {error && <div className="error-message">{error}</div>}

          <AppointmentCalendar
            doctorId={appointment.doctorId._id}
            onDateSelect={setSelectedSlot}
          />

          {selectedSlot && (
            <div className="selected-info">
              <p>
                <strong>New Date:</strong> {selectedSlot.date.toDateString()}
              </p>
              <p>
                <strong>New Time:</strong> {selectedSlot.time}
              </p>

              <button
                onClick={handleReschedule}
                disabled={submitting}
                className="confirm-btn"
              >
                {submitting ? 'Processing...' : 'Confirm Reschedule'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescheduleAppointment;