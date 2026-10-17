import api from '@/lib/api'

export type PermissionAction = 'read' | 'create' | 'update' | 'delete'

export interface MenuPermission {
  key: string
  label: string
  section: string
  can_read: boolean
  can_create: boolean
  can_update: boolean
  can_delete: boolean
}

export interface AccessGroupProfile {
  id: number
  name: string
  description: string
  is_system: boolean
  is_active: boolean
  permissions: MenuPermission[]
}

const STORAGE_KEY = 'admin_access_group'

export function storeAccessGroup(group: AccessGroupProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(group))
  window.dispatchEvent(new Event('access-permissions-changed'))
}

export function clearAccessGroup() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('access-permissions-changed'))
}

export function getStoredAccessGroup(): AccessGroupProfile | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AccessGroupProfile
  } catch {
    return null
  }
}

export async function fetchMyAccessGroup(): Promise<AccessGroupProfile> {
  const response = await api.get('/api/v1/access-groups/my-permissions')
  const group = response.data.data as AccessGroupProfile
  storeAccessGroup(group)
  return group
}

export function hasPermission(
  menuKey: string,
  action: PermissionAction = 'read',
  group = getStoredAccessGroup()
) {
  if (!menuKey) return true
  if (!group || !group.permissions || group.permissions.length === 0) return true
  const permission = group.permissions.find((item) => item.key === menuKey)
  if (!permission) return true
  return Boolean(permission[`can_${action}`])
}

const routeByMenu: Record<string, string> = {
  dashboard: '/dashboard',
  realisasi: '/realisasi',
  ulasan: '/ulasan',
  aplikasi: '/aplikasi',
  slider: '/slider',
  menu: '/menu',
  video_konsel: '/video-konsel',
  rup: '/rup',
  users: '/users',
  pegawai: '/pegawai',
  access_groups: '/access-groups',
}

export function getFirstAllowedRoute(group = getStoredAccessGroup()) {
  const first = group?.permissions.find((permission) => permission.can_read && routeByMenu[permission.key])
  return first ? routeByMenu[first.key] : '/errors/forbidden'
}
