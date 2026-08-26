import { useRef } from 'react';
import { Swiper as SwiperReact, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import img1 from '../assets/1.avif';
import img2 from '../assets/2.png';
import img3 from '../assets/3.png';
import img4 from '../assets/4.png';
import img5 from '../assets/5.png';
import img6 from '../assets/6.png';
import img7 from '../assets/7.png';
import img8 from '../assets/8.png';
import img9 from '../assets/9.png';
import img10 from '../assets/10.png';

const categories = [
  { id: 1, name: 'Microcontrollers', img: img1, count: '120+ Products' },
  { id: 2, name: 'Sensors', img: img2, count: '250+ Products' },
  { id: 3, name: 'Indicators', img: img3, count: '85+ Products' },
  { id: 4, name: 'Motors', img: img4, count: '140+ Products' },
  { id: 5, name: 'Communication Modules', img: img5, count: '95+ Products' },
  { id: 6, name: 'Battery Components', img: img6, count: '60+ Products' },
  { id: 7, name: 'Development Boards', img: img7, count: '180+ Products' },
  { id: 8, name: 'Displays', img: img8, count: '110+ Products' },
  { id: 9, name: 'ICs & Semiconductors', img: img9, count: '300+ Products' },
  { id: 10, name: 'Power Supplies', img: img10, count: '75+ Products' },
];

const Swiper = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <section className="category-section py-3">
      <div className="container">
        {/* Header Strip */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-3">
          <div>
            <span className="category-subtitle text-uppercase text-muted fw-semibold small">BROWSE BY TYPE</span>
            <h2 className="category-heading mt-1 mb-2 fw-bold">
              Popular <span className="text-orangered fst-italic">Categories</span>
            </h2>
            <p className="category-text text-muted mb-0">
              Find exactly what your project needs from our curated electronics families.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="d-flex gap-4 mt-3 mt-md-0 align-items-center">
            <button
              ref={prevRef}
              className="cat-nav-btn btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', padding: 0 }}
              aria-label="Previous Slide"
            >
              <i className="bi bi-chevron-left fs-6"></i>
            </button>
            <button
              ref={nextRef}
              className="cat-nav-btn btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', padding: 0 }}
              aria-label="Next Slide"
            >
              <i className="bi bi-chevron-right fs-6"></i>
            </button>
          </div>
        </div>

        {/* Swiper Slider */}
        <SwiperReact
          modules={[Navigation, Autoplay]}
          spaceBetween={16}
          slidesPerView={1}
          loop={true}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation
          breakpoints={{
            480: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
          }}
          className="category-swiper py-2"
        >
          {categories.map((cat) => (
            <SwiperSlide key={cat.id}>
              <div className="category-card text-center p-3 h-100">
                <div className="category-img-wrapper mb-3 mx-auto d-flex align-items-center justify-content-center">
                  <img src={cat.img} alt={cat.name} className="img-fluid category-img" />
                </div>
                <h5 className="category-card-title mb-1">{cat.name}</h5>
                <span className="category-card-count text-muted small">{cat.count}</span>
              </div>
            </SwiperSlide>
          ))}
        </SwiperReact>
      </div>
    </section>
  );
};

export default Swiper;
