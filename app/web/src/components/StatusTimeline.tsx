import { ORDER_STEPS, type OrderStatus, type TimelineEntry } from '../lib/types'

interface StatusTimelineProps {
  status: OrderStatus
  timeline: TimelineEntry[]
}

function timeLabel(at?: string) {
  if (!at) return ''
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return at
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function StatusTimeline({ status, timeline }: StatusTimelineProps) {
  const currentIndex = ORDER_STEPS.findIndex((s) => s.status === status)
  const byStatus = new Map(timeline.map((t) => [t.status, t.at]))

  return (
    <div className="timeline">
      {ORDER_STEPS.map((step, i) => {
        const done = i < currentIndex || (i === currentIndex && status === 'delivered')
        const current = i === currentIndex && status !== 'delivered'
        const at = byStatus.get(step.status)
        return (
          <div className="timeline-step" key={step.status}>
            <div className="timeline-rail">
              <div className={`timeline-dot${done ? ' done' : ''}${current ? ' current' : ''}`}>
                {done ? <span className="check-draw">✓</span> : ''}
              </div>
              {i < ORDER_STEPS.length - 1 && (
                <div className={`timeline-line${done ? ' done' : ''}`} />
              )}
            </div>
            <div className="timeline-body">
              <div className={`label${!done && !current ? ' pending' : ''}`}>{step.label}</div>
              {at && <div className="at tabular">{timeLabel(at)}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
