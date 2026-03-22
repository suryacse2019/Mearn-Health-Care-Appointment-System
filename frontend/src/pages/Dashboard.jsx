// frontend/src/pages/Dashboard.jsx

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [isDoctor, setIsDoctor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    doctorRating: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Check if user is a doctor
      try {
        const doctorProfile = await doctorAPI.getMyProfile();
        setIsDoctor(true);
        fetchDoctorData(doctorProfile.data);
      } catch (error) {
        setIsDoctor(false);
        fetchPatientData();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientData = async () => {
    try {
      const response = await appointmentAPI.getPatientAppointments();
      setAppointments(response.data);

      // Calculate stats
      const now = new Date();
      const upcoming = response.data.filter(
        (apt) => new Date(apt.appointmentDate) > now && apt.status === 'scheduled'
      );
      const completed = response.data.filter((apt) => apt.status === 'completed');

      setStats({
        totalAppointments: response.data.length,
        completedAppointments: completed.length,
        upcomingAppointments: upcoming.length,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchDoctorData = async (doctorData) => {
    try {
      const response = await appointmentAPI.getDoctorAppointments();
      setAppointments(response.data);

      const completed = response.data.filter((apt) => apt.status === 'completed');
      const upcoming = response.data.filter(
        (apt) =>
          new Date(apt.appointmentDate) > new Date() &&
          apt.status === 'scheduled'
      );

      setStats({
        totalAppointments: response.data.length,
        completedAppointments: completed.length,
        upcomingAppointments: upcoming.length,
        doctorRating: doctorData.doctor.rating || 0,
      });
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand">
            <h1>HealthCare</h1>
            <p>Appointment System</p>
          </div>

          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
            <p>
              {isDoctor
                ? 'Manage your appointments and connect with patients'
                : 'Find doctors and book your appointments easily'}
            </p>
          </div>

          {!isDoctor && (
            <button
              onClick={() => navigate('/doctors')}
              className="cta-button"
            >
              Find Doctors →
            </button>
          )}
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon total">📊</div>
            <div className="stat-content">
              <span className="stat-number">{stats.totalAppointments}</span>
              <span className="stat-label">Total Appointments</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon upcoming">📅</div>
            <div className="stat-content">
              <span className="stat-number">{stats.upcomingAppointments}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">✅</div>
            <div className="stat-content">
              <span className="stat-number">{stats.completedAppointments}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          {isDoctor && (
            <div className="stat-card">
              <div className="stat-icon rating">⭐</div>
              <div className="stat-content">
                <span className="stat-number">{stats.doctorRating.toFixed(1)}</span>
                <span className="stat-label">Your Rating</span>
              </div>
            </div>
          )}
        </section>

        {/* Action Buttons */}
        {!isDoctor && (
          <section className="quick-actions">
            <div className="action-card" onClick={() => navigate('/doctors')}>
              <div className="action-icon">🔍</div>
              <h3>Find Doctors</h3>
              <p>Search and filter doctors by specialization</p>
            </div>

            <div className="action-card" onClick={() => navigate('/doctors')}>
              <div className="action-icon">📋</div>
              <h3>Book Appointment</h3>
              <p>Schedule your next appointment easily</p>
            </div>

            <div className="action-card">
              <div className="action-icon">📝</div>
              <h3>Medical Records</h3>
              <p>View and manage your medical history</p>
            </div>
          </section>
        )}

        {isDoctor && (
          <section className="quick-actions">
            <div className="action-card" onClick={() => navigate('/doctor-register')}>
              <div className="action-icon">👨‍⚕️</div>
              <h3>Update Profile</h3>
              <p>Manage your professional information</p>
            </div>

            <div className="action-card">
              <div className="action-icon">📊</div>
              <h3>Analytics</h3>
              <p>View your appointment statistics</p>
            </div>

            <div className="action-card">
              <div className="action-icon">⭐</div>
              <h3>Reviews</h3>
              <p>See patient feedback and ratings</p>
            </div>
          </section>
        )}

        {/* Appointments Section */}
        <section className="appointments-section">
          <div className="section-header">
            <h3>
              {isDoctor ? 'Your Appointments' : 'My Appointments'}
            </h3>
            <span className="count">{appointments.length}</span>
          </div>

          {appointments.length > 0 ? (
            <div className="appointments-list">
              {appointments
                .sort(
                  (a, b) =>
                    new Date(b.appointmentDate) -
                    new Date(a.appointmentDate)
                )
                .map((appointment) => (
                  <AppointmentItem
                    key={appointment._id}
                    appointment={appointment}
                    isDoctor={isDoctor}
                  />
                ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No appointments yet</p>
              {!isDoctor && (
                <button
                  onClick={() => navigate('/doctors')}
                  className="empty-action"
                >
                  Book your first appointment
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

// Appointment Item Component
const AppointmentItem = ({ appointment, isDoctor }) => {
  const appointmentDate = new Date(appointment.appointmentDate);
  const isUpcoming = appointmentDate > new Date();
  const doctor = appointment.doctorId;
  const patient = appointment.patientId;

  return (
    <div className={`appointment-item ${appointment.status}`}>
      <div className="appointment-date">
        <div className="date-day">
          {appointmentDate.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        <div className="date-num">
          {appointmentDate.toLocaleDateString('en-US', { day: '2-digit' })}
        </div>
        <div className="date-time">
          {appointmentDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          {appointment.appointmentTime}
        </div>
      </div>

      <div className="appointment-details">
        <h4>
          {isDoctor
            ? `${patient.name}`
            : `Dr. ${doctor?.userId?.name || 'Doctor'}`}
        </h4>
        {!isDoctor && (
          <p className="spec">{doctor?.specialization}</p>
        )}
        <p className="reason">{appointment.reason}</p>
        <div className="appointment-meta">
          <span className={`status ${appointment.status}`}>
            {appointment.status}
          </span>
          <span className="type">{appointment.consultationType}</span>
        </div>
      </div>

      <div className="appointment-actions">
        {isUpcoming && appointment.status === 'scheduled' && (
          <>
            <button className="action-btn join">
              {appointment.consultationType === 'in-person'
                ? 'Check In'
                : 'Join Call'}
            </button>
            <button className="action-btn cancel">Reschedule</button>
          </>
        )}
        {!isUpcoming && appointment.status === 'completed' && (
          <button className="action-btn review">Leave Review</button>
        )}
        {appointment.status === 'completed' && (
          <button className="action-btn details">View Details</button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
