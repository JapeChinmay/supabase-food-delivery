import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import Navbar from "./components/layout/Navbar"
import { Route, Routes } from 'react-router-dom'
import Home from "./pages/Home"
import RestaurantList from './pages/RestaurantList'
import Login from './pages/Login'
import Register from './pages/Register'
import RestaurantDetail from './pages/RestaurantDetail'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Cart from './pages/Cart'
import OrderTracking from './pages/OrderTracking'


export default function App() {
  useEffect(() => {
    async function test() {
      const { data, error } = await supabase.from('restaurants').select('*')
      console.log('data:', data)
      console.log('error:', error)
    }
    test()
  }, [])

  return <div className="min-h-screen bg-gray-50">
    <Navbar />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path="/restaurants" element={<RestaurantList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/restaurants/:id" element={<RestaurantDetail />} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderTracking/></ProtectedRoute>}/>

    </Routes>

  </div>


}