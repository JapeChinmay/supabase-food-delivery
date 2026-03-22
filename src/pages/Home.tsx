import { useNavigate } from "react-router-dom"

const floatingItems = ["🍕", "🍔", "🌮", "🍜", "🍣", "🥗", "🍛", "🧆", "🍩", "🥪"]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-rose-50">

   
      {floatingItems.map((emoji, i) => (
        <span
          key={i}
          className="absolute text-4xl select-none pointer-events-none opacity-20 animate-bounce"
          style={{
            left: `${(i * 10) + Math.random() * 5}%`,
            top: `${10 + (i % 3) * 30}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${2 + (i % 3)}s`,
          }}
        >
          {emoji}
        </span>
      ))}

      {/* Blurred color blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300 rounded-full opacity-20 blur-3xl" />
      <div className="absolute top-40 right-1/3 w-64 h-64 bg-yellow-200 rounded-full opacity-20 blur-3xl" />

      {/* Main content */}
      <div className="relative z-10 text-center space-y-6 px-4 max-w-2xl">

        <div className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-2">
          🚀 Fast delivery in 30 mins
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
          Hungry? <br />
          <span className="text-orange-500">We got you.</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Order from the best restaurants near you. Fresh food, fast delivery.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate("/restaurants")}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg shadow-orange-200"
          >
            Explore Restaurants 🍽️
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">500+</div>
            <div className="text-sm text-gray-500">Restaurants</div>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">30 min</div>
            <div className="text-sm text-gray-500">Avg delivery</div>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">4.8 ⭐</div>
            <div className="text-sm text-gray-500">Avg rating</div>
          </div>
        </div>

      </div>
    </div>
  )
}