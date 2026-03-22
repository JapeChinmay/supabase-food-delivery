import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useCartStore } from "../store/cartStore"
import { formatCurrency } from "../utils/formatCurrency"
import type { Restaurant, MenuItem } from "../types"


interface Theme {
  hero: string           // hero gradient
  heroText: string       // text color on hero
  accent: string         // button + badge bg
  accentText: string     // text on accent
  cardBg: string         // menu item card bg
  cardBorder: string     // card border
  tagBg: string          // category tag bg
  tagText: string        // category tag text
  pattern: string        // decorative emoji pattern
  mood: string           // one-line mood descriptor
  emoji: string          // hero emoji
  overlayBg: string      // soft section bg
}

const themes: Record<string, Theme> = {
  "North Indian": {
    hero: "from-orange-700 via-orange-600 to-red-600",
    heroText: "text-orange-50",
    accent: "bg-orange-500 hover:bg-orange-600",
    accentText: "text-white",
    cardBg: "bg-orange-50",
    cardBorder: "border-orange-100",
    tagBg: "bg-orange-100",
    tagText: "text-orange-700",
    pattern: "🍛",
    mood: "Authentic flavours from the royal kitchens of North India",
    emoji: "🍛",
    overlayBg: "bg-orange-50",
  },
  Hyderabadi: {
    hero: "from-yellow-700 via-amber-600 to-orange-600",
    heroText: "text-yellow-50",
    accent: "bg-amber-500 hover:bg-amber-600",
    accentText: "text-white",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-100",
    tagBg: "bg-amber-100",
    tagText: "text-amber-700",
    pattern: "🍚",
    mood: "Dum-cooked perfection — the Nizam's own recipes",
    emoji: "🍚",
    overlayBg: "bg-amber-50",
  },
  Italian: {
    hero: "from-green-700 via-emerald-600 to-teal-600",
    heroText: "text-green-50",
    accent: "bg-green-600 hover:bg-green-700",
    accentText: "text-white",
    cardBg: "bg-green-50",
    cardBorder: "border-green-100",
    tagBg: "bg-green-100",
    tagText: "text-green-700",
    pattern: "🍕",
    mood: "La dolce vita — authentic Italian from wood-fired ovens",
    emoji: "🍕",
    overlayBg: "bg-green-50",
  },
  Chinese: {
    hero: "from-red-700 via-red-600 to-orange-600",
    heroText: "text-red-50",
    accent: "bg-red-600 hover:bg-red-700",
    accentText: "text-white",
    cardBg: "bg-red-50",
    cardBorder: "border-red-100",
    tagBg: "bg-red-100",
    tagText: "text-red-700",
    pattern: "🥡",
    mood: "Wok-fired flavours from the streets of Shanghai",
    emoji: "🥡",
    overlayBg: "bg-red-50",
  },
  Mexican: {
    hero: "from-yellow-600 via-orange-500 to-red-500",
    heroText: "text-yellow-50",
    accent: "bg-orange-500 hover:bg-orange-600",
    accentText: "text-white",
    cardBg: "bg-yellow-50",
    cardBorder: "border-yellow-100",
    tagBg: "bg-yellow-100",
    tagText: "text-yellow-700",
    pattern: "🌮",
    mood: "Bold spices and street flavours straight from Mexico City",
    emoji: "🌮",
    overlayBg: "bg-yellow-50",
  },
  Healthy: {
    hero: "from-teal-700 via-emerald-600 to-green-500",
    heroText: "text-teal-50",
    accent: "bg-teal-600 hover:bg-teal-700",
    accentText: "text-white",
    cardBg: "bg-teal-50",
    cardBorder: "border-teal-100",
    tagBg: "bg-teal-100",
    tagText: "text-teal-700",
    pattern: "🥗",
    mood: "Clean. Fresh. Nourishing. Feel good with every bite",
    emoji: "🥗",
    overlayBg: "bg-teal-50",
  },
  Vegan: {
    hero: "from-green-800 via-green-700 to-emerald-600",
    heroText: "text-green-50",
    accent: "bg-green-700 hover:bg-green-800",
    accentText: "text-white",
    cardBg: "bg-green-50",
    cardBorder: "border-green-200",
    tagBg: "bg-green-100",
    tagText: "text-green-800",
    pattern: "🌱",
    mood: "100% plant-based. 100% delicious. Zero compromise",
    emoji: "🌱",
    overlayBg: "bg-green-50",
  },
  "Fast Food": {
    hero: "from-yellow-500 via-orange-500 to-red-500",
    heroText: "text-yellow-50",
    accent: "bg-yellow-500 hover:bg-yellow-600",
    accentText: "text-gray-900",
    cardBg: "bg-yellow-50",
    cardBorder: "border-yellow-100",
    tagBg: "bg-yellow-100",
    tagText: "text-yellow-800",
    pattern: "🍟",
    mood: "Fast. Hot. Delicious. Street energy on your plate",
    emoji: "🍟",
    overlayBg: "bg-yellow-50",
  },
  Cafe: {
    hero: "from-amber-900 via-amber-800 to-yellow-700",
    heroText: "text-amber-50",
    accent: "bg-amber-700 hover:bg-amber-800",
    accentText: "text-white",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-100",
    tagBg: "bg-amber-100",
    tagText: "text-amber-800",
    pattern: "☕",
    mood: "Slow down. Sip something warm. You deserve this",
    emoji: "☕",
    overlayBg: "bg-amber-50",
  },
  BBQ: {
    hero: "from-red-900 via-red-800 to-orange-700",
    heroText: "text-red-50",
    accent: "bg-red-700 hover:bg-red-800",
    accentText: "text-white",
    cardBg: "bg-red-50",
    cardBorder: "border-red-200",
    tagBg: "bg-red-100",
    tagText: "text-red-800",
    pattern: "🔥",
    mood: "Low and slow smoked over real wood — fire in every bite",
    emoji: "🔥",
    overlayBg: "bg-red-50",
  },
  Japanese: {
    hero: "from-rose-800 via-pink-700 to-rose-600",
    heroText: "text-rose-50",
    accent: "bg-rose-600 hover:bg-rose-700",
    accentText: "text-white",
    cardBg: "bg-rose-50",
    cardBorder: "border-rose-100",
    tagBg: "bg-rose-100",
    tagText: "text-rose-700",
    pattern: "🌸",
    mood: "Precision, freshness and artistry — the way of the sushi master",
    emoji: "🍣",
    overlayBg: "bg-rose-50",
  },
  default: {
    hero: "from-gray-800 via-gray-700 to-gray-600",
    heroText: "text-gray-50",
    accent: "bg-gray-700 hover:bg-gray-800",
    accentText: "text-white",
    cardBg: "bg-gray-50",
    cardBorder: "border-gray-100",
    tagBg: "bg-gray-100",
    tagText: "text-gray-700",
    pattern: "🍽️",
    mood: "Good food, great vibes",
    emoji: "🍽️",
    overlayBg: "bg-gray-50",
  },
}


