import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useCart, useWishlist } from "../StoreContext"
import WorthBuyingSection from "./WorthBuyingSection"
import CompareModal from "./CompareModal"

/* ── Star Rating (reused pattern from Card) ── */
function StarRating({ rating, size = "md" }) {
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(star => (
        <svg key={star} xmlns="http://www.w3.org/2000/svg"
          className={`${cls} ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
          viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
      <span className={`text-gray-500 ml-1 ${size === "lg" ? "text-sm" : "text-xs"}`}>
        ({rating?.toFixed(1)})
      </span>
    </div>
  )
}

/* ── Image Gallery ── */
function ImageGallery({ images, thumbnail, title }) {
  const allImages = images?.length ? images : thumbnail ? [thumbnail] : []
  const [selected, setSelected] = useState(0)

  if (allImages.length === 0) {
    return <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center text-gray-400">No image</div>
  }

  return (
    <div>
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 flex items-center justify-center h-80 sm:h-96">
        <img src={allImages[selected]} alt={title} className="max-h-full max-w-full object-contain" />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                i === selected ? "border-blue-500 shadow" : "border-gray-200 hover:border-gray-300"
              }`}>
              <img src={img} alt="" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Specs Table ── */
function SpecsTable({ product }) {
  const rows = []

  if (product.brand) rows.push(["Brand", product.brand])
  if (product.category) rows.push(["Category", product.category.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())])
  if (product.sku) rows.push(["SKU", product.sku])
  if (product.weight) rows.push(["Weight", `${product.weight} g`])
  if (product.dimensions?.width) {
    rows.push(["Dimensions", `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} mm`])
  }
  if (product.warrantyInformation) rows.push(["Warranty", product.warrantyInformation])
  if (product.returnPolicy) rows.push(["Return Policy", product.returnPolicy])
  if (product.shippingInformation) rows.push(["Shipping", product.shippingInformation])
  if (product.availabilityStatus) rows.push(["Availability", product.availabilityStatus])
  if (product.stock != null) rows.push(["Stock", `${product.stock} units`])
  if (product.minimumOrderQuantity > 1) rows.push(["Min. Order", `${product.minimumOrderQuantity} units`])
  if (product.tags?.length) rows.push(["Tags", product.tags.join(", ")])

  if (rows.length === 0) return null

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <h3 className="text-sm font-bold text-gray-800 px-4 py-3 border-b border-gray-100">Specifications</h3>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value], i) => (
            <tr key={label} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="px-4 py-2.5 text-gray-500 font-medium w-40">{label}</td>
              <td className="px-4 py-2.5 text-gray-800">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Skeleton Loader ── */
function ProductSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 rounded-xl h-80" />
        <div className="space-y-4">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-8 bg-gray-200 rounded w-40" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-10 bg-gray-200 rounded w-48 mt-6" />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PRODUCT PAGE — Main Component
   ══════════════════════════════════════════════ */
function ProductPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { toggleWishlist, inWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [categoryProducts, setCategoryProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [added, setAdded] = useState(false)
  const [showWorth, setShowWorth] = useState(false)
  const [showCompare, setShowCompare] = useState(false)

  /* ── Fetch product + category products ── */
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setShowWorth(false)
    setShowCompare(false)

    fetch(`https://dummyjson.com/products/${id}`)
      .then(r => { if (!r.ok) throw new Error("Product not found"); return r.json() })
      .then(data => {
        if (cancelled) return
        setProduct(data)
        setLoading(false)

        // Fetch same-category products for comparison
        if (data.category) {
          fetch(`https://dummyjson.com/products/category/${data.category}?limit=100`)
            .then(r => r.ok ? r.json() : { products: [] })
            .then(d => { if (!cancelled) setCategoryProducts(d.products || []) })
            .catch(() => {})
        }
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false) } })

    return () => { cancelled = true }
  }, [id])

  if (loading) return <ProductSkeleton />

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-gray-50">
        <span className="text-5xl">😕</span>
        <h2 className="text-xl font-bold text-gray-700">{error || "Product not found"}</h2>
        <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">← Back to Home</Link>
      </div>
    )
  }

  const {
    title, brand, price, discountPercentage, rating, description,
    category, thumbnail, images, reviews, availabilityStatus,
  } = product
  const discount = Math.round(discountPercentage || 0)
  const originalPrice = discount > 0 ? (price / (1 - discountPercentage / 100)).toFixed(0) : null
  const wished = inWishlist(product.id)

  const handleAddToCart = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronIcon />
          {category && (
            <>
              <Link to={`/${category === "mobile-accessories" ? "accessories" : category}`}
                className="hover:text-blue-600 capitalize">
                {category.replace(/-/g, " ")}
              </Link>
              <ChevronIcon />
            </>
          )}
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{title}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

          {/* Left: Images */}
          <ImageGallery images={images} thumbnail={thumbnail} title={title} />

          {/* Right: Product Info */}
          <div className="flex flex-col gap-3">
            {/* Brand */}
            {brand && (
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">{brand}</p>
            )}

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={rating} size="lg" />
              {reviews?.length > 0 && (
                <span className="text-xs text-gray-400">{reviews.length} reviews</span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                Rs.{Number(price).toLocaleString("en-IN")}
              </span>
              {originalPrice && (
                <span className="text-base text-gray-400 line-through">
                  Rs.{Number(originalPrice).toLocaleString("en-IN")}
                </span>
              )}
              {discount > 0 && (
                <span className="text-sm font-bold text-green-600">{discount}% off</span>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${
                availabilityStatus === "In Stock" ? "bg-green-500" :
                availabilityStatus === "Low Stock" ? "bg-yellow-500" : "bg-red-500"
              }`} />
              <span className="text-sm text-gray-600">{availabilityStatus || "Status unknown"}</span>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600 leading-relaxed mt-2">{description}</p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button onClick={handleAddToCart}
                className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}>
                {added ? "✓ Added to Cart" : "Add to Cart"}
              </button>

              <button onClick={() => toggleWishlist(product)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all duration-200 ${
                  wished
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-500"
                }`}>
                {wished ? "♥ In Wishlist" : "♡ Add to Wishlist"}
              </button>
            </div>

            {/* ─── Worth Buying & Compare Buttons ─── */}
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-gray-200">
              <button onClick={() => setShowWorth(!showWorth)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {showWorth ? "Hide Analysis" : "Is This Worth Buying?"}
              </button>

              <button onClick={() => setShowCompare(true)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
                Compare Before Buying
              </button>
            </div>
          </div>
        </div>

        {/* Specs Table */}
        <div className="mt-8">
          <SpecsTable product={product} />
        </div>

        {/* Reviews Section */}
        {reviews?.length > 0 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Customer Reviews ({reviews.length})</h3>
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                    {review.reviewerName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{review.reviewerName}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Worth Buying Section ─── */}
        {showWorth && (
          <div className="mt-8">
            <WorthBuyingSection product={product} categoryProducts={categoryProducts} />
          </div>
        )}

        {/* ─── Compare Modal ─── */}
        {showCompare && (
          <CompareModal
            product={product}
            categoryProducts={categoryProducts}
            onClose={() => setShowCompare(false)}
          />
        )}

      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default ProductPage
