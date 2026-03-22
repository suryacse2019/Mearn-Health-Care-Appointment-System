import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../services/api';
import DoctorCard from '../components/DoctorCard';
import '../styles/Doctor.css';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const specializations = [
    'Cardiology',
    'Neurology',
    'Dermatology',
    'Orthopedics',
    'General',
  ];

  useEffect(() => {
    fetchDoctors();
  }, [specialization, search]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (specialization) params.specialization = specialization;
      if (search) params.search = search;

      const response = await doctorAPI.getAllDoctors(params);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-search-container">
      <h1>Find a Doctor</h1>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by doctor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="specialization-select"
        >
          <option value="">All Specializations</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading doctors...</div>
      ) : (
        <div className="doctors-grid">
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))
          ) : (
            <p className="no-results">No doctors found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;