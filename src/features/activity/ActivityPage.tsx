import { useState } from 'react'
import type { FormEvent } from 'react'
import { HttpError } from '../../core/http'
import { clickItem, orderItem, rateOrder } from './activityApi'

export function ActivityPage() {
  const [itemId, setItemId] = useState('1')
  const [orderId, setOrderId] = useState('')
  const [rating, setRating] = useState('5')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<string[]>([])

  function push(msg: string) {
    setLog((l) => [msg, ...l].slice(0, 10))
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (err: any) {
      if (err instanceof HttpError) setError(`${err.status}: ${err.message}`)
      else setError(err?.message || 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  const item_id = Number(itemId)

  return (
    <div className="card">
      <h1>Activity</h1>
      <p className="muted">
        Sends user activity to <code>/activity/click</code>, <code>/activity/order</code>, and{' '}
        <code>/activity/rate</code>.
      </p>

      <div className="row" style={{ marginTop: 16 }}>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            run(async () => {
              await clickItem(item_id)
              push(`Clicked item_id=${item_id}`)
            })
          }}
          style={{ display: 'grid', gap: 12 }}
        >
          <h2>Click</h2>
          <div className="field">
            <label>Item ID</label>
            <input value={itemId} onChange={(e) => setItemId(e.target.value)} />
          </div>
          <button disabled={busy || !Number.isFinite(item_id)} type="submit">
            Click item
          </button>
        </form>

        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            run(async () => {
              const order = await orderItem(item_id)
              setOrderId(String(order.order_id))
              push(`Ordered item_id=${item_id} -> order_id=${order.order_id}`)
            })
          }}
          style={{ display: 'grid', gap: 12 }}
        >
          <h2>Order</h2>
          <div className="field">
            <label>Item ID</label>
            <input value={itemId} onChange={(e) => setItemId(e.target.value)} />
          </div>
          <button disabled={busy || !Number.isFinite(item_id)} type="submit">
            Place order
          </button>
        </form>
      </div>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          run(async () => {
            const oid = Number(orderId)
            const r = Number(rating)
            await rateOrder(oid, r)
            push(`Rated order_id=${oid} rating=${r}`)
          })
        }}
        style={{ marginTop: 16, display: 'grid', gap: 12 }}
      >
        <h2>Rate</h2>
        <div className="row">
          <div className="field">
            <label>Order ID</label>
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
          <div className="field">
            <label>Rating</label>
            <input value={rating} onChange={(e) => setRating(e.target.value)} />
          </div>
        </div>
        {error ? <div className="error">{error}</div> : null}
        <button disabled={busy || !orderId} type="submit">
          Submit rating
        </button>
      </form>

      <div style={{ marginTop: 16 }}>
        <h2>Recent</h2>
        <div className="muted">
          {log.length ? (
            <ul>
              {log.map((l, idx) => (
                <li key={idx}>{l}</li>
              ))}
            </ul>
          ) : (
            'No actions yet.'
          )}
        </div>
      </div>
    </div>
  )
}

