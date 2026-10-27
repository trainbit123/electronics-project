import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { inMemoryStore } from "../store/inMemoryStore.js"
import { getDBStatus } from "../config/db.js"

// Protect routes - requires valid JWT
export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]
      const secret = process.env.JWT_SECRET || "techmatch_default_secret_key_123456"
      const decoded = jwt.verify(token, secret)

      const dbStatus = getDBStatus()

      if (dbStatus.connected) {
        req.user = await User.findById(decoded.id).select("-password")
      } else {
        // Fallback store
        req.user = inMemoryStore.findUserById(decoded.id)
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found or authorization token invalid",
        })
      }

      return next()
    } catch (error) {
      console.error("Auth middleware error:", error.message)
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed or expired",
      })
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no bearer token provided",
    })
  }
}

// Admin only middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
    })
  }
}

// Optional Auth: populates req.user if token exists, but doesn't block if not
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1]
      const secret = process.env.JWT_SECRET || "techmatch_default_secret_key_123456"
      const decoded = jwt.verify(token, secret)

      const dbStatus = getDBStatus()
      if (dbStatus.connected) {
        req.user = await User.findById(decoded.id).select("-password")
      } else {
        req.user = inMemoryStore.findUserById(decoded.id)
      }
    } catch {
      // Continue without user
      req.user = null
    }
  }
  next()
}
