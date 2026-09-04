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
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '', productCount: 0 });
  const [deletingId, setDeletingId] = useState(null);

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

  const openDeleteModal = (cat) => {
    setDeleteModal({
      show: true,
      id: cat._id,
      name: cat.category || cat.name || 'Category',
      productCount: cat.productCount || 0
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const targetId = deleteModal.id;
    const targetName = deleteModal.name;
    setDeletingId(targetId);

    try {
      // Optimistically update list for instant feedback
      setCategories(prev => prev.filter(c => c._id !== targetId));

      const res = await axios.delete(`http://localhost:5000/api/category/delete/${targetId}`);
      showAlert('success', res.data?.message || `Category "${targetName}" deleted successfully!`);
      setDeleteModal({ show: false, id: null, name: '', productCount: 0 });
      fetchCategories();
    } catch (err) {
      console.error('Delete error, trying POST fallback:', err);
      try {
        const fallbackRes = await axios.post(`http://localhost:5000/api/category/delete/${targetId}`);
        showAlert('success', fallbackRes.data?.message || `Category "${targetName}" deleted successfully!`);
        setDeleteModal({ show: false, id: null, name: '', productCount: 0 });
        fetchCategories();
      } catch (fallbackErr) {
        const errMsg = fallbackErr.response?.data?.message || err.response?.data?.message || 'Failed to delete category.';
        showAlert('danger', errMsg);
        fetchCategories();
      }
    } finally {
      setDeletingId(null);
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
                <th style={{ width: '5%' }} className="text-center">S.No</th>
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
                        <div
                          className="d-flex align-items-center justify-content-center bg-white border rounded-3 p-1 shadow-xs"
                          style={{
                            width: '46px',
                            height: '46px',
                            borderColor: '#e2e8f0',
                            overflow: 'hidden'
                          }}
                        >
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={catName}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100x100?text=No+Img';
                              }}
                            />
                          ) : (
                            <i className="bi bi-image text-muted opacity-50 fs-5"></i>
                          )}
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
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Category"
                            style={{ borderRadius: '0 6px 6px 0' }}
                            onClick={() => openDeleteModal(cat)}
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

      {/* Modern In-App Delete Confirmation Modal (Never blocked by browser) */}
      {deleteModal.show && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          onClick={() => !deletingId && setDeleteModal({ show: false, id: null, name: '', productCount: 0 })}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header border-0 bg-danger bg-opacity-10 p-4 pb-2">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-trash3-fill fs-5"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Delete Category</h5>
                    <small className="text-muted">This action is permanent</small>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="btn-close" 
                  disabled={Boolean(deletingId)}
                  onClick={() => setDeleteModal({ show: false, id: null, name: '', productCount: 0 })}
                ></button>
              </div>
              <div className="modal-body p-4 pt-3">
                <p className="mb-2 text-secondary" style={{ fontSize: '15px' }}>
                  Are you sure you want to permanently delete category <strong className="text-dark">"{deleteModal.name}"</strong>?
                </p>
                {deleteModal.productCount > 0 && (
                  <div className="alert alert-warning d-flex align-items-center gap-2 p-2.5 rounded-3 mb-0" style={{ fontSize: '13px' }}>
                    <i className="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
                    <span>This category currently contains <strong>{deleteModal.productCount}</strong> products. Deleting it will unlink those products.</span>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 bg-light p-3 px-4 d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-3.5 py-2 fw-medium rounded-3"
                  disabled={Boolean(deletingId)}
                  onClick={() => setDeleteModal({ show: false, id: null, name: '', productCount: 0 })}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4 py-2 fw-semibold rounded-3 d-inline-flex align-items-center gap-2 shadow-sm"
                  disabled={Boolean(deletingId)}
                  onClick={confirmDelete}
                >
                  {deletingId ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash3"></i>
                      <span>Yes, Delete Category</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;

