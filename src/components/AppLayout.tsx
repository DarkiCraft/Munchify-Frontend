import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthProvider'

export function AppLayout() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="appShell">
      <aside className="sidebar">
        <h2>Munchify</h2>
        <div className="muted" style={{ marginBottom: 12 }}>
          Backend: <code>{import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'}</code>
        </div>
        <nav className="nav">
          <NavLink to="/recommendations">Recommendations</NavLink>
          <NavLink to="/activity">Activity</NavLink>
          <NavLink to="/login">Login</NavLink>
        </nav>
        <div style={{ marginTop: 14 }}>
          <button
            disabled={!token}
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

