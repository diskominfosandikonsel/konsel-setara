import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'

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

  }, [navigate])

  if (!isAuthenticated()) {
    return null
  }

  return <>{children}</>
}
