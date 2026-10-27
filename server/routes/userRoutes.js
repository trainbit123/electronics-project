import express from "express"
import User from "../models/User.js"
import { protect } from "../middleware/authMiddleware.js"
import { inMemoryStore } from "../store/inMemoryStore.js"
import { getDBStatus } from "../config/db.js"

const router = express.Router()

// All user cart/wishlist routes require authentication
router.use(protect)

// ── CART ROUTES ──

// @route   GET /api/user/cart
// @desc    Get user's synced cart
router.get("/cart", async (req, res) => {
  try {
    const dbStatus = getDBStatus()
    if (dbStatus.connected) {
      const user = await User.findById(req.user._id).select("cart")
      return res.json({ success: true, cart: user?.cart || [] })
    } else {
      const user = inMemoryStore.findUserById(req.user._id)
      return res.json({ success: true, cart: user?.cart || [] })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   POST /api/user/cart
// @desc    Sync / replace user's cart
router.post("/cart", async (req, res) => {
  try {
    const { cart } = req.body
    if (!Array.isArray(cart)) {
      return res.status(400).json({ success: false, message: "Cart must be an array" })
    }

    const dbStatus = getDBStatus()
    if (dbStatus.connected) {
      const user = await User.findById(req.user._id)
      if (!user) return res.status(404).json({ success: false, message: "User not found" })
      user.cart = cart
      await user.save()
      return res.json({ success: true, cart: user.cart })
    } else {
      const updated = inMemoryStore.updateUser(req.user._id, { cart })
      return res.json({ success: true, cart: updated.cart })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   DELETE /api/user/cart
// @desc    Clear user's cart
router.delete("/cart", async (req, res) => {
  try {
    const dbStatus = getDBStatus()
    if (dbStatus.connected) {
      await User.findByIdAndUpdate(req.user._id, { cart: [] })
    } else {
      inMemoryStore.updateUser(req.user._id, { cart: [] })
    }
    return res.json({ success: true, message: "Cart cleared", cart: [] })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// ── WISHLIST ROUTES ──

// @route   GET /api/user/wishlist
// @desc    Get user's synced wishlist
router.get("/wishlist", async (req, res) => {
  try {
    const dbStatus = getDBStatus()
    if (dbStatus.connected) {
      const user = await User.findById(req.user._id).select("wishlist")
      return res.json({ success: true, wishlist: user?.wishlist || [] })
    } else {
      const user = inMemoryStore.findUserById(req.user._id)
      return res.json({ success: true, wishlist: user?.wishlist || [] })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   POST /api/user/wishlist/toggle
// @desc    Toggle item in wishlist
router.post("/wishlist/toggle", async (req, res) => {
  try {
    const { product } = req.body
    if (!product || !product.id) {
      return res.status(400).json({ success: false, message: "Product with id is required" })
    }

    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      const user = await User.findById(req.user._id)
      if (!user) return res.status(404).json({ success: false, message: "User not found" })

      const existsIndex = user.wishlist.findIndex((item) => item.id === product.id)
      let inWishlist = false

      if (existsIndex > -1) {
        user.wishlist.splice(existsIndex, 1)
        inWishlist = false
      } else {
        user.wishlist.push(product)
        inWishlist = true
      }

      await user.save()
      return res.json({ success: true, inWishlist, wishlist: user.wishlist })
    } else {
      const user = inMemoryStore.findUserById(req.user._id)
      let wishlist = [...(user.wishlist || [])]
      const existsIndex = wishlist.findIndex((item) => item.id === product.id)
      let inWishlist = false

      if (existsIndex > -1) {
        wishlist.splice(existsIndex, 1)
        inWishlist = false
      } else {
        wishlist.push(product)
        inWishlist = true
      }

      const updated = inMemoryStore.updateUser(req.user._id, { wishlist })
      return res.json({ success: true, inWishlist, wishlist: updated.wishlist })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
