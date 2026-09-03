import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

import img12 from '../assets/12.png';
import img13 from '../assets/13.png';
import img14 from '../assets/14.png';
import img15 from '../assets/15.png';
import img16 from '../assets/16.png';
import img17 from '../assets/17.png';
import img18 from '../assets/18.png';
import img19 from '../assets/19.png';

const fallbackProducts = [
  {
    _id: '1',
    category: 'DISPLAYS',
    name: '7-Segment Displays',
    price: 7200,
    compareprice: 8000,
    stockstatus: 'In Stock',
    badge: 'Sale',
    thumbnail: img12,
    images: [img12, img13],
    rating: 4.8,
    reviews: 126,
  },
  {
    _id: '2',
    category: 'DISPLAYS',
    name: 'TFT Display Module',
    price: 476,
    compareprice: 595,
    stockstatus: 'In Stock',
    badge: 'New',
    thumbnail: img13,
    images: [img13, img14],
    rating: 4.5,
    reviews: 89,
  },
  {
    _id: '3',
    category: 'INDICATORS',
    name: '0.96 OLED LCD',
    price: 6300,
    compareprice: 7000,
    stockstatus: 'Out of Stock',
    badge: '',
    thumbnail: img14,
    images: [img14, img15],
    rating: 4.9,
    reviews: 215,
  },
  {
    _id: '4',
    category: 'INDICATORS',
    name: '20x4 LCD Display',
    price: 540,
    compareprice: 600,
    stockstatus: 'In Stock',
    badge: '',
    thumbnail: img15,
    images: [img15, img12],
    rating: 4.7,
    reviews: 34,
  },
  {
    _id: '5',
    category: 'MICROCONTROLLERS',
    name: 'Arduino UNO R3 Board',
    price: 405,
    compareprice: 450,
    stockstatus: 'In Stock',
    badge: 'Best Seller',
    thumbnail: img16,
    images: [img16, img17],
    rating: 4.8,
    reviews: 450,
  },
  {
    _id: '6',
    category: 'SENSORS',
    name: 'Ultrasonic Distance Sensor',
    price: 120,
    compareprice: 150,
    stockstatus: 'In Stock',
    badge: '',
    thumbnail: img17,
    images: [img17, img18],
    rating: 4.6,
    reviews: 78,
  },
  {
    _id: '7',
    category: 'MOTORS',
    name: 'Servo Motor SG90',
    price: 180,
    compareprice: 200,
    stockstatus: 'In Stock',
    badge: '',
    thumbnail: img18,
    images: [img18, img19],
    rating: 4.7,
    reviews: 95,
  },
  {
    _id: '8',
    category: 'POWER SUPPLIES',
    name: '5V Power Supply Module',
    price: 250,
    compareprice: 300,
    stockstatus: 'In Stock',
    badge: 'Sale',
    thumbnail: img19,
    images: [img19, img16],
    rating: 4.4,
    reviews: 56,
  },
];

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardImageIndexMap, setCardImageIndexMap] = useState({}); // { [productId]: currentImageIndex }
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewIdx, setQuickViewIdx] = useState(0);
  const [modalQty, setModalQty] = useState(1);

  const formatImg = (imgPath) => {
    if (!imgPath) return '';
    if (
      imgPath.startsWith('http://') ||
      imgPath.startsWith('https://') ||
      imgPath.startsWith('data:')
    ) {
      return imgPath;
    }
    return `http://localhost:5000/${imgPath.replace(/\\/g, '/')}`;
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/product/show');
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Filter products with is_feature === true and status === 'active'
          const featuredOnly = res.data.filter(
            (p) => p.is_feature === true && (p.status === 'active' || !p.status)
          );
          if (featuredOnly.length > 0) {
            setProducts(featuredOnly);
          } else {
            const activeOnly = res.data.filter((p) => p.status === 'active' || !p.status);
            setProducts(activeOnly.length > 0 ? activeOnly.slice(0, 8) : fallbackProducts);
          }
        } else {
          setProducts(fallbackProducts);
        }
      } catch (e) {
        console.warn('Could not fetch featured products from server, using fallback', e.message);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewIdx(0);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
    setQuickViewIdx(0);
  };

  // Helper to extract all images for a product
  const getProductImageList = (item) => {
    const all = [];
    if (item.thumbnail) all.push(formatImg(item.thumbnail));
    if (Array.isArray(item.images)) {
      item.images.forEach((img) => {
        const formatted = formatImg(img);
        if (formatted && !all.includes(formatted)) {
          all.push(formatted);
        }
      });
    }
    return all.length > 0 ? all : ['https://placehold.co/400x400?text=No+Image'];
  };

  return (
    <section className="featured-products-section py-5" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container-fluid px-3 px-xl-5">
        {/* Section Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <span className="text-uppercase small fw-semibold text-orangered tracking-wider">
              HANDPICKED FOR YOU
            </span>
            <h2 className="display-6 fw-bold mt-1 mb-2" style={{ color: '#0f172a' }}>
              Featured <span className="text-orangered fst-italic">Products</span>
            </h2>
            <p className="text-muted mb-0" style={{ maxWidth: '500px' }}>
              Top-rated boards and components loved by engineers, students, and hobbyists.
            </p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link
              to="/product"
              className="btn btn-outline-secondary rounded-pill px-4 py-2 btn-sm fw-semibold text-decoration-none"
            >
              All Products &rarr;
            </Link>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="text-muted fw-medium">Loading featured products...</span>
          </div>
        ) : (
          /* Product Grid */
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
            {products.map((item, index) => {
              const id = item._id || item.id || index;
              const catName =
                item.category_id?.category || item.category_id?.name || item.category || 'Components';
              const title = item.name || item.title || 'Product';
              const price = item.price || 0;
              const comparePrice = item.compareprice || item.originalPrice || 0;
              const inStock =
                item.stockstatus === 'In Stock' ||
                item.inStock === true ||
                (item.stockquantity && item.stockquantity > 0);

              const allImages = getProductImageList(item);
              const currentIndex = cardImageIndexMap[id] || 0;
              const currentActiveImg = allImages[currentIndex % allImages.length];

              const discountPercent =
                comparePrice > price
                  ? Math.round(((comparePrice - price) / comparePrice) * 100)
                  : 0;

              const slidePrev = (e) => {
                e.stopPropagation();
                e.preventDefault();
                setCardImageIndexMap((prev) => ({
                  ...prev,
                  [id]: (currentIndex - 1 + allImages.length) % allImages.length,
                }));
              };

              const slideNext = (e) => {
                e.stopPropagation();
                e.preventDefault();
                setCardImageIndexMap((prev) => ({
                  ...prev,
                  [id]: (currentIndex + 1) % allImages.length,
                }));
              };

              return (
                <div key={id} className="col">
                  <div
                    className="card h-100 overflow-hidden shadow-sm product-card position-relative border-0 rounded-4"
                    style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
                    }}
                  >
                    {/* Badges */}
                    <div className="position-absolute top-0 start-0 p-2 z-3 d-flex flex-column gap-1 mt-2 ms-2">
                      {item.is_feature && (
                        <span
                          className="badge bg-warning text-dark rounded-1 px-2 py-1 shadow-sm fw-bold"
                          style={{ fontSize: '11px', letterSpacing: '0.5px' }}
                        >
                          <i className="bi bi-star-fill me-1"></i> Featured
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span
                          className="badge bg-danger text-white rounded-1 px-2 py-1 shadow-sm fw-bold"
                          style={{ fontSize: '11px', letterSpacing: '0.5px' }}
                        >
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      className="btn btn-white rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center p-0 z-3 border"
                      style={{
                        width: '36px',
                        height: '36px',
                        transition: 'all 0.2s',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(item);
                      }}
                      title={isInWishlist(id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <i
                        className={`bi ${
                          isInWishlist(id) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'
                        } fs-6`}
                      ></i>
                    </button>

                    {/* Image Slide Box Section */}
                    <div
                      className="product-img-box d-flex flex-column align-items-center justify-content-center p-3 position-relative overflow-hidden bg-white"
                      style={{ height: '240px' }}
                    >
                      <img
                        src={currentActiveImg}
                        alt={title}
                        className="img-fluid product-img"
                        style={{
                          maxHeight: '150px',
                          objectFit: 'contain',
                          transition: 'transform 0.4s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />

                      {/* Card Image Slide Arrows (visible when multiple images) */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-light position-absolute start-0 ms-1.5 rounded-circle shadow-xs d-flex align-items-center justify-content-center p-0 border opacity-75 hover-opacity-100"
                            style={{ width: '28px', height: '28px', zIndex: 2 }}
                            onClick={slidePrev}
                            title="Previous image"
                          >
                            <i className="bi bi-chevron-left small"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light position-absolute end-0 me-1.5 rounded-circle shadow-xs d-flex align-items-center justify-content-center p-0 border opacity-75 hover-opacity-100"
                            style={{ width: '28px', height: '28px', zIndex: 2 }}
                            onClick={slideNext}
                            title="Next image"
                          >
                            <i className="bi bi-chevron-right small"></i>
                          </button>
                        </>
                      )}

                      {/* Multiple Gallery Image Thumbnails Selector on hover/preview */}
                      {allImages.length > 1 && (
                        <div
                          className="d-flex gap-1 justify-content-center mt-2 position-absolute bottom-0 mb-2 py-1 px-2 rounded-pill shadow-xs"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.85)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 2,
                          }}
                        >
                          {allImages.slice(0, 4).map((imgUrl, imgIdx) => (
                            <button
                              key={imgIdx}
                              type="button"
                              className="btn p-0 border rounded-circle"
                              style={{
                                width: '18px',
                                height: '18px',
                                overflow: 'hidden',
                                borderColor:
                                  currentIndex === imgIdx ? '#3945E0' : 'rgba(0,0,0,0.15)',
                                borderWidth: currentIndex === imgIdx ? '2px' : '1px',
                                transform: currentIndex === imgIdx ? 'scale(1.15)' : 'scale(1)',
                              }}
                              onMouseEnter={() =>
                                setCardImageIndexMap((prev) => ({ ...prev, [id]: imgIdx }))
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardImageIndexMap((prev) => ({ ...prev, [id]: imgIdx }));
                              }}
                              title={`Image ${imgIdx + 1}`}
                            >
                              <img
                                src={imgUrl}
                                alt="thumb"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </button>
                          ))}
                          {allImages.length > 4 && (
                            <span
                              className="badge bg-secondary rounded-pill d-flex align-items-center justify-content-center"
                              style={{ fontSize: '9px', padding: '2px 4px' }}
                            >
                              +{allImages.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Quick View Button */}
                      <div
                        className="product-card-overlay position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.4)',
                          opacity: 0,
                          transition: 'opacity 0.3s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                      >
                        <button
                          className="btn btn-dark rounded-pill shadow-sm px-4 py-2 fw-semibold btn-view-action"
                          style={{ fontSize: '13px' }}
                          onClick={() => openQuickView(item)}
                        >
                          <i className="bi bi-eye me-1"></i> Quick View (All Images)
                        </button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="card-body p-3 p-lg-4 d-flex flex-column bg-white text-start">
                      {/* Category */}
                      <span
                        className="text-uppercase fw-bold text-muted mb-1"
                        style={{ fontSize: '11px', letterSpacing: '1px' }}
                      >
                        {catName}
                      </span>

                      {/* Title */}
                      <h6
                        className="card-title fw-bold text-dark mb-2"
                        style={{
                          fontSize: '15px',
                          minHeight: '44px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {title}
                      </h6>

                      {/* Rating */}
                      <div
                        className="d-flex align-items-center mb-2 gap-1"
                        style={{ fontSize: '12px' }}
                      >
                        <div className="text-warning d-flex">
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                        </div>
                        <span className="fw-bold ms-1 text-dark">4.8</span>
                        <span className="text-muted">
                          ({allImages.length} {allImages.length === 1 ? 'image' : 'images'})
                        </span>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-2" style={{ fontSize: '12.5px' }}>
                        {inStock ? (
                          <span className="text-success fw-semibold">
                            <i className="bi bi-check-circle-fill me-1"></i>In Stock
                          </span>
                        ) : (
                          <span className="text-danger fw-semibold">
                            <i className="bi bi-x-circle-fill me-1"></i>Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mt-auto d-flex flex-column mb-3">
                        <div className="d-flex align-items-end gap-2">
                          <span className="fw-bold fs-5" style={{ color: '#ff4500' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          {comparePrice > price && (
                            <span className="text-muted text-decoration-line-through small mb-1">
                              ₹{comparePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 w-100 mt-auto">
                        <button
                          type="button"
                          className="btn btn-outline-primary flex-grow-1 btn-sm py-2 fw-semibold rounded-2"
                          disabled={!inStock}
                          style={{ fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Add to Cart
                        </button>
                        <button
                          type="button"
                          className="btn flex-grow-1 btn-sm py-2 fw-semibold rounded-2 text-white"
                          disabled={!inStock}
                          style={{ fontSize: '12px', backgroundColor: '#ff4500', border: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            buyNow(item, 1, navigate);
                          }}
                        >
                          <i className="bi bi-lightning-fill me-1"></i> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick View Interactive Slide Modal */}
        {quickViewProduct && (() => {
          const modalImages = getProductImageList(quickViewProduct);
          const safeIdx = Math.min(quickViewIdx, Math.max(0, modalImages.length - 1));
          const currentModalImg = modalImages[safeIdx] || '';

          const handlePrevImage = () => {
            setQuickViewIdx((prev) => (prev - 1 + modalImages.length) % modalImages.length);
          };

          const handleNextImage = () => {
            setQuickViewIdx((prev) => (prev + 1) % modalImages.length);
          };

          return (
            <div
              className="modal show d-block"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}
              onClick={closeQuickView}
            >
              <div
                className="modal-dialog modal-lg modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                  <div className="modal-header border-0 bg-light p-3 px-4">
                    <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '17px' }}>
                      {quickViewProduct.name || quickViewProduct.title}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      onClick={closeQuickView}
                    ></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="row g-4">
                      {/* Left: Interactive Image Slider with Arrows & Thumbnails */}
                      <div className="col-12 col-md-6">
                        {/* Slide Box Container */}
                        <div
                          className="position-relative bg-white rounded-4 p-3 d-flex align-items-center justify-content-center border mb-3 overflow-hidden shadow-xs"
                          style={{ height: '300px', backgroundColor: '#f8fafc' }}
                        >
                          <img
                            src={currentModalImg}
                            alt={`Product Slide ${safeIdx + 1}`}
                            className="img-fluid"
                            style={{
                              maxHeight: '260px',
                              maxWidth: '100%',
                              objectFit: 'contain',
                              transition: 'all 0.3s ease',
                            }}
                          />

                          {/* Slider Navigation Arrows */}
                          {modalImages.length > 1 && (
                            <>
                              <button
                                type="button"
                                className="btn btn-white position-absolute start-0 ms-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0 border"
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                  zIndex: 4,
                                }}
                                onClick={handlePrevImage}
                                title="Previous image"
                              >
                                <i className="bi bi-chevron-left fs-5"></i>
                              </button>

                              <button
                                type="button"
                                className="btn btn-white position-absolute end-0 me-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0 border"
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                  zIndex: 4,
                                }}
                                onClick={handleNextImage}
                                title="Next image"
                              >
                                <i className="bi bi-chevron-right fs-5"></i>
                              </button>

                              {/* Slide Counter */}
                              <span
                                className="position-absolute bottom-0 end-0 mb-2 me-2 badge bg-dark bg-opacity-75 text-white rounded-pill px-2.5 py-1"
                                style={{ fontSize: '11px' }}
                              >
                                {safeIdx + 1} / {modalImages.length}
                              </span>
                            </>
                          )}
                        </div>

                        {/* All Image Thumbnails Strip */}
                        {modalImages.length > 1 && (
                          <div className="d-flex gap-2 flex-wrap justify-content-center">
                            {modalImages.map((imgUrl, i) => {
                              const isSelected = i === safeIdx;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  className="btn p-1 border rounded-3 bg-white"
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    borderColor: isSelected ? '#3945E0' : '#e2e8f0',
                                    borderWidth: isSelected ? '2px' : '1px',
                                    boxShadow: isSelected
                                      ? '0 0 0 3px rgba(57, 69, 224, 0.22)'
                                      : 'none',
                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                    transition: 'all 0.2s ease',
                                  }}
                                  onClick={() => setQuickViewIdx(i)}
                                  title={`Slide to image ${i + 1}`}
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`Gallery ${i + 1}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Right: Product Info */}
                      <div className="col-12 col-md-6 d-flex flex-column">
                        <span className="badge bg-primary bg-opacity-10 text-primary w-auto align-self-start px-2 py-1 mb-2">
                          {quickViewProduct.category_id?.category ||
                            quickViewProduct.category ||
                            'Electronics'}
                        </span>

                        <h4 className="fw-bold text-dark mb-2">
                          {quickViewProduct.name || quickViewProduct.title}
                        </h4>

                        <p className="text-muted small mb-3">
                          {quickViewProduct.shortdescription ||
                            quickViewProduct.description ||
                            'High performance electronics module designed for makers and engineers.'}
                        </p>

                        <div className="d-flex align-items-baseline gap-2 mb-3">
                          <span className="fs-3 fw-bold text-danger">
                            ₹{(quickViewProduct.price || 0).toLocaleString('en-IN')}
                          </span>
                          {quickViewProduct.compareprice > quickViewProduct.price && (
                            <span className="text-muted text-decoration-line-through">
                              ₹{quickViewProduct.compareprice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <span className="text-muted small d-block mb-1">Stock Status:</span>
                          <span className="badge bg-success bg-opacity-10 text-success px-2.5 py-1.5 fw-semibold">
                            {quickViewProduct.stockstatus || 'In Stock'}
                          </span>
                        </div>

                        {/* Quantity Selector & Action Buttons */}
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <span className="fw-semibold text-muted small">Quantity:</span>
                          <div className="input-group input-group-sm" style={{ width: '110px' }}>
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                            >
                              -
                            </button>
                            <input
                              type="text"
                              className="form-control text-center bg-white"
                              value={modalQty}
                              readOnly
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => setModalQty((q) => q + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="mt-auto d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary flex-grow-1 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-1.5"
                            onClick={() => {
                              addToCart(quickViewProduct, modalQty);
                            }}
                          >
                            <i className="bi bi-cart-plus fs-6"></i> Add to Cart
                          </button>

                          <button
                            type="button"
                            className="btn flex-grow-1 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-1.5 text-white shadow-sm"
                            style={{ backgroundColor: '#ff4500', border: 'none' }}
                            onClick={() => {
                              buyNow(quickViewProduct, modalQty, navigate);
                              closeQuickView();
                            }}
                          >
                            <i className="bi bi-lightning-fill fs-6"></i> Buy Now
                          </button>

                          <button
                            type="button"
                            className="btn p-2 border rounded-3 d-flex align-items-center justify-content-center"
                            style={{ width: '42px', borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}
                            onClick={() => {
                              toggleWishlist(quickViewProduct);
                            }}
                            title={isInWishlist(quickViewProduct._id || quickViewProduct.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                          >
                            <i className={`bi ${isInWishlist(quickViewProduct._id || quickViewProduct.id) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'} fs-5`}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

export default FeaturedProducts;
