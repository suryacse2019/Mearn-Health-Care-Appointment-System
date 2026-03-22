import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import '../styles/AppointmentHistory.css';

const AppointmentHistory = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await appointmentAPI.getPatientAppointments(params);
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await appointmentAPI.cancelAppointment(appointmentId, {
        reason: 'Cancelled by patient',
      });
      fetchAppointments();
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  const handleReschedule = (appointmentId) => {
    // Navigate to reschedule page
    window.location.href = `/reschedule/${appointmentId}`;
  };

  return (
    <div className="appointment-history-container">
      <div className="history-header">
        <h1>Appointment History</h1>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({appointments.length})
          </button>
          <button
            className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Upcoming
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} appointments found</p>
        </div>
      ) : (
        <div className="appointments-timeline">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onCancel={() => handleCancel(appointment._id)}
              onReschedule={() => handleReschedule(appointment._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AppointmentCard = ({ appointment, onCancel, onReschedule }) => {
  const appointmentDate = new Date(appointment.appointmentDate);
  const isUpcoming = appointmentDate > new Date() && appointment.status === 'scheduled';
  const doctor = appointment.doctorId;

  const statusColors = {
    scheduled: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
    'no-show': '#f59e0b',
  };

  return (
    <div className={`appointment-card ${appointment.status}`}>
      <div className="card-date">
        <div className="date-number">{appointmentDate.getDate()}</div>
        <div className="date-month">{appointmentDate.toLocaleDateString('en-US', { month: 'short' })}</div>
        <div className="date-time">{appointment.appointmentTime}</div>
      </div>

      <div className="card-content">
        <h3>{doctor?.userId?.name}</h3>
        <p className="specialty">{doctor?.specialization}</p>
        <p className="reason">{appointment.reason}</p>

        {appointment.symptoms && (
          <p className="symptoms">
            <strong>Symptoms:</strong> {appointment.symptoms}
          </p>
        )}

        {appointment.status === 'completed' && appointment.diagnosis && (
          <div className="diagnosis-section">
            <strong>Diagnosis:</strong> {appointment.diagnosis}
          </div>
        )}

        <div className="card-footer">
          <span className="status" style={{ backgroundColor: statusColors[appointment.status] }}>
            {appointment.status}
          </span>
          <span className="type">{appointment.consultationType}</span>
        </div>
      </div>

      <div className="card-actions">
        {isUpcoming && (
          <>
            <button className="action-btn reschedule" onClick={onReschedule}>
              📅 Reschedule
            </button>
            <button className="action-btn cancel" onClick={onCancel}>
              ✕ Cancel
            </button>
          </>
        )}
        {appointment.status === 'completed' && appointment.diagnosis && (
          <button className="action-btn view-details">📋 View Details</button>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;