import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"
import type { Restaurant } from "../types"

const cuisineTheme: Record<string, { gradient: string; emoji: string; bg: string; accent: string }> = {
  "North Indian": { gradient: "from-orange-600 to-red-600",    emoji: "🍛", bg: "bg-orange-50", accent: "text-orange-600" },
  Hyderabadi:     { gradient: "from-yellow-600 to-orange-600", emoji: "🍚", bg: "bg-yellow-50", accent: "text-yellow-600" },
  Italian:        { gradient: "from-green-500 to-emerald-500", emoji: "🍕", bg: "bg-green-50",  accent: "text-green-600" },
  Chinese:        { gradient: "from-red-600 to-orange-500",    emoji: "🥡", bg: "bg-red-50",    accent: "text-red-600" },
  Mexican:        { gradient: "from-yellow-500 to-orange-500", emoji: "🌮", bg: "bg-yellow-50", accent: "text-yellow-600" },
  Healthy:        { gradient: "from-green-400 to-teal-500",    emoji: "🥗", bg: "bg-teal-50",   accent: "text-teal-600" },
  Vegan:          { gradient: "from-emerald-500 to-green-400", emoji: "🌱", bg: "bg-emerald-50",accent: "text-emerald-600" },
  "Fast Food":    { gradient: "from-yellow-400 to-orange-400", emoji: "🍟", bg: "bg-yellow-50", accent: "text-orange-500" },
  Cafe:           { gradient: "from-amber-700 to-yellow-600",  emoji: "☕", bg: "bg-amber-50",  accent: "text-amber-700" },
  BBQ:            { gradient: "from-red-700 to-orange-600",    emoji: "🔥", bg: "bg-red-50",    accent: "text-red-700" },
  default:        { gradient: "from-gray-500 to-gray-400",     emoji: "🍽️", bg: "bg-gray-50",   accent: "text-gray-500" },
}

function getTheme(cuisine: string) {
  return cuisineTheme[cuisine] ?? cuisineTheme.default
}

const heroSlides = [
  { label: "Biryani",    emoji: "🍚", gradient: "from-yellow-600 via-orange-500 to-red-500" },
  { label: "Pizza",      emoji: "🍕", gradient: "from-green-600 via-emerald-500 to-teal-500" },
  { label: "BBQ",        emoji: "🔥", gradient: "from-red-700 via-red-500 to-orange-500" },
  { label: "Healthy",    emoji: "🥗", gradient: "from-teal-600 via-green-500 to-emerald-400" },
]

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState("")
  const [filter, setFilter]           = useState("All")
  const [slide, setSlide]             = useState(0)
  const navigate = useNavigate()


  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("rating", { ascending: false })
      if (!error) setRestaurants(data ?? [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const cuisines = ["All", ...Array.from(new Set(restaurants.map((r) => r.cuisine)))]

  const filtered = restaurants.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "All" || r.cuisine === filter
    return matchSearch && matchFilter
  })

  const current = heroSlides[slide]

  return (
    <div className="min-h-screen bg-gray-50">

    
      <div className={`relative bg-gradient-to-br ${current.gradient} transition-all duration-1000 overflow-hidden`}>

        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-black/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        {["🍕","🍔","🌮","🍜","🍣","🥗","🍛","🔥","☕","🌱"].map((e, i) => (
          <span
            key={i}
            className="absolute text-3xl opacity-10 select-none pointer-events-none animate-bounce"
            style={{
              left: `${i * 10 + 2}%`,
              top:  `${15 + (i % 3) * 25}%`,
              animationDelay:    `${i * 0.3}s`,
              animationDuration: `${2 + (i % 3) * 0.5}s`,
            }}
          >
            {e}
          </span>
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-14">

          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl transition-all duration-500">{current.emoji}</span>
            <span className="text-white/80 font-semibold text-lg tracking-wide uppercase">
              {current.label} time
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight drop-shadow">
            What are you <br />
            <span className="text-yellow-200">craving today?</span>
          </h1>
          <p className="text-white/70 mb-8 text-base">
            {restaurants.length} restaurants • Fast delivery • Best prices
          </p>

        
          <div className="relative max-w-2xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search for restaurant, cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-gray-800 shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/50 text-base placeholder-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

       
          <div className="flex gap-2 mt-6">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === slide ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

   
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex gap-6 overflow-x-auto">
          {[
            { icon: "🚀", label: "Express delivery", sub: "Under 30 mins" },
            { icon: "⭐", label: "Top rated",         sub: "4.5+ restaurants" },
            { icon: "💰", label: "Best deals",        sub: "Save on every order" },
            { icon: "🆕", label: "New arrivals",      sub: "Just added near you" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 flex-shrink-0 cursor-pointer group">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-500 transition">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

    
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8" style={{ scrollbarWidth: "none" }}>
          {cuisines.map((c) => {
            const t = getTheme(c)
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  filter === c
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200 scale-105"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                {c !== "All" && <span>{t.emoji}</span>}
                {c}
              </button>
            )
          })}
        </div>

   
        {!loading && (
          <p className="text-sm text-gray-400 mb-4">
            Showing <span className="font-semibold text-gray-700">{filtered.length}</span> restaurants
            {filter !== "All" && <> in <span className="font-semibold text-orange-500">{filter}</span></>}
          </p>
        )}

      
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}


        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-xl font-semibold text-gray-700">No restaurants found</p>
            <p className="text-gray-400 mt-1">Try searching something else</p>
            <button
              onClick={() => { setSearch(""); setFilter("All") }}
              className="mt-4 text-orange-500 font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

  
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((r) => {
              const theme = getTheme(r.cuisine)
              return (
                <div
                  key={r.id}
                  onClick={() => navigate(`/restaurants/${r.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1.5 border border-gray-100"
                >
                
                  <div className="relative h-44 overflow-hidden">
                    {r.image_url ? (
                      <>
                        <img
                          src={r.image_url}
                          alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                        <span className="text-6xl">{theme.emoji}</span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl text-xs font-bold text-gray-800 shadow flex items-center gap-1">
                      ⭐ {r.rating}
                    </div>

               
                    <div className={`absolute bottom-3 left-3 bg-gradient-to-r ${theme.gradient} text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow`}>
                      {theme.emoji} {r.cuisine}
                    </div>

                 
                    {!r.is_open && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-xl text-sm">
                          Currently Closed
                        </span>
                      </div>
                    )}
                  </div>

                
                  <div className={`p-4 ${theme.bg}`}>
                    <h2 className={`font-bold text-gray-900 text-base group-hover:${theme.accent} transition-colors truncate`}>
                      {r.name}
                    </h2>

                    <div className="flex justify-between items-center mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-white/80 px-2.5 py-1 rounded-full border border-white shadow-sm">
                        🕐 {r.delivery_time} mins
                      </span>
                      <span className={`text-xs font-bold ${r.is_open ? "text-green-600" : "text-red-500"}`}>
                        {r.is_open ? "● Open" : "● Closed"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}