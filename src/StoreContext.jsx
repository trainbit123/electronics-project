import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./AuthContext"

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

const CartContext    = createContext(null)
const WishlistContext = createContext(null)
const OrdersContext  = createContext(null)

export function StoreProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth()
  const [cart,     setCart]     = useState(() => load("tm_cart",     []))
  const [wishlist, setWishlist] = useState(() => load("tm_wishlist", []))
  const [orders,   setOrders]   = useState(() => load("tm_orders",   []))
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => save("tm_cart",     cart),     [cart])
  useEffect(() => save("tm_wishlist", wishlist), [wishlist])
  useEffect(() => save("tm_orders",   orders),   [orders])

  // Sync user orders from backend whenever token/user changes
  const fetchOrders = useCallback(async () => {
    if (!token) return
    setOrdersLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.orders && Array.isArray(data.orders)) {
          // Normalize orders to match expected frontend schema
          const mapped = data.orders.map(o => ({
            id: o._id || o.id,
            date: o.createdAt || o.date || new Date().toISOString(),
            address: o.address,
            items: o.items,
            total: o.total,
            status: o.status || "Confirmed",
          }))
          setOrders(mapped)
        }
      }
    } catch (err) {
      console.debug("Backend fetchOrders unavailable (offline):", err.message)
    } finally {
      setOrdersLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated, fetchOrders])

  /* ── Cart ── */
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }, [])

  const removeFromCart = useCallback(id => setCart(prev => prev.filter(i => i.id !== id)), [])

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)

  /* ── Orders ── */
  const placeOrder = useCallback(async (items, address, total) => {
    const formattedItems = items.map(i => ({
      id: i.id,
      title: i.title,
      brand: i.brand || "",
      thumbnail: i.thumbnail || "",
      price: i.price,
      qty: i.qty || 1,
    }))

    const localOrder = {
      id: Date.now(),
      date: new Date().toISOString(),
      address,
      items: formattedItems,
      total,
      status: "Confirmed",
    }

    // Try posting to backend API
    try {
      const headers = { "Content-Type": "application/json" }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: formattedItems,
          address,
          total,
          paymentMethod: "Cash on Delivery",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.order) {
          const newOrder = {
            id: data.order._id || data.order.id,
            date: data.order.createdAt || localOrder.date,
            address: data.order.address || address,
            items: data.order.items || formattedItems,
            total: data.order.total || total,
            status: data.order.status || "Confirmed",
          }
          setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)])
          setCart([])
          return newOrder
        }
      }
    } catch (e) {
      console.warn("Backend order creation fallback to local:", e.message)
    }

    // Fallback: save locally
    setOrders(prev => [localOrder, ...prev])
    setCart([])
    return localOrder
  }, [token])

  /* ── Wishlist ── */
  const toggleWishlist = useCallback((product) => {
    setWishlist(prev =>
      prev.find(i => i.id === product.id)
        ? prev.filter(i => i.id !== product.id)
        : [...prev, product]
    )
  }, [])

  const inWishlist = useCallback(id => wishlist.some(i => i.id === id), [wishlist])

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      <WishlistContext.Provider value={{ wishlist, toggleWishlist, inWishlist, wishlistCount: wishlist.length }}>
        <OrdersContext.Provider value={{ orders, ordersLoading, placeOrder, fetchOrders }}>
          {children}
        </OrdersContext.Provider>
      </WishlistContext.Provider>
    </CartContext.Provider>
  )
}

export const useCart     = () => useContext(CartContext)
export const useWishlist = () => useContext(WishlistContext)
export const useOrders   = () => useContext(OrdersContext)
