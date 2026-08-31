import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    if (token && name) {
      setUserName(name);
      setUserRole(role);
    } else {
      setUserName('');
      setUserRole('');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('adminId');
    setUserName('');
    setUserRole('');
    navigate('/login');
  };

  return (
    <>
      <div className="container-fluid p-0 sticky-top shadow-sm">
        <nav className="navbar navbar-expand-lg navbar-dark py-2 px-3 px-lg-4" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', minHeight: '58px' }}>
          <div className="container-fluid">
            <Link className="navbar-brand d-flex align-items-center fs-5 fw-bold text-white my-0" to="/">
              <img src={logo} alt="Softpro Innovation Logo" width="32" height="32" className="me-2" style={{ objectFit: 'contain' }} />
              <span>Softpro</span><span className="ms-1" style={{ color: '#38bdf8' }}>Innovation</span>
            </Link>
            <button className="navbar-toggler py-1 px-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mx-auto mb-0 gap-1 gap-lg-2 fw-medium">
                <li className="nav-item">
                  <NavLink className="nav-link px-3 py-1.5" to="/">Home</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 py-1.5" to="/about">About</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 py-1.5" to="/Product">Products</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3 py-1.5" to="/Contact">Contact Us</NavLink>
                </li>
              </ul>
              <div className="d-flex gap-2 align-items-center mt-2 mt-lg-0">
                <button className="btn btn-outline-orangered btn-sm d-flex align-items-center gap-1.5 py-1 px-3" type="button" style={{ fontSize: '13px' }}>
                  <i className="bi bi-moon"></i> Dark
                </button>
                <button className="btn btn-outline-orangered btn-sm d-flex align-items-center gap-1.5 py-1 px-3" type="button" style={{ fontSize: '13px' }}>
                  <i className="bi bi-cart"></i> Cart
                </button>

                {userName ? (
                  <div className="dropdown">
                    <button className="btn btn-orangered btn-sm dropdown-toggle d-flex align-items-center gap-1.5 py-1 px-3" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ fontSize: '13px' }}>
                      <i className="bi bi-person-circle"></i> {userName}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                      {userRole === 'admin' && (
                        <li>
                          <Link className="dropdown-item" to="/dashboard">
                            <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                          </Link>
                        </li>
                      )}
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-outline-orangered btn-sm px-3 py-1 text-decoration-none" style={{ fontSize: '13px' }}>Login</Link>
                    <Link to="/register" className="btn btn-orangered btn-sm px-3 py-1 text-decoration-none" style={{ fontSize: '13px' }}>Register</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;