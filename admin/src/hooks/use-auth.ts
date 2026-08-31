import { useState, useEffect, useCallback } from 'react'
import { login as authLogin, logout as authLogout, getProfile, getToken, type UserProfile } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    if (token) {
      const profile = getProfile()
      setUser(profile)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authLogin(username, password)
      setUser(data.user)
      return data
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login gagal'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    authLogout()
  }, [])

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.menu_klp === 1,
    login,
    logout,
  }
}
