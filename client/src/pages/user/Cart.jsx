import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();

  const formatImg = (imgPath) => {
    if (!imgPath) return 'https://placehold.co/400x400?text=No+Image';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      return imgPath;
    }
    return `http://localhost:5000/${imgPath.replace(/\\/g, '/')}`;
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 70;
  const tax = Math.round(subtotal * 0.18); // 18% GST estimate
  const grandTotal = subtotal + shipping;

  return (
    <>
      <Header />

      {/* Cart Breadcrumb & Header Banner */}
      <section className="py-4 bg-light border-bottom">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1" style={{ fontSize: '13px' }}>
                <Link to="/" className="text-decoration-none text-primary">Home</Link>
                <span className="text-muted">&rsaquo;</span>
                <Link to="/Product" className="text-decoration-none text-primary">Products</Link>
                <span className="text-muted">&rsaquo;</span>
                <span className="text-muted">Shopping Cart</span>
              </div>
              <h2 className="fw-bold mb-0 text-dark">
                Shopping <span className="highlight-italic" style={{ color: '#ff4500' }}>Cart</span>
              </h2>
            </div>
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fs-6 fw-semibold align-self-start align-self-md-auto">
              {getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'} in cart
            </span>
          </div>
        </div>
      </section>

      {/* Main Cart Content */}
      <section className="py-5" style={{ minHeight: '60vh', backgroundColor: '#f8fafc' }}>
        <div className="container">
          {cartItems.length === 0 ? (
            /* Empty Cart View */
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '560px', backgroundColor: '#fff' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: '90px', height: '90px', backgroundColor: '#fff5f0', color: '#ff4500' }}
              >
                <i className="bi bi-cart-x fs-1"></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Your Cart is Empty</h4>
              <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
                Looks like you haven't added any electronic components, boards, or sensors to your cart yet.
              </p>
              <Link
                to="/Product"
                className="btn py-2.5 px-4 fw-semibold rounded-pill text-white shadow-sm align-self-center text-decoration-none"
                style={{ backgroundColor: '#ff4500', border: 'none' }}
              >
                <i className="bi bi-bag-plus me-1.5"></i> Start Shopping
              </Link>
            </div>
          ) : (
            /* Filled Cart View */
            <div className="row g-4">
              {/* Left Column: Cart Items List */}
              <div className="col-12 col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3">
                  <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 text-dark">Cart Items</h5>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-2"
                      onClick={clearCart}
                      style={{ fontSize: '12px' }}
                    >
                      <i className="bi bi-trash"></i> Clear Cart
                    </button>
                  </div>

                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                          <tr>
                            <th className="py-3 px-4" style={{ minWidth: '260px' }}>Product</th>
                            <th className="py-3 text-center" style={{ minWidth: '100px' }}>Price</th>
                            <th className="py-3 text-center" style={{ minWidth: '140px' }}>Quantity</th>
                            <th className="py-3 text-end" style={{ minWidth: '110px' }}>Total</th>
                            <th className="py-3 text-center" style={{ width: '60px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((item) => {
                            const pId = item._id || item.id;
                            const itemPrice = Number(item.price) || 0;
                            const itemQty = Number(item.quantity) || 1;
                            const lineTotal = itemPrice * itemQty;

                            return (
                              <tr key={pId} className="border-bottom">
                                {/* Product Thumbnail & Title */}
                                <td className="py-3 px-4">
                                  <div className="d-flex align-items-center gap-3">
                                    <div
                                      className="rounded-3 border p-1 bg-white d-flex align-items-center justify-content-center flex-shrink-0"
                                      style={{ width: '65px', height: '65px' }}
                                    >
                                      <img
                                        src={formatImg(item.thumbnail)}
                                        alt={item.name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                      />
                                    </div>
                                    <div>
                                      <span className="badge bg-light text-muted border mb-1" style={{ fontSize: '10px' }}>
                                        {item.category}
                                      </span>
                                      <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: '14px', maxWidth: '240px', lineHeight: '1.4' }}>
                                        {item.name}
                                      </h6>
                                      {item.compareprice > item.price && (
                                        <small className="text-muted text-decoration-line-through">
                                          ₹{Number(item.compareprice).toLocaleString('en-IN')}
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* Unit Price */}
                                <td className="py-3 text-center fw-semibold text-dark">
                                  ₹{itemPrice.toLocaleString('en-IN')}
                                </td>

                                {/* Quantity Counter */}
                                <td className="py-3 text-center">
                                  <div className="d-inline-flex align-items-center border rounded-3 overflow-hidden bg-white shadow-xs">
                                    <button
                                      type="button"
                                      className="btn btn-light btn-sm px-2.5 py-1 border-0"
                                      onClick={() => updateQuantity(pId, itemQty - 1)}
                                      title="Decrease quantity"
                                    >
                                      <i className="bi bi-dash"></i>
                                    </button>
                                    <span className="px-2.5 fw-bold text-dark" style={{ minWidth: '32px', textAlign: 'center', fontSize: '13px' }}>
                                      {itemQty}
                                    </span>
                                    <button
                                      type="button"
                                      className="btn btn-light btn-sm px-2.5 py-1 border-0"
                                      onClick={() => updateQuantity(pId, itemQty + 1)}
                                      title="Increase quantity"
                                    >
                                      <i className="bi bi-plus"></i>
                                    </button>
                                  </div>
                                </td>

                                {/* Line Item Total */}
                                <td className="py-3 text-end fw-bold" style={{ color: '#ff4500' }}>
                                  ₹{lineTotal.toLocaleString('en-IN')}
                                </td>

                                {/* Remove Button */}
                                <td className="py-3 text-center">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light text-danger rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-xs"
                                    style={{ width: '32px', height: '32px' }}
                                    onClick={() => removeFromCart(pId)}
                                    title="Remove from cart"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card-footer bg-white border-top p-3 px-4 d-flex justify-content-between align-items-center">
                    <Link to="/Product" className="btn btn-light btn-sm rounded-2 text-decoration-none fw-semibold">
                      <i className="bi bi-arrow-left me-1"></i> Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="col-12 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '80px', zIndex: 10 }}>
                  <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Order Summary</h5>

                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
                    <span className="text-muted">Items Subtotal</span>
                    <span className="fw-semibold text-dark">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
                    <span className="text-muted">Shipping Fee</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold">FREE</span>
                      ) : (
                        <span className="fw-semibold text-dark">₹{shipping}</span>
                      )}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <div className="alert alert-warning py-1.5 px-2 mb-3 rounded-2 small text-center" style={{ fontSize: '11.5px' }}>
                      Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more for <strong>FREE Shipping</strong>!
                    </div>
                  )}

                  <hr className="my-3" />

                  <div className="d-flex justify-content-between align-items-baseline mb-4">
                    <span className="fw-bold text-dark fs-6">Grand Total</span>
                    <span className="fw-bold fs-4" style={{ color: '#ff4500' }}>
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn w-100 py-3 fw-bold rounded-3 text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: '#ff4500', border: 'none', fontSize: '15px' }}
                    onClick={() => alert('Proceeding to Checkout... (Payment gateway integration)')}
                  >
                    Proceed to Checkout <i className="bi bi-arrow-right"></i>
                  </button>

                  <div className="pt-4 mt-4 border-top text-muted small">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-shield-check text-success fs-5"></i>
                      <span>Safe & Secure 256-Bit SSL Checkout</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-truck text-primary fs-5"></i>
                      <span>Fast Shipping Across India</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Cart;
