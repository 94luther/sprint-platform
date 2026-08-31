import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import GaboroneMap from '../components/GaboroneMap'
import StatusTimeline from '../components/StatusTimeline'
import { getOrder } from '../lib/api'
import { useAuth } from '../lib/auth'
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

// Warm, short, status-tied headline in place of the raw order id fragment.
// The order code moves to a small mono sub-line instead.
function headlineForStatus(order: Order): string {
  if (order.status === 'delivered') return 'DELIVERED'
  if (order.status === 'picked_up' || (order.eta_min != null && order.eta_min <= 8)) return 'ALMOST THERE'
  return 'YOUR ORDER IS MOVING'
}

// Client only proxy for a stops away line. The simulator gives eta_min and
// courier lat/lng but not a real multi stop route, so this is an honest
// estimate label, not a claim of real waypoint data.
const STOP_MINUTES = 2.5

function stopsAwayText(etaMin?: number): string {
  if (etaMin == null || etaMin >= 10) return 'On the way'
  const stops = Math.max(1, Math.round(etaMin / STOP_MINUTES))
  return `${stops} ${stops === 1 ? 'stop' : 'stops'} away`
}

function etaPillParts(order: Order): { num: string; note: string } | null {
  if (order.eta_min == null) return null
  if (order.courier) return { num: `${order.eta_min}`, note: 'min · courier en route' }
  return { num: `${order.eta_min}`, note: 'min · estimate' }
}

// Amazon and Uber Eats pair the soft rolling ETA with a separate hard
// promise. Padding on top of eta_min, never subtracting from it, is what
// keeps the deadline always later than the pill above it, never contradicting it.
const DEADLINE_SAFETY_BUFFER_MIN = 8

function arriveByTime(etaMin: number): string {
  const deadline = new Date(Date.now() + (etaMin + DEADLINE_SAFETY_BUFFER_MIN) * 60000)
  const hh = String(deadline.getHours()).padStart(2, '0')
  const mm = String(deadline.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function courierStatusWord(order: Order): string {
  if (order.status === 'dispatch.accepted') return 'heading to pickup'
  if (order.status === 'picked_up') {
    return (order.eta_min ?? 99) <= 5 ? 'nearby' : 'picked up your order'
  }
  if (order.status === 'delivered') return 'delivered'
  return 'on the way'
}

// The six ORDER_STEPS collapse into a four to five stage horizontal bar for
// the endowed progress summary at the top of the page. The detailed
// vertical StatusTimeline lower down keeps the full six step breakdown with
// timestamps.
const STAGE_DEFS: { label: string; match: OrderStatus[] }[] = [
  { label: 'Confirmed', match: ['placed', 'paid'] },
  { label: 'Finding courier', match: ['dispatch.offered'] },
  { label: 'Assigned', match: ['dispatch.accepted'] },
  { label: 'Picked up', match: ['picked_up'] },
  { label: 'Delivered', match: ['delivered'] }
]

function stageIndexForStatus(status: OrderStatus): number {
  const i = STAGE_DEFS.findIndex((s) => s.match.includes(status))
  return i === -1 ? 0 : i
}

export default function Track() {
  const { orderId } = useParams<{ orderId: string }>()
  const { auth } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const pollRef = useRef<number | null>(null)

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

  if (!order) {
    return (
      <div className="app-shell">
        <AppHeader />
        <main className="app-main" aria-label="Finding your order" aria-busy="true">
          <div className="skeleton-hero">
            <div className="skeleton skeleton-line wide" style={{ height: 30 }} />
            <div className="skeleton skeleton-line narrow" style={{ height: 12 }} />
          </div>
          <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)', marginBottom: 16 }} />
          <div className="map-frame">
            <div className="skeleton skeleton-map" />
          </div>
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
  const currentStage = stageIndexForStatus(order.status)
  const eta = etaPillParts(order)

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <h1 className="page-title track-headline">{headlineForStatus(order)}</h1>
        <div className="track-order-code tabular">#{order.id.slice(-6).toUpperCase()}</div>
        <p className="page-sub">{order.merchant_name || 'On its way to you'}</p>

        <div className="eta-banner">
          <div className="stage-bar">
            {STAGE_DEFS.map((s, i) => (
              <div
                className={`stage-seg${i <= currentStage ? ' filled' : ''}${i === currentStage && !delivered ? ' current' : ''}`}
                key={s.label}
              >
                <div className="stage-track">
                  <div className="stage-fill-bar" />
                </div>
                <span className="stage-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="eta-row">
            <div>
              <div className="stops-away">{delivered ? 'Delivered' : stopsAwayText(order.eta_min)}</div>
              {eta && !delivered && (
                <div className="eta-pill" style={{ marginTop: 8 }}>
                  <span className="eta-pill-num tabular">{eta.num}</span>
                  <span className="eta-pill-note">{eta.note}</span>
                </div>
              )}
              {!delivered && order.eta_min != null && (
                <div className="arrive-by-line tabular">
                  Arrives by {arriveByTime(order.eta_min)} or we call you
                </div>
              )}
              {delivered && (
                <div className="arrive-by-line arrive-by-delivered">Delivered. Enjoy your order.</div>
              )}
            </div>
            {order.courier && (
              <div className="courier-mini">
                <div className="courier-avatar">{order.courier.name.charAt(0)}</div>
                <div className="courier-mini-info">
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{order.courier.name}</div>
                  <div className="tabular" style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    ★ {order.courier.rating.toFixed(1)}
                  </div>
                  <div className="courier-status-word">{courierStatusWord(order)}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="map-frame">
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

        <div className="card" style={{ marginBottom: 16 }}>
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
