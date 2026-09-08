import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../../assets/logo.png';
import { API_BASE_URL } from '../../config/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/login`, {
        email: email.trim(),
        password: password
      });

      if (response.data.success) {
        setSuccess('Login successful! Redirecting...');
        // Save user session in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role || 'user');
        localStorage.setItem('name', response.data.name || response.data.user?.name);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        if (response.data.adminId) {
          localStorage.setItem('adminId', response.data.adminId);
        }
        if (response.data.user?.picture) {
          localStorage.setItem('picture', response.data.user.picture);
        } else {
          localStorage.removeItem('picture');
        }

        // Notify app of user session change
        window.dispatchEvent(new Event('userSessionChange'));

        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password / Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '100vh', backgroundColor: '#f4f7fb' }}>
      {/* Brand Logo Header */}
      <div className="text-center mb-4">
        <Link to="/" className="d-inline-flex align-items-center text-decoration-none">
          <img src={logo} alt="Softpro" width="36" height="36" className="me-2" style={{ objectFit: 'contain' }} />
          <span className="fs-4 fw-bold text-dark">Softpro<span style={{ color: '#3945E0' }}>Innovation</span></span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="login-card-container">
          <div className="login-card p-4 p-sm-5">
            {/* Card Header */}
            <div className="login-card-header text-start mb-4">
              <h1 className="login-title mb-1">
                Welcome <span className="highlight-italic">back</span>
              </h1>
              <p className="login-subtitle">Sign in to your account to continue shopping</p>
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

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
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

              {/* Password Field */}
              <div className="mb-3 text-start">
                <label htmlFor="passwordInput" className="form-label login-label">Password</label>
                <div className="position-relative">
                  <input
                    id="passwordInput"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control login-input"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <i
                    className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} login-input-icon cursor-pointer`}
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  ></i>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="form-check d-flex align-items-center gap-2 mb-0">
                  <input
                    className="form-check-input login-checkbox"
                    type="checkbox"
                    id="rememberCheck"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label login-remember-label mb-0" htmlFor="rememberCheck">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="login-forgot-link text-decoration-none">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button 
                type="submit" 
                className="btn btn-orangered-about w-100 py-3 rounded-3 font-weight-bold mb-4" 
                style={{ fontSize: '16px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Or Divider */}
              <div className="login-divider d-flex align-items-center my-4">
                <div className="flex-grow-1 border-bottom"></div>
                <span className="px-3 text-muted" style={{ fontSize: '13px' }}>or</span>
                <div className="flex-grow-1 border-bottom"></div>
              </div>

              {/* Register Link */}
              <div className="text-center pt-1">
                <span className="text-secondary" style={{ fontSize: '14.5px' }}>Don't have an account? </span>
                <Link to="/register" className="login-create-link text-decoration-none fw-semibold">
                  Create one free &rarr;
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Terms & Privacy Legal Text */}
        <div className="login-legal-text mt-4 text-center">
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            By signing in you agree to our{' '}
            <Link to="/terms" style={{ color: '#3945E0', textDecoration: 'underline' }}>Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" style={{ color: '#3945E0', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </span>
        </div>
      </div>
  );
};

export default Login;
