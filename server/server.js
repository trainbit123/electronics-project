import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"
import path from "path"
import { fileURLToPath } from "url"

// Load env before other imports
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try loading server/.env first, then root .env
dotenv.config({ path: path.join(__dirname, ".env") })
dotenv.config({ path: path.join(__dirname, "..", ".env") })

import { connectDB, getDBStatus } from "./config/db.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js"

// Route imports
import authRoutes from "./routes/authRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"

const app = express()
const PORT = process.env.PORT || 5000

// Initialize Database Connection
connectDB()

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"))
}

// Health and API info route
app.get("/api", (req, res) => {
  const dbStatus = getDBStatus()
  res.json({
    name: "TechMatch API Backend",
    version: "1.0.0",
    status: "online",
    database: dbStatus.connected ? "MongoDB Connected" : "In-Memory Mode (Set MONGODB_URI to connect)",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile (Bearer token)",
        updateProfile: "PUT /api/auth/profile (Bearer token)",
      },
      orders: {
        create: "POST /api/orders (Optional Bearer token)",
        myOrders: "GET /api/orders (Bearer token)",
        adminAllOrders: "GET /api/orders/admin/all (Admin only)",
        updateStatus: "PUT /api/orders/:id/status (Admin only)",
      },
      user: {
        cart: "GET / POST / DELETE /api/user/cart (Bearer token)",
        wishlist: "GET / POST /api/user/wishlist (Bearer token)",
        toggleWishlist: "POST /api/user/wishlist/toggle (Bearer token)",
      },
      products: {
        list: "GET /api/products",
        categories: "GET /api/products/categories",
        single: "GET /api/products/:id",
      },
    },
  })
})

// Mount Routes
app.use("/api/auth", authRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/user", userRoutes)
app.use("/api/products", productRoutes)

// Error Handling Middleware
app.use(notFound)
app.use(errorHandler)

// Start listener only when run directly (not as a serverless function in Vercel)
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   🚀 TechMatch Backend Server Running                      ║
║   🌐 URL: http://localhost:${PORT}/api                       ║
║   📁 Environment: ${process.env.NODE_ENV || "development"}                          ║
╚════════════════════════════════════════════════════════════╝
    `)
  })
}

export default app
