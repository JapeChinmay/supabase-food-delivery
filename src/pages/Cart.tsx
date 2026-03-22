import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../utils/formatCurrency'

type OrderStatus = 'idle' | 'placing' | 'success' | 'error'

export default function Cart() {
  const navigate     = useNavigate()
  const user         = useAuthStore((s) => s.user)
  const items        = useCartStore((s) => s.items)
  const total        = useCartStore((s) => s.total)
  const updateQty    = useCartStore((s) => s.updateQuantity)
  const clearCart    = useCartStore((s) => s.clearCart)
  const restaurantId = useCartStore((s) => s.restaurantId)

  const [status, setStatus]   = useState<OrderStatus>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)

  const subtotal    = total()
  const deliveryFee = subtotal > 500 ? 0 : 40
  const taxes       = Math.round(subtotal * 0.05)
  const grandTotal  = subtotal + deliveryFee + taxes

  
  if (items.length === 0 && status !== 'success') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="text-8xl animate-bounce">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mt-2">Your cart is empty</h2>
        <p className="text-gray-400">Add items from a restaurant to get started</p>
        <button
          onClick={() => navigate('/restaurants')}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-200"
        >
          Browse Restaurants 🍽️
        </button>
      </div>
    )
  }


  if (status === 'success' && orderId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <span className="text-5xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Order placed!</h2>
        <p className="text-gray-500">Your food is being prepared 🍳</p>
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-200"
        >
          Track your order →
        </button>
      </div>
    )
  }


  async function handlePlaceOrder() {
    if (!user || !restaurantId) return
    setStatus('placing')

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id:       user.id,
        restaurant_id: restaurantId,
        items:         items,
        total:         grandTotal,
        status:        'placed',
      })
      .select()
      .single()
    console.log(data);
    if (error) {
      setStatus('error')
      return
    }

    clearCart()
    setOrderId(data.id)
    setStatus('success')
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

     
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 transition">
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>
          <span className="text-sm text-gray-400 font-medium">
            {items.length} item{items.length > 1 ? 's' : ''}
          </span>
        </div>

     
        <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-orange-700 font-medium">
            <span>🚀</span>
            <span>Delivery in 30 mins</span>
          </div>
          {deliveryFee === 0
            ? <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">Free delivery</span>
            : <span className="text-xs text-orange-500 font-medium">+{formatCurrency(deliveryFee)} delivery</span>
          }
        </div>

    
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your items</p>
          </div>
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-4 py-4 ${index !== items.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                <p className="text-orange-500 font-bold text-sm mt-0.5">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2 bg-orange-500 rounded-xl px-2 py-1.5">
                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="text-white font-bold w-6 h-6 flex items-center justify-center hover:opacity-80 active:scale-90">−</button>
                <span className="text-white font-bold text-sm w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="text-white font-bold w-6 h-6 flex items-center justify-center hover:opacity-80 active:scale-90">+</button>
              </div>
              <p className="text-gray-700 font-bold text-sm w-16 text-right">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

     
        <div className="bg-white rounded-2xl shadow-sm px-4 py-4 mb-6">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Bill details</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Item total</span>
              <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery fee</span>
              {deliveryFee === 0
                ? <span className="text-green-600 font-semibold">FREE</span>
                : <span className="font-medium text-gray-800">{formatCurrency(deliveryFee)}</span>
              }
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST (5%)</span>
              <span className="font-medium text-gray-800">{formatCurrency(taxes)}</span>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between font-bold text-gray-900">
              <span>Grand total</span>
              <span className="text-lg">{formatCurrency(grandTotal)}</span>
            </div>
            {deliveryFee === 0 && (
              <p className="text-xs text-green-600 font-medium text-center bg-green-50 py-2 rounded-xl">
                🎉 You saved {formatCurrency(40)} on delivery!
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={status === 'placing'}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
            status === 'placing'
              ? 'bg-green-400 cursor-not-allowed scale-95'
              : 'bg-green-500 hover:bg-green-600 active:scale-95 shadow-green-200'
          }`}
        >
          {status === 'placing' ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-white">Placing your order...</span>
            </>
          ) : (
            <>
              <span className="text-white">Place order</span>
              <span className="bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-xl">
                {formatCurrency(grandTotal)}
              </span>
            </>
          )}
        </button>

        {status === 'error' && (
          <p className="text-center text-red-500 text-sm mt-3 bg-red-50 py-3 rounded-xl">
            Something went wrong. Please try again.
          </p>
        )}

        <button
          onClick={clearCart}
          className="w-full text-center text-gray-400 hover:text-red-400 text-sm mt-4 transition-colors py-2"
        >
          Clear cart
        </button>

      </div>
    </div>
  )  
}    