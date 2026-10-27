import express from "express"
import Order from "../models/Order.js"
import { protect, admin, optionalAuth } from "../middleware/authMiddleware.js"
import { inMemoryStore } from "../store/inMemoryStore.js"
import { getDBStatus } from "../config/db.js"

const router = express.Router()

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public / Optional Auth (links to user if logged in)
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { items, address, total, paymentMethod = "Cash on Delivery" } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item" })
    }

    if (!address || !address.name || !address.phone || !address.address || !address.city || !address.pincode) {
      return res.status(400).json({ success: false, message: "Incomplete shipping address" })
    }

    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      const order = await Order.create({
        user: req.user ? req.user._id : undefined,
        items,
        address,
        total,
        paymentMethod,
        status: "Confirmed",
      })

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        order,
      })
    } else {
      const order = inMemoryStore.createOrder({
        user: req.user ? req.user._id : "guest",
        items,
        address,
        total,
        paymentMethod,
      })

      return res.status(201).json({
        success: true,
        message: "Order placed successfully (in-memory mode)",
        order,
      })
    }
  } catch (error) {
    console.error("Create order error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    })
  }
})

// @route   GET /api/orders
// @desc    Get logged in user's orders
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
      return res.json({ success: true, count: orders.length, orders })
    } else {
      const orders = inMemoryStore.getUserOrders(req.user._id)
      return res.json({ success: true, count: orders.length, orders })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/orders/admin/all
// @desc    Admin: get all orders in system
// @access  Private/Admin
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 })
      return res.json({ success: true, count: orders.length, orders })
    } else {
      const orders = inMemoryStore.getAllOrders()
      return res.json({ success: true, count: orders.length, orders })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private / Public lookup
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      const order = await Order.findById(req.params.id).populate("user", "name email")
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" })
      }
      return res.json({ success: true, order })
    } else {
      const order = inMemoryStore.findOrderById(req.params.id)
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" })
      }
      return res.json({ success: true, order })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

// @route   PUT /api/orders/:id/status
// @desc    Admin: update order status
// @access  Private/Admin
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ["Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      })
    }

    const dbStatus = getDBStatus()

    if (dbStatus.connected) {
      const order = await Order.findById(req.params.id)
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" })
      }
      order.status = status
      await order.save()
      return res.json({ success: true, message: `Status updated to ${status}`, order })
    } else {
      const order = inMemoryStore.updateOrderStatus(req.params.id, status)
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" })
      }
      return res.json({ success: true, message: `Status updated to ${status}`, order })
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
})

export default router
