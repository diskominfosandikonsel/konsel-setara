"use client"

import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { routes, type RouteConfig } from '@/config/routes'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { PermissionGuard } from '@/components/permission-guard'

function renderRoutes(routeConfigs: RouteConfig[]) {
  return routeConfigs.map((route, index) => (
    <Route
      key={route.path + index}
      path={route.path}
      element={
        <Suspense fallback={<LoadingSpinner />}>
          {route.permissionKey ? (
            <PermissionGuard menuKey={route.permissionKey}>{route.element}</PermissionGuard>
          ) : route.element}
        </Suspense>
      }
    >
      {route.children && renderRoutes(route.children)}
    </Route>
  ))
}

export function AppRouter() {
  return (
    <Routes>
      {renderRoutes(routes)}
    </Routes>
  )
}
