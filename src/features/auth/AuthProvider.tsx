import { createContext, useContext, useMemo, useState } from 'react'
import { clearToken, getToken, setToken } from '../../core/tokenStorage'
import * as authApi from './authApi'

type AuthState = {
  token: string | null
  login(email: string, password: string): Promise<void>
  logout(): void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())

  const value = useMemo<AuthState>(
    () => ({
      token,
      async login(email: string, password: string) {
        const resp = await authApi.login(email, password)
        setToken(resp.access_token)
        setTokenState(resp.access_token)
      },
      logout() {
        clearToken()
        setTokenState(null)
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

