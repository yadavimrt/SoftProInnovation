import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper as SwiperReact, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { API_BASE_URL } from '../config/api';
import { formatImg } from '../utils/imageUrl';
import './CategorySwiper.css';

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

const fallbackImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

const fallbackCategories = [
  { _id: 'c1', category: 'Microcontrollers & Development Boards', image: img1, productCount: 14 },
  { _id: 'c2', category: 'Sensor', image: img2, productCount: 14 },
  { _id: 'c3', category: 'Displays & Indicators', image: img3, productCount: 6 },
  { _id: 'c4', category: 'Actuators & Motors', image: img4, productCount: 16 },
  { _id: 'c5', category: 'Power & Battery Components', image: img5, productCount: 12 },
  { _id: 'c6', category: 'Wireless & Communication Modules', image: img6, productCount: 10 },
  { _id: 'c7', category: 'IoT KIT', image: img7, productCount: 8 }
];

const Swiper = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/category/show`);
        if (!isMounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Filter active categories that have products or are populated
          const activeCategories = res.data.filter(
            (cat) =>
              (!cat.status || cat.status.toLowerCase() === 'active') &&
              (cat.productCount === undefined || cat.productCount > 0)
          );
          setCategories(activeCategories.length > 0 ? activeCategories : fallbackCategories);
        } else {
          setCategories(fallbackCategories);
        }
      } catch {
        if (isMounted) setCategories(fallbackCategories);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCategoryImageUrl = (cat, index) => {
    if (cat?.image && typeof cat.image === 'string' && cat.image.trim() !== '') {
      return formatImg(cat.image, fallbackImages[index % fallbackImages.length]);
    }
    return fallbackImages[index % fallbackImages.length];
  };

  const getCategoryIcon = (name) => {
    const n = (name || '').toLowerCase().trim();
    if (n.includes('microcontroller') || n.includes('development board') || n.includes('mcu')) return 'bi-cpu-fill';
    if (n.includes('sensor')) return 'bi-broadcast-pin';
    if (n.includes('display') || n.includes('indicator') || n.includes('screen') || n.includes('lcd') || n.includes('oled')) return 'bi-display';
    if (n.includes('motor') || n.includes('actuator')) return 'bi-gear-wide-connected';
    if (n.includes('battery') || n.includes('power') || n.includes('supply')) return 'bi-battery-charging';
    if (n.includes('wireless') || n.includes('communication') || n.includes('bluetooth') || n.includes('wifi') || n.includes('rf')) return 'bi-wifi';
    if (n.includes('iot') || n.includes('kit') || n.includes('robot')) return 'bi-box-seam-fill';
    if (n.includes('raspberry') || n.includes('pi')) return 'bi-motherboard-fill';
    if (n.includes('arduino')) return 'bi-terminal-split';
    if (n.includes('esp8266') || n.includes('esp32') || n.includes('esp')) return 'bi-router-fill';
    return 'bi-tag-fill';
  };

  const handleCategoryClick = (catName) => {
    if (catName) {
      navigate(`/product?category=${encodeURIComponent(catName)}`);
    }
  };

  const hasMultiple = categories.length > 4;

  return (
    <section className="category-swiper-section">
      <div className="container cat-swiper-container">
        {/* Section Header with Navigation Controls */}
        <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4 pb-2">
          <div>
            <div className="cat-eyebrow-pill">
              <span className="cat-pulse-dot"></span>
              Explore Hardware Taxonomy
            </div>
            <h2 className="cat-section-title mb-2">
              Popular <span className="cat-gradient-title">Categories</span>
            </h2>
            <p className="cat-section-desc mb-0">
              Find exactly what your engineering project requires across our curated component collections.
            </p>
          </div>

          {hasMultiple && (
            <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
              <button
                type="button"
                className="cat-nav-btn swiper-cat-prev"
                aria-label="Previous Categories"
                title="Previous"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                type="button"
                className="cat-nav-btn swiper-cat-next"
                aria-label="Next Categories"
                title="Next"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary me-3" role="status"></div>
            <span className="text-secondary fw-semibold">Loading component categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border">
            <i className="bi bi-folder2-open fs-1 text-muted d-block mb-2"></i>
            <h6 className="text-dark fw-bold mb-1">No Categories Found</h6>
            <p className="small text-secondary mb-0">
              Active categories added from the dashboard will appear here.
            </p>
          </div>
        ) : (
          /* Swiper Carousel */
          <SwiperReact
            key={`cat-swiper-${categories.length}`}
            modules={[Navigation, Autoplay]}
            spaceBetween={18}
            slidesPerView={1.2}
            loop={hasMultiple}
            speed={750}
            autoplay={
              categories.length > 3
                ? {
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            navigation={{
              prevEl: '.swiper-cat-prev',
              nextEl: '.swiper-cat-next',
            }}
            breakpoints={{
              480: {
                slidesPerView: Math.min(2, categories.length),
                spaceBetween: 16,
              },
              768: {
                slidesPerView: Math.min(3, categories.length),
                spaceBetween: 18,
              },
              1024: {
                slidesPerView: Math.min(4, categories.length),
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: Math.min(5, categories.length),
                spaceBetween: 22,
              },
            }}
            className="category-swiper"
          >
            {categories.map((cat, index) => {
              const catName = cat.category || cat.name || 'Category';
              const catImg = getCategoryImageUrl(cat, index);
              const productCount = cat.productCount !== undefined ? cat.productCount : 0;
              const iconClass = getCategoryIcon(catName);

              return (
                <SwiperSlide key={cat._id || cat.id || index}>
                  <div
                    className="cat-pro-card w-100"
                    onClick={() => handleCategoryClick(catName)}
                    title={`Explore ${catName}`}
                  >
                    {/* Image Showcase Stage */}
                    <div className="cat-pro-img-box">
                      {/* Floating Category Icon Badge */}
                      <span className="cat-pro-icon-badge" title={catName}>
                        <i className={`bi ${iconClass}`}></i>
                      </span>

                      {/* Centered Product Image */}
                      <img
                        src={catImg}
                        alt={catName}
                        className="cat-pro-img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImages[index % fallbackImages.length];
                        }}
                      />
                    </div>

                    {/* Category Title (Clean 2-line display without truncation) */}
                    <h3 className="cat-pro-title" title={catName}>
                      {catName}
                    </h3>

                    {/* Footer Row: Product Count Pill & Interactive Arrow */}
                    <div className="cat-pro-footer">
                      <span className="cat-pro-count">
                        {productCount > 0 ? `${productCount}+ Products` : 'Collection'}
                      </span>
                      <span className="cat-pro-arrow">
                        <i className="bi bi-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </SwiperReact>
        )}
      </div>
    </section>
  );
};

export default Swiper;
