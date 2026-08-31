import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, getProfile, logout } from '@/lib/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth/sign-in', { replace: true })
      return
    }

    const profile = getProfile()
    const role = Number(profile?.menu_klp)
    if (role !== 1 && role !== 2) {
      logout()
    }
  }, [navigate])

  const profile = getProfile()
  const role = Number(profile?.menu_klp)
  if (!isAuthenticated() || (role !== 1 && role !== 2)) {
    return null
  }

  return <>{children}</>
}
