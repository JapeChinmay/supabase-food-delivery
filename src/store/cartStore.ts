import { create } from 'zustand'
import type { CartItem, MenuItem } from '../types'

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  addItem: (item: MenuItem, restaurantId: string) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,

  addItem: (item, restaurantId) => {
    const { items, restaurantId: currentRestaurantId } = get()

    // if adding from a different restaurant, clear cart first
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      if (!confirm('Your cart has items from another restaurant. Clear cart and add this item?')) return
      set({ items: [], restaurantId: null })
    }

    const existing = items.find((i) => i.id === item.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({
        items: [...items, { ...item, quantity: 1 }],
        restaurantId,
      })
    }
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }))
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId)
      return
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    }))
  },

  clearCart: () => set({ items: [], restaurantId: null }),

  total: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
}))