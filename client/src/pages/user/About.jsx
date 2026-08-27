import React from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link } from 'react-router-dom'

const About = () => {
  return (
    <>
      <Header />
      {/* OUR STORY SECTION */}
      <section className="about-section d-flex align-items-center">
        {/* Decorative background circles on right side */}
        <div className="about-decor-circle-1"></div>
        <div className="about-decor-circle-2"></div>
        
        <div className="container position-relative py-3" style={{ zIndex: 2 }}>
          <div className="row">
            <div className="col-12 col-lg-8 col-md-10">
              <div className="about-content text-start">
                <p className="about-eyebrow mb-3">OUR STORY</p>
                <h1 className="about-heading mb-3">
                  Empowering <span className="highlight-italic">Makers</span> <br />
                  Across India
                </h1>
                <p className="about-text mb-4">
                  SoftproInnovation started with a simple belief: every engineer, student, and <br className="d-none d-md-block" />
                  hobbyist deserves access to quality electronics components at fair prices, <br className="d-none d-md-block" />
                  with support that actually helps them build.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/Product" className="btn btn-orangered-about text-decoration-none">
                    Browse Products
                  </Link>
                  <Link to="/Contact" className="btn btn-outline-about text-decoration-none">
                    Get in Touch
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR MISSION SECTION */}
      <section className="mission-section py-5">
        <div className="container py-4">
          <div className="row align-items-center g-4 g-lg-5">
            {/* Left Column: Mission Text */}
            <div className="col-12 col-lg-6">
              <div className="mission-content text-start">
                <p className="mission-eyebrow mb-2">OUR MISSION</p>
                <h2 className="mission-heading mb-3">
                  Building the <span className="highlight-italic">Future</span> <br />
                  One Kit at a Time
                </h2>
                <div className="mission-accent-line mb-4"></div>
                <p className="mission-text mb-3">
                  We believe in lowering the barrier to hardware innovation. From a school science project
                  to a professional IoT product, we stock everything you need and ship it to your doorstep
                  anywhere in India.
                </p>
                <p className="mission-text mb-0">
                  Our team of engineers hand-picks every product, writes detailed guides, and provides
                  real human support — because we are makers ourselves.
                </p>
              </div>
            </div>

            {/* Right Column: 2x2 Grid of Stat Cards */}
            <div className="col-12 col-lg-6">
              <div className="row g-3 g-md-4">
                <div className="col-6">
                  <div className="mission-stat-card text-start">
                    <h3 className="stat-number">5,000+</h3>
                    <p className="stat-label">Products</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="mission-stat-card text-start">
                    <h3 className="stat-number">50K+</h3>
                    <p className="stat-label">Happy Customers</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="mission-stat-card text-start">
                    <h3 className="stat-number">7</h3>
                    <p className="stat-label">Years in Business</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="mission-stat-card text-start">
                    <h3 className="stat-number">99.8%</h3>
                    <p className="stat-label">Order Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR CORE VALUES SECTION */}
      <section className="values-section py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <p className="values-eyebrow mb-2">WHAT WE STAND FOR</p>
            <h2 className="values-heading mb-3">
              Our Core <span className="highlight-italic">Values</span>
            </h2>
            <div className="values-accent-line mx-auto"></div>
          </div>

          <div className="row g-4">
            {/* Card 1 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="value-card text-start h-100">
                <div className="value-icon mb-3">🎯</div>
                <h3 className="value-title mb-2">Curated Quality</h3>
                <p className="value-desc mb-0">
                  Every product is tested and verified by our in-house engineering team before it hits the shelf.
                </p>
              </div>
            </div>

            {/* Card 2 (Featured) */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="value-card value-card-featured text-start h-100">
                <div className="value-icon mb-3">🚀</div>
                <h3 className="value-title mb-2">Fast Fulfilment</h3>
                <p className="value-desc mb-0">
                  Orders placed before 3 PM are dispatched same day. Most customers receive within 24 - 48 hours.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="value-card text-start h-100">
                <div className="value-icon mb-3">🛡️</div>
                <h3 className="value-title mb-2">Genuine Components</h3>
                <p className="value-desc mb-0">
                  We source directly from Raspberry Pi Ltd, Arduino S.r.l., and authorised distributors only.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="value-card text-start h-100">
                <div className="value-icon mb-3">🤝</div>
                <h3 className="value-title mb-2">Maker Support</h3>
                <p className="value-desc mb-0">
                  Our technical team is available via chat, email, and phone to help debug your projects.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="value-card text-start h-100">
                <div className="value-icon mb-3">🌱</div>
                <h3 className="value-title mb-2">Community First</h3>
                <p className="value-desc mb-0">
                  We sponsor hackathons, college labs, and open-source hardware projects across India.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="col-12 col-md-6 col-lg-4">
              <div className="value-card text-start h-100">
                <div className="value-icon mb-3">💡</div>
                <h3 className="value-title mb-2">Continuous Learning</h3>
                <p className="value-desc mb-0">
                  Free project tutorials, wiring guides, and datasheets ship with every order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR JOURNEY TIMELINE SECTION */}
      <section className="journey-section py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <p className="journey-eyebrow mb-2">HOW WE GOT HERE</p>
            <h2 className="journey-heading mb-3">
              Our <span className="highlight-italic">Journey</span>
            </h2>
            <div className="journey-accent-line mx-auto"></div>
          </div>

          <div className="journey-timeline mx-auto">
            {/* Item 1 */}
            <div className="timeline-item d-flex align-items-center mb-4">
              <div className="timeline-year">2018</div>
              <div className="timeline-divider"></div>
              <div className="timeline-content text-start">
                Founded in a small garage in Lucknow with 200 SKUs and a dream.
              </div>
            </div>

            {/* Item 2 */}
            <div className="timeline-item d-flex align-items-center mb-4">
              <div className="timeline-year">2019</div>
              <div className="timeline-divider"></div>
              <div className="timeline-content text-start">
                Launched online store — 1,000 orders in the first six months.
              </div>
            </div>

            {/* Item 3 */}
            <div className="timeline-item d-flex align-items-center mb-4">
              <div className="timeline-year">2021</div>
              <div className="timeline-divider"></div>
              <div className="timeline-content text-start">
                Reached 10,000 customers and opened our first warehouse.
              </div>
            </div>

            {/* Item 4 */}
            <div className="timeline-item d-flex align-items-center mb-4">
              <div className="timeline-year">2023</div>
              <div className="timeline-divider"></div>
              <div className="timeline-content text-start">
                Became an official Raspberry Pi Approved Reseller for India.
              </div>
            </div>

            {/* Item 5 */}
            <div className="timeline-item d-flex align-items-center">
              <div className="timeline-year">2024</div>
              <div className="timeline-divider"></div>
              <div className="timeline-content text-start">
                5,000+ products, 50,000+ orders, and growing every day.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* READY TO BUILD CTA SECTION */}
      <section className="cta-section py-5">
        <div className="container py-4 text-center">
          <p className="cta-eyebrow mb-2">READY TO BUILD?</p>
          <h2 className="cta-heading mb-4">
            Start your next project with <span className="highlight-italic">SoftproInnovation</span>
          </h2>
          <div className="d-flex justify-content-center flex-wrap gap-3">
            <Link to="/Product" className="btn btn-orangered-about text-decoration-none">
              Shop Now
            </Link>
            <Link to="/Contact" className="btn btn-secondary-cta text-decoration-none">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default About