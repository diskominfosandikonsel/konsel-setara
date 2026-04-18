import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotifikasiStore = defineStore('notifikasi', () => {
  const STORAGE_KEY = 'push_notifications'
  const MAX_ITEMS = 50        // Maksimal 50 notifikasi tersimpan
  const MAX_AGE_DAYS = 30     // Otomatis hapus setelah 30 hari

  // ── State ──
  const list = ref([])

  // ── Getters ──
  const unreadCount = computed(() => list.value.filter(n => !n.read).length)

  // ── Helpers ──
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.value))
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        list.value = JSON.parse(raw)
        cleanup()  // Bersihkan data kadaluarsa setiap kali dimuat
      }
    } catch {
      list.value = []
    }
  }

  /**
   * Auto-cleanup: hapus notifikasi yang sudah lebih dari 30 hari
   * dan batasi maksimal 50 item
   */
  function cleanup() {
    const now = Date.now()
    const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000

    // Filter notifikasi yang masih dalam batas waktu
    list.value = list.value.filter(n => {
      const age = now - new Date(n.createdAt).getTime()
      return age < maxAge
    })

    // Potong jika melebihi batas maksimal
    if (list.value.length > MAX_ITEMS) {
      list.value = list.value.slice(0, MAX_ITEMS)
    }

    persist()
  }

  // ── Actions ──

  /**
   * Tambahkan notifikasi baru ke daftar (dipanggil oleh App.vue)
   * @param {Object} param0 - { title, body, type, laporanId }
   */
  function add({ title, body, type, laporanId }) {
    list.value.unshift({
      id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      title: title || 'Notifikasi',
      body: body || '',
      type: type || '',
      laporanId: laporanId || '',
      read: false,
      createdAt: new Date().toISOString()
    })

    // Potong jika melebihi batas maksimal
    if (list.value.length > MAX_ITEMS) {
      list.value = list.value.slice(0, MAX_ITEMS)
    }

    persist()
  }

  /**
   * Tandai notifikasi sebagai sudah terbaca
   */
  function markRead(id) {
    const item = list.value.find(n => n.id === id)
    if (item) {
      item.read = true
      persist()
    }
  }

  /**
   * Tandai semua notifikasi sebagai sudah dibaca
   */
  function markAllRead() {
    list.value.forEach(n => { n.read = true })
    persist()
  }

  /**
   * Hapus satu notifikasi
   */
  function remove(id) {
    list.value = list.value.filter(n => n.id !== id)
    persist()
  }

  /**
   * Hapus semua notifikasi
   */
  function clearAll() {
    list.value = []
    persist()
  }

  // Inisialisasi: muat data dari localStorage
  load()

  return {
    list,
    unreadCount,
    add,
    markRead,
    markAllRead,
    remove,
    clearAll,
    load
  }
})
