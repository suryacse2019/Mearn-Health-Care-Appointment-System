// frontend/src/components/Register.jsx

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.match(/^\d{10}$/)) {
      setError('Phone number must be 10 digits');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep3()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container register-page">
      {/* Background Blur Elements */}
      <div className="blur-element blur-1"></div>
      <div className="blur-element blur-2"></div>
      <div className="blur-element blur-3"></div>

      <div className="auth-wrapper register-wrapper">
        {/* Left Side - Progress */}
        <div className="register-progress">
          <h3>Create Account</h3>
          <div className="progress-indicator">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Personal</span>
            </div>
            <div className={`step-connector ${step > 1 ? 'active' : ''}`}></div>
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Contact</span>
            </div>
            <div className={`step-connector ${step > 2 ? 'active' : ''}`}></div>
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Security</span>
            </div>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          <p className="progress-text">
            Step {step} of 3
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="form-card register-card">
            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="form-step">
                  <div className="form-header">
                    <h2>Tell us about yourself</h2>
                    <p>What's your full name?</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">
                      <span className="label-icon">👤</span>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">
                      <span className="label-icon">💼</span>
                      I am a
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-input role-select"
                    >
                      <option value="patient">Patient (Looking for doctors)</option>
                      <option value="doctor">Doctor (Offering services)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <div className="form-step">
                  <div className="form-header">
                    <h2>Contact Information</h2>
                    <p>How can we reach you?</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">
                      <span className="label-icon">📧</span>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      <span className="label-icon">📱</span>
                      Phone Number
                    </label>
                    <div className="phone-input-wrapper">
                      <span className="phone-prefix">+91</span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength="10"
                        className="form-input phone-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Security */}
              {step === 3 && (
                <div className="form-step">
                  <div className="form-header">
                    <h2>Set your password</h2>
                    <p>Create a strong password to secure your account</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      <span className="label-icon">🔐</span>
                      Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        className="form-input"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <div className="password-strength">
                      <div className={`strength-bar ${formData.password.length >= 6 ? 'strong' : ''}`}></div>
                      <small>
                        {formData.password.length === 0
                          ? 'Enter password'
                          : formData.password.length < 6
                          ? 'Too short'
                          : formData.password.length < 10
                          ? 'Good'
                          : 'Strong'}
                      </small>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <span className="label-icon">✓</span>
                      Confirm Password
                    </label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        className="form-input"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {formData.password && formData.confirmPassword && (
                      <small className={formData.password === formData.confirmPassword ? 'match' : 'mismatch'}>
                        {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords don\'t match'}
                      </small>
                    )}
                  </div>

                  <div className="terms-section">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="checkbox"
                    />
                    <label htmlFor="agreeTerms">
                      I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                    </label>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="form-actions">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="button-secondary"
                  >
                    ← Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="submit-button register-next-button"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-button register-button"
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <span className="button-icon">✓</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Login Link */}
              <div className="auth-footer">
                <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
