import { useState, useEffect } from 'react';
import bannerImg from "../assets/banner1Img.jpeg";
import banner2Img from "../assets/banner2Img.jpeg";
import banner3Img from "../assets/banner3Img.jpeg";

const slides = [
  {
    id: 0,
    badge: "ARDUINO CORNER",
    title: (
      <>
        Arduino Boards<br />
        For Every <span className="text-orangered fst-italic">Maker</span>
      </>
    ),
    text: "UNO, Mega, Nano, Leonardo and the all-new R4 series. Pick your perfect development platform.",
    btn1Text: "Browse Arduino",
    btn2Text: "Project Ideas",
    bgImg: bannerImg,
  },

  {
    id: 1,
    badge: "ROBOTICS & AUTOMATION",
    title: (
      <>
        Build Amazing Robots<br />
        With <span className="text-orangered fst-italic">Advanced</span> Motors
      </>
    ),
    text: "DC Motors, Servo Motors, Stepper Motors and Motor Drivers. Everything you need for your robotics projects.",
    btn1Text: "Shop Motors",
    btn2Text: "Guides",
    bgImg: banner2Img,
  },
  {
    id: 2,
    badge: "ESSENTIAL SENSORS & MODULES",
    title: (
      <>
        Smart Sensors<br />
        <span className="text-orangered fst-italic">For IoT</span> Inventions
      </>
    ),
    text: "From ultrasonic to LiDAR, climate, and motion sensors for robotics, automation, and AI.",
    btn1Text: "Explore Sensors",
    btn2Text: "Tutorials",
    bgImg: banner3Img,
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play interval for smooth slide transition
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div id="heroCarousel" className="carousel slide carousel-fade position-relative">
      <div className="carousel-inner position-relative">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
            style={{
              display: index === currentSlide ? 'block' : 'none',
              transition: 'opacity 0.6s ease-in-out',
            }}
          >
            <div
              className="hero-slide d-flex align-items-center"
              style={{ backgroundImage: `url(${slide.bgImg})` }}
            >
              <div className="hero-overlay"></div>
              <div className="container position-relative py-5">
                <div className="row">
                  <div className="col-12 col-lg-7 col-md-9">
                    <div className="hero-content text-start">
                      <span className="badge-new mb-3">{slide.badge}</span>
                      <h1 className="hero-heading text-white fw-bold mb-3">
                        {slide.title}
                      </h1>
                      <p className="hero-text mb-4">{slide.text}</p>
                      <div className="d-flex flex-wrap gap-3">
                        <button className="btn btn-orangered px-4 py-2.5 rounded-3 font-weight-medium">
                          {slide.btn1Text}
                        </button>
                        <button className="btn btn-outline-light-custom px-4 py-2.5 rounded-3">
                          {slide.btn2Text}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators positioned at bottom of slide */}
        <div className="carousel-indicators mb-0" style={{ zIndex: 10 }}>
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={index === currentSlide ? 'active' : ''}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Prev Navigation Arrow */}
      <button
        className="carousel-control-prev"
        type="button"
        onClick={handlePrev}
      >
        <span className="hero-arrow">
          <i className="bi bi-chevron-left"></i>
        </span>
      </button>

      {/* Next Navigation Arrow */}
      <button
        className="carousel-control-next"
        type="button"
        onClick={handleNext}
      >
        <span className="hero-arrow">
          <i className="bi bi-chevron-right"></i>
        </span>
      </button>

      {/* Bottom Stats Bar */}
      <div
        className="stats-bar position-relative"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M9 9H5V11H9V15H11V11H15V9H11V5H9V9Z\\' fill=\\'rgba(255, 255, 255, 0.05)\\' /%3E%3C/svg%3E')",
        }}
      >
        <div className="row text-center g-0">
          <div className="col-6 col-md-3 stat-item border-end border-white border-opacity-25 py-2">
            <h2>5,000+</h2>
            <p>Products in Stock</p>
          </div>
          <div className="col-6 col-md-3 stat-item border-end border-white border-opacity-25 py-2">
            <h2>98%</h2>
            <p>Customer Satisfaction</p>
          </div>
          <div className="col-6 col-md-3 stat-item border-end border-white border-opacity-25 py-2">
            <h2>24hr</h2>
            <p>Dispatch Guarantee</p>
          </div>
          <div className="col-6 col-md-3 stat-item py-2">
            <h2>50,000+</h2>
            <p>Orders Delivered</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;