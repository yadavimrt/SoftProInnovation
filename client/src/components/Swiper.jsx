import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const fallbackImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

const Swiper = () => {
  const navigate = useNavigate();
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch all active categories directly from the admin database
      const res = await axios.get('http://localhost:5000/api/category/show');
      if (Array.isArray(res.data)) {
        // Only show active categories on homepage
        const activeCategories = res.data.filter(
          (cat) => !cat.status || cat.status.toLowerCase() === 'active'
        );
        setCategories(activeCategories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading categories from admin dashboard:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryImageUrl = (cat, index) => {
    if (cat.image && typeof cat.image === 'string' && cat.image.trim() !== '') {
      if (cat.image.startsWith('http://') || cat.image.startsWith('https://')) {
        return cat.image;
      }
      return `http://localhost:5000/${cat.image.replace(/\\/g, '/')}`;
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
          {categories.length > 1 && (
            <div className="d-flex gap-2 mt-3 mt-md-0 align-items-center">
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
              Admin dashboard mein category add karte hi yahan automatically list show hone lagegi.
            </p>
          </div>
        ) : (
          /* Dynamic Categories Swiper */
          <SwiperReact
            key={`swiper-cat-count-${categories.length}`}
            modules={[Navigation, Autoplay]}
            spaceBetween={16}
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
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
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
                spaceBetween: 20,
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
                    className="category-card text-center p-3 h-100 cursor-pointer"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCategoryClick(catName)}
                    title={`View products in ${catName}`}
                  >
                    <div className="category-img-wrapper mb-3 mx-auto d-flex align-items-center justify-content-center">
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
                    <h5 className="category-card-title mb-1 text-truncate" title={catName}>
                      {catName}
                    </h5>
                    <span className="category-card-count text-muted small">
                      {productCount > 0 ? `${productCount}+ Products` : `${productCount} Products`}
                    </span>
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
