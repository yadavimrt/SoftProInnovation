import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // User Profile State
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [picture, setPicture] = useState('');
  const [pictureFile, setPictureFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Address in Personal Details
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [streetAddress, setStreetAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  // Saved Addresses Management State
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressSubmitLoading, setAddressSubmitLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '', address: '' });
  const [deletingId, setDeletingId] = useState(null);

  const [addressFormData, setAddressFormData] = useState({
    name: '',
    mobile: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    addressType: 'Home',
    isdefault: 'no'
  });

  // Page active tab & status
  const tabParam = searchParams.get('tab');
  const validTab = tabParam && ['profile', 'orders', 'addresses', 'reviews', 'wishlist'].includes(tabParam) ? tabParam : null;
  const [activeTab, setActiveTab] = useState(validTab || 'profile');
  const [prevTabParam, setPrevTabParam] = useState(validTab);
  if (validTab !== prevTabParam) {
    setPrevTabParam(validTab);
    setActiveTab(validTab || 'profile');
  }

  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4500);
  };

  const fetchUserProfile = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/profile/${userId}`);
      if (res.data && res.data.user) {
        const u = res.data.user;
        setUser(u);
        setFullName(u.name || '');
        setEmail(u.email || '');
        setMobile(u.mobile || '');
        setPicture(u.picture || '');
      }
    } catch {
      // Ignore network errors on background refresh
    }
  };

  const fetchUserAddresses = async (userId) => {
    setAddressesLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/address/user/${userId}`);
      let list = [];
      if (res.data && res.data.addresses) {
        list = res.data.addresses;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      }
      setAddresses(list);

      // Pre-fill primary address in personal details form
      const def = list.find((a) => a.isdefault === 'yes') || list[0];
      if (def) {
        setDefaultAddressId(def._id);
        setStreetAddress(def.address || def.Address || '');
        setLocality(def.locality || def.localiy || '');
        setCity(def.city || '');
        setStateName(def.state || '');
        setPincode(def.pincode || '');
      }
    } catch {
      // Handled gracefully in UI
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchUserOrders = async (userId) => {
    setOrdersLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/order/user/${userId}`);
      setOrders(res.data?.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };


  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedName = localStorage.getItem('name');
    const storedAdminId = localStorage.getItem('adminId');
    const storedUser = localStorage.getItem('user');

    if (!storedToken && !storedName && !storedAdminId) {
      navigate('/login');
      return;
    }

    const initProfile = async () => {
      try {
        // Guarantee fetching the exact profile for the active session (Admin or User)
        const res = await axios.get(`${API_BASE_URL}/api/user/current-user`, {
          headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
          params: {
            adminId: storedAdminId || undefined,
            name: storedName || undefined,
            role: storedRole || undefined
          }
        });

        if (res.data && res.data.user) {
          const u = res.data.user;
          setUser(u);
          setFullName(u.name || '');
          setEmail(u.email || '');
          setMobile(u.mobile || '');
          setPicture(u.picture || '');

          // Update localStorage to stay cleanly synced across the whole app
          localStorage.setItem('user', JSON.stringify(u));
          localStorage.setItem('name', u.name);
          if (u.picture) {
            localStorage.setItem('picture', u.picture);
          } else {
            localStorage.removeItem('picture');
          }
          window.dispatchEvent(new Event('userSessionChange'));

          fetchUserAddresses(u._id);
          return;
        }
      } catch {
        // Fallback to local storage below
      }

      // Fallback to local storage if API call fails
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setFullName(parsedUser.name || '');
          setEmail(parsedUser.email || '');
          setMobile(parsedUser.mobile || '');
          setPicture(parsedUser.picture || '');

          const userId = parsedUser._id || parsedUser.id;
          if (userId) {
            fetchUserProfile(userId);
            fetchUserAddresses(userId);
          }
        } catch {
          // Ignore invalid JSON in storage
        }
      }
    };

    initProfile();
  }, [navigate]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (activeTab === 'orders' && userId) fetchUserOrders(userId);
  }, [activeTab, user?._id, user?.id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('danger', 'Please choose a valid image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert('danger', 'Image size should be less than 5MB.');
      return;
    }

    setPictureFile(file);
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);

    // Auto-upload immediately to server so profile picture is saved permanently to MongoDB
    const userId = user?._id || user?.id || localStorage.getItem('adminId');
    if (!userId) {
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('picture', file);
      if (fullName) formData.append('name', fullName.trim());
      if (email) formData.append('email', email.trim());
      if (mobile) formData.append('mobile', mobile.trim());

      const res = await axios.put(`${API_BASE_URL}/api/user/profile/${userId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.user) {
        const updatedUserData = res.data.user;
        setUser(updatedUserData);
        setPicture(updatedUserData.picture || '');
        setPictureFile(null);
        setPreviewUrl('');

        localStorage.setItem('user', JSON.stringify(updatedUserData));
        if (updatedUserData.name) localStorage.setItem('name', updatedUserData.name);
        if (updatedUserData.picture) {
          localStorage.setItem('picture', updatedUserData.picture);
        } else {
          localStorage.removeItem('picture');
        }
        window.dispatchEvent(new Event('userSessionChange'));

        showAlert('success', 'Profile picture uploaded and saved successfully!');
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Failed to auto-upload image. Please click Save Profile below.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Personal Details & Address
  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showAlert('danger', 'Full Name is required.');
      return;
    }
    if (!email.trim()) {
      showAlert('danger', 'Email address is required.');
      return;
    }

    setSaving(true);
    const userId = user?._id || user?.id;

    try {
      let updatedUserData = null;

      if (pictureFile) {
        const formData = new FormData();
        formData.append('name', fullName.trim());
        formData.append('email', email.trim());
        formData.append('mobile', mobile.trim());
        formData.append('picture', pictureFile);

        const res = await axios.put(`${API_BASE_URL}/api/user/profile/${userId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updatedUserData = res.data.user;
      } else {
        const res = await axios.put(`${API_BASE_URL}/api/user/profile/${userId}`, {
          name: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim()
        });
        updatedUserData = res.data.user;
      }

      if (updatedUserData) {
        setUser(updatedUserData);
        setFullName(updatedUserData.name || '');
        setEmail(updatedUserData.email || '');
        setMobile(updatedUserData.mobile || '');
        setPicture(updatedUserData.picture || '');
        setPictureFile(null);
        setPreviewUrl('');

        localStorage.setItem('user', JSON.stringify(updatedUserData));
        localStorage.setItem('name', updatedUserData.name);
        if (updatedUserData.picture) {
          localStorage.setItem('picture', updatedUserData.picture);
        } else {
          localStorage.removeItem('picture');
        }
        window.dispatchEvent(new Event('userSessionChange'));
      }

      // Handle Address saving if address fields are provided
      if (streetAddress.trim() || city.trim() || pincode.trim()) {
        const addressPayload = {
          name: fullName.trim(),
          mobile: mobile.trim() || '9999999999',
          address: streetAddress.trim() || 'Address Details',
          locality: locality.trim() || city.trim() || 'Locality',
          city: city.trim() || 'City',
          state: stateName.trim() || 'State',
          pincode: pincode.trim() || '000000',
          addressType: 'Home',
          isdefault: 'yes',
          user_id: userId
        };

        if (defaultAddressId) {
          await axios.put(`${API_BASE_URL}/api/address/update/${defaultAddressId}`, addressPayload);
        } else {
          const addRes = await axios.post(`${API_BASE_URL}/api/address/add`, addressPayload);
          if (addRes.data && addRes.data.address) {
            setDefaultAddressId(addRes.data.address._id);
          }
        }
        if (userId) fetchUserAddresses(userId);
      }

      showAlert('success', 'Profile and Address details saved successfully!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update details.';
      showAlert('danger', errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Address Modal Handlers
  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setAddressFormData({
      name: fullName || user?.name || '',
      mobile: mobile || user?.mobile || '',
      pincode: '',
      locality: '',
      address: '',
      city: '',
      state: '',
      landmark: '',
      addressType: 'Home',
      isdefault: addresses.length === 0 ? 'yes' : 'no'
    });
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddressId(addr._id);
    setAddressFormData({
      name: addr.name || '',
      mobile: addr.mobile || '',
      pincode: addr.pincode || '',
      locality: addr.locality || addr.localiy || '',
      address: addr.address || addr.Address || '',
      city: addr.city || '',
      state: addr.state || '',
      landmark: addr.landmark || '',
      addressType: addr.addressType || 'Home',
      isdefault: addr.isdefault || 'no'
    });
    setShowAddressModal(true);
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setAddressFormData((prev) => ({ ...prev, [name]: checked ? 'yes' : 'no' }));
    } else {
      setAddressFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitAddressForm = async (e) => {
    e.preventDefault();
    if (
      !addressFormData.name ||
      !addressFormData.mobile ||
      !addressFormData.pincode ||
      !addressFormData.locality ||
      !addressFormData.address ||
      !addressFormData.city ||
      !addressFormData.state
    ) {
      showAlert('danger', 'Please fill in all mandatory address fields.');
      return;
    }

    const userId = user?._id || user?.id;
    setAddressSubmitLoading(true);

    try {
      if (editingAddressId) {
        const res = await axios.put(`${API_BASE_URL}/api/address/update/${editingAddressId}`, {
          ...addressFormData,
          user_id: userId
        });
        if (res.data.success) {
          showAlert('success', 'Address updated successfully!');
          setShowAddressModal(false);
          fetchUserAddresses(userId);
        } else {
          showAlert('danger', res.data.message || 'Failed to update address');
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/address/add`, {
          ...addressFormData,
          user_id: userId
        });
        if (res.data.success) {
          showAlert('success', 'New address added successfully!');
          setShowAddressModal(false);
          fetchUserAddresses(userId);
        } else {
          showAlert('danger', res.data.message || 'Failed to add address');
        }
      }
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Error saving address.');
    } finally {
      setAddressSubmitLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    const userId = user?._id || user?.id;
    try {
      const res = await axios.patch(`${API_BASE_URL}/api/address/default/${addrId}`, {
        user_id: userId
      });
      if (res.data.success) {
        showAlert('success', 'Default shipping address updated!');
        fetchUserAddresses(userId);
      }
    } catch {
      showAlert('danger', 'Failed to set default address.');
    }
  };

  const openDeleteModal = (addr) => {
    setDeleteModal({
      show: true,
      id: addr._id,
      name: addr.name || 'this address',
      address: `${addr.address || addr.Address || ''}, ${addr.city || ''}`
    });
  };

  const confirmDeleteAddress = async () => {
    if (!deleteModal.id) return;
    const targetId = deleteModal.id;
    const userId = user?._id || user?.id;
    setDeletingId(targetId);

    try {
      const res = await axios.delete(`${API_BASE_URL}/api/address/delete/${targetId}`);
      if (res.data?.success) {
        showAlert('success', 'Address removed successfully!');
        setDeleteModal({ show: false, id: null, name: '', address: '' });
        if (userId) fetchUserAddresses(userId);
      }
    } catch {
      try {
        const fallbackRes = await axios.post(`${API_BASE_URL}/api/address/delete/${targetId}`);
        showAlert('success', fallbackRes.data?.message || 'Address deleted successfully!');
        setDeleteModal({ show: false, id: null, name: '', address: '' });
        if (userId) fetchUserAddresses(userId);
      } catch {
        showAlert('danger', 'Failed to delete address.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const displayImageSrc = previewUrl || formatImg(picture, '');

  const changeTab = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  return (
    <div className="d-flex flex-column min-vh-100 profile-page-bg">
      <Header />

      <main className="container my-4 my-md-5 flex-grow-1">
        {/* Global Alert Notification */}
        {alert.show && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm border-0 mb-4`} role="alert">
            <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            {alert.message}
            <button type="button" className="btn-close" onClick={() => setAlert({ show: false, type: '', message: '' })}></button>
          </div>
        )}

        <div className="row g-4 g-lg-5">
          {/* Left Column: Profile Sidebar */}
          <div className="col-12 col-md-4 col-lg-3">
            <div className="profile-sidebar-wrapper">
              {/* Avatar Circle */}
              <div className="profile-avatar-outer">
                <div className="profile-avatar-circle position-relative overflow-hidden">
                  {displayImageSrc ? (
                    <img src={displayImageSrc} alt={fullName || 'User'} className="profile-avatar-img" />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      <span className="fw-bold" style={{ fontSize: '14px', letterSpacing: '-0.3px' }}>
                        {fullName || 'User Profile'}
                      </span>
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(2px)' }}
                    >
                      <div className="spinner-border spinner-border-sm text-light mb-1" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 600 }}>Saving...</span>
                    </div>
                  )}
                </div>
                {/* Upload Button */}
                <button
                  type="button"
                  className="profile-avatar-upload-btn"
                  title="Upload profile picture"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  {uploadingAvatar ? (
                    <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }}></span>
                  ) : (
                    <i className="bi bi-camera-fill"></i>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* User Name & Email */}
              <h3 className="profile-user-name">{fullName || 'User'}</h3>
              <p className="profile-user-email">{email || 'No email provided'}</p>

              {/* Navigation Menu */}
              <nav className="profile-nav-menu">
                <button
                  type="button"
                  className={`profile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => changeTab('profile')}
                >
                  <i className="bi bi-person-badge"></i>
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => changeTab('orders')}
                >
                  <i className="bi bi-bag"></i>
                  <span>My Orders</span>
                </button>

                <button
                  type="button"
                  className={`profile-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                  onClick={() => changeTab('addresses')}
                >
                  <i className="bi bi-geo-alt"></i>
                  <span>Saved Addresses</span>
                  {addresses.length > 0 && (
                    <span className="badge bg-dark rounded-pill ms-auto" style={{ fontSize: '10px' }}>
                      {addresses.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  className={`profile-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => changeTab('reviews')}
                >
                  <i className="bi bi-star"></i>
                  <span>My Reviews</span>
                </button>

                <Link
                  to="/wishlist"
                  className="profile-nav-item"
                >
                  <i className="bi bi-heart"></i>
                  <span>My Wishlist</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Right Column: Content Area */}
          <div className="col-12 col-md-8 col-lg-9">
            {/* Top Heading Section */}
            <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h1 className="profile-title-serif">Account Settings</h1>
                <p className="profile-subtitle mb-0">Manage your personal profile, addresses, and preferences.</p>
              </div>
              {activeTab === 'addresses' && (
                <button
                  className="btn btn-dark fw-bold px-3 py-2 rounded-3 shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  onClick={handleOpenAddModal}
                >
                  <i className="bi bi-plus-circle-fill"></i> Add New Address
                </button>
              )}
            </div>

            {/* TAB: Personal Details (My Profile) */}
            {activeTab === 'profile' && (
              <div className="profile-content-card">
                <h2 className="profile-card-title">Personal Details</h2>

                <form onSubmit={handleSubmitProfile}>
                  {/* Full Name */}
                  <div className="mb-4">
                    <label className="profile-field-label">FULL NAME *</label>
                    <input
                      type="text"
                      className="profile-field-input"
                      placeholder="Your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Email & Mobile Row */}
                  <div className="row g-3 g-md-4 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="profile-field-label">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        className="profile-field-input"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="profile-field-label">MOBILE NUMBER</label>
                      <input
                        type="tel"
                        className="profile-field-input"
                        placeholder="Mobile number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Delivery Address Section directly in Personal Details */}
                  <div className="pt-3 pb-2 mb-3 border-top">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span className="profile-field-label mb-0" style={{ fontSize: '12px', color: '#111827' }}>
                        <i className="bi bi-geo-alt-fill me-1 text-danger"></i> DELIVERY ADDRESS DETAILS
                      </span>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-decoration-none p-0 text-primary fw-semibold"
                          onClick={() => changeTab('addresses')}
                        >
                          View all {addresses.length} saved addresses &rarr;
                        </button>
                      )}
                    </div>

                    {/* Street Address */}
                    <div className="mb-3">
                      <label className="profile-field-label">FLAT, HOUSE NO., BUILDING, STREET ADDRESS</label>
                      <input
                        type="text"
                        className="profile-field-input"
                        placeholder="e.g. Flat 402, Sunshine Apartments, Main Road"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                      />
                    </div>

                    {/* Locality & City */}
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="profile-field-label">LOCALITY / AREA</label>
                        <input
                          type="text"
                          className="profile-field-input"
                          placeholder="e.g. Indiranagar or Sector 62"
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="profile-field-label">CITY / DISTRICT</label>
                        <input
                          type="text"
                          className="profile-field-input"
                          placeholder="e.g. Lucknow"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* State & Pincode */}
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="profile-field-label">STATE</label>
                        <input
                          type="text"
                          className="profile-field-input"
                          placeholder="e.g. Uttar Pradesh"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="profile-field-label">PINCODE</label>
                        <input
                          type="text"
                          className="profile-field-input"
                          placeholder="6-digit pincode"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Profile Excellence Button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      className="btn-save-excellence"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          SAVING...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-down fs-6"></i>
                          SAVE PROFILE EXCELLENCE
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: Saved Addresses Management right here */}
            {activeTab === 'addresses' && (
              <div className="profile-content-card">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                  <h2 className="profile-card-title mb-0 border-0 p-0">Saved Addresses</h2>
                  <button
                    className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-semibold"
                    onClick={handleOpenAddModal}
                  >
                    <i className="bi bi-plus-lg me-1"></i> Add Address
                  </button>
                </div>

                {addressesLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted small">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-3 p-4">
                    <i className="bi bi-geo-alt text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="fw-bold mt-2">No Saved Addresses</h5>
                    <p className="text-muted small mb-3">You don't have any saved shipping addresses yet.</p>
                    <button className="btn btn-dark rounded-pill px-4 py-2 fw-semibold" onClick={handleOpenAddModal}>
                      <i className="bi bi-plus-circle me-1"></i> Add Your Address Now
                    </button>
                  </div>
                ) : (
                  <div className="row g-3">
                    {addresses.map((addr) => {
                      const isDefault = addr.isdefault === 'yes';
                      const isHome = (addr.addressType || 'Home').toLowerCase() === 'home';
                      return (
                        <div key={addr._id} className="col-12 col-md-6">
                          <div
                            className={`p-3 rounded-3 border h-100 d-flex flex-column transition-all ${
                              isDefault ? 'bg-light border-dark' : 'bg-white'
                            }`}
                            style={{ borderLeft: isDefault ? '4px solid #000000' : '1px solid #e5e7eb' }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span
                                className={`badge ${isHome ? 'bg-secondary' : 'bg-dark'} rounded-pill px-2.5 py-1 text-uppercase`}
                                style={{ fontSize: '10px' }}
                              >
                                {addr.addressType || 'Home'}
                              </span>
                              {isDefault && (
                                <span className="badge bg-success rounded-pill px-2.5 py-1" style={{ fontSize: '10px' }}>
                                  <i className="bi bi-check2 me-1"></i> DEFAULT
                                </span>
                              )}
                            </div>

                            <h6 className="fw-bold text-dark mb-1">{addr.name}</h6>
                            <p className="text-muted small mb-2">
                              <i className="bi bi-telephone me-1"></i> {addr.mobile}
                            </p>

                            <p className="small text-secondary mb-1 flex-grow-1">
                              {addr.address || addr.Address}, {addr.locality || addr.localiy}
                              {addr.landmark ? `, ${addr.landmark}` : ''}
                              <br />
                              <strong className="text-dark">
                                {addr.city}, {addr.state} - {addr.pincode}
                              </strong>
                            </p>

                            <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-3">
                              {!isDefault ? (
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm text-decoration-none p-0 text-dark fw-bold"
                                  style={{ fontSize: '12px' }}
                                  onClick={() => handleSetDefaultAddress(addr._id)}
                                >
                                  Set as Default
                                </button>
                              ) : (
                                <span className="small text-success fw-semibold">
                                  <i className="bi bi-check-circle-fill me-1"></i> Primary Address
                                </span>
                              )}

                              <div className="d-flex gap-2 ms-auto">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary rounded-circle p-1 d-flex align-items-center justify-content-center"
                                  style={{ width: '28px', height: '28px' }}
                                  title="Edit"
                                  onClick={() => handleOpenEditModal(addr)}
                                >
                                  <i className="bi bi-pencil-fill" style={{ fontSize: '11px' }}></i>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger rounded-circle p-1 d-flex align-items-center justify-content-center"
                                  style={{ width: '28px', height: '28px' }}
                                  title="Delete"
                                  onClick={() => openDeleteModal(addr)}
                                >
                                  <i className="bi bi-trash-fill" style={{ fontSize: '11px' }}></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: My Orders */}
            {activeTab === 'orders' && (
              <div className="profile-content-card">
                <h2 className="profile-card-title">My Orders</h2>
                {ordersLoading ? (
                  <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
                ) : orders.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {orders.map((order) => (
                      <div key={order._id} className="border rounded-3 p-3 bg-white shadow-sm">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom pb-3 mb-3">
                          <div><strong>Order {order.orderId}</strong><div className="small text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN')}</div></div>
                          <span className="badge bg-warning-subtle text-warning-emphasis text-capitalize">{order.status || 'pending'}</span>
                          <strong className="text-dark">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="d-flex flex-column gap-2">
                          {(order.items || []).map((item, itemIndex) => (
                            <div key={`${order._id}-${itemIndex}`} className="d-flex align-items-center gap-3">
                              <div className="border rounded-2 d-flex align-items-center justify-content-center bg-light" style={{ width: 52, height: 52 }}><img src={formatImg(item.thumbnail)} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></div>
                              <div className="flex-grow-1"><strong className="d-block">{item.name}</strong><small className="text-muted">Qty: {item.quantity}</small></div>
                              <strong>₹{Number(item.total || 0).toLocaleString('en-IN')}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-bag-x text-muted" style={{ fontSize: '3.5rem' }}></i>
                  </div>
                  <h5 className="fw-bold text-dark">No orders found</h5>
                  <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    You haven't placed any orders yet. Explore our premier collection and find what you need!
                  </p>
                  <Link to="/Product" className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm">
                    Browse Products
                  </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB: My Reviews */}
            {activeTab === 'reviews' && (
              <div className="profile-content-card">
                <h2 className="profile-card-title">My Reviews</h2>
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-star text-muted" style={{ fontSize: '3.5rem' }}></i>
                  </div>
                  <h5 className="fw-bold text-dark">No reviews yet</h5>
                  <p className="text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    Share your experience by writing reviews on products you've purchased!
                  </p>
                  <Link to="/Product" className="btn btn-primary px-4 py-2 rounded-pill fw-semibold shadow-sm">
                    Explore Products to Review
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add / Edit Address Modal */}
      {showAddressModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-dark text-white rounded-top-4 px-4 py-3">
                <h5 className="modal-title fw-bold">
                  <i className={`bi ${editingAddressId ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddressModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitAddressForm}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="name"
                        placeholder="Recipient full name"
                        value={addressFormData.name}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Mobile Number <span className="text-danger">*</span></label>
                      <input
                        type="tel"
                        className="form-control rounded-3"
                        name="mobile"
                        placeholder="10-digit mobile"
                        value={addressFormData.mobile}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Pincode <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="pincode"
                        placeholder="6-digit pincode"
                        value={addressFormData.pincode}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Locality / Area <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="locality"
                        placeholder="e.g. Indiranagar"
                        value={addressFormData.locality}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small">Flat, House No., Building, Street <span className="text-danger">*</span></label>
                      <textarea
                        className="form-control rounded-3"
                        rows="2"
                        name="address"
                        placeholder="House no., apartment, street"
                        value={addressFormData.address}
                        onChange={handleAddressInputChange}
                        required
                      ></textarea>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">City / District <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="city"
                        placeholder="e.g. Lucknow"
                        value={addressFormData.city}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">State <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        name="state"
                        placeholder="e.g. Uttar Pradesh"
                        value={addressFormData.state}
                        onChange={handleAddressInputChange}
                        required
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Address Type</label>
                      <select
                        className="form-select rounded-3"
                        name="addressType"
                        value={addressFormData.addressType}
                        onChange={handleAddressInputChange}
                      >
                        <option value="Home">Home (All day delivery)</option>
                        <option value="Work">Work (Delivery between 10 AM - 5 PM)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6 d-flex align-items-center pt-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isdefaultCheck"
                          name="isdefault"
                          checked={addressFormData.isdefault === 'yes'}
                          onChange={handleAddressInputChange}
                        />
                        <label className="form-check-label small fw-semibold" htmlFor="isdefaultCheck">
                          Make this my default shipping address
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light rounded-bottom-4 px-4 py-3">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowAddressModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-dark rounded-pill px-4 fw-bold" disabled={addressSubmitLoading}>
                    {addressSubmitLoading ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Address Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-body p-4 text-center">
                <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
                <h5 className="fw-bold mt-2">Delete Address?</h5>
                <p className="text-muted small mb-4">
                  Are you sure you want to delete this address ({deleteModal.address})? This action cannot be undone.
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setDeleteModal({ show: false, id: null, name: '', address: '' })}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold" disabled={deletingId !== null} onClick={confirmDeleteAddress}>
                    {deletingId !== null ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;
