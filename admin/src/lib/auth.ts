import api from './api'

export interface UserProfile {
  _id: string
  username: string
  nama: string
  hp?: string
  email?: string
  opd?: string
  nip?: string
  menu_klp: number
  profile?: {
    menu_klp: number
    opd?: string
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

  const role = Number(data.user?.menu_klp)
  // Hanya izinkan Super Admin (1) atau Admin OPD (2)
  if (role !== 1 && role !== 2) {
    throw new Error('Akses ditolak: Akun Anda tidak memiliki hak akses Administrator.')
  }

  localStorage.setItem('admin_token', data.token)
  localStorage.setItem('admin_profile', JSON.stringify(data.user))

  return data
}

export function logout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_profile')
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
