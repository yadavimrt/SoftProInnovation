import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Dashboard.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const adminName = localStorage.getItem('name') || 'Administrator';
  const avatarInitials = adminName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('adminId');
    navigate('/admin/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand-header text-center py-3 px-2 border-bottom border-secondary border-opacity-25 mb-3">
          <Link to="/" className="d-flex align-items-center justify-content-center text-white text-decoration-none">
            <img src={logo} alt="Softpro Innovation" width="28" height="28" className="me-2" style={{ objectFit: 'contain' }} />
            <span className="fw-bold" style={{ fontSize: '15px' }}>
              Softpro<span className="ms-1" style={{ color: '#38bdf8' }}>Innovation</span>
            </span>
          </Link>
        </div>

        <div className="sidebar-profile text-center">
          <div className="avatar-circle mx-auto">{avatarInitials}</div>
          <h6 className="mb-1 fw-bold">{adminName}</h6>
          <p className="text-white-50 mb-2" style={{ fontSize: '13px' }}>Admin Access</p>
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
          <button 
            type="button" 
            onClick={handleLogout} 
            className="logout-link btn btn-link text-decoration-none w-100 text-start border-0 bg-transparent p-0"
          >
            <i className="bi bi-box-arrow-right"></i> Logout
          </button>
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
