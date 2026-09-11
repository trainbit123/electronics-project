import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Card from '../Card'
import { fetchAllProducts } from '../allProductsApi'

const SORT_OPTIONS = [
  { value: 'random',     label: 'Recommended'        },
  { value: 'price_asc',  label: 'Price: Low to High'  },
  { value: 'price_desc', label: 'Price: High to Low'  },
  { value: 'rating',     label: 'Top Rated'           },
  { value: 'discount',   label: 'Best Discount'       },
]

const CATEGORY_LABELS = {
  smartphones:         'Mobiles',
  laptops:             'Laptops',
  tablets:             'Tablets',
  'mobile-accessories': 'Accessories',
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-44 w-full" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded w-1/3 mt-1" />
        <div className="h-8 bg-gray-200 rounded mt-2" />
      </div>
    </div>
  )
}

function AllProductsPage() {
  const [allProducts, setAllProducts]         = useState([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  const [sortBy, setSortBy]                   = useState('random')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    setLoading(true)
    fetchAllProducts()
      .then(products => { setAllProducts(products); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const displayProducts = useMemo(() => {
    let list = [...allProducts]

    if (selectedCategory !== 'all')
      list = list.filter(p => p.category === selectedCategory)

    if      (sortBy === 'price_asc')  list.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price)
    else if (sortBy === 'rating')     list.sort((a, b) => b.rating - a.rating)
    else if (sortBy === 'discount')   list.sort((a, b) => b.discountPercentage - a.discountPercentage)
    // 'random' keeps original shuffled order

    return list
  }, [allProducts, sortBy, selectedCategory])

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)]

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">All Products</span>
        </nav>

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">All Products</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading ? 'Loading...' : `${displayProducts.length} Products across all categories`}
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:inline whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-gray-300 bg-white text-sm rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-16 text-red-500 font-medium">
            Failed to load products. Please try again.
          </div>
        )}

        {/* Empty */}
        {!error && !loading && displayProducts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-semibold text-gray-600 text-base">No products found</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
            : displayProducts.map(product => <Card key={product.id} product={product} />)
          }
        </div>

      </div>
    </div>
  )
}

export default AllProductsPage
