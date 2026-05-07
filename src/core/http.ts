import { API_BASE } from './config'
import { getToken } from './tokenStorage'

export class HttpError extends Error {
  status: number
  body?: unknown
  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit & { json?: Json } = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  let body = options.body
  if (options.json !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.json)
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body,
  })

  const text = await res.text()
  const parsed = text ? (safeJsonParse(text) as unknown) : undefined

  if (!res.ok) {
    throw new HttpError(
      (parsed as any)?.detail || `Request failed: ${res.status}`,
      res.status,
      parsed,
    )
  }

  return parsed as T
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

