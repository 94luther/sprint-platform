import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useAuth, homeForRole } from '../lib/auth'

export default function AppHeader() {
  const { auth, signOut } = useAuth()

  return (
    <header className="app-header">
      <Link to={auth ? homeForRole(auth.role) : '/login'} className="brand-mark">
        <span className="dot" />
        Sprint
      </Link>
      <div className="header-actions">
        {auth && (
          <span className="user-chip">
            <span className="user-chip-name" title={auth.name}>
              {auth.name}
            </span>
            <span className="user-chip-role" style={{ color: 'var(--text-faint)' }}>
              · {auth.role}
            </span>
          </span>
        )}
        <ThemeToggle />
        {auth && (
          <button className="icon-btn" onClick={signOut} title="Sign out" aria-label="Sign out">
            ⏻
          </button>
        )}
      </div>
    </header>
  )
}
