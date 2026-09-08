import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
      try {
        setLoading(true);
        // Try fetching live orders if route exists, else fallback to empty array
        const res = await axios.get(`${API_BASE_URL}/api/order/show`).catch(() => ({ data: [] }));
        if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (order, status) => {
    setUpdatingId(order._id);
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/order/${order._id || order.orderId}/status`, { status });
      if (res.data?.success) {
        setOrders((current) => current.map((item) => item._id === order._id ? { ...item, status } : item));
        setSelectedOrder((current) => current?._id === order._id ? { ...current, status } : current);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase().trim();
    const orderId = (order._id || order.orderId || '').toLowerCase();
    const customer = (order.customerName || order.user?.name || '').toLowerCase();

    const matchesSearch = !term || orderId.includes(term) || customer.includes(term);
    const matchesStatus = statusFilter === 'all' || (order.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="dashboard-header-title mb-1">
            Customer <span>Orders</span>
          </h1>
          <p className="dashboard-subtitle mb-0">
            Track, view invoice details, and manage customer fulfillment
          </p>
        </div>
      </div>

      <div className="dashboard-section p-4" style={{ borderRadius: '18px' }}>
        {/* Search & Status Filters */}
        <div className="row g-3 align-items-center mb-4 pb-2 border-bottom">
          <div className="col-12 col-md-8">
            <div className="position-relative">
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search orders by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: '10px' }}
              />
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ borderRadius: '10px' }}
            >
              <option value="all">All Statuses ({orders.length})</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '6%' }} className="text-center">S.No</th>
                <th style={{ width: '18%' }}>Order ID</th>
                <th style={{ width: '20%' }}>Customer</th>
                <th style={{ width: '16%' }}>Date</th>
                <th style={{ width: '14%' }}>Total (₹)</th>
                <th style={{ width: '14%' }}>Status</th>
                <th style={{ width: '12%' }} className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="py-4">
                      <i className="bi bi-cart-x fs-1 d-block mb-3 text-secondary opacity-50"></i>
                      <h5 className="text-dark fw-bold mb-1">No Orders Placed Yet</h5>
                      <p className="text-muted small mb-0">
                        {searchTerm || statusFilter !== 'all'
                          ? 'No orders match your active filter search.'
                          : 'When customers place orders from the store, they will appear here in real-time.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const orderId = order.orderId || (order._id ? `#ORD-${order._id.slice(-6).toUpperCase()}` : `#ORD-${index + 1}`);
                  const customerName = order.customerName || order.user?.name || 'Customer';
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today';
                  const totalAmt = Number(order.totalAmount || order.total || 0).toLocaleString('en-IN');
                  const status = order.status || 'Pending';

                  return (
                    <tr key={order._id || index}>
                      <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                        {index + 1}
                      </td>
                      <td>
                        <strong className="text-dark d-block" style={{ maxWidth: '180px', overflowWrap: 'anywhere' }}>{orderId}</strong>
                        <small className="text-muted">{order.items?.length || 0} item(s)</small>
                      </td>
                      <td>
                        <span className="text-dark fw-medium d-block">{customerName}</span>
                        <small className="text-muted">{order.customerMobile || order.user_id?.mobile || ''}</small>
                      </td>
                      <td>
                        <span className="text-muted small">{orderDate}</span>
                      </td>
                      <td>
                        <strong className="text-dark">₹ {totalAmt}</strong>
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm ${
                          status.toLowerCase() === 'delivered' ? 'bg-success-subtle text-success border border-success-subtle' :
                          status.toLowerCase() === 'shipped' ? 'bg-primary-subtle text-primary border border-primary-subtle' :
                          'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                          }`}
                          value={status.toLowerCase()}
                          disabled={updatingId === order._id}
                          onChange={(event) => updateOrderStatus(order, event.target.value)}
                          style={{ minWidth: '112px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-3 rounded-2"
                          style={{ backgroundColor: '#3945E0', border: 'none', fontSize: '12.5px' }}
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header bg-primary text-white border-0 px-4">
                <div>
                  <h5 className="modal-title fw-bold mb-1">Order {selectedOrder.orderId || selectedOrder._id}</h5>
                  <small className="text-white-50">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'Order details'}</small>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6"><div className="bg-light rounded-3 p-3"><small className="text-muted d-block">Customer</small><strong>{selectedOrder.customerName}</strong><div className="small text-muted">{selectedOrder.customerEmail || ''} {selectedOrder.customerMobile || ''}</div></div></div>
                  <div className="col-md-6"><div className="bg-light rounded-3 p-3"><small className="text-muted d-block">Payment</small><strong className="text-uppercase">{selectedOrder.paymentMethod || 'COD'}</strong><div className="small text-muted">{selectedOrder.paymentStatus || 'pending'}</div></div></div>
                </div>
                <h6 className="fw-bold border-bottom pb-2">Delivery Address</h6>
                <p className="small text-muted mb-4">{selectedOrder.address?.name}, {selectedOrder.address?.mobile}<br />{selectedOrder.address?.address}, {selectedOrder.address?.locality}, {selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</p>
                <h6 className="fw-bold border-bottom pb-2">Items</h6>
                <div className="table-responsive"><table className="table align-middle small"><thead><tr><th style={{ width: '48px' }}>S.No</th><th style={{ width: '72px' }}>Image</th><th>Product</th><th className="text-end">Total</th></tr></thead><tbody>{(selectedOrder.items || []).map((item, itemIndex) => <tr key={`${item.name}-${itemIndex}`}><td className="text-muted fw-semibold">{itemIndex + 1}</td><td><div className="border rounded-2 bg-white d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}><img src={formatImg(item.thumbnail)} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></div></td><td><strong>{item.name}</strong><div className="text-muted">Qty: {item.quantity}</div></td><td className="text-end fw-semibold">₹{Number(item.total || item.price * item.quantity).toLocaleString('en-IN')}</td></tr>)}</tbody></table></div>
                <div className="d-flex justify-content-end border-top pt-3"><strong>Total: ₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</strong></div>
              </div>
              <div className="modal-footer border-0 bg-light"><button type="button" className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedOrder(null)}>Close</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
