import { isAxiosError } from "axios"

export type VisitorType = "internal" | "external_employee" | "external_general"

export interface OpdOption {
  id: string
  instansi: string
}

export interface GuestbookLocation {
  id: number
  token: string
  opd_id: string
  opd_name: string
  label: string
  wifi_ssid?: string | null
  wifi_password?: string | null
  is_active: boolean
  created_by_name?: string
  created_at: string
}

export interface GuestbookVisit {
  id: number
  opd_id?: string
  opd_name: string
  visitor_type: VisitorType
  visitor_name: string
  gender?: "L" | "P" | null
  nip?: string | null
  origin_institution?: string | null
  position_name?: string | null
  office_name?: string | null
  phone?: string | null
  purpose: string
  checked_in_at: string
}

export const visitorTypeLabel: Record<VisitorType, string> = {
  internal: "ASN Konsel",
  external_employee: "ASN",
  external_general: "Non ASN / Tamu Umum",
}

export function formatDateTime(value: string) {
  if (!value) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(new Date(value))
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value || 0)
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message
    if (typeof message === "string" && message.trim()) return message
  }
  return fallback
}
