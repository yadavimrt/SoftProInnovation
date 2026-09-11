import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: '50%', y: '50%' });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');


  const imageFrameRef = useRef(null);

  // Fetch product and related products
  useEffect(() => {
    let isMounted = true;
    window.scrollTo(0, 0);

    const fetchProductData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/product/show/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          if (isMounted) {
            setProduct(data.product);
            setActiveIdx(0);
            setQuantity(1);
          }
        } else {
          if (isMounted) setError('Product not found.');
        }
      } catch (err) {
        console.error('Error loading product details:', err);
        if (isMounted) setError('Unable to load product. Please check connection.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Gallery image processing
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

  // Derived details
  const pId = product?._id || product?.id || id;
  const name = product?.name || 'Electronic Component';
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
    product?.description ||
    product?.shortdescription ||
    'High quality precision electronic hardware engineered for superior performance in embedded systems, robotics, IoT development, and DIY electronics projects.';

  const isFavorite = isInWishlist(pId);

  // Mouse pan zoom
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
    const success = addToCart(product, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  const handleBuyNow = () => {
    const success = addToCart(product, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };


  if (loading) {
    return (
      <div className="pd-page-wrapper">
        <Header />
        <div className="container py-5 text-center my-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-secondary fw-semibold">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-page-wrapper">
        <Header />
        <div className="container py-5 text-center my-5">
          <div className="alert alert-warning d-inline-block px-4 py-3 rounded-4 shadow-sm">
            <i className="bi bi-exclamation-triangle-fill fs-4 me-2 text-warning"></i>
            <span className="fw-semibold">{error || 'Product not found.'}</span>
          </div>
          <div className="mt-4">
            <Link to="/product" className="btn btn-primary px-4 py-2 rounded-pill">
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pd-page-wrapper">
      {/* 1. Website Header */}
      <Header />

      {/* 2. Breadcrumbs Bar */}
      <div className="pd-breadcrumb-section">
        <div className="container">
          <ul className="pd-breadcrumb">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li className="pd-breadcrumb-separator">›</li>
            <li>
              <Link to="/product">Shop</Link>
            </li>
            <li className="pd-breadcrumb-separator">›</li>
            <li>
              <Link to={`/product?category=${encodeURIComponent(catName)}`}>{catName}</Link>
            </li>
            <li className="pd-breadcrumb-separator">›</li>
            <li className="pd-breadcrumb-active">{name}</li>
          </ul>
        </div>
      </div>

      {/* 3. Main Product Details Container */}
      <div className="container py-4 py-lg-5">
        <div className="pd-main-card">
          <div className="row g-4 g-lg-5 align-items-start">
            {/* Left Column: Image Showcase with Zoom & Thumbnails */}
            <div className="col-12 col-lg-6">
              <div className="pd-gallery-container">
                <div
                  ref={imageFrameRef}
                  className={`pd-image-frame ${isZooming ? 'is-zooming' : ''}`}
                  style={{
                    '--zoom-x': zoomPos.x,
                    '--zoom-y': zoomPos.y,
                  }}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img src={activeImage} alt={name} className="pd-main-img" />

                  {/* Corner Zoom Button */}
                  <button
                    type="button"
                    className="pd-zoom-btn"
                    onClick={() => setIsLightboxOpen(true)}
                    title="Click to view full image"
                  >
                    <i className="bi bi-zoom-in"></i>
                    <span>Zoom</span>
                  </button>

                  {/* Nav arrows if multiple images */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="pd-arrow-btn prev"
                        onClick={handlePrev}
                        title="Previous Image"
                        aria-label="Previous image"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <button
                        type="button"
                        className="pd-arrow-btn next"
                        onClick={handleNext}
                        title="Next Image"
                        aria-label="Next image"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                {images.length > 1 && (
                  <div className="pd-thumbs-row">
                    {images.map((imgUrl, i) => {
                      const isActive = i === safeIdx;
                      return (
                        <button
                          key={i}
                          type="button"
                          className={`pd-thumb-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveIdx(i)}
                          title={`View image ${i + 1}`}
                        >
                          <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="pd-thumb-img" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Product Info, Options & Actions */}
            <div className="col-12 col-lg-6">
              <div className="pd-details-container">
                {/* Category Badge */}
                <div className="pd-cat-badge">{catName}</div>

                {/* Headline Title */}
                <h1 className="pd-title">{name}</h1>

                {/* Meta: SKU & Stock Status */}
                <div className="pd-meta-row">
                  <span>SKU: <strong className="text-dark">{sku}</strong></span>
                  <span className={`pd-stock-pill ${inStock ? 'in-stock' : 'out-stock'}`}>
                    <span className="pd-stock-dot"></span>
                    {inStock ? (stockQty > 0 ? `In Stock (${stockQty} units)` : 'In Stock') : 'Out of Stock'}
                  </span>
                </div>


                {/* Price & Savings */}
                <div className="pd-price-card">
                  <span className="pd-current-price">₹{price.toLocaleString('en-IN')}</span>
                  {comparePrice > price && (
                    <span className="pd-compare-price">₹{comparePrice.toLocaleString('en-IN')}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="pd-discount-badge">{discountPercent}% OFF</span>
                  )}
                </div>

                {/* Description */}
                <p className="pd-description">{product.shortdescription || desc}</p>

                {/* Quantity Selector: Clean White/Slate Rail */}
                <div className="pd-qty-group">
                  <label className="pd-qty-label">Quantity:</label>
                  <div className="pd-qty-box">
                    <div className="pd-qty-stepper">
                      <button
                        type="button"
                        className="pd-qty-btn"
                        onClick={() => handleQtyChange(-1)}
                        disabled={quantity <= 1}
                        title="Decrease"
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="pd-qty-display">{quantity}</span>
                      <button
                        type="button"
                        className="pd-qty-btn"
                        onClick={() => handleQtyChange(1)}
                        title="Increase"
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Add To Cart, Buy Now, Wishlist */}
                <div className="pd-actions-row">
                  <button
                    type="button"
                    className="pd-btn-cart"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    <i className="bi bi-bag-plus"></i>
                    <span>ADD TO CART</span>
                  </button>

                  <button
                    type="button"
                    className="pd-btn-buy"
                    onClick={handleBuyNow}
                    disabled={!inStock}
                  >
                    <i className="bi bi-lightning-charge-fill"></i>
                    <span>BUY NOW</span>
                  </button>

                  <button
                    type="button"
                    className={`pd-btn-wishlist ${isFavorite ? 'active' : ''}`}
                    onClick={handleWishlistToggle}
                    title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  </button>
                </div>

                {/* 2x2 Trust Highlights Box */}
                <div className="pd-trust-card">
                  <div className="pd-trust-item">
                    <i className="bi bi-truck pd-trust-icon"></i>
                    <span>{product.isfreedelivery !== false ? 'Free Delivery' : 'Fast Shipping'}</span>
                  </div>
                  <div className="pd-trust-item">
                    <i className="bi bi-shield-check pd-trust-icon"></i>
                    <span>2 Year Brand Warranty</span>
                  </div>
                  <div className="pd-trust-item">
                    <i className="bi bi-arrow-repeat pd-trust-icon"></i>
                    <span>{product.refund_days ? `${product.refund_days}-Day Returns` : '7-Day Returns'}</span>
                  </div>
                  <div className="pd-trust-item">
                    <i className="bi bi-cash-stack pd-trust-icon"></i>
                    <span>COD Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Specifications & Description Tabs */}
        <div className="pd-tabs-card mt-4">
          <div className="pd-tabs-nav">
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Full Description
            </button>
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              type="button"
              className={`pd-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping & Policy
            </button>
          </div>

          <div className="tab-content py-2">
            {activeTab === 'description' && (
              <div className="text-secondary lh-lg">
                <p>{desc}</p>
                {product.description && product.shortdescription && (
                  <p className="mt-3">{product.description}</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="table-responsive">
                <table className="table table-bordered mb-0">
                  <tbody>
                    <tr>
                      <th style={{ width: '220px', background: '#f8fafc' }}>Category</th>
                      <td>{catName}</td>
                    </tr>
                    <tr>
                      <th style={{ background: '#f8fafc' }}>SKU</th>
                      <td>{sku}</td>
                    </tr>
                    {product.width && (
                      <tr>
                        <th style={{ background: '#f8fafc' }}>Dimensions</th>
                        <td>{product.width} x {product.height} mm</td>
                      </tr>
                    )}
                    {Array.isArray(product.tags) && product.tags.length > 0 && (
                      <tr>
                        <th style={{ background: '#f8fafc' }}>Tags</th>
                        <td>
                          {product.tags.map((t, idx) => (
                            <span key={idx} className="badge bg-light text-dark border me-1">
                              {t}
                            </span>
                          ))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="text-secondary lh-lg">
                <ul className="mb-0 ps-3">
                  <li><strong>Delivery:</strong> Dispatched within 24 hours across India.</li>
                  <li><strong>Warranty:</strong> 2 Year manufacturer warranty against manufacturing defects.</li>
                  <li><strong>Return Policy:</strong> {product.refund_days || 7}-day replacement guarantee if defective upon arrival.</li>
                  <li><strong>Payment:</strong> Cash on delivery, UPI, Credit/Debit cards accepted.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 6. Lightbox Overlay */}
      {isLightboxOpen && (
        <div className="pd-lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <button
            type="button"
            className="pd-lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            title="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
          <img src={activeImage} alt={name} className="pd-lightbox-img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* 7. Website Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetail;
