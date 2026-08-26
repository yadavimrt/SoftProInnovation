import logo from "../assets/logo.png"

const Header = () => {
  return (
    <>
      <div className="container-fluid p-0 sticky-top shadow-sm">
        <nav className="navbar navbar-expand-lg navbar-dark py-1.5 px-3 px-lg-4" style={{ backgroundColor: '#1e3a8a', minHeight: '56px' }}>
          <div className="container-fluid">
            <a className="navbar-brand d-flex align-items-center fs-5 fw-bold text-white my-0" href="./">
              <img src={logo} alt="SPI Logo" width="34" className="me-2" style={{ objectFit: 'contain', filter: 'invert(1) hue-rotate(39deg)', mixBlendMode: 'screen' }} />
              Softpro<span>Innovation</span>
            </a>
            <button className="navbar-toggler py-1 px-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mx-auto mb-0 gap-1 gap-lg-3 fw-medium">
                <li className="nav-item">
                  <a className="nav-link py-1 active" aria-current="page" href="./">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link py-1" href="/about">About</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link py-1" href="/Product">Products</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link py-1" href="/Contact">Contact Us</a>
                </li>
              </ul>
              <div className="d-flex gap-2 align-items-center mt-2 mt-lg-0">
                <button className="btn btn-outline-orangered btn-sm d-flex align-items-center gap-1.5 py-1 px-3" type="button" style={{ fontSize: '13px' }}>
                  <i className="bi bi-moon"></i> Dark
                </button>
                <button className="btn btn-outline-orangered btn-sm d-flex align-items-center gap-1.5 py-1 px-3" type="button" style={{ fontSize: '13px' }}>
                  <i className="bi bi-cart"></i> Cart
                </button>
                <a href="/login" className="btn btn-outline-orangered btn-sm px-3 py-1 text-decoration-none" style={{ fontSize: '13px' }}>Login</a>
                <a href="/register" className="btn btn-orangered btn-sm px-3 py-1 text-decoration-none" style={{ fontSize: '13px' }}>Register</a>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}

export default Header