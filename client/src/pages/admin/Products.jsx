import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Modal State for Quick View
  const [viewProduct, setViewProduct] = useState(null);
  const [activeModalImgIdx, setActiveModalImgIdx] = useState(0);

  // In-App Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [deletingId, setDeletingId] = useState(null);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        axios.get('http://localhost:5000/api/product/show'),
        axios.get('http://localhost:5000/api/category/show')
      ]);

      if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
        setProducts(prodRes.value.data);
      } else {
        setProducts([]);
      }

      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data)) {
        setCategories(catRes.value.data);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
      showAlert('danger', 'Failed to load products from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 4000);
  };

  const openDeleteModal = (prod) => {
    setDeleteModal({
      show: true,
      id: prod._id,
      name: prod.name || 'Product'
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const targetId = deleteModal.id;
    const targetName = deleteModal.name;
    setDeletingId(targetId);

    // Optimistically remove
    setProducts(prev => prev.filter(p => p._id !== targetId));

    try {
      const res = await axios.delete(`http://localhost:5000/api/product/delete/${targetId}`);
      showAlert('success', res.data?.message || `Product "${targetName}" deleted successfully!`);
      setDeleteModal({ show: false, id: null, name: '' });
      fetchProductsAndCategories();
    } catch (err) {
      console.error('Failed to delete product with DELETE, trying fallback:', err);
      try {
        const fallbackRes = await axios.post(`http://localhost:5000/api/product/delete/${targetId}`);
        showAlert('success', fallbackRes.data?.message || `Product "${targetName}" deleted successfully!`);
        setDeleteModal({ show: false, id: null, name: '' });
        fetchProductsAndCategories();
      } catch (fallbackErr) {
        const errMsg = fallbackErr.response?.data?.message || err.response?.data?.message || 'Failed to delete product.';
        showAlert('danger', errMsg);
        fetchProductsAndCategories(); // rollback
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await axios.patch(`http://localhost:5000/api/product/patch/${product._id}`, {
        status: nextStatus
      });
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, status: nextStatus } : p));
      showAlert('success', `Product set to ${nextStatus}.`);
    } catch (err) {
      console.error('Failed to toggle status', err);
      showAlert('danger', 'Failed to update product status.');
    }
  };

  // Format Date Helper
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

  // Filter Logic
  const filteredProducts = products.filter(item => {
    const nameMatch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const shortDescMatch = (item.shortdescription || '').toLowerCase().includes(searchTerm.toLowerCase());
    const tagMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSearch = nameMatch || shortDescMatch || tagMatch;

    const catId = item.category_id?._id || item.category_id;
    const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;

    const matchesStock = selectedStockStatus === 'all' || (item.stockstatus || '').toLowerCase() === selectedStockStatus.toLowerCase();

    const matchesStatus = selectedStatus === 'all' || (item.status || 'active').toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  // Summary Metrics
  const totalCount = products.length;
  const inStockCount = products.filter(p => (p.stockstatus || '').toLowerCase() === 'in stock').length;
  const outOfStockCount = products.filter(p => (p.stockstatus || '').toLowerCase() === 'out of stock' || (p.stockquantity || 0) === 0).length;
  const featuredCount = products.filter(p => p.is_feature).length;

  return (
    <>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h1 className="dashboard-header-title mb-1">
            Manage <span>Products</span>
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '14.5px' }}>
            View, search, edit, and organize all inventory and store products
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-2"
            style={{ borderRadius: '10px' }}
            onClick={fetchProductsAndCategories}
            title="Refresh product list"
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <Link
            to="/dashboard/products/add"
            className="btn btn-primary d-inline-flex align-items-center gap-2 px-3.5 py-2 shadow-sm"
            style={{
              backgroundColor: '#3945E0',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(57, 69, 224, 0.25)'
            }}
          >
            <i className="bi bi-plus-lg"></i> Add New Product
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

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #eff6ff, #ffffff)', borderLeft: '4px solid #3945E0' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Products</small>
                <h3 className="fw-bold mb-0 text-dark mt-1">{totalCount}</h3>
              </div>
              <div className="rounded-circle p-2.5 bg-primary bg-opacity-10 text-primary fs-4">
                <i className="bi bi-box-seam-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #ecfdf5, #ffffff)', borderLeft: '4px solid #10b981' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>In Stock</small>
                <h3 className="fw-bold mb-0 text-success mt-1">{inStockCount}</h3>
              </div>
              <div className="rounded-circle p-2.5 bg-success bg-opacity-10 text-success fs-4">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #fef2f2, #ffffff)', borderLeft: '4px solid #ef4444' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Out / Low Stock</small>
                <h3 className="fw-bold mb-0 text-danger mt-1">{outOfStockCount}</h3>
              </div>
              <div className="rounded-circle p-2.5 bg-danger bg-opacity-10 text-danger fs-4">
                <i className="bi bi-exclamation-octagon-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3" style={{ borderRadius: '14px', background: 'linear-gradient(135deg, #fffbeb, #ffffff)', borderLeft: '4px solid #f59e0b' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Featured Items</small>
                <h3 className="fw-bold mb-0 text-warning mt-1">{featuredCount}</h3>
              </div>
              <div className="rounded-circle p-2.5 bg-warning bg-opacity-10 text-warning fs-4">
                <i className="bi bi-star-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="dashboard-section p-4" style={{ borderRadius: '18px' }}>
        
        {/* Filters Header Bar */}
        <div className="row g-3 align-items-center mb-3">
          {/* Search Bar */}
          <div className="col-12 col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0 bg-light"
                placeholder="Search by title, summary, or tags..."
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
          </div>

          {/* Category Filter */}
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '13px' }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.category || c.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '13px' }}
            >
              <option value="all">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Pre-Order">Pre-Order</option>
            </select>
          </div>

          {/* Store Visibility Filter */}
          <div className="col-12 col-md-2">
            <select
              className="form-select form-select-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ borderRadius: '8px', fontSize: '13px' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '4%' }} className="text-center">S.No</th>
                <th style={{ width: '8%' }}>Thumbnail</th>
                <th style={{ width: '26%' }}>Product Details</th>
                <th style={{ width: '13%' }}>Category</th>
                <th style={{ width: '15%' }}>Price (₹)</th>
                <th style={{ width: '12%' }}>Stock Status</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '12%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="bi bi-box-seam fs-1 d-block mb-2 text-secondary"></i>
                    {searchTerm || selectedCategory !== 'all' || selectedStockStatus !== 'all' || selectedStatus !== 'all'
                      ? 'No products match your active search or filters.'
                      : 'No products registered in database yet.'}
                    <div className="mt-3">
                      <Link
                        to="/dashboard/products/add"
                        className="btn btn-sm btn-primary px-3 py-1.5"
                        style={{ backgroundColor: '#3945E0', border: 'none', borderRadius: '8px' }}
                      >
                        <i className="bi bi-plus-lg me-1"></i> Add First Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod, index) => {
                  const thumbUrl = prod.thumbnail ? `http://localhost:5000/${prod.thumbnail.replace(/\\/g, '/')}` : null;
                  const catName = prod.category_id?.category || prod.category_id?.name || 'Uncategorized';
                  const isActive = prod.status === 'active';
                  const isStock = (prod.stockstatus || '').toLowerCase() === 'in stock';
                  const isLow = (prod.stockstatus || '').toLowerCase() === 'low stock';

                  return (
                    <tr key={prod._id || index}>
                      <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                        {index + 1}
                      </td>

                      {/* Thumbnail */}
                      <td>
                        <div
                          className="d-flex align-items-center justify-content-center bg-white border rounded-3 p-1 shadow-xs"
                          style={{
                            width: '52px',
                            height: '52px',
                            borderColor: '#e2e8f0',
                            overflow: 'hidden',
                          }}
                        >
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={prod.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100x100?text=No+Img';
                              }}
                            />
                          ) : (
                            <i className="bi bi-box-seam text-secondary opacity-50 fs-4"></i>
                          )}
                        </div>
                      </td>

                      {/* Product Details */}
                      <td>
                        <div>
                          <div className="d-flex align-items-center gap-1.5 mb-1 flex-wrap">
                            <strong className="text-dark" style={{ fontSize: '14.5px', fontWeight: '600' }}>
                              {prod.name}
                            </strong>
                            {prod.is_feature && (
                              <span className="badge bg-warning bg-opacity-25 text-dark border border-warning-subtle py-0.5 px-1.5" style={{ fontSize: '10px' }}>
                                <i className="bi bi-star-fill text-warning me-1"></i>Featured
                              </span>
                            )}
                          </div>
                          <p
                            className="text-muted mb-1.5"
                            style={{
                              fontSize: '12px',
                              maxWidth: '280px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {prod.shortdescription || 'No description provided'}
                          </p>
                          <div className="d-flex flex-wrap gap-1">
                            {prod.isfreedelivery && (
                              <span className="badge bg-success-subtle text-success border border-success-subtle py-0.5 px-1.5" style={{ fontSize: '10px' }}>
                                <i className="bi bi-truck me-1"></i>Free Delivery
                              </span>
                            )}
                            {prod.iscouponavailable && (
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-0.5 px-1.5" style={{ fontSize: '10px' }}>
                                <i className="bi bi-tag-fill me-1"></i>Coupon
                              </span>
                            )}
                            {Array.isArray(prod.tags) &&
                              prod.tags.slice(0, 2).map((tag, tIdx) => (
                                <span key={tIdx} className="badge bg-light text-secondary border py-0.5 px-1.5" style={{ fontSize: '10px' }}>
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span
                          className="badge rounded-pill bg-light text-dark border px-2.5 py-1.5 d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '12px', fontWeight: '500' }}
                        >
                          <i className="bi bi-folder2-open text-primary"></i>
                          {catName}
                        </span>
                        {prod.height && prod.width ? (
                          <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                            <i className="bi bi-bounding-box-circles me-1 opacity-75"></i>
                            {prod.height} × {prod.width} mm
                          </div>
                        ) : null}
                      </td>

                      {/* Price Details */}
                      <td>
                        <div className="d-flex align-items-baseline gap-1.5">
                          <strong className="text-dark" style={{ fontSize: '15px' }}>
                            ₹ {prod.price?.toLocaleString('en-IN') || 0}
                          </strong>
                          {prod.compareprice && prod.compareprice > prod.price && (
                            <small className="text-muted text-decoration-line-through" style={{ fontSize: '11.5px' }}>
                              ₹ {prod.compareprice?.toLocaleString('en-IN')}
                            </small>
                          )}
                        </div>
                        {prod.costprice ? (
                          <div className="text-muted" style={{ fontSize: '11.5px' }}>
                            Cost: ₹ {prod.costprice?.toLocaleString('en-IN')}
                          </div>
                        ) : null}
                      </td>

                      {/* Stock Status */}
                      <td>
                        <span
                          className={`badge px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 ${
                            isStock
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : isLow
                              ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'
                              : 'bg-danger-subtle text-danger border border-danger-subtle'
                          }`}
                          style={{ fontSize: '12px' }}
                        >
                          <i className={`bi ${isStock ? 'bi-check-circle-fill' : isLow ? 'bi-exclamation-circle-fill' : 'bi-x-circle-fill'}`}></i>
                          {prod.stockstatus || 'Out of Stock'}
                        </span>
                        <div className="text-muted mt-1" style={{ fontSize: '11.5px' }}>
                          Qty: <strong className="text-dark">{prod.stockquantity ?? 0}</strong>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td>
                        <button
                          onClick={() => handleToggleStatus(prod)}
                          className={`btn btn-sm px-2.5 py-1 rounded-pill ${
                            isActive ? 'btn-outline-success bg-success-subtle' : 'btn-outline-secondary'
                          }`}
                          style={{ fontSize: '11.5px', fontWeight: '500' }}
                          title={`Click to mark as ${isActive ? 'Inactive' : 'Active'}`}
                        >
                          <i className={`bi ${isActive ? 'bi-check2-circle' : 'bi-dash-circle'} me-1`}></i>
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="text-end">
                        <div className="d-inline-flex gap-1.5">
                          {/* Quick View Button */}
                          <button
                            className="btn btn-sm btn-light border text-info shadow-xs rounded-2"
                            title="Quick View Details"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            onClick={() => {
                              setViewProduct(prod);
                              setActiveModalImgIdx(0);
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {/* Edit Button */}
                          <Link
                            to={`/dashboard/products/edit/${prod._id}`}
                            className="btn btn-sm btn-light border text-primary shadow-xs rounded-2 d-inline-flex align-items-center justify-content-center"
                            title="Edit Product"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                          >
                            <i className="bi bi-pencil"></i>
                          </Link>
                          {/* Delete Button */}
                          <button
                            className="btn btn-sm btn-light border text-danger shadow-xs rounded-2"
                            title="Delete Product"
                            style={{ width: '32px', height: '32px', padding: 0 }}
                            onClick={() => openDeleteModal(prod)}
                          >
                            <i className="bi bi-trash3"></i>
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

      {/* QUICK VIEW MODAL */}
      {viewProduct && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '18px', overflow: 'hidden' }}>
              
              {/* Modal Header */}
              <div className="modal-header bg-light border-bottom p-3.5">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge rounded-pill bg-primary px-2.5 py-1" style={{ fontSize: '12px' }}>
                    {viewProduct.category_id?.category || viewProduct.category_id?.name || 'Category'}
                  </span>
                  <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '17px' }}>
                    {viewProduct.name}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewProduct(null)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Gallery & Images Slider */}
                  <div className="col-12 col-md-5">
                    {(() => {
                      const allImgs = [];
                      if (viewProduct.thumbnail) {
                        allImgs.push(viewProduct.thumbnail);
                      }
                      if (Array.isArray(viewProduct.images)) {
                        viewProduct.images.forEach((img) => {
                          if (img && !allImgs.includes(img)) allImgs.push(img);
                        });
                      }
                      const safeIdx = Math.min(activeModalImgIdx, Math.max(0, allImgs.length - 1));
                      const currentImg = allImgs[safeIdx] || '';
                      const currentSrc = currentImg
                        ? `http://localhost:5000/${currentImg.replace(/\\/g, '/')}`
                        : 'https://placehold.co/400x400?text=No+Image';

                      const handlePrev = () => {
                        setActiveModalImgIdx((prev) => (prev - 1 + allImgs.length) % allImgs.length);
                      };

                      const handleNext = () => {
                        setActiveModalImgIdx((prev) => (prev + 1) % allImgs.length);
                      };

                      return (
                        <div>
                          {/* Main Image Slide Container */}
                          <div
                            className="position-relative border rounded-4 p-3 bg-white mb-3 text-center d-flex align-items-center justify-content-center shadow-xs overflow-hidden"
                            style={{ height: '260px', backgroundColor: '#f8fafc' }}
                          >
                            <img
                              src={currentSrc}
                              alt={`${viewProduct.name} - slide ${safeIdx + 1}`}
                              className="img-fluid rounded-3"
                              style={{
                                maxHeight: '220px',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                transition: 'opacity 0.3s ease, transform 0.3s ease',
                              }}
                            />

                            {/* Slide navigation controls */}
                            {allImgs.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  className="product-modal-arrow-btn prev"
                                  onClick={handlePrev}
                                  title="Previous Image"
                                  aria-label="Previous Image"
                                >
                                  <i className="bi bi-chevron-left"></i>
                                </button>

                                <button
                                  type="button"
                                  className="product-modal-arrow-btn next"
                                  onClick={handleNext}
                                  title="Next Image"
                                  aria-label="Next Image"
                                >
                                  <i className="bi bi-chevron-right"></i>
                                </button>

                                {/* Counter badge */}
                                <span
                                  className="position-absolute bottom-0 end-0 mb-2 me-2 badge bg-dark bg-opacity-75 text-white rounded-pill px-2 py-1"
                                  style={{ fontSize: '11px' }}
                                >
                                  {safeIdx + 1} / {allImgs.length}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Thumbnail Selector Strip */}
                          {allImgs.length > 1 && (
                            <div>
                              <div className="d-flex align-items-center justify-content-between mb-1.5">
                                <small className="text-muted fw-semibold" style={{ fontSize: '12px' }}>
                                  All Product Images ({allImgs.length})
                                </small>
                                <small className="text-primary" style={{ fontSize: '11px' }}>
                                  Click to slide
                                </small>
                              </div>
                              <div className="d-flex gap-2 flex-wrap">
                                {allImgs.map((img, idx) => {
                                  const isSelected = idx === safeIdx;
                                  const src = `http://localhost:5000/${img.replace(/\\/g, '/')}`;
                                  return (
                                    <button
                                      key={idx}
                                      type="button"
                                      className="btn p-1 border rounded-3 bg-white"
                                      style={{
                                        width: '56px',
                                        height: '56px',
                                        borderColor: isSelected ? '#3945E0' : '#e2e8f0',
                                        borderWidth: isSelected ? '2px' : '1px',
                                        boxShadow: isSelected
                                          ? '0 0 0 3px rgba(57, 69, 224, 0.18)'
                                          : 'none',
                                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                        transition: 'all 0.2s ease',
                                      }}
                                      onClick={() => setActiveModalImgIdx(idx)}
                                      title={`Slide ${idx + 1}`}
                                    >
                                      <img
                                        src={src}
                                        alt={`thumb-${idx}`}
                                        className="rounded-2"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Information Details */}
                  <div className="col-12 col-md-7">
                    <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Short Description</h6>
                    <p className="text-dark mb-3" style={{ fontSize: '14px' }}>
                      {viewProduct.shortdescription}
                    </p>

                    <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Pricing & Dimensions</h6>
                    <div className="row g-2 mb-3">
                      <div className="col-4">
                        <div className="p-2 bg-light rounded-2 border">
                          <small className="text-muted d-block" style={{ fontSize: '11px' }}>Selling Price</small>
                          <strong className="text-dark fs-6">₹ {viewProduct.price}</strong>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 bg-light rounded-2 border">
                          <small className="text-muted d-block" style={{ fontSize: '11px' }}>Compare Price</small>
                          <strong className="text-dark fs-6">₹ {viewProduct.compareprice}</strong>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="p-2 bg-light rounded-2 border">
                          <small className="text-muted d-block" style={{ fontSize: '11px' }}>Cost Price</small>
                          <strong className="text-dark fs-6">₹ {viewProduct.costprice}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <div className="p-2 bg-light rounded-2 border">
                          <small className="text-muted d-block" style={{ fontSize: '11px' }}>Dimensions (H × W)</small>
                          <strong className="text-dark">{viewProduct.height} × {viewProduct.width} mm</strong>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 bg-light rounded-2 border">
                          <small className="text-muted d-block" style={{ fontSize: '11px' }}>Stock & Status</small>
                          <strong className="text-dark">{viewProduct.stockquantity} units ({viewProduct.stockstatus})</strong>
                        </div>
                      </div>
                    </div>

                    <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Policies & Warranty</h6>
                    <ul className="list-unstyled mb-3" style={{ fontSize: '13px' }}>
                      <li className="mb-1"><i className="bi bi-shield-check text-primary me-1.5"></i><strong>Policy:</strong> {viewProduct.refundpolicy} ({viewProduct.refund_days} Days)</li>
                      <li className="mb-1"><i className="bi bi-truck text-success me-1.5"></i><strong>Free Delivery:</strong> {viewProduct.isfreedelivery ? 'Yes' : 'No'}</li>
                      <li className="mb-1"><i className="bi bi-ticket text-info me-1.5"></i><strong>Coupon Applicable:</strong> {viewProduct.iscouponavailable ? 'Yes' : 'No'}</li>
                      <li className="mb-1"><i className="bi bi-arrow-repeat text-warning me-1.5"></i><strong>Replaceable:</strong> {viewProduct.isreplaceable ? 'Yes' : 'No'}</li>
                    </ul>

                    {viewProduct.tags && viewProduct.tags.length > 0 && (
                      <div className="mb-3">
                        <small className="text-muted fw-semibold d-block mb-1">Tags</small>
                        <div className="d-flex flex-wrap gap-1">
                          {viewProduct.tags.map((t, idx) => (
                            <span key={idx} className="badge bg-secondary-subtle text-secondary border" style={{ fontSize: '11px' }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewProduct.description && (
                      <div>
                        <small className="text-muted fw-semibold d-block mb-1">Full Description</small>
                        <p className="text-secondary mb-0" style={{ fontSize: '13px', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                          {viewProduct.description}
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light p-3">
                <Link
                  to={`/dashboard/products/edit/${viewProduct._id}`}
                  className="btn btn-primary btn-sm px-3"
                  style={{ backgroundColor: '#3945E0', border: 'none', borderRadius: '8px' }}
                >
                  <i className="bi bi-pencil me-1"></i> Edit Product
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm px-3"
                  style={{ borderRadius: '8px' }}
                  onClick={() => setViewProduct(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {deleteModal.show && (
        <div 
          className="modal fade show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-start">
              <div className="modal-body p-4 text-center">
                <div 
                  className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '64px', height: '64px' }}
                >
                  <i className="bi bi-trash3-fill fs-2"></i>
                </div>
                <h5 className="modal-title fw-bold text-dark mb-2">Delete Product?</h5>
                <p className="text-muted small mb-3">
                  Are you sure you want to permanently delete <strong className="text-dark">"{deleteModal.name}"</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 bg-light p-3 px-4 d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-3.5 py-2 fw-medium rounded-3"
                  disabled={Boolean(deletingId)}
                  onClick={() => setDeleteModal({ show: false, id: null, name: '' })}
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
                      <span>Yes, Delete Product</span>
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

export default Products;
