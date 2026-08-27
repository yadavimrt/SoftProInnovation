import React, { useState, useMemo } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link } from 'react-router-dom'

import img1 from '../../assets/1.avif'
import img2 from '../../assets/2.png'
import img3 from '../../assets/3.png'
import img4 from '../../assets/4.png'
import img5 from '../../assets/5.png'
import img6 from '../../assets/6.png'
import img7 from '../../assets/7.png'
import img8 from '../../assets/8.png'
import img12 from '../../assets/12.png'
import img13 from '../../assets/13.png'
import img14 from '../../assets/14.png'
import img15 from '../../assets/15.png'
import img16 from '../../assets/16.png'
import img17 from '../../assets/17.png'
import img18 from '../../assets/18.png'
import img19 from '../../assets/19.png'

const allProductsList = [
  // Displays & Indicators
  { id: 1, category: 'DISPLAYS', title: '7-Segment Displays', brand: 'SIPL', price: 7200, priceStr: '₹7,200', originalPrice: '₹8,000', discount: '10% OFF', featured: true, rating: 4.8, reviews: 126, inStock: true, badge: 'Sale', img: img12 },
  { id: 2, category: 'DISPLAYS', title: 'TFT Display Module', brand: 'SIPL', price: 476, priceStr: '₹476', originalPrice: '₹595', discount: '20% OFF', featured: true, rating: 4.5, reviews: 89, inStock: true, badge: 'New', img: img13 },
  { id: 3, category: 'INDICATORS', title: '0.96 OLED LCD', brand: 'SIPL', price: 6300, priceStr: '₹6,300', originalPrice: '₹7,000', discount: '10% OFF', featured: true, rating: 4.9, reviews: 215, inStock: false, badge: '', img: img14 },
  { id: 4, category: 'INDICATORS', title: '20X4 LCD Display', brand: 'SIPL', price: 540, priceStr: '₹540', originalPrice: '₹600', discount: '10% OFF', featured: true, rating: 4.7, reviews: 34, inStock: true, badge: '', img: img15 },

  // Development Boards
  { id: 5, category: 'DEVELOPMENT BOARDS', title: 'Raspberry Pi 3 Model B', brand: 'SIPL', price: 675, priceStr: '₹675', originalPrice: '₹750', discount: '10% OFF', featured: true, rating: 4.6, reviews: 320, inStock: true, badge: 'Hot', img: img1 },
  { id: 6, category: 'DEVELOPMENT BOARDS', title: 'ESP32', brand: 'SIPL', price: 675, priceStr: '₹675', originalPrice: '₹750', discount: '10% OFF', featured: true, rating: 4.8, reviews: 410, inStock: true, badge: '', img: img2 },
  { id: 7, category: 'DEVELOPMENT BOARDS', title: 'ESP8266', brand: 'SIPL', price: 657, priceStr: '₹657', originalPrice: '₹730', discount: '10% OFF', featured: true, rating: 4.7, reviews: 290, inStock: true, badge: '', img: img3 },
  { id: 8, category: 'DEVELOPMENT BOARDS', title: 'Arduino Pro Mini', brand: 'SIPL', price: 679, priceStr: '₹679', originalPrice: '₹754', discount: '10% OFF', featured: true, rating: 4.5, reviews: 85, inStock: true, badge: '', img: img4 },

  { id: 9, category: 'DEVELOPMENT BOARDS', title: 'Arduino Nano', brand: 'SIPL', price: 6750, priceStr: '₹6,750', originalPrice: '₹7,500', discount: '10% OFF', featured: true, rating: 4.9, reviews: 520, inStock: true, badge: 'Sale', img: img5 },
  { id: 10, category: 'DEVELOPMENT BOARDS', title: 'Arduino Mega', brand: 'SIPL', price: 666, priceStr: '₹666', originalPrice: '₹740', discount: '10% OFF', featured: true, rating: 4.8, reviews: 215, inStock: false, badge: '', img: img6 },
  { id: 11, category: 'DEVELOPMENT BOARDS', title: 'Arduino Uno', brand: 'SIPL', price: 666, priceStr: '₹666', originalPrice: '₹740', discount: '10% OFF', featured: true, rating: 4.7, reviews: 310, inStock: true, badge: '', img: img7 },
  { id: 12, category: 'DEVELOPMENT BOARDS', title: 'UNO R3 SMD Board', brand: 'SIPL', price: 6606, priceStr: '₹6,606', originalPrice: '₹7,340', discount: '10% OFF', featured: true, rating: 4.8, reviews: 180, inStock: true, badge: 'New', img: img8 },

  // Additional Categories
  { id: 13, category: 'MICROCONTROLLERS', title: 'Arduino UNO R3 Board', brand: 'SIPL', price: 405, priceStr: '₹405', originalPrice: '₹450', discount: '10% OFF', featured: false, rating: 4.8, reviews: 450, inStock: true, badge: 'Best Seller', img: img16 },
  { id: 14, category: 'SENSORS', title: 'Ultrasonic Distance Sensor', brand: 'SIPL', price: 102, priceStr: '₹102', originalPrice: '₹120', discount: '15% OFF', featured: false, rating: 4.6, reviews: 78, inStock: true, badge: '', img: img17 },
  { id: 15, category: 'MOTORS', title: 'Servo Motor SG90', brand: 'SIPL', price: 144, priceStr: '₹144', originalPrice: '₹180', discount: '20% OFF', featured: false, rating: 4.7, reviews: 112, inStock: true, badge: '', img: img18 },
  { id: 16, category: 'POWER COMPONENTS', title: '5V Power Supply Module', brand: 'SIPL', price: 225, priceStr: '₹225', originalPrice: '₹250', discount: '10% OFF', featured: false, rating: 4.4, reviews: 56, inStock: true, badge: 'Sale', img: img19 },
]

