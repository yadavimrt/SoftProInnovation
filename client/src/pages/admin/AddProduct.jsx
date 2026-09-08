import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import { formatImg } from '../../utils/imageUrl';

const AddProduct = ({ isEditMode: propIsEditMode }) => {
  const { id } = useParams();
  const isEditMode = propIsEditMode || Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Form State matching ProductSchema
  const [formData, setFormData] = useState({
    name: '',
    shortdescription: '',
    description: '',
    category_id: '',
    price: '',
    compareprice: '',
    costprice: '',
    stockquantity: '0',
    stockstatus: 'In Stock',
    refundpolicy: '7 Days Return / Replacement Policy',
    refund_days: '7',
    height: '',
    width: '',
    status: 'active',
    iscouponavailable: false,
    isrefundable_replacement: true,
    isreplaceable: true,
    isfreedelivery: false,
    is_feature: false,
    tags: ''
  });

  // Image files & previews
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Fetch Categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/category/show`);
        if (Array.isArray(res.data)) {
          setCategories(res.data);
          // Set default category if empty and not editing
          if (!isEditMode && res.data.length > 0) {
            setFormData(prev => prev.category_id ? prev : { ...prev, category_id: res.data[0]._id });
          }
        }
      } catch {
        // Handled silently
      }
    };
    fetchCategories();
  }, [isEditMode]);

  // If in Edit Mode, fetch Product details
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setFetchingData(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/api/product/show/${id}`);
          const prod = res.data.product || res.data;
          if (prod) {
            setFormData({
              name: prod.name || '',
              shortdescription: prod.shortdescription || '',
              description: prod.description || '',
              category_id: prod.category_id?._id || prod.category_id || '',
              price: prod.price !== undefined ? prod.price : '',
              compareprice: prod.compareprice !== undefined ? prod.compareprice : '',
              costprice: prod.costprice !== undefined ? prod.costprice : '',
              stockquantity: prod.stockquantity !== undefined ? prod.stockquantity : 0,
              stockstatus: prod.stockstatus || 'In Stock',
              refundpolicy: prod.refundpolicy || '7 Days Return / Replacement Policy',
              refund_days: prod.refund_days !== undefined ? prod.refund_days : 7,
              height: prod.height !== undefined ? prod.height : '',
              width: prod.width !== undefined ? prod.width : '',
              status: prod.status || 'active',
              iscouponavailable: Boolean(prod.iscouponavailable),
              isrefundable_replacement: Boolean(prod.isrefundable_replacement),
              isreplaceable: Boolean(prod.isreplaceable),
              isfreedelivery: Boolean(prod.isfreedelivery),
              is_feature: Boolean(prod.is_feature),
              tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || '')
            });

            if (prod.thumbnail) {
              setThumbnailPreview(formatImg(prod.thumbnail));
            }

            if (Array.isArray(prod.images) && prod.images.length > 0) {
              setExistingGallery(prod.images.map(img => formatImg(img)));
            }
          }
        } catch {
          showAlert('danger', 'Failed to load product details from server.');
        } finally {
          setFetchingData(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle Thumbnail File
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('danger', 'Thumbnail must be a valid image file (JPG, PNG, WEBP).');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  // Handle Gallery Images (Multiple)
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (validFiles.length < files.length) {
      showAlert('warning', 'Some non-image files were skipped.');
    }

    setGalleryFiles(prev => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveGalleryImage = (index, isNew = true) => {
    if (isNew) {
      setGalleryFiles(prev => prev.filter((_, i) => i !== index));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setExistingGallery(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side Validations
    if (!formData.name.trim()) {
      showAlert('danger', 'Product name is required.');
      return;
    }
    if (!formData.shortdescription.trim()) {
      showAlert('danger', 'Short description is required.');
      return;
    }
    if (!formData.category_id) {
      showAlert('danger', 'Please select a Category.');
      return;
    }
    if (formData.price === '' || isNaN(formData.price)) {
      showAlert('danger', 'Please enter a valid Selling Price.');
      return;
    }
    if (formData.compareprice === '' || isNaN(formData.compareprice)) {
      showAlert('danger', 'Please enter a valid Compare / Regular Price.');
      return;
    }
    if (formData.costprice === '' || isNaN(formData.costprice)) {
      showAlert('danger', 'Please enter a valid Cost Price.');
      return;
    }
    if (!formData.stockstatus) {
      showAlert('danger', 'Please choose a Stock Status.');
      return;
    }
    if (!formData.refundpolicy.trim()) {
      showAlert('danger', 'Refund policy description is required.');
      return;
    }
    if (formData.refund_days === '' || isNaN(formData.refund_days)) {
      showAlert('danger', 'Refund days is required.');
      return;
    }
    if (formData.height === '' || isNaN(formData.height)) {
      showAlert('danger', 'Product height is required.');
      return;
    }
    if (formData.width === '' || isNaN(formData.width)) {
      showAlert('danger', 'Product width is required.');
      return;
    }

    if (!isEditMode && !thumbnailFile) {
      showAlert('danger', 'Product thumbnail image is required.');
      return;
    }
    if (!isEditMode && galleryFiles.length === 0) {
      showAlert('danger', 'At least one gallery product image is required.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('shortdescription', formData.shortdescription.trim());
      data.append('description', formData.description.trim());
      data.append('category_id', formData.category_id);
      data.append('price', Number(formData.price));
      data.append('compareprice', Number(formData.compareprice));
      data.append('costprice', Number(formData.costprice));
      data.append('stockquantity', Number(formData.stockquantity || 0));
      data.append('stockstatus', formData.stockstatus);
      data.append('refundpolicy', formData.refundpolicy.trim());
      data.append('refund_days', Number(formData.refund_days));
      data.append('height', Number(formData.height));
      data.append('width', Number(formData.width));
      data.append('status', formData.status);
      data.append('iscouponavailable', formData.iscouponavailable);
      data.append('isrefundable_replacement', formData.isrefundable_replacement);
      data.append('isreplaceable', formData.isreplaceable);
      data.append('isfreedelivery', formData.isfreedelivery);
      data.append('is_feature', formData.is_feature);

      // Process tags
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];
      data.append('tags', JSON.stringify(tagsArray));

      // Append files
      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }
      if (galleryFiles.length > 0) {
        galleryFiles.forEach(file => {
          data.append('images', file);
        });
      }

      let res;
      if (isEditMode) {
        res = await axios.put(`${API_BASE_URL}/api/product/update/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post(`${API_BASE_URL}/api/product/register`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      showAlert('success', res.data.message || (isEditMode ? 'Product updated successfully!' : 'Product added successfully!'));
      
      setTimeout(() => {
        navigate('/dashboard/products');
      }, 1200);

    } catch (err) {
      console.error('Error saving product:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save product.';
      showAlert('danger', errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Profit and Discount Calculations
  const sellingPrice = parseFloat(formData.price) || 0;
  const comparePrice = parseFloat(formData.compareprice) || 0;
  const costPrice = parseFloat(formData.costprice) || 0;
  
  const discountPercent = comparePrice > sellingPrice && comparePrice > 0
    ? Math.round(((comparePrice - sellingPrice) / comparePrice) * 100)
    : 0;

  const profitMargin = sellingPrice > costPrice && costPrice > 0
    ? Math.round(((sellingPrice - costPrice) / sellingPrice) * 100)
    : 0;

  if (fetchingData) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status"></div>
        <h5 className="text-muted fw-semibold">Loading product details...</h5>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1" style={{ fontSize: '13px' }}>
              <li className="breadcrumb-item"><Link to="/dashboard" className="text-decoration-none" style={{ color: '#3945E0' }}>Dashboard</Link></li>
              <li className="breadcrumb-item"><Link to="/dashboard/products" className="text-decoration-none" style={{ color: '#3945E0' }}>Products</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{isEditMode ? 'Edit Product' : 'Add New Product'}</li>
            </ol>
          </nav>
          <h1 className="dashboard-header-title mb-1">
            {isEditMode ? 'Edit' : 'Create'} <span>Product</span>
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
            {isEditMode ? 'Update product pricing, images, inventory and specifications' : 'Fill in the complete details to list a new product in your store'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link
            to="/dashboard/products"
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-2"
            style={{ borderRadius: '10px' }}
          >
            <i className="bi bi-arrow-left"></i> Back to Products
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

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Left Column - Main Details */}
          <div className="col-12 col-lg-8">
            
            {/* 1. General Info Card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-2 bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-info-circle-fill fs-6"></i>
                </span>
                <h5 className="mb-0 fw-bold" style={{ fontSize: '16px', color: '#1e293b' }}>Basic Product Details</h5>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                    Product Title / Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Raspberry Pi 4 Model B (4GB RAM) Starter Kit"
                    className="form-control form-control-lg"
                    style={{ fontSize: '15px', borderRadius: '10px' }}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="form-select form-select-lg"
                      style={{ fontSize: '14.5px', borderRadius: '10px' }}
                      required
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.category || cat.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <small className="text-warning mt-1 d-block">
                        <i className="bi bi-exclamation-circle me-1"></i> No categories found. Please add a category first.
                      </small>
                    )}
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                      Tags <span className="text-muted fw-normal">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g. iot, robotics, arduino, sensor"
                      className="form-control form-control-lg"
                      style={{ fontSize: '14.5px', borderRadius: '10px' }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                    Short Summary / Tagline <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="shortdescription"
                    value={formData.shortdescription}
                    onChange={handleInputChange}
                    placeholder="Brief 1-sentence product summary displayed on cards"
                    className="form-control"
                    style={{ fontSize: '14px', borderRadius: '10px' }}
                    required
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Comprehensive description of specifications, features, pinouts, and package contents..."
                    className="form-control"
                    style={{ fontSize: '14px', borderRadius: '10px', resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* 2. Pricing & Margins Card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-2 bg-success bg-opacity-10 text-success">
                  <i className="bi bi-currency-rupee fs-6"></i>
                </span>
                <h5 className="mb-0 fw-bold" style={{ fontSize: '16px', color: '#1e293b' }}>Pricing & Profitability</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                      Selling Price (₹) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 fw-bold">₹</span>
                      <input
                        type="number"
                        step="any"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g. 4500"
                        className="form-control border-start-0"
                        style={{ borderRadius: '0 10px 10px 0', fontSize: '15px' }}
                        required
                      />
                    </div>
                    <small className="text-muted" style={{ fontSize: '11.5px' }}>Actual price charged to customer</small>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                      Compare / MRP Price (₹) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 fw-bold">₹</span>
                      <input
                        type="number"
                        step="any"
                        name="compareprice"
                        value={formData.compareprice}
                        onChange={handleInputChange}
                        placeholder="e.g. 5200"
                        className="form-control border-start-0"
                        style={{ borderRadius: '0 10px 10px 0', fontSize: '15px' }}
                        required
                      />
                    </div>
                    <small className="text-muted" style={{ fontSize: '11.5px' }}>Crossed out original MRP</small>
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                      Cost Price (₹) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 fw-bold">₹</span>
                      <input
                        type="number"
                        step="any"
                        name="costprice"
                        value={formData.costprice}
                        onChange={handleInputChange}
                        placeholder="e.g. 3200"
                        className="form-control border-start-0"
                        style={{ borderRadius: '0 10px 10px 0', fontSize: '15px' }}
                        required
                      />
                    </div>
                    <small className="text-muted" style={{ fontSize: '11.5px' }}>Internal procurement cost</small>
                  </div>
                </div>

                {/* Live Profit & Discount Badges */}
                <div className="mt-3 p-3 bg-light rounded-3 d-flex flex-wrap align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted" style={{ fontSize: '13px' }}>Customer Discount:</span>
                    <span className={`badge ${discountPercent > 0 ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-secondary-subtle text-secondary'}`}>
                      {discountPercent > 0 ? `${discountPercent}% OFF` : 'No Discount'}
                    </span>
                  </div>
                  <div className="vr d-none d-md-block"></div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted" style={{ fontSize: '13px' }}>Gross Margin:</span>
                    <span className={`badge ${profitMargin > 0 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'}`}>
                      {profitMargin > 0 ? `+${profitMargin}% profit (₹ ${(sellingPrice - costPrice).toFixed(2)})` : '0% margin'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Media & Gallery Card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-2 bg-warning bg-opacity-10 text-warning">
                  <i className="bi bi-images fs-6"></i>
                </span>
                <h5 className="mb-0 fw-bold" style={{ fontSize: '16px', color: '#1e293b' }}>Product Media</h5>
              </div>
              <div className="card-body p-4">
                {/* Main Thumbnail Upload */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                    Main Thumbnail Image <span className="text-danger">*</span>
                  </label>
                  <div className="d-flex align-items-start gap-3 flex-wrap">
                    {thumbnailPreview ? (
                      <div className="position-relative border rounded-3 p-1 bg-light" style={{ width: '130px', height: '130px' }}>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-100 h-100 rounded-2"
                          style={{ objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-1 shadow-sm"
                          style={{ width: '24px', height: '24px', lineHeight: 1 }}
                          onClick={handleRemoveThumbnail}
                          title="Remove thumbnail"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <label
                        className="d-flex flex-column align-items-center justify-content-center border border-2 border-dashed rounded-3 p-3 text-center cursor-pointer hover-shadow"
                        style={{ width: '130px', height: '130px', cursor: 'pointer', background: '#f8fafc', borderColor: '#cbd5e1' }}
                      >
                        <i className="bi bi-cloud-arrow-up text-primary fs-3"></i>
                        <span className="mt-1 text-primary fw-semibold" style={{ fontSize: '12px' }}>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="d-none"
                        />
                      </label>
                    )}
                    <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                      <p className="text-muted mb-1" style={{ fontSize: '13px' }}>
                        This is the primary display image shown on category lists, search results, and checkout.
                      </p>
                      <small className="text-secondary" style={{ fontSize: '11.5px' }}>
                        Recommended size: 800x800 px (1:1 ratio). Formats: PNG, JPG, WEBP. Max 10MB.
                      </small>
                    </div>
                  </div>
                </div>

                <hr className="my-3 opacity-25" />

                {/* Gallery Images Upload (Multiple) */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold text-dark mb-0" style={{ fontSize: '13.5px' }}>
                      Gallery Images <span className="text-danger">*</span>
                    </label>
                    <label className="btn btn-sm btn-outline-primary px-3 py-1" style={{ borderRadius: '8px', cursor: 'pointer' }}>
                      <i className="bi bi-plus-lg me-1"></i> Add Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleGalleryChange}
                        className="d-none"
                      />
                    </label>
                  </div>
                  <p className="text-muted mb-3" style={{ fontSize: '12.5px' }}>
                    Upload angles, package shots, and dimension photos for the interactive carousel.
                  </p>

                  <div className="d-flex flex-wrap gap-2.5">
                    {/* Existing Gallery Images (in Edit Mode) */}
                    {existingGallery.map((imgUrl, idx) => (
                      <div key={`existing-${idx}`} className="position-relative border rounded-3 p-1 bg-light" style={{ width: '90px', height: '90px' }}>
                        <img
                          src={imgUrl}
                          alt={`Gallery ${idx + 1}`}
                          className="w-100 h-100 rounded-2"
                          style={{ objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0"
                          style={{ width: '20px', height: '20px', fontSize: '12px' }}
                          onClick={() => handleRemoveGalleryImage(idx, false)}
                          title="Remove image"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}

                    {/* New Gallery Previews */}
                    {galleryPreviews.map((previewUrl, idx) => (
                      <div key={`new-${idx}`} className="position-relative border rounded-3 p-1 bg-light border-primary" style={{ width: '90px', height: '90px' }}>
                        <img
                          src={previewUrl}
                          alt={`New preview ${idx + 1}`}
                          className="w-100 h-100 rounded-2"
                          style={{ objectFit: 'cover' }}
                        />
                        <span className="position-absolute bottom-0 start-0 badge bg-primary m-1" style={{ fontSize: '9px' }}>New</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle p-0"
                          style={{ width: '20px', height: '20px', fontSize: '12px' }}
                          onClick={() => handleRemoveGalleryImage(idx, true)}
                          title="Remove image"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}

                    {existingGallery.length === 0 && galleryPreviews.length === 0 && (
                      <div className="p-3 text-center w-100 bg-light rounded-3 border border-dashed">
                        <i className="bi bi-images text-muted fs-3 d-block mb-1"></i>
                        <small className="text-muted">No gallery images chosen yet. Click "Add Images" above.</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Dimensions & Physical Specs */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-2 bg-info bg-opacity-10 text-info">
                  <i className="bi bi-aspect-ratio fs-6"></i>
                </span>
                <h5 className="mb-0 fw-bold" style={{ fontSize: '16px', color: '#1e293b' }}>Dimensions & Shipping Specs</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                      Height (mm / cm) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="any"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder="e.g. 56"
                        className="form-control"
                        style={{ fontSize: '14.5px', borderRadius: '10px 0 0 10px' }}
                        required
                      />
                      <span className="input-group-text bg-light" style={{ borderRadius: '0 10px 10px 0' }}>mm</span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-dark" style={{ fontSize: '13.5px' }}>
                      Width (mm / cm) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        step="any"
                        name="width"
                        value={formData.width}
                        onChange={handleInputChange}
                        placeholder="e.g. 85"
                        className="form-control"
                        style={{ fontSize: '14.5px', borderRadius: '10px 0 0 10px' }}
                        required
                      />
                      <span className="input-group-text bg-light" style={{ borderRadius: '0 10px 10px 0' }}>mm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Side Settings, Policies, Stock, Toggles */}
          <div className="col-12 col-lg-4">
            
            {/* Save Actions Card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3" style={{ color: '#1e293b' }}>Publish Settings</h6>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>Store Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                    style={{ borderRadius: '10px', fontSize: '14px' }}
                  >
                    <option value="active">🟢 Active (Visible in Store)</option>
                    <option value="inactive">⚪ Inactive (Draft / Hidden)</option>
                  </select>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary py-2.5 d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm"
                    style={{ backgroundColor: '#3945E0', border: 'none', borderRadius: '10px' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Saving Product...
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isEditMode ? 'bi-check2-circle' : 'bi-cloud-upload'} fs-5`}></i>
                        {isEditMode ? 'Update Product' : 'Publish Product'}
                      </>
                    )}
                  </button>

                  <Link
                    to="/dashboard/products"
                    className="btn btn-light py-2 text-muted fw-semibold"
                    style={{ borderRadius: '10px' }}
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            {/* Inventory Status Card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-2 bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-box-seam fs-6"></i>
                </span>
                <h6 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>Stock & Inventory</h6>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockquantity"
                    value={formData.stockquantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="form-control"
                    style={{ borderRadius: '10px', fontSize: '14px' }}
                  />
                </div>

                <div className="mb-0">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>
                    Stock Status <span className="text-danger">*</span>
                  </label>
                  <select
                    name="stockstatus"
                    value={formData.stockstatus}
                    onChange={handleInputChange}
                    className="form-select"
                    style={{ borderRadius: '10px', fontSize: '14px' }}
                    required
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Pre-Order">Pre-Order</option>
                    <option value="Backorder">Backorder</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Refund & Return Policy Card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-2 bg-danger bg-opacity-10 text-danger">
                  <i className="bi bi-shield-check fs-6"></i>
                </span>
                <h6 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>Policy & Warranty</h6>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>
                    Refund / Replacement Days <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="number"
                      name="refund_days"
                      value={formData.refund_days}
                      onChange={handleInputChange}
                      placeholder="7"
                      min="0"
                      className="form-control"
                      style={{ borderRadius: '10px 0 0 10px', fontSize: '14px' }}
                      required
                    />
                    <span className="input-group-text bg-light" style={{ borderRadius: '0 10px 10px 0' }}>Days</span>
                  </div>
                </div>

                <div className="mb-0">
                  <label className="form-label fw-semibold text-dark" style={{ fontSize: '13px' }}>
                    Refund Policy Note <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="refundpolicy"
                    value={formData.refundpolicy}
                    onChange={handleInputChange}
                    placeholder="e.g. 7 Days Replacement Policy"
                    className="form-control"
                    style={{ borderRadius: '10px', fontSize: '14px' }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Badges & Features Toggles Card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
              <div className="card-header bg-white border-bottom p-3.5 d-flex align-items-center gap-2">
                <span className="badge rounded-circle p-2 bg-secondary bg-opacity-10 text-secondary">
                  <i className="bi bi-toggles fs-6"></i>
                </span>
                <h6 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>Product Badges & Options</h6>
              </div>
              <div className="card-body p-4">
                {/* Feature switch */}
                <div className="form-check form-switch mb-3 d-flex justify-content-between align-items-center ps-0">
                  <label className="form-check-label fw-semibold text-dark" htmlFor="is_feature" style={{ fontSize: '13.5px' }}>
                    <i className="bi bi-star-fill text-warning me-2"></i> Featured Product
                  </label>
                  <input
                    className="form-check-input ms-auto"
                    type="checkbox"
                    role="switch"
                    id="is_feature"
                    name="is_feature"
                    checked={formData.is_feature}
                    onChange={handleInputChange}
                    style={{ width: '40px', height: '22px', cursor: 'pointer' }}
                  />
                </div>

                {/* Free Delivery switch */}
                <div className="form-check form-switch mb-3 d-flex justify-content-between align-items-center ps-0">
                  <label className="form-check-label fw-semibold text-dark" htmlFor="isfreedelivery" style={{ fontSize: '13.5px' }}>
                    <i className="bi bi-truck text-success me-2"></i> Free Delivery
                  </label>
                  <input
                    className="form-check-input ms-auto"
                    type="checkbox"
                    role="switch"
                    id="isfreedelivery"
                    name="isfreedelivery"
                    checked={formData.isfreedelivery}
                    onChange={handleInputChange}
                    style={{ width: '40px', height: '22px', cursor: 'pointer' }}
                  />
                </div>

                {/* Coupon Available switch */}
                <div className="form-check form-switch mb-3 d-flex justify-content-between align-items-center ps-0">
                  <label className="form-check-label fw-semibold text-dark" htmlFor="iscouponavailable" style={{ fontSize: '13.5px' }}>
                    <i className="bi bi-ticket-perforated-fill text-primary me-2"></i> Coupon Available
                  </label>
                  <input
                    className="form-check-input ms-auto"
                    type="checkbox"
                    role="switch"
                    id="iscouponavailable"
                    name="iscouponavailable"
                    checked={formData.iscouponavailable}
                    onChange={handleInputChange}
                    style={{ width: '40px', height: '22px', cursor: 'pointer' }}
                  />
                </div>

                {/* Replaceable switch */}
                <div className="form-check form-switch mb-3 d-flex justify-content-between align-items-center ps-0">
                  <label className="form-check-label fw-semibold text-dark" htmlFor="isreplaceable" style={{ fontSize: '13.5px' }}>
                    <i className="bi bi-arrow-repeat text-info me-2"></i> Replaceable
                  </label>
                  <input
                    className="form-check-input ms-auto"
                    type="checkbox"
                    role="switch"
                    id="isreplaceable"
                    name="isreplaceable"
                    checked={formData.isreplaceable}
                    onChange={handleInputChange}
                    style={{ width: '40px', height: '22px', cursor: 'pointer' }}
                  />
                </div>

                {/* Refundable Replacement switch */}
                <div className="form-check form-switch mb-0 d-flex justify-content-between align-items-center ps-0">
                  <label className="form-check-label fw-semibold text-dark" htmlFor="isrefundable_replacement" style={{ fontSize: '13.5px' }}>
                    <i className="bi bi-cash-stack text-success me-2"></i> Refundable Replacement
                  </label>
                  <input
                    className="form-check-input ms-auto"
                    type="checkbox"
                    role="switch"
                    id="isrefundable_replacement"
                    name="isrefundable_replacement"
                    checked={formData.isrefundable_replacement}
                    onChange={handleInputChange}
                    style={{ width: '40px', height: '22px', cursor: 'pointer' }}
                  />
                </div>

              </div>
            </div>

          </div>
        </div>
      </form>
    </>
  );
};

export default AddProduct;
