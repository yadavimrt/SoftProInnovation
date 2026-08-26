import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password, rememberMe });
  };

  return (
    <>
      <Header />
      <div className="login-page-wrapper d-flex flex-column align-items-center justify-content-center py-5">
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
              <button type="submit" className="btn btn-orangered-about w-100 py-3 rounded-3 font-weight-bold mb-4" style={{ fontSize: '16px' }}>
                Sign In
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
      <Footer />
    </>
  );
};

export default Login;
