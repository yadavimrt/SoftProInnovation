import React, { useState, useEffect } from 'react';
import axios from 'axios';

const isUserActive = (status) => {
  if (status === false || status === 'inactive' || status === 'Inactive' || status === 0) {
    return false;
  }
  return true;
};

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State for Add / Edit User
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    status: 'active',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // In-App Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '', email: '' });
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/user/show');
      if (Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      showAlert('danger', 'Failed to load users from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 3000);
  };

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
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      password: '',
      status: isUserActive(user.status) ? 'active' : 'inactive',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
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
      if (editingUser) {
        // Update user
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          status: formData.status,
        };
        if (formData.password.trim()) {
          updatePayload.password = formData.password;
        }

        const res = await axios.put(`http://localhost:5000/api/user/update/${editingUser._id}`, updatePayload);
        if (res.data) {
          showAlert('success', 'User updated successfully!');
          fetchUsers();
          handleCloseModal();
        }
      } else {
        // Add new user
        const res = await axios.post('http://localhost:5000/api/user/register', formData);
        if (res.data?.success || res.status === 201) {
          showAlert('success', 'New user added successfully!');
          fetchUsers();
          handleCloseModal();
        } else {
          showAlert('danger', res.data?.message || 'Failed to add user');
        }
      }
    } catch (err) {
      console.error('Error saving user:', err);
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
      await axios.patch(`http://localhost:5000/api/user/patch/${user._id}`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
      );
      showAlert('success', `User status updated to ${newStatus}!`);
    } catch (err) {
      console.error('Failed to update status', err);
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
      const res = await axios.delete(`http://localhost:5000/api/user/delete/${targetId}`);
      showAlert('success', res.data?.message || `User "${targetName}" has been deleted.`);
      setDeleteModal({ show: false, id: null, name: '', email: '' });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user with DELETE, trying POST fallback:', err);
      try {
        const fallbackRes = await axios.post(`http://localhost:5000/api/user/delete/${targetId}`);
        showAlert('success', fallbackRes.data?.message || `User "${targetName}" has been deleted.`);
        setDeleteModal({ show: false, id: null, name: '', email: '' });
        fetchUsers();
      } catch (fallbackErr) {
        const errMsg = fallbackErr.response?.data?.message || err.response?.data?.message || 'Failed to delete user.';
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

  const activeUsersCount = users.filter((u) => isUserActive(u.status)).length;
  const inactiveUsersCount = users.filter((u) => !isUserActive(u.status)).length;

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
          <h1 className="dashboard-header-title mb-1">
            User <span>Management</span>
          </h1>
          <p className="dashboard-subtitle mb-0">
            View, search, edit, manage permissions and registered users
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 fw-semibold rounded-3 shadow-sm align-self-start align-self-md-auto"
          style={{ backgroundColor: '#3945E0', border: 'none' }}
          onClick={handleOpenAdd}
        >
          <i className="bi bi-person-plus-fill"></i> Add New User
        </button>
      </div>

      {/* Users Management Section */}
      <div className="dashboard-section p-4" style={{ borderRadius: '18px' }}>
        {/* Search & Filters Header */}
        <div className="row g-3 align-items-center mb-4 pb-2 border-bottom">
          <div className="col-12 col-md-8">
            <div className="position-relative">
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search users by name, email, or mobile number..."
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
              <option value="all">All Users ({users.length})</option>
              <option value="active">Active Users ({activeUsersCount})</option>
              <option value="inactive">Inactive Users ({inactiveUsersCount})</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '6%' }} className="text-center">S.No</th>
                <th style={{ width: '25%' }}>Name</th>
                <th style={{ width: '25%' }}>Email</th>
                <th style={{ width: '18%' }}>Mobile</th>
                <th style={{ width: '14%' }}>Status</th>
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
                filteredUsers.map((user, index) => {
                  const isActive = isUserActive(user.status);
                  const userName = user.name || 'Unnamed User';
                  const userInitial = userName.charAt(0).toUpperCase();
                  const userEmail = user.email || 'No email';
                  const userMobile = user.mobile || 'N/A';
                  const userIdStr = user._id ? String(user._id).slice(-6) : 'N/A';

                  return (
                    <tr key={user._id || index}>
                      {/* S.No */}
                      <td className="text-center text-muted fw-semibold" style={{ fontSize: '13px' }}>
                        {index + 1}
                      </td>

                      {/* Name */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: '#3945E0',
                              fontSize: '14px',
                            }}
                          >
                            {userInitial}
                          </div>
                          <div>
                            <strong className="text-dark d-block" style={{ fontSize: '14.5px' }}>
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
                            <i className="bi bi-pencil"></i>
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
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-start">
              {/* Modal Header */}
              <div className="modal-header bg-light py-3 px-4 border-bottom">
                <h5 className="modal-title fw-bold text-dark mb-0" style={{ fontSize: '16px' }}>
                  {editingUser ? 'Edit User Details' : 'Add New User'}
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  aria-label="Close"
                  onClick={handleCloseModal}
                ></button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 d-flex flex-column gap-3">
                  <div>
                    <label className="form-label fw-semibold small text-muted mb-1">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label fw-semibold small text-muted mb-1">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. user@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label fw-semibold small text-muted mb-1">
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9876543210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label fw-semibold small text-muted mb-1">
                      {editingUser ? 'New Password (leave empty to keep unchanged)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder={editingUser ? 'Enter new password...' : 'Create account password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>

                  <div>
                    <label className="form-label fw-semibold small text-muted mb-1">
                      Account Status
                    </label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-light border-top py-2.5 px-4 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light btn-sm px-3"
                    onClick={handleCloseModal}
                    disabled={modalLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 fw-semibold"
                    style={{ backgroundColor: '#3945E0', border: 'none' }}
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Saving...
                      </>
                    ) : editingUser ? (
                      'Update User'
                    ) : (
                      'Create User'
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
