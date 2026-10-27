import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useCart, useWishlist } from "./StoreContext"
import { useAuth } from "./AuthContext"

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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, isAuthenticated, logout, openAuthModal, isAdmin } = useAuth()

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

            {/* Authentication / User Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors py-1 px-2 rounded-lg hover:bg-white/10"
                  aria-label="User account"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-blue-400" />
                  ) : (
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold max-w-[90px] truncate">{user?.name}</span>
                    <span className="text-[10px] text-blue-300 font-medium">{isAdmin ? "Admin" : "Customer"}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 text-gray-800"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        {user?.role || "user"}
                      </span>
                    </div>

                    <Link
                      to="/my-orders"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                      </svg>
                      Wishlist ({wishlistCount})
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm shadow-blue-500/20 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Sign In</span>
              </button>
            )}

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
          {/* User Section in Mobile Menu */}
          <div className="py-2.5 border-b border-white/10 mb-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-blue-400" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-white">{user?.name}</p>
                    <p className="text-[10px] text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout()
                    setMenuOpen(false)
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded bg-red-500/10"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  openAuthModal("login")
                  setMenuOpen(false)
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg text-center shadow-md shadow-blue-500/20"
              >
                Sign In / Register
              </button>
            )}
          </div>

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