const nameThemes: Record<string, Partial<Theme>> = {
  "Royal Thali": {
    hero: "from-yellow-900 via-amber-800 to-yellow-700",
    heroText: "text-yellow-100",
    accent: "bg-yellow-600 hover:bg-yellow-700",
    accentText: "text-yellow-950",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-200",
    tagBg: "bg-yellow-100",
    tagText: "text-yellow-900",
    pattern: "👑",
    mood: "A royal feast fit for a Maharaja — thalis that tell a story",
    emoji: "👑",
    overlayBg: "bg-yellow-50",
  },
  "Midnight Cravings": {
    hero: "from-indigo-950 via-indigo-900 to-violet-900",
    heroText: "text-indigo-200",
    accent: "bg-indigo-500 hover:bg-indigo-600",
    accentText: "text-white",
    cardBg: "bg-indigo-950",
    cardBorder: "border-indigo-800",
    tagBg: "bg-indigo-900",
    tagText: "text-indigo-300",
    pattern: "🌙",
    mood: "When the world sleeps, we cook. Open all night",
    emoji: "🌙",
    overlayBg: "bg-indigo-950",
  },
  "Desi Chaat": {
    hero: "from-orange-600 via-yellow-500 to-green-500",
    heroText: "text-white",
    accent: "bg-orange-500 hover:bg-orange-600",
    accentText: "text-white",
    cardBg: "bg-orange-50",
    cardBorder: "border-orange-100",
    tagBg: "bg-orange-100",
    tagText: "text-orange-800",
    pattern: "🌶️",
    mood: "Tangy. Spicy. Chaotic. Just like the streets of Old Delhi",
    emoji: "🥘",
    overlayBg: "bg-orange-50",
  },
  "Korean Kitchen": {
    hero: "from-rose-700 via-pink-600 to-red-500",
    heroText: "text-rose-50",
    accent: "bg-rose-500 hover:bg-rose-600",
    accentText: "text-white",
    cardBg: "bg-rose-50",
    cardBorder: "border-rose-100",
    tagBg: "bg-rose-100",
    tagText: "text-rose-700",
    pattern: "🥢",
    mood: "K-food fever — bold, spicy and utterly addictive",
    emoji: "🍱",
    overlayBg: "bg-rose-50",
  },
}

