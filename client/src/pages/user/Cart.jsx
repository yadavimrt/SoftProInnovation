import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { formatImg } from '../../utils/imageUrl';
import { API_BASE_URL } from '../../config/api';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const subtotal = getCartTotal();
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 70;
  const grandTotal = subtotal + shipping;
  const totalMrp = cartItems.reduce((total, item) => total + (Number(item.compareprice) || Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const savings = Math.max(totalMrp - subtotal, 0);

  useEffect(() => {
    const loadDeliveryAddress = async () => {
      const token = localStorage.getItem('token');
      let storedUser;
      try {
        storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      } catch {
        storedUser = null;
      }

      let userId = storedUser?._id || storedUser?.id;
      if (!userId && token) {
        try {
          const currentUser = await axios.get(`${API_BASE_URL}/api/user/current-user`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          userId = currentUser.data?.user?._id;
        } catch {
          userId = null;
        }
      }
      if (!userId) return;

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/address/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setDeliveryAddress(data?.addresses?.find((item) => item.isdefault === 'yes') || data?.addresses?.[0] || data?.[0] || null);
      } catch (error) {
        console.error('Failed to load cart delivery address:', error.response?.data || error.message);
        setDeliveryAddress(null);
      }
    };

    loadDeliveryAddress();
  }, []);

  return (
    <>
      <Header />

      {/* Cart Breadcrumb & Header Banner */}
      <section className="cart-hero py-4">
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
      <section className="cart-page py-4" style={{ minHeight: '60vh' }}>
        <div className="container">
          {!localStorage.getItem('token') ? (
            /* Unauthenticated View */
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center mx-auto" style={{ maxWidth: '560px', backgroundColor: '#fff' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                style={{ width: '90px', height: '90px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}
              >
                <i className="bi bi-person-lock fs-1"></i>
              </div>
              <h4 className="fw-bold text-dark mb-2">Please Log In</h4>
              <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
                Please log in to your account to view and manage your shopping cart items, apply discounts, and proceed to checkout.
              </p>
              <Link
                to="/login"
                className="btn py-2.5 px-4 fw-semibold rounded-pill text-white shadow-sm align-self-center text-decoration-none"
                style={{ backgroundColor: '#1d4ed8', border: 'none' }}
              >
                <i className="bi bi-box-arrow-in-right me-1.5"></i> Log In to Account
              </Link>
            </div>
          ) : cartItems.length === 0 ? (
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
            <>
            {showOrderSummary && (
              <div className="cart-progress bg-white border shadow-sm mb-3 px-4 py-2">
                <div className="d-flex align-items-center justify-content-center gap-2 gap-md-4">
                  <div className="text-center text-success">
                    <span className="d-flex align-items-center justify-content-center rounded-circle border border-success mx-auto" style={{ width: 28, height: 28 }}><i className="bi bi-check"></i></span>
                    <small>Address</small>
                  </div>
                  <div className="flex-grow-1 border-top border-primary" style={{ maxWidth: 120 }}></div>
                  <div className="text-center text-primary fw-bold">
                    <span className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white mx-auto" style={{ width: 28, height: 28 }}>2</span>
                    <small>Order Summary</small>
                  </div>
                  <div className="flex-grow-1 border-top" style={{ maxWidth: 120 }}></div>
                  <div className="text-center text-muted">
                    <span className="d-flex align-items-center justify-content-center rounded-circle border mx-auto" style={{ width: 28, height: 28 }}>3</span>
                    <small>Payment</small>
                  </div>
                </div>
              </div>
            )}
            <div className={`row g-4 ${showOrderSummary ? 'order-summary-mode' : ''}`}>
              {/* Left Column: Cart Items List */}
              <div className="col-12 col-lg-8">
                {deliveryAddress ? (
                  <div className="cart-address-card bg-white border shadow-sm p-3 px-4 mb-3 d-flex flex-wrap align-items-start justify-content-between gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-semibold text-muted">Deliver to:</span>
                        <strong className="text-dark">{deliveryAddress.name}</strong>
                        <span className="badge bg-light text-secondary border">{deliveryAddress.addressType || 'HOME'}</span>
                      </div>
                      <div className="small text-muted">
                        {deliveryAddress.address || deliveryAddress.Address}, {deliveryAddress.locality || deliveryAddress.localiy}, {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                      </div>
                    </div>
                    <button type="button" className="btn btn-outline-primary btn-sm px-4" onClick={() => navigate('/addresses')}>
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="cart-address-card bg-white border shadow-sm p-3 px-4 mb-3 d-flex align-items-center justify-content-between gap-3">
                    <div><strong className="d-block text-dark">Add a delivery address</strong><small className="text-muted">Choose where you want your order delivered.</small></div>
                    <button type="button" className="btn btn-primary btn-sm px-4" onClick={() => navigate('/addresses', { state: { openForm: true } })}>Add Address</button>
                  </div>
                )}

                <div className="cart-items-card card border-0 shadow-sm overflow-hidden bg-white mb-3">
                  <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0 text-dark">{showOrderSummary ? 'Order Summary' : `Your Cart (${getCartCount()})`}</h5>
                    {!showOrderSummary && <button
                      type="button"
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-2"
                      onClick={clearCart}
                      style={{ fontSize: '12px' }}
                    >
                      <i className="bi bi-trash"></i> Clear Cart
                    </button>}
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

                            const mrp = Number(item.compareprice) || itemPrice;
                            const discount = mrp > itemPrice ? Math.round(((mrp - itemPrice) / mrp) * 100) : 0;

                            return (
                              <tr key={pId} className="cart-product-row border-bottom">
                                {/* Product Thumbnail & Title */}
                                <td className="py-3 px-4">
                                  <div className="d-flex align-items-center gap-3">
                                    <div
                                      className="rounded-3 border p-1 bg-white d-flex align-items-center justify-content-center flex-shrink-0"
                                      style={{ width: '100px', height: '100px' }}
                                    >
                                      <img
                                        src={formatImg(item.thumbnail)}
                                        alt={item.name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                      />
                                    </div>
                                    <div>
                                      <h6 className="fw-semibold text-dark mb-0" style={{ fontSize: '14px', maxWidth: '240px', lineHeight: '1.4' }}>
                                        {item.name}
                                      </h6>
                                      <small className="text-muted d-block">{item.category || 'Electronics'}</small>
                                      <div className="text-success fw-bold mt-1"><i className="bi bi-patch-check-fill me-1"></i>Assured quality</div>
                                    </div>
                                  </div>
                                </td>

                                {/* Unit Price */}
                                <td className="py-3 text-center fw-semibold text-dark">
                                  {discount > 0 && <div className="text-success small fw-bold">↓{discount}%</div>}
                                  {mrp > itemPrice && <div className="text-muted text-decoration-line-through small">₹{mrp.toLocaleString('en-IN')}</div>}
                                  <div className="fs-5">₹{itemPrice.toLocaleString('en-IN')}</div>
                                </td>

                                {/* Quantity Counter */}
                                <td className="py-3 text-center">
                                  <div className="d-inline-flex align-items-center border rounded-1 overflow-hidden bg-white">
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

                  <div className="card-footer bg-white border-top p-0 d-flex align-items-center">
                    <Link to="/Product" className="flex-fill text-center py-3 text-decoration-none text-secondary fw-semibold border-end">
                      <i className="bi bi-bookmark me-2"></i>Save for later
                    </Link>
                    <button type="button" onClick={clearCart} className="flex-fill py-3 border-0 bg-white text-secondary fw-semibold">
                      <i className="bi bi-trash me-2"></i>Remove
                    </button>
                    <button type="button" onClick={() => navigate('/addresses', { state: { openForm: true } })} className="flex-fill py-3 border-0 bg-white text-primary fw-semibold">
                      <i className="bi bi-lightning-charge me-2"></i>Buy this now
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="col-12 col-lg-4">
                <div className="cart-summary-card card border-0 shadow-sm p-4 bg-white sticky-top" style={{ top: '80px', zIndex: 10 }}>
                  <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Price details</h5>

                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
                    <span className="text-muted">MRP (incl. of all taxes)</span>
                    <span className="fw-semibold text-dark">₹{totalMrp.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
                    <span className="text-muted">Fees &amp; delivery</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="badge bg-success bg-opacity-10 text-success fw-semibold">FREE</span>
                      ) : (
                        <span className="fw-semibold text-dark">₹{shipping}</span>
                      )}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
                    <span className="text-muted">Discounts</span>
                    <span className="fw-semibold text-success">-₹{savings.toLocaleString('en-IN')}</span>
                  </div>

                  {shipping > 0 && (
                    <div className="alert alert-warning py-1.5 px-2 mb-3 rounded-2 small text-center" style={{ fontSize: '11.5px' }}>
                      Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more for <strong>FREE Shipping</strong>!
                    </div>
                  )}

                  <hr className="my-3" />

                  <div className="d-flex justify-content-between align-items-baseline mb-4">
                    <span className="fw-bold text-dark fs-6">Total Amount</span>
                    <span className="fw-bold fs-5 text-dark">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {savings > 0 && <div className="rounded-3 p-3 text-center text-success mb-3" style={{ backgroundColor: '#d9f8ee', fontSize: '13px' }}>You will save ₹{savings.toLocaleString('en-IN')} on this order</div>}

                  <button
                    type="button"
                    className="btn w-100 py-3 fw-bold rounded-3 text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: '#ffc107', border: 'none', color: '#111', fontSize: '15px' }}
                    onClick={() => showOrderSummary ? navigate('/payment') : setShowOrderSummary(true)}
                  >
                    {showOrderSummary ? 'Continue' : 'Place Order'} <i className="bi bi-arrow-right"></i>
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
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Cart;
