import React from "react"
import { Link } from "react-router-dom"
import Card from "../Card"
import { useWishlist } from "../StoreContext"

function WishlistPage() {
  const { wishlist } = useWishlist()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">Wishlist</span>
        </nav>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">♥</span>
          <h1 className="text-xl font-bold text-gray-800">My Wishlist</h1>
          {wishlist.length > 0 && (
            <span className="text-sm text-gray-400">({wishlist.length} items)</span>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">💔</div>
            <p className="text-lg font-semibold text-gray-700">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mt-2">Browse products and tap the heart icon to save your favourites</p>
            <Link to="/" className="mt-6 inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {wishlist.map(p => <Card key={p.id} product={p} />)}
          </div>
        )}

      </div>
    </div>
  )
}

export default WishlistPage
