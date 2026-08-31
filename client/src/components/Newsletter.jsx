import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section className="newsletter-section py-5" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container">
        <div className="newsletter-card position-relative overflow-hidden p-4 p-md-5">
          {/* Decorative Background Circles on the right */}
          <div className="newsletter-decor-circle-1"></div>
          <div className="newsletter-decor-circle-2"></div>

          <div className="row align-items-center position-relative" style={{ zIndex: 2 }}>
            {/* Left Content */}
            <div className="col-12 col-lg-6 mb-4 mb-lg-0">
              <h2 className="newsletter-title text-white fw-bold mb-2">
                Stay Ahead of the Curve
              </h2>
              <p className="newsletter-subtitle text-white-50 mb-0">
                Get launch alerts, project tutorials, and exclusive deals straight to your inbox.
              </p>
            </div>

            {/* Right Form */}
            <div className="col-12 col-lg-6">
              {subscribed ? (
                <div className="alert alert-light text-orangered fw-bold mb-0 text-center rounded-3 py-3 shadow-sm">
                  <i className="bi bi-check-circle-fill me-2"></i> Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="d-flex flex-column flex-sm-row gap-3 justify-content-lg-end">
                  <input
                    type="email"
                    required
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control newsletter-input flex-grow-1"
                    style={{ maxWidth: '380px' }}
                  />
                  <button type="submit" className="btn btn-white text-orangered fw-bold newsletter-btn">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
