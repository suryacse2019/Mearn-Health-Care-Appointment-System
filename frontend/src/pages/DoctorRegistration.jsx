import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { doctorAPI } from '../services/api';
import '../styles/Doctor.css';

const DoctorRegistration = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    specialization: 'General',
    licenseNumber: '',
    yearsOfExperience: '',
    consultationFee: '',
    bio: '',
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '10:00', end: '14:00' },
      sunday: null,
    },
  });

  const specializations = [
    'Cardiology',
    'Neurology',
    'Dermatology',
    'Orthopedics',
    'General',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await doctorAPI.registerDoctor(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-registration-container">
      <div className="registration-card">
        <h1>Doctor Registration</h1>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <h2>Professional Information</h2>

          <div className="form-group">
            <label>Specialization</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Medical License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Consultation Fee (₹)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Bio / About You</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell patients about yourself..."
            />
          </div>

          {/* Availability */}
          <h2>Working Hours</h2>
          <div className="availability-section">
            {Object.keys(formData.availability).map((day) => (
              <div key={day} className="day-availability">
                <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                {formData.availability[day] ? (
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={formData.availability[day].start}
                      onChange={(e) =>
                        handleAvailabilityChange(day, 'start', e.target.value)
                      }
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={formData.availability[day].end}
                      onChange={(e) =>
                        handleAvailabilityChange(day, 'end', e.target.value)
                      }
                    />
                  </div>
                ) : (
                  <span className="closed">Closed</span>
                )}
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Registering...' : 'Register as Doctor'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegistration;