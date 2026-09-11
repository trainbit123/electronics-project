import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useCart, useWishlist } from "./StoreContext"

const navLinks = [
  { label: "Home",         path: "/" },
  { label: "Mobiles",      path: "/mobiles" },
  { label: "Laptops",      path: "/laptops" },
  { label: "Tablets",      path: "/tablets" },
  { label: "Accessories",  path: "/accessories" },
  { label: "Smartwatches", path: "/smartwatches" },
  { label: "Gaming",       path: "/gaming" },
  { label: "Deals",        path: "/deals" },
  { label: "My Orders",    path: "/my-orders" },
]

function SearchBar({ className = "", placeholder = "Search for mobiles, laptops, headphones..." }) {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center bg-white rounded-md overflow-hidden ${className}`}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 text-sm text-gray-700 outline-none bg-transparent"
      />
      <button type="submit" className="bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
        </svg>
      </button>
    </form>
  )
}

function Header() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  return (
    <header className="sticky top-0 z-50">
      {/* TOP BAR */}
      <div className="bg-[#0d1b2e] px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">

          {/* Hamburger */}
          <button className="lg:hidden text-white p-1 shrink-0" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-black text-sm">M</span>
            </div>
            <span className="text-white font-bold text-lg sm:text-xl tracking-tight">TechMatch</span>
          </Link>

          {/* Search — desktop */}
          <SearchBar className="hidden sm:flex flex-1 max-w-2xl" />

          {/* Right actions */}
          <div className="flex items-center gap-3 sm:gap-5 ml-auto shrink-0">

            {/* Location */}
            <button className="hidden md:flex items-center gap-1 text-white hover:text-blue-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
              </svg>
              <span className="text-sm font-medium">Vijayawada</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {/* Favourites */}
            <Link to="/wishlist" className="relative flex items-center text-white hover:text-red-400 transition-colors" aria-label="Wishlist">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill={wishlistCount > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative flex items-center gap-1.5 text-white hover:text-blue-300 transition-colors" aria-label="Cart">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-medium">Cart</span>
            </Link>

          </div>
        </div>

        {/* Search — mobile */}
        <div className="sm:hidden mt-2">
          <SearchBar placeholder="Search for mobiles, laptops..." />
        </div>
      </div>

      {/* DESKTOP NAV */}
      <nav className="hidden lg:block bg-[#0a1628] border-t border-white/10 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path
            return (
              <Link key={link.label} to={link.path}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors relative shrink-0 ${
                  isActive
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-blue-500 after:rounded-t-sm"
                    : "text-gray-300 hover:text-white"
                }`}>
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <div className="lg:hidden bg-[#0a1628] border-t border-white/10 px-4 py-2">
          <div className="flex items-center gap-1 text-blue-300 py-2 border-b border-white/10 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
            </svg>
            <span className="text-sm font-medium">Vijayawada</span>
          </div>
          {navLinks.map(link => {
            const isActive = location.pathname === link.path
            return (
              <Link key={link.label} to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block py-2.5 px-2 text-sm font-medium border-b border-white/5 last:border-0 ${
                  isActive ? "text-blue-400" : "text-gray-300 hover:text-white"
                }`}>
                {link.label}
              </Link>
            )
          })}
        </div>
      )}
    </header>
  )
}

export default Header
