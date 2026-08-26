import React from 'react';

const Inventory = () => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="dashboard-header-title mb-0">
          Inventory <span>Monitor</span>
        </h1>
        <button className="btn btn-outline-secondary">
          <i className="bi bi-arrow-clockwise me-1"></i> Sync Inventory
        </button>
      </div>
      
      <div className="dashboard-section p-4">
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="p-3 border rounded border-start border-4 border-primary bg-light">
              <h6 className="text-muted mb-1">Total Items in Stock</h6>
              <h3 className="mb-0">1,248</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 border rounded border-start border-4 border-danger bg-light">
              <h6 className="text-muted mb-1">Low Stock Alerts</h6>
              <h3 className="mb-0 text-danger">12</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 border rounded border-start border-4 border-success bg-light">
              <h6 className="text-muted mb-1">Incoming Shipments</h6>
              <h3 className="mb-0">3</h3>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>#PRD-1024</td>
                <td><strong>Ultrasonic Sensor HC-SR04</strong></td>
                <td><span className="text-danger fw-bold">0</span></td>
                <td>50</td>
                <td><span className="badge bg-danger">Critical</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>Order Stock</button>
                </td>
              </tr>
              <tr>
                <td>#PRD-1023</td>
                <td><strong>ESP32 Wi-Fi Module</strong></td>
                <td><span className="text-warning fw-bold">5</span></td>
                <td>20</td>
                <td><span className="badge bg-warning text-dark">Low Stock</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ backgroundColor: '#3945E0', border: 'none' }}>Order Stock</button>
                </td>
              </tr>
              <tr>
                <td>#PRD-1021</td>
                <td><strong>Raspberry Pi 4 Model B (4GB)</strong></td>
                <td>45</td>
                <td>10</td>
                <td><span className="badge bg-success">Adequate</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-secondary">Update</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Inventory;
