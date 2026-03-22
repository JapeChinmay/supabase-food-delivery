import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../utils/formatCurrency'
import type { Order, CartItem } from '../types'


const STATUS_CONFIG = {
  placed: {
  
    pageBg:      'bg-blue-50',
    // hero gradient
    heroBg:      'from-blue-600 via-blue-500 to-indigo-500',
    heroText:    'text-blue-50',
    // stepper fill
    stepFill:    'bg-blue-500',
    stepBorder:  'border-blue-500',
    stepText:    'text-blue-600',
    // card
    cardBg:      'bg-white border-blue-100',
    // accent button
    accent:      'bg-blue-500 hover:bg-blue-600',
    // status pill
    pillBg:      'bg-blue-100',
    pillText:    'text-blue-700',
    // content
    emoji:       '📋',
    label:       'Order placed',
    message:     'Your order has been received!',
    sub:         'Waiting for the restaurant to confirm your order',
    timeLeft:    'Estimating time...',
    pulse:       true,
    // decorative bg emoji
    bgEmoji:     '📋',
  },
  confirmed: {
    pageBg:      'bg-orange-50',
    heroBg:      'from-orange-600 via-orange-500 to-amber-500',
    heroText:    'text-orange-50',
    stepFill:    'bg-orange-500',
    stepBorder:  'border-orange-500',
    stepText:    'text-orange-600',
    cardBg:      'bg-white border-orange-100',
    accent:      'bg-orange-500 hover:bg-orange-600',
    pillBg:      'bg-orange-100',
    pillText:    'text-orange-700',
    emoji:       '✅',
    label:       'Confirmed',
    message:     'Restaurant confirmed your order!',
    sub:         'They have accepted and are getting ready to cook',
    timeLeft:    '25–30 mins away',
    pulse:       false,
    bgEmoji:     '🍳',
  },
  preparing: {
    pageBg:      'bg-yellow-50',
    heroBg:      'from-yellow-600 via-amber-500 to-orange-400',
    heroText:    'text-yellow-50',
    stepFill:    'bg-yellow-500',
    stepBorder:  'border-yellow-500',
    stepText:    'text-yellow-700',
    cardBg:      'bg-white border-yellow-100',
    accent:      'bg-yellow-500 hover:bg-yellow-600',
    pillBg:      'bg-yellow-100',
    pillText:    'text-yellow-700',
    emoji:       '👨‍🍳',
    label:       'Preparing',
    message:     'Your food is being cooked!',
    sub:         'The chef is working on your order right now',
    timeLeft:    '15–20 mins away',
    pulse:       true,
    bgEmoji:     '🔥',
  },
  out_for_delivery: {
    pageBg:      'bg-purple-50',
    heroBg:      'from-purple-700 via-purple-600 to-violet-500',
    heroText:    'text-purple-50',
    stepFill:    'bg-purple-600',
    stepBorder:  'border-purple-600',
    stepText:    'text-purple-700',
    cardBg:      'bg-white border-purple-100',
    accent:      'bg-purple-600 hover:bg-purple-700',
    pillBg:      'bg-purple-100',
    pillText:    'text-purple-700',
    emoji:       '🛵',
    label:       'Out for delivery',
    message:     'Rider is on the way!',
    sub:         'Your food is speeding towards you',
    timeLeft:    '5–10 mins away',
    pulse:       true,
    bgEmoji:     '🛵',
  },
  delivered: {
    pageBg:      'bg-green-50',
    heroBg:      'from-green-600 via-emerald-500 to-teal-500',
    heroText:    'text-green-50',
    stepFill:    'bg-green-500',
    stepBorder:  'border-green-500',
    stepText:    'text-green-700',
    cardBg:      'bg-white border-green-100',
    accent:      'bg-green-500 hover:bg-green-600',
    pillBg:      'bg-green-100',
    pillText:    'text-green-700',
    emoji:       '🎉',
    label:       'Delivered!',
    message:     'Enjoy your meal!',
    sub:         'Your order has been delivered. Bon appétit!',
    timeLeft:    '',
    pulse:       false,
    bgEmoji:     '🎉',
  },
} as const

type StatusKey = keyof typeof STATUS_CONFIG


