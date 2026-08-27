import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/category/show');
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
      showAlert('danger', 'Failed to fetch categories from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name || 'this category'}"?`)) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/category/delete/${id}`);
        showAlert('success', res.data.message || 'Category deleted successfully!');
        fetchCategories();
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to delete category.';
        showAlert('danger', errMsg);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter(cat => {
    const catName = (cat.category || cat.name || '').toLowerCase();
    const catDesc = (cat.description || '').toLowerCase();
    const matchesSearch = catName.includes(searchTerm.toLowerCase()) || catDesc.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ? true : (cat.status || 'active').toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCount = categories.length;
  const activeCount = categories.filter(c => (c.status || 'active').toLowerCase() === 'active').length;
  const inactiveCount = totalCount - activeCount;

  return (
    <>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="dashboard-header-title mb-1">
            Product <span>Categories</span>
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '14.5px' }}>
            Manage, organize and add categories for your product store
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-2"
            style={{ borderRadius: '10px' }}
            onClick={fetchCategories}
            title="Refresh list"
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <Link
            to="/dashboard/categories/add"
            className="btn btn-primary d-inline-flex align-items-center gap-2 px-3.5 py-2 shadow-sm"
            style={{
              backgroundColor: '#3945E0',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(57, 69, 224, 0.25)'
            }}
          >
            <i className="bi bi-plus-lg"></i> Add Category
          </Link>
        </div>
      </div>

      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mb-4`} role="alert" style={{ borderRadius: '12px' }}>
          <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false, type: '', message: '' })}></button>
        </div>
      )}

      {/* Mini Stats Row */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #f0f4ff, #ffffff)', borderLeft: '4px solid #3945E0' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Categories</small>
                <h3 className="fw-bold mb-0 text-dark mt-1">{totalCount}</h3>
              </div>
              <div className="rounded-circle p-2.5 bg-primary bg-opacity-10 text-primary fs-4">
                <i className="bi bi-tags-fill"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #ecfdf5, #ffffff)', borderLeft: '4px solid #10b981' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Active in Store</small>
                <h3 className="fw-bold mb-0 text-success mt-1">{activeCount}</h3>
              </div>
              <div className="rounded-circle p-2.5 bg-success bg-opacity-10 text-success fs-4">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #f8fafc, #ffffff)', borderLeft: '4px solid #64748b' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Inactive / Draft</small>
                <h3 className="fw-bold mb-0 text-secondary mt-1">{inactiveCount}</h3>
              </div>
              <div className="rounded-circle p-2.5 bg-secondary bg-opacity-10 text-secondary fs-4">
                <i className="bi bi-dash-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table Section */}
      <div className="dashboard-section p-4" style={{ borderRadius: '18px' }}>
        {/* Table Filters Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-light border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 bg-light"
              placeholder="Search category or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '14px' }}
            />
            {searchTerm && (
              <button
                className="btn btn-light border-start-0 text-muted"
                type="button"
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="text-muted mb-0" style={{ fontSize: '13px' }}>Status:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: '130px', borderRadius: '8px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '5%' }} className="text-center">#</th>
                <th style={{ width: '8%' }}>Image</th>
                <th style={{ width: '22%' }}>Category Name</th>
                <th style={{ width: '35%' }}>Description</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '10%' }}>Created</th>
                <th style={{ width: '8%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-folder-x fs-1 d-block mb-2 text-secondary"></i>
                    {searchTerm || filterStatus !== 'all' 
                      ? 'No categories match your search/filter.' 
                      : 'No categories found in database.'}
                    <div className="mt-3">
                      <Link
                        to="/dashboard/categories/add"
                        className="btn btn-sm btn-primary px-3 py-1.5"
                        style={{ backgroundColor: '#3945E0', border: 'none', borderRadius: '8px' }}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Add New Category
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, index) => {
                  const catName = cat.category || cat.name || 'Unnamed Category';
                  const isActive = (cat.status || 'active').toLowerCase() === 'active';
                  const imgUrl = cat.image ? `http://localhost:5000/${cat.image.replace(/\\/g, '/')}` : null;
                  return (
                    <tr key={cat._id || index}>
                      <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                        {index + 1}
                      </td>
                      <td>
                        <div className="position-relative" style={{ width: '45px', height: '45px' }}>
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={catName}
                              className="rounded-3 border shadow-xs"
                              style={{
                                width: '45px',
                                height: '45px',
                                objectFit: 'cover',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                const fallback = e.target.nextElementSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center text-primary bg-primary bg-opacity-10 border border-primary border-opacity-10 flex-shrink-0"
                            style={{
                              width: '45px',
                              height: '45px',
                              fontSize: '18px',
                              display: imgUrl ? 'none' : 'flex'
                            }}
                          >
                            <i className="bi bi-image text-primary opacity-75"></i>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong className="text-dark d-block" style={{ fontSize: '14.5px' }}>{catName}</strong>
                          <small className="text-muted" style={{ fontSize: '11.5px' }}>ID: {cat._id ? cat._id.slice(-6) : 'N/A'}</small>
                        </div>
                      </td>
                      <td>
                        <p
                          className="text-secondary mb-0"
                          style={{
                            maxWidth: '360px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '13.5px'
                          }}
                          title={cat.description}
                        >
                          {cat.description || '—'}
                        </p>
                      </td>
                      <td>
                        <span
                          className={`badge px-2.5 py-1.5 rounded-pill ${
                            isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary border'
                          }`}
                          style={{ fontSize: '12px' }}
                        >
                          <i className={`bi ${isActive ? 'bi-check-circle-fill' : 'bi-dash-circle-fill'} me-1`}></i>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '12.5px' }}>
                        {formatDate(cat.timestamps)}
                      </td>
                      <td className="text-end">
                        <div className="btn-group">
                          <Link
                            to={`/dashboard/categories/edit/${cat._id}`}
                            className="btn btn-sm btn-outline-secondary"
                            title="Edit Category"
                            style={{ borderRadius: '6px 0 0 6px' }}
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Category"
                            style={{ borderRadius: '0 6px 6px 0' }}
                            onClick={() => handleDelete(cat._id, catName)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
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

export default Categories;

