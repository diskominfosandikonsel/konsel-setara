import { apiTicket } from 'src/api/apiTicket'

export const TicketService = {
  // Ambil profil user saat ini di sistem SLA beserta memberships / organisasi
  async getMe() {
    const res = await apiTicket.get('/auth/me')
    return res.data
  },

  // Otentikasi khusus ke SLA System jika diperlukan
  async login(email, password) {
    const res = await apiTicket.post('/auth/login', { email, password })
    const token = res.data?.access_token || res.data?.token
    if (token) {
      localStorage.setItem('sla_token', token)
    }
    return res.data
  },

  // Logout dari sesi SLA
  logout() {
    localStorage.removeItem('sla_token')
  },

  // Ambil daftar kebijakan SLA berdasarkan organizationId
  async getSlaPolicies(organizationId) {
    const res = await apiTicket.get(`/sla/${organizationId}`)
    return res.data
  },

  // Buat Tiket Baru
  async createTicket(payload) {
    const res = await apiTicket.post('/tickets', {
      title: payload.title,
      description: payload.description,
      priority: payload.priority, // 'LOW' | 'MEDIUM' | 'HIGH'
      orgId: payload.orgId,
      slaPolicyId: payload.slaPolicyId,
      channel: payload.channel || 'PORTAL',
      attachmentUrl: payload.attachmentUrl || null
    })
    return res.data
  },

  // Ambil riwayat tiket milik pengguna yang sedang login
  async getMyTickets() {
    const res = await apiTicket.get('/tickets/my-tickets')
    return res.data
  },

  // Ambil detail tiket lengkap dengan linimasa status & komentar
  async getTicketById(ticketId) {
    const res = await apiTicket.get(`/tickets/${ticketId}`)
    return res.data
  },

  // Tambah komentar/balasan pada tiket
  async addComment(ticketId, content) {
    const res = await apiTicket.post(`/comments/${ticketId}`, { content })
    return res.data
  },

  // Ambil data user Konsel Setara dari localStorage
  getKonselUser() {
    try {
      const stored = localStorage.getItem('user')
      if (stored && stored !== 'undefined') {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('[TicketService] Gagal membaca user Konsel Setara', e)
    }
    return null
  }
}

export default TicketService
