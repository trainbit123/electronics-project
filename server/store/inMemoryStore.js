import bcrypt from "bcryptjs"

// In-memory data store for local development or when MongoDB is not connected yet
class InMemoryStore {
  constructor() {
    this.users = []
    this.orders = []
    this.seedDefaultUsers()
  }

  seedDefaultUsers() {
    const demoPassword = bcrypt.hashSync("password123", 10)
    const adminPassword = bcrypt.hashSync("admin123", 10)

    this.users = [
      {
        _id: "user_demo_1",
        name: "Demo Customer",
        email: "demo@techmatch.com",
        password: demoPassword,
        role: "user",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        cart: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
      },
      {
        _id: "user_admin_1",
        name: "Admin User",
        email: "admin@techmatch.com",
        password: adminPassword,
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
        cart: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
      },
    ]
  }

  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  }

  findUserById(id) {
    const user = this.users.find((u) => u._id === id || u.id === id)
    if (!user) return null
    const { password, ...safeUser } = user
    return safeUser
  }

  findUserByIdWithPassword(id) {
    return this.users.find((u) => u._id === id || u.id === id) || null
  }

  async createUser({ name, email, password, role = "user" }) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const newUser = {
      _id: `user_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
      cart: [],
      wishlist: [],
      createdAt: new Date().toISOString(),
    }
    this.users.push(newUser)
    const { password: _, ...safeUser } = newUser
    return safeUser
  }

  updateUser(id, updates) {
    const index = this.users.findIndex((u) => u._id === id || u.id === id)
    if (index === -1) return null
    this.users[index] = { ...this.users[index], ...updates }
    const { password, ...safeUser } = this.users[index]
    return safeUser
  }

  // Orders
  createOrder(orderData) {
    const newOrder = {
      _id: `order_${Date.now()}`,
      id: Date.now(),
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      ...orderData,
    }
    this.orders.unshift(newOrder)
    return newOrder
  }

  getUserOrders(userId) {
    return this.orders.filter((o) => o.user === userId || o.user?._id === userId)
  }

  getAllOrders() {
    return this.orders
  }

  findOrderById(id) {
    return this.orders.find((o) => o._id === id || o.id === Number(id))
  }

  updateOrderStatus(id, status) {
    const order = this.findOrderById(id)
    if (order) {
      order.status = status
    }
    return order
  }
}

export const inMemoryStore = new InMemoryStore()
