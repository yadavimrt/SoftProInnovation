import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const getUserStorageKey = (prefix = 'softpro_cart') => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      const uid = parsed._id || parsed.id || parsed.email;
      if (uid) return `${prefix}_${uid}`;
    } catch (e) {}
  }
  return `${prefix}_user`;
};

export const CartProvider = ({ children }) => {
  // Cart Items State
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storageKey = getUserStorageKey('softpro_cart');
      if (!storageKey) return [];
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Wishlist Items State
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const storageKey = getUserStorageKey('softpro_wishlist');
      if (!storageKey) return [];
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Sync state on user login change
  useEffect(() => {
    const cartKey = getUserStorageKey('softpro_cart');
    if (cartKey) {
      const savedCart = localStorage.getItem(cartKey);
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    } else {
      setCartItems([]);
    }

    const wishlistKey = getUserStorageKey('softpro_wishlist');
    if (wishlistKey) {
      const savedWishlist = localStorage.getItem(wishlistKey);
      setWishlistItems(savedWishlist ? JSON.parse(savedWishlist) : []);
    } else {
      setWishlistItems([]);
    }
  }, []);

  // Persist Cart
  useEffect(() => {
    try {
      const storageKey = getUserStorageKey('softpro_cart');
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
      }
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cartItems]);

  // Persist Wishlist
  useEffect(() => {
    try {
      const storageKey = getUserStorageKey('softpro_wishlist');
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(wishlistItems));
      }
    } catch (e) {
      console.error('Error saving wishlist to localStorage', e);
    }
  }, [wishlistItems]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, 3000);
  };

  // Add Item to Cart (Requires Login)
  const addToCart = (product, quantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login or register to add products to your cart!', 'warning');
      return false;
    }

    if (!product) return false;
    const pId = product._id || product.id;
    const qtyToAdd = Number(quantity) || 1;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => (item._id || item.id) === pId);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + qtyToAdd,
        };
        showToast(`Updated quantity for ${product.name || product.title}`, 'success');
        return updated;
      } else {
        const newItem = {
          _id: pId,
          id: pId,
          name: product.name || product.title || 'Product',
          price: Number(product.price) || 0,
          compareprice: Number(product.compareprice) || 0,
          thumbnail: product.thumbnail || product.image || (product.images && product.images[0]) || '',
          images: product.images || [],
          category: product.category_id?.category || product.category || 'Electronics',
          quantity: qtyToAdd,
          stockstatus: product.stockstatus || 'In Stock',
        };
        showToast(`Added ${qtyToAdd > 1 ? `${qtyToAdd} × ` : ''}${newItem.name} to Cart`, 'success');
        return [...prevItems, newItem];
      }
    });
    return true;
  };

  // Buy Now Action
  const buyNow = (product, quantity = 1, navigate) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login or register to buy products!', 'warning');
      if (navigate) navigate('/login');
      return false;
    }

    const added = addToCart(product, quantity);
    if (added && navigate) {
      navigate('/cart');
    }
    return added;
  };

  // Wishlist Actions
  const toggleWishlist = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('Please login or register to manage your wishlist!', 'warning');
      return false;
    }

    if (!product) return false;
    const pId = product._id || product.id;

    let isAdded = false;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => (item._id || item.id) === pId);
      if (exists) {
        showToast(`Removed ${product.name || product.title} from Wishlist`, 'info');
        return prev.filter((item) => (item._id || item.id) !== pId);
      } else {
        isAdded = true;
        const newItem = {
          _id: pId,
          id: pId,
          name: product.name || product.title || 'Product',
          price: Number(product.price) || 0,
          compareprice: Number(product.compareprice) || 0,
          thumbnail: product.thumbnail || product.image || (product.images && product.images[0]) || '',
          images: product.images || [],
          category: product.category_id?.category || product.category || 'Electronics',
          stockstatus: product.stockstatus || 'In Stock',
          rating: product.rating || 4.8,
        };
        showToast(`Added ${newItem.name} to Wishlist`, 'success');
        return [...prev, newItem];
      }
    });
    return isAdded;
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlistItems.some((item) => (item._id || item.id) === productId);
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => (item._id || item.id) !== productId));
    showToast('Removed item from Wishlist', 'info');
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Remove Item from Cart
  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => (item._id || item.id) !== productId));
    showToast('Item removed from cart', 'info');
  };

  // Update Item Quantity
  const updateQuantity = (productId, newQuantity) => {
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => ((item._id || item.id) === productId ? { ...item, quantity: qty } : item))
    );
  };

  // Clear Entire Cart
  const clearCart = () => {
    setCartItems([]);
    showToast('Cart cleared', 'info');
  };

  // Total Item Count (sum of quantities)
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
  };

  // Total Price Calculation
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        buyNow,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        getWishlistCount,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        toast,
        showToast,
      }}
    >
      {children}
      {/* Global Toast for Cart & Wishlist Actions */}
      {toast?.message && (
        <div
          className={`position-fixed bottom-0 end-0 m-4 p-3 rounded-3 shadow-lg z-3 d-flex align-items-center gap-2 ${
            toast.type === 'warning'
              ? 'bg-warning text-dark border border-warning'
              : toast.type === 'danger'
              ? 'bg-danger text-white'
              : toast.type === 'info'
              ? 'bg-primary text-white'
              : 'bg-dark text-white'
          }`}
          style={{ zIndex: 9999, animation: 'fadeIn 0.2s ease-in-out' }}
        >
          <i
            className={`bi ${
              toast.type === 'warning'
                ? 'bi-exclamation-triangle-fill text-dark'
                : toast.type === 'danger'
                ? 'bi-x-circle-fill'
                : toast.type === 'info'
                ? 'bi-info-circle-fill'
                : 'bi-check-circle-fill text-success'
            } fs-5`}
          ></i>
          <span className="fw-medium">{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
