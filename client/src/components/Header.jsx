import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useCart } from '../context/CartContext';
import { formatImg } from '../utils/imageUrl';

const Header = () => {
  const navigate = useNavigate();
  const { getWishlistCount, getCartCount } = useCart();
  const [userName, setUserName] = useState('');
  const [userPicture, setUserPicture] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const syncUserSession = () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('name');
      const role = localStorage.getItem('role');
      const picture = localStorage.getItem('picture');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (token && name) {
        setUserName(name);
        setUserRole(role);
        setUserPicture(user.picture || picture || '');
      } else {
        setUserName('');
        setUserRole('');
        setUserPicture('');
      }
    };

    syncUserSession();

    window.addEventListener('userSessionChange', syncUserSession);
    window.addEventListener('storage', syncUserSession);

    return () => {
      window.removeEventListener('userSessionChange', syncUserSession);
      window.removeEventListener('storage', syncUserSession);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('picture');
    localStorage.removeItem('adminId');
    localStorage.removeItem('softpro_cart');
    localStorage.removeItem('softpro_wishlist');
    setUserName('');
    setUserPicture('');
    setUserRole('');
    setShowDropdown(false);

    // Notify app of user session change (resets cart & wishlist)
    window.dispatchEvent(new Event('userSessionChange'));

    navigate('/login');
  };

  const isUserLoggedIn = Boolean(userName && localStorage.getItem('token'));
  const wishlistCount = isUserLoggedIn && getWishlistCount ? getWishlistCount() : 0;
  const cartCount = isUserLoggedIn && getCartCount ? getCartCount() : 0;

  return (
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
                to={isUserLoggedIn ? "/wishlist" : "/login"}
                className="btn btn-outline-light btn-sm position-relative d-flex align-items-center justify-content-center p-2 rounded-circle border-0"
                title={isUserLoggedIn ? "Wishlist" : "Login to view Wishlist"}
                style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <i className="bi bi-heart fs-6"></i>
                {isUserLoggedIn && wishlistCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Button */}
              <Link
                to={isUserLoggedIn ? "/cart" : "/login"}
                className="btn btn-outline-light btn-sm position-relative d-flex align-items-center justify-content-center p-2 rounded-circle border-0"
                title={isUserLoggedIn ? "Shopping Cart" : "Login to view Cart"}
                style={{ width: '36px', height: '36px', backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <i className="bi bi-cart3 fs-6"></i>
                {isUserLoggedIn && cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {userName ? (
                <div className="position-relative" ref={dropdownRef}>
                  <button
                    className="navbar-btn-user dropdown-toggle"
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {userPicture ? (
                      <img src={formatImg(userPicture)} alt="Profile" className="rounded-circle me-1" width="24" height="24" style={{ objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person-circle fs-6"></i>
                    )} {userName}
                  </button>
                  {showDropdown && (
                    <div className="user-dropdown-menu">
                      <div className="user-dropdown-header">
                        Your Account
                      </div>
                      <div className="user-dropdown-list">
                        {userRole === 'admin' && (
                          <Link className="user-dropdown-item text-primary fw-semibold" to="/dashboard" onClick={() => setShowDropdown(false)}>
                            <i className="bi bi-speedometer2 text-primary"></i>
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link className="user-dropdown-item" to="/profile" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-person-circle"></i>
                          <span>My Profile</span>
                        </Link>
                        <Link className="user-dropdown-item" to="/profile?tab=orders" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-box-seam"></i>
                          <span>Orders</span>
                        </Link>
                        <Link className="user-dropdown-item" to="/profile?tab=addresses" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-geo-alt"></i>
                          <span>Saved Addresses</span>
                        </Link>
                        <Link className="user-dropdown-item" to="/wishlist" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-heart"></i>
                          <span>Wishlist</span>
                        </Link>
                        <div className="user-dropdown-divider"></div>
                        <button
                          className="user-dropdown-item logout-item"
                          onClick={handleLogout}
                        >
                          <i className="bi bi-box-arrow-right"></i>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex gap-2 ms-1">
                  <Link to="/login" className="navbar-btn-login">Login</Link>
                  <Link to="/register" className="navbar-btn-register">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;