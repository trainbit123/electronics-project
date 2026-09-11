import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Card from '../Card'

const PRICE_RANGES = [
  { label: 'Under ₹700',        min: 0,    max: 700  },
  { label: '₹700 – ₹1,200',     min: 700,  max: 1200 },
  { label: '₹1,200 – ₹1,800',   min: 1200, max: 1800 },
  { label: 'Above ₹1,800',      min: 1800, max: Infinity },
]

const RATING_OPTIONS = [
  { label: '4.5 & above', min: 4.5 },
  { label: '4 & above',   min: 4   },
  { label: '3.5 & above', min: 3.5 },
  { label: '3 & above',   min: 3   },
]

const FEATURES = ['SSD Storage', 'Backlit Keyboard', 'Touchscreen', 'Dedicated GPU', 'Long Battery Life']

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity'         },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Rating'             },
  { value: 'discount',   label: 'Discount'           },
]

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

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3"
      >
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="space-y-2.5">{children}</div>}
    </div>
  )
}

function LaptopsPage() {
  const [allProducts, setAllProducts]           = useState([])
  const [loading, setLoading]                   = useState(true)
  const [error, setError]                       = useState(null)
  const [selectedBrands, setSelectedBrands]     = useState([])
  const [selectedPrice, setSelectedPrice]       = useState(null)
  const [selectedRating, setSelectedRating]     = useState(null)
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [sortBy, setSortBy]                     = useState('popularity')
  const [filterOpen, setFilterOpen]             = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('https://dummyjson.com/products/category/laptops?limit=100')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json() })
      .then(d => { setAllProducts(d.products); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const brandCounts = useMemo(() => {
    const map = {}
    allProducts.forEach(p => { if (p.brand) map[p.brand] = (map[p.brand] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [allProducts])

  const toggleBrand   = b => setSelectedBrands(prev  => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  const toggleFeature = f => setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  const displayProducts = useMemo(() => {
    let list = [...allProducts]
    if (selectedBrands.length) list = list.filter(p => selectedBrands.includes(p.brand))
    if (selectedPrice !== null) {
      const { min, max } = PRICE_RANGES[selectedPrice]
      list = list.filter(p => p.price >= min && p.price <= max)
    }
    if (selectedRating !== null) list = list.filter(p => p.rating >= selectedRating)
    if      (sortBy === 'price_asc')  list.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price)
    else if (sortBy === 'rating')     list.sort((a, b) => b.rating - a.rating)
    else if (sortBy === 'discount')   list.sort((a, b) => b.discountPercentage - a.discountPercentage)
    else                              list.sort((a, b) => b.stock - a.stock)
    return list
  }, [allProducts, selectedBrands, selectedPrice, selectedRating, sortBy])

  const hasFilters        = selectedBrands.length || selectedPrice !== null || selectedRating !== null || selectedFeatures.length
  const activeFilterCount = [selectedBrands.length > 0, selectedPrice !== null, selectedRating !== null, selectedFeatures.length > 0].filter(Boolean).length
  const resetFilters      = () => { setSelectedBrands([]); setSelectedPrice(null); setSelectedRating(null); setSelectedFeatures([]) }

  const Sidebar = (
    <aside>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-sm">Filters</h3>
        {hasFilters && (
          <button onClick={resetFilters} className="text-xs text-blue-600 hover:underline font-medium">
            Clear All
          </button>
        )}
      </div>

      <FilterSection title="Brand">
        {brandCounts.map(([brand, count]) => (
          <label key={brand} className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{brand}</span>
            </div>
            <span className="text-xs text-gray-400">({count})</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Price">
        {PRICE_RANGES.map((range, i) => (
          <label key={i} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="laptop-price"
              checked={selectedPrice === i}
              onChange={() => setSelectedPrice(selectedPrice === i ? null : i)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{range.label}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Rating">
        {RATING_OPTIONS.map(opt => (
          <label key={opt.min} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="laptop-rating"
              checked={selectedRating === opt.min}
              onChange={() => setSelectedRating(selectedRating === opt.min ? null : opt.min)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{opt.label}</span>
            </div>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Features">
        {FEATURES.map(feat => (
          <label key={feat} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedFeatures.includes(feat)}
              onChange={() => toggleFeature(feat)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">{feat}</span>
          </label>
        ))}
      </FilterSection>
    </aside>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">Laptops</span>
        </nav>

        {/* Title + Sort row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Laptops</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {loading ? 'Loading...' : `${displayProducts.length} Products`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden flex items-center gap-1.5 border border-gray-300 bg-white text-sm px-3 py-1.5 rounded-lg font-medium text-gray-700 hover:border-blue-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>

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
        </div>

        {/* Mobile filter drawer */}
        {filterOpen && (
          <div className="lg:hidden bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
            {Sidebar}
          </div>
        )}

        {/* Layout */}
        <div className="flex gap-6">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
              {Sidebar}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="text-center py-16 text-red-500 font-medium">
                Failed to load products. Please try again.
              </div>
            )}

            {!error && !loading && displayProducts.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-semibold text-gray-600 text-base">No laptops match your filters</p>
                <p className="text-sm mt-1">Try adjusting or clearing the applied filters.</p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : displayProducts.map(product => <Card key={product.id} product={product} />)
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default LaptopsPage
