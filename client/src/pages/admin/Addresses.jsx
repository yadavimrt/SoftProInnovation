import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    mobile: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    addressType: 'Home',
    status: 'active',
    isdefault: 'no'
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/address/show');
      if (Array.isArray(res.data)) {
        setAddresses(res.data);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      showAlert('danger', 'Failed to fetch address records from server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user/show');
      if (Array.isArray(res.data)) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch users list:', err);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      user_id: usersList.length > 0 ? usersList[0]._id : '',
      name: '',
      mobile: '',
      pincode: '',
      locality: '',
      address: '',
      city: '',
      state: '',
      landmark: '',
      addressType: 'Home',
      status: 'active',
      isdefault: 'no'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    const userIdVal = typeof addr.user_id === 'object' && addr.user_id ? addr.user_id._id : addr.user_id || '';
    setFormData({
      user_id: userIdVal,
      name: addr.name || '',
      mobile: addr.mobile || '',
      pincode: addr.pincode || '',
      locality: addr.locality || addr.localiy || '',
      address: addr.address || addr.Address || '',
      city: addr.city || '',
      state: addr.state || '',
      landmark: addr.landmark || '',
      addressType: addr.addressType || 'Home',
      status: addr.status || 'active',
      isdefault: addr.isdefault || 'no'
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked ? 'yes' : 'no' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.name || !formData.mobile || !formData.pincode || !formData.locality || !formData.address || !formData.city || !formData.state) {
      showAlert('danger', 'Please fill in all mandatory fields.');
      return;
    }

    setModalLoading(true);
    try {
      if (editingAddress) {
        const res = await axios.put(`http://localhost:5000/api/address/update/${editingAddress._id}`, formData);
        if (res.data.success) {
          showAlert('success', 'Address updated successfully!');
          setIsModalOpen(false);
          fetchAddresses();
        } else {
          showAlert('danger', res.data.message || 'Failed to update address');
        }
      } else {
        const res = await axios.post('http://localhost:5000/api/address/add', formData);
        if (res.data.success) {
          showAlert('success', 'New address added successfully!');
          setIsModalOpen(false);
          fetchAddresses();
        } else {
          showAlert('danger', res.data.message || 'Failed to add address');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      showAlert('danger', err.response?.data?.message || 'Server error saving address.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id, recipientName) => {
    if (window.confirm(`Are you sure you want to delete address for "${recipientName || 'this user'}"?`)) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/address/delete/${id}`);
        if (res.data.success) {
          showAlert('success', 'Address deleted successfully!');
          fetchAddresses();
        }
      } catch (err) {
        console.error('Delete error:', err);
        showAlert('danger', 'Failed to delete address.');
      }
    }
  };

  const handleToggleDefault = async (addr) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/address/set-default/${addr._id}`);
      if (res.data.success) {
        showAlert('success', 'Default address set!');
        fetchAddresses();
      }
    } catch (err) {
      console.error('Error toggling default:', err);
      showAlert('danger', 'Failed to update default address.');
    }
  };

  // Filtered List
  const filteredAddresses = addresses.filter(item => {
    const userName = typeof item.user_id === 'object' && item.user_id ? item.user_id.name : '';
    const userEmail = typeof item.user_id === 'object' && item.user_id ? item.user_id.email : '';

    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (String(item.mobile) || '').includes(searchTerm) ||
      (item.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.pincode || '').includes(searchTerm) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || (item.addressType || 'Home').toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="container-fluid py-4 px-4">
      {/* Header & Title */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Address Management</h3>
          <p className="text-secondary mb-0">View, search, update, or remove user delivery addresses across the system.</p>
        </div>
        <button className="btn btn-primary fw-semibold px-4 py-2 rounded-pill shadow-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-lg me-2"></i>Add Address
        </button>
      </div>

      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm border-0`} role="alert">
          <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert({ show: false, type: '', message: '' })}></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <i className="bi bi-geo-alt-fill fs-4"></i>
              </div>
              <div>
                <h6 className="text-secondary mb-1 small fw-bold text-uppercase">Total Addresses</h6>
                <h4 className="fw-bold text-dark mb-0">{addresses.length}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <i className="bi bi-check-circle-fill fs-4"></i>
              </div>
              <div>
                <h6 className="text-secondary mb-1 small fw-bold text-uppercase">Active Addresses</h6>
                <h4 className="fw-bold text-dark mb-0">{addresses.filter(a => a.status === 'active').length}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-info bg-opacity-10 text-info rounded-circle">
                <i className="bi bi-star-fill fs-4"></i>
              </div>
              <div>
                <h6 className="text-secondary mb-1 small fw-bold text-uppercase">Default Addresses</h6>
                <h4 className="fw-bold text-dark mb-0">{addresses.filter(a => a.isdefault === 'yes').length}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle">
                <i className="bi bi-house-fill fs-4"></i>
              </div>
              <div>
                <h6 className="text-secondary mb-1 small fw-bold text-uppercase">Home vs Work</h6>
                <h4 className="fw-bold text-dark mb-0">
                  {addresses.filter(a => (a.addressType || 'Home').toLowerCase() === 'home').length} / {addresses.filter(a => (a.addressType || '').toLowerCase() === 'work').length}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                  <i className="bi bi-search text-secondary"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 rounded-end-pill"
                  placeholder="Search by name, user, phone, city, state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-6 col-md-3">
              <select className="form-select bg-light rounded-pill" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="col-6 col-md-3">
              <select className="form-select bg-light rounded-pill" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Address Types</option>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Fetching address data...</p>
            </div>
          ) : filteredAddresses.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="mt-2 text-muted fw-semibold">No address records match your criteria.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-secondary text-uppercase fw-bold" style={{ fontSize: '12px' }}>
                  <tr>
                    <th className="ps-4">Recipient / Phone</th>
                    <th>Associated User</th>
                    <th>Address Details</th>
                    <th>City / State</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {filteredAddresses.map((addr) => {
                    const userName = typeof addr.user_id === 'object' && addr.user_id ? addr.user_id.name : 'N/A';
                    const userEmail = typeof addr.user_id === 'object' && addr.user_id ? addr.user_id.email : '';
                    const isDefault = addr.isdefault === 'yes';

                    return (
                      <tr key={addr._id}>
                        {/* Recipient */}
                        <td className="ps-4">
                          <div className="fw-bold text-dark">{addr.name}</div>
                          <div className="small text-secondary"><i className="bi bi-telephone me-1"></i>{addr.mobile}</div>
                        </td>

                        {/* Associated User */}
                        <td>
                          <div className="fw-semibold text-primary">{userName}</div>
                          {userEmail && <div className="small text-muted">{userEmail}</div>}
                        </td>

                        {/* Address Details */}
                        <td style={{ maxWidth: '240px' }}>
                          <div className="text-truncate fw-medium text-dark">{addr.address || addr.Address}</div>
                          <div className="small text-secondary">{addr.locality || addr.localiy}{addr.landmark ? ` (Near ${addr.landmark})` : ''}</div>
                        </td>

                        {/* Location */}
                        <td>
                          <div className="fw-semibold text-dark">{addr.city}, {addr.state}</div>
                          <div className="small text-muted">PIN: {addr.pincode}</div>
                        </td>

                        {/* Type */}
                        <td>
                          <span className={`badge ${ (addr.addressType || 'Home').toLowerCase() === 'home' ? 'bg-info text-dark' : 'bg-secondary' } rounded-pill px-2.5 py-1`}>
                            {addr.addressType || 'Home'}
                          </span>
                        </td>

                        {/* Default */}
                        <td>
                          {isDefault ? (
                            <span className="badge bg-success rounded-pill px-2.5 py-1">DEFAULT</span>
                          ) : (
                            <button className="btn btn-xs btn-outline-secondary rounded-pill py-0 px-2" style={{ fontSize: '11px' }} onClick={() => handleToggleDefault(addr)}>
                              Make Default
                            </button>
                          )}
                        </td>

                        {/* Status */}
                        <td>
                          <span className={`badge ${addr.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'} rounded-pill px-2.5 py-1 fw-bold`}>
                            {addr.status || 'active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-light text-primary border rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleOpenEdit(addr)}
                              title="Edit Address"
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-light text-danger border rounded-circle"
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => handleDelete(addr._id, addr.name)}
                              title="Delete Address"
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-primary text-white rounded-top-4 px-4">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${editingAddress ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                  {editingAddress ? 'Edit User Address' : 'Add New Address'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    {/* User Selection */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">Assign to User <span className="text-danger">*</span></label>
                      <select
                        className="form-select rounded-3"
                        name="user_id"
                        value={formData.user_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">-- Select User --</option>
                        {usersList.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.email || u.mobile || 'No Email'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Recipient Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">Recipient Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Mobile */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">Mobile Number <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Pincode */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">Pincode <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Locality */}
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark">Locality / Area <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="locality"
                        value={formData.locality}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Street Address */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">Street Address <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control rounded-3"
                        rows="2"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>

                    {/* City */}
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark">City <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* State */}
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark">State <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Landmark */}
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark">Landmark</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="landmark"
                        value={formData.landmark}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Address Type */}
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark">Address Type</label>
                      <select className="form-select rounded-3" name="addressType" value={formData.addressType} onChange={handleInputChange}>
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold text-dark">Status</label>
                      <select className="form-select rounded-3" name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Is Default */}
                    <div className="col-12 col-md-4 d-flex align-items-center pt-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="adminIsDefaultCheck"
                          name="isdefault"
                          checked={formData.isdefault === 'yes'}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label fw-semibold text-dark" htmlFor="adminIsDefaultCheck">
                          Default Address
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light rounded-bottom-4 px-4">
                  <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold" disabled={modalLoading}>
                    {modalLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Create Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAddresses;
