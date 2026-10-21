import api from './api'
import { clearAccessGroup, fetchMyAccessGroup } from './permissions'

export interface UserProfile {
  _id: string
  username: string
  nama: string
  hp?: string
  email?: string
  opd?: string
  opd_id?: string | null
  nip?: string
  menu_klp: number
  profile?: {
    menu_klp: number
    opd?: string
    opd_id?: string | null
    nama?: string
  }
}

export interface LoginResponse {
  token: string
  user: UserProfile
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/login', { username, password })
  const data = res.data as LoginResponse

  localStorage.setItem('admin_token', data.token)
  localStorage.setItem('admin_profile', JSON.stringify(data.user))

  try {
    const group = await fetchMyAccessGroup()
    if (!group.permissions.some((permission) => permission.can_read)) {
      throw new Error('Kelompok akun ini belum memiliki akses ke panel admin.')
    }
  } catch (error) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_profile')
    clearAccessGroup()
    throw error
  }

  return data
}

export function logout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_profile')
  clearAccessGroup()
  window.location.href = '/auth/sign-in'
}

export function getToken(): string | null {
  return localStorage.getItem('admin_token')
}

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem('admin_profile')
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function isAdmin(): boolean {
  const profile = getProfile()
  return profile?.menu_klp === 1
}
