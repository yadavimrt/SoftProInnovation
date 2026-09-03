import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Try fetching live orders if route exists, else fallback to empty array
        const res = await axios.get('http://localhost:5000/api/order/show').catch(() => ({ data: [] }));
        if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
                <th style={{ width: '22%' }}>Customer</th>
                <th style={{ width: '16%' }}>Date</th>
                <th style={{ width: '14%' }}>Total (₹)</th>
                <th style={{ width: '12%' }}>Status</th>
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
                        <strong className="text-dark">{orderId}</strong>
                      </td>
                      <td>
                        <span className="text-dark fw-medium">{customerName}</span>
                      </td>
                      <td>
                        <span className="text-muted small">{orderDate}</span>
                      </td>
                      <td>
                        <strong className="text-dark">₹ {totalAmt}</strong>
                      </td>
                      <td>
                        <span className={`badge px-2.5 py-1.5 rounded-pill ${
                          status.toLowerCase() === 'delivered' ? 'bg-success-subtle text-success border border-success-subtle' :
                          status.toLowerCase() === 'shipped' ? 'bg-primary-subtle text-primary border border-primary-subtle' :
                          'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary px-3 rounded-2"
                          style={{ backgroundColor: '#3945E0', border: 'none', fontSize: '12.5px' }}
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
    </>
  );
};

export default Orders;
