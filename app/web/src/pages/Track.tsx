import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import GaboroneMap from '../components/GaboroneMap'
import StatusTimeline, { HeroCheckpoints, timeLabel } from '../components/StatusTimeline'
import { useCountUpOnce } from '../hooks/useCountUp'
import { getOrder } from '../lib/api'
import { useAuth } from '../lib/auth'
import { loadDeliveryAddress, saveDeliveryAddress } from '../lib/deliveryAddress'
import { getSocket } from '../lib/socket'
import type { Order, OrderStatus, OrderStatusEvent, PaymentMethod } from '../lib/types'
import '../styles/eta.css'

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  orange_money: 'Orange Money',
  myzaka: 'MyZaka',
  smega: 'Smega',
  card: 'Card',
  cash: 'Cash'
}

// A fictional demo number for the "Call rider" link. The order object has
// no phone field for the assigned courier (see lib/types.ts, OrderCourier),
// so this is a stand in, not a real line.
const DEMO_RIDER_TEL = '+26771234567'
const DEMO_RIDER_TEL_LABEL = '+267 71 234 567'

// ---------------------------------------------------------------------
// Hero arrival window
//
// The hero shows a short, honest window ("Arrives 14:28 to 14:35"),
// computed from live order data, never Math.random, so a refresh or a
// re-render never shows a different window for the same order at the same
// moment.
//
// When the simulator has handed the order a rolling eta_min, the window is
// built off that (mirrors the app's existing soft-estimate-plus-buffer
// pattern). When there is no eta yet (order just placed, not dispatched),
// the window falls back to a fixed offset anchored to the order's placed
// timestamp, so it stays the same on every render of that order, it just
// will not track a live countdown until eta_min exists.
const ARRIVAL_WINDOW_SPAN_MIN = 7
const NO_ETA_FALLBACK_LOW_MIN = 8
const NO_ETA_FALLBACK_HIGH_MIN = 15

function orderPlacedAt(order: Order): number {
  const placed = order.timeline.find((t) => t.status === 'placed')?.at
  const at = placed ? new Date(placed).getTime() : NaN
  return Number.isNaN(at) ? Date.now() : at
}

function computeArrivalWindow(order: Order): { low: Date; high: Date } {
  if (order.eta_min != null) {
    const now = Date.now()
    return {
      low: new Date(now + order.eta_min * 60000),
      high: new Date(now + (order.eta_min + ARRIVAL_WINDOW_SPAN_MIN) * 60000)
    }
  }
  const anchor = orderPlacedAt(order)
  return {
    low: new Date(anchor + NO_ETA_FALLBACK_LOW_MIN * 60000),
    high: new Date(anchor + NO_ETA_FALLBACK_HIGH_MIN * 60000)
  }
}

// Minutes-since-midnight in and out, so the arrival window's rolling
// digits (see useCountUpOnce below) can animate through real intermediate
// clock times rather than an abstract 0 to N counter.
function toMinutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

