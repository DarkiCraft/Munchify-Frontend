import { useEffect, useMemo, useState } from 'react'
import { HttpError } from '../../core/http'
import { clickItem, orderItem, rateOrder } from '../activity/activityApi'
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
  const [kInput, setKInput] = useState('5')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [itemIds, setItemIds] = useState<number[]>([])
  const [clicked, setClicked] = useState<Record<number, boolean>>({})
  const [orderedByItem, setOrderedByItem] = useState<Record<number, number>>({})
  const [ratingByOrder, setRatingByOrder] = useState<Record<number, number>>({})
  const [status, setStatus] = useState<string | null>(null)

  const ks = useMemo(() => parseKs(kInput), [kInput])

  function extractItemIds(data: any): number[] {
    if (!data) return []
    if (Array.isArray(data.recommendations)) return data.recommendations
    const map = data.recommendations_by_k as Record<string, number[]> | undefined
    if (map && typeof map === 'object') {
      const maxK = Math.max(...Object.keys(map).map((k) => Number(k)).filter((n) => Number.isFinite(n)))
      if (Number.isFinite(maxK) && map[String(maxK)]) return map[String(maxK)]
      const first = Object.values(map)[0]
      return Array.isArray(first) ? first : []
    }
    return []
  }

  async function load() {
    setBusy(true)
    setError(null)
    setStatus(null)
    try {
      // Use the largest requested k for display.
      const displayKs = ks.length ? [Math.max(...ks)] : [5]
      const data = await getRecommendations(displayKs)
      setItemIds(extractItemIds(data))
    } catch (err: any) {
      if (err instanceof HttpError) setError(`${err.status}: ${err.message}`)
      else setError(err?.message || 'Failed to load recommendations')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="card">
      <h1>Recommended items</h1>
      <p className="muted">
        This page auto-calls <code>GET /recommendations</code> after login and renders the returned
        <code> item_id</code>s. Clicking an item implicitly sends <code>POST /activity/click</code>.
      </p>

      <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <div className="row">
          <div className="field">
            <label>How many to fetch (k)</label>
            <input value={kInput} onChange={(e) => setKInput(e.target.value)} />
          </div>
          <div className="field" style={{ alignContent: 'end' }}>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void load()
              }}
            >
              {busy ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>
        {error ? <div className="error">{error}</div> : null}
        {status ? <div className="muted">{status}</div> : null}
      </div>

      <div style={{ marginTop: 16 }}>
        <h2>Items</h2>
        <p className="muted">
          Backend does not currently expose an items lookup endpoint, so the UI shows the{' '}
          <code>item_id</code> and uses it for click/order/rate.
        </p>

        {busy ? (
          <div className="muted">Loading…</div>
        ) : itemIds.length === 0 ? (
          <div className="muted">No recommendations yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {itemIds.map((id) => {
              const orderId = orderedByItem[id]
              const rating = orderId ? ratingByOrder[orderId] ?? 5 : 5
              return (
                <div
                  key={id}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 14,
                    display: 'grid',
                    gap: 10,
                    background: 'var(--bg)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      void (async () => {
                        try {
                          setStatus(null)
                          await clickItem(id)
                          setClicked((c) => ({ ...c, [id]: true }))
                          setStatus(`Clicked item_id=${id}`)
                        } catch (err: any) {
                          setError(err?.message || 'Click failed')
                        }
                      })()
                    }}
                    style={{
                      textAlign: 'left',
                      border: '1px solid var(--border)',
                      background: clicked[id] ? 'var(--accent-bg)' : 'var(--bg)',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>Item #{id}</div>
                    <div className="muted">Cuisine / name not available from API</div>
                  </button>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        void (async () => {
                          try {
                            setStatus(null)
                            const order = await orderItem(id)
                            setOrderedByItem((m) => ({ ...m, [id]: order.order_id }))
                            setStatus(`Ordered item_id=${id} -> order_id=${order.order_id}`)
                          } catch (err: any) {
                            setError(err?.message || 'Order failed')
                          }
                        })()
                      }}
                    >
                      Order
                    </button>
                    {orderId ? (
                      <>
                        <span className="muted">
                          order_id=<code>{orderId}</code>
                        </span>
                        <label className="muted">
                          Rating:{' '}
                          <input
                            style={{ width: 80 }}
                            value={String(rating)}
                            onChange={(e) => {
                              const val = Number(e.target.value)
                              setRatingByOrder((r) => ({ ...r, [orderId]: val }))
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            void (async () => {
                              try {
                                setStatus(null)
                                await rateOrder(orderId, Number(rating))
                                setStatus(`Rated order_id=${orderId} rating=${rating}`)
                              } catch (err: any) {
                                setError(err?.message || 'Rate failed')
                              }
                            })()
                          }}
                        >
                          Rate
                        </button>
                      </>
                    ) : (
                      <span className="muted">Order to enable rating</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

