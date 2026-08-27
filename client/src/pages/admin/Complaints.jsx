import React from 'react';

const Complaints = () => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="dashboard-header-title mb-0">
          Customer <span>Complaints</span>
        </h1>
        <button className="btn btn-outline-secondary">
          <i className="bi bi-funnel me-1"></i> Filter Unresolved
        </button>
      </div>
      
      <div className="dashboard-section p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>#TKT-890</strong></td>
                <td>Rahul Sharma</td>
                <td>Order #ORD-9083 delayed</td>
                <td>Oct 25, 2026</td>
                <td><span className="badge bg-danger">High</span></td>
                <td><span className="badge bg-warning text-dark">Open</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>Respond</button>
                </td>
              </tr>
              <tr>
                <td><strong>#TKT-891</strong></td>
                <td>Priya Singh</td>
                <td>Received wrong sensor module</td>
                <td>Oct 25, 2026</td>
                <td><span className="badge bg-warning text-dark">Medium</span></td>
                <td><span className="badge bg-warning text-dark">Open</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>Respond</button>
                </td>
              </tr>
              <tr>
                <td><strong>#TKT-885</strong></td>
                <td>Vikram Singh</td>
                <td>Invoice request for bulk order</td>
                <td>Oct 22, 2026</td>
                <td><span className="badge bg-info text-dark">Low</span></td>
                <td><span className="badge bg-success">Resolved</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Complaints;
