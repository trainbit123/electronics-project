import React, { useState } from "react"
import { useAuth } from "../AuthContext"

function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    register,
    loading,
    authError,
    setAuthError,
  } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [localErrors, setLocalErrors] = useState({})

  if (!isAuthModalOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setLocalErrors((prev) => ({ ...prev, [name]: "" }))
    if (authError) setAuthError(null)
  }

  const validate = () => {
    const errs = {}
    if (authModalMode === "register" && !formData.name.trim()) {
      errs.name = "Full name is required"
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required"
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errs.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      errs.password = "Password is required"
    } else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters"
    }

    if (authModalMode === "register" && formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match"
    }

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setLocalErrors(errs)
      return
    }

    try {
      if (authModalMode === "login") {
        await login(formData.email, formData.password)
      } else {
        await register(formData.name, formData.email, formData.password)
      }
    } catch {
      // AuthContext handles error message
    }
  }

  // Quick fill helper for evaluator or user testing
  const fillDemo = (role = "user") => {
    if (role === "admin") {
      setFormData({
        name: "Admin User",
        email: "admin@techmatch.com",
        password: "admin123",
        confirmPassword: "admin123",
      })
    } else {
      setFormData({
        name: "Demo Customer",
        email: "demo@techmatch.com",
        password: "password123",
        confirmPassword: "password123",
      })
    }
    setLocalErrors({})
    if (authError) setAuthError(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0d1b2e] px-6 py-5 text-white relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center font-black text-xs text-white">
              M
            </div>
            <span className="font-bold text-lg tracking-tight">TechMatch Account</span>
          </div>

          <p className="text-xs text-gray-300">
            {authModalMode === "login"
              ? "Sign in to track orders, sync your cart, and access saved wishlist."
              : "Create your TechMatch account for authorized shopping & seamless orders."}
          </p>

          {/* Tab Switcher */}
          <div className="flex mt-4 bg-[#0a1628] rounded-xl p-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode("login")
                setLocalErrors({})
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === "login"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode("register")
                setLocalErrors({})
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                authModalMode === "register"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {/* Name Field (Sign Up Only) */}
          {authModalMode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={`w-full px-3.5 py-2 text-sm border rounded-xl outline-none transition-colors ${
                  localErrors.name ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {localErrors.name && <p className="text-xs text-red-500 mt-1">{localErrors.name}</p>}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. user@example.com"
              className={`w-full px-3.5 py-2 text-sm border rounded-xl outline-none transition-colors ${
                localErrors.email ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {localErrors.email && <p className="text-xs text-red-500 mt-1">{localErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2 text-sm border rounded-xl outline-none transition-colors ${
                localErrors.password ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {localErrors.password && <p className="text-xs text-red-500 mt-1">{localErrors.password}</p>}
          </div>

          {/* Confirm Password (Sign Up Only) */}
          {authModalMode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-3.5 py-2 text-sm border rounded-xl outline-none transition-colors ${
                  localErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {localErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{localErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            <span>
              {loading
                ? "Processing..."
                : authModalMode === "login"
                ? "Sign In to TechMatch"
                : "Create Account"}
            </span>
          </button>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center mb-2 font-medium">Quick 1-Click Demo Login:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("login")
                  fillDemo("user")
                }}
                className="flex-1 py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg transition-colors font-medium text-center"
              >
                👤 Customer Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode("login")
                  fillDemo("admin")
                }}
                className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs rounded-lg transition-colors font-medium text-center"
              >
                ⚡ Admin Demo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthModal
