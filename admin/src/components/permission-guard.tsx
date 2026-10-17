import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  fetchMyAccessGroup,
  getStoredAccessGroup,
  hasPermission,
} from '@/lib/permissions'

interface PermissionGuardProps {
  menuKey: string
  children: React.ReactNode
}

export function PermissionGuard({ menuKey, children }: PermissionGuardProps) {
  const cached = getStoredAccessGroup()
  const [loading, setLoading] = useState(!cached)
  const [allowed, setAllowed] = useState(cached ? hasPermission(menuKey, 'read', cached) : false)

  useEffect(() => {
    let active = true

    fetchMyAccessGroup()
      .then((group) => {
        if (active) setAllowed(hasPermission(menuKey, 'read', group))
      })
      .catch(() => {
        if (active) setAllowed(false)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [menuKey])

  if (loading) return <LoadingSpinner />
  if (!allowed) return <Navigate to="/errors/forbidden" replace />
  return <>{children}</>
}
