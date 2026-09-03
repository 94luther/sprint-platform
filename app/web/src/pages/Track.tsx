import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import GaboroneMap from '../components/GaboroneMap'
import StatusTimeline, { HeroCheckpoints, timeLabel } from '../components/StatusTimeline'
import { getOrder } from '../lib/api'
import { useAuth } from '../lib/auth'
import { loadDeliveryAddress, saveDeliveryAddress } from '../lib/deliveryAddress'
import { getSocket } from '../lib/socket'
import type { Order, OrderStatusEvent, PaymentMethod } from '../lib/types'
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

function formatClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
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
  const arrivalWindow = computeArrivalWindow(order)
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
      <main className="app-main">
        <div className="track-order-code tabular">#{order.id.slice(-6).toUpperCase()}</div>
        <p className="page-sub" style={{ marginBottom: 16 }}>
          {order.merchant_name || 'On its way to you'}
        </p>

        {/* 1. Hero: calm headline plus a big arrival window (or the gate
            banner, or the delivered time). Replaces the old top of page map. */}
        <div className="track-hero">
          <div className="track-hero-headline">{delivered ? 'Delivered' : 'Your order is on the way'}</div>

          {delivered ? (
            <div className="track-hero-window delivered">Delivered at {timeLabel(deliveredAt)}</div>
          ) : riderAtGate ? (
            <div className="track-hero-gate-banner">
              <span className="pulse-dot" />
              Your rider is at your gate
            </div>
          ) : (
            <div className="track-hero-window">
              Arrives {formatClock(arrivalWindow.low)}
              <span className="to">to</span>
              {formatClock(arrivalWindow.high)}
            </div>
          )}

          {/* 2. Three plain checkpoints, under the hero. */}
          <HeroCheckpoints status={order.status} />
        </div>

        {/* 3. Delivery point card. */}
        <div className="card" style={{ marginBottom: 16 }}>
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
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>
            Your rider
          </div>
          {order.courier ? (
            <div className="rider-row">
              <div className="courier-avatar rider-avatar">{order.courier.name.charAt(0)}</div>
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
          className="btn btn-ghost btn-block map-toggle-btn"
          onClick={() => setMapOpen((o) => !o)}
        >
          {mapOpen ? 'Hide map' : 'See rider on map'}
        </button>
        {mapOpen && (
          <div className="map-frame" style={{ marginTop: 12 }}>
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

        <div className="card" style={{ marginBottom: 16, marginTop: 16 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>
            Status
          </div>
          <StatusTimeline status={order.status} timeline={order.timeline} />
        </div>

        <div className="card">
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
