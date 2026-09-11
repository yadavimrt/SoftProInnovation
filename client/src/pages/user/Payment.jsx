import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../config/api';

const paymentMethods = [
  { id: 'recommended', label: 'Recommended for You', icon: 'bi-hand-thumbs-up' },
  { id: 'cards', label: 'Cards', icon: 'bi-credit-card' },
  { id: 'upi', label: 'UPI', icon: 'bi-upc-scan', description: 'Pay by any UPI app' },
  { id: 'credit-card', label: 'Credit / Debit / ATM Card', icon: 'bi-credit-card-2-front', description: 'Add and secure cards as per RBI guidelines', offer: 'Get upto 5% cashback • 2 offers available' },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    icon: 'bi-cash-stack',
  },
];

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState('recommended');
  const [placed, setPlaced] = useState(false);
  const [address, setAddress] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  const subtotal = getCartTotal();
  const totalMrp = cartItems.reduce((total, item) => total + (Number(item.compareprice) || Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const savings = Math.max(totalMrp - subtotal, 0);
  const fee = 19;
  const total = Math.max(subtotal + fee, 0);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      clearCart();
      setPlaced(true);
    }
    if (status === 'failed') setOrderError('PayU payment was not completed. Please try again.');
  }, [searchParams, clearCart]);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = storedUser?._id || storedUser?.id;
      if (!userId) return;
      axios.get(`${API_BASE_URL}/api/address/user/${userId}`)
        .then(({ data }) => setAddress(data?.addresses?.[0] || data?.[0] || null))
        .catch(() => setOrderError('Delivery address could not be loaded. Please go back and select an address.'));
    } catch {
      setOrderError('Please sign in again before placing this order.');
    }
  }, []);

  const placeOrder = async () => {
    if (!address) {
      setOrderError('Please select a delivery address before placing your order.');
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = storedUser?._id || storedUser?.id;
    setPlacing(true);
    setOrderError('');
    try {
      const orderPayload = {
        user_id: userId,
        items: cartItems,
        address,
        subtotal,
        fee,
        discount: savings,
        totalAmount: total,
        paymentMethod: selectedMethod === 'cod' ? 'cod' : 'payu',
      };

      const { data } = await axios.post(`${API_BASE_URL}/api/order/create`, orderPayload);
      if (selectedMethod !== 'cod') {
        const payment = await axios.post(`${API_BASE_URL}/api/order/payu/initiate`, { orderId: data.order.orderId });
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payment.data.action;
        Object.entries(payment.data.fields).forEach(([name, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden'; input.name = name; input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }
      clearCart();
      setPlaced(true);
    } catch (error) {
      console.error('Place order error:', error.response?.data || error);
      setOrderError(error.response?.data?.error || error.response?.data?.message || 'Order could not be placed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };
  const renderMethodContent = () => {
  const isCod = selectedMethod === 'cod';
  return (
    <div className="payment-method-content">

      <h5 className="fw-bold mb-2">
        {isCod ? 'Cash on Delivery' : 'Pay securely with PayU'}
      </h5>

      <p className="text-muted mb-4">
        {isCod ? 'Pay securely when your order arrives at your doorstep.' : 'Cards, UPI and net banking are available through PayU secure checkout.'}
      </p>

      <button
        type="button"
        className="btn payment-primary-btn w-100"
        onClick={placeOrder}
        disabled={placing}
      >
        {placing
          ? 'Placing order...'
          : isCod ? 'Place Order' : 'Pay Now'}
      </button>

    </div>
  );
};

  if (placed) {
    return (
      <div className="payment-page min-vh-100 d-flex flex-column">
        <Header />
        <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
          <div className="payment-success text-center bg-white shadow-sm p-5">
            <div className="success-icon"><i className="bi bi-check-lg"></i></div>
            <h2 className="fw-bold mt-4">Order placed successfully</h2>
            <p className="text-muted">Thank you for shopping with SoftPro Innovation.</p>
            <button type="button" className="btn payment-primary-btn px-5 mt-3" onClick={() => navigate('/Product')}>Continue Shopping</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-page min-vh-100 d-flex flex-column">
      <Header />
      <main className="container flex-grow-1 py-4 py-lg-5">
        <div className="payment-shell bg-white shadow-sm">
          <div className="payment-heading d-flex align-items-center justify-content-between px-4 px-lg-5 py-4">
            <button type="button" className="btn btn-link text-dark p-0 text-decoration-none fw-bold d-flex align-items-center gap-3" onClick={() => navigate('/cart')}>
              <i className="bi bi-arrow-left fs-4"></i><span className="fs-5">Complete Payment</span>
            </button>
            <span className="secure-badge"><i className="bi bi-lock-fill me-1"></i>100% Secure</span>
          </div>

          <div className="row g-0 payment-body">
            <div className="col-12 col-lg-4 payment-method-list p-3 p-lg-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  disabled={method.disabled}
                  className={`payment-method-option ${selectedMethod === method.id ? 'active' : ''} ${method.disabled ? 'disabled' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <i className={`bi ${method.icon}`}></i>
                  <span>{method.label}</span>
                  {method.description && <small>{method.description}</small>}
                  {method.offer && <strong>{method.offer}</strong>}
                </button>
              ))}
            </div>

            <div className="col-12 col-lg-4 payment-center p-3 p-lg-4">
              {address && <div className="small text-muted mb-3"><i className="bi bi-geo-alt-fill text-primary me-1"></i>Delivering to <strong>{address.name}</strong>, {address.city}</div>}
              {orderError && <div className="alert alert-danger small">{orderError}</div>}
              {renderMethodContent()}
            </div>

            <div className="col-12 col-lg-4 payment-summary p-3 p-lg-4">
              <div className="summary-card">
                <h5 className="fw-bold mb-4">Price Details</h5>
                <div className="summary-line"><span>MRP (incl. of all taxes)</span><strong>₹{totalMrp.toLocaleString('en-IN')}</strong></div>
                <div className="summary-line summary-section"><span>Fees <i className="bi bi-chevron-up ms-1"></i></span><strong>₹{fee}</strong></div>
                <div className="summary-subline"><span>Protect Promise Fee</span><span>₹{fee}</span></div>
                <div className="summary-line summary-section"><span>Discounts <i className="bi bi-chevron-up ms-1"></i></span><strong className="text-success">-₹{savings.toLocaleString('en-IN')}</strong></div>
                <div className="summary-subline"><span>MRP Discount</span><span className="text-success">-₹{savings.toLocaleString('en-IN')}</span></div>
                <div className="summary-total"><span>Total Amount</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
              </div>
              <div className="cashback-banner mt-3"><strong>5% Cashback</strong><span>Claim now with payment offers</span><div><i className="bi bi-bank"></i><i className="bi bi-wallet2"></i></div></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
