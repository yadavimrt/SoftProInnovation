import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <>
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-profile text-center">
            <div className="avatar-circle mx-auto">AD</div>
            <h6 className="mb-1 fw-bold">Administrator</h6>
            <p className="text-white-50 mb-2" style={{ fontSize: '13px' }}>admin@softpro.com</p>
            <span className="admin-badge">ADMIN</span>
          </div>
          
          <div className="sidebar-nav-title text-uppercase">Admin Controls</div>
          
          <ul className="sidebar-nav">
            <li>
              <Link to="/dashboard" className="sidebar-link active">
                <i className="bi bi-grid"></i> Overview
              </Link>
            </li>
            <li>
              <Link to="#" className="sidebar-link">
                <i className="bi bi-tags"></i> Categories
              </Link>
            </li>
            <li>
              <Link to="#" className="sidebar-link">
                <i className="bi bi-box"></i> Products
              </Link>
            </li>
            <li>
              <Link to="#" className="sidebar-link">
                <i className="bi bi-cart"></i> Orders
              </Link>
            </li>
            <li>
              <Link to="#" className="sidebar-link">
                <i className="bi bi-people"></i> Users List
              </Link>
            </li>
            <li>
              <Link to="#" className="sidebar-link">
                <i className="bi bi-list-check"></i> Inventory
              </Link>
            </li>
            <li>
              <Link to="#" className="sidebar-link">
                <i className="bi bi-chat-left-text"></i> Complaints
              </Link>
            </li>
          </ul>

          <div className="sidebar-footer border-top border-secondary border-opacity-25">
            <Link to="/" className="logout-link">
              <i className="bi bi-box-arrow-right"></i> Logout
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <h1 className="dashboard-header-title">
            Admin <span>Overview</span>
          </h1>
          <p className="dashboard-subtitle">
            Real-time statistics and summary of Softpro Innovation
          </p>

          <div className="row g-4 mb-5">
            {/* Stat Card 1 */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card bg-stat-1">
                <div className="stat-card-decor"></div>
                <div className="stat-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div className="stat-value">72</div>
                <div className="stat-label">Total Products</div>
              </div>
            </div>
            {/* Stat Card 2 */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card bg-stat-2">
                <div className="stat-card-decor"></div>
                <div className="stat-icon text-primary">
                  <i className="bi bi-tags"></i>
                </div>
                <div className="stat-value">10</div>
                <div className="stat-label">Categories</div>
              </div>
            </div>
            {/* Stat Card 3 */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card bg-stat-3">
                <div className="stat-card-decor"></div>
                <div className="stat-icon text-success">
                  <i className="bi bi-cart3"></i>
                </div>
                <div className="stat-value">0</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>
            {/* Stat Card 4 */}
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="stat-card bg-stat-4">
                <div className="stat-card-decor"></div>
                <div className="stat-icon" style={{ color: '#8b5cf6' }}>
                  <i className="bi bi-people-fill"></i>
                </div>
                <div className="stat-value">9</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Quick Actions */}
            <div className="col-12 col-lg-6">
              <div className="dashboard-section">
                <h4 className="section-title">Quick Administration Actions</h4>
                <div className="d-flex flex-column gap-3">
                  <Link to="#" className="action-btn-primary">
                    <i className="bi bi-plus-lg me-2"></i> Add New Product
                  </Link>
                  <Link to="#" className="action-btn-outline">
                    <i className="bi bi-tag me-2" style={{ color: '#f59e0b' }}></i> Add Category
                  </Link>
                  <Link to="#" className="action-btn-outline">
                    <i className="bi bi-graph-up me-2" style={{ color: '#64748b' }}></i> Monitor Inventory Stock
                  </Link>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="col-12 col-lg-6">
              <div className="dashboard-section">
                <h4 className="section-title">System Health & Notifications</h4>
                
                <div className="notification-card notify-success">
                  <div className="notification-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <h5 className="notification-title">Helmet Security Enabled</h5>
                    <p className="notification-desc">
                      HTTP security headers are verified active and secure.
                    </p>
                  </div>
                </div>

                <div className="notification-card notify-info">
                  <div className="notification-icon">
                    <i className="bi bi-chat-left-dots"></i>
                  </div>
                  <div>
                    <h5 className="notification-title">Customer Complaints Received</h5>
                    <p className="notification-desc">
                      There are currently 2 total customer message inquiries. <span className="notify-link">Review messages →</span>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default Dashboard;
