import { useState, useMemo, useEffect } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../../context/CartContext'
import QuickViewModal from '../../components/QuickViewModal'
import { API_BASE_URL } from '../../config/api'
import { formatImg } from '../../utils/imageUrl'

const Product = () => {
  const navigate = useNavigate()
  const { addToCart, buyNow, toggleWishlist, isInWishlist } = useCart()
  const [searchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'All')
  const [prevCategoryFromUrl, setPrevCategoryFromUrl] = useState(categoryFromUrl)
  if (categoryFromUrl !== prevCategoryFromUrl) {
    setPrevCategoryFromUrl(categoryFromUrl)
    setSelectedCategory(categoryFromUrl || 'All')
  }

  const [categoryList, setCategoryList] = useState(['All'])
  const [allProductsList, setallProductsList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('Featured')
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [cardImgMap, setCardImgMap] = useState({})

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
    const prodId = product._id || product.id
    if (prodId) {
      navigate(`/product/${prodId}`)
    }
  }

  const closeQuickView = () => {
    setQuickViewProduct(null)
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
    let isMounted = true
    const fetchCategories = async () => {
      try {
        const [catRes, prodRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/category/show?status=active`),
          axios.get(`${API_BASE_URL}/api/product/show`)
        ])

        if (!isMounted) return

        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data)) {
          const names = catRes.value.data.map(c => c.category || c.name).filter(Boolean)
          setCategoryList(['All', ...new Set(names)])
        }

        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data)) {
          setallProductsList(prodRes.value.data)
        }
      } catch {
        // fallback handles errors gracefully
      }
    }
    fetchCategories()
    return () => {
      isMounted = false
    }
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

              const allImages = getProductImageList(item)
              const currentIdx = cardImgMap[pId] ?? 0
              const safeIdx = allImages.length > 0 ? currentIdx % allImages.length : 0
              const currentActiveImg = allImages[safeIdx] || pImg

              const slidePrev = (e) => {
                e.stopPropagation()
                e.preventDefault()
                setCardImgMap((prev) => ({
                  ...prev,
                  [pId]: (currentIdx - 1 + allImages.length) % allImages.length,
                }))
              }

              const slideNext = (e) => {
                e.stopPropagation()
                e.preventDefault()
                setCardImgMap((prev) => ({
                  ...prev,
                  [pId]: (currentIdx + 1) % allImages.length,
                }))
              }

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
                      type="button"
                      className="btn rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center p-0 border"
                      style={{
                        width: '36px',
                        height: '36px',
                        transition: 'all 0.25s ease',
                        backgroundColor: isFav ? '#fee2e2' : 'rgba(255,255,255,0.95)',
                        borderColor: isFav ? '#fca5a5' : '#e2e8f0',
                        cursor: 'pointer',
                        zIndex: 20
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(item)
                      }}
                      title={isFav ? "Remove from Wishlist" : "Add to Wishlist"}
                      aria-label="Wishlist"
                    >
                      <i className={`bi ${isFav ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'} fs-6`}></i>
                    </button>

                    {/* Image Section with Quick View Hover & Slider Arrows */}
                    <div className="product-img-box d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden bg-white" style={{ height: '230px' }}>
                      <img
                        src={currentActiveImg}
                        alt={item.name}
                        className="img-fluid"
                        style={{ maxHeight: '160px', objectFit: 'contain', transition: 'transform 0.4s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />

                      {/* Card Image Slide Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="product-card-arrow-btn prev"
                            onClick={slidePrev}
                            title="Previous image"
                            aria-label="Previous image"
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                          <button
                            type="button"
                            className="product-card-arrow-btn next"
                            onClick={slideNext}
                            title="Next image"
                            aria-label="Next image"
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </>
                      )}
                      
                      {/* Quick View on Hover (Exact Pill Button) */}
                      <div
                        className="product-quickview-overlay"
                        onClick={() => openQuickView(item)}
                        title="Click to Quick View"
                      >
                        <button
                          type="button"
                          className="product-quickview-pill-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickView(item);
                          }}
                        >
                          <i className="bi bi-eye"></i> Quick View
                        </button>
                      </div>
                    </div>

                    {/* Content Section - Modern E-commerce Redesign */}
                    <div className="product-card-details d-flex flex-column text-start">
                      {/* Top Meta: Category Pill + Stock Status */}
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                        <span className="product-cat-pill">
                          {catName}
                        </span>
                        <div className="stock-status-wrap">
                          {item.stockstatus === 'In Stock' || item.stockstatus === 'active' || item.inStock !== false ? (
                            <>
                              <span className="stock-dot in-stock"></span>
                              <span className="text-success">In Stock</span>
                            </>
                          ) : (
                            <>
                              <span className="stock-dot out-of-stock"></span>
                              <span className="text-danger">{item.stockstatus || 'Out of Stock'}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Product Title */}
                      <h6
                        className="product-title-heading"
                        title={item.name}
                      >
                        <Link to={`/product/${pId}`} className="text-decoration-none text-dark">
                          {item.name}
                        </Link>
                      </h6>

                      {/* Rating & Reviews (Only show if user has reviewed) */}
                      {Boolean(item.reviews && Number(item.reviews) > 0 && item.rating) && (
                        <div className="product-rating-box">
                          <div className="product-rating-score-chip">
                            <i className="bi bi-star-fill"></i>
                            <span>{item.rating}</span>
                          </div>
                          <span className="product-review-count">
                            ({item.reviews} {item.reviews === 1 ? 'review' : 'reviews'})
                          </span>
                        </div>
                      )}

                      {/* Pricing & Action Buttons */}
                      <div className="mt-auto">
                        <div className="product-pricing-bar">
                          <span className="product-price-current">
                            ₹{pPrice.toLocaleString('en-IN')}
                          </span>
                          {pComparePrice > pPrice && (
                            <span className="product-price-compare">
                              ₹{pComparePrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {discountPercent > 0 && (
                            <span className="product-discount-pill">
                              {discountPercent}% OFF
                            </span>
                          )}
                        </div>

                        {/* Action Buttons: Add to Cart & Buy Now */}
                        <div className="d-flex gap-2 w-100 mt-2">
                          <button
                            type="button"
                            className="btn product-btn-cart flex-fill"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              const added = addToCart(item, 1, navigate)
                              if (added) navigate('/cart')
                            }}
                            disabled={item.stockstatus === 'Out of Stock'}
                            title="Add to Cart"
                          >
                            <i className="bi bi-cart-plus fs-6"></i>
                            <span>Add to Cart</span>
                          </button>
                          <button
                            type="button"
                            className="btn product-btn-buy flex-fill"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              buyNow(item, 1, navigate)
                            }}
                            disabled={item.stockstatus === 'Out of Stock'}
                            title="Buy Now"
                          >
                            <i className="bi bi-lightning-charge-fill fs-6"></i>
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* LUXURY PROFESSIONAL QUICK VIEW MODAL */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={closeQuickView}
        />
      )}

      <Footer />
    </>
  )
}

export default Product