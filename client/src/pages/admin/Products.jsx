import React from 'react';

const Products = () => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="dashboard-header-title mb-0">
          Manage <span>Products</span>
        </h1>
        <button className="btn btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>
          <i className="bi bi-plus-lg me-1"></i> Add New Product
        </button>
      </div>
      
      <div className="dashboard-section p-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#PRD-1021</td>
                <td><strong>Raspberry Pi 4 Model B (4GB)</strong></td>
                <td>Microcontrollers</td>
                <td>₹ 4,500</td>
                <td><span className="badge bg-success">In Stock (45)</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-2"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>#PRD-1022</td>
                <td><strong>Arduino Uno R3</strong></td>
                <td>Microcontrollers</td>
                <td>₹ 450</td>
                <td><span className="badge bg-success">In Stock (120)</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-2"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>#PRD-1023</td>
                <td><strong>ESP32 Wi-Fi Module</strong></td>
                <td>Microcontrollers</td>
                <td>₹ 380</td>
                <td><span className="badge bg-warning text-dark">Low Stock (5)</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-2"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
              <tr>
                <td>#PRD-1024</td>
                <td><strong>Ultrasonic Sensor HC-SR04</strong></td>
                <td>Sensors</td>
                <td>₹ 85</td>
                <td><span className="badge bg-danger">Out of Stock</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary me-2"><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-outline-danger"><i className="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Products;