const STEPS: { key: StatusKey; label: string; emoji: string }[] = [
  { key: 'placed',            label: 'Placed',    emoji: '📋' },
  { key: 'confirmed',         label: 'Confirmed', emoji: '✅' },
  { key: 'preparing',         label: 'Cooking',   emoji: '👨‍🍳' },
  { key: 'out_for_delivery',  label: 'On way',    emoji: '🛵' },
  { key: 'delivered',         label: 'Delivered', emoji: '🎉' },
]


async function getWeather(): Promise<{ temp: number; desc: string; icon: string } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lon } = pos.coords
          const res  = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`
          )
          const data = await res.json()
          const temp = Math.round(data.current.temperature_2m)
          const code = data.current.weathercode

          const weatherMap = (c: number) => {
            if (c === 0)           return { icon: '☀️',  desc: 'Clear skies' }
            if (c <= 3)            return { icon: '⛅',  desc: 'Partly cloudy' }
            if (c <= 48)           return { icon: '🌫️',  desc: 'Foggy' }
            if (c <= 67)           return { icon: '🌧️',  desc: 'Rainy' }
            if (c <= 77)           return { icon: '❄️',  desc: 'Snowy' }
            if (c <= 82)           return { icon: '🌦️',  desc: 'Showers' }
            return                        { icon: '⛈️',  desc: 'Stormy' }
          }

          resolve({ temp, ...weatherMap(code) })
        } catch {
          resolve(null)
        }
      },
      () => resolve(null)  
    )
  })
}
export default function OrderTracking() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [order,   setOrder]   = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState<{ temp: number; desc: string; icon: string } | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()
      if (!error) setOrder(data)
      setLoading(false)
    }
    fetchOrder()
 
    getWeather().then(setWeather)
  }, [id])


useEffect(() => {
  if (!id) return

  const channel = supabase
    .channel(`order-${id}`)
     .on(
  'postgres_changes',
  {
    event:  'UPDATE',
    schema: 'public',
    table:  'orders',
  },
  (payload) => {
    console.log(' realtime fired!', payload)       
    console.log(' payload.new:', payload.new)      
    console.log(' current id:', id)                 
    if (payload.new && (payload.new as Order).id === id) {
      console.log(' match! updating order...')      
      setOrder(payload.new as Order)
    } else {
      console.log(' no match', payload.new)         
    }
  }
)
   .subscribe((status, err) => {
      console.log('📡 subscription status:', status)
      if (err) console.log('❌ error:', err)
    })

  return () => { supabase.removeChannel(channel) }
}, [id])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading your order...</p>
      </div>
    </div>
  )

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-gray-500">Order not found</p>
      <button onClick={() => navigate('/')} className="text-orange-500 mt-4 font-medium block mx-auto">
        Go home
      </button>
    </div>
  )

  const statusKey = (order.status in STATUS_CONFIG ? order.status : 'placed') as StatusKey
  const cfg       = STATUS_CONFIG[statusKey]
  const stepIdx   = STEPS.findIndex((s) => s.key === statusKey)
  const items     = order.items as CartItem[]


  const weatherMsg = weather
    ? statusKey === 'out_for_delivery'
      ? weather.desc === 'Rainy' || weather.desc === 'Stormy'
        ? `🌧️ Heads up — it's ${weather.desc.toLowerCase()} outside (${weather.temp}°C). Your rider is still on the way!`
        : `${weather.icon} ${weather.temp}°C outside — your rider is on the way!`
      : statusKey === 'delivered'
        ? `${weather.icon} ${weather.temp}°C — perfect weather to enjoy your meal!`
        : null
    : null

  return (
   
    <div className={`min-h-screen transition-colors duration-700 ${cfg.pageBg}`}>

      <div className={`relative bg-gradient-to-br ${cfg.heroBg} overflow-hidden`}>

  
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none opacity-10 text-3xl"
            style={{
              left:      `${(i * 19) % 100}%`,
              top:       `${(i * 23) % 100}%`,
              transform: `rotate(${i * 30}deg)`,
            }}
          >
            {cfg.bgEmoji}
          </span>
        ))}

        {cfg.pulse && (
          <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-white/20 animate-ping" />
        )}

      
        <button
          onClick={() => navigate('/')}
          className={`absolute top-4 left-4 z-10 ${cfg.heroText} bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl text-sm font-medium`}
        >
          ← Home
        </button>

        <div className="relative z-10 max-w-2xl mx-auto px-4 pt-16 pb-10 text-center">
       
          <div className="relative inline-flex items-center justify-center mb-4">
            <span className={`text-7xl ${cfg.pulse ? 'animate-bounce' : ''}`}>
              {cfg.emoji}
            </span>
            {cfg.pulse && (
              <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            )}
          </div>

          <h1 className={`text-3xl font-extrabold ${cfg.heroText} mb-2`}>
            {cfg.message}
          </h1>
          <p className={`${cfg.heroText} opacity-80 text-sm mb-4`}>{cfg.sub}</p>

        
          {cfg.timeLeft && (
            <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm">🕐</span>
              <span className={`text-sm font-bold ${cfg.heroText}`}>{cfg.timeLeft}</span>
            </div>
          )}

     
          <p className={`${cfg.heroText} opacity-50 text-xs mt-4 font-mono`}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

     
        {weatherMsg && (
          <div className={`${cfg.pillBg} border rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-500`}>
            <span className="text-2xl">{weather?.icon}</span>
            <p className={`text-sm font-medium ${cfg.pillText}`}>{weatherMsg}</p>
          </div>
        )}

  
        <div className="bg-white rounded-2xl shadow-sm px-6 py-6">
          <div className="relative">
       
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
      
            <div
              className={`absolute top-5 left-5 h-0.5 ${cfg.stepFill} transition-all duration-700`}
              style={{ width: `${(stepIdx / (STEPS.length - 1)) * (100 - 8)}%` }}
            />

            <div className="relative flex justify-between">
              {STEPS.map((step, i) => {
                const done   = i < stepIdx
                const active = i === stepIdx
               

                return (
                  <div key={step.key} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all duration-500 ${
                      done
                        ? `${cfg.stepFill} border-transparent text-white shadow-md`
                        : active
                          ? `bg-white ${cfg.stepBorder} ${cfg.pulse ? 'animate-pulse' : ''} shadow-lg`
                          : 'bg-gray-100 border-gray-200 text-gray-300'
                    }`}>
                      {done ? '✓' : step.emoji}
                    </div>
                    <span className={`text-xs font-semibold text-center leading-tight max-w-[56px] transition-colors duration-500 ${
                      active  ? cfg.stepText    :
                      done    ? 'text-gray-600' :
                                'text-gray-300'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

  
        <div className={`border rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-500 ${cfg.cardBg}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cfg.emoji}</span>
            <div>
              <p className={`font-bold text-sm ${cfg.pillText}`}>{cfg.label}</p>
              <p className="text-xs text-gray-400">{cfg.sub}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 ${cfg.pillBg} px-3 py-1.5 rounded-full`}>
            <span className={`w-2 h-2 rounded-full ${cfg.stepFill} ${cfg.pulse ? 'animate-pulse' : ''}`} />
            <span className={`text-xs font-bold ${cfg.pillText}`}>Live</span>
          </div>
        </div>

    
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Your order
            </p>
            <p className="text-xs text-gray-400">
              {new Date(order.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium', timeStyle: 'short'
              })}
            </p>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">x{item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-700 flex-shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}

          <div className={`px-4 py-3 flex justify-between items-center ${cfg.pillBg}`}>
            <span className="font-bold text-gray-900">Total paid</span>
            <span className={`font-bold text-lg ${cfg.pillText}`}>
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        {statusKey === 'delivered' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-green-100">
            <div className="flex justify-center gap-2 text-4xl mb-3">
              🎉 😋 🍽️
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              Hope you loved it!
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Rate your experience and help others discover great food
            </p>
       
            <div className="flex justify-center gap-2 mb-4">
              {[1,2,3,4,5].map((star) => (
                <button key={star} className="text-3xl hover:scale-125 transition-transform">
                  ⭐
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/restaurants')}
              className={`${cfg.accent} text-white font-semibold px-6 py-3 rounded-2xl transition-all active:scale-95 w-full`}
            >
              Order again 🍽️
            </button>
          </div>
        )}

     
        <div className="flex items-center justify-center gap-2 py-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live updates enabled</span>
        </div>

      </div>
    </div>
  )
}