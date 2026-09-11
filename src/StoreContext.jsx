import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

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
  const [cart,     setCart]     = useState(() => load("tm_cart",     []))
  const [wishlist, setWishlist] = useState(() => load("tm_wishlist", []))
  const [orders,   setOrders]   = useState(() => load("tm_orders",   []))

  useEffect(() => save("tm_cart",     cart),     [cart])
  useEffect(() => save("tm_wishlist", wishlist), [wishlist])
  useEffect(() => save("tm_orders",   orders),   [orders])

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
  const placeOrder = useCallback((items, address, total) => {
    const order = {
      id:      Date.now(),
      date:    new Date().toISOString(),
      address,
      items:   items.map(i => ({ id: i.id, title: i.title, brand: i.brand, thumbnail: i.thumbnail, price: i.price, qty: i.qty })),
      total,
      status: "Confirmed",
    }
    setOrders(prev => [order, ...prev])
    setCart([])
  }, [])

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
        <OrdersContext.Provider value={{ orders, placeOrder }}>
          {children}
        </OrdersContext.Provider>
      </WishlistContext.Provider>
    </CartContext.Provider>
  )
}

export const useCart     = () => useContext(CartContext)
export const useWishlist = () => useContext(WishlistContext)
export const useOrders   = () => useContext(OrdersContext)
