import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("tm_auth_user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("tm_auth_token") || null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState("login") // 'login' | 'register'

  // Persist session to localStorage
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem("tm_auth_token", token)
      } else {
        localStorage.removeItem("tm_auth_token")
      }

      if (user) {
        localStorage.setItem("tm_auth_user", JSON.stringify(user))
      } else {
        localStorage.removeItem("tm_auth_user")
      }
    } catch (e) {
      console.warn("Error saving auth state to localStorage", e)
    }
  }, [token, user])

  // Verify token on mount with backend
  useEffect(() => {
    if (!token) return

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          logout()
        }
      } catch (err) {
        // Backend might be offline; preserve local cached user
        console.debug("Backend verify token unavailable (running offline):", err.message)
      }
    }

    verifyToken()
  }, [token])

  // Login
  const login = useCallback(async (email, password) => {
    setLoading(true)
    setAuthError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed")
      }

      setToken(data.token)
      setUser(data.user)
      setIsAuthModalOpen(false)
      return { success: true, user: data.user }
    } catch (error) {
      // If backend is not running, provide graceful fallback
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        // Check if demo credentials
        if (email.toLowerCase() === "demo@techmatch.com" && password === "password123") {
          const mockUser = {
            _id: "user_demo_local",
            name: "Demo Customer",
            email: "demo@techmatch.com",
            role: "user",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          }
          const mockToken = "mock_jwt_token_" + Date.now()
          setToken(mockToken)
          setUser(mockUser)
          setIsAuthModalOpen(false)
          return { success: true, user: mockUser }
        }
        const errorMsg = "Cannot reach backend server. Please make sure `npm run server` is running on port 5000."
        setAuthError(errorMsg)
        throw new Error(errorMsg)
      }

      setAuthError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Register
  const register = useCallback(async (name, email, password) => {
    setLoading(true)
    setAuthError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed")
      }

      setToken(data.token)
      setUser(data.user)
      setIsAuthModalOpen(false)
      return { success: true, user: data.user }
    } catch (error) {
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        const errorMsg = "Cannot reach backend server. Please make sure `npm run server` is running on port 5000."
        setAuthError(errorMsg)
        throw new Error(errorMsg)
      }
      setAuthError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("tm_auth_token")
    localStorage.removeItem("tm_auth_user")
  }, [])

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode)
    setAuthError(null)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
    setAuthError(null)
  }, [])

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    isAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    openAuthModal,
    closeAuthModal,
    apiBaseUrl: API_BASE_URL,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
