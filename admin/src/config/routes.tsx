import { lazy } from 'react'
import { Navigate } from 'react-router-dom'

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

// Admin
const Users = lazy(() => import('@/app/users/page'))
const Pegawai = lazy(() => import('@/app/pegawai/page'))

// Settings
const UserSettings = lazy(() => import('@/app/settings/user/page'))

// Error pages
const NotFound = lazy(() => import('@/app/errors/not-found/page'))

export interface RouteConfig {
  path: string
  element: React.ReactNode
  children?: RouteConfig[]
}

export const routes: RouteConfig[] = [
  // Default → dashboard
  {
    path: "/",
    element: <Navigate to="dashboard" replace />
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
    element: <Dashboard />
  },

  // SKM
  {
    path: "/ulasan",
    element: <Ulasan />
  },
  {
    path: "/aplikasi",
    element: <Aplikasi />
  },

  // Program Prioritas
  {
    path: "/realisasi",
    element: <Realisasi />
  },

  // Content
  {
    path: "/slider",
    element: <Slider />
  },
  {
    path: "/menu",
    element: <MenuDinamis />
  },

  // Admin
  {
    path: "/users",
    element: <Users />
  },
  {
    path: "/pegawai",
    element: <Pegawai />
  },

  // Settings
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
