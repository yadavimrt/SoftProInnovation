import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  // Stock Update Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [editStatus, setEditStatus] = useState('In Stock');
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/product/show');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch inventory', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

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
      await axios.patch(`http://localhost:5000/api/product/patch/${editingProduct._id}`, {
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
    } catch (err) {
      console.error('Failed to update stock', err);
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
          <h1 className="dashboard-header-title mb-1">
            Inventory <span>Monitor</span>
          </h1>
          <p className="dashboard-subtitle mb-0">
            Real-time stock levels, reorder alerts, and quantity tracking
          </p>
        </div>
        <button
          className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1.5 align-self-start align-self-md-auto"
          onClick={fetchInventory}
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh Stock
        </button>
      </div>
      
      {/* Top 3 Stats Cards */}
      <div className="row g-4 mb-4">
        {/* Card 1 - Total Stock */}
        <div className="col-12 col-md-4">
          <div className="stat-card bg-stat-1" style={{ minHeight: '130px' }}>
            <div className="stat-card-decor"></div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="stat-label mb-0 fw-semibold text-secondary">Total Items in Stock</span>
              <div className="stat-icon mb-0 text-primary">
                <i className="bi bi-boxes"></i>
              </div>
            </div>
            <div className="stat-value text-dark mb-0">
              {loading ? <span className="spinner-border spinner-border-sm"></span> : totalStock.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Card 2 - Low Stock Alerts */}
        <div className="col-12 col-md-4">
          <div className="stat-card bg-stat-2" style={{ minHeight: '130px' }}>
            <div className="stat-card-decor"></div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="stat-label mb-0 fw-semibold text-warning-emphasis">Low Stock Alerts (≤ 5)</span>
              <div className="stat-icon mb-0 text-warning">
                <i className="bi bi-exclamation-diamond-fill"></i>
              </div>
            </div>
            <div className="stat-value text-warning-emphasis mb-0">
              {loading ? <span className="spinner-border spinner-border-sm"></span> : lowStockCount}
            </div>
          </div>
        </div>

        {/* Card 3 - Out of Stock */}
        <div className="col-12 col-md-4">
          <div className="stat-card bg-stat-3" style={{ minHeight: '130px' }}>
            <div className="stat-card-decor"></div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="stat-label mb-0 fw-semibold text-danger">Out of Stock Items</span>
              <div className="stat-icon mb-0 text-danger">
                <i className="bi bi-x-octagon-fill"></i>
              </div>
            </div>
            <div className="stat-value text-danger mb-0">
              {loading ? <span className="spinner-border spinner-border-sm"></span> : outOfStockCount}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="dashboard-section p-4" style={{ borderRadius: '18px' }}>
        {/* Filters Header */}
        <div className="row g-3 align-items-center mb-4 pb-2 border-bottom">
          <div className="col-12 col-md-8">
            <div className="position-relative">
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search product inventory by name or category..."
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
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{ borderRadius: '10px' }}
            >
              <option value="all">All Products ({products.length})</option>
              <option value="in_stock">In Stock ({products.length - lowStockCount - outOfStockCount})</option>
              <option value="low_stock">Low Stock Alerts ({lowStockCount})</option>
              <option value="out_of_stock">Out of Stock ({outOfStockCount})</option>
            </select>
          </div>
        </div>

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
                filteredProducts.map((prod, index) => {
                  const qty = Number(prod.stockquantity) || 0;
                  const isOut = qty === 0 || (prod.stockstatus || '').toLowerCase() === 'out of stock';
                  const isLow = qty > 0 && (qty <= 5 || (prod.stockstatus || '').toLowerCase() === 'low stock');
                  const catName = prod.category_id?.category || prod.category || 'General';
                  const thumbUrl = prod.thumbnail ? `http://localhost:5000/${prod.thumbnail.replace(/\\/g, '/')}` : null;

                  return (
                    <tr key={prod._id || index}>
                      {/* S.No */}
                      <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                        {index + 1}
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
