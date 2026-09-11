// TechMatch — "Is This Worth Buying?" Scoring Engine
// Transparent, data-only scoring. No fake information.

/* ─── Category average prices (fetched dynamically, fallback values) ─── */
const CATEGORY_AVG_FALLBACK = {
  smartphones: 500,
  laptops: 1200,
  tablets: 350,
  "mobile-accessories": 40,
}

/* ─── Helper: Parse warranty duration in months ─── */
function parseWarrantyMonths(str) {
  if (!str) return 0
  const lower = str.toLowerCase()
  if (lower.includes("no warranty")) return 0
  const match = lower.match(/(\d+)\s*(year|month|week|day)/i)
  if (!match) return 0
  const n = parseInt(match[1], 10)
  const unit = match[2].toLowerCase()
  if (unit.startsWith("year")) return n * 12
  if (unit.startsWith("month")) return n
  if (unit.startsWith("week")) return Math.round(n / 4)
  return 0
}

/* ─── Helper: Score return policy ─── */
function scoreReturnPolicy(policy) {
  if (!policy) return 0
  const lower = policy.toLowerCase()
  if (lower.includes("no return")) return 0
  const match = lower.match(/(\d+)\s*day/i)
  if (!match) return 3
  const days = parseInt(match[1], 10)
  if (days >= 90) return 5
  if (days >= 60) return 4
  if (days >= 30) return 3
  if (days >= 7) return 2
  return 1
}

/* ─── Helper: Analyze reviews ─── */
function analyzeReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return { count: 0, avgRating: 0, positiveRatio: 0, sentiments: [] }
  }
  const ratings = reviews.map(r => r.rating)
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length
  const positive = ratings.filter(r => r >= 4).length
  const sentiments = reviews.map(r => ({
    rating: r.rating,
    comment: r.comment,
    reviewer: r.reviewerName,
    isPositive: r.rating >= 4,
  }))
  return {
    count: reviews.length,
    avgRating,
    positiveRatio: positive / reviews.length,
    sentiments,
  }
}

