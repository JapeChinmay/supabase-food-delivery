import { useNavigate } from "react-router-dom"

export default function Home() {

    const navigate = useNavigate();
    
      return (

            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 px-4">

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Food, delivered fast 🍔
        </h1>

        <p className="text-gray-600 text-lg">
          Discover the best restaurants near you
        </p>

        <button
          onClick={() => navigate("/restaurants")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
        >
          Explore Restaurants
        </button>

      </div>
    </div>

      )
}