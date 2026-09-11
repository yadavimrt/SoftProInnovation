import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import QuickViewModal from '../../components/QuickViewModal';
import { formatImg } from '../../utils/imageUrl';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, addToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const getImageSrc = (item) => {
    const raw = item?.thumbnail || (item?.images && item.images.length > 0 ? item.images[0] : null);
    return formatImg(raw, 'https://placehold.co/200x200?text=No+Image');
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
                My <span style={{ color: '#2563eb' }}>Wishlist</span>
              </h2>
              <p className="text-muted small mb-0">
                Manage your saved products and move them to cart anytime.
              </p>
            </div>
            <Link to="/Product" className="btn btn-outline-secondary btn-sm rounded-pill mt-2 mt-sm-0 px-3">
              <i className="bi bi-arrow-left me-1"></i> Continue Shopping
            </Link>
          </div>

          {!localStorage.getItem('token') ? (
            /* Unauthenticated State */
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center my-5 mx-auto" style={{ maxWidth: '540px' }}>
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{ width: '80px', height: '80px' }}
              >
                <i className="bi bi-person-lock fs-1"></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Please Log In</h4>
              <p className="text-muted small mb-4">
                Log in to your account to view and manage your saved electronics and wishlist items.
              </p>
              <Link
                to="/login"
                className="btn btn-primary px-4 py-2 rounded-pill fw-semibold text-white text-decoration-none mx-auto"
                style={{ backgroundColor: '#1d4ed8', width: 'fit-content' }}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i> Log In to Account
              </Link>
            </div>
          ) : wishlistItems.length === 0 ? (
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
                className="btn btn-primary px-4 py-2 rounded-3 fw-semibold text-white text-decoration-none mx-auto"
                style={{ backgroundColor: '#1d4ed8', borderColor: '#1d4ed8', width: 'fit-content' }}
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
                      <div className="product-img-box d-flex align-items-center justify-content-center p-3 bg-white position-relative overflow-hidden" style={{ height: '200px' }}>
                        <img
                          src={getImageSrc(item)}
                          alt={item.name}
                          className="img-fluid"
                          style={{ maxHeight: '150px', objectFit: 'contain' }}
                        />

                        {/* Quick View on Hover (Direct Redirect) */}
                        <div
                          className="product-quickview-overlay"
                          onClick={() => navigate(`/product/${item._id || item.id}`)}
                          title="View Product Details"
                        >
                          <button
                            type="button"
                            className="product-quickview-pill-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${item._id || item.id}`);
                            }}
                          >
                            <i className="bi bi-eye"></i> Quick View
                          </button>
                        </div>
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
                          <Link to={`/product/${item._id || item.id}`} className="text-decoration-none text-dark">
                            {item.name}
                          </Link>
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
                          <span className="fw-bold fs-5" style={{ color: '#1d4ed8' }}>
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
                            className="btn btn-primary flex-grow-1 py-2 fw-semibold rounded-2 d-flex align-items-center justify-content-center gap-1.5"
                            onClick={() => addToCart(item, 1)}
                            disabled={!inStock}
                            title="Add to Cart"
                          >
                            <i className="bi bi-cart-plus"></i>
                            <span>Add to Cart</span>
                          </button>
                          <Link
                            to={`/product/${item._id || item.id}`}
                            className="btn btn-outline-primary py-2 px-3 fw-semibold rounded-2 text-decoration-none d-flex align-items-center justify-content-center"
                            title="View Product"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm py-2 px-3 fw-semibold rounded-2"
                            onClick={() => removeFromWishlist(item._id || item.id)}
                            title="Remove from Wishlist"
                          >
                            <i className="bi bi-trash3"></i>
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

      {/* LUXURY PROFESSIONAL QUICK VIEW MODAL */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      <Footer />
    </>
  );
};

export default Wishlist;
