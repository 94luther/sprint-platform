import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Merchant } from './types'

export interface CartLine {
  item_id: string
  name: string
  price_bwp: number
  qty: number
}

interface CartState {
  merchant: Merchant | null
  lines: CartLine[]
  ageConfirmed: boolean
}

interface CartContextValue extends CartState {
  addItem: (merchant: Merchant, item_id: string, name: string, price_bwp: number) => void
  removeItem: (item_id: string) => void
  setQty: (item_id: string, qty: number) => void
  clear: () => void
  confirmAge: () => void
  qtyFor: (item_id: string) => number
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const empty: CartState = { merchant: null, lines: [], ageConfirmed: false }

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(empty)

  const addItem = (merchant: Merchant, item_id: string, name: string, price_bwp: number) => {
    setState((prev) => {
      // Switching merchants clears the cart, one order is one merchant.
      const sameMerchant = prev.merchant?.id === merchant.id
      const lines = sameMerchant ? [...prev.lines] : []
      const existing = lines.find((l) => l.item_id === item_id)
      if (existing) {
        existing.qty += 1
      } else {
        lines.push({ item_id, name, price_bwp, qty: 1 })
      }
      return {
        merchant,
        lines,
        ageConfirmed: sameMerchant ? prev.ageConfirmed : false
      }
    })
  }

  const removeItem = (item_id: string) => {
    setState((prev) => ({ ...prev, lines: prev.lines.filter((l) => l.item_id !== item_id) }))
  }

  const setQty = (item_id: string, qty: number) => {
    setState((prev) => {
      if (qty <= 0) return { ...prev, lines: prev.lines.filter((l) => l.item_id !== item_id) }
      return {
        ...prev,
        lines: prev.lines.map((l) => (l.item_id === item_id ? { ...l, qty } : l))
      }
    })
  }

  const clear = () => setState(empty)
  const confirmAge = () => setState((prev) => ({ ...prev, ageConfirmed: true }))

  const value = useMemo<CartContextValue>(() => {
    const total = state.lines.reduce((sum, l) => sum + l.price_bwp * l.qty, 0)
    const count = state.lines.reduce((sum, l) => sum + l.qty, 0)
    return {
      ...state,
      addItem,
      removeItem,
      setQty,
      clear,
      confirmAge,
      qtyFor: (item_id) => state.lines.find((l) => l.item_id === item_id)?.qty ?? 0,
      total,
      count
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside a CartProvider')
  return ctx
}
