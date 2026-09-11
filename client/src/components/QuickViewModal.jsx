import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png';
import { formatImg } from '../utils/imageUrl';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [activeIdx, setActiveIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: '50%', y: '50%' });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageFrameRef = useRef(null);

  // Extract gallery images
  const getImages = () => {
    if (!product) return [];
    const list = [];
    if (product.thumbnail) list.push(formatImg(product.thumbnail));
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        const formatted = formatImg(img);
        if (formatted && !list.includes(formatted)) {
          list.push(formatted);
        }
      });
    }
    return list.length > 0 ? list : ['https://placehold.co/500x500?text=No+Image'];
  };

  const images = getImages();
  const safeIdx = Math.min(activeIdx, Math.max(0, images.length - 1));
  const activeImage = images[safeIdx];

  // Derived Product Details
  const pId = product?._id || product?.id || 'prod';
  const name = product?.name || product?.title || 'Product';
  const catName =
    product?.category_id?.category ||
    product?.category_id?.name ||
    product?.category ||
    'Electronics';
  const price = Number(product?.price) || 0;
  const comparePrice = Number(product?.compareprice) || Number(product?.originalPrice) || 0;
  const discountPercent =
    comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const stockStatus = (product?.stockstatus || 'In Stock').trim();
  const stockQty = Number(product?.stockquantity) || 0;
  const inStock =
    stockStatus.toLowerCase() === 'in stock' ||
    stockStatus.toLowerCase() === 'active' ||
    (stockQty > 0 && stockStatus.toLowerCase() !== 'out of stock');

  const sku = product?.sku || `SP-${(product?._id ? product._id.slice(-6) : 'DEMO').toUpperCase()}`;
  const desc =
    product?.shortdescription ||
    product?.description ||
    'Precision engineered electronic hardware built for superior reliability and performance in robotics, IoT, and embedded electronics.';

  const isFavorite = isInWishlist(pId);

  // Keyboard navigation & body overflow lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        setActiveIdx((prev) => (prev + 1) % images.length);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, images.length, isLightboxOpen]);

  // Mouse move zoom calculation
  const handleMouseMove = (e) => {
    if (!imageFrameRef.current) return;
    const rect = imageFrameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: `${x.toFixed(1)}%`, y: `${y.toFixed(1)}%` });
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev + 1) % images.length);
  };

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity);
    if (success) {
      onClose();
      navigate('/cart');
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  return (
    <>
      <div className="qv-backdrop" onClick={onClose}>
        <div className="qv-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="qv-modal-card">
            {/* Header: Softpro Innovation Brand + Breadcrumb + Close Button */}
            <div className="qv-modal-header">
              <div className="d-flex align-items-center gap-3">
                <div className="qv-header-brand">
                  <img src={logo} alt="Logo" width="24" height="24" style={{ objectFit: 'contain' }} />
                  <span>Softpro</span><span style={{ color: '#0284c7' }}>Innovation</span>
                </div>
                <div className="d-none d-md-flex align-items-center gap-2 text-muted" style={{ fontSize: '13px' }}>
                  <span>›</span>
                  <Link to="/" onClick={onClose} className="text-secondary text-decoration-none">Home</Link>
                  <span>›</span>
                  <Link to="/product" onClick={onClose} className="text-secondary text-decoration-none">{catName}</Link>
                  <span>›</span>
                  <span className="text-primary fw-semibold">{name}</span>
                </div>
              </div>

              <button
                type="button"
                className="qv-close-btn"
                onClick={onClose}
                title="Close (Esc)"
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body: 2-Column Showcase */}
            <div className="qv-modal-body">
              <div className="qv-layout-grid">
                {/* Left Column: Image Showcase */}
                <div>
                  <div
                    ref={imageFrameRef}
                    className={`qv-image-frame ${isZooming ? 'is-zooming' : ''}`}
                    style={{
                      '--zoom-x': zoomPos.x,
                      '--zoom-y': zoomPos.y,
                    }}
                    onMouseEnter={() => setIsZooming(true)}
                    onMouseLeave={() => setIsZooming(false)}
                    onMouseMove={handleMouseMove}
                  >
                    <img src={activeImage} alt={name} className="qv-main-display-img" />

                    <button
                      type="button"
                      className="qv-zoom-trigger"
                      onClick={() => setIsLightboxOpen(true)}
                      title="Click to expand"
                    >
                      <i className="bi bi-zoom-in"></i>
                      <span>Zoom</span>
                    </button>

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="qv-nav-btn prev"
                          onClick={handlePrev}
                          title="Previous image"
                          aria-label="Previous image"
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                        <button
                          type="button"
                          className="qv-nav-btn next"
                          onClick={handleNext}
                          title="Next image"
                          aria-label="Next image"
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails Row */}
                  {images.length > 1 && (
                    <div className="qv-thumbs-strip">
                      {images.map((imgUrl, i) => {
                        const isActive = i === safeIdx;
                        return (
                          <button
                            key={i}
                            type="button"
                            className={`qv-thumb-item ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveIdx(i)}
                            title={`View image ${i + 1}`}
                          >
                            <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="qv-thumb-img" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Product Details */}
                <div>
                  {/* Category Pill */}
                  <div className="qv-cat-header">{catName}</div>

                  {/* Product Title */}
                  <h2 className="qv-headline-title">{name}</h2>

                  {/* Meta: SKU & Stock Status */}
                  <div className="qv-inventory-row">
                    <span>SKU: <strong className="text-dark">{sku}</strong></span>
                    <span className={`qv-status-badge ${inStock ? 'in-stock' : 'out-stock'}`}>
                      <span className="qv-status-dot"></span>
                      {inStock ? (stockQty > 0 ? `In Stock (${stockQty} units)` : 'In Stock') : 'Out of Stock'}
                    </span>
                  </div>


                  {/* Price & Savings */}
                  <div className="qv-pricing-row">
                    <span className="qv-price-val">₹{price.toLocaleString('en-IN')}</span>
                    {comparePrice > price && (
                      <span className="qv-compare-val">₹{comparePrice.toLocaleString('en-IN')}</span>
                    )}
                    {discountPercent > 0 && (
                      <span className="qv-discount-pill">-{discountPercent}% OFF</span>
                    )}
                  </div>

                  {/* Narrative / Description */}
                  <p className="qv-narrative">{desc}</p>

                  {/* Quantity Selector: Clean White/Slate Rail */}
                  <div className="qv-qty-block">
                    <label className="qv-qty-heading">Quantity:</label>
                    <div className="qv-qty-rail">
                      <div className="qv-qty-stepper">
                        <button
                          type="button"
                          className="qv-qty-step-btn"
                          onClick={() => handleQtyChange(-1)}
                          disabled={quantity <= 1}
                          title="Decrease quantity"
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="qv-qty-value">{quantity}</span>
                        <button
                          type="button"
                          className="qv-qty-step-btn"
                          onClick={() => handleQtyChange(1)}
                          title="Increase quantity"
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Add To Cart, Buy Now, Wishlist */}
                  <div className="qv-cta-group">
                    <button
                      type="button"
                      className="qv-cart-submit-btn"
                      onClick={handleAddToCart}
                      disabled={!inStock}
                    >
                      <i className="bi bi-bag-plus"></i>
                      <span>ADD TO CART</span>
                    </button>

                    <button
                      type="button"
                      className="qv-buy-direct-btn"
                      onClick={handleBuyNow}
                      disabled={!inStock}
                    >
                      <i className="bi bi-lightning-charge-fill"></i>
                      <span>BUY NOW</span>
                    </button>

                    <button
                      type="button"
                      className={`qv-favorite-toggle-btn ${isFavorite ? 'active' : ''}`}
                      onClick={handleWishlistToggle}
                      title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>
                  </div>

                  {/* 2x2 Trust Highlights Box */}
                  <div className="qv-guarantee-box">
                    <div className="qv-guarantee-item">
                      <i className="bi bi-truck qv-guarantee-icon"></i>
                      <span>Free Delivery</span>
                    </div>
                    <div className="qv-guarantee-item">
                      <i className="bi bi-shield-check qv-guarantee-icon"></i>
                      <span>2 Year Warranty</span>
                    </div>
                    <div className="qv-guarantee-item">
                      <i className="bi bi-arrow-repeat qv-guarantee-icon"></i>
                      <span>7-Day Returns</span>
                    </div>
                    <div className="qv-guarantee-item">
                      <i className="bi bi-cash-stack qv-guarantee-icon"></i>
                      <span>COD Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer: View Full Page link */}
            <div className="qv-modal-footer">
              <span className="text-muted" style={{ fontSize: '13px' }}>
                Softpro Innovation Guarantee • 100% Genuine Components
              </span>
              <Link
                to={`/product/${pId}`}
                onClick={onClose}
                className="qv-view-full-btn"
              >
                <span>View Full Product Page</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox View if user clicks Zoom */}
      {isLightboxOpen && (
        <div className="pd-lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <button
            type="button"
            className="pd-lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            title="Close Zoom (Esc)"
          >
            <i className="bi bi-x-lg"></i>
          </button>
          <img
            src={activeImage}
            alt={name}
            className="pd-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default QuickViewModal;
