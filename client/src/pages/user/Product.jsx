import React, { useState, useMemo, useEffect } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../../context/CartContext'

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

const Product = () => {
  const navigate = useNavigate()
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'All')
  const [categories, setCategory] = useState([])
  const [categoryList, setCategoryList] = useState(categories)
  const [allProductsList, setallProductsList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Featured')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [quickViewIdx, setQuickViewIdx] = useState(0)
  const [modalQty, setModalQty] = useState(1)

  const formatImg = (imgPath) => {
    if (!imgPath) return 'https://placehold.co/400x400?text=No+Image'
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
      return imgPath
    }
    return `http://localhost:5000/${imgPath.replace(/\\/g, '/')}`
  }

  const getProductImageList = (item) => {
    if (!item) return []
    const all = []
    if (item.thumbnail) all.push(formatImg(item.thumbnail))
    if (Array.isArray(item.images)) {
      item.images.forEach((img) => {
        const formatted = formatImg(img)
        if (formatted && !all.includes(formatted)) {
          all.push(formatted)
        }
      })
    }
    return all.length > 0 ? all : ['https://placehold.co/400x400?text=No+Image']
  }

  const openQuickView = (product) => {
    setQuickViewProduct(product)
    setQuickViewIdx(0)
  }

  const closeQuickView = () => {
    setQuickViewProduct(null)
    setQuickViewIdx(0)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeQuickView()
    }
    if (quickViewProduct) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [quickViewProduct])

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        //categories
        const res = await axios.get('http://localhost:5000/api/category/show?status=active')
        // console.log(res);
        
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategory(res.data)
          const names = res.data.map(c => c.category || c.name).filter(Boolean)
          const merged = ['All', ...new Set([...names, ...categories.filter(c => c !== 'All')])]
          setCategoryList(merged)
        }
        //products
        const res1 = await axios.get('http://localhost:5000/api/product/show');
        // console.log(res1.data[0].category_id.category);
        
        setallProductsList(res1.data)
      } catch (e) {
        // use fallback categories
      }
    }
    fetchCategories()
  }, [])

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return allProductsList
      .filter((item) => {
        const catName = item?.category_id?.category || item?.category || ''
        const productName = item?.name || item?.title || ''

        const matchesCategory =
          selectedCategory === 'All' ||
          catName.toLowerCase().trim() === selectedCategory.toLowerCase().trim() ||
          catName.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(catName.toLowerCase())

        const matchesSearch =
          productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          catName.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesCategory && matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === 'Price: Low to High') return (a.price || 0) - (b.price || 0)
        if (sortBy === 'Price: High to Low') return (b.price || 0) - (a.price || 0)
        if (sortBy === 'Name: A-Z') return (a.name || a.title || '').localeCompare(b.name || b.title || '')
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      })
  }, [allProductsList, selectedCategory, searchTerm, sortBy])
 
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
              Browse {allProductsList.length} electronics components, boards, and accessories.
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
            {categoryList.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`btn category-pill-btn ${selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)} >
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
            {filteredProducts.map((item) => {
              const pId = item._id || item.id
              const isFav = isInWishlist(pId)
              const pImg = formatImg(item.thumbnail)
              const catName = item.category_id?.category || item.category || 'Electronics'
              const pPrice = Number(item.price) || 0
              const pComparePrice = Number(item.compareprice) || 0
              const discountPercent = pComparePrice > pPrice ? Math.round(((pComparePrice - pPrice) / pComparePrice) * 100) : 0

              return (
                <div key={pId} className="col-12 col-sm-6 col-md-6 col-lg-3">
                  <div
                    className="card h-100 overflow-hidden shadow-sm position-relative border-0 rounded-4"
                    style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)'
                      e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)'
                    }}
                  >
                    {/* Badges */}
                    <div className="position-absolute top-0 start-0 p-2 z-3 d-flex flex-column gap-1 mt-2 ms-2">
                      {discountPercent > 0 && (
                        <span className="badge bg-warning text-dark rounded-1 px-2 py-1 shadow-sm fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                          {discountPercent}% OFF
                        </span>
                      )}
                      {item.badge && (
                        <span className={`badge ${item.badge === 'New' ? 'bg-success' : 'bg-primary'} rounded-1 px-2 py-1 shadow-sm fw-semibold`} style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                          {item.badge}
                        </span>
                      )}
                      {item.featured && !item.badge && discountPercent === 0 && (
                        <span className="badge bg-info text-dark rounded-1 px-2 py-1 shadow-sm fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Wishlist Button (Always visible on top right) */}
                    <button
                      className="btn btn-white rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center p-0 z-3 border"
                      style={{
                        width: '36px',
                        height: '36px',
                        transition: 'all 0.2s',
                        backgroundColor: 'rgba(255,255,255,0.95)'
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(item)
                      }}
                      title={isInWishlist(pId) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <i className={`bi ${isInWishlist(pId) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'} fs-6`}></i>
                    </button>

                    {/* Image Section with Quick View Hover */}
                    <div className="product-img-box d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden bg-white" style={{ height: '230px' }}>
                      <img
                        src={pImg}
                        alt={item.name}
                        className="img-fluid"
                        style={{ maxHeight: '160px', objectFit: 'contain', transition: 'transform 0.4s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      
                      {/* Quick View on Hover */}
                      <div
                        className="position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center" 
                        style={{ backgroundColor: 'rgba(15, 23, 42, 0.35)', opacity: 0, transition: 'opacity 0.3s' }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                      >
                        <button
                          type="button"
                          className="btn btn-dark rounded-pill shadow-lg px-3 py-2 fw-semibold d-flex align-items-center gap-1.5"
                          style={{ fontSize: '13px', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                          onClick={() => openQuickView(item)}
                        >
                          <i className="bi bi-eye"></i> Quick View
                        </button>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="card-body p-3 p-lg-4 d-flex flex-column bg-white text-start">
                      {/* Category */}
                      <span className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                        {catName}
                      </span>
                      
                      {/* Title */}
                      <h6
                        className="card-title fw-bold text-dark mb-1"
                        style={{
                          fontSize: '15px',
                          minHeight: '44px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}
                        onClick={() => openQuickView(item)}
                        title={item.name}
                      >
                        {item.name}
                      </h6>
                      
                      {/* Rating & Reviews */}
                      <div className="d-flex align-items-center mb-2 gap-1" style={{ fontSize: '12px' }}>
                        <div className="text-warning d-flex">
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className={(item.rating || 4.8) >= 4.8 ? "bi bi-star-fill" : "bi bi-star-half"}></i>
                        </div>
                        <span className="fw-bold ms-1 text-dark">{item.rating || '4.8'}</span>
                        <span className="text-muted">({item.reviews || 24} reviews)</span>
                      </div>

                      {/* Stock Status */}
                      <div className="mb-2" style={{ fontSize: '12.5px' }}>
                        {item.stockstatus === 'In Stock' || item.stockstatus === 'active' || item.inStock !== false ? (
                          <span className="text-success fw-semibold"><i className="bi bi-check-circle-fill me-1"></i>In Stock</span>
                        ) : (
                          <span className="text-danger fw-semibold"><i className="bi bi-x-circle-fill me-1"></i>{item.stockstatus || 'Out of Stock'}</span>
                        )} 
                      </div>

                      {/* Price */}
                      <div className="mt-auto d-flex flex-column mb-3 border-top pt-3">
                        <div className="d-flex align-items-baseline gap-2">
                          <span className="fw-bold fs-5" style={{ color: '#ff4500' }}>
                            ₹{pPrice.toLocaleString('en-IN')}
                          </span>
                          {pComparePrice > pPrice && (
                            <span className="text-muted text-decoration-line-through small">
                              ₹{pComparePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Add to Cart & Buy Now */}
                      <div className="d-flex gap-2 w-100 mt-auto">
                        <button
                          type="button"
                          className="btn btn-outline-primary flex-grow-1 btn-sm py-2 fw-semibold rounded-2"
                          style={{ fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(item)
                          }}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Add to Cart
                        </button>
                        <button
                          type="button"
                          className="btn flex-grow-1 btn-sm py-2 fw-semibold rounded-2 text-white"
                          style={{ fontSize: '12px', backgroundColor: '#ff4500', border: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            buyNow(item, 1, navigate)
                          }}
                        >
                          <i className="bi bi-lightning-fill me-1"></i> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL COMPONENT */}
      {quickViewProduct && (() => {
        const modalImages = getProductImageList(quickViewProduct)
        const safeIdx = Math.min(quickViewIdx, Math.max(0, modalImages.length - 1))
        const currentModalImg = modalImages[safeIdx] || ''
        const pId = quickViewProduct._id || quickViewProduct.id
        const isFav = isInWishlist(pId)
        const catName = quickViewProduct.category_id?.category || quickViewProduct.category || 'Electronics'
        const price = Number(quickViewProduct.price) || 0
        const comparePrice = Number(quickViewProduct.compareprice) || 0
        const discountPercent = comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0
        const isInStock = quickViewProduct.stockstatus === 'In Stock' || quickViewProduct.stockstatus === 'active' || quickViewProduct.inStock !== false

        const handlePrevImage = () => {
          setQuickViewIdx((prev) => (prev - 1 + modalImages.length) % modalImages.length)
        }

        const handleNextImage = () => {
          setQuickViewIdx((prev) => (prev + 1) % modalImages.length)
        }

        return (
          <div
            className="modal show d-block"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 1055,
              transition: 'opacity 0.2s ease-in-out'
            }}
            onClick={closeQuickView}
          >
            <div
              className="modal-dialog modal-lg modal-dialog-centered"
              style={{ maxWidth: '860px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden bg-white text-start">
                {/* Modal Header */}
                <div className="modal-header border-bottom py-3 px-4 bg-light d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2.5 py-1.5" style={{ fontSize: '12px' }}>
                      {catName}
                    </span>
                    <span className="text-muted small">Quick Overview</span>
                  </div>
                  <button
                    type="button"
                    className="btn-close shadow-none"
                    aria-label="Close"
                    onClick={closeQuickView}
                  ></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body p-4 p-md-5">
                  <div className="row g-4 align-items-center">
                    {/* Left Column: Interactive Image Gallery */}
                    <div className="col-12 col-md-6">
                      {/* Main Image View Box */}
                      <div
                        className="position-relative bg-light rounded-4 p-3 d-flex align-items-center justify-content-center border overflow-hidden"
                        style={{ height: '320px' }}
                      >
                        <img
                          src={currentModalImg}
                          alt={quickViewProduct.name}
                          className="img-fluid"
                          style={{
                            maxHeight: '260px',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            transition: 'transform 0.3s ease'
                          }}
                        />

                        {/* Prev & Next Arrows for Gallery */}
                        {modalImages.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="btn btn-white position-absolute start-0 ms-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0 border"
                              style={{ width: '38px', height: '38px', backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 5 }}
                              onClick={handlePrevImage}
                              title="Previous Image"
                            >
                              <i className="bi bi-chevron-left fs-5"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-white position-absolute end-0 me-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0 border"
                              style={{ width: '38px', height: '38px', backgroundColor: 'rgba(255, 255, 255, 0.95)', zIndex: 5 }}
                              onClick={handleNextImage}
                              title="Next Image"
                            >
                              <i className="bi bi-chevron-right fs-5"></i>
                            </button>
                            <span
                              className="position-absolute bottom-0 end-0 mb-2 me-2 badge bg-dark bg-opacity-75 text-white rounded-pill px-2.5 py-1"
                              style={{ fontSize: '11px' }}
                            >
                              {safeIdx + 1} / {modalImages.length}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Gallery Thumbnails */}
                      {modalImages.length > 1 && (
                        <div className="d-flex gap-2 mt-3 flex-wrap justify-content-center">
                          {modalImages.map((imgUrl, i) => {
                            const isSelected = i === safeIdx
                            return (
                              <button
                                key={i}
                                type="button"
                                className="btn p-1 border rounded-3 bg-white"
                                style={{
                                  width: '58px',
                                  height: '58px',
                                  borderColor: isSelected ? '#ff4500' : '#e2e8f0',
                                  borderWidth: isSelected ? '2px' : '1px',
                                  boxShadow: isSelected ? '0 0 0 3px rgba(255, 69, 0, 0.2)' : 'none',
                                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={() => setQuickViewIdx(i)}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Thumbnail ${i + 1}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Product Info & Actions */}
                    <div className="col-12 col-md-6 d-flex flex-column">
                      {/* Brand & Stock */}
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="text-uppercase fw-semibold text-muted" style={{ fontSize: '12px', letterSpacing: '0.8px' }}>
                          {quickViewProduct.brand || 'SIPL Brand'}
                        </span>
                        {isInStock ? (
                          <span className="badge bg-success bg-opacity-10 text-success px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '12px' }}>
                            <i className="bi bi-check-circle-fill me-1"></i> In Stock
                          </span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-10 text-danger px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '12px' }}>
                            <i className="bi bi-x-circle-fill me-1"></i> Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h4 className="fw-bold text-dark mb-2" style={{ lineHeight: '1.3' }}>
                        {quickViewProduct.name}
                      </h4>

                      {/* Rating & Reviews */}
                      <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '13px' }}>
                        <div className="text-warning d-flex">
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                          <i className="bi bi-star-fill"></i>
                        </div>
                        <span className="fw-bold text-dark">{quickViewProduct.rating || '4.8'}</span>
                        <span className="text-muted">({quickViewProduct.reviews || 24} customer reviews)</span>
                      </div>

                      {/* Price Section */}
                      <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#fff5f0', border: '1px solid #ffe4d6' }}>
                        <div className="d-flex align-items-baseline gap-2">
                          <span className="fs-3 fw-bold" style={{ color: '#ff4500' }}>
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          {comparePrice > price && (
                            <span className="text-muted text-decoration-line-through fs-6">
                              ₹{comparePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {discountPercent > 0 && (
                            <span className="badge bg-danger text-white ms-auto fw-bold px-2 py-1" style={{ fontSize: '12px' }}>
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>
                        <span className="text-muted" style={{ fontSize: '11.5px' }}>Inclusive of all taxes & standard delivery</span>
                      </div>

                      {/* Description */}
                      <p className="text-muted mb-3" style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
                        {quickViewProduct.description ||
                         quickViewProduct.shortdescription ||
                         'High performance electronics component built with industry standards for reliability, durability, and top performance in modern circuits and robotics projects.'}
                      </p>

                      {/* Quantity Selector & Action Buttons */}
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <span className="fw-semibold text-muted small">Quantity:</span>
                        <div className="input-group input-group-sm" style={{ width: '110px' }}>
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            className="form-control text-center bg-white"
                            value={modalQty}
                            readOnly
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setModalQty((q) => q + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary flex-grow-1 py-2.5 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-1.5"
                          disabled={!isInStock}
                          onClick={() => {
                            addToCart(quickViewProduct, modalQty)
                          }}
                        >
                          <i className="bi bi-cart-plus fs-6"></i> Add to Cart
                        </button>

                        <button
                          type="button"
                          className="btn flex-grow-1 py-2.5 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-1.5 text-white shadow-sm"
                          style={{ backgroundColor: '#ff4500', border: 'none' }}
                          disabled={!isInStock}
                          onClick={() => {
                            buyNow(quickViewProduct, modalQty, navigate)
                            closeQuickView()
                          }}
                        >
                          <i className="bi bi-lightning-fill fs-6"></i> Buy Now
                        </button>

                        <button
                          type="button"
                          className="btn p-2.5 border rounded-3 d-flex align-items-center justify-content-center"
                          style={{ width: '46px', borderColor: '#e2e8f0', backgroundColor: '#f8fafc' }}
                          onClick={() => {
                            toggleWishlist(quickViewProduct)
                          }}
                          title={isInWishlist(pId) ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          <i className={`bi ${isInWishlist(pId) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'} fs-5`}></i>
                        </button>
                      </div>

                      {/* Assurance Badges */}
                      <div className="d-flex justify-content-between pt-3 mt-3 border-top text-muted" style={{ fontSize: '12px' }}>
                        <div className="d-flex align-items-center gap-1">
                          <i className="bi bi-shield-check text-success"></i> 100% Genuine
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <i className="bi bi-truck text-primary"></i> Fast Shipping
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <i className="bi bi-arrow-repeat text-warning"></i> Easy Returns
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      <Footer />
    </>
  )
}

export default Product