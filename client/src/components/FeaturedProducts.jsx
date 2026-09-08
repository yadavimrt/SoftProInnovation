import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import QuickViewModal from './QuickViewModal';
import { API_BASE_URL } from '../config/api';
import { formatImg } from '../utils/imageUrl';

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
  },
];

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardImageIndexMap, setCardImageIndexMap] = useState({}); // { [productId]: currentImageIndex }
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/product/show`);
        if (!isMounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
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
      } catch {
        if (isMounted) setProducts(fallbackProducts);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const openQuickView = (product) => {
    const prodId = product._id || product.id;
    if (prodId) {
      navigate(`/product/${prodId}`);
    }
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
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
                      type="button"
                      className="btn rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center p-0 border"
                      style={{
                        width: '36px',
                        height: '36px',
                        transition: 'all 0.25s ease',
                        backgroundColor: isInWishlist(item._id || item.id || id) ? '#fee2e2' : 'rgba(255,255,255,0.95)',
                        borderColor: isInWishlist(item._id || item.id || id) ? '#fca5a5' : '#e2e8f0',
                        cursor: 'pointer',
                        zIndex: 20
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(item);
                      }}
                      title={isInWishlist(item._id || item.id || id) ? "Remove from Wishlist" : "Add to Wishlist"}
                      aria-label="Wishlist"
                    >
                      <i
                        className={`bi ${
                          isInWishlist(item._id || item.id || id) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'
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
                            className="product-card-arrow-btn prev"
                            onClick={slidePrev}
                            title="Previous image"
                            aria-label="Previous image"
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                          <button
                            type="button"
                            className="product-card-arrow-btn next"
                            onClick={slideNext}
                            title="Next image"
                            aria-label="Next image"
                          >
                            <i className="bi bi-chevron-right"></i>
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

                      {/* Quick View on Hover (Exact Pill Button) */}
                      <div
                        className="product-quickview-overlay"
                        onClick={() => openQuickView(item)}
                        title="Click to Quick View"
                      >
                        <button
                          type="button"
                          className="product-quickview-pill-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickView(item);
                          }}
                        >
                          <i className="bi bi-eye"></i> Quick View
                        </button>
                      </div>
                    </div>

                    {/* Content Section - Modern E-commerce Redesign */}
                    <div className="product-card-details d-flex flex-column text-start">
                      {/* Top Meta: Category Pill + Stock Status */}
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <span className="product-cat-pill">
                          {catName}
                        </span>
                        <div className="stock-status-wrap">
                          {inStock ? (
                            <>
                              <span className="stock-dot in-stock"></span>
                              <span className="text-success">In Stock</span>
                            </>
                          ) : (
                            <>
                              <span className="stock-dot out-of-stock"></span>
                              <span className="text-danger">Out of Stock</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Product Title */}
                      <h6
                        className="product-title-heading"
                        title={title}
                      >
                        <Link to={`/product/${id}`} className="text-decoration-none text-dark">
                          {title}
                        </Link>
                      </h6>

                      {/* Rating & Reviews (Only show if user has reviewed) */}
                      {Boolean(item.reviews && Number(item.reviews) > 0 && item.rating) && (
                        <div className="product-rating-box">
                          <div className="product-rating-score-chip">
                            <i className="bi bi-star-fill"></i>
                            <span>{item.rating}</span>
                          </div>
                          <span className="product-review-count">
                            ({item.reviews} {item.reviews === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}

                      {/* Pricing & Action Buttons */}
                      <div className="mt-auto">
                        <div className="product-pricing-bar">
                          <span className="product-price-current">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          {comparePrice > price && (
                            <span className="product-price-compare">
                              ₹{comparePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {discountPercent > 0 && (
                            <span className="product-discount-pill">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: Add to Cart & Buy Now */}
                        <div className="d-flex gap-2 w-100 mt-2">
                          <button
                            type="button"
                            className="btn product-btn-cart flex-fill"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(item, 1);
                            }}
                            disabled={!inStock}
                            title="Add to Cart"
                          >
                            <i className="bi bi-cart-plus fs-6"></i>
                            <span>Add to Cart</span>
                          </button>
                          <button
                            type="button"
                            className="btn product-btn-buy flex-fill"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              buyNow(item, 1, navigate);
                            }}
                            disabled={!inStock}
                            title="Buy Now"
                          >
                            <i className="bi bi-lightning-charge-fill fs-6"></i>
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LUXURY PROFESSIONAL QUICK VIEW MODAL */}
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={closeQuickView}
          />
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
