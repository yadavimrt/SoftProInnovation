import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper as SwiperReact, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { API_BASE_URL } from '../config/api';
import { formatImg } from '../utils/imageUrl';

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
  { _id: 'c1', category: 'Microcontrollers', image: img1 },
  { _id: 'c2', category: 'Sensors & Modules', image: img2 },
  { _id: 'c3', category: 'Displays & LCDs', image: img3 },
  { _id: 'c4', category: 'Motors & Drivers', image: img4 },
  { _id: 'c5', category: 'Power Supplies', image: img5 },
  { _id: 'c6', category: 'Wireless & IoT', image: img6 },
  { _id: 'c7', category: 'Robotics Kits', image: img7 },
  { _id: 'c8', category: 'Cables & Headers', image: img8 },
  { _id: 'c9', category: 'Development Boards', image: img9 },
  { _id: 'c10', category: 'Accessories', image: img10 },
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
          const activeCategories = res.data.filter(
            (cat) => !cat.status || cat.status.toLowerCase() === 'active'
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

  const handleCategoryClick = (catName) => {
    if (catName) {
      navigate(`/product?category=${encodeURIComponent(catName)}`);
    }
  };

  const hasMultiple = categories.length > 5;

  return (
    <section className="category-swiper-section py-5 bg-white border-bottom border-top">
      <div className="container">
        {/* Header with Title and Custom Navigation Arrows */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <span className="section-eyebrow d-block mb-1">DISCOVER</span>
            <h2 className="section-heading mb-0">
              Popular <span className="highlight-italic">Categories</span>
            </h2>
            <div className="section-accent-line mt-2"></div>
          </div>

          {hasMultiple && (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="cat-nav-btn swiper-cat-prev rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px', padding: 0 }}
                aria-label="Previous Slide"
              >
                <i className="bi bi-chevron-left fs-6"></i>
              </button>
              <button
                type="button"
                className="cat-nav-btn swiper-cat-next rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '42px', height: '42px', padding: 0 }}
                aria-label="Next Slide"
              >
                <i className="bi bi-chevron-right fs-6"></i>
              </button>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="text-muted fw-medium">Loading categories from admin dashboard...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-4 border">
            <i className="bi bi-folder2-open fs-1 text-muted d-block mb-2"></i>
            <h6 className="text-muted mb-1">No Categories Added Yet</h6>
            <p className="small text-secondary mb-0">
              Categories added in the admin dashboard will automatically appear here.
            </p>
          </div>
        ) : (
          <SwiperReact
            key={`swiper-cat-count-${categories.length}`}
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            loop={hasMultiple}
            speed={800}
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
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: Math.min(5, categories.length),
                spaceBetween: 22,
              },
            }}
            className="category-swiper py-2"
          >
            {categories.map((cat, index) => {
              const catName = cat.category || cat.name || 'Category';
              const catImg = getCategoryImageUrl(cat, index);
              const productCount = cat.productCount !== undefined ? cat.productCount : 0;

              return (
                <SwiperSlide key={cat._id || cat.id || index}>
                  <div
                    className="category-card text-center p-4 h-100 cursor-pointer d-flex flex-column align-items-center justify-content-between"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCategoryClick(catName)}
                    title={`View products in ${catName}`}
                  >
                    <div className="category-img-wrapper mb-3 d-flex align-items-center justify-content-center">
                      <img
                        src={catImg}
                        alt={catName}
                        className="img-fluid category-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackImages[index % fallbackImages.length];
                        }}
                      />
                    </div>
                    
                    <div className="w-100">
                      <h5 className="category-card-title mb-1 text-truncate" title={catName}>
                        {catName}
                      </h5>
                      
                      <div className="d-flex align-items-center justify-content-center gap-1.5 mt-2">
                        <span className="category-card-count text-secondary bg-slate-100 border px-2.5 py-0.5 rounded-pill">
                          {productCount > 0 ? `${productCount}+ Products` : `${productCount} Products`}
                        </span>
                        <span className="category-arrow-icon">
                          <i className="bi bi-arrow-right fs-7"></i>
                        </span>
                      </div>
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
