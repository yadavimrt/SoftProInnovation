import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { formatImg } from '../../utils/imageUrl';
import { API_BASE_URL } from '../../config/api';
import { loadRazorpayScript } from '../../config/loadRazorpay';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Cart, 2 = Order Summary, 3 = Payment
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' (UPI, Cards, Netbanking) or 'cod' (Cash on Delivery)
  const [isPaying, setIsPaying] = useState(false);
  const [showItemsInPaymentStep, setShowItemsInPaymentStep] = useState(false);

  const showOrderSummary = checkoutStep >= 2;

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

  // Handle Cash on Delivery (COD) order placement
  const handleCODOrder = async () => {
    if (grandTotal <= 0 || isPaying) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    if (!deliveryAddress) {
      alert('Please select a delivery address before placing your order.');
      navigate('/addresses', { state: { openForm: true } });
      return;
    }

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

    if (!userId) {
      alert('Please sign in to place your order.');
      navigate('/login');
      return;
    }

    setIsPaying(true);
    try {
      const orderPayload = {
        user_id: userId,
        items: cartItems.map((item) => ({
          _id: item._id || item.id,
          name: item.name,
          thumbnail: item.thumbnail,
          category: item.category,
          price: Number(item.price) || 0,
          quantity: Math.max(Number(item.quantity) || 1, 1),
        })),
        address: {
          name: deliveryAddress.name,
          mobile: String(deliveryAddress.mobile),
          pincode: String(deliveryAddress.pincode),
          locality: deliveryAddress.locality || deliveryAddress.localiy || '',
          address: deliveryAddress.address || deliveryAddress.Address,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          landmark: deliveryAddress.landmark || '',
          addressType: deliveryAddress.addressType || 'Home',
        },
        subtotal,
        fee: shipping,
        discount: savings,
        totalAmount: grandTotal,
        paymentMethod: 'cod',
      };

      const res = await axios.post(`${API_BASE_URL}/api/order/create`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success && res.data?.order) {
        const orderData = res.data.order;
        clearCart();
        navigate('/order-success', {
          state: {
            orderId: orderData.orderId || `#ORD-${orderData._id?.slice(-6).toUpperCase()}`,
            totalAmount: grandTotal,
            paymentMethod: 'cod',
            items: cartItems,
            address: deliveryAddress,
          },
        });
      } else {
        throw new Error(res.data?.message || 'Failed to place COD order');
      }
    } catch (err) {
      console.error('COD Order error:', err.response?.data || err.message);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Could not place COD order. Please try again.';
      alert(errMsg);
    } finally {
      setIsPaying(false);
    }
  };

  const handlePayment = async () => {
    // Guard: don't fire on an empty total or while a payment is already in progress
    if (grandTotal <= 0 || isPaying) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    let storedUser;
    try {
      storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      storedUser = null;
    }

    setIsPaying(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Check your internet connection.');
        return;
      }

      // 1. Create order on backend with complete cart, address, and user details
      const { data } = await axios.post(
        `${API_BASE_URL}/api/payment/create-order`,
        {
          amount: grandTotal,
          totalAmount: grandTotal,
          subtotal,
          fee: shipping,
          discount: savings,
          items: cartItems,
          address: deliveryAddress,
          addressId: deliveryAddress?._id,
          user_id: storedUser?._id || storedUser?.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Open Razorpay Checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'Softpro Innovation',
        description: `Order for ${getCartCount()} item(s)`,
        order_id: data.orderId,
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI / QR',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['qr', 'intent'],
                    apps: ['google_pay', 'phonepe', 'paytm', 'bhim'],
                  },
                ],
              },
              other: {
                name: 'Other Payment Methods',
                instruments: [
                  {
                    method: 'card',
                  },
                  {
                    method: 'netbanking',
                  },
                  {
                    method: 'wallet',
                  },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            const verifyRes = await axios.post(
              `${API_BASE_URL}/api/payment/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              const completedOrderId =
                data.dbOrderId ||
                verifyRes.data.order?.orderId ||
                response.razorpay_order_id;

              clearCart();
              navigate('/order-success', {
                state: {
                  orderId: completedOrderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  totalAmount: grandTotal,
                  paymentMethod: 'razorpay',
                  items: cartItems,
                  address: deliveryAddress,
                },
              });
            } else {
              alert(
                'Payment verification failed. If money was deducted, it will be refunded automatically.'
              );
            }
          } catch (err) {
            console.error('Verification error:', err.response?.data || err.message);
            alert(
              'Could not verify payment. Please contact support with your payment ID: ' +
                response.razorpay_payment_id
            );
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
        prefill: {
          name: storedUser?.name || deliveryAddress?.name || '',
          email: storedUser?.email || '',
          contact:
            storedUser?.mobile ||
            storedUser?.phone ||
            deliveryAddress?.mobile ||
            '',
        },
        notes: {
          address: deliveryAddress
            ? `${deliveryAddress.address || deliveryAddress.Address}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode}`
            : 'No address selected',
        },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(
          'Payment failed: ' +
            (response.error?.description || 'Transaction was declined')
        );
        setIsPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Order creation error:', err.response?.data || err.message);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Could not start payment. Please try again.';
      alert(errMsg);
    } finally {
      setIsPaying(false);
    }
  };

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
                Shopping <span className="highlight-italic" style={{ color: '#2563eb' }}>Cart</span>
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
                style={{ width: '90px', height: '90px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}
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
                style={{ backgroundColor: '#1d4ed8', border: 'none' }}
              >
                <i className="bi bi-bag-plus me-1.5"></i> Start Shopping
              </Link>
            </div>
          ) : (
            /* Filled Cart View */
            <>
            {/* Checkout Stepper */}
            <div className="cart-progress bg-white border shadow-sm mb-3 px-4 py-2.5 rounded-3">
              <div className="d-flex align-items-center justify-content-center gap-2 gap-md-4">
                {/* Step 1: Address */}
                <div
                  className={`text-center d-flex align-items-center gap-1.5 ${
                    checkoutStep > 1 ? 'text-success' : 'text-primary fw-bold'
                  }`}
                  style={{ cursor: checkoutStep > 1 ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (checkoutStep > 1) {
                      setCheckoutStep(1);
                      window.scrollTo({ top: 100, behavior: 'smooth' });
                    }
                  }}
                  title="Cart & Address"
                >
                  <span
                    className={`d-flex align-items-center justify-content-center rounded-circle ${
                      checkoutStep > 1
                        ? 'border border-success bg-success-subtle text-success'
                        : 'bg-primary text-white'
                    }`}
                    style={{ width: 26, height: 26, fontSize: checkoutStep > 1 ? '13px' : '12px' }}
                  >
                    {checkoutStep > 1 ? <i className="bi bi-check-lg"></i> : '1'}
                  </span>
                  <small className="fw-semibold">Address</small>
                </div>

                <div className={`flex-grow-1 border-top ${checkoutStep >= 2 ? 'border-primary' : ''}`} style={{ maxWidth: 100 }}></div>

                {/* Step 2: Order Summary */}
                <div
                  className={`text-center d-flex align-items-center gap-1.5 ${
                    checkoutStep > 2 ? 'text-success' : checkoutStep === 2 ? 'text-primary fw-bold' : 'text-muted'
                  }`}
                  style={{ cursor: checkoutStep > 2 ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (checkoutStep > 2) {
                      setCheckoutStep(2);
                      window.scrollTo({ top: 100, behavior: 'smooth' });
                    }
                  }}
                  title="Order Summary"
                >
                  <span
                    className={`d-flex align-items-center justify-content-center rounded-circle ${
                      checkoutStep > 2
                        ? 'border border-success bg-success-subtle text-success'
                        : checkoutStep === 2
                        ? 'bg-primary text-white'
                        : 'border bg-light text-secondary'
                    }`}
                    style={{ width: 26, height: 26, fontSize: checkoutStep > 2 ? '13px' : '12px' }}
                  >
                    {checkoutStep > 2 ? <i className="bi bi-check-lg"></i> : '2'}
                  </span>
                  <small className="fw-semibold">Order Summary</small>
                </div>

                <div className={`flex-grow-1 border-top ${checkoutStep === 3 ? 'border-primary' : ''}`} style={{ maxWidth: 100 }}></div>

                {/* Step 3: Payment */}
                <div
                  className={`text-center d-flex align-items-center gap-1.5 ${
                    checkoutStep === 3 ? 'text-primary fw-bold' : 'text-muted'
                  }`}
                >
                  <span
                    className={`d-flex align-items-center justify-content-center rounded-circle ${
                      checkoutStep === 3 ? 'bg-primary text-white' : 'border bg-light text-secondary'
                    }`}
                    style={{ width: 26, height: 26, fontSize: '12px' }}
                  >
                    3
                  </span>
                  <small className="fw-semibold">Payment</small>
                </div>
              </div>
            </div>

            <div className={`row g-4 ${showOrderSummary ? 'order-summary-mode' : ''}`}>
              {/* Left Column: Cart Items & Payment */}
              <div className="col-12 col-lg-8">
                {deliveryAddress ? (
                  <div className="cart-address-card bg-white border shadow-sm p-3 px-4 mb-3 d-flex flex-wrap align-items-start justify-content-between gap-3 rounded-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-semibold text-muted small">Deliver to:</span>
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
                  <div className="cart-address-card bg-white border shadow-sm p-3 px-4 mb-3 d-flex align-items-center justify-content-between gap-3 rounded-3">
                    <div>
                      <strong className="d-block text-dark">Add a delivery address</strong>
                      <small className="text-muted">Choose where you want your order delivered.</small>
                    </div>
                    <button type="button" className="btn btn-primary btn-sm px-4" onClick={() => navigate('/addresses', { state: { openForm: true } })}>
                      Add Address
                    </button>
                  </div>
                )}

                {/* Steps 1 & 2: Show Full Cart / Order Summary Items List */}
                {checkoutStep <= 2 && (
                  <div className="cart-items-card card border-0 shadow-sm overflow-hidden bg-white mb-3">
                    <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        {checkoutStep === 2 && (
                          <span className="badge rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 22, height: 22, fontSize: '11px' }}>2</span>
                        )}
                        <h5 className="fw-bold mb-0 text-dark">
                          {checkoutStep === 2 ? `Order Summary (${getCartCount()} items)` : `Your Cart (${getCartCount()})`}
                        </h5>
                      </div>
                      {checkoutStep === 1 ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-2"
                          onClick={clearCart}
                          style={{ fontSize: '12px' }}
                        >
                          <i className="bi bi-trash"></i> Clear Cart
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 rounded-2"
                          onClick={() => {
                            setCheckoutStep(1);
                            window.scrollTo({ top: 100, behavior: 'smooth' });
                          }}
                          style={{ fontSize: '12px' }}
                        >
                          <i className="bi bi-pencil me-1"></i> Edit Cart
                        </button>
                      )}
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
                                    {checkoutStep === 1 ? (
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
                                    ) : (
                                      <span className="badge bg-light text-dark border px-3 py-1.5 fw-semibold" style={{ fontSize: '13px' }}>
                                        Qty: {itemQty}
                                      </span>
                                    )}
                                  </td>

                                  {/* Line Item Total */}
                                  <td className="py-3 text-end fw-bold" style={{ color: '#1d4ed8' }}>
                                    ₹{lineTotal.toLocaleString('en-IN')}
                                  </td>

                                  {/* Remove Button */}
                                  <td className="py-3 text-center">
                                    {checkoutStep === 1 ? (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-light text-danger rounded-circle p-0 d-inline-flex align-items-center justify-content-center shadow-xs"
                                        style={{ width: '32px', height: '32px' }}
                                        onClick={() => removeFromCart(pId)}
                                        title="Remove from cart"
                                      >
                                        <i className="bi bi-trash"></i>
                                      </button>
                                    ) : (
                                      <span className="text-success"><i className="bi bi-check-circle-fill"></i></span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {checkoutStep === 1 && (
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
                    )}
                  </div>
                )}

                {/* Step 3: Payment Section (Only visible when checkoutStep === 3) */}
                {checkoutStep === 3 && (
                  <>
                    {/* Compact Order Items Accordion */}
                    <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-3">
                      <div
                        className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowItemsInPaymentStep(!showItemsInPaymentStep)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 26, height: 26, fontSize: '12px' }}>
                            <i className="bi bi-bag-check-fill"></i>
                          </span>
                          <span className="fw-bold text-dark">Order Items ({getCartCount()})</span>
                          <span className="text-muted small">• Total ₹{grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-primary small fw-semibold">
                          <span>{showItemsInPaymentStep ? 'Hide Items' : 'Review Items'}</span>
                          <i className={`bi bi-chevron-${showItemsInPaymentStep ? 'up' : 'down'}`}></i>
                        </div>
                      </div>

                      {showItemsInPaymentStep && (
                        <div className="card-body p-0 border-top">
                          <div className="table-responsive">
                            <table className="table align-middle mb-0">
                              <thead className="bg-light text-muted small">
                                <tr>
                                  <th className="py-2.5 px-4">Item</th>
                                  <th className="py-2.5 text-center">Qty</th>
                                  <th className="py-2.5 text-end px-4">Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cartItems.map((item) => (
                                  <tr key={item._id || item.id} className="border-bottom">
                                    <td className="py-2.5 px-4">
                                      <div className="d-flex align-items-center gap-2.5">
                                        <img
                                          src={formatImg(item.thumbnail)}
                                          alt={item.name}
                                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                                          className="rounded border p-1 bg-white flex-shrink-0"
                                        />
                                        <div>
                                          <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '280px', fontSize: '13px' }}>
                                            {item.name}
                                          </div>
                                          <small className="text-muted">₹{(Number(item.price) || 0).toLocaleString('en-IN')} each</small>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-2.5 text-center fw-semibold text-dark small">{item.quantity || 1}</td>
                                    <td className="py-2.5 text-end px-4 fw-bold text-dark small">
                                      ₹{((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString('en-IN')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step 3: Payment Options Selection Card */}
                    <div className="cart-payment-options-card card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-3">
                      <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: '12px' }}>3</span>
                          <h5 className="fw-bold mb-0 text-dark">Select Payment Method</h5>
                        </div>
                        <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle fw-semibold px-2.5 py-1">
                          <i className="bi bi-shield-check me-1"></i> 100% Safe & Secure
                        </span>
                      </div>

                      <div className="card-body p-3 p-md-4">
                        {/* Option 1: Razorpay UPI & Online Payment */}
                        <div
                          className={`p-3 rounded-3 border mb-3 cursor-pointer transition-all ${
                            paymentMethod === 'razorpay'
                              ? 'border-primary bg-primary bg-opacity-10 shadow-xs'
                              : 'bg-white'
                          }`}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderWidth: paymentMethod === 'razorpay' ? '2px' : '1px',
                            borderColor: paymentMethod === 'razorpay' ? '#2563eb' : '#e2e8f0'
                          }}
                          onClick={() => setPaymentMethod('razorpay')}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <input
                              type="radio"
                              name="checkoutPaymentOption"
                              id="opt-razorpay"
                              className="form-check-input mt-1 cursor-pointer"
                              checked={paymentMethod === 'razorpay'}
                              onChange={() => setPaymentMethod('razorpay')}
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                <label htmlFor="opt-razorpay" className="fw-bold text-dark mb-0 cursor-pointer d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                                  <span>UPI &amp; Online Payment</span>
                                  <span className="badge bg-primary text-white" style={{ fontSize: '10px' }}>Fastest Checkout</span>
                                </label>
                                <div className="d-flex align-items-center gap-1.5 text-muted small">
                                  <i className="bi bi-lightning-charge-fill text-warning"></i>
                                  <span className="fw-semibold text-primary">Instant Confirmation</span>
                                </div>
                              </div>

                              <p className="text-muted small mb-2.5" style={{ fontSize: '13px' }}>
                                Pay securely using any UPI App (Google Pay, PhonePe, Paytm, BHIM), QR Code, Debit / Credit Cards (Visa, MasterCard, RuPay), or NetBanking via Razorpay.
                              </p>

                              <div className="d-flex flex-wrap align-items-center gap-2">
                                <span className="badge bg-white border text-dark fw-normal py-1 px-2.5 shadow-xs" style={{ fontSize: '11.5px' }}>
                                  <i className="bi bi-qr-code-scan text-primary me-1.5"></i>Google Pay / PhonePe / Paytm
                                </span>
                                <span className="badge bg-white border text-dark fw-normal py-1 px-2.5 shadow-xs" style={{ fontSize: '11.5px' }}>
                                  <i className="bi bi-credit-card-2-front text-success me-1.5"></i>Debit &amp; Credit Cards
                                </span>
                                <span className="badge bg-white border text-dark fw-normal py-1 px-2.5 shadow-xs" style={{ fontSize: '11.5px' }}>
                                  <i className="bi bi-bank text-info me-1.5"></i>All Major Indian Banks
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Option 2: Cash on Delivery (COD) */}
                        <div
                          className={`p-3 rounded-3 border cursor-pointer transition-all ${
                            paymentMethod === 'cod'
                              ? 'border-warning bg-warning bg-opacity-10 shadow-xs'
                              : 'bg-white'
                          }`}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            borderWidth: paymentMethod === 'cod' ? '2px' : '1px',
                            borderColor: paymentMethod === 'cod' ? '#f59e0b' : '#e2e8f0'
                          }}
                          onClick={() => setPaymentMethod('cod')}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <input
                              type="radio"
                              name="checkoutPaymentOption"
                              id="opt-cod"
                              className="form-check-input mt-1 cursor-pointer"
                              checked={paymentMethod === 'cod'}
                              onChange={() => setPaymentMethod('cod')}
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
                                <label htmlFor="opt-cod" className="fw-bold text-dark mb-0 cursor-pointer d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                                  <span>Cash on Delivery (COD)</span>
                                  <span className="badge bg-warning text-dark" style={{ fontSize: '10px' }}>Pay at Doorstep</span>
                                </label>
                                <span className="badge bg-light text-secondary border" style={{ fontSize: '11px' }}>Cash / UPI on Delivery</span>
                              </div>

                              <p className="text-muted small mb-0" style={{ fontSize: '13px' }}>
                                Pay with cash or scan courier delivery partner's QR code when your electronics &amp; robotics components arrive at your address.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
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
                    className="btn w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all"
                    style={{
                      backgroundColor: checkoutStep === 3 && paymentMethod === 'cod' ? '#f59e0b' : '#2563eb',
                      border: 'none',
                      color: checkoutStep === 3 && paymentMethod === 'cod' ? '#111827' : '#ffffff',
                      fontSize: '15px'
                    }}
                    disabled={isPaying || (checkoutStep > 1 && !deliveryAddress)}
                    onClick={() => {
                      if (checkoutStep === 1) {
                        if (!deliveryAddress) {
                          alert('Please select or add a delivery address to continue.');
                          navigate('/addresses', { state: { openForm: true } });
                          return;
                        }
                        setCheckoutStep(2);
                        window.scrollTo({ top: 100, behavior: 'smooth' });
                        return;
                      }

                      if (checkoutStep === 2) {
                        if (!deliveryAddress) {
                          alert('Please select or add a delivery address to continue.');
                          navigate('/addresses', { state: { openForm: true } });
                          return;
                        }
                        setCheckoutStep(3);
                        window.scrollTo({ top: 100, behavior: 'smooth' });
                        return;
                      }

                      if (checkoutStep === 3) {
                        if (!deliveryAddress) {
                          alert('Please add a delivery address before paying.');
                          navigate('/addresses', { state: { openForm: true } });
                          return;
                        }
                        if (paymentMethod === 'cod') {
                          handleCODOrder();
                        } else {
                          handlePayment();
                        }
                      }
                    }}
                  >
                    {isPaying ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>{paymentMethod === 'cod' ? 'Placing Order…' : 'Opening Payment Gateway…'}</span>
                      </>
                    ) : checkoutStep === 1 ? (
                      <>
                        <span>Proceed to Order Summary</span>
                        <i className="bi bi-arrow-right"></i>
                      </>
                    ) : checkoutStep === 2 ? (
                      <>
                        <span>Proceed to Payment</span>
                        <i className="bi bi-arrow-right"></i>
                      </>
                    ) : paymentMethod === 'cod' ? (
                      <>
                        <i className="bi bi-box-seam-fill"></i>
                        <span>Place Cash on Delivery Order (₹{grandTotal.toLocaleString('en-IN')})</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-lock-fill"></i>
                        <span>Pay ₹{grandTotal.toLocaleString('en-IN')} via UPI / Online</span>
                      </>
                    )}
                  </button>

                  {checkoutStep === 2 && (
                    <button
                      type="button"
                      className="btn btn-link text-secondary text-decoration-none w-100 mt-2 d-flex align-items-center justify-content-center gap-1.5 small"
                      onClick={() => {
                        setCheckoutStep(1);
                        window.scrollTo({ top: 100, behavior: 'smooth' });
                      }}
                      disabled={isPaying}
                    >
                      <i className="bi bi-arrow-left"></i> Edit Cart Items
                    </button>
                  )}

                  {checkoutStep === 3 && (
                    <button
                      type="button"
                      className="btn btn-link text-secondary text-decoration-none w-100 mt-2 d-flex align-items-center justify-content-center gap-1.5 small"
                      onClick={() => {
                        setCheckoutStep(2);
                        window.scrollTo({ top: 100, behavior: 'smooth' });
                      }}
                      disabled={isPaying}
                    >
                      <i className="bi bi-arrow-left"></i> Back to Order Summary
                    </button>
                  )}

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