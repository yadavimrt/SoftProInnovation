import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';
import './Products.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Stock Update Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editStatus, setEditStatus] = useState('In Stock');
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/product/show`);
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenEditStock = (prod) => {
    setEditingProduct(prod);
    setEditQuantity(Number(prod.stockquantity) || 0);
    setEditStatus(prod.stockstatus || (Number(prod.stockquantity) > 5 ? 'In Stock' : Number(prod.stockquantity) > 0 ? 'Low Stock' : 'Out of Stock'));
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const qty = Number(editQuantity);
    let autoStatus = editStatus;
    if (qty === 0) autoStatus = 'Out of Stock';
    else if (qty <= 5 && editStatus === 'In Stock') autoStatus = 'Low Stock';

    try {
      setUpdating(true);
      await axios.patch(`${API_BASE_URL}/api/product/patch/${editingProduct._id}`, {
        stockquantity: qty,
        stockstatus: autoStatus,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p._id === editingProduct._id
            ? { ...p, stockquantity: qty, stockstatus: autoStatus }
            : p
        )
      );

      showAlert('success', `Stock updated for ${editingProduct.name}!`);
      handleCloseModal();
    } catch {
      showAlert('danger', 'Failed to update stock in database.');
    } finally {
      setUpdating(false);
    }
  };

  const totalStock = products.reduce((acc, p) => acc + (Number(p.stockquantity) || 0), 0);
  const lowStockCount = products.filter(p => {
    const q = Number(p.stockquantity) || 0;
    return (q > 0 && q <= 5) || (p.stockstatus || '').toLowerCase() === 'low stock';
  }).length;
  const outOfStockCount = products.filter(p => {
    const q = Number(p.stockquantity) || 0;
    return q === 0 || (p.stockstatus || '').toLowerCase() === 'out of stock';
  }).length;

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const name = (p.name || '').toLowerCase();
    const category = (p.category_id?.category || p.category || '').toLowerCase();
    const matchesSearch = !term || name.includes(term) || category.includes(term);

    const qty = Number(p.stockquantity) || 0;
    const isOut = qty === 0 || (p.stockstatus || '').toLowerCase() === 'out of stock';
    const isLow = qty > 0 && (qty <= 5 || (p.stockstatus || '').toLowerCase() === 'low stock');
    const isIn = qty > 5 && !isOut && !isLow;

    let matchesFilter = true;
    if (stockFilter === 'in_stock') matchesFilter = isIn || (!isOut && !isLow);
    else if (stockFilter === 'low_stock') matchesFilter = isLow;
    else if (stockFilter === 'out_of_stock') matchesFilter = isOut;

    return matchesSearch && matchesFilter;
  });

  // Reset page to 1 whenever search, stockFilter, or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter, itemsPerPage]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      const sectionElem = document.querySelector('.prod-table-container') || document.querySelector('.dashboard-section');
      if (sectionElem) {
        sectionElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const inStockCount = Math.max(0, products.length - lowStockCount - outOfStockCount);

  return (
    <>
      {/* Alert Notification */}
      {alert.show && (
        <div
          className={`position-fixed top-0 end-0 m-4 p-3 alert alert-${alert.type} shadow-lg rounded-3 z-3 d-flex align-items-center gap-2`}
          style={{ zIndex: 9999, minWidth: '280px' }}
        >
          <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
          <span>{alert.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="prod-header-badge">
            <i className="bi bi-box-seam"></i> WAREHOUSE & STOCK CONTROLS
          </div>
          <h1 className="prod-title mb-1">
            Inventory <span className="prod-title-highlight">Monitor</span>
          </h1>
          <p className="prod-subtitle mb-0">
            Real-time stock levels, automated reorder alerts, and warehouse quantity tracking
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-white border d-inline-flex align-items-center gap-2 px-3.5 py-2 shadow-xs fw-semibold"
            style={{ borderRadius: '10px', backgroundColor: '#ffffff', color: '#334155', fontSize: '13.5px' }}
            onClick={fetchInventory}
            disabled={loading}
            title="Refresh stock levels"
          >
            <i className={`bi bi-arrow-clockwise text-primary ${loading ? 'spin' : ''}`}></i> Refresh Stock
          </button>
        </div>
      </div>
      
      {/* 4 KPI Metrics Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1 - Total Products */}
        <div className="col-6 col-lg-3">
          <div className="prod-metric-card prod-metric-total">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="prod-metric-label">Total SKUs</span>
                <div className="prod-metric-val">{products.length}</div>
              </div>
              <div className="prod-metric-icon prod-icon-blue">
                <i className="bi bi-box-seam-fill"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 - Total Units in Stock */}
        <div className="col-6 col-lg-3">
          <div className="prod-metric-card prod-metric-instock">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="prod-metric-label">Stock Units</span>
                <div className="prod-metric-val text-success">
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : totalStock.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="prod-metric-icon prod-icon-green">
                <i className="bi bi-boxes"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 - Low Stock Alerts */}
        <div className="col-6 col-lg-3">
          <div className="prod-metric-card prod-metric-featured">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="prod-metric-label">Low Stock (≤ 5)</span>
                <div className="prod-metric-val" style={{ color: '#d97706' }}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : lowStockCount}
                </div>
              </div>
              <div className="prod-metric-icon prod-icon-amber">
                <i className="bi bi-exclamation-diamond-fill"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4 - Out of Stock */}
        <div className="col-6 col-lg-3">
          <div className="prod-metric-card prod-metric-outstock">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="prod-metric-label">Out of Stock</span>
                <div className="prod-metric-val text-danger">
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : outOfStockCount}
                </div>
              </div>
              <div className="prod-metric-icon prod-icon-red">
                <i className="bi bi-x-octagon-fill"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="prod-filter-card">
        <div className="row g-2.5 align-items-center">
          {/* Search Bar */}
          <div className="col-12 col-md-6">
            <div className="prod-search-wrap">
              <i className="bi bi-search prod-search-icon"></i>
              <input
                type="text"
                className="prod-search-input"
                placeholder="Search inventory by product name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="prod-search-clear"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-4">
            <select
              className="form-select prod-select w-100"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="all">All Inventory ({products.length})</option>
              <option value="in_stock">In Stock ({inStockCount})</option>
              <option value="low_stock">Low Stock Alerts ({lowStockCount})</option>
              <option value="out_of_stock">Out of Stock ({outOfStockCount})</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-6 col-md-2 d-flex justify-content-end">
            {(searchTerm || stockFilter !== 'all') ? (
              <button
                type="button"
                className="btn btn-light border btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-1 py-2 text-secondary fw-semibold"
                style={{ borderRadius: '10px' }}
                onClick={() => { setSearchTerm(''); setStockFilter('all'); }}
              >
                <i className="bi bi-arrow-counterclockwise"></i> Reset
              </button>
            ) : (
              <div className="text-muted small text-end w-100 pe-1">
                <span className="fw-semibold text-dark">{filteredProducts.length}</span> SKUs
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="prod-table-container mb-4">
        {/* Inventory Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '6%' }} className="text-center">S.No</th>
                <th style={{ width: '8%' }}>Image</th>
                <th style={{ width: '28%' }}>Product Name</th>
                <th style={{ width: '18%' }}>Category</th>
                <th style={{ width: '14%' }}>Current Stock</th>
                <th style={{ width: '14%' }}>Stock Status</th>
                <th style={{ width: '12%' }} className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-box-seam fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    {searchTerm || stockFilter !== 'all'
                      ? 'No products match your active search or filter.'
                      : 'No products found in inventory.'}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod, index) => {
                  const qty = Number(prod.stockquantity) || 0;
                  const isOut = qty === 0 || (prod.stockstatus || '').toLowerCase() === 'out of stock';
                  const isLow = qty > 0 && (qty <= 5 || (prod.stockstatus || '').toLowerCase() === 'low stock');
                  const catName = prod.category_id?.category || prod.category || 'General';
                  const thumbUrl = formatImg(prod.thumbnail, null);

                  return (
                    <tr key={prod._id || index}>
                      {/* S.No */}
                      <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                        {startIndex + index + 1}
                      </td>

                      {/* Image Thumbnail */}
                      <td>
                        <div
                          className="d-flex align-items-center justify-content-center bg-white border rounded-3 p-1 shadow-xs"
                          style={{
                            width: '46px',
                            height: '46px',
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
                            <i className="bi bi-box-seam text-secondary opacity-50 fs-5"></i>
                          )}
                        </div>
                      </td>

                      {/* Name & ID */}
                      <td>
                        <strong className="text-dark d-block" style={{ fontSize: '14px' }}>
                          {prod.name}
                        </strong>
                        <small className="text-muted" style={{ fontSize: '11px' }}>
                          ID: {prod._id ? String(prod._id).slice(-6) : 'N/A'}
                        </small>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge rounded-pill bg-light text-dark border px-2.5 py-1.5" style={{ fontSize: '12px' }}>
                          {catName}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td>
                        <span
                          className={`fw-bold ${isOut ? 'text-danger' : isLow ? 'text-warning-emphasis' : 'text-dark'}`}
                          style={{ fontSize: '16px' }}
                        >
                          {qty}
                        </span>
                        <small className="text-muted ms-1">units</small>
                      </td>

                      {/* Stock Status Badge */}
                      <td>
                        <span className={`badge px-2.5 py-1.5 rounded-pill d-inline-flex align-items-center gap-1 ${
                          isOut ? 'bg-danger-subtle text-danger border border-danger-subtle' :
                          isLow ? 'bg-warning-subtle text-warning-emphasis border border-warning-subtle' :
                          'bg-success-subtle text-success border border-success-subtle'
                        }`} style={{ fontSize: '11.5px' }}>
                          <i className={`bi ${isOut ? 'bi-x-circle-fill' : isLow ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'}`}></i>
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-2 px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '12.5px' }}
                          onClick={() => handleOpenEditStock(prod)}
                          title="Quick update product stock quantity"
                        >
                          <i className="bi bi-pencil-square"></i> Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Premium SaaS Pagination */}
        {!loading && totalItems > 0 && (
          <div className="prod-table-footer">
            {/* Left Section: Info & Rows Per Page */}
            <div className="prod-footer-left">
              <div className="prod-showing-pill">
                <i className="bi bi-layers-half text-primary"></i>
                <span>
                  Showing <strong className="text-dark">{startIndex + 1}&ndash;{endIndex}</strong> of{' '}
                  <strong className="text-dark">{totalItems}</strong> products
                </span>
                {totalItems !== products.length && (
                  <span className="prod-filtered-badge">Filtered</span>
                )}
              </div>

              <div className="prod-rows-selector">
                <span className="prod-rows-label">Per page</span>
                <div className="prod-custom-select-wrap">
                  <select
                    id="inventoryPerPageSelect"
                    className="prod-rows-select"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <i className="bi bi-chevron-down prod-select-arrow"></i>
                </div>
              </div>

              <div className="prod-stat-chips-wrap d-none d-xl-flex">
                <span className="prod-chip prod-chip-instock">
                  <span className="prod-chip-indicator bg-success"></span>
                  {inStockCount} In Stock
                </span>
                {lowStockCount > 0 && (
                  <span className="prod-chip prod-chip-featured">
                    <span className="prod-chip-indicator bg-warning"></span>
                    {lowStockCount} Low Stock
                  </span>
                )}
                {outOfStockCount > 0 && (
                  <span className="prod-chip" style={{ background: '#fff1f2', borderColor: '#fecdd3', color: '#e11d48' }}>
                    <span className="prod-chip-indicator bg-danger"></span>
                    {outOfStockCount} Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Right Section: Pagination Nav Controls */}
            <div className="prod-footer-right">
              <div className="prod-page-counter-badge d-none d-sm-inline-flex">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </div>

              {totalPages > 1 && (
                <nav className="prod-pagination-cluster" aria-label="Inventory table pagination">
                  {/* First Page Button */}
                  {totalPages > 4 && (
                    <button
                      type="button"
                      className="prod-nav-icon-btn"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                      title="First page"
                    >
                      <i className="bi bi-chevron-bar-left"></i>
                    </button>
                  )}

                  {/* Previous Page Button */}
                  <button
                    type="button"
                    className="prod-nav-arrow-btn"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    title="Previous page"
                  >
                    <i className="bi bi-chevron-left"></i>
                    <span className="d-none d-md-inline">Prev</span>
                  </button>

                  {/* Segmented Numbers Group */}
                  <div className="prod-numbers-container">
                    {getPageNumbers().map((p, idx) =>
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="prod-ellipsis-span">
                          &bull;&bull;&bull;
                        </span>
                      ) : (
                        <button
                          key={`page-${p}`}
                          type="button"
                          className={`prod-num-btn ${currentPage === p ? 'active' : ''}`}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  {/* Next Page Button */}
                  <button
                    type="button"
                    className="prod-nav-arrow-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    title="Next page"
                  >
                    <span className="d-none d-md-inline">Next</span>
                    <i className="bi bi-chevron-right"></i>
                  </button>

                  {/* Last Page Button */}
                  {totalPages > 4 && (
                    <button
                      type="button"
                      className="prod-nav-icon-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      title="Last page"
                    >
                      <i className="bi bi-chevron-bar-right"></i>
                    </button>
                  )}
                </nav>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QUICK STOCK UPDATE MODAL */}
      {editingProduct && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(5px)',
            zIndex: 1050,
          }}
          onClick={handleCloseModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-start">
              {/* Modal Header */}
              <div className="modal-header bg-light py-3 px-4 border-bottom">
                <div>
                  <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>
                    Quick Stock Update
                  </h5>
                  <small className="text-muted">{editingProduct.name}</small>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  aria-label="Close"
                  onClick={handleCloseModal}
                ></button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveStock}>
                <div className="modal-body p-4 d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold small text-muted mb-1">
                      Stock Quantity (Units)
                    </label>
                    <div className="input-group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setEditQuantity(Math.max(0, editQuantity - 1))}
                      >
                        <i className="bi bi-dash-lg"></i>
                      </button>
                      <input
                        type="number"
                        className="form-control text-center fw-bold fs-5"
                        min="0"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(Math.max(0, Number(e.target.value)))}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setEditQuantity(editQuantity + 1)}
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="form-label fw-semibold small text-muted mb-1">
                      Stock Status Label
                    </label>
                    <select
                      className="form-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                      <option value="Pre-Order">Pre-Order</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-light border-top py-2.5 px-4 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm px-3"
                    onClick={handleCloseModal}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 fw-semibold"
                    style={{ backgroundColor: '#3945E0', border: 'none' }}
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Inventory;
