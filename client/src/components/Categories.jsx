import React, { useState, useEffect } from 'react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/category/show')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch categories", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="dashboard-header-title mb-0">
          Product <span>Categories</span>
        </h1>
        <button className="btn btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>
          <i className="bi bi-plus-lg me-1"></i> Add Category
        </button>
      </div>
      
      <div className="dashboard-section p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">No categories found in the database.</td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr key={cat._id || index}>
                    <td><strong>{cat.name || cat.category}</strong></td>
                    <td>{cat.description}</td>
                    <td>
                      <span className={`badge ${cat.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {cat.status ? cat.status.charAt(0).toUpperCase() + cat.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td>{cat.timestamps || 'N/A'}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-secondary me-2"><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Categories;
