import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '@/lib/auth'
import { getFirstAllowedRoute } from '@/lib/permissions'

// Auth pages
const SignIn = lazy(() => import('@/app/auth/sign-in/page'))

// Dashboard
const Dashboard = lazy(() => import('@/app/dashboard/page'))

// SKM pages
const Ulasan = lazy(() => import('@/app/ulasan/page'))
const Aplikasi = lazy(() => import('@/app/aplikasi/page'))

// Program Prioritas
const Realisasi = lazy(() => import('@/app/realisasi/page'))

// Content Management
const Slider = lazy(() => import('@/app/slider/page'))
const MenuDinamis = lazy(() => import('@/app/menu/page'))
const VideoKonsel = lazy(() => import('@/app/video-konsel/page'))

// Admin
const Users = lazy(() => import('@/app/users/page'))
const Pegawai = lazy(() => import('@/app/pegawai/page'))
const AccessGroups = lazy(() => import('@/app/access-groups/page'))

// Settings
const UserSettings = lazy(() => import('@/app/settings/user/page'))

// Error pages
const NotFound = lazy(() => import('@/app/errors/not-found/page'))
const Forbidden = lazy(() => import('@/app/errors/forbidden/page'))

export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
  permissionKey?: string
}

function DefaultRedirect() {
  return <Navigate to={isAuthenticated() ? getFirstAllowedRoute() : "/auth/sign-in"} replace />
}

export const routes: RouteConfig[] = [
  // Default → dashboard
  {
    path: "/",
    element: <DefaultRedirect />
  },

  // Auth
  {
    path: "/auth/sign-in",
    element: <SignIn />
  },
  {
    path: "/sign-in",
    element: <Navigate to="/auth/sign-in" replace />
  },
  {
    path: "/login",
    element: <Navigate to="/auth/sign-in" replace />
  },

  // Dashboard
  {
    path: "/dashboard",
    element: <Dashboard />,
    permissionKey: "dashboard"
  },

  // SKM
  {
    path: "/ulasan",
    element: <Ulasan />,
    permissionKey: "ulasan"
  },
  {
    path: "/aplikasi",
    element: <Aplikasi />,
    permissionKey: "aplikasi"
  },

  // Program Prioritas
  {
    path: "/realisasi",
    element: <Realisasi />,
    permissionKey: "realisasi"
  },

  // Content
  {
    path: "/slider",
    element: <Slider />,
    permissionKey: "slider"
  },
  {
    path: "/menu",
    element: <MenuDinamis />,
    permissionKey: "menu"
  },
  {
    path: "/video-konsel",
    element: <VideoKonsel />,
    permissionKey: "video_konsel"
  },

  // Admin
  {
    path: "/users",
    element: <Users />,
    permissionKey: "users"
  },
  {
    path: "/pegawai",
    element: <Pegawai />,
    permissionKey: "pegawai"
  },
  {
    path: "/access-groups",
    element: <AccessGroups />,
    permissionKey: "access_groups"
  },

  // Settings
  {
    path: "/errors/forbidden",
    element: <Forbidden />
  },
  {
    path: "/settings/user",
    element: <UserSettings />
  },

  // 404
  {
    path: "*",
    element: <NotFound />
  }
]
