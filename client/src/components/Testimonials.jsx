import React from 'react';

const reviews = [
  {
    id: 1,
    stars: 5,
    quote:
      '“Received my ESP32 kit the next day. Components were properly packed and worked perfectly.”',
    initials: 'RS',
    name: 'Rahul Sharma',
    role: 'IoT Developer',
  },
  {
    id: 2,
    stars: 5,
    quote:
      '“The quality of the Raspberry Pi accessories is top-notch. Customer service was also very responsive when I had a query.”',
    initials: 'VK',
    name: 'Vikram Kapoor',
    role: 'Hardware Engineer',
  },
  {
    id: 3,
    stars: 4,
    quote:
      '“Always my go-to store for Arduino parts. Fast shipping and genuine products at a very reasonable price across India.”',
    initials: 'SN',
    name: 'Sneha Nambiar',
    role: 'Electronics Student',
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials-section py-5 bg-white">
      <div className="container py-4">
        {/* Centered Section Header matching exact design */}
        <div className="text-center mb-5">
          <span className="section-eyebrow d-block mb-2">WHAT MAKERS SAY</span>
          <h2 className="section-heading mb-0">
            Loved by the <span className="highlight-italic">Community</span>
          </h2>
          <div className="section-accent-line mx-auto mt-3"></div>
        </div>

        {/* Stats Row */}
        <div className="row text-center mb-5 justify-content-center">
          <div className="col-12 col-md-3 mb-3 mb-md-0">
            <h3 className="fw-bold mb-1" style={{ color: '#1e3a8a' }}>4.8/5</h3>
            <p className="text-muted mb-0 small text-uppercase fw-semibold">Average Rating</p>
          </div>
          <div className="col-12 col-md-3 mb-3 mb-md-0">
            <h3 className="fw-bold mb-1" style={{ color: '#1e3a8a' }}>2,500+</h3>
            <p className="text-muted mb-0 small text-uppercase fw-semibold">Happy Customers</p>
          </div>
          <div className="col-12 col-md-3">
            <h3 className="fw-bold mb-1" style={{ color: '#1e3a8a' }}>10,000+</h3>
            <p className="text-muted mb-0 small text-uppercase fw-semibold">Orders</p>
          </div>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="row g-4 justify-content-center">
          {reviews.map((item) => (
            <div key={item.id} className="col-12 col-md-4">
              <div className="testimonial-card h-100 p-4 rounded-4 bg-white shadow-sm d-flex flex-column justify-content-between">
                <div>
                  {/* Quote Icon */}
                  <div className="quote-mark mb-1" style={{ color: '#3945E0', fontSize: '28px', fontFamily: 'Georgia, serif', lineHeight: '1' }}>
                    “
                  </div>
                  {/* Star Rating */}
                  <div className="stars-rating mb-3" style={{ color: '#3945E0', fontSize: '15px' }}>
                    {'★'.repeat(item.stars)}
                    {'☆'.repeat(5 - item.stars)}
                  </div>
                  {/* Review Text */}
                  <p className="review-text text-secondary mb-4" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14.5px', lineHeight: '1.65' }}>
                    {item.quote}
                  </p>
                </div>

                {/* User Info Footer */}
                <div className="d-flex align-items-center gap-3 mt-auto">
                  <div
                    className="avatar-circle rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm flex-shrink-0"
                    style={{ width: '46px', height: '46px', backgroundColor: '#3945E0', fontSize: '14px' }}
                  >
                    {item.initials}
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold text-dark" style={{ fontFamily: 'Georgia, serif', fontSize: '15px' }}>
                      {item.name}
                    </h6>
                    <small className="text-muted" style={{ fontSize: '12px' }}>
                      {item.role}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
