import React from 'react';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="footer-section text-white pt-5 pb-4" style={{ backgroundColor: '#1e3a8a' }}>
      <div className="container">
        {/* Main Footer Links Grid */}
        <div className="row g-4 pb-5 border-bottom border-secondary border-opacity-25">
          {/* Column 1: Brand Info */}
          <div className="col-12 col-lg-3 me-auto">
            <a href="#" className="d-flex align-items-center text-decoration-none mb-3">
              <img src={logo} alt="SPI Logo" width="40" className="me-2" style={{ objectFit: 'contain', filter: 'invert(1) hue-rotate(39deg)', mixBlendMode: 'screen' }} />
              <span className="fs-4 fw-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
                Softpro<span style={{ color: '#3945E0' }}>Innovation</span>
              </span>
            </a>
            <p className="footer-text mb-4" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '14px', lineHeight: '1.6' }}>
              Your trusted source for microcontrollers, single board computers, and electronics components in India.
            </p>
            {/* Social Icons */}
            <div className="d-flex gap-2">
              <a href="#" className="footer-social-btn" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="footer-social-btn" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="footer-social-btn" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="footer-social-btn" aria-label="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
              <a href="#" className="footer-social-btn" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-6 col-sm-4 col-lg-2">
            <h6 className="footer-heading text-uppercase mb-3">QUICK LINKS</h6>
            <ul className="list-unstyled footer-links mb-0">
              <li><a href="#">Home</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Products</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="col-6 col-sm-4 col-lg-2">
            <h6 className="footer-heading text-uppercase mb-3">CATEGORIES</h6>
            <ul className="list-unstyled footer-links mb-0">
              <li><a href="#">Raspberry Pi</a></li>
              <li><a href="#">Arduino</a></li>
              <li><a href="#">ESP32 / ESP8266</a></li>
              <li><a href="#">Sensors</a></li>
              <li><a href="#">Displays</a></li>
              <li><a href="#">Power Modules</a></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="col-6 col-sm-4 col-lg-2">
            <h6 className="footer-heading text-uppercase mb-3">SUPPORT</h6>
            <ul className="list-unstyled footer-links mb-0">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Return Policy</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Track Order</a></li>
            </ul>
          </div>

          {/* Column 5: Get In Touch */}
          <div className="col-12 col-sm-6 col-lg-3">
            <h6 className="footer-heading text-uppercase mb-3">GET IN TOUCH</h6>
            <ul className="list-unstyled footer-contact mb-0">
              <li className="d-flex align-items-start mb-3">
                <i className="bi bi-geo-alt-fill text-orangered me-2 mt-1 fs-6"></i>
                <div style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.5' }}>
                  <strong className="text-white d-block">Softpro House</strong>
                  3/213, Sec-J, Jankipuram, Kursi Road<br />
                  Near Gudamba Police Station<br />
                  Lucknow - 226021
                </div>
              </li>
              <li className="d-flex align-items-center mb-3">
                <i className="bi bi-telephone-fill text-orangered me-2 fs-6"></i>
                <a href="tel:+917830198385" className="text-decoration-none" style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.75)' }}>
                  +91 78301 98385
                </a>
              </li>
              <li className="d-flex align-items-center mb-3">
                <i className="bi bi-envelope-fill text-orangered me-2 fs-6"></i>
                <a href="mailto:pushkar.softpro@gmail.com" className="text-decoration-none" style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.75)' }}>
                  pushkar.softpro@gmail.com
                </a>
              </li>
              <li className="d-flex align-items-center">
                <i className="bi bi-clock-fill text-orangered me-2 fs-6"></i>
                <span style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.75)' }}>
                  Mon – Sat: 10:00 AM – 7:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-4" style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
          <p className="mb-2 mb-md-0">
            &copy; 2026 SoftproInnovation. All rights reserved.
          </p>
          <p className="mb-0">
            Design &amp; Development by Softpro India Computer Technology Pvt. Ltd
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
