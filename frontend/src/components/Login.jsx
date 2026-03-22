// frontend/src/components/Login.jsx

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container login-page">
      {/* Background Blur Elements */}
      <div className="blur-element blur-1"></div>
      <div className="blur-element blur-2"></div>
      <div className="blur-element blur-3"></div>

      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-content">
            <div className="brand-icon">🏥</div>
            <h1>HealthCare</h1>
            <p>Smart Appointment System</p>
            <div className="brand-features">
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Find Best Doctors</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Easy Booking</span>
              </div>
              <div className="feature">
                <span className="feature-icon">✓</span>
                <span>Expert Care</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="form-card">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

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
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">
                    <span className="label-icon">🔐</span>
                    Password
                  </label>
                  <a href="#forgot" className="forgot-link">Forgot?</a>
                </div>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
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
              </div>

              <div className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  className="checkbox"
                />
                <label htmlFor="remember">Remember me for 30 days</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="submit-button login-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="button-icon">→</span>
                  </>
                )}
              </button>

              <div className="divider">
                <span>OR</span>
              </div>

              <div className="social-login">
                <button type="button" className="social-button google">
                  <span>🔵</span> Google
                </button>
                <button type="button" className="social-button apple">
                  <span>🍎</span> Apple
                </button>
              </div>

              <div className="auth-footer">
                <p>Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
              </div>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="badge">🔒 Secure & Private</div>
            <div className="badge">✓ Verified Doctors</div>
            <div className="badge">⭐ Trusted Platform</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
