import React, { useState, useEffect, useRef } from "react"
import { useSearchParams, Link } from "react-router-dom"
import Card from "../Card"
import { analyzeSearchQuery } from "../geminiAgent"

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

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
      AI
    </span>
  )
}

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [aiInsight, setAiInsight] = useState(null)
  const navigate = useRef(null)

  useEffect(() => {
    if (!query.trim()) {
      setProducts([])
      setAiInsight(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setAiInsight(null)

    async function doSearch() {
      try {
        // Step 1: Ask Gemini to understand the query
        const intent = await analyzeSearchQuery(query)

        if (cancelled) return

        if (intent.isAI) {
          setAiInsight(intent)
        }

        // Step 2: Build search fetches
        const terms = intent.searchTerms?.length ? intent.searchTerms : [query]
        const fetches = []

        // Search each term separately for better results
        for (const term of terms) {
          fetches.push(
            fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(term)}&limit=100`)
              .then(r => r.ok ? r.json() : { products: [] })
              .then(d => d.products || [])
          )
        }

        // Always fetch full category if AI identified one
        if (intent.category) {
          fetches.push(
            fetch(`https://dummyjson.com/products/category/${intent.category}?limit=100`)
              .then(r => r.ok ? r.json() : { products: [] })
              .then(d => d.products || [])
          )
        }

        const results = await Promise.all(fetches)
        if (cancelled) return

        // Merge & deduplicate
        const seen = new Set()
        let merged = []
        for (const list of results) {
          for (const p of list) {
            if (!seen.has(p.id)) {
              seen.add(p.id)
              merged.push(p)
            }
          }
        }

        // Step 3: Apply AI filters
        if (intent.maxPrice != null) {
          merged = merged.filter(p => p.price <= intent.maxPrice)
        }
        if (intent.minPrice != null) {
          merged = merged.filter(p => p.price >= intent.minPrice)
        }
        if (intent.minRating != null) {
          merged = merged.filter(p => p.rating >= intent.minRating)
        }

        // Step 4: Apply AI sorting
        if (intent.sortBy === "price-asc") {
          merged.sort((a, b) => a.price - b.price)
        } else if (intent.sortBy === "price-desc") {
          merged.sort((a, b) => b.price - a.price)
        } else if (intent.sortBy === "rating") {
          merged.sort((a, b) => b.rating - a.rating)
        } else if (intent.sortBy === "discount") {
          merged.sort((a, b) => b.discountPercentage - a.discountPercentage)
        }

        setProducts(merged)
        setLoading(false)
      } catch (e) {
        if (!cancelled) {
          setError(e.message)
          setLoading(false)
        }
      }
    }

    doSearch()
    return () => { cancelled = true }
  }, [query])

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-800 font-medium">Search</span>
        </nav>

        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {query ? `Results for "${query}"` : "Search Products"}
            {aiInsight?.isAI && <AIBadge />}
          </h1>
          {!loading && query && (
            <p className="text-xs text-gray-500 mt-1">
              {products.length > 0 ? `${products.length} products found` : ""}
            </p>
          )}
        </div>

        {/* AI Insight Card */}
        {aiInsight?.isAI && aiInsight.summary && (
          <div className="mb-5 bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">
                  {aiInsight.summary}
                </p>

                {/* Applied filters info */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {aiInsight.category && (
                    <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      📂 {aiInsight.category}
                    </span>
                  )}
                  {aiInsight.maxPrice != null && (
                    <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      💰 Under ${aiInsight.maxPrice}
                    </span>
                  )}
                  {aiInsight.minRating != null && (
                    <span className="text-[11px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      ⭐ {aiInsight.minRating}+ rating
                    </span>
                  )}
                  {aiInsight.sortBy && (
                    <span className="text-[11px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                      🔃 Sorted: {aiInsight.sortBy}
                    </span>
                  )}
                </div>

                {/* Suggestions */}
                {aiInsight.suggestions?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-[11px] text-gray-400">Try also:</span>
                    {aiInsight.suggestions.map((s, i) => (
                      <Link
                        key={i}
                        to={`/search?q=${encodeURIComponent(s)}`}
                        className="text-[11px] text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* No query */}
        {!query && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-medium">Type something in the search bar to find products</p>
            <p className="text-gray-400 text-sm mt-2">Try natural language like "best phone under 500" or "lightweight laptop for students"</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16 text-red-500 font-medium">Search failed. Please try again.</div>
        )}

        {/* No results */}
        {!loading && !error && query && products.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-lg font-semibold text-gray-700">No products found for "{query}"</p>
            <p className="text-sm text-gray-400 mt-2">Try a different keyword like "iPhone", "laptop", or "headphones"</p>
            <Link to="/" className="mt-6 inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Back to Home
            </Link>
          </div>
        )}

        {/* Loading state with AI thinking indicator */}
        {loading && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>AI is analyzing your search...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {/* Results grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map(p => <Card key={p.id} product={p} />)}
          </div>
        )}

      </div>
    </div>
  )
}

export default SearchPage
