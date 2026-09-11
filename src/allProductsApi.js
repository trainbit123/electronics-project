// TechMatch - Unified Products Utility
// Fetches smartphones, laptops, tablets, mobile-accessories from DummyJSON
// and returns a randomly shuffled mixed array.

const CATEGORIES = [
  'smartphones',
  'laptops',
  'tablets',
  'mobile-accessories',
]

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function fetchAllProducts() {
  const results = await Promise.all(
    CATEGORIES.map(cat =>
      fetch(`https://dummyjson.com/products/category/${cat}?limit=100`)
        .then(r => { if (!r.ok) throw new Error('Failed: ' + cat); return r.json() })
        .then(d => d.products)
    )
  )
  return shuffle(results.flat())
}

export async function fetchTrendingProducts(n = 20) {
  const all = await fetchAllProducts()
  return all.slice(0, n)
}
