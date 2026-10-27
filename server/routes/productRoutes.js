import express from "express"

const router = express.Router()

const CATEGORIES = ["smartphones", "laptops", "tablets", "mobile-accessories"]

// Fetch products helper from DummyJSON
const fetchCategoryProducts = async (cat) => {
  const res = await fetch(`https://dummyjson.com/products/category/${cat}?limit=100`)
  if (!res.ok) throw new Error(`Failed to fetch category: ${cat}`)
  const data = await res.json()
  return data.products || []
}

// @route   GET /api/products
// @desc    Get all products or filter by category
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, search, limit = 100 } = req.query

    if (category) {
      const products = await fetchCategoryProducts(category)
      return res.json({ success: true, count: products.length, products: products.slice(0, Number(limit)) })
    }

    // If no category specified, fetch all electronic categories
    const results = await Promise.all(CATEGORIES.map((cat) => fetchCategoryProducts(cat)))
    let all = results.flat()

    if (search) {
      const q = search.toLowerCase()
      all = all.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }

    res.json({
      success: true,
      count: all.length,
      products: all.slice(0, Number(limit)),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/products/categories
// @desc    Get supported product categories
// @access  Public
router.get("/categories", (req, res) => {
  res.json({
    success: true,
    categories: CATEGORIES,
  })
})

// @route   GET /api/products/:id
// @desc    Get single product details
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const response = await fetch(`https://dummyjson.com/products/${req.params.id}`)
    if (!response.ok) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }
    const product = await response.json()
    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
