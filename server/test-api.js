// Direct in-process test suite for TechMatch backend logic and auth
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { inMemoryStore } from "./store/inMemoryStore.js"

async function runTests() {
  console.log("🧪 Running TechMatch Backend Unit & Security Tests...\n")

  try {
    // 1. In-Memory Store Initialization
    console.log("[TEST 1] Verifying Seed Users...")
    const demoUser = inMemoryStore.findUserByEmail("demo@techmatch.com")
    if (!demoUser) throw new Error("Demo user not found in store")
    const adminUser = inMemoryStore.findUserByEmail("admin@techmatch.com")
    if (!adminUser) throw new Error("Admin user not found in store")
    console.log(`✅ Demo user found: ${demoUser.email} (Role: ${demoUser.role})`)
    console.log(`✅ Admin user found: ${adminUser.email} (Role: ${adminUser.role})`)

    // 2. Password Verification
    console.log("\n[TEST 2] Verifying Password Hashing & Bcrypt Authentication...")
    const isPassValid = await bcrypt.compare("password123", demoUser.password)
    if (!isPassValid) throw new Error("Password verification failed for valid password")
    const isBadPassValid = await bcrypt.compare("wrongpassword", demoUser.password)
    if (isBadPassValid) throw new Error("Password verification should fail for invalid password")
    console.log("✅ Bcrypt password verification working accurately.")

    // 3. JWT Token Creation & Authorization Verification
    console.log("\n[TEST 3] Verifying JWT Token Generation & Verification...")
    const secret = "test_secret_key_123456"
    const token = jwt.sign({ id: demoUser._id }, secret, { expiresIn: "1h" })
    const decoded = jwt.verify(token, secret)
    if (decoded.id !== demoUser._id) throw new Error("Token payload mismatch")
    console.log(`✅ JWT Token generated & decoded: User ID ${decoded.id}`)

    // 4. Token Tampering Security Check
    console.log("\n[TEST 4] Verifying JWT Tamper Detection...")
    let tamperedFailed = false
    try {
      jwt.verify(token + "tampered", secret)
    } catch {
      tamperedFailed = true
    }
    if (!tamperedFailed) throw new Error("Security flaw: tampered token was accepted")
    console.log("✅ Tampered token successfully rejected.")

    // 5. User Registration & Hashing
    console.log("\n[TEST 5] Verifying User Registration...")
    const uniqueEmail = `john_${Date.now()}@example.com`
    const newUser = await inMemoryStore.createUser({
      name: "John Doe",
      email: uniqueEmail,
      password: "secretPassword456",
    })
    if (!newUser || newUser.email !== uniqueEmail) throw new Error("Registration failed")
    const storedUser = inMemoryStore.findUserByIdWithPassword(newUser._id)
    if (storedUser.password === "secretPassword456") {
      throw new Error("Security flaw: password was stored in plain text!")
    }
    console.log(`✅ User registered with hashed password: ${storedUser.password.slice(0, 25)}...`)

    // 6. Order Creation & Retrieval
    console.log("\n[TEST 6] Verifying Order Creation & Persistence...")
    const order = inMemoryStore.createOrder({
      user: newUser._id,
      items: [{ id: 101, title: "MacBook Pro", price: 1999, qty: 1 }],
      address: {
        name: "John Doe",
        phone: "9876543210",
        address: "456 Tech Park",
        city: "Hyderabad",
        pincode: "500081",
      },
      total: 1999,
      paymentMethod: "Cash on Delivery",
    })
    if (!order || !order._id) throw new Error("Order creation failed")
    const userOrders = inMemoryStore.getUserOrders(newUser._id)
    if (userOrders.length !== 1 || userOrders[0]._id !== order._id) {
      throw new Error("User orders retrieval failed")
    }
    console.log(`✅ Order created successfully: ID ${order._id}, Total $${order.total}`)

    // 7. Cart & Wishlist Syncing
    console.log("\n[TEST 7] Verifying Cart & Wishlist Operations...")
    const cart = [{ id: 101, title: "MacBook Pro", price: 1999, qty: 2 }]
    const wishlist = [{ id: 202, title: "Sony WH-1000XM5", price: 399 }]
    const updatedUser = inMemoryStore.updateUser(newUser._id, { cart, wishlist })
    if (updatedUser.cart.length !== 1 || updatedUser.wishlist.length !== 1) {
      throw new Error("Cart/Wishlist sync failed")
    }
    console.log("✅ Cart & Wishlist synced successfully for user.")

    console.log("\n========================================================")
    console.log("🎉 ALL BACKEND LOGIC & SECURITY TESTS PASSED (7/7)!")
    console.log("========================================================\n")
  } catch (err) {
    console.error("❌ Test failed:", err)
    process.exitCode = 1
  }
}

runTests()
