// TechMatch - Agentic Search powered by Gemini AI
// Understands natural language queries and extracts structured search intent.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const SYSTEM_PROMPT = `You are TechMatch AI, an intelligent shopping assistant for an electronics store.
Your job is to understand a customer's search query and return structured JSON to power the search.

The search engine is a simple text-match API. It can only find products by matching against product names, brands, and descriptions.

Available product categories: smartphones, laptops, tablets, mobile-accessories

Respond ONLY with valid JSON (no markdown, no code fences). Use this exact schema:
{
  "searchTerms": ["term1", "term2"],
  "category": "smartphones" | "laptops" | "tablets" | "mobile-accessories" | null,
  "maxPrice": number | null,
  "minPrice": number | null,
  "minRating": number | null,
  "sortBy": "price-asc" | "price-desc" | "rating" | "discount" | null,
  "summary": "A short 1-2 sentence friendly AI summary explaining what you understood and what you're searching for.",
  "suggestions": ["suggestion1", "suggestion2"]
}

CRITICAL rules for "searchTerms":
- searchTerms must ONLY contain words that would appear in a product name, brand, or description.
- GOOD searchTerms: "laptop", "Samsung", "iPhone", "headphones", "charger", "MacBook", "Galaxy", "tablet"
- BAD searchTerms (NEVER use these): "cheap", "best", "affordable", "students", "gaming", "good", "top", "budget", "lightweight", "fast", "pro", "under"
- For "cheap laptop for students" → searchTerms: ["laptop"]
- For "best phone under 500" → searchTerms: ["phone"]
- For "affordable Samsung earbuds" → searchTerms: ["Samsung", "earbuds"]
- For "iPhone 15" → searchTerms: ["iPhone 15"]
- Intent words like cheap/best/affordable should be expressed via sortBy, maxPrice, minRating instead.

Other rules:
- If the user mentions a budget, set maxPrice/minPrice accordingly. Prices are in USD.
- If the user asks for "best", "top rated", sort by rating.
- If the user asks for "cheap" or "affordable", sort by price-asc.
- "suggestions" should be 2-3 related product searches the user might also like. Keep them short (1-3 words).
- Always provide a friendly "summary" of what you understood.`

const STOP_WORDS = new Set([
  "a","an","the","for","and","or","but","in","on","at","to","of","is","it",
  "with","by","from","up","about","into","over","after","my","me","i","we",
  "best","top","good","great","cheap","affordable","expensive","budget",
  "students","student","professional","professionals","gaming","gamer",
  "under","below","above","around","between","near",
  "buy","buying","want","need","looking","find","search","show","get",
  "lightweight","heavy","fast","slow","new","old","latest","popular",
])

function filterSearchWords(query) {
  return query.split(/\s+/)
    .filter(Boolean)
    .filter(w => !STOP_WORDS.has(w.toLowerCase()))
}

export async function analyzeSearchQuery(userQuery) {
  // If no API key, return a basic fallback
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    const terms = filterSearchWords(userQuery)
    return {
      searchTerms: terms.length > 0 ? terms : userQuery.split(/\s+/).filter(Boolean),
      category: null,
      maxPrice: null,
      minPrice: null,
      minRating: null,
      sortBy: null,
      summary: null,
      suggestions: [],
      isAI: false,
    }
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userQuery }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
          },
        }),
      }
    )

    if (!res.ok) {
      console.warn("Gemini API error:", res.status)
      return fallback(userQuery)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const parsed = JSON.parse(text)

    return { ...parsed, isAI: true }
  } catch (err) {
    console.warn("Gemini parse error:", err)
    return fallback(userQuery)
  }
}

function fallback(query) {
  const terms = filterSearchWords(query)
  return {
    searchTerms: terms.length > 0 ? terms : query.split(/\s+/).filter(Boolean),
    category: null,
    maxPrice: null,
    minPrice: null,
    minRating: null,
    sortBy: null,
    summary: null,
    suggestions: [],
    isAI: false,
  }
}
