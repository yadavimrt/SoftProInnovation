import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, addToCart, buyNow } = useCart();

  const getImageSrc = (item) => {
    if (item.thumbnail) {
      if (item.thumbnail.startsWith('http://') || item.thumbnail.startsWith('https://')) {
        return item.thumbnail;
      }
      return `http://localhost:5000/${item.thumbnail.replace(/\\/g, '/')}`;
    }
    if (item.images && item.images.length > 0) {
      const first = item.images[0];
      if (first.startsWith('http://') || first.startsWith('https://')) return first;
      return `http://localhost:5000/${first.replace(/\\/g, '/')}`;
    }
    return 'https://via.placeholder.com/200';
  };

  return (
    <>
      <Header />
      <div className="bg-light py-4 min-vh-100">
        <div className="container">
          {/* Breadcrumb & Title */}
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 border-bottom pb-3">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                My <span style={{ color: '#ff4500' }}>Wishlist</span>
              </h2>
              <p className="text-muted small mb-0">
                Manage your saved products and move them to cart anytime.
              </p>
            </div>
            <Link to="/Product" className="btn btn-outline-secondary btn-sm rounded-pill mt-2 mt-sm-0 px-3">
              <i className="bi bi-arrow-left me-1"></i> Continue Shopping
            </Link>
          </div>

          {wishlistItems.length === 0 ? (
            /* Empty State */
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-5 mx-auto" style={{ maxWidth: '540px' }}>
              <div
                className="rounded-circle bg-danger bg-opacity-10 text-danger mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{ width: '80px', height: '80px' }}
              >
                <i className="bi bi-heart fs-1"></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Your wishlist is empty</h4>
              <p className="text-muted small mb-4">
                Explore our catalog and save your favorite electronics, modules, and components for later!
              </p>
              <Link
                to="/Product"
                className="btn btn-orangered px-4 py-2 rounded-3 fw-semibold text-white text-decoration-none mx-auto"
                style={{ backgroundColor: '#ff4500', width: 'fit-content' }}
              >
                <i className="bi bi-grid me-2"></i> Explore Products
              </Link>
            </div>
          ) : (
            /* Wishlist Items Grid */
            <div className="row g-3 g-md-4">
              {wishlistItems.map((item) => {
                const pId = item._id || item.id;
                const price = Number(item.price) || 0;
                const comparePrice = Number(item.compareprice) || 0;
                const discount = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
                const inStock = item.stockstatus === 'In Stock' || item.stockstatus === 'active' || item.inStock !== false;

                return (
                  <div key={pId} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative bg-white text-start">
                      {/* Delete Icon Button */}
                      <button
                        className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '32px', height: '32px', zIndex: 10 }}
                        onClick={() => removeFromWishlist(pId)}
                        title="Remove from Wishlist"
                      >
                        <i className="bi bi-trash text-danger"></i>
                      </button>

                      {/* Image Box */}
                      <div className="product-img-box d-flex align-items-center justify-content-center p-3 bg-white" style={{ height: '200px' }}>
                        <img
                          src={getImageSrc(item)}
                          alt={item.name}
                          className="img-fluid"
                          style={{ maxHeight: '150px', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Card Content */}
                      <div className="card-body p-3 d-flex flex-column">
                        <span className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '11px', letterSpacing: '0.8px' }}>
                          {item.category || 'Electronics'}
                        </span>
                        <h6
                          className="fw-bold text-dark mb-2"
                          style={{
                            fontSize: '14px',
                            minHeight: '40px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.name}
                        </h6>

                        {/* Stock Status */}
                        <div className="mb-2" style={{ fontSize: '12px' }}>
                          {inStock ? (
                            <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i>In Stock</span>
                          ) : (
                            <span className="text-danger fw-semibold"><i className="bi bi-x-circle-fill me-1"></i>Out of Stock</span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mt-auto d-flex align-items-baseline gap-2 mb-3">
                          <span className="fw-bold fs-5" style={{ color: '#ff4500' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          {comparePrice > price && (
                            <span className="text-muted text-decoration-line-through small">
                              ₹{comparePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="badge bg-danger ms-auto" style={{ fontSize: '10px' }}>
                              {discount}% OFF
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary flex-grow-1 btn-sm py-2 fw-semibold rounded-2"
                            disabled={true}
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <i className="bi bi-cart-plus me-1"></i> Add to Cart
                          </button>
                          <button
                            type="button"
                            className="btn flex-grow-1 btn-sm py-2 fw-semibold rounded-2 text-white"
                            disabled={true}
                            style={{ backgroundColor: '#ff4500', border: 'none', opacity: 0.6, cursor: 'not-allowed' }}
                            onClick={(e) => {
                              e.stopPropagation();
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Wishlist;
