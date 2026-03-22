import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import '../styles/AddPrescription.css';

const AddPrescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    diagnosis: '',
    medicalNotes: '',
    prescriptions: [
      { medicineName: '', dosage: '', frequency: '', duration: '', notes: '' },
    ],
  });

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

  const handlePrescriptionChange = (index, field, value) => {
    const newPrescriptions = [...formData.prescriptions];
    newPrescriptions[index][field] = value;
    setFormData(prev => ({
      ...prev,
      prescriptions: newPrescriptions,
    }));
  };

  const addPrescriptionField = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medicineName: '', dosage: '', frequency: '', duration: '', notes: '' },
      ],
    }));
  };

  const removePrescriptionField = (index) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await appointmentAPI.addPrescriptionAndDiagnosis(appointmentId, {
        diagnosis: formData.diagnosis,
        medicalNotes: formData.medicalNotes,
        prescriptions: formData.prescriptions.filter(p => p.medicineName),
      });

      navigate('/appointments/doctor', {
        state: { message: 'Prescription added successfully' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!appointment) return <div className="error-message">Appointment not found</div>;

  return (
    <div className="prescription-container">
      <h1>Add Prescription & Diagnosis</h1>

      <div className="patient-info">
        <h3>{appointment.patientId?.name}</h3>
        <p>Appointment: {new Date(appointment.appointmentDate).toDateString()}</p>
      </div>

      <form onSubmit={handleSubmit} className="prescription-form">
        {error && <div className="error-message">{error}</div>}

        {/* Diagnosis */}
        <div className="form-group">
          <label htmlFor="diagnosis">Diagnosis *</label>
          <input
            type="text"
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            placeholder="Enter diagnosis"
            required
          />
        </div>

        {/* Prescriptions */}
        <div className="prescriptions-section">
          <h2>Prescriptions</h2>

          {formData.prescriptions.map((prescription, index) => (
            <div key={index} className="prescription-item">
              <div className="form-row">
                <div className="form-group">
                  <label>Medicine Name</label>
                  <input
                    type="text"
                    value={prescription.medicineName}
                    onChange={(e) =>
                      handlePrescriptionChange(index, 'medicineName', e.target.value)
                    }
                    placeholder="e.g., Aspirin"
                  />
                </div>

                <div className="form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    value={prescription.dosage}
                    onChange={(e) =>
                      handlePrescriptionChange(index, 'dosage', e.target.value)
                    }
                    placeholder="e.g., 500mg"
                  />
                </div>

                <div className="form-group">
                  <label>Frequency</label>
                  <input
                    type="text"
                    value={prescription.frequency}
                    onChange={(e) =>
                      handlePrescriptionChange(index, 'frequency', e.target.value)
                    }
                    placeholder="e.g., Twice daily"
                  />
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={prescription.duration}
                    onChange={(e) =>
                      handlePrescriptionChange(index, 'duration', e.target.value)
                    }
                    placeholder="e.g., 5 days"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={prescription.notes}
                  onChange={(e) =>
                    handlePrescriptionChange(index, 'notes', e.target.value)
                  }
                  placeholder="Additional notes (optional)"
                  rows="2"
                />
              </div>

              {formData.prescriptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePrescriptionField(index)}
                  className="remove-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addPrescriptionField}
            className="add-prescription-btn"
          >
            + Add Another Medicine
          </button>
        </div>

        {/* Medical Notes */}
        <div className="form-group">
          <label htmlFor="medicalNotes">Medical Notes</label>
          <textarea
            id="medicalNotes"
            value={formData.medicalNotes}
            onChange={(e) =>
              setFormData(prev => ({ ...prev, medicalNotes: e.target.value }))
            }
            placeholder="Additional medical notes (optional)"
            rows="4"
          />
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Saving...' : 'Save Prescription'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPrescription;