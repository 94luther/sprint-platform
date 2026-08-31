import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { getCatalog } from '../lib/api'
import type { Merchant, MerchantType } from '../lib/types'
import '../styles/discovery.css'

const TYPE_LABEL: Record<string, string> = {
  food: 'Food',
  grocery: 'Grocery',
  vape: 'Vape'
}

// Fixed sequence for the chips once we know which types are actually in the
// catalog. The set of chips itself still comes from the data below, this
// just keeps their order stable instead of following insertion order.
const CATEGORY_ORDER: MerchantType[] = ['food', 'grocery', 'vape']

type CategoryFilter = 'all' | MerchantType

export default function CustomerHome() {
  const [merchants, setMerchants] = useState<Merchant[] | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<CategoryFilter>('all')

  useEffect(() => {
    getCatalog()
      .then((res) => setMerchants(res.merchants))
      .catch(() => setError('We could not load the merchants just now. Please refresh.'))
  }, [])

  // Only offer a chip for a category that actually has a merchant in it
  // today, so the row never promises a type the catalog cannot deliver.
  const categories = useMemo(() => {
    if (!merchants) return []
    const present = new Set(merchants.map((m) => m.type))
    return CATEGORY_ORDER.filter((type) => present.has(type))
  }, [merchants])

  const filteredMerchants = useMemo(() => {
    if (!merchants) return null
    const q = query.trim().toLowerCase()
    return merchants.filter((m) => {
      if (activeType !== 'all' && m.type !== activeType) return false
      if (!q) return true
      if (m.name.toLowerCase().includes(q)) return true
      return m.items.some((item) => item.name.toLowerCase().includes(q))
    })
  }, [merchants, query, activeType])

  const clearFilters = () => {
    setQuery('')
    setActiveType('all')
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        <h1 className="page-title">Order in Gaborone</h1>
        <p className="page-sub">Pick a merchant and we will have it moving in minutes.</p>

        {error && <div className="login-error">{error}</div>}

        {!merchants && !error && (
          <div className="merchant-grid" aria-label="Loading merchants" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div className="skeleton-merchant-card" key={i}>
                <div className="skeleton skeleton-top" />
                <div className="skeleton-body">
                  <div className="skeleton skeleton-line wide" />
                  <div className="skeleton skeleton-line narrow" />
                </div>
              </div>
            ))}
          </div>
        )}

        {merchants && (
          <div className="discovery-bar">
            <div className="discovery-search">
              <label htmlFor="merchant-search" className="sr-only">
                Search merchants and items
              </label>
              <input
                id="merchant-search"
                type="search"
                className="discovery-search-input"
                placeholder="Search a shop or an item, like seswaa or airtime"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="discovery-chips" role="group" aria-label="Filter by category">
              <button
                type="button"
                className={`discovery-chip${activeType === 'all' ? ' active' : ''}`}
                aria-pressed={activeType === 'all'}
                onClick={() => setActiveType('all')}
              >
                All
              </button>
              {categories.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`discovery-chip${activeType === type ? ' active' : ''}`}
                  aria-pressed={activeType === type}
                  onClick={() => setActiveType(type)}
                >
                  {TYPE_LABEL[type]}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredMerchants && filteredMerchants.length === 0 && (
          <div className="empty-state">
            <div className="glyph">🔍</div>
            <p>Nothing matches yet. Try a different search or clear the filters.</p>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {filteredMerchants && filteredMerchants.length > 0 && (
          <div className="merchant-grid">
            {filteredMerchants.map((m) => (
              <Link to={`/merchant/${m.id}`} className="merchant-card" key={m.id}>
                <div className={`merchant-card-top ${m.type}`}>
                  <span className={`badge badge-${m.type}`}>{TYPE_LABEL[m.type]}</span>
                </div>
                <div className="merchant-card-body">
                  <div className="merchant-name">{m.name}</div>
                  <div className="merchant-meta">
                    <span>{m.items.length} items</span>
                    {m.age_restricted && (
                      <span className="badge badge-age" style={{ marginLeft: 8 }}>
                        18+
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
