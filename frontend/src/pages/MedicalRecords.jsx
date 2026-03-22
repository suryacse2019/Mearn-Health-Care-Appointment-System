import React, { useState, useEffect } from 'react';
import { appointmentAPI } from '../services/api';
import '../styles/MedicalRecords.css';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const response = await appointmentAPI.getMedicalRecords();
      setRecords(response.data);
    } catch (err) {
      setError('Failed to load medical records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (recordId) => {
    // Implement PDF download functionality
    console.log('Downloading PDF for record:', recordId);
  };

  return (
    <div className="medical-records-container">
      <h1>📋 Medical Records</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading medical records...</div>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <p>No medical records found</p>
          <p className="hint">Medical records from completed appointments will appear here</p>
        </div>
      ) : (
        <div className="records-layout">
          {/* Records List */}
          <div className="records-list">
            {records.map((record) => (
              <div
                key={record.appointmentId}
                className={`record-item ${selectedRecord?.appointmentId === record.appointmentId ? 'active' : ''}`}
                onClick={() => setSelectedRecord(record)}
              >
                <div className="record-date">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="record-info">
                  <h4>Dr. {record.doctor?.userId?.name}</h4>
                  <p>{record.doctor?.specialization}</p>
                  <p className="reason">{record.reason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Record Details */}
          {selectedRecord && (
            <div className="record-details">
              <div className="details-header">
                <h2>Dr. {selectedRecord.doctor?.userId?.name}</h2>
                <p className="detail-date">
                  {new Date(selectedRecord.date).toDateString()}
                </p>
              </div>

              <div className="detail-section">
                <h3>Chief Complaint</h3>
                <p>{selectedRecord.reason}</p>
              </div>

              {selectedRecord.symptoms && (
                <div className="detail-section">
                  <h3>Symptoms</h3>
                  <p>{selectedRecord.symptoms}</p>
                </div>
              )}

              {selectedRecord.diagnosis && (
                <div className="detail-section diagnosis">
                  <h3>Diagnosis</h3>
                  <p className="diagnosis-text">{selectedRecord.diagnosis}</p>
                </div>
              )}

              {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                <div className="detail-section prescriptions">
                  <h3>Medications</h3>
                  <div className="prescription-list">
                    {selectedRecord.prescriptions.map((med, idx) => (
                      <div key={idx} className="medication">
                        <div className="med-name">{med.medicineName}</div>
                        <div className="med-details">
                          <span>{med.dosage}</span>
                          <span>•</span>
                          <span>{med.frequency}</span>
                          <span>•</span>
                          <span>{med.duration}</span>
                        </div>
                        {med.notes && <div className="med-notes">{med.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.medicalNotes && (
                <div className="detail-section">
                  <h3>Medical Notes</h3>
                  <p>{selectedRecord.medicalNotes}</p>
                </div>
              )}

              <div className="detail-actions">
                <button
                  className="download-btn"
                  onClick={() => handleDownloadPDF(selectedRecord.appointmentId)}
                >
                  📥 Download PDF
                </button>
                <button className="print-btn" onClick={() => window.print()}>
                  🖨️ Print
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;