function getTheme(name: string, cuisine: string): Theme {
  if (nameThemes[name]) {
    return { ...themes[cuisine] ?? themes.default, ...nameThemes[name] }
  }
  return themes[cuisine] ?? themes.default
}

// ── Component ─────────────────────────────────────────────────
export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems]   = useState<MenuItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")

  const { items, addItem } = useCartStore()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    async function fetchAll() {
      const [{ data: r }, { data: m }] = await Promise.all([
        supabase.from("restaurants").select("*").eq("id", id).single(),
        supabase.from("menu_items").select("*").eq("restaurant_id", id).order("category"),
      ])
      setRestaurant(r)
      setMenuItems(m ?? [])
      setLoading(false)
    }
    fetchAll()
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!restaurant) return (
    <div className="text-center py-20 text-gray-500">Restaurant not found</div>
  )

  const theme = getTheme(restaurant.name, restaurant.cuisine)
  const isMidnight = restaurant.name === "Midnight Cravings"
  const isRoyal    = restaurant.name === "Royal Thali"

  const categories = ["All", ...Array.from(new Set(menuItems.map(i => i.category)))]
  const filtered   = activeCategory === "All"
    ? menuItems
    : menuItems.filter(i => i.category === activeCategory)

  function cartQty(itemId: string) {
    return items.find(i => i.id === itemId)?.quantity ?? 0
  }

  return (
    <div className={isMidnight ? "bg-indigo-950 min-h-screen" : "bg-gray-50 min-h-screen"}>

   
      <div className={`relative bg-gradient-to-br ${theme.hero} overflow-hidden`}>

    
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="absolute text-2xl select-none opacity-10"
              style={{
                left:  `${(i * 17) % 100}%`,
                top:   `${(i * 23) % 100}%`,
                transform: `rotate(${i * 18}deg)`,
              }}
            >
              {theme.pattern}
            </span>
          ))}
        </div>

       
        {isRoyal && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 animate-pulse" />
        )}

     
        {isMidnight && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left:  `${Math.random() * 100}%`,
                  top:   `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: Math.random() * 0.6 + 0.2,
                }}
              />
            ))}
          </div>
        )}

    
        <button
          onClick={() => navigate(-1)}
          className={`absolute top-4 left-4 z-20 ${theme.heroText} bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-medium hover:bg-black/30 transition`}
        >
          ← Back
        </button>

   
        {cartCount > 0 && (
          <button
            onClick={() => navigate("/cart")}
            className={`absolute top-4 right-4 z-20 ${theme.accent} ${theme.accentText} px-4 py-2 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2`}
          >
            🛒 {cartCount} item{cartCount > 1 ? "s" : ""} · View cart
          </button>
        )}

    
        {restaurant.image_url && (
          <div className="absolute inset-0">
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}

 
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-16 pb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">{theme.emoji}</span>
            {isRoyal && <span className="text-3xl">👑</span>}
          </div>

          <h1 className={`text-4xl md:text-5xl font-extrabold ${theme.heroText} mb-2 drop-shadow`}>
            {restaurant.name}
          </h1>

          <p className={`${theme.heroText} opacity-80 text-base mb-4 italic`}>
            "{theme.mood}"
          </p>

     
          <div className="flex flex-wrap gap-3">
            <span className={`${theme.heroText} bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-semibold flex items-center gap-1`}>
              ⭐ {restaurant.rating} rating
            </span>
            <span className={`${theme.heroText} bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-semibold`}>
              🕐 {restaurant.delivery_time} mins delivery
            </span>
            <span className={`${theme.heroText} bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-semibold`}>
              🍽️ {restaurant.cuisine}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${
              restaurant.is_open
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}>
              {restaurant.is_open ? "● Open now" : "● Closed"}
            </span>
          </div>
        </div>
      </div>


      <div className={`sticky top-16 z-30 ${isMidnight ? "bg-indigo-950 border-indigo-800" : "bg-white border-gray-100"} border-b shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? `${theme.accent} ${theme.accentText} shadow-md scale-105`
                  : isMidnight
                    ? "bg-indigo-900 text-indigo-300 hover:bg-indigo-800"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

   
      <div className="max-w-4xl mx-auto px-4 py-8">

    
        {cartCount > 0 && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${theme.accent} ${theme.accentText} px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 font-semibold`}>
            <span>🛒 {cartCount} item{cartCount > 1 ? "s" : ""} added</span>
            <button
              onClick={() => navigate("/cart")}
              className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-xl text-sm transition"
            >
              View Cart →
            </button>
          </div>
        )}

  
        {categories
          .filter(c => c !== "All")
          .filter(c => activeCategory === "All" || c === activeCategory)
          .map((category) => {
            const catItems = filtered.filter(i => i.category === category)
            if (catItems.length === 0) return null

            return (
              <div key={category} className="mb-10">
           
                <div className="flex items-center gap-3 mb-4">
                  <h2 className={`text-xl font-bold ${isMidnight ? "text-indigo-200" : "text-gray-800"}`}>
                    {category}
                  </h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${theme.tagBg} ${theme.tagText}`}>
                    {catItems.length} items
                  </span>
                  <div className={`flex-1 h-px ${isMidnight ? "bg-indigo-800" : "bg-gray-200"}`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catItems.map((item) => {
                    const qty = cartQty(item.id)
                    return (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-4 rounded-2xl border ${theme.cardBg} ${theme.cardBorder} ${
                          !item.is_available ? "opacity-50" : ""
                        } transition-all hover:shadow-md`}
                      >
                     
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${theme.hero} flex items-center justify-center text-2xl`}>
                              {theme.emoji}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-bold text-sm ${isMidnight ? "text-indigo-100" : "text-gray-900"}`}>
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className={`text-xs mt-0.5 line-clamp-2 ${isMidnight ? "text-indigo-400" : "text-gray-500"}`}>
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span className={`font-bold text-base ${isMidnight ? "text-indigo-200" : "text-gray-900"}`}>
                              {formatCurrency(item.price)}
                            </span>

                      
                            {item.is_available ? (
                              qty === 0 ? (
                                <button
                                  onClick={() => addItem(item, restaurant.id)}
                                  className={`${theme.accent} ${theme.accentText} px-4 py-1.5 rounded-xl text-sm font-bold transition active:scale-95 shadow-sm`}
                                >
                                  + Add
                                </button>
                              ) : (
                                <div className={`flex items-center gap-2 ${theme.accent} rounded-xl px-2 py-1`}>
                                  <button
                                    onClick={() => useCartStore.getState().updateQuantity(item.id, qty - 1)}
                                    className={`${theme.accentText} font-bold w-6 h-6 flex items-center justify-center hover:opacity-80`}
                                  >
                                    −
                                  </button>
                                  <span className={`${theme.accentText} font-bold text-sm w-4 text-center`}>{qty}</span>
                                  <button
                                    onClick={() => addItem(item, restaurant.id)}
                                    className={`${theme.accentText} font-bold w-6 h-6 flex items-center justify-center hover:opacity-80`}
                                  >
                                    +
                                  </button>
                                </div>
                              )
                            ) : (
                              <span className="text-xs text-red-400 font-medium">Unavailable</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}