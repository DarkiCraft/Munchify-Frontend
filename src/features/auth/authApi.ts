import { API_BASE } from '../../core/config'

export type LoginResponse = {
  access_token: string
  token_type: 'bearer'
}

export type SignupResponse = {
  user_id: number
  user_name: string
  email: string
}

export async function signup(
  user_name: string,
  email: string,
  password: string,
): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name, email, password }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Signup failed: ${res.status}`)
  }

  return (await res.json()) as SignupResponse
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  // Backend uses OAuth2PasswordRequestForm (x-www-form-urlencoded) with username=email
  const body = new URLSearchParams()
  body.set('username', email)
  body.set('password', password)

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Login failed: ${res.status}`)
  }

  return (await res.json()) as LoginResponse
}

