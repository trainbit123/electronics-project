import React, { useState } from "react"
import { Link } from "react-router-dom"
import { useCart, useWishlist } from "./StoreContext"

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(star => (
        <svg key={star} xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
          viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating?.toFixed(1)})</span>
    </div>
  )
}

function Card({ product }) {
  const { addToCart } = useCart()
  const { toggleWishlist, inWishlist } = useWishlist()
  const [added, setAdded] = useState(false)

  if (!product) return null

  const { title, brand, thumbnail, price, discountPercentage, rating, category } = product
  const originalPrice = (price / (1 - discountPercentage / 100)).toFixed(0)
  const discount = Math.round(discountPercentage)
  const wished = inWishlist(product.id)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleWishlist = (e) => {
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <Link to={`/product/${product.id}`} className="block">
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden group">

      {/* Image + Wishlist */}
      <div className="relative bg-gray-50 p-4 flex items-center justify-center h-48">
        <img src={thumbnail} alt={title}
          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"/>

        {/* Wishlist button */}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Toggle wishlist">
          <svg xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 ${wished ? "text-red-500" : "text-gray-400"}`}
            viewBox="0 0 24 24" fill={wished ? "currentColor" : "none"}
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 0 1 6.364 0L12 7.636l1.318-1.318a4.5 4.5 0 1 1 6.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 0 1 0-6.364z"/>
          </svg>
        </button>

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium truncate">{brand || category}</p>
        <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2">{title}</h3>
        <StarRating rating={rating}/>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-bold text-gray-900">
            Rs.{Number(price).toLocaleString("en-IN")}
          </span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">
              Rs.{Number(originalPrice).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <button onClick={handleAddToCart}
          className={`mt-auto w-full py-2 text-xs font-semibold rounded-lg border-2 transition-all duration-200 ${
            added
              ? "bg-green-500 border-green-500 text-white"
              : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          }`}>
          {added ? "Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
    </Link>
  )
}

export default Card
