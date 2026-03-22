import React from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();
  const user = doctor.userId;

  return (
    <div
      className="doctor-card"
      onClick={() => navigate(`/doctor/${doctor._id}`)}
    >
      <div className="doctor-header">
        <div className="doctor-initials">
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
        <div className="doctor-info">
          <h3>{user.name}</h3>
          <p className="specialization">{doctor.specialization}</p>
        </div>
      </div>

      <div className="doctor-details">
        <div className="detail-item">
          <span className="label">Experience</span>
          <span className="value">{doctor.yearsOfExperience} years</span>
        </div>
        <div className="detail-item">
          <span className="label">Fee</span>
          <span className="value">₹{doctor.consultationFee}</span>
        </div>
        <div className="detail-item">
          <span className="label">Rating</span>
          <span className="value">⭐ {doctor.rating || 'New'}</span>
        </div>
      </div>

      <button className="book-btn">Book Appointment</button>
    </div>
  );
};

export default DoctorCard;