import React from "react"
import { Link } from "react-router-dom"
import { useOrders } from "../StoreContext"

function MyOrdersPage() {
  const { orders } = useOrders()

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-gray-800 font-medium">My Orders</span>
        </nav>

        <h1 className="text-xl font-bold text-gray-800 mb-5">
          My Orders
          <span className="text-sm font-normal text-gray-400 ml-2">({orders.length} {orders.length === 1 ? "order" : "orders"})</span>
        </h1>

        {/* Empty */}
        {orders.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-lg font-semibold text-gray-700 mb-1">No orders yet</p>
            <p className="text-sm text-gray-400 mb-6">Your confirmed orders will appear here</p>
            <Link to="/" className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Start Shopping
            </Link>
          </div>
        )}

        {/* Order list */}
        <div className="flex flex-col gap-4">
          {orders.map((order, idx) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Order header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order #{orders.length - idx}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{formatDate(order.date)}</span>
                  <span className="font-semibold text-gray-700 text-sm">Rs.{Number(order.total).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Items */}
              <div className="px-5 py-4 flex flex-col gap-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img src={item.thumbnail} alt={item.title}
                      className="w-14 h-14 object-contain rounded-lg bg-gray-50 border border-gray-100 shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase font-medium truncate">{item.brand}</p>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Rs.{Number(item.price).toLocaleString("en-IN")} &times; {item.qty}
                        <span className="ml-2 font-semibold text-gray-700">
                          = Rs.{Number(item.price * item.qty).toLocaleString("en-IN")}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery address */}
              <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-600">Delivering to: </span>
                  {order.address.name}, {order.address.address}, {order.address.city} – {order.address.pincode}
                </div>
                <div className="text-xs text-blue-500 font-medium whitespace-nowrap">
                  Expected in 3–5 days
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default MyOrdersPage
