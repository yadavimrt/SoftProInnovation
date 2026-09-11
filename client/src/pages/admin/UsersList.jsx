import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';
import './Products.css';

const isUserActive = (status) => {
  if (status === false || status === 'inactive' || status === 'Inactive' || status === 0) {
    return false;
  }
  return true;
};

const getUserImgSrc = (picture) => {
  if (!picture || picture === 'https://example.com/default-profile.png') return '';
  return formatImg(picture, '');
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State for Add / Edit User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState('');
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    status: 'active',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // In-App Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '', email: '' });
  const [deletingId, setDeletingId] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/user/show`);
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch {
      showAlert('danger', 'Failed to load users from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      status: 'active',
    });
    setPictureFile(null);
    setPicturePreview('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    const cleanMobile = (user.mobile || '').replace(/^\+91\s*/, '').trim();
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: cleanMobile,
      password: '',
      status: isUserActive(user.status) ? 'active' : 'inactive',
    });
    setPictureFile(null);
    setPicturePreview(user.picture ? getUserImgSrc(user.picture) : '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setPictureFile(null);
    setPicturePreview('');
    setShowPassword(false);
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      showAlert('warning', 'Please fill all required fields (Name, Email, Mobile).');
      return;
    }

    if (!editingUser && !formData.password) {
      showAlert('warning', 'Password is required for new user.');
      return;
    }

    try {
      setModalLoading(true);
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('email', formData.email.trim());

      const rawMobile = formData.mobile.trim().replace(/^\+91\s*/, '');
      const formattedMobile = rawMobile ? `+91 ${rawMobile}` : '';
      submitData.append('mobile', formattedMobile);

      submitData.append('status', formData.status);
      if (formData.password?.trim()) {
        submitData.append('password', formData.password.trim());
      }
      if (pictureFile) {
        submitData.append('picture', pictureFile);
      }

      if (editingUser) {
        const res = await axios.put(
          `${API_BASE_URL}/api/user/update/${editingUser._id}`,
          submitData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (res.data) {
          showAlert('success', 'User updated successfully!');
          fetchUsers();
          handleCloseModal();
        }
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/api/user/register`,
          submitData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (res.data?.success || res.status === 201) {
          showAlert('success', 'New user added successfully!');
          fetchUsers();
          handleCloseModal();
        } else {
          showAlert('danger', res.data?.message || 'Failed to add user');
        }
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error occurred while saving user.');
    } finally {
      setModalLoading(false);
    }
  };

  // Toggle Status (Active / Inactive)
  const handleToggleStatus = async (user) => {
    const currentActive = isUserActive(user.status);
    const newStatus = currentActive ? 'inactive' : 'active';
    try {
      await axios.patch(`${API_BASE_URL}/api/user/patch/${user._id}`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
      );
      showAlert('success', `User status updated to ${newStatus}!`);
    } catch {
      showAlert('danger', 'Failed to update user status.');
    }
  };

  // Delete User
  const openDeleteModal = (user) => {
    setDeleteModal({
      show: true,
      id: user._id,
      name: user.name || 'User',
      email: user.email || ''
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    const targetId = deleteModal.id;
    const targetName = deleteModal.name;
    setDeletingId(targetId);

    // Optimistically update list for instant feedback
    setUsers((prev) => prev.filter((u) => u._id !== targetId));

    try {
      const res = await axios.delete(`${API_BASE_URL}/api/user/delete/${targetId}`);
      showAlert('success', res.data?.message || `User "${targetName}" has been deleted.`);
      setDeleteModal({ show: false, id: null, name: '', email: '' });
      fetchUsers();
    } catch {
      try {
        const fallbackRes = await axios.post(`${API_BASE_URL}/api/user/delete/${targetId}`);
        showAlert('success', fallbackRes.data?.message || `User "${targetName}" has been deleted.`);
        setDeleteModal({ show: false, id: null, name: '', email: '' });
        fetchUsers();
      } catch (fallbackErr) {
        const errMsg = fallbackErr.response?.data?.message || 'Failed to delete user.';
        showAlert('danger', errMsg);
        fetchUsers(); // Rollback optimistic update
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Filtering users safely
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase().trim();
    const nameStr = String(user.name || '').toLowerCase();
    const emailStr = String(user.email || '').toLowerCase();
    const mobileStr = String(user.mobile || '');

    const matchesSearch =
      !term ||
      nameStr.includes(term) ||
      emailStr.includes(term) ||
      mobileStr.includes(term);

    const active = isUserActive(user.status);
    const filter = statusFilter.toLowerCase().trim();

    const matchesStatus =
      filter === 'all' ||
      (filter === 'active' && active) ||
      (filter === 'inactive' && !active);

    return matchesSearch && matchesStatus;
  });

  // Reset page to 1 whenever search, statusFilter, or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

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

  const activeUsersCount = users.filter((u) => isUserActive(u.status)).length;
  const inactiveUsersCount = users.filter((u) => !isUserActive(u.status)).length;
  const withPhoneCount = users.filter((u) => !!u.mobile).length;

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

      {/* Header & Add User Button */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="prod-header-badge">
            <i className="bi bi-shield-lock"></i> USER ACCESS & ACCOUNTS
          </div>
          <h1 className="prod-title mb-1">
            User <span className="prod-title-highlight">Management</span>
          </h1>
          <p className="prod-subtitle mb-0">
            View, search, edit, manage permissions, and track active registered users
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-white border d-inline-flex align-items-center gap-2 px-3.5 py-2 shadow-xs fw-semibold"
            style={{ borderRadius: '10px', backgroundColor: '#ffffff', color: '#334155', fontSize: '13.5px' }}
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh users list"
          >
            <i className={`bi bi-arrow-clockwise text-primary ${loading ? 'spin' : ''}`}></i> Refresh
          </button>
          <button
            type="button"
            className="btn d-inline-flex align-items-center gap-2 px-4 py-2 text-white shadow-sm fw-semibold"
            style={{
              background: 'linear-gradient(135deg, #3945E0, #2563eb)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '13.5px',
              boxShadow: '0 4px 14px rgba(57, 69, 224, 0.28)',
            }}
            onClick={handleOpenAdd}
          >
            <i className="bi bi-person-plus-fill"></i> Add New User
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="prod-metric-card prod-metric-total">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="prod-metric-label">Total Users</span>
                <div className="prod-metric-val">{users.length}</div>
              </div>
              <div className="prod-metric-icon prod-icon-blue">
                <i className="bi bi-people-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="prod-metric-card prod-metric-instock">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="prod-metric-label">Active Users</span>
                <div className="prod-metric-val text-success">{activeUsersCount}</div>
              </div>
              <div className="prod-metric-icon prod-icon-green">
                <i className="bi bi-person-check-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="prod-metric-card prod-metric-outstock">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="prod-metric-label">Inactive Users</span>
                <div className="prod-metric-val text-danger">{inactiveUsersCount}</div>
              </div>
              <div className="prod-metric-icon prod-icon-red">
                <i className="bi bi-person-x-fill"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="prod-metric-card prod-metric-featured">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="prod-metric-label">Verified Contact</span>
                <div className="prod-metric-val" style={{ color: '#d97706' }}>{withPhoneCount}</div>
              </div>
              <div className="prod-metric-icon prod-icon-amber">
                <i className="bi bi-shield-check"></i>
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
                placeholder="Search by name, email, or mobile number..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses ({users.length})</option>
              <option value="active">Active Accounts ({activeUsersCount})</option>
              <option value="inactive">Inactive Accounts ({inactiveUsersCount})</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-6 col-md-2 d-flex justify-content-end">
            {(searchTerm || statusFilter !== 'all') ? (
              <button
                type="button"
                className="btn btn-light border btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-1 py-2 text-secondary fw-semibold"
                style={{ borderRadius: '10px' }}
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              >
                <i className="bi bi-arrow-counterclockwise"></i> Reset
              </button>
            ) : (
              <div className="text-muted small text-end w-100 pe-1">
                <span className="fw-semibold text-dark">{filteredUsers.length}</span> users
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="prod-table-container mb-4">
        {/* Users Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '6%' }} className="text-center">S.No</th>
                <th style={{ width: '28%' }}>Name</th>
                <th style={{ width: '24%' }}>Email</th>
                <th style={{ width: '18%' }}>Mobile</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '12%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-2 text-secondary opacity-50"></i>
                    {searchTerm || statusFilter !== 'all'
                      ? 'No users match your active search or filter.'
                      : 'No users registered in the database yet.'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => {
                  const isActive = isUserActive(user.status);
                  const userName = user.name || 'Unnamed User';
                  const userEmail = user.email || 'No email';
                  const userMobile = user.mobile
                    ? (user.mobile.startsWith('+91') ? user.mobile : `+91 ${user.mobile}`)
                    : 'N/A';
                  const userIdStr = user._id ? String(user._id).slice(-6) : 'N/A';
                  const userImg = getUserImgSrc(user.picture);

                  return (
                    <tr key={user._id || index}>
                      {/* S.No */}
                      <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                        {startIndex + index + 1}
                      </td>

                      {/* Name */}
                      <td>
                        <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                          {userImg ? (
                            <img
                              src={userImg}
                              alt={userName}
                              className="rounded-circle flex-shrink-0 border shadow-xs"
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3945E0&color=fff&size=128&bold=true`;
                              }}
                            />
                          ) : (
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3945E0&color=fff&size=128&bold=true`}
                              alt={userName}
                              className="rounded-circle flex-shrink-0 border shadow-xs"
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <strong className="text-dark d-block text-capitalize" style={{ fontSize: '14px', lineHeight: '1.2' }}>
                              {userName}
                            </strong>
                            <small className="text-muted" style={{ fontSize: '11px' }}>
                              ID: {userIdStr}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span className="text-dark" style={{ fontSize: '13.5px' }}>
                          {userEmail}
                        </span>
                      </td>

                      {/* Mobile */}
                      <td>
                        <span className="text-muted" style={{ fontSize: '13.5px' }}>
                          {userMobile}
                        </span>
                      </td>

                      {/* Status Toggle Button */}
                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm px-2.5 py-1 rounded-pill ${
                            isActive
                              ? 'btn-outline-success bg-success-subtle text-success'
                              : 'btn-outline-secondary bg-light text-muted'
                          }`}
                          style={{ fontSize: '11.5px', fontWeight: '500' }}
                          onClick={() => handleToggleStatus(user)}
                          title={`Click to mark as ${isActive ? 'Inactive' : 'Active'}`}
                        >
                          <i className={`bi ${isActive ? 'bi-check-circle-fill' : 'bi-dash-circle'} me-1`}></i>
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <div className="d-inline-flex gap-1.5">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-2 p-1 px-2"
                            onClick={() => handleOpenEdit(user)}
                            title="Edit User"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-2 p-1 px-2"
                            onClick={() => openDeleteModal(user)}
                            title="Delete User"
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

        {/* Table Footer with Premium SaaS Pagination */}
        {!loading && totalItems > 0 && (
          <div className="prod-table-footer">
            {/* Left Section: Info & Rows Per Page */}
            <div className="prod-footer-left">
              <div className="prod-showing-pill">
                <i className="bi bi-layers-half text-primary"></i>
                <span>
                  Showing <strong className="text-dark">{startIndex + 1}&ndash;{endIndex}</strong> of{' '}
                  <strong className="text-dark">{totalItems}</strong> users
                </span>
                {totalItems !== users.length && (
                  <span className="prod-filtered-badge">Filtered</span>
                )}
              </div>

              <div className="prod-rows-selector">
                <span className="prod-rows-label">Per page</span>
                <div className="prod-custom-select-wrap">
                  <select
                    id="usersPerPageSelect"
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
                  {activeUsersCount} Active
                </span>
                <span className="prod-chip prod-chip-featured">
                  <span className="prod-chip-indicator bg-danger"></span>
                  {inactiveUsersCount} Inactive
                </span>
              </div>
            </div>

            {/* Right Section: Pagination Nav Controls */}
            <div className="prod-footer-right">
              <div className="prod-page-counter-badge d-none d-sm-inline-flex">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
              </div>

              {totalPages > 1 && (
                <nav className="prod-pagination-cluster" aria-label="Users table pagination">
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

      {/* ADD / EDIT USER MODAL */}
      {isModalOpen && (
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
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-start" style={{ borderRadius: '20px' }}>
              {/* Modal Header */}
              <div className="modal-header border-0 pb-0 px-4 pt-4 d-flex align-items-start justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm flex-shrink-0"
                    style={{
                      width: '44px',
                      height: '44px',
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                      fontSize: '20px',
                    }}
                  >
                    <i className={`bi ${editingUser ? 'bi-person-gear' : 'bi-person-plus-fill'}`}></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '18px', letterSpacing: '-0.3px' }}>
                      {editingUser ? 'Edit User Details' : 'Add New User'}
                    </h5>
                    <p className="text-muted small mb-0 mt-0.5" style={{ fontSize: '12.5px' }}>
                      {editingUser ? 'Update account info, credentials and active status' : 'Fill in the details to create a new user account'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 p-0 shadow-none flex-shrink-0"
                  style={{ width: '32px', height: '32px', color: '#64748b' }}
                  aria-label="Close"
                  onClick={handleCloseModal}
                >
                  <i className="bi bi-x-lg" style={{ fontSize: '12px' }}></i>
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4 py-3 d-flex flex-column gap-3">
                  {/* Profile Photo Upload Card */}
                  <div
                    className="p-3 rounded-3 d-flex align-items-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div className="position-relative flex-shrink-0">
                      {picturePreview ? (
                        <img
                          src={picturePreview}
                          alt="Preview"
                          className="rounded-circle shadow-sm"
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            border: '3px solid #ffffff',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                          style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #3945E0 0%, #6366f1 100%)',
                            fontSize: '22px',
                            border: '3px solid #ffffff',
                          }}
                        >
                          {formData.name ? formData.name.charAt(0).toUpperCase() : <i className="bi bi-person"></i>}
                        </div>
                      )}
                      <button
                        type="button"
                        className="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center border-2 border-white shadow-xs"
                        style={{ width: '22px', height: '22px', fontSize: '10px', backgroundColor: '#3945E0' }}
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload photo"
                      >
                        <i className="bi bi-camera-fill"></i>
                      </button>
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                        Profile Photo <span className="text-muted fw-normal small">(optional)</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '11.5px', marginBottom: '6px' }}>
                        Supports JPG, PNG or WEBP (Max 5MB)
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="d-none"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setPictureFile(file);
                              setPicturePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-white bg-white border py-1 px-2.5 rounded-2 d-inline-flex align-items-center gap-1.5 shadow-xs fw-medium text-dark"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ fontSize: '12px' }}
                        >
                          <i className="bi bi-camera text-primary"></i> {picturePreview ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        {picturePreview && (
                          <button
                            type="button"
                            className="btn btn-sm btn-link text-danger p-0 text-decoration-none fw-medium"
                            onClick={() => {
                              setPictureFile(null);
                              setPicturePreview('');
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            style={{ fontSize: '12px' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Name Field */}
                  <div>
                    <label className="form-label fw-semibold small text-dark mb-1">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted ps-3 pe-2" style={{ borderColor: '#cbd5e1', borderRadius: '10px 0 0 10px' }}>
                        <i className="bi bi-person text-secondary"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-1 shadow-none"
                        style={{ borderColor: '#cbd5e1', borderRadius: '0 10px 10px 0', height: '42px', fontSize: '13.5px' }}
                        placeholder="e.g. Karan Singh"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Address Field */}
                  <div>
                    <label className="form-label fw-semibold small text-dark mb-1">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted ps-3 pe-2" style={{ borderColor: '#cbd5e1', borderRadius: '10px 0 0 10px' }}>
                        <i className="bi bi-envelope text-secondary"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-1 shadow-none"
                        style={{ borderColor: '#cbd5e1', borderRadius: '0 10px 10px 0', height: '42px', fontSize: '13.5px' }}
                        placeholder="e.g. karan@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number Field */}
                  <div>
                    <label className="form-label fw-semibold small text-dark mb-1">
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span
                        className="input-group-text bg-light border-end-0 text-dark fw-bold ps-3 pe-2.5 d-flex align-items-center gap-1.5"
                        style={{ borderColor: '#cbd5e1', borderRadius: '10px 0 0 10px' }}
                      >
                        <i className="bi bi-telephone text-secondary me-0.5"></i>
                        <span className="badge bg-white text-dark border py-1 px-1.5 rounded-2 fw-bold" style={{ fontSize: '12px', letterSpacing: '0.2px' }}>
                          🇮🇳 +91
                        </span>
                      </span>
                      <input
                        type="tel"
                        className="form-control border-start-0 ps-2 shadow-none"
                        style={{ borderColor: '#cbd5e1', borderRadius: '0 10px 10px 0', height: '42px', fontSize: '13.5px' }}
                        placeholder="98765 43210"
                        maxLength="15"
                        value={formData.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/^\+91\s*/, '').replace(/[^0-9\s-]/g, '');
                          setFormData({ ...formData, mobile: val });
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <label className="form-label fw-semibold small text-dark mb-0">
                        {editingUser ? 'New Password' : 'Password'} {!editingUser && <span className="text-danger">*</span>}
                      </label>
                      {editingUser && (
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                          Leave empty to keep unchanged
                        </span>
                      )}
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted ps-3 pe-2" style={{ borderColor: '#cbd5e1', borderRadius: '10px 0 0 10px' }}>
                        <i className="bi bi-lock text-secondary"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-1 shadow-none"
                        style={{ borderColor: '#cbd5e1', height: '42px', fontSize: '13.5px' }}
                        placeholder={editingUser ? 'Enter new password...' : 'Create account password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                      />
                      <button
                        type="button"
                        className="input-group-text bg-light border-start-0 text-muted px-3 shadow-none"
                        style={{ borderColor: '#cbd5e1', borderRadius: '0 10px 10px 0', cursor: 'pointer' }}
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-secondary`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Account Status Field */}
                  <div>
                    <label className="form-label fw-semibold small text-dark mb-1">
                      Account Status
                    </label>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className={`btn flex-fill py-2 px-3 rounded-3 d-flex align-items-center justify-content-center gap-2 border ${formData.status === 'active' ? 'btn-success text-white fw-semibold border-success shadow-xs' : 'btn-light text-muted border-light-subtle'}`}
                        style={{ fontSize: '13.5px', transition: 'all 0.15s ease' }}
                        onClick={() => setFormData({ ...formData, status: 'active' })}
                      >
                        <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: formData.status === 'active' ? '#ffffff' : '#22c55e' }}></span>
                        Active
                      </button>
                      <button
                        type="button"
                        className={`btn flex-fill py-2 px-3 rounded-3 d-flex align-items-center justify-content-center gap-2 border ${formData.status === 'inactive' ? 'btn-danger text-white fw-semibold border-danger shadow-xs' : 'btn-light text-muted border-light-subtle'}`}
                        style={{ fontSize: '13.5px', transition: 'all 0.15s ease' }}
                        onClick={() => setFormData({ ...formData, status: 'inactive' })}
                      >
                        <span className="rounded-circle d-inline-block" style={{ width: '8px', height: '8px', backgroundColor: formData.status === 'inactive' ? '#ffffff' : '#ef4444' }}></span>
                        Inactive
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer border-top py-3 px-4 d-flex justify-content-end gap-2 bg-light bg-opacity-50">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3.5 py-2 rounded-3 fw-medium"
                    onClick={handleCloseModal}
                    disabled={modalLoading}
                    style={{ fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 py-2 rounded-3 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
                    style={{
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                      border: 'none',
                      fontSize: '13px',
                    }}
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Saving...
                      </>
                    ) : editingUser ? (
                      <>
                        <i className="bi bi-check2-circle"></i> Update User
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle"></i> Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
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
                <h5 className="modal-title fw-bold text-dark mb-2">Delete User?</h5>
                <p className="text-muted small mb-3">
                  Are you sure you want to permanently delete user <strong className="text-dark">"{deleteModal.name}"</strong>{deleteModal.email ? ` (${deleteModal.email})` : ''}? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer border-0 bg-light p-3 px-4 d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-3.5 py-2 fw-medium rounded-3"
                  disabled={Boolean(deletingId)}
                  onClick={() => setDeleteModal({ show: false, id: null, name: '', email: '' })}
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
                      <span>Yes, Delete User</span>
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

export default UsersList;
