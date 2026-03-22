import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'

export default function Navbar() {
  const { user, signOut } = useAuthStore()
  const cartItems = useCartStore((state) => state.items)
  const navigate = useNavigate()
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🛻</span>
          <span className="font-bold text-xl text-gray-900">FoodTruck</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/restaurants" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
            Restaurants
          </Link>

          <button
            onClick={() => navigate('/cart')}
            className="relative text-gray-600 hover:text-purple-500 transition-colors"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                Login
              </Link>
               <Link to="/register" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">
                Register
              </Link>
              <button
                onClick={() => navigate('/register')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}