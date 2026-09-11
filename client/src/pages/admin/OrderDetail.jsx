import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';
import logo from '../../assets/logo.png';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState({ show: false, msg: '', isError: false });
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE_URL}/api/order/${id}`);
      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
        setCustomerStats(res.data.customerStats || null);
      } else {
        setError('Order could not be found.');
      }
    } catch (err) {
      console.error('Fetch order error:', err);
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  // Update order status or payment status
  const handleUpdateStatus = async (field, value) => {
    if (!order) return;
    try {
      setUpdating(true);
      const payload = { [field]: value };
      const res = await axios.patch(
        `${API_BASE_URL}/api/order/${order._id || order.orderId}/status`,
        payload
      );
      if (res.data?.success && res.data?.order) {
        setOrder(res.data.order);
        setStatusFeedback({
          show: true,
          msg: `${field === 'status' ? 'Order' : 'Payment'} status updated to ${value.toUpperCase()}`,
          isError: false
        });
      } else {
        throw new Error('Failed to update');
      }
    } catch (err) {
      setStatusFeedback({
        show: true,
        msg: err.response?.data?.message || 'Update failed',
        isError: true
      });
    } finally {
      setUpdating(false);
      setTimeout(() => {
        setStatusFeedback((prev) => ({ ...prev, show: false }));
      }, 3500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyAddress = () => {
    if (!order?.address) return;
    const addr = `${order.address.name}, ${order.address.mobile}\n${order.address.address}, ${order.address.locality || ''}\n${order.address.city}, ${order.address.state} - ${order.address.pincode}\n${order.address.landmark ? `Landmark: ${order.address.landmark}` : ''}`;
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyOrderId = (oid) => {
    navigator.clipboard.writeText(oid);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const numberToWords = (num) => {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const n = Math.round(Number(num) || 0);
    if (n === 0) return 'Zero Rupees Only';

    const inWords = (val) => {
      if (val < 20) return a[val];
      if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
      if (val < 1000) return a[Math.floor(val / 100)] + ' Hundred' + (val % 100 !== 0 ? ' and ' + inWords(val % 100) : '');
      if (val < 100000) return inWords(Math.floor(val / 1000)) + ' Thousand' + (val % 1000 !== 0 ? ' ' + inWords(val % 1000) : '');
      if (val < 10000000) return inWords(Math.floor(val / 100000)) + ' Lakh' + (val % 100000 !== 0 ? ' ' + inWords(val % 100000) : '');
      return inWords(Math.floor(val / 10000000)) + ' Crore' + (val % 10000000 !== 0 ? ' ' + inWords(val % 10000000) : '');
    };

    return `${inWords(n).trim()} Rupees Only`;
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <h5 className="mt-3 text-secondary fw-semibold">Loading full order details...</h5>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-fluid py-5">
        <div className="od-card p-5 text-center mx-auto" style={{ maxWidth: '580px' }}>
          <div className="mb-3">
            <i className="bi bi-exclamation-octagon text-danger fs-1"></i>
          </div>
          <h4 className="fw-bold text-dark mb-2">Order Not Found</h4>
          <p className="text-muted mb-4">{error || 'The requested order ID does not exist in our records.'}</p>
          <button
            type="button"
            className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
            style={{ backgroundColor: '#3945E0', border: 'none' }}
            onClick={() => navigate('/dashboard/orders')}
          >
            <i className="bi bi-arrow-left me-2"></i> Back to Orders List
          </button>
        </div>
      </div>
    );
  }

  const orderId = order.orderId || (order._id ? `#ORD-${order._id.slice(-6).toUpperCase()}` : `#ORD-${id}`);
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Recently';

  const orderStatus = (order.status || 'pending').toLowerCase();
  const paymentStatus = (order.paymentStatus || 'pending').toLowerCase();
  const paymentMethod = (order.paymentMethod || 'COD').toUpperCase();

  // Milestone Stepper helper
  const milestones = [
    { key: 'pending', label: 'Order Placed', icon: 'bi-bag-check' },
    { key: 'processing', label: 'Processing', icon: 'bi-gear' },
    { key: 'shipped', label: 'Shipped', icon: 'bi-truck' },
    { key: 'delivered', label: 'Delivered', icon: 'bi-check-circle' }
  ];

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(orderStatus);
  const isCancelled = orderStatus === 'cancelled';

  // Customer calculations
  const user = order.user_id || {};
  const customerName = order.customerName || user.name || 'Store Customer';
  const customerEmail = order.customerEmail || user.email || 'N/A';
  const customerMobile = order.customerMobile || order.address?.mobile || user.mobile || 'N/A';
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Registered User';

  const initials = customerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'CU';

  const totalOrders = customerStats?.totalOrders || 1;
  const totalSpent = customerStats?.totalSpent || Number(order.totalAmount || 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : Number(order.totalAmount || 0);
  const lastOrder = customerStats?.lastOrder || null;
  const pastOrdersList = (customerStats?.allOrders || []).filter((o) => o._id !== order._id);

  return (
    <div className="od-page-container container-fluid px-3 px-xl-4 py-3">
      {/* Top Notification Toast for Status Updates */}
      {statusFeedback.show && (
        <div
          className={`alert ${statusFeedback.isError ? 'alert-danger' : 'alert-success'} alert-dismissible fade show mb-3 shadow-sm d-flex align-items-center gap-2`}
          role="alert"
          style={{ borderRadius: '12px' }}
        >
          <i className={`bi ${statusFeedback.isError ? 'bi-exclamation-triangle-fill text-danger' : 'bi-check-circle-fill text-success'} fs-5`}></i>
          <div>
            <strong>{statusFeedback.msg}</strong>
            <span className="ms-2 text-muted small">&bull; Customer notification email dispatched automatically.</span>
          </div>
          <button
            type="button"
            className="btn-close ms-auto shadow-none"
            onClick={() => setStatusFeedback((prev) => ({ ...prev, show: false }))}
          ></button>
        </div>
      )}

      {/* Top Header & Breadcrumb Nav */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <Link to="/dashboard/orders" className="od-back-btn">
              <i className="bi bi-arrow-left"></i>
              <span>Back to Orders</span>
            </Link>
            <span className="text-muted small">&bull;</span>
            <span className="text-muted small">Logistics / Order Details</span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <h1 className="od-header-id mb-0">{orderId}</h1>
            <button
              type="button"
              className="btn btn-sm btn-light border py-1 px-2 text-secondary"
              onClick={() => handleCopyOrderId(orderId)}
              title="Copy Order ID"
              style={{ borderRadius: '8px' }}
            >
              <i className={`bi ${copiedOrderId ? 'bi-check-lg text-success' : 'bi-copy'}`}></i>
              <span className="ms-1 small">{copiedOrderId ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Quick Status Update Selector with Status Badge */}
            <div className="d-inline-flex align-items-center gap-1.5 ms-1">
              <select
                className={`form-select form-select-sm fw-semibold shadow-xs ${
                  orderStatus === 'delivered' ? 'bg-success-subtle text-success border border-success-subtle' :
                  orderStatus === 'shipped' ? 'bg-primary-subtle text-primary border border-primary-subtle' :
                  orderStatus === 'processing' ? 'bg-info-subtle text-info-emphasis border border-info-subtle' :
                  orderStatus === 'cancelled' ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                  'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                }`}
                style={{ minWidth: '136px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer' }}
                value={orderStatus}
                disabled={updating}
                onChange={(e) => handleUpdateStatus('status', e.target.value)}
                title="Change fulfillment status (automatically sends notification email to customer)"
              >
                <option value="pending">⏳ Pending</option>
                <option value="processing">⚙️ Processing</option>
                <option value="shipped">🚚 Shipped</option>
                <option value="delivered">✅ Delivered</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>

            {/* Payment Status Badge */}
            <span className={`badge rounded-pill px-3 py-2 fw-semibold text-uppercase od-badge-${paymentStatus}`} style={{ fontSize: '12px' }}>
              <i className="bi bi-credit-card-2-front me-1"></i>
              {paymentStatus === 'paid' ? 'Payment Paid' : `Payment: ${paymentStatus}`}
            </span>
          </div>
          <div className="od-header-meta mt-1">
            <i className="bi bi-clock me-1"></i> Placed on {orderDate}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-2 od-action-buttons">
          <button
            type="button"
            className="btn btn-white border px-3 py-2 fw-semibold shadow-xs d-inline-flex align-items-center gap-2"
            style={{ borderRadius: '10px', backgroundColor: '#ffffff', color: '#334155', fontSize: '13.5px' }}
            onClick={fetchOrderDetails}
            title="Refresh order details"
          >
            <i className="bi bi-arrow-clockwise text-primary"></i>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-white border px-3 py-2 fw-semibold shadow-xs d-inline-flex align-items-center gap-2"
            style={{ borderRadius: '10px', backgroundColor: '#ffffff', color: '#1d4ed8', borderColor: '#bfdbfe', fontSize: '13.5px' }}
            onClick={() => setShowInvoicePreview(true)}
            title="Preview Clean Tax Invoice"
          >
            <i className="bi bi-eye text-primary"></i>
            <span>Preview Invoice</span>
          </button>

          <button
            type="button"
            className="btn btn-primary px-3.5 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
            style={{ borderRadius: '10px', backgroundColor: '#3945E0', border: 'none', fontSize: '13.5px' }}
            onClick={handlePrint}
            title="Print Tax Invoice"
          >
            <i className="bi bi-printer"></i>
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Live Feedback Toast */}
      {statusFeedback.show && (
        <div className={`alert ${statusFeedback.isError ? 'alert-danger' : 'alert-success'} alert-dismissible fade show rounded-3 shadow-sm mb-4`} role="alert">
          <i className={`bi ${statusFeedback.isError ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} me-2`}></i>
          <strong>{statusFeedback.msg}</strong>
          <button type="button" className="btn-close" onClick={() => setStatusFeedback({ show: false, msg: '', isError: false })}></button>
        </div>
      )}

      {/* Milestone Stepper Card */}
      <div className="od-stepper-card mb-4">
        {isCancelled ? (
          <div className="text-center py-2">
            <span className="badge bg-danger text-white fs-6 px-4 py-2 rounded-pill shadow-sm mb-2">
              <i className="bi bi-x-circle-fill me-2"></i> Order Has Been Cancelled
            </span>
            <p className="text-muted small mb-0">This order is cancelled and will not undergo fulfillment.</p>
          </div>
        ) : (
          <div className="od-stepper">
            <div className="od-step-line">
              <div
                className="od-step-line-fill"
                style={{
                  width: `${currentIndex >= 0 ? (currentIndex / (statusOrder.length - 1)) * 100 : 0}%`
                }}
              ></div>
            </div>

            {milestones.map((m, idx) => {
              const isDone = currentIndex > idx;
              const isCurrent = currentIndex === idx;
              const itemClass = isDone ? 'completed' : isCurrent ? 'active' : '';

              return (
                <div key={m.key} className={`od-step-item ${itemClass}`}>
                  <div className="od-step-icon">
                    {isDone ? <i className="bi bi-check-lg"></i> : <i className={`bi ${m.icon}`}></i>}
                  </div>
                  <div className="od-step-label">{m.label}</div>
                  <div className="od-step-time">
                    {isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Upcoming'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: 8 Cols (Details & Items) + 4 Cols (User Profile & Actions) */}
      <div className="row g-4">
        {/* Left Column: Order Items, Financials, Customer Order History */}
        <div className="col-12 col-lg-8">
          {/* Order Items Table Card */}
          <div className="od-card">
            <div className="od-card-header">
              <h5 className="od-card-title">
                <i className="bi bi-box-seam text-primary"></i>
                <span>Ordered Items ({order.items?.length || 0})</span>
              </h5>
              <span className="badge bg-light text-dark border px-2.5 py-1.5 rounded-pill small">
                {order.items?.length || 0} Products
              </span>
            </div>
            <div className="table-responsive">
              <table className="table od-items-table mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>Item</th>
                    <th>Product Description</th>
                    <th className="text-center" style={{ width: '100px' }}>Quantity</th>
                    <th className="text-end" style={{ width: '130px' }}>Price</th>
                    <th className="text-end" style={{ width: '130px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, idx) => {
                    const price = Number(item.price) || 0;
                    const qty = Number(item.quantity) || 1;
                    const itemTotal = Number(item.total) || price * qty;
                    const imgUrl = formatImg(item.thumbnail);

                    return (
                      <tr key={idx}>
                        <td>
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="od-product-thumb"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/100x100?text=Product';
                            }}
                          />
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{item.name}</div>
                          {item.category && (
                            <span className="badge bg-light text-secondary border mt-1" style={{ fontSize: '11px' }}>
                              {item.category}
                            </span>
                          )}
                          {item.product_id && (
                            <div className="text-muted" style={{ fontSize: '11px', marginTop: '3px' }}>
                              ID: {item.product_id}
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border px-2 py-1 fw-bold">
                            &times; {qty}
                          </span>
                        </td>
                        <td className="text-end text-muted fw-semibold">
                          ₹{price.toLocaleString('en-IN')}
                        </td>
                        <td className="text-end text-dark fw-bold">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Breakdown */}
            <div className="od-card-body border-top bg-light-subtle">
              <div className="row justify-content-end">
                <div className="col-12 col-md-7 col-lg-6">
                  <div className="od-summary-row">
                    <span>Items Subtotal</span>
                    <span className="fw-semibold text-dark">
                      ₹{Number(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="od-summary-row">
                    <span>Shipping & Delivery</span>
                    {Number(order.fee) > 0 ? (
                      <span className="fw-semibold text-dark">₹{Number(order.fee).toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="badge bg-success-subtle text-success border border-success-subtle">FREE</span>
                    )}
                  </div>

                  {Number(order.discount) > 0 && (
                    <div className="od-summary-row">
                      <span>Discount Voucher</span>
                      <span className="text-danger fw-semibold">- ₹{Number(order.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="od-summary-row grand-total">
                    <span>Grand Total</span>
                    <span className="text-primary">
                      ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Transaction Info Card */}
          <div className="od-card">
            <div className="od-card-header">
              <h5 className="od-card-title">
                <i className="bi bi-credit-card-2-front text-primary"></i>
                <span>Payment & Transaction Ledger</span>
              </h5>
              <span className={`badge text-uppercase px-2.5 py-1 rounded-pill od-badge-${paymentStatus}`}>
                {paymentStatus}
              </span>
            </div>
            <div className="od-card-body">
              <div className="row g-3">
                <div className="col-sm-6 col-md-4">
                  <div className="od-info-label">Payment Method</div>
                  <div className="od-info-val text-uppercase mt-1 fw-bold text-dark d-flex align-items-center gap-1">
                    <i className="bi bi-wallet2 text-primary"></i>
                    <span>{paymentMethod}</span>
                  </div>
                </div>

                <div className="col-sm-6 col-md-4">
                  <div className="od-info-label">Payment Status</div>
                  <div className="od-info-val text-capitalize mt-1">
                    <span className={`badge od-badge-${paymentStatus} rounded-1 px-2 py-1`}>
                      {paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="col-sm-6 col-md-4">
                  <div className="od-info-label">Currency</div>
                  <div className="od-info-val mt-1 fw-semibold text-dark">
                    {order.currency || 'INR (₹)'}
                  </div>
                </div>

                {order.paymentTransactionId && (
                  <div className="col-12">
                    <div className="od-info-label">Transaction ID</div>
                    <code className="od-info-val d-block bg-light p-2 rounded border mt-1 small" style={{ wordBreak: 'break-all' }}>
                      {order.paymentTransactionId}
                    </code>
                  </div>
                )}

                {order.razorpayOrderId && (
                  <div className="col-sm-6">
                    <div className="od-info-label">Razorpay Order ID</div>
                    <code className="od-info-val d-block bg-light p-2 rounded border mt-1 small" style={{ wordBreak: 'break-all' }}>
                      {order.razorpayOrderId}
                    </code>
                  </div>
                )}

                {order.razorpayPaymentId && (
                  <div className="col-sm-6">
                    <div className="od-info-label">Razorpay Payment ID</div>
                    <code className="od-info-val d-block bg-light p-2 rounded border mt-1 small" style={{ wordBreak: 'break-all' }}>
                      {order.razorpayPaymentId}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Lifetime Orders & History ("Laste Order & Kith Order") */}
          <div className="od-card">
            <div className="od-card-header">
              <h5 className="od-card-title">
                <i className="bi bi-clock-history text-primary"></i>
                <span>Customer Order History & Metrics</span>
              </h5>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                {totalOrders} Total Order{totalOrders > 1 ? 's' : ''} Placed
              </span>
            </div>
            <div className="od-card-body">
              {/* Stats Mini Grid */}
              <div className="row g-3 mb-4">
                <div className="col-4">
                  <div className="od-stat-box">
                    <div className="od-stat-val text-primary">{totalOrders}</div>
                    <div className="od-stat-lbl">Orders Placed</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="od-stat-box">
                    <div className="od-stat-val text-success">₹{totalSpent.toLocaleString('en-IN')}</div>
                    <div className="od-stat-lbl">Lifetime Spend</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="od-stat-box">
                    <div className="od-stat-val text-dark">₹{avgOrderValue.toLocaleString('en-IN')}</div>
                    <div className="od-stat-lbl">Avg. Order Value</div>
                  </div>
                </div>
              </div>

              {/* Last Order Section */}
              <div className="p-3 rounded-3 bg-light border mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    <i className="bi bi-arrow-return-left text-primary me-1"></i> Previous / Last Order
                  </span>
                  {lastOrder && (
                    <span className={`badge od-badge-${lastOrder.status} rounded-pill`}>
                      {lastOrder.status}
                    </span>
                  )}
                </div>

                {lastOrder ? (
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <div>
                      <strong className="text-dark d-block">
                        {lastOrder.orderId || `#ORD-${lastOrder._id.slice(-6).toUpperCase()}`}
                      </strong>
                      <small className="text-muted">
                        Placed on {new Date(lastOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </small>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold text-dark">
                        ₹{Number(lastOrder.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <Link
                        to={`/dashboard/orders/${lastOrder._id || lastOrder.orderId}`}
                        className="btn btn-sm btn-link p-0 text-primary text-decoration-none small fw-semibold"
                      >
                        View Details <i className="bi bi-chevron-right"></i>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted small mb-0">
                    This is the customer&apos;s very first order with your store!
                  </p>
                )}
              </div>

              {/* Other Orders by This User */}
              {pastOrdersList.length > 0 && (
                <div>
                  <h6 className="fw-bold text-dark small text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                    Other Orders by this Customer ({pastOrdersList.length})
                  </h6>
                  <div>
                    {pastOrdersList.slice(0, 5).map((pOrder, pIdx) => (
                      <div key={pIdx} className="od-past-order-row">
                        <div>
                          <strong className="text-dark d-block">
                            {pOrder.orderId || `#ORD-${pOrder._id.slice(-6).toUpperCase()}`}
                          </strong>
                          <small className="text-muted">
                            {new Date(pOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {pOrder.itemsCount || 1} items
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className={`badge od-badge-${pOrder.status} rounded-pill`}>
                            {pOrder.status}
                          </span>
                          <strong className="text-dark">
                            ₹{Number(pOrder.totalAmount || 0).toLocaleString('en-IN')}
                          </strong>
                          <Link
                            to={`/dashboard/orders/${pOrder._id || pOrder.orderId}`}
                            className="btn btn-sm btn-light border py-1 px-2"
                            title="Open order"
                          >
                            <i className="bi bi-arrow-up-right text-primary"></i>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Profile, Shipping Address, Admin Controls */}
        <div className="col-12 col-lg-4">
          {/* Admin Live Controls Card */}
          <div className="od-card od-admin-controls border-primary-subtle" style={{ borderWidth: '2px' }}>
            <div className="od-card-header bg-primary text-white">
              <h5 className="od-card-title text-white">
                <i className="bi bi-sliders"></i>
                <span>Order Status Management</span>
              </h5>
              {updating && (
                <div className="spinner-border spinner-border-sm text-white" role="status"></div>
              )}
            </div>
            <div className="od-card-body">
              {/* Order Status Select */}
              <div className="mb-3">
                <label className="od-info-label mb-1.5 d-block">Fulfillment Milestone</label>
                <select
                  className={`form-select form-select-sm fw-semibold od-badge-${orderStatus}`}
                  value={orderStatus}
                  disabled={updating}
                  onChange={(e) => handleUpdateStatus('status', e.target.value)}
                  style={{ borderRadius: '10px', padding: '9px 14px', fontSize: '13.5px' }}
                >
                  <option value="pending">Pending (Awaiting Confirmation)</option>
                  <option value="processing">Processing (Packing / Prep)</option>
                  <option value="shipped">Shipped (In Transit)</option>
                  <option value="delivered">Delivered (Completed)</option>
                  <option value="cancelled">Cancelled (Order Void)</option>
                </select>
              </div>

              {/* Payment Status Select */}
              <div className="mb-3">
                <label className="od-info-label mb-1.5 d-block">Payment Status</label>
                <select
                  className={`form-select form-select-sm fw-semibold od-badge-${paymentStatus}`}
                  value={paymentStatus}
                  disabled={updating}
                  onChange={(e) => handleUpdateStatus('paymentStatus', e.target.value)}
                  style={{ borderRadius: '10px', padding: '9px 14px', fontSize: '13.5px' }}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <small className="text-muted d-block">
                <i className="bi bi-info-circle me-1"></i> Changing status triggers live database update and customer timeline notification.
              </small>
            </div>
          </div>

          {/* Customer Profile Card ("User ki Puri Detail") */}
          <div className="od-card">
            <div className="od-card-header">
              <h5 className="od-card-title">
                <i className="bi bi-person-badge text-primary"></i>
                <span>Customer Profile</span>
              </h5>
              {totalOrders > 1 ? (
                <span className="badge bg-warning text-dark fw-bold rounded-pill" style={{ fontSize: '11px' }}>
                  <i className="bi bi-star-fill me-1"></i> Frequent Buyer
                </span>
              ) : (
                <span className="badge bg-info-subtle text-info-emphasis rounded-pill" style={{ fontSize: '11px' }}>
                  New Customer
                </span>
              )}
            </div>
            <div className="od-card-body">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="od-customer-avatar">
                  {initials}
                </div>
                <div>
                  <h6 className="od-customer-name mb-0">{customerName}</h6>
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill small">
                    {user.status || 'Active Account'}
                  </span>
                </div>
              </div>

              <div className="od-info-list-item">
                <div className="od-info-icon">
                  <i className="bi bi-envelope"></i>
                </div>
                <div>
                  <div className="od-info-label">Email Address</div>
                  <a href={`mailto:${customerEmail}`} className="od-info-val text-primary text-decoration-none">
                    {customerEmail}
                  </a>
                </div>
              </div>

              <div className="od-info-list-item">
                <div className="od-info-icon">
                  <i className="bi bi-telephone"></i>
                </div>
                <div>
                  <div className="od-info-label">Phone Number</div>
                  <a href={`tel:${customerMobile}`} className="od-info-val text-dark text-decoration-none fw-semibold">
                    {customerMobile}
                  </a>
                </div>
              </div>

              <div className="od-info-list-item">
                <div className="od-info-icon">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div>
                  <div className="od-info-label">Member Since</div>
                  <div className="od-info-val">{memberSince}</div>
                </div>
              </div>

              {user._id && (
                <div className="od-info-list-item">
                  <div className="od-info-icon">
                    <i className="bi bi-fingerprint"></i>
                  </div>
                  <div>
                    <div className="od-info-label">User Account ID</div>
                    <code className="od-info-val text-muted small">{user._id}</code>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery & Shipping Address Card */}
          <div className="od-card">
            <div className="od-card-header">
              <h5 className="od-card-title">
                <i className="bi bi-geo-alt text-primary"></i>
                <span>Shipping Address</span>
              </h5>
              <button
                type="button"
                className="btn btn-sm btn-light border py-1 px-2.5 text-secondary"
                onClick={handleCopyAddress}
                title="Copy full shipping address"
                style={{ borderRadius: '8px', fontSize: '12px' }}
              >
                <i className={`bi ${copiedAddress ? 'bi-check-lg text-success' : 'bi-clipboard'}`}></i>
                <span className="ms-1">{copiedAddress ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="od-card-body">
              {order.address ? (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <strong className="text-dark fs-6">{order.address.name}</strong>
                    <span className="badge bg-light text-dark border rounded-pill">
                      {order.address.addressType || 'Home'}
                    </span>
                  </div>

                  <div className="od-info-val text-secondary lh-base mb-3">
                    <div>{order.address.address}</div>
                    {order.address.locality && <div>{order.address.locality}</div>}
                    {order.address.landmark && (
                      <div className="text-muted small">Landmark: {order.address.landmark}</div>
                    )}
                    <div className="fw-semibold text-dark mt-1">
                      {order.address.city}, {order.address.state} &ndash; {order.address.pincode}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-3 bg-light border d-flex align-items-center gap-2">
                    <i className="bi bi-telephone text-primary"></i>
                    <span className="text-muted small">Contact:</span>
                    <a href={`tel:${order.address.mobile}`} className="text-dark fw-bold text-decoration-none small">
                      {order.address.mobile}
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-muted small mb-0">No shipping address recorded for this order.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screen Preview Modal */}
      {showInvoicePreview && (
        <div className="inv-preview-modal-backdrop" onClick={() => setShowInvoicePreview(false)}>
          <div className="inv-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-preview-toolbar">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
                <span className="fw-bold text-dark">Executive Tax Invoice &bull; {orderId}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-3 fw-semibold d-inline-flex align-items-center gap-1.5"
                  style={{ backgroundColor: '#2563eb', border: 'none', borderRadius: '8px' }}
                  onClick={handlePrint}
                >
                  <i className="bi bi-printer"></i> Print / Save PDF
                </button>
                <button
                  type="button"
                  className="btn btn-light btn-sm px-2.5 border"
                  style={{ borderRadius: '8px' }}
                  onClick={() => setShowInvoicePreview(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <div className="inv-preview-scroll">
              <div className="inv-preview-paper">
                {/* Embedded Printable Invoice Body */}
                <div className="od-printable-invoice" style={{ display: 'block' }}>
                  {/* Top Header */}
                  <div className="inv-header">
                    <div className="inv-brand">
                      <div className="inv-logo-box">
                        <img src={logo} alt="SoftPro Innovation Logo" className="inv-logo-img" />
                        <div>
                          <h2 className="inv-company-title">SOFTPRO INNOVATION</h2>
                          <p className="inv-company-tagline">Electronics, IoT Kits & Embedded Solutions</p>
                        </div>
                      </div>
                      <div className="inv-company-info">
                        <p>123 Tech Hub, Innovation Park, Lucknow, UP &ndash; 226028</p>
                        <p>Email: support@softproinnovation.com &bull; Web: www.softproinnovation.com</p>
                        <p>Helpline: +91 92192 35951</p>
                      </div>
                    </div>

                    <div className="inv-meta">
                      <div className="inv-badge-title">TAX INVOICE</div>
                      <table className="inv-meta-table">
                        <tbody>
                          <tr>
                            <td className="inv-meta-lbl">Invoice / Order ID:</td>
                            <td className="inv-meta-val">{orderId}</td>
                          </tr>
                          <tr>
                            <td className="inv-meta-lbl">Order Date:</td>
                            <td className="inv-meta-val">{orderDate}</td>
                          </tr>
                          <tr>
                            <td className="inv-meta-lbl">Payment Mode:</td>
                            <td className="inv-meta-val text-uppercase">{paymentMethod}</td>
                          </tr>
                          <tr>
                            <td className="inv-meta-lbl">Payment Status:</td>
                            <td className="inv-meta-val text-uppercase" style={{ color: paymentStatus === 'paid' ? '#16a34a' : '#d97706' }}>
                              {paymentStatus}
                            </td>
                          </tr>
                          <tr>
                            <td className="inv-meta-lbl">Fulfillment:</td>
                            <td className="inv-meta-val text-uppercase" style={{ color: '#2563eb' }}>
                              {orderStatus}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="inv-divider-line"></div>

                  {/* Customer & Shipping Addresses */}
                  <div className="inv-address-grid">
                    <div className="inv-address-card">
                      <div className="inv-address-heading">
                        <i className="bi bi-person-fill me-1"></i> Billed To (Customer Details)
                      </div>
                      <div className="inv-address-name">{customerName}</div>
                      <div className="inv-address-line">
                        <div><strong>Mobile:</strong> {customerMobile}</div>
                        <div><strong>Email:</strong> {customerEmail}</div>
                      </div>
                    </div>

                    <div className="inv-address-card">
                      <div className="inv-address-heading">
                        <i className="bi bi-geo-alt-fill me-1"></i> Shipped & Delivered To
                      </div>
                      <div className="inv-address-name">{order.address?.name || customerName}</div>
                      <div className="inv-address-line">
                        <div><strong>Contact:</strong> {order.address?.mobile || customerMobile}</div>
                        <div>
                          {order.address?.address}{order.address?.locality ? `, ${order.address.locality}` : ''}
                          {order.address?.landmark ? `, Near ${order.address.landmark}` : ''}
                        </div>
                        <div>
                          <strong>{order.address?.city}</strong>, {order.address?.state} &ndash; <strong>{order.address?.pincode}</strong>
                        </div>
                        <div className="text-muted small">Destination: {order.address?.addressType || 'Home'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Products Table */}
                  <table className="inv-items-table">
                    <thead>
                      <tr>
                        <th style={{ width: '6%' }} className="text-center">#</th>
                        <th style={{ width: '50%' }}>Description of Components / Goods</th>
                        <th style={{ width: '16%' }} className="text-center">Rate (₹)</th>
                        <th style={{ width: '12%' }} className="text-center">Qty</th>
                        <th style={{ width: '16%' }} className="text-end">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((item, idx) => {
                        const unitPrice = Number(item.price || 0);
                        const qty = Number(item.quantity || 1);
                        const lineTotal = Number(item.total || unitPrice * qty);
                        return (
                          <tr key={idx}>
                            <td className="text-center fw-semibold text-muted">{idx + 1}</td>
                            <td>
                              <div className="inv-product-title">{item.name}</div>
                              {item.category && <span className="inv-product-cat">{item.category}</span>}
                            </td>
                            <td className="text-center">₹{unitPrice.toLocaleString('en-IN')}</td>
                            <td className="text-center fw-bold">{qty}</td>
                            <td className="text-end fw-bold">₹{lineTotal.toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Calculations */}
                  <div className="inv-calc-grid">
                    <div className="inv-words-panel">
                      <div className="inv-words-label">Invoice Value in Words:</div>
                      <div className="inv-words-content">{numberToWords(order.totalAmount || 0)}</div>

                      <ol className="inv-policy-list">
                        <li>Goods covered under 7-Day Replacement Guarantee against manufacturing defects.</li>
                        <li>Damage due to electrical surge, reverse voltage, or physical misuse is excluded.</li>
                        <li>All legal matters subject to Lucknow jurisdiction only.</li>
                      </ol>
                    </div>

                    <div>
                      <table className="inv-totals-table">
                        <tbody>
                          <tr>
                            <td className="inv-tot-label">Items Subtotal:</td>
                            <td className="inv-tot-val">₹{Number(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td className="inv-tot-label">Shipping & Delivery:</td>
                            <td className="inv-tot-val">
                              {Number(order.fee) > 0 ? `₹${Number(order.fee).toLocaleString('en-IN')}` : 'FREE'}
                            </td>
                          </tr>
                          {Number(order.discount) > 0 && (
                            <tr>
                              <td className="inv-tot-label text-danger">Discount Voucher:</td>
                              <td className="inv-tot-val text-danger">- ₹{Number(order.discount).toLocaleString('en-IN')}</td>
                            </tr>
                          )}
                          <tr className="inv-grand-row">
                            <td>Grand Total:</td>
                            <td className="inv-tot-val">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Signatory & Authentication */}
                  <div className="inv-sign-grid">
                    <div className="inv-gen-notice">
                      <i className="bi bi-shield-check text-success me-1"></i>
                      This is an electronically generated official Tax Invoice from Softpro Innovation. No physical stamp or signature is required.
                    </div>
                    <div className="inv-sign-block">
                      <div className="inv-seal-badge">
                        <i className="bi bi-check2-all me-1"></i> VERIFIED & AUTHENTIC
                      </div>
                      <div className="inv-sign-corp">For SoftPro Innovation</div>
                      <div className="inv-sign-text">Authorized Signatory</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Printable Invoice rendered specifically for @media print */}
      <div className="od-printable-invoice">
        {/* Top Header */}
        <div className="inv-header">
          <div className="inv-brand">
            <div className="inv-logo-box">
              <img src={logo} alt="SoftPro Innovation Logo" className="inv-logo-img" />
              <div>
                <h2 className="inv-company-title">SOFTPRO INNOVATION</h2>
                <p className="inv-company-tagline">Electronics, IoT Kits & Embedded Solutions</p>
              </div>
            </div>
            <div className="inv-company-info">
              <p>123 Tech Hub, Innovation Park, Lucknow, UP &ndash; 226028</p>
              <p>Email: support@softproinnovation.com &bull; Web: www.softproinnovation.com</p>
              <p>Helpline: +91 92192 35951</p>
            </div>
          </div>

          <div className="inv-meta">
            <div className="inv-badge-title">TAX INVOICE</div>
            <table className="inv-meta-table">
              <tbody>
                <tr>
                  <td className="inv-meta-lbl">Invoice / Order ID:</td>
                  <td className="inv-meta-val">{orderId}</td>
                </tr>
                <tr>
                  <td className="inv-meta-lbl">Order Date:</td>
                  <td className="inv-meta-val">{orderDate}</td>
                </tr>
                <tr>
                  <td className="inv-meta-lbl">Payment Mode:</td>
                  <td className="inv-meta-val text-uppercase">{paymentMethod}</td>
                </tr>
                <tr>
                  <td className="inv-meta-lbl">Payment Status:</td>
                  <td className="inv-meta-val text-uppercase" style={{ color: paymentStatus === 'paid' ? '#16a34a' : '#d97706' }}>
                    {paymentStatus}
                  </td>
                </tr>
                <tr>
                  <td className="inv-meta-lbl">Fulfillment:</td>
                  <td className="inv-meta-val text-uppercase" style={{ color: '#2563eb' }}>
                    {orderStatus}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="inv-divider-line"></div>

        {/* Customer & Shipping Addresses */}
        <div className="inv-address-grid">
          <div className="inv-address-card">
            <div className="inv-address-heading">
              <i className="bi bi-person-fill me-1"></i> Billed To (Customer Details)
            </div>
            <div className="inv-address-name">{customerName}</div>
            <div className="inv-address-line">
              <div><strong>Mobile:</strong> {customerMobile}</div>
              <div><strong>Email:</strong> {customerEmail}</div>
            </div>
          </div>

          <div className="inv-address-card">
            <div className="inv-address-heading">
              <i className="bi bi-geo-alt-fill me-1"></i> Shipped & Delivered To
            </div>
            <div className="inv-address-name">{order.address?.name || customerName}</div>
            <div className="inv-address-line">
              <div><strong>Contact:</strong> {order.address?.mobile || customerMobile}</div>
              <div>
                {order.address?.address}{order.address?.locality ? `, ${order.address.locality}` : ''}
                {order.address?.landmark ? `, Near ${order.address.landmark}` : ''}
              </div>
              <div>
                <strong>{order.address?.city}</strong>, {order.address?.state} &ndash; <strong>{order.address?.pincode}</strong>
              </div>
              <div className="text-muted small">Destination: {order.address?.addressType || 'Home'}</div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <table className="inv-items-table">
          <thead>
            <tr>
              <th style={{ width: '6%' }} className="text-center">#</th>
              <th style={{ width: '50%' }}>Description of Components / Goods</th>
              <th style={{ width: '16%' }} className="text-center">Rate (₹)</th>
              <th style={{ width: '12%' }} className="text-center">Qty</th>
              <th style={{ width: '16%' }} className="text-end">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, idx) => {
              const unitPrice = Number(item.price || 0);
              const qty = Number(item.quantity || 1);
              const lineTotal = Number(item.total || unitPrice * qty);
              return (
                <tr key={idx}>
                  <td className="text-center fw-semibold text-muted">{idx + 1}</td>
                  <td>
                    <div className="inv-product-title">{item.name}</div>
                    {item.category && <span className="inv-product-cat">{item.category}</span>}
                  </td>
                  <td className="text-center">₹{unitPrice.toLocaleString('en-IN')}</td>
                  <td className="text-center fw-bold">{qty}</td>
                  <td className="text-end fw-bold">₹{lineTotal.toLocaleString('en-IN')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Calculations */}
        <div className="inv-calc-grid">
          <div className="inv-words-panel">
            <div className="inv-words-label">Invoice Value in Words:</div>
            <div className="inv-words-content">{numberToWords(order.totalAmount || 0)}</div>

            <ol className="inv-policy-list">
              <li>Goods covered under 7-Day Replacement Guarantee against manufacturing defects.</li>
              <li>Damage due to electrical surge, reverse voltage, or physical misuse is excluded.</li>
              <li>All legal matters subject to Lucknow jurisdiction only.</li>
            </ol>
          </div>

          <div>
            <table className="inv-totals-table">
              <tbody>
                <tr>
                  <td className="inv-tot-label">Items Subtotal:</td>
                  <td className="inv-tot-val">₹{Number(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="inv-tot-label">Shipping & Delivery:</td>
                  <td className="inv-tot-val">
                    {Number(order.fee) > 0 ? `₹${Number(order.fee).toLocaleString('en-IN')}` : 'FREE'}
                  </td>
                </tr>
                {Number(order.discount) > 0 && (
                  <tr>
                    <td className="inv-tot-label text-danger">Discount Voucher:</td>
                    <td className="inv-tot-val text-danger">- ₹{Number(order.discount).toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr className="inv-grand-row">
                  <td>Grand Total:</td>
                  <td className="inv-tot-val">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatory & Authentication */}
        <div className="inv-sign-grid">
          <div className="inv-gen-notice">
            <i className="bi bi-shield-check text-success me-1"></i>
            This is an electronically generated official Tax Invoice from Softpro Innovation. No physical stamp or signature is required.
          </div>
          <div className="inv-sign-block">
            <div className="inv-seal-badge">
              <i className="bi bi-check2-all me-1"></i> VERIFIED & AUTHENTIC
            </div>
            <div className="inv-sign-corp">For SoftPro Innovation</div>
            <div className="inv-sign-text">Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
