import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";
import { useCart } from '../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const { getCartCount, getWishlistCount } = useCart();
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
    localStorage.removeItem('softpro_cart');
    localStorage.removeItem('softpro_wishlist');
    setUserName('');
    setUserRole('');
    navigate('/login');
  };

  const cartCount = getCartCount();
  const wishlistCount = getWishlistCount();

  return (
    <>
      <div className="container-fluid p-0 sticky-top shadow-sm" style={{ zIndex: 1040 }}>
        <nav className="navbar navbar-expand-lg navbar-dark py-2 px-3 px-lg-4" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)', minHeight: '58px' }}>
          <div className="container-fluid">
            <Link className="navbar-brand d-flex align-items-center fs-5 fw-bold text-white my-0" to="/">
              <img src={logo} alt="Softpro Innovation Logo" width="32" height="32" className="me-2" style={{ objectFit: 'contain' }} />
              <span>Softpro</span><span className="ms-1" style={{ color: '#38bdf8' }}>Innovation</span>
            </Link>
            <button className="navbar-toggler py-1 px-2" type="button" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" data-bs-toggle="collapse">
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
                {/* Wishlist Button */}
                <Link
                  to="/wishlist"
                  className="btn btn-outline-light btn-sm position-relative d-flex align-items-center justify-content-center p-2 rounded-circle border-0"
                  title="Wishlist"
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <i className="bi bi-heart fs-6"></i>
                  {wishlistCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Button */}
                <Link
                  to="/cart"
                  className="btn btn-outline-light btn-sm position-relative d-flex align-items-center justify-content-center p-2 rounded-circle border-0"
                  title="Cart"
                  style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <i className="bi bi-cart3 fs-6"></i>
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark fw-bold" style={{ fontSize: '10px' }}>
                      {cartCount}
                    </span>
                  )}
                </Link>

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
                    <Link to="/login" className="btn btn-outline-orangered btn-sm px-3 py-1 text-decoration-none text-white" style={{ fontSize: '13px', borderColor: 'rgba(255,255,255,0.5)' }}>Login</Link>
                    <Link to="/register" className="btn btn-orangered btn-sm px-3 py-1 text-decoration-none" style={{ fontSize: '13px', backgroundColor: '#ff4500', color: 'white' }}>Register</Link>
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