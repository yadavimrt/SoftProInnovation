import React, { useState } from 'react';
import img12 from '../assets/12.png';
import img13 from '../assets/13.png';
import img14 from '../assets/14.png';
import img15 from '../assets/15.png';
import img16 from '../assets/16.png';
import img17 from '../assets/17.png';
import img18 from '../assets/18.png';
import img19 from '../assets/19.png';

const products = [
  { id: 1, category: 'DISPLAYS', title: '7-Segment Displays', price: '₹7,200', originalPrice: '₹8,000', discount: '10% OFF', rating: 4.8, reviews: 126, inStock: true, badge: 'Sale', img: img12 },
  { id: 2, category: 'DISPLAYS', title: 'TFT Display Module', price: '₹476', originalPrice: '₹595', discount: '20% OFF', rating: 4.5, reviews: 89, inStock: true, badge: 'New', img: img13 },
  { id: 3, category: 'INDICATORS', title: '0.96 OLED LCD', price: '₹6,300', originalPrice: '₹7,000', discount: '10% OFF', rating: 4.9, reviews: 215, inStock: false, badge: '', img: img14 },
  { id: 4, category: 'INDICATORS', title: '20x4 LCD Display', price: '₹540', originalPrice: '₹600', discount: '10% OFF', rating: 4.7, reviews: 34, inStock: true, badge: '', img: img15 },
  { id: 5, category: 'MICROCONTROLLERS', title: 'Arduino UNO R3 Board', price: '₹405', originalPrice: '₹450', discount: '10% OFF', rating: 4.8, reviews: 450, inStock: true, badge: 'Best Seller', img: img16 },
  { id: 6, category: 'SENSORS', title: 'Ultrasonic Distance Sensor', price: '₹120', originalPrice: '₹150', discount: '20% OFF', rating: 4.6, reviews: 78, inStock: true, badge: '', img: img17 },
  { id: 7, category: 'MOTORS', title: 'Servo Motor SG90', price: '₹180', originalPrice: '₹200', discount: '10% OFF', rating: 4.7, reviews: 112, inStock: true, badge: '', img: img18 },
  { id: 8, category: 'POWER SUPPLIES', title: '5V Power Supply Module', price: '₹250', originalPrice: '₹300', discount: '16% OFF', rating: 4.4, reviews: 56, inStock: true, badge: 'Sale', img: img19 },
];

const FeaturedProducts = () => {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="featured-products-section py-5" style={{ backgroundColor: '#f2f0ed' }}>
      <div className="container-fluid px-3 px-xl-5">
        {/* Section Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <span className="text-uppercase small fw-semibold text-orangered tracking-wider">
              HANDPICKED FOR YOU
            </span>
            <h2 className="display-6 fw-bold mt-1 mb-2" style={{ color: '#1e3a8a' }}>
              Featured <span className="text-orangered fst-italic">Products</span>
            </h2>
            <p className="text-muted mb-0" style={{ maxWidth: '500px' }}>
              Top-rated boards and components loved by engineers, students, and hobbyists.
            </p>
          </div>
          <div className="mt-3 mt-md-0">
            <button className="btn btn-outline-secondary rounded-pill px-4 py-2 btn-sm fw-semibold">
              All Products &rarr;
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          {products.map((item) => (
            <div key={item.id} className="col">
              <div className="card h-100 overflow-hidden shadow-sm product-card position-relative border-0 rounded-4" style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
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
                </div>
                
                {/* Wishlist Button (Always visible on top right) */}
                <button
                  className="btn btn-white rounded-circle position-absolute top-0 end-0 m-3 shadow-sm d-flex align-items-center justify-content-center p-0 z-3 border"
                  style={{ width: '36px', height: '36px', transition: 'all 0.2s', backgroundColor: 'rgba(255,255,255,0.9)' }}
                  onClick={(e) => { e.preventDefault(); toggleFavorite(item.id); }}
                  title="Add to Wishlist"
                >
                  <i className={`bi ${favorites[item.id] ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'} fs-6`}></i>
                </button>

                {/* Image Section */}
                <div className="product-img-box d-flex align-items-center justify-content-center p-4 position-relative overflow-hidden bg-white" style={{ height: '230px' }}>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="img-fluid product-img"
                    style={{ maxHeight: '160px', objectFit: 'contain', transition: 'transform 0.4s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  
                  {/* Quick View on Hover */}
                  <div className="product-card-overlay position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center" 
                    style={{ backgroundColor: 'rgba(255,255,255,0.4)', opacity: 0, transition: 'opacity 0.3s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                  >
                    <button className="btn btn-dark rounded-pill shadow-sm px-4 py-2 fw-semibold btn-view-action" style={{ fontSize: '13px' }}>
                      <i className="bi bi-eye me-1"></i> Quick View
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="card-body p-3 p-lg-4 d-flex flex-column bg-white">
                  {/* Category */}
                  <span className="text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>
                    {item.category}
                  </span>
                  
                  {/* Title */}
                  <h6 className="card-title fw-bold text-dark mb-2" style={{ fontSize: '15px', minHeight: '44px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </h6>
                  
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
                  <div className="mt-auto d-flex flex-column mb-3">
                    <div className="d-flex align-items-end gap-2">
                      <span className="fw-bold fs-5" style={{ color: '#ff4500' }}>{item.price}</span>
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
  );
};

export default FeaturedProducts;