const categories = [
  'All',
  'Displays',
  'Indicators',
  'Motors',
  'Actuators',
  'Battery Components',
  'Power Components',
  'Communication Modules',
  'Sensors',
  'Microcontrollers',
  'Development Boards',
]

const Product = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Featured')
  const [hoveredCard, setHoveredCard] = useState(null)

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return allProductsList
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          item.category.toLowerCase() === selectedCategory.toLowerCase()
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'Price: Low to High') return a.price - b.price
        if (sortBy === 'Price: High to Low') return b.price - a.price
        if (sortBy === 'Name: A-Z') return a.title.localeCompare(b.title)
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      })
  }, [selectedCategory, searchTerm, sortBy])

  return (
    <>
      <Header />
      {/* Products Page Hero Banner */}
      <section className="product-hero-section py-5">
        <div className="container py-2">
          <div className="product-hero-content text-start">
            {/* Breadcrumb Navigation */}
            <div className="product-breadcrumb mb-2">
              <Link to="/" className="text-decoration-none" style={{ color: '#3945E0', fontSize: '13px' }}>Home</Link>
              <span className="mx-2 text-muted" style={{ fontSize: '13px' }}>&rsaquo;</span>
              <span className="text-muted" style={{ fontSize: '13px' }}>Products</span>
            </div>

            {/* Title */}
            <h1 className="product-hero-title mb-2">
              All <span className="highlight-italic">Products</span>
            </h1>

            {/* Accent Line */}
            <div className="product-accent-line mb-3"></div>

            {/* Subtitle */}
            <p className="product-hero-subtitle mb-0">
              Browse {allProductsList.length * 6} electronics components, boards, and accessories.
            </p>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid Section */}
      <section className="product-catalog-section py-5">
        <div className="container-fluid px-3 px-xl-5">
          {/* Top Search & Sort Control Bar */}
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 mb-4">
            {/* Search Input Box */}
            <div className="position-relative w-100" style={{ maxWidth: '340px' }}>
              <input
                type="text"
                className="form-control product-search-input pe-4 text-start"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="bi bi-search product-search-icon"></i>
            </div>

            {/* Sort Dropdown */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <span className="text-muted" style={{ fontSize: '14px' }}>Sort:</span>
              <select
                className="form-select product-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Name: A-Z">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn category-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Showing Count */}
          <div className="text-start mb-4">
            <span className="text-muted" style={{ fontSize: '14px' }}>
              Showing {filteredProducts.length} products
            </span>
          </div>

          {/* 3 Rows x 4 Columns Product Grid */}
          <div className="row g-3 g-md-4">
            {filteredProducts.map((item) => (
              <div key={item.id} className="col-12 col-sm-6 col-md-6 col-lg-3">
                <div
                  className="card h-100 overflow-hidden shadow-sm position-relative border-0 rounded-4"
                  style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
                  }}
                >
                  {/* Badges */}
                  <div className="position-absolute top-0 start-0 p-2 z-3 d-flex flex-column gap-1 mt-2 ms-2">
                    {item.badge && (
                      <span className={`badge ${item.badge === 'New' ? 'bg-success' : 'bg-primary'} rounded-1 px-2 py-1 shadow-sm fw-semibold`} style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                        {item.badge}
                      </span>
                    )}
                    {item.discount && (
                      <span className="badge bg-warning text-dark rounded-1 px-2 py-1 shadow-sm fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                        {item.discount}
                      </span>
                    )}
                    {item.featured && !item.badge && (
                      <span className="badge bg-info text-dark rounded-1 px-2 py-1 shadow-sm fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button (Always visible on top right) */}
                  <button
                    className="btn btn-white rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center p-0 z-3 border"
                    style={{ width: '36px', height: '36px', transition: 'all 0.2s', backgroundColor: 'rgba(255,255,255,0.9)' }}
                    onClick={(e) => { e.preventDefault(); }}
                    title="Add to Wishlist"
                  >
                    <i className="bi bi-heart text-secondary fs-6"></i>
                  </button>

                  {/* Image Section */}
                  <div className="product-img-box d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden bg-white" style={{ height: '230px' }}>
                    <img
                      src={item.img}
                      alt={item.title}
                      className="img-fluid"
                      style={{ maxHeight: '160px', objectFit: 'contain', transition: 'transform 0.4s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    
                    {/* Quick View on Hover */}
                    <div className="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center" 
                      style={{ backgroundColor: 'rgba(255,255,255,0.4)', opacity: 0, transition: 'opacity 0.3s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                    >
                      <button className="btn btn-dark rounded-pill shadow-sm px-4 py-2 fw-semibold" style={{ fontSize: '13px' }}>
                        <i className="bi bi-eye me-1"></i> Quick View
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="card-body p-3 p-lg-4 d-flex flex-column bg-white text-start">
                    {/* Category */}
                    <span className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                      {item.category}
                    </span>
                    
                    {/* Title */}
                    <h6 className="card-title fw-bold text-dark mb-1" style={{ fontSize: '15px', minHeight: '44px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </h6>
                    <p className="text-muted small mb-2">{item.brand}</p>
                    
                    {/* Rating & Reviews */}
                    <div className="d-flex align-items-center mb-2 gap-1" style={{ fontSize: '12px' }}>
                      <div className="text-warning d-flex">
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className={item.rating >= 4.8 ? "bi bi-star-fill" : "bi bi-star-half"}></i>
                      </div>
                      <span className="fw-bold ms-1 text-dark">{item.rating}</span>
                      <span className="text-muted">({item.reviews} reviews)</span>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-2" style={{ fontSize: '12.5px' }}>
                      {item.inStock ? (
                        <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i>In Stock</span>
                      ) : (
                        <span className="text-danger fw-semibold"><i className="bi bi-x-circle-fill me-1"></i>Out of Stock</span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-auto d-flex flex-column mb-3 border-top pt-3">
                      <div className="d-flex align-items-end gap-2">
                        <span className="fw-bold fs-5" style={{ color: '#ff4500' }}>{item.priceStr}</span>
                        {item.originalPrice && (
                          <span className="text-muted text-decoration-line-through small mb-1">{item.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2 w-100 mt-auto">
                      <button className="btn flex-grow-1 btn-sm py-2 fw-semibold rounded-2 d-flex justify-content-center align-items-center gap-1" 
                        disabled={!item.inStock} 
                        style={{ fontSize: '13px', color: '#ff4500', border: '1px solid #ff4500', backgroundColor: 'transparent', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ff4500'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ff4500'; }}
                      >
                        <i className="bi bi-cart-plus fs-6"></i> Add
                      </button>
                      <button className="btn flex-grow-1 btn-sm py-2 fw-semibold rounded-2" 
                        disabled={!item.inStock} 
                        style={{ fontSize: '13px', backgroundColor: '#ff4500', color: 'white', border: '1px solid #ff4500', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e03e00'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ff4500'; }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default Product