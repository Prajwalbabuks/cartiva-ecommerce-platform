import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getCart,
  addToCart as addToCartApi,
  updateCartItem as updateCartItemApi,
  removeCartItem as removeCartItemApi,
} from "../services/cart.service";

const CartContext = createContext(null);

function normalizeCart(data) {
  return {
    items: data?.cart?.items ?? data?.items ?? [],
    subtotal: Number(data?.subtotal ?? 0),
    totalItems: Number(data?.totalItems ?? 0),
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    totalItems: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      subtotal: 0,
      totalItems: 0,
    });
    setError("");
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      clearCart();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getCart();
      setCart(normalizeCart(data));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your cart. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, clearCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearCart();
      return;
    }

    refreshCart().catch(() => {});
  }, [isAuthenticated, clearCart, refreshCart]);

  const addItem = async (productId, quantity = 1) => {
    await addToCartApi(productId, quantity);
    await refreshCart();
  };

  const updateItem = async (productId, quantity) => {
    await updateCartItemApi(productId, quantity);
    await refreshCart();
  };

  const removeItem = async (productId) => {
    await removeCartItemApi(productId);
    await refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        subtotal: cart.subtotal,
        totalItems: cart.totalItems,
        loading,
        error,
        addItem,
        updateItem,
        removeItem,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
