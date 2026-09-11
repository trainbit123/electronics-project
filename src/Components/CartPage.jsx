import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart, useOrders } from "../StoreContext"

/* ── Field — defined OUTSIDE modal so it never gets recreated on re-render ── */
function Field({ name, label, placeholder, type = "text", value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 ${error ? "border-red-400 bg-red-50" : "border-gray-300"}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/* ── Address Modal ── */
function AddressModal({ total, onClose, onConfirm }) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", pincode: "" })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = "Name is required"
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter valid 10-digit phone"
    if (!form.address.trim()) e.address = "Address is required"
    if (!form.city.trim())    e.city    = "City is required"
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode"
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    onConfirm(form)
  }

  const set = (field) => (e2) => {
    setForm(f => ({ ...f, [field]: e2.target.value }))
    setErrors(er => ({ ...er, [field]: "" }))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Delivery Address</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field name="name"    label="Full Name"      placeholder="e.g. Ravi Kumar"          value={form.name}    onChange={set("name")}    error={errors.name} />
          <Field name="phone"   label="Phone Number"   placeholder="10-digit mobile number"    value={form.phone}   onChange={set("phone")}   error={errors.phone}   type="tel" />
          <Field name="address" label="Street Address" placeholder="House no, Street, Area"    value={form.address} onChange={set("address")} error={errors.address} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="city"    label="City"    placeholder="City"            value={form.city}    onChange={set("city")}    error={errors.city} />
            <Field name="pincode" label="Pincode" placeholder="6-digit pincode" value={form.pincode} onChange={set("pincode")} error={errors.pincode} type="tel" />
          </div>

          <div className="mt-2 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-3">
              <span>Order Total</span>
              <span className="text-blue-600">Rs.{Number(total).toLocaleString("en-IN")}</span>
            </div>
            <button type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
              Confirm Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Order Confirmed Screen ── */
function OrderConfirmed({ address, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 text-sm mb-1">Your order has been placed successfully.</p>
      <p className="text-gray-400 text-xs mb-6">Expected delivery in 3–5 business days.</p>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left w-full max-w-sm mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivering to</p>
        <p className="text-sm font-semibold text-gray-800">{address.name}</p>
        <p className="text-sm text-gray-600">{address.address}</p>
        <p className="text-sm text-gray-600">{address.city} – {address.pincode}</p>
        <p className="text-sm text-gray-600">{address.phone}</p>
      </div>

      <div className="flex gap-3">
        <Link to="/my-orders"
          className="px-5 py-3 border border-blue-600 text-blue-600 font-semibold rounded-xl text-sm hover:bg-blue-50 transition-colors">
          View My Orders
        </Link>
        <button onClick={onContinue}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

/* ── Cart Page ── */
function CartPage() {
  const { cart, removeFromCart, updateQty, cartTotal } = useCart()
  const { placeOrder } = useOrders()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [confirmedAddress, setConfirmedAddress] = useState(null)

  const handleConfirm = (address) => {
    placeOrder(cart, address, cartTotal)
    setShowModal(false)
    setConfirmedAddress(address)
  }

  if (confirmedAddress) {
    return <OrderConfirmed address={confirmedAddress} onContinue={() => navigate("/")} />
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-gray-800 font-medium">Cart</span>
        </nav>

        <h1 className="text-xl font-bold text-gray-800 mb-5">
          My Cart <span className="text-sm font-normal text-gray-400">({cart.length} {cart.length === 1 ? "item" : "items"})</span>
        </h1>

        {/* Empty cart */}
        {cart.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-lg font-semibold text-gray-700 mb-1">Your cart is empty</p>
            <p className="text-sm text-gray-400 mb-6">Add some products to get started</p>
            <Link to="/" className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Shop Now
            </Link>
          </div>
        )}

        {cart.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-5">

            {/* Cart items */}
            <div className="flex-1 flex flex-col gap-3">
              {cart.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
                  <img src={item.thumbnail} alt={item.title}
                    className="w-20 h-20 object-contain rounded-lg bg-gray-50 shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase font-medium">{item.brand || item.category}</p>
                    <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 mt-0.5">{item.title}</h3>
                    <p className="text-base font-bold text-gray-900 mt-1">
                      Rs.{Number(item.price).toLocaleString("en-IN")}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button onClick={() => item.qty === 1 ? removeFromCart(item.id) : updateQty(item.id, item.qty - 1)}
                          className="px-2.5 py-1 text-black hover:bg-gray-100 font-bold text-sm">−</button>
                        <span className="px-3 py-1 text-sm font-semibold text-black border-x border-gray-300">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)}
                          className="px-2.5 py-1 text-black hover:bg-gray-100 font-bold text-sm">+</button>
                      </div>

                      {/* Remove */}
                      <button onClick={() => removeFromCart(item.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-72 shrink-0">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-20">
                <h2 className="text-sm font-bold text-gray-800 mb-4">Order Summary</h2>

                <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="truncate max-w-[160px] text-gray-500">{item.title} x{item.qty}</span>
                      <span className="font-medium text-gray-700 shrink-0">Rs.{Number(item.price * item.qty).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs.{Number(cartTotal).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 mt-3 pt-3 border-t border-gray-100">
                    <span>Total</span>
                    <span>Rs.{Number(cartTotal).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button onClick={() => setShowModal(true)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors">
                  Place Order
                </button>
                <Link to="/"
                  className="block text-center text-xs text-blue-600 hover:underline mt-3">
                  Continue Shopping
                </Link>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Address Modal */}
      {showModal && (
        <AddressModal
          total={cartTotal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}

export default CartPage


