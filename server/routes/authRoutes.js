import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import { protect } from "../middleware/authMiddleware.js"
import { inMemoryStore } from "../store/inMemoryStore.js"
import { getDBStatus } from "../config/db.js"

const router = express.Router()

// Generate JWT Token helper
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "techmatch_default_secret_key_123456"
  const expiresIn = process.env.JWT_EXPIRES_IN || "30d"
  return jwt.sign({ id }, secret, { expiresIn })
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, password",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      })
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      })
    }

    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      // MongoDB
      const userExists = await User.findOne({ email: email.toLowerCase() })
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        })
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: "user",
      })

      const token = generateToken(user._id)

      return res.status(201).json({
        success: true,
        message: "Account registered successfully",
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      })
    } else {
      // In-Memory Fallback
      const existing = inMemoryStore.findUserByEmail(email)
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        })
      }

      const user = await inMemoryStore.createUser({ name, email, password })
      const token = generateToken(user._id)

      return res.status(201).json({
        success: true,
        message: "Account registered successfully (in-memory mode)",
        token,
        user,
      })
    }
  } catch (error) {
    console.error("Register error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Server error registering user",
    })
  }
})

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      })
    }

    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      // MongoDB
      const user = await User.findOne({ email: email.toLowerCase() })

      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id)
        return res.json({
          success: true,
          message: "Login successful",
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt,
          },
        })
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }
    } else {
      // In-Memory Fallback
      const userWithPass = inMemoryStore.findUserByEmail(email)
      if (userWithPass) {
        const isMatch = await bcrypt.compare(password, userWithPass.password)
        if (isMatch) {
          const { password: _, ...userSafe } = userWithPass
          const token = generateToken(userSafe._id)
          return res.json({
            success: true,
            message: "Login successful (in-memory mode)",
            token,
            user: userSafe,
          })
        }
      }

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Server error logging in",
    })
  }
})

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private (Bearer token)
router.get("/profile", protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  })
})

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, password } = req.body
    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      const user = await User.findById(req.user._id)

      if (user) {
        user.name = name || user.name
        if (email) user.email = email.toLowerCase()
        if (password) {
          if (password.length < 6) {
            return res.status(400).json({
              success: false,
              message: "Password must be at least 6 characters long",
            })
          }
          user.password = password
        }

        const updatedUser = await user.save()
        return res.json({
          success: true,
          message: "Profile updated successfully",
          user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
          },
        })
      }
    } else {
      const updates = {}
      if (name) updates.name = name
      if (email) updates.email = email.toLowerCase()
      if (password) {
        const salt = await bcrypt.genSalt(10)
        updates.password = await bcrypt.hash(password, salt)
      }

      const updated = inMemoryStore.updateUser(req.user._id, updates)
      return res.json({
        success: true,
        message: "Profile updated successfully",
        user: updated,
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    })
  }
})

// @route   GET /api/auth/status
// @desc    Get backend and database status
// @access  Public
router.get("/status", (req, res) => {
  const db = getDBStatus()
  res.json({
    status: "ok",
    database: db.connected ? "MongoDB Connected" : "In-Memory Mode (Set MONGODB_URI to connect)",
    timestamp: new Date().toISOString(),
  })
})

export default router
