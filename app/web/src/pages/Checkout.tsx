import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { createOrder, getCatalog, newIdempotencyKey, ApiError } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { saveDeliveryAddress } from '../lib/deliveryAddress'
import { PAYMENT_METHODS, type PaymentMethod } from '../lib/types'
import '../styles/fees.css'

// Brief pause after a successful order so the button's success ripple (see
// fees.css, .success-ripple) actually gets to play before the route
// changes, instead of navigating out from under it.
const SUCCESS_RIPPLE_MS = 420

// Alpha placeholder pricing: a flat delivery fee and a flat percentage
// service fee, invented so the checkout screen has something honest to show
// while the real pricing API is built. Swap these for live per-merchant and
// per-route fees once the API quotes them.
const DELIVERY_FEE_BWP = 15
const SERVICE_FEE_RATE = 0.05
// Below this items subtotal, checkout nudges the customer to add more
// instead of quietly blocking the order button with no explanation.
const MINIMUM_ORDER_BWP = 50

// Avoids floating point drift in the fee display (0.05 * 12.10 landing on
// something like 0.6050000000000001 instead of 0.61).
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100
}

export default function Checkout() {
  const { auth } = useAuth()
  const cart = useCart()
  const navigate = useNavigate()
  const [address, setAddress] = useState('Plot 5419, Village, Gaborone')
  const [payment, setPayment] = useState<PaymentMethod>('orange_money')
  const [placing, setPlacing] = useState(false)
  const [justPlaced, setJustPlaced] = useState(false)
  const [error, setError] = useState('')
  const idemKey = useRef(newIdempotencyKey())
  // Guards against React StrictMode's dev-only double effect invocation,
  // which would otherwise seed the cart twice from a single page load.
  const seededRef = useRef(false)

  // Presentation-only figures for the itemised breakdown. None of this
  // touches what gets posted to the API in placeOrder below.
  const subtotal = cart.total
  const serviceFee = roundToCents(subtotal * SERVICE_FEE_RATE)
  const grandTotal = subtotal + DELIVERY_FEE_BWP + serviceFee
  const belowMinimum = subtotal < MINIMUM_ORDER_BWP
  const amountToMinimum = roundToCents(MINIMUM_ORDER_BWP - subtotal)

  // Order total in the sticky button gets a brief tabular-nums roll whenever
  // the amount changes upstream (quantity edited in the drawer, etc). Keying
  // the span on a tick that only bumps when the total actually changes
  // replays the CSS entrance animation cleanly, no manual class timers.
  const prevTotalRef = useRef(grandTotal)
  const [totalRollTick, setTotalRollTick] = useState(0)
  useEffect(() => {
    if (prevTotalRef.current !== grandTotal) {
      prevTotalRef.current = grandTotal
      setTotalRollTick((n) => n + 1)
    }
  }, [grandTotal])

  // Demo/video capture only: ?seed=m1 pre-adds two items from that merchant
  // when the cart is empty, so /checkout renders fully from a direct URL
  // instead of showing the "cart is empty" state.
  useEffect(() => {
    if (seededRef.current) return
    const params = new URLSearchParams(window.location.search)
    const seedId = params.get('seed')
    if (!seedId || cart.merchant || cart.lines.length > 0) return
    seededRef.current = true
    getCatalog().then((res) => {
      const found = res.merchants.find((m) => m.id === seedId)
      if (!found) return
      found.items.slice(0, 2).forEach((item) => {
        cart.addItem(found, item.id, item.name, item.price_bwp)
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!cart.merchant || cart.lines.length === 0) {
    return (
      <div className="app-shell">
        <AppHeader />
        <div className="empty-state">
          <div className="glyph">🛒</div>
          <p>Your cart is empty. Pick something tasty first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Browse merchants
          </button>
        </div>
      </div>
    )
  }

  const merchantId = cart.merchant.id

  const placeOrder = async () => {
    if (!auth) return
    setPlacing(true)
    setError('')
    try {
      const order = await createOrder(auth.token, idemKey.current, {
        merchant_id: merchantId,
        items: cart.lines.map((l) => ({ item_id: l.item_id, qty: l.qty })),
        payment_method: payment,
        address,
        age_confirmed: cart.ageConfirmed
      })
      // The API never echoes the address back on GET /orders/:id, so the
      // Track page reads it from this cache instead. See lib/deliveryAddress.ts.
      saveDeliveryAddress(order.id, address)
      // Let the button's success ripple actually play (see fees.css,
      // .success-ripple) before the route changes out from under it.
      // `placing` stays true the whole time, on purpose, so the button
      // cannot be double-tapped while this plays out.
      setJustPlaced(true)
      window.setTimeout(() => {
        cart.clear()
        navigate(`/track/${order.id}`, { replace: true })
      }, SUCCESS_RIPPLE_MS)
    } catch (err) {
      if (err instanceof ApiError && err.code === 'AGE_GATE') {
        setError('We need your age confirmed before this order can go through.')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('We could not place your order. Please try again.')
      }
      setPlacing(false)
    }
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <h1 className="page-title" style={{ fontSize: 30 }}>
          Checkout
        </h1>
        <p className="page-sub">{cart.merchant.name}</p>

        <div className="field pulse-enter" style={{ '--pulse-delay': '0ms' } as CSSProperties}>
          <label htmlFor="address">Delivery address</label>
          <textarea
            id="address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="section-label" style={{ margin: '20px 0 12px' }}>
          Pay with
        </div>
        <div className="pay-grid pulse-stagger">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.id}
              type="button"
              className={`pay-chip${payment === pm.id ? ' selected' : ''}`}
              onClick={() => setPayment(pm.id)}
            >
              <div className="pay-name">{pm.label}</div>
              <div className="demo-rail">{pm.rail}</div>
            </button>
          ))}
        </div>

        <div className="card pulse-enter" style={{ '--pulse-delay': '120ms' } as CSSProperties}>
          {cart.lines.map((line) => (
            <div className="summary-line" key={line.item_id}>
              <span>
                {line.qty} × {line.name}
              </span>
              <span className="tabular">P{(line.qty * line.price_bwp).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-line checkout-subtotal-row">
            <span>Items subtotal</span>
            <span className="tabular">P{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line checkout-fee-row">
            <span>Delivery fee</span>
            <span className="tabular">P{DELIVERY_FEE_BWP.toFixed(2)}</span>
          </div>
          <div className="summary-line checkout-fee-row">
            <span>Service fee</span>
            <span className="tabular">P{serviceFee.toFixed(2)}</span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <span className="tabular">P{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {belowMinimum && (
          <div className="checkout-min-order-nudge">
            Add P{amountToMinimum.toFixed(2)} more from {cart.merchant.name}. Their order
            minimum is P{MINIMUM_ORDER_BWP.toFixed(2)}.
          </div>
        )}

        {error && <div className="login-error" style={{ marginTop: 16 }}>{error}</div>}

        <button
          className={`btn btn-primary btn-block place-order-btn${justPlaced ? ' success-ripple' : ''}`}
          style={{ marginTop: 20 }}
          onClick={placeOrder}
          disabled={placing || !address.trim() || belowMinimum}
        >
          {justPlaced ? (
            <>Order placed <span aria-hidden="true">✓</span></>
          ) : placing ? (
            'Placing your order…'
          ) : (
            <>
              Place order ·{' '}
              <span className="tabular checkout-total-roll" key={totalRollTick}>
                P{grandTotal.toFixed(2)}
              </span>
            </>
          )}
        </button>
      </main>
    </div>
  )
}