/* ─── Main: calculateWorthScore ─── */
export function calculateWorthScore(product, categoryProducts = []) {
  if (!product) return { score: 0, breakdown: {}, strengths: [], weaknesses: [], buyFor: [], avoidFor: [] }

  const {
    price = 0, rating = 0, discountPercentage = 0,
    reviews = [], brand, description, warrantyInformation,
    returnPolicy, availabilityStatus, shippingInformation,
    stock = 0, weight, dimensions, tags, category, title,
    minimumOrderQuantity = 1,
  } = product

  const reviewData = analyzeReviews(reviews)

  /* ── 1. Rating Score (0-30) ── */
  const ratingScore = Math.round((Math.min(rating, 5) / 5) * 30)

  /* ── 2. Value Score (0-25) ── */
  let avgPrice = CATEGORY_AVG_FALLBACK[category] || 300
  if (categoryProducts.length > 2) {
    avgPrice = categoryProducts.reduce((s, p) => s + p.price, 0) / categoryProducts.length
  }
  // How much cheaper is this product vs category average? (clamped -1 to 1)
  const priceRatio = Math.max(-1, Math.min(1, (avgPrice - price) / avgPrice))
  let valueScore = Math.round(12.5 + priceRatio * 12.5) // 0-25 range
  // Discount bonus (up to 5 extra, capped at 25 total)
  const discountBonus = Math.min(5, Math.round(discountPercentage / 5))
  valueScore = Math.min(25, valueScore + discountBonus)

  /* ── 3. Review Confidence (0-15) ── */
  let reviewScore = 0
  if (reviewData.count > 0) {
    const countScore = Math.min(5, reviewData.count) // up to 5 for having reviews
    const avgScore = (reviewData.avgRating / 5) * 5   // up to 5 for avg quality
    const sentimentScore = reviewData.positiveRatio * 5 // up to 5 for positive ratio
    reviewScore = Math.round(countScore + avgScore + sentimentScore)
  }
  reviewScore = Math.min(15, reviewScore)

  /* ── 4. Product Info Completeness (0-10) ── */
  let completeness = 0
  if (brand) completeness += 2
  if (description && description.length > 20) completeness += 2
  if (warrantyInformation && !warrantyInformation.toLowerCase().includes("no warranty")) completeness += 2
  if (returnPolicy && !returnPolicy.toLowerCase().includes("no return")) completeness += 2
  if (weight || (dimensions && dimensions.width)) completeness += 1
  if (tags && tags.length > 0) completeness += 1
  completeness = Math.min(10, completeness)

  /* ── 5. Warranty & Return (0-10) ── */
  const warrantyMonths = parseWarrantyMonths(warrantyInformation)
  const warrantyScore = Math.min(5, Math.round(warrantyMonths / 6)) // 1pt per 6 months, max 5
  const returnScore = scoreReturnPolicy(returnPolicy)
  const warrantyReturnScore = Math.min(10, warrantyScore + returnScore)

  /* ── 6. Availability (0-10) ── */
  let availScore = 0
  if (availabilityStatus === "In Stock") availScore += 4
  else if (availabilityStatus === "Low Stock") availScore += 2
  if (stock > 50) availScore += 2
  else if (stock > 10) availScore += 1
  if (shippingInformation) {
    const ship = shippingInformation.toLowerCase()
    if (ship.includes("overnight") || ship.includes("1-2 business")) availScore += 3
    else if (ship.includes("3-5") || ship.includes("1 week")) availScore += 2
    else availScore += 1
  }
  if (minimumOrderQuantity <= 1) availScore += 1
  availScore = Math.min(10, availScore)

  /* ── Total ── */
  const score = Math.min(100, ratingScore + valueScore + reviewScore + completeness + warrantyReturnScore + availScore)

  /* ── Breakdown ── */
  const breakdown = {
    rating:       { score: ratingScore,        max: 30, label: "Rating Quality" },
    value:        { score: valueScore,          max: 25, label: "Value for Money" },
    reviews:      { score: reviewScore,         max: 15, label: "Review Confidence" },
    completeness: { score: completeness,        max: 10, label: "Product Info" },
    warranty:     { score: warrantyReturnScore, max: 10, label: "Warranty & Returns" },
    availability: { score: availScore,          max: 10, label: "Availability" },
  }

  /* ── Strengths ── */
  const strengths = []
  if (rating >= 4) strengths.push(`High user rating (${rating.toFixed(1)}/5)`)
  else if (rating >= 3.5) strengths.push(`Good user rating (${rating.toFixed(1)}/5)`)
  if (discountPercentage >= 10) strengths.push(`Strong discount (${Math.round(discountPercentage)}% off)`)
  if (warrantyMonths >= 12) strengths.push(`${warrantyInformation}`)
  if (returnPolicy && !returnPolicy.toLowerCase().includes("no return")) strengths.push(`${returnPolicy}`)
  if (price < avgPrice * 0.8) strengths.push("Priced below category average")
  if (availabilityStatus === "In Stock" && stock > 30) strengths.push("Good stock availability")
  if (brand) strengths.push(`Trusted brand: ${brand}`)
  if (reviewData.positiveRatio >= 0.7 && reviewData.count > 0) strengths.push("Mostly positive reviews")
  if (shippingInformation?.toLowerCase().includes("overnight")) strengths.push("Fast shipping (overnight)")

  /* ── Weaknesses ── */
  const weaknesses = []
  if (rating < 3) weaknesses.push(`Low rating (${rating.toFixed(1)}/5)`)
  else if (rating < 3.5) weaknesses.push(`Below-average rating (${rating.toFixed(1)}/5)`)
  if (price > avgPrice * 1.3) weaknesses.push("Priced above category average")
  if (reviewData.count < 3) weaknesses.push("Very few reviews for confidence")
  if (!warrantyInformation || warrantyInformation.toLowerCase().includes("no warranty")) weaknesses.push("No warranty coverage")
  if (returnPolicy?.toLowerCase().includes("no return")) weaknesses.push("No return policy")
  if (availabilityStatus === "Out of Stock") weaknesses.push("Currently out of stock")
  if (minimumOrderQuantity > 1) weaknesses.push(`Minimum order: ${minimumOrderQuantity} units`)
  if (shippingInformation?.toLowerCase().includes("1 month")) weaknesses.push("Long shipping time (1 month)")
  if (discountPercentage < 3) weaknesses.push("Little to no discount")
  if (!description || description.length < 30) weaknesses.push("Limited product description")

  /* ── Who should buy / avoid ── */
  const buyFor = []
  const avoidFor = []

  // Category-aware recommendations
  const cat = (category || "").toLowerCase()
  if (price < avgPrice * 0.7) {
    buyFor.push("Budget-conscious shoppers")
  }
  if (rating >= 4.2) {
    buyFor.push("Users who want a reliable, well-rated product")
  }
  if (cat === "smartphones") {
    if (price < 400) buyFor.push("Students and casual users")
    if (price > 800) { buyFor.push("Power users and professionals"); avoidFor.push("Budget buyers") }
  } else if (cat === "laptops") {
    if (price < 800) buyFor.push("Students and everyday users")
    if (price > 1500) { buyFor.push("Professionals and creatives"); avoidFor.push("Casual users on a budget") }
  } else if (cat === "tablets") {
    buyFor.push("Users who want a portable device for media and browsing")
    if (price > 600) avoidFor.push("Users who only need basic tablet functions")
  } else if (cat === "mobile-accessories") {
    buyFor.push("Anyone looking to enhance their mobile experience")
  }

  if (warrantyMonths >= 24) buyFor.push("Users who value long-term warranty protection")
  if (discountPercentage >= 15) buyFor.push("Deal hunters — great current discount")
  if (rating < 3.5) avoidFor.push("Users who want a proven, top-rated product")
  if (availabilityStatus === "Out of Stock") avoidFor.push("Anyone who needs the product urgently")
  if (reviewData.count < 2) avoidFor.push("Users who rely on extensive community reviews")

  // Ensure at least one entry
  if (buyFor.length === 0) buyFor.push("General consumers looking for this type of product")
  if (avoidFor.length === 0) avoidFor.push("Users who need extensive specs or benchmarks before buying")

  return {
    score,
    breakdown,
    strengths: strengths.slice(0, 6),
    weaknesses: weaknesses.slice(0, 5),
    buyFor: buyFor.slice(0, 4),
    avoidFor: avoidFor.slice(0, 4),
    reviewData,
    categoryAvgPrice: avgPrice,
  }
}

/* ─── Verdict from score ─── */
export function getWorthVerdict(score) {
  if (score >= 85) return { label: "Excellent Value",       emoji: "✅", color: "green",  recommendation: "BUY",      recommendColor: "green",  explanation: "This product scores exceptionally well across all criteria. It offers strong value, good ratings, and reliable seller policies." }
  if (score >= 70) return { label: "Worth Buying",          emoji: "👍", color: "blue",   recommendation: "BUY",      recommendColor: "green",  explanation: "This product is a solid choice with good overall value. It meets most quality benchmarks and is reasonably priced." }
  if (score >= 50) return { label: "Consider Alternatives", emoji: "⚠️", color: "yellow", recommendation: "CONSIDER", recommendColor: "yellow", explanation: "This product has some merits but also notable gaps. Compare with similar options before deciding." }
                   return { label: "Not Worth Buying",      emoji: "❌", color: "red",    recommendation: "SKIP",     recommendColor: "red",    explanation: "This product has significant concerns in pricing, ratings, or seller policies. We recommend exploring other options." }
}
