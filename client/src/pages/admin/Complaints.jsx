import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/complaint/show`).catch(() => ({ data: [] }));
        if (Array.isArray(res.data)) {
          setComplaints(res.data);
        } else {
          setComplaints([]);
        }
      } catch {
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filtered = complaints;

  return (
    <>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="dashboard-header-title mb-1">
            Customer <span>Complaints & Inquiries</span>
          </h1>
          <p className="dashboard-subtitle mb-0">
            View customer support requests, feedback, and issue tickets
          </p>
        </div>
      </div>
      
      <div className="dashboard-section p-4" style={{ borderRadius: '18px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '6%' }} className="text-center">S.No</th>
                <th style={{ width: '16%' }}>Ticket ID</th>
                <th style={{ width: '22%' }}>Customer</th>
                <th style={{ width: '28%' }}>Subject</th>
                <th style={{ width: '14%' }}>Status</th>
                <th style={{ width: '14%' }} className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading complaints...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="py-4">
                      <i className="bi bi-chat-left-check fs-1 d-block mb-3 text-secondary opacity-50"></i>
                      <h5 className="text-dark fw-bold mb-1">No Active Complaints or Tickets</h5>
                      <p className="text-muted small mb-0">
                        All customer inquiries and support tickets will appear here when submitted.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr key={item._id || index}>
                    <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                      {index + 1}
                    </td>
                    <td><strong>#TKT-{item._id ? item._id.slice(-6).toUpperCase() : index + 1}</strong></td>
                    <td>{item.name || item.user?.name || 'Customer'}</td>
                    <td>{item.subject || 'Inquiry'}</td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {item.status || 'Open'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Complaints;
