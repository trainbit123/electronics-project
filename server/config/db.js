import mongoose from "mongoose"

let isConnected = false

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
    console.warn("\n⚠️  [TechMatch DB Warning] MONGODB_URI is not configured in server/.env")
    console.warn("👉  Please open server/.env and provide your MongoDB connection string (e.g., MongoDB Atlas or local MongoDB).")
    console.warn("    Example: MONGODB_URI=mongodb+srv://admin:myPassword123@cluster0.mongodb.net/techmatch?retryWrites=true&w=majority")
    console.warn("    The backend will operate in fallback in-memory mode until connected to MongoDB.\n")
    return false
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    isConnected = true
    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host} | Database: ${conn.connection.name}`)
    return true
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`)
    console.warn("⚠️  Operating with in-memory fallback. Please verify your MongoDB network access (IP whitelist 0.0.0.0/0) and credentials in server/.env\n")
    return false
  }
}

export const getDBStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
})