function formatFromMinutes(total: number): string {
  const m = ((Math.round(total) % 1440) + 1440) % 1440
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  const mm = String(m % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// Fixed, deterministic spread for particle bursts. Not Math.random: this
// app never lets a decorative reflow show a different result on a second
// render of the same moment, so the angles are just baked in like any
// other layout constant.
const WAKE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const CELEBRATION_PARTICLES: { angle: number; dist: number; color: 'green' | 'orange'; delay: number }[] = [
  { angle: 10, dist: 90, color: 'green', delay: 0 },
  { angle: 55, dist: 120, color: 'orange', delay: 30 },
  { angle: 95, dist: 80, color: 'green', delay: 10 },
  { angle: 140, dist: 110, color: 'orange', delay: 60 },
  { angle: 180, dist: 95, color: 'green', delay: 20 },
  { angle: 220, dist: 130, color: 'green', delay: 50 },
  { angle: 260, dist: 85, color: 'orange', delay: 15 },
  { angle: 300, dist: 115, color: 'green', delay: 40 },
  { angle: 335, dist: 100, color: 'orange', delay: 5 },
  { angle: 25, dist: 140, color: 'green', delay: 70 },
  { angle: 160, dist: 75, color: 'orange', delay: 35 },
  { angle: 245, dist: 105, color: 'green', delay: 55 }
]

// Rider-assigned wake: a small burst of dots around the rider avatar.
function ParticleWake() {
  return (
    <span className="particle-burst" aria-hidden="true">
      {WAKE_ANGLES.map((angle, i) => (
        <span
          key={angle}
          className="particle-dot"
          style={{ '--angle': `${angle}deg`, animationDelay: `${i * 12}ms` } as CSSProperties}
        />
      ))}
    </span>
  )
}

// Delivered: the big one. Green and orange particles across the hero.
function CelebrationBurst() {
  return (
    <span className="particle-burst" aria-hidden="true">
      {CELEBRATION_PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`celebration-particle ${p.color}`}
          style={
            {
              '--angle': `${p.angle}deg`,
              '--dist': `${p.dist}px`,
              animationDelay: `${p.delay}ms`
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}

// ---------------------------------------------------------------------
// Delivery address: plot line plus a landmark line, split on the first
// comma. "Plot 5419, Village, Gaborone" becomes "Plot 5419" over
// "Village, Gaborone".
function splitAddress(address: string): { plot: string; landmark: string } {
  const parts = address
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length <= 1) return { plot: address, landmark: '' }
  return { plot: parts[0], landmark: parts.slice(1).join(', ') }
}

export default function Track() {
  const { orderId } = useParams<{ orderId: string }>()
  const { auth } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const pollRef = useRef<number | null>(null)

  // Delivery point card state. Seeded once per order (see the effect
  // below), then lives entirely on the page after that, the 2 second poll
  // never overwrites it, since the API has no address field to poll for
  // anyway.
  const [addressText, setAddressText] = useState<string | null>(null)
  const [addressConfirmed, setAddressConfirmed] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [draftAddress, setDraftAddress] = useState('')

  const [mapOpen, setMapOpen] = useState(false)

  const refetch = () => {
    if (!auth || !orderId) return
    getOrder(auth.token, orderId)
      .then(setOrder)
      .catch(() => setError('We lost track of this order. Please refresh.'))
  }

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  useEffect(() => {
    if (!auth || !orderId) return
    const socket = getSocket()
    const onStatus = (evt: OrderStatusEvent) => {
      if (evt.order_id === orderId) refetch()
    }
    socket.on('order_status', onStatus)
    return () => {
      socket.off('order_status', onStatus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, orderId])

  // The courier position on the order object moves as the simulator runs.
  // A short poll keeps the dot gliding smoothly on the map between the
  // instant jumps that arrive over the socket.
  useEffect(() => {
    if (!order || order.status === 'delivered') {
      if (pollRef.current) window.clearInterval(pollRef.current)
      return
    }
    pollRef.current = window.setInterval(refetch, 2000)
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status])

  // Seed the delivery address once per order id: the checkout page cached
  // what the customer actually typed, since the API never echoes it back.
  useEffect(() => {
    if (!order) return
    setAddressText(order.address || loadDeliveryAddress(order.id) || 'Delivery address on file')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id])

  // Status moments: every real status change coming off the socket earns a
  // hit-stop (a 120ms freeze-frame, see the .hitstop class) then releases
  // into a specific celebration for that transition. Purely a reaction to
  // order.status actually changing, never to the 2s poll re-fetching the
  // same status.
  const prevStatusRef = useRef<OrderStatus | null>(null)
  const [hitStop, setHitStop] = useState(false)
  const [celebration, setCelebration] = useState<'assigned' | 'collected' | 'delivered' | null>(null)
  const celebrationTimers = useRef<number[]>([])

  useEffect(() => {
    if (!order) return
    const prev = prevStatusRef.current
    prevStatusRef.current = order.status
    if (!prev || prev === order.status) return

    let kind: 'assigned' | 'collected' | 'delivered' | null = null
    if (order.status === 'dispatch.accepted') kind = 'assigned'
    else if (order.status === 'picked_up') kind = 'collected'
    else if (order.status === 'delivered') kind = 'delivered'
    if (!kind) return

    setHitStop(true)
    const releaseAt = window.setTimeout(() => {
      setHitStop(false)
      setCelebration(kind)
      const clearAt = window.setTimeout(() => setCelebration(null), 1400)
      celebrationTimers.current.push(clearAt)
    }, 120)
    celebrationTimers.current.push(releaseAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status])

  useEffect(
    () => () => {
      celebrationTimers.current.forEach((id) => window.clearTimeout(id))
    },
    []
  )

  // Arrival window rolling digits: two independent count-ups (low bound,
  // high bound), each in minutes-since-midnight so the animation ticks
  // through real intermediate clock times. Called unconditionally, ahead
  // of the loading/error early returns below, since hooks cannot be
  // conditional; the fallback window (order null) just counts to 0 and is
  // never rendered.
  const countUpWindow = order ? computeArrivalWindow(order) : null
  const lowMinutesTarget = countUpWindow ? toMinutesOfDay(countUpWindow.low) : 0
  const highMinutesTarget = countUpWindow ? toMinutesOfDay(countUpWindow.high) : 0
  const lowMinutesDisplay = useCountUpOnce(lowMinutesTarget)
  const highMinutesDisplay = useCountUpOnce(highMinutesTarget)

  if (error) {
    return (
      <div className="app-shell">
        <AppHeader />
        <div className="empty-state">
          <div className="glyph">⚠</div>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!order || addressText == null) {
    return (
      <div className="app-shell">
        <AppHeader />
        <main className="app-main" aria-label="Finding your order" aria-busy="true">
          <div className="skeleton-hero">
            <div className="skeleton skeleton-line wide" style={{ height: 30 }} />
            <div className="skeleton skeleton-line narrow" style={{ height: 12 }} />
          </div>
          <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)', marginBottom: 16 }} />
          <div className="card">
            {[0, 1, 2].map((i) => (
              <div className="skeleton-timeline-row" key={i}>
                <div className="skeleton skeleton-dot" />
                <div className="skeleton skeleton-line" />
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  const total = order.total_bwp ?? 0
  // Only the API's real ledger figure is trustworthy here. No client side
  // guess ever fills in for a missing split, so this stays undefined until
  // the API actually supplies it.
  const split = order.payout_split
  const delivered = order.status === 'delivered'
  // The last status before delivered is picked_up, the courier already has
  // the parcel and is en route, so this is the closest signal the order
  // object gives us for "close or arrived".
  const riderAtGate = order.status === 'picked_up'
  const deliveredAt = order.timeline.find((t) => t.status === 'delivered')?.at
  const { plot, landmark } = splitAddress(addressText)

  const startEditAddress = () => {
    setDraftAddress(addressText)
    setEditingAddress(true)
    setAddressConfirmed(false)
  }

  const saveEditedAddress = () => {
    const next = draftAddress.trim()
    if (!next) return
    setAddressText(next)
    saveDeliveryAddress(order.id, next)
    setEditingAddress(false)
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className={`app-main${hitStop ? ' hitstop' : ''}`}>
        <div className="track-order-code tabular">#{order.id.slice(-6).toUpperCase()}</div>
        <p className="page-sub" style={{ marginBottom: 16 }}>
          {order.merchant_name || 'On its way to you'}
        </p>

        {/* 1. Hero: calm headline plus a big arrival window (or the gate
            banner, or the delivered time). Replaces the old top of page map. */}
        <div className="track-hero">
          <span className="hero-sweep" />
          {celebration === 'delivered' && <CelebrationBurst />}

          <div className="track-hero-headline">{delivered ? 'Delivered' : 'Your order is on the way'}</div>

          {delivered ? (
            <div className={`track-hero-window delivered${celebration === 'delivered' ? ' stamp-in' : ''}`}>
              Delivered at {timeLabel(deliveredAt)}
            </div>
          ) : riderAtGate ? (
            <div className="track-hero-gate-banner">
              <span className="pulse-dot" />
              Your rider is at your gate
            </div>
          ) : (
            <div className="track-hero-window">
              Arrives {formatFromMinutes(lowMinutesDisplay)}
              <span className="to">to</span>
              {formatFromMinutes(highMinutesDisplay)}
            </div>
          )}

          {/* 2. Three plain checkpoints, under the hero. */}
          <HeroCheckpoints status={order.status} burstIndex={celebration === 'collected' ? 1 : null} />
        </div>

        {/* 3. Delivery point card. */}
        <div className="card pulse-enter" style={{ marginBottom: 16, '--pulse-delay': '0ms' } as CSSProperties}>
          <div className="section-label" style={{ marginBottom: 12 }}>
            Delivery point
          </div>

          {editingAddress ? (
            <>
              <div className="field" style={{ marginBottom: 12 }}>
                <textarea
                  rows={2}
                  value={draftAddress}
                  onChange={(e) => setDraftAddress(e.target.value)}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={saveEditedAddress}>
                  Save
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingAddress(false)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="delivery-address">
                <div className="delivery-address-plot">{plot}</div>
                {landmark && <div className="delivery-address-landmark">{landmark}</div>}
              </div>

              <div className="address-confirm-row">
                {addressConfirmed ? (
                  <span className="address-confirmed-tick">
                    <span className="check-draw">✓</span> Confirmed
                  </span>
                ) : (
                  <>
                    <span className="address-confirm-question">Is this the right place?</span>
                    <div className="address-confirm-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => setAddressConfirmed(true)}>
                        Yes
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={startEditAddress}>
                        Fix location
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* 4. Rider card. */}
        <div className="card pulse-enter" style={{ marginBottom: 16, '--pulse-delay': '60ms' } as CSSProperties}>
          <div className="section-label" style={{ marginBottom: 12 }}>
            Your rider
          </div>
          {order.courier ? (
            <div className={`rider-row${celebration === 'assigned' ? ' rider-card-flip-in' : ''}`}>
              <div className="rider-avatar-wrap">
                <div className="courier-avatar rider-avatar">{order.courier.name.charAt(0)}</div>
                {celebration === 'assigned' && <ParticleWake />}
              </div>
              <div className="rider-info">
                <div className="rider-name">{order.courier.name}</div>
                <div className="tabular rider-rating">★ {order.courier.rating.toFixed(1)}</div>
              </div>
              <a className="btn btn-secondary btn-sm" href={`tel:${DEMO_RIDER_TEL}`}>
                Call rider
              </a>
            </div>
          ) : (
            <div className="rider-finding">
              <span className="pulse-dot" />
              Finding your rider
            </div>
          )}
          {order.courier && <div className="rider-tel tabular">{DEMO_RIDER_TEL_LABEL}</div>}
        </div>

        {/* 5. Map, demoted behind a toggle, collapsed by default. */}
        <button
          type="button"
          className="btn btn-ghost btn-block map-toggle-btn pulse-enter"
          style={{ '--pulse-delay': '120ms' } as CSSProperties}
          onClick={() => setMapOpen((o) => !o)}
        >
          {mapOpen ? 'Hide map' : 'See rider on map'}
        </button>
        {mapOpen && (
          <div className="map-frame pulse-enter" style={{ marginTop: 12 }}>
            <GaboroneMap
              couriers={
                order.courier
                  ? [{ id: 'assigned', lat: order.courier.lat, lng: order.courier.lng }]
                  : []
              }
              customerPin={{ lat: -24.672, lng: 25.902 }}
              routeCourierId={order.courier ? 'assigned' : null}
              delivered={delivered}
            />
          </div>
        )}

        <div
          className="card pulse-enter"
          style={{ marginBottom: 16, marginTop: 16, '--pulse-delay': '180ms' } as CSSProperties}
        >
          <div className="section-label" style={{ marginBottom: 14 }}>
            Status
          </div>
          <StatusTimeline status={order.status} timeline={order.timeline} />
        </div>

        <div className="card pulse-enter" style={{ '--pulse-delay': '240ms' } as CSSProperties}>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Payment
          </div>
          <div className="summary-line">
            <span>Paid with</span>
            <span>{PAYMENT_LABEL[order.payment_method]}</span>
          </div>
          <div className="summary-line total">
            <span>Total</span>
            <span className="tabular">P{total.toFixed(2)}</span>
          </div>

          {split && (
            <>
              <div className="section-label" style={{ margin: '18px 0 4px' }}>
                Who gets what after delivery
              </div>
              <div className={`split-rows${delivered ? ' reveal' : ''}`}>
                <div className="split-row">
                  <span className="who">Merchant</span>
                  <span className="amt tabular">P{split.merchant_bwp.toFixed(2)}</span>
                </div>
                <div className="split-row">
                  <span className="who">Courier</span>
                  <span className="amt tabular">P{split.courier_bwp.toFixed(2)}</span>
                </div>
                <div className="split-row">
                  <span className="who">Sprint</span>
                  <span className="amt tabular">P{split.sprint_bwp.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
