# TechMatch Backend API

A complete, production-ready Express & Node.js backend providing authentication, authorization, database storage, order handling, and shopping cart/wishlist management for TechMatch.

---

## 🛠️ Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose) with Graceful In-Memory Development Fallback
- **Security & Auth**: JSON Web Tokens (JWT) + Bcrypt Password Hashing
- **CORS & Logging**: Cors & Morgan

---

## ⚙️ Configuration (.env)

The server configuration file is located at `server/.env`.

```env
# Server Port
PORT=5000
NODE_ENV=development

# Database Connection URL (Provide your MongoDB credentials & password)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/techmatch?retryWrites=true&w=majority

# JWT Token Secret for Auth & Role Authorization
JWT_SECRET=techmatch_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRES_IN=30d

# Frontend Client URL
CLIENT_URL=http://localhost:5173
```

> **Note**: If `MONGODB_URI` contains placeholders or is unreachable, the backend runs seamlessly in an in-memory fallback mode with pre-seeded accounts so you can test immediately without setup blockers!

---

## 🚀 Running the Backend

From the project root:
```bash
# Run server
npm run server

# Run with auto-reload (watch mode)
npm run server:dev

# Run automated backend test suite
npm run test:server
```

---

## 📡 API Endpoints

### 🔐 Authentication & Authorization
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login and receive JWT token | No |
| `GET`  | `/api/auth/profile` | Get logged-in user profile | Yes (Bearer Token) |
| `PUT`  | `/api/auth/profile` | Update profile information | Yes (Bearer Token) |
| `GET`  | `/api/auth/status` | Check server & database status | No |

### 📦 Orders
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `POST` | `/api/orders` | Place a new order | Optional (Auto-links if logged in) |
| `GET`  | `/api/orders` | Retrieve user's orders | Yes (Bearer Token) |
| `GET`  | `/api/orders/:id` | Order details by ID | Optional |
| `GET`  | `/api/orders/admin/all` | Admin: view all orders across store | Yes (Admin Role) |
| `PUT`  | `/api/orders/:id/status` | Admin: update order status | Yes (Admin Role) |

### 🛒 User Data (Cart & Wishlist)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| `GET`  | `/api/user/cart` | Get synced shopping cart | Yes (Bearer Token) |
| `POST` | `/api/user/cart` | Save / sync shopping cart | Yes (Bearer Token) |
| `DELETE` | `/api/user/cart` | Clear user cart | Yes (Bearer Token) |
| `GET`  | `/api/user/wishlist` | Get user wishlist | Yes (Bearer Token) |
| `POST` | `/api/user/wishlist/toggle` | Toggle item in wishlist | Yes (Bearer Token) |

---

## 👥 Demo Accounts Available Out of the Box
- **Customer Demo**:
  - Email: `demo@techmatch.com`
  - Password: `password123`
- **Admin Demo**:
  - Email: `admin@techmatch.com`
  - Password: `admin123`
