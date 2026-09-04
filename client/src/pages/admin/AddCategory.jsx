import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AddCategory = ({ isEditMode: propIsEditMode }) => {
  const { id } = useParams();
  const isEditMode = propIsEditMode || Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetchingExisting, setFetchingExisting] = useState(isEditMode);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [createdSuccess, setCreatedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        setFetchingExisting(true);
        try {
          const res = await axios.get('http://localhost:5000/api/category/show');
          if (Array.isArray(res.data)) {
            const found = res.data.find(c => c._id === id);
            if (found) {
              setFormData({
                category: found.category || found.name || '',
                description: found.description || '',
                status: found.status || 'active'
              });
              if (found.image) {
                setPreviewUrl(`http://localhost:5000/${found.image.replace(/\\/g, '/')}`);
              }
            }
          }
        } catch (err) {
          console.error('Failed to load category details', err);
          showAlert('danger', 'Failed to load category details.');
        } finally {
          setFetchingExisting(false);
        }
      };
      fetchCategory();
    }
  }, [id]);

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showAlert('danger', 'Please upload a valid image file (PNG, JPG, WEBP, etc.)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showAlert('danger', 'Image size should be less than 5MB.');
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl('');
  };

  const handleReset = () => {
    setFormData({
      category: '',
      description: '',
      status: 'active'
    });
    setImageFile(null);
    setPreviewUrl('');
    setCreatedSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category.trim()) {
      showAlert('danger', 'Please enter a category name.');
      return;
    }
    if (!formData.description.trim()) {
      showAlert('danger', 'Please provide a category description.');
      return;
    }

    setLoading(true);
    setCreatedSuccess(false);

    try {
      const data = new FormData();
      data.append('category', formData.category.trim());
      data.append('description', formData.description.trim());
      data.append('status', formData.status);
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (isEditMode && id) {
        const res = await axios.put(`http://localhost:5000/api/category/update/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showAlert('success', res.data.message || 'Category updated successfully!');
        setCreatedSuccess(true);
        setTimeout(() => {
          navigate('/dashboard/categories');
        }, 1200);
      } else {
        const res = await axios.post('http://localhost:5000/api/category/register', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showAlert('success', res.data.message || 'Category registered successfully!');
        setCreatedSuccess(true);
        setFormData({
          category: '',
          description: '',
          status: 'active'
        });
        setImageFile(null);
        setPreviewUrl('');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to save category. Please try again.';
      showAlert('danger', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      const res = await axios.delete(`http://localhost:5000/api/category/delete/${id}`);
      showAlert('success', res.data?.message || 'Category deleted successfully!');
      setShowDeleteModal(false);
      setTimeout(() => {
        navigate('/dashboard/categories');
      }, 1000);
    } catch (err) {
      console.error('Delete error, trying POST fallback:', err);
      try {
        const fallbackRes = await axios.post(`http://localhost:5000/api/category/delete/${id}`);
        showAlert('success', fallbackRes.data?.message || 'Category deleted successfully!');
        setShowDeleteModal(false);
        setTimeout(() => {
          navigate('/dashboard/categories');
        }, 1000);
      } catch (fallbackErr) {
        const errMsg = fallbackErr.response?.data?.message || err.response?.data?.message || 'Failed to delete category.';
        showAlert('danger', errMsg);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="add-category-page">
      {/* Top Header & Breadcrumbs */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1" style={{ fontSize: '13px' }}>
              <li className="breadcrumb-item">
                <Link to="/dashboard" className="text-decoration-none text-muted">
                  <i className="bi bi-house-door me-1"></i> Dashboard
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/dashboard/categories" className="text-decoration-none text-muted">
                  Categories
                </Link>
              </li>
              <li className="breadcrumb-item active fw-semibold text-primary" aria-current="page">
                {isEditMode ? 'Edit Category' : 'Add Category'}
              </li>
            </ol>
          </nav>
          <h1 className="dashboard-header-title mb-1">
            {isEditMode ? 'Edit' : 'Add New'} <span>Category</span>
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: '14.5px' }}>
            {isEditMode 
              ? 'Update the category details and publishing status' 
              : 'Create a new product category for your store'}
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link
            to="/dashboard/categories"
            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-3 py-2"
            style={{ borderRadius: '10px', fontWeight: '500' }}
          >
            <i className="bi bi-arrow-left"></i> Back to Categories
          </Link>
        </div>
      </div>

      {/* Alert Notification */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm border-0 mb-4`} role="alert" style={{ borderRadius: '12px' }}>
          <div className="d-flex align-items-center">
            <i className={`bi ${alert.type === 'success' ? 'bi-check-circle-fill text-success fs-5' : 'bi-exclamation-triangle-fill text-danger fs-5'} me-3`}></i>
            <div className="flex-grow-1">
              <strong>{alert.type === 'success' ? 'Success!' : 'Notice:'}</strong> {alert.message}
            </div>
            <button type="button" className="btn-close" onClick={() => setAlert({ show: false, type: '', message: '' })}></button>
          </div>
        </div>
      )}

      {/* Success banner with quick navigation */}
      {createdSuccess && (
        <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: '#ecfdf5', borderRadius: '14px', borderLeft: '5px solid #10b981' }}>
          <div className="card-body p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-patch-check-fill text-success fs-4"></i>
              <div>
                <h6 className="mb-0 fw-bold text-success">Category successfully registered!</h6>
                <small className="text-muted">You can add another category below or view all categories in the list.</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Link to="/dashboard/categories" className="btn btn-sm btn-success px-3" style={{ borderRadius: '8px' }}>
                <i className="bi bi-list-ul me-1"></i> View All Categories
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <div className="dashboard-section p-4 p-md-5" style={{ borderRadius: '18px' }}>
            <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
              <div className="d-flex align-items-center gap-3">
                <div className="d-inline-flex p-2.5 rounded-3 text-white" style={{ backgroundColor: '#3945E0' }}>
                  <i className="bi bi-tag-fill fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Category Information</h5>
                  <small className="text-muted">Enter the details for this product category</small>
                </div>
              </div>
              <span className="badge bg-light text-secondary border px-2.5 py-1.5" style={{ fontSize: '11.5px' }}>
                <i className="bi bi-asterisk text-danger me-1"></i> Required fields
              </span>
            </div>

            {fetchingExisting ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Loading category details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Category Name */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1.5">
                    <label htmlFor="categoryName" className="form-label fw-semibold text-dark mb-0">
                      Category Name <span className="text-danger">*</span>
                    </label>
                    <span className="text-muted" style={{ fontSize: '12px' }}>
                      {formData.category.length}/60 chars
                    </span>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="bi bi-tags"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      id="categoryName"
                      name="category"
                      placeholder="e.g. Sensors, Microcontrollers, Laptops"
                      value={formData.category}
                      onChange={handleChange}
                      maxLength={60}
                      required
                      disabled={loading}
                      style={{ fontSize: '15px', height: '48px' }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1.5">
                    <label htmlFor="categoryDesc" className="form-label fw-semibold text-dark mb-0">
                      Description <span className="text-danger">*</span>
                    </label>
                    <span className="text-muted" style={{ fontSize: '12px' }}>
                      {formData.description.length}/300 chars
                    </span>
                  </div>
                  <div className="position-relative">
                    <textarea
                      className="form-control"
                      id="categoryDesc"
                      name="description"
                      rows="4"
                      placeholder="Write a clear and comprehensive description explaining what products belong to this category..."
                      value={formData.description}
                      onChange={handleChange}
                      maxLength={300}
                      required
                      disabled={loading}
                      style={{ fontSize: '14.5px', resize: 'vertical' }}
                    ></textarea>
                  </div>
                </div>

                {/* Category Image */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-1.5 d-flex align-items-center justify-content-between">
                    <span>Category Image <span className="text-muted fw-normal" style={{ fontSize: '13px' }}>(Optional)</span></span>
                    {previewUrl && (
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                        onClick={handleRemoveImage}
                        style={{ fontSize: '12px' }}
                      >
                        <i className="bi bi-trash me-1"></i> Remove Image
                      </button>
                    )}
                  </label>
                  
                  <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-light bg-opacity-50">
                    {/* Preview Thumbnail */}
                    <div
                      className="rounded-3 border overflow-hidden d-flex align-items-center justify-content-center bg-white flex-shrink-0 shadow-sm"
                      style={{ width: '70px', height: '70px' }}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Category Preview"
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <i className="bi bi-image text-muted fs-3"></i>
                      )}
                    </div>

                    <div className="flex-grow-1">
                      <input
                        type="file"
                        id="categoryImage"
                        name="image"
                        className="form-control form-control-sm mb-1"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading}
                      />
                      <small className="text-muted d-block" style={{ fontSize: '12px' }}>
                        Recommended: Square image, PNG/JPG/WEBP, Max 5MB
                      </small>
                    </div>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-dark mb-2">
                    Visibility & Status
                  </label>
                  <div className="row g-3">
                    <div className="col-6">
                      <div
                        className={`p-3 border rounded-3 text-center cursor-pointer transition-all ${
                          formData.status === 'active'
                            ? 'border-success bg-success bg-opacity-10 text-success'
                            : 'border-light bg-light text-muted'
                        }`}
                        style={{ cursor: 'pointer', transition: '0.2s ease' }}
                        onClick={() => !loading && setFormData(prev => ({ ...prev, status: 'active' }))}
                      >
                        <i className="bi bi-check-circle-fill fs-4 d-block mb-1"></i>
                        <strong className="d-block" style={{ fontSize: '14px' }}>Active</strong>
                        <span style={{ fontSize: '12px' }} className="text-muted">Visible in store</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div
                        className={`p-3 border rounded-3 text-center cursor-pointer transition-all ${
                          formData.status === 'inactive'
                            ? 'border-secondary bg-secondary bg-opacity-10 text-dark'
                            : 'border-light bg-light text-muted'
                        }`}
                        style={{ cursor: 'pointer', transition: '0.2s ease' }}
                        onClick={() => !loading && setFormData(prev => ({ ...prev, status: 'inactive' }))}
                      >
                        <i className="bi bi-dash-circle-fill fs-4 d-block mb-1 text-secondary"></i>
                        <strong className="d-block" style={{ fontSize: '14px' }}>Inactive</strong>
                        <span style={{ fontSize: '12px' }} className="text-muted">Hidden from store</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="d-flex align-items-center gap-3 pt-3 border-top flex-wrap">
                  <button
                    type="submit"
                    className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2.5 shadow-sm"
                    style={{
                      backgroundColor: '#3945E0',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      minWidth: '180px'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Saving Category...</span>
                      </>
                    ) : (
                      <>
                        <i className={`bi ${isEditMode ? 'bi-check2-circle' : 'bi-plus-circle-fill'}`}></i>
                        <span>{isEditMode ? 'Update Category' : 'Save Category'}</span>
                      </>
                    )}
                  </button>

                  {!isEditMode && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-3.5 py-2.5"
                      style={{ borderRadius: '10px' }}
                      onClick={handleReset}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                    </button>
                  )}

                  <Link
                    to="/dashboard/categories"
                    className="btn btn-link text-muted text-decoration-none"
                    style={{ fontSize: '14px' }}
                  >
                    Cancel
                  </Link>

                  {isEditMode && (
                    <button
                      type="button"
                      className="btn btn-outline-danger d-inline-flex align-items-center gap-1.5 px-3.5 py-2.5 ms-auto"
                      style={{ borderRadius: '10px' }}
                      disabled={loading || deleting}
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <i className="bi bi-trash3"></i> Delete Category
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
          onClick={() => !deleting && setShowDeleteModal(false)}
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
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4 pt-3">
                <p className="mb-0 text-secondary" style={{ fontSize: '15px' }}>
                  Are you sure you want to permanently delete category <strong className="text-dark">"{formData.category}"</strong>?
                </p>
              </div>
              <div className="modal-footer border-0 bg-light p-3 px-4 d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-3.5 py-2 fw-medium rounded-3"
                  disabled={deleting}
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4 py-2 fw-semibold rounded-3 d-inline-flex align-items-center gap-2 shadow-sm"
                  disabled={deleting}
                  onClick={handleDeleteCategory}
                >
                  {deleting ? (
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
    </div>
  );
};

export default AddCategory;
