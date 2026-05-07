import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import * as authApi from './authApi'

export function SignupPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('alice')
  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('Password123')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdUserId, setCreatedUserId] = useState<number | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCreatedUserId(null)
    setBusy(true)
    try {
      const resp = await authApi.signup(userName, email, password)
      setCreatedUserId(resp.user_id)
      // Signup does not return JWT; redirect to login.
      navigate('/login')
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <h1>Signup</h1>
      <p className="muted">
        Creates an account via <code>POST /auth/signup</code>, then redirects to login.
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div className="field">
          <label>Username</label>
          <input value={userName} onChange={(e) => setUserName(e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <div className="error">{error}</div> : null}
        {createdUserId ? <div className="muted">Created user_id={createdUserId}</div> : null}
        <button disabled={busy} type="submit">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </div>
  )
}

