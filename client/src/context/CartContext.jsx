import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

// Safely check currently authenticated user session
const getAuthenticatedUser = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Safely load initial data across user-specific keys
const loadInitialData = (prefix) => {
  try {
    const user = getAuthenticatedUser();

    // Both Cart and Wishlist strictly require an authenticated user session
    if (!user) {
      try {
        localStorage.removeItem(prefix);
      } catch {
        // ignore
      }
      return [];
    }

    const uid = user._id || user.id;
    if (uid) {
      const userScoped = localStorage.getItem(`${prefix}_${uid}`);
      if (userScoped) {
        const parsed = JSON.parse(userScoped);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }

    const direct = localStorage.getItem(prefix);
    if (direct) {
      const parsed = JSON.parse(direct);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(`Error loading initial ${prefix}:`, e);
  }
  return [];
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => loadInitialData('softpro_cart'));
  const [wishlistItems, setWishlistItems] = useState(() => loadInitialData('softpro_wishlist'));
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Sync state on user session change or cross-tab storage change
  const syncStorage = useCallback(() => {
    const user = getAuthenticatedUser();
    if (!user) {
      setCartItems([]);
      setWishlistItems([]);
      try {
        localStorage.removeItem('softpro_cart');
        localStorage.removeItem('softpro_wishlist');
      } catch {
        // ignore
      }
    } else {
      setCartItems(loadInitialData('softpro_cart'));
      setWishlistItems(loadInitialData('softpro_wishlist'));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('userSessionChange', syncStorage);
    window.addEventListener('storage', syncStorage);

    return () => {
      window.removeEventListener('userSessionChange', syncStorage);
      window.removeEventListener('storage', syncStorage);
    };
  }, [syncStorage]);

  // Persist Cart (Only for authenticated user)
  useEffect(() => {
    try {
      const user = getAuthenticatedUser();
      if (user) {
        localStorage.setItem('softpro_cart', JSON.stringify(cartItems));
        const uid = user._id || user.id;
        if (uid) localStorage.setItem(`softpro_cart_${uid}`, JSON.stringify(cartItems));
      } else {
        localStorage.removeItem('softpro_cart');
      }
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cartItems]);

  // Persist Wishlist (Only for authenticated user)
  useEffect(() => {
    try {
      const user = getAuthenticatedUser();
      if (user) {
        localStorage.setItem('softpro_wishlist', JSON.stringify(wishlistItems));
        const uid = user._id || user.id;
        if (uid) localStorage.setItem(`softpro_wishlist_${uid}`, JSON.stringify(wishlistItems));
      } else {
        localStorage.removeItem('softpro_wishlist');
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

  // Add Item to Cart (Requires Authentication)
  const addToCart = (product, quantity = 1, navigate) => {
    const user = getAuthenticatedUser();
    if (!user) {
      showToast('Please log in first to add items to your cart!', 'warning');
      if (navigate) {
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 1200);
      }
      return false;
    }

    if (!product) return false;
    const pId = String(product._id || product.id || '');
    if (!pId) return false;
    const qtyToAdd = Number(quantity) || 1;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => String(item._id || item.id) === pId);

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
          compareprice: Number(product.compareprice) || Number(product.originalPrice) || 0,
          thumbnail: product.thumbnail || product.image || (product.images && product.images[0]) || '',
          images: product.images || (product.thumbnail ? [product.thumbnail] : []),
          category: product.category_id?.category || product.category_id?.name || product.category || 'Electronics',
          quantity: qtyToAdd,
          stockstatus: product.stockstatus || 'In Stock',
        };
        showToast(`Added ${qtyToAdd > 1 ? `${qtyToAdd} × ` : ''}${newItem.name} to Cart`, 'success');
        return [...prevItems, newItem];
      }
    });
    return true;
  };

  // Buy Now Action (Requires Authentication)
  const buyNow = (product, quantity = 1, navigate) => {
    const user = getAuthenticatedUser();
    if (!user) {
      showToast('Please log in first to purchase this product!', 'warning');
      if (navigate) {
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 1200);
      }
      return false;
    }
    const added = addToCart(product, quantity, navigate);
    if (added && navigate) {
      navigate('/cart');
    }
    return added;
  };

  // Wishlist Actions (Requires Authentication)
  const toggleWishlist = (product, navigate) => {
    const user = getAuthenticatedUser();
    if (!user) {
      showToast('Please log in first to manage your wishlist!', 'warning');
      if (navigate) {
        setTimeout(() => navigate('/login'), 1000);
      } else {
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 1200);
      }
      return false;
    }

    if (!product) return false;
    const pId = String(product._id || product.id || '');
    if (!pId) return false;

    let isAdded = false;
    setWishlistItems((prev) => {
      const exists = prev.some((item) => String(item._id || item.id) === pId);
      if (exists) {
        showToast(`Removed ${product.name || product.title || 'item'} from Wishlist`, 'info');
        return prev.filter((item) => String(item._id || item.id) !== pId);
      } else {
        isAdded = true;
        const newItem = {
          _id: pId,
          id: pId,
          name: product.name || product.title || 'Product',
          price: Number(product.price) || 0,
          compareprice: Number(product.compareprice) || Number(product.originalPrice) || 0,
          thumbnail: product.thumbnail || product.image || (product.images && product.images[0]) || '',
          images: product.images || (product.thumbnail ? [product.thumbnail] : []),
          category: product.category_id?.category || product.category_id?.name || product.category || 'Electronics',
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
    const user = getAuthenticatedUser();
    if (!user || !productId) return false;
    const targetId = String(productId);
    return wishlistItems.some((item) => String(item._id || item.id) === targetId);
  };

  const removeFromWishlist = (productId) => {
    const user = getAuthenticatedUser();
    if (!user) return;
    const targetId = String(productId);
    setWishlistItems((prev) => prev.filter((item) => String(item._id || item.id) !== targetId));
    showToast('Removed item from Wishlist', 'info');
  };

  const getWishlistCount = () => {
    const user = getAuthenticatedUser();
    if (!user) return 0;
    return wishlistItems.length;
  };

  // Remove Item from Cart
  const removeFromCart = (productId) => {
    const targetId = String(productId);
    setCartItems((prev) => prev.filter((item) => String(item._id || item.id) !== targetId));
    showToast('Item removed from cart', 'info');
  };

  // Update Item Quantity
  const updateQuantity = (productId, newQuantity) => {
    const targetId = String(productId);
    const qty = Number(newQuantity);
    if (qty <= 0) {
      removeFromCart(targetId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (String(item._id || item.id) === targetId ? { ...item, quantity: qty } : item))
    );
  };

  // Clear Entire Cart
  const clearCart = () => {
    setCartItems([]);
    showToast('Cart cleared', 'info');
  };

  // Total Item Count (sum of quantities - returns 0 if not logged in)
  const getCartCount = () => {
    const user = getAuthenticatedUser();
    if (!user) return 0;
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
  };

  // Total Price Calculation
  const getCartTotal = () => {
    const user = getAuthenticatedUser();
    if (!user) return 0;
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

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
