import React from 'react';

const Orders = () => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="dashboard-header-title mb-0">
          Recent <span>Orders</span>
        </h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm">Export CSV</button>
        </div>
      </div>
      
      <div className="dashboard-section p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>#ORD-9081</strong></td>
                <td>Amit Kumar</td>
                <td>Oct 24, 2026</td>
                <td>₹ 1,250</td>
                <td><span className="badge bg-light text-dark border">Paid</span></td>
                <td><span className="badge bg-success">Delivered</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>View</button>
                </td>
              </tr>
              <tr>
                <td><strong>#ORD-9082</strong></td>
                <td>Priya Singh</td>
                <td>Oct 24, 2026</td>
                <td>₹ 4,800</td>
                <td><span className="badge bg-light text-dark border">Paid</span></td>
                <td><span className="badge bg-primary">Shipped</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>View</button>
                </td>
              </tr>
              <tr>
                <td><strong>#ORD-9083</strong></td>
                <td>Rahul Sharma</td>
                <td>Oct 25, 2026</td>
                <td>₹ 320</td>
                <td><span className="badge bg-warning text-dark border">Pending</span></td>
                <td><span className="badge bg-warning text-dark">Processing</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>View</button>
                </td>
              </tr>
              <tr>
                <td><strong>#ORD-9084</strong></td>
                <td>Neha Gupta</td>
                <td>Oct 25, 2026</td>
                <td>₹ 850</td>
                <td><span className="badge bg-light text-dark border">Paid</span></td>
                <td><span className="badge bg-warning text-dark">Processing</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Orders;
