import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { HttpError } from '../../core/http'
import { getRecommendations } from './recommendationsApi'

function parseKs(text: string): number[] {
  const parts = text
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => Number(p))
    .filter((n) => Number.isFinite(n) && n > 0)
  return parts.length ? parts : [5]
}

export function RecommendationsPage() {
  const [kInput, setKInput] = useState('3,5')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const ks = useMemo(() => parseKs(kInput), [kInput])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const data = await getRecommendations(ks)
      setResult(data)
    } catch (err: any) {
      if (err instanceof HttpError) setError(`${err.status}: ${err.message}`)
      else setError(err?.message || 'Failed to load recommendations')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <h1>Recommendations</h1>
      <p className="muted">
        Calls <code>GET /recommendations</code> with repeated <code>k</code> query params (e.g.{' '}
        <code>?k=3&amp;k=5</code>).
      </p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div className="field">
          <label>K values (comma-separated)</label>
          <input value={kInput} onChange={(e) => setKInput(e.target.value)} />
        </div>
        {error ? <div className="error">{error}</div> : null}
        <button type="submit" disabled={busy}>
          {busy ? 'Loading…' : 'Get recommendations'}
        </button>
      </form>

      {result ? (
        <div style={{ marginTop: 16 }}>
          <h2>Result</h2>
          <pre style={{ overflowX: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}

