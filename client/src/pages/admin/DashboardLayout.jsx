import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import './Dashboard.css';

const DashboardLayout = () => {
  return (
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
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-grid"></i> Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/categories" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-tags"></i> Categories
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/products" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-box"></i> Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/orders" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-cart"></i> Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/users" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-people"></i> Users List
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-list-check"></i> Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard/complaints" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-chat-left-text"></i> Complaints
            </NavLink>
          </li>
        </ul>

        <div className="sidebar-footer border-top border-secondary border-opacity-25">
          <Link to="/" className="logout-link">
            <i className="bi bi-box-arrow-right"></i> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
