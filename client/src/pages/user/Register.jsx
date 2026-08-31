import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!agreedTerms) {
      setError('Please accept the Terms & Conditions and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/user/register', {
        name: fullName.trim(),
        mobile: mobileNumber.trim(),
        email: email.trim(),
        password: password
      });

      if (response.data.success) {
        setSuccess(response.data.message || 'Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Server error. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="login-page-wrapper d-flex flex-column align-items-center justify-content-center py-5">
        {/* Main Register Card */}
        <div className="login-card-container" style={{ maxWidth: '540px' }}>
          <div className="login-card p-4 p-sm-5">
            {/* Card Header */}
            <div className="login-card-header text-start mb-4">
              <h1 className="login-title mb-1">
                Create an <span className="highlight-italic">account</span>
              </h1>
              <p className="login-subtitle">Join thousands of makers &mdash; it's free and takes 30 seconds</p>
            </div>

            {/* Error & Success Alerts */}
            {error && (
              <div className="alert alert-danger py-2 px-3 text-start small mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success py-2 px-3 text-start small mb-3" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {success}
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit}>
              {/* Row 1: Full Name & Mobile Number */}
              <div className="row g-3 mb-3 text-start">
                <div className="col-12 col-md-6">
                  <label htmlFor="fullNameInput" className="form-label login-label">Full Name</label>
                  <div className="position-relative">
                    <input
                      id="fullNameInput"
                      type="text"
                      className="form-control login-input"
                      placeholder="Arjun Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <i className="bi bi-person login-input-icon"></i>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <label htmlFor="mobileInput" className="form-label login-label">Mobile Number</label>
                  <div className="position-relative">
                    <input
                      id="mobileInput"
                      type="tel"
                      className="form-control login-input"
                      placeholder="+91 99999 99999"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                    />
                    <i className="bi bi-phone login-input-icon"></i>
                  </div>
                </div>
              </div>

              {/* Email Address Field */}
              <div className="mb-3 text-start">
                <label htmlFor="emailInput" className="form-label login-label">Email Address</label>
                <div className="position-relative">
                  <input
                    id="emailInput"
                    type="email"
                    className="form-control login-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <i className="bi bi-envelope login-input-icon"></i>
                </div>
              </div>

              {/* Create Password Field */}
              <div className="mb-3 text-start">
                <label htmlFor="passwordInput" className="form-label login-label">Create Password</label>
                <div className="position-relative">
                  <input
                    id="passwordInput"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control login-input"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <i
                    className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} login-input-icon cursor-pointer`}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  ></i>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="form-check d-flex align-items-center gap-2 mb-4 text-start">
                <input
                  className="form-check-input login-checkbox"
                  type="checkbox"
                  id="termsCheck"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  required
                />
                <label className="form-check-label login-remember-label mb-0" htmlFor="termsCheck" style={{ fontSize: '13.5px' }}>
                  I agree to the{' '}
                  <Link to="/terms" style={{ color: '#3945E0', textDecoration: 'underline' }}>Terms & Conditions</Link>{' '}
                  and{' '}
                  <Link to="/privacy" style={{ color: '#3945E0', textDecoration: 'underline' }}>Privacy Policy</Link>
                </label>
              </div>

              {/* Create Account Button */}
              <button 
                type="submit" 
                className="btn btn-orangered-about w-100 py-3 rounded-3 font-weight-bold mb-4" 
                style={{ fontSize: '16px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="login-divider d-flex align-items-center my-4">
                <div className="flex-grow-1 border-bottom"></div>
                <span className="px-3 text-muted" style={{ fontSize: '13px' }}>already a member?</span>
                <div className="flex-grow-1 border-bottom"></div>
              </div>

              {/* Have an Account / Sign In Link */}
              <div className="text-center pt-1">
                <span className="text-secondary" style={{ fontSize: '14.5px' }}>Have an account? </span>
                <Link to="/login" className="login-create-link text-decoration-none fw-semibold">
                  Sign in &rarr;
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
