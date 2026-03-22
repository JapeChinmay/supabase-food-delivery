
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import type { Restaurant } from "../types";

export default function RestaurantList() {

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    useEffect(() => {

        async function fetch() {
            const { data, error } = await supabase.from('restaurants').select('*')
            if (error) {
                console.log(error);
            } else {
                setRestaurants(data);
                console.log(data);
            }

        }
          fetch();

    }, [])

    return (
      <div className="max-w-6xl mx-auto p-6">
  <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">
    Restaurants
  </h1>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    {restaurants.map((r: any) => (
      <div
        key={r.id}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      >
     
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {r.image_url ? (
            <img
              src={r.image_url}
              alt={r.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              🍽️
            </div>
          )}

        
          {r.image_url && (
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          )}

      
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold shadow">
            ⭐ {r.rating}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h2 className="font-semibold text-lg text-gray-900 group-hover:text-orange-500 transition">
            {r.name}
          </h2>

          <p className="text-sm text-gray-500">
            {r.cuisine}
          </p>

          {/* Bottom row */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
              {r.delivery_time} mins
            </span>

            <span
              className={`text-xs font-medium ${
                r.is_open ? "text-green-600" : "text-red-500"
              }`}
            >
              {r.is_open ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
    )

}
