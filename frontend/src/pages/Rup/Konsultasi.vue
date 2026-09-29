<template>
  <q-page class="konsultasi-page bg-grey-1">
    <!-- Header -->
    <q-header elevated class="bg-teal-7 text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="handleBack" />
        <q-toolbar-title class="text-subtitle1 text-weight-bold">
          Konsultasi Pengadaan
        </q-toolbar-title>
        <q-btn flat round dense icon="refresh" @click="refreshData">
          <q-tooltip>Muat Ulang</q-tooltip>
        </q-btn>
      </q-toolbar>

      <!-- Tabs Navigasi: Buat Tiket Konsultasi & Riwayat Tiket -->
      <q-tabs
        v-model="activeTab"
        dense
        class="bg-teal-8 text-teal-1"
        active-color="white"
        indicator-color="amber-4"
        align="justify"
        narrow-indicator
      >
        <q-tab name="create" icon="edit_note" label="Kirim Konsultasi" />
        <q-tab name="history" icon="history" label="Riwayat Saya">
          <q-badge v-if="myTickets.length > 0" color="amber-8" floating rounded>
            {{ myTickets.length }}
          </q-badge>
        </q-tab>
      </q-tabs>
    </q-header>

    <div class="q-pa-md container">
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB 1: FORM BUAT TIKET KONSULTASI                                   -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'create'">
        <!-- Card Intro dengan Jaminan SLA -->
        <q-card class="q-mb-md rounded-borders shadow-1 border-left-green bg-white">
          <q-card-section class="q-py-sm q-px-md">
            <div class="row items-center justify-between q-mb-xs">
              <div class="text-subtitle2 text-weight-bold text-teal-9 row items-center">
                <q-icon name="verified" color="teal-7" size="18px" class="q-mr-xs" />
                Saluran Konsultasi & Tiket SLA
              </div>
              <q-badge color="teal-1" text-color="teal-9" class="text-weight-bold q-py-xs q-px-sm border-teal">
                Respon Terpantau SLA
              </q-badge>
            </div>
            <div class="text-caption text-grey-7" style="font-size: 11.5px; line-height: 1.45;">
              Layanan konsultasi ini terhubung langsung ke sistem pemantauan SLA. Setiap pertanyaan atau masukan akan ditindaklanjuti oleh petugas pengadaan sesuai batas waktu respon yang ditentukan.
            </div>
          </q-card-section>
        </q-card>

        <!-- Form Konsultasi / Tiket -->
        <q-card class="rounded-borders shadow-1 form-card bg-white">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">
              Formulir Masukan & Pertanyaan
            </div>

            <q-form @submit="handleSubmitTicket" class="q-gutter-y-md">
              <!-- Nama Lengkap & Kontak -->
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <label class="text-caption text-weight-bold text-grey-8 q-mb-xs block">
                    Nama Lengkap *
                  </label>
                  <q-input
                    v-model="form.nama"
                    outlined
                    dense
                    placeholder="Nama lengkap Anda"
                    :rules="[val => !!val && val.trim().length > 0 || 'Nama wajib diisi']"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <label class="text-caption text-weight-bold text-grey-8 q-mb-xs block">
                    Kontak (Email / No. WhatsApp) *
                  </label>
                  <q-input
                    v-model="form.kontak"
                    outlined
                    dense
                    placeholder="email@example.com / 08..."
                    :rules="[val => !!val && val.trim().length > 0 || 'Kontak wajib diisi']"
                  />
                </div>
              </div>

              <!-- Kategori Konsultasi -->
              <div>
                <label class="text-caption text-weight-bold text-grey-8 q-mb-xs block">
                  Kategori Konsultasi *
                </label>
                <q-select
                  v-model="form.kategori"
                  :options="kategoriOptions"
                  outlined
                  dense
                  :rules="[val => !!val || 'Pilih kategori']"
                />
              </div>

              <!-- Prioritas / Kebijakan SLA -->
              <div>
                <label class="text-caption text-weight-bold text-grey-8 q-mb-xs block">
                  Tingkat Prioritas (Target Respon SLA) *
                </label>
                <q-select
                  v-model="form.selectedPolicy"
                  :options="policyOptions"
                  option-label="label"
                  outlined
                  dense
                  emit-value
                  map-options
                  :loading="loadingPolicies"
                  :rules="[val => !!val || 'Pilih tingkat prioritas']"
                >
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon
                          :name="getPriorityIcon(scope.opt.priority)"
                          :color="getPriorityColor(scope.opt.priority)"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">
                          {{ scope.opt.label }}
                        </q-item-label>
                        <q-item-label caption v-if="scope.opt.slaInfo">
                          {{ scope.opt.slaInfo }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <!-- Subjek / Terkait Paket Pengadaan -->
              <div>
                <label class="text-caption text-weight-bold text-grey-8 q-mb-xs block">
                  Subjek / Terkait Paket Pengadaan *
                </label>
                <q-input
                  v-model="form.judul"
                  outlined
                  dense
                  placeholder="Contoh: Pertanyaan Spesifikasi Paket Pengadaan Jembatan..."
                  :rules="[val => !!val && val.trim().length > 0 || 'Subjek wajib diisi']"
                />
              </div>

              <!-- Uraian Masukan / Pertanyaan -->
              <div>
                <label class="text-caption text-weight-bold text-grey-8 q-mb-xs block">
                  Uraian Masukan / Pertanyaan *
                </label>
                <q-input
                  v-model="form.pesan"
                  type="textarea"
                  outlined
                  rows="4"
                  placeholder="Tuliskan secara jelas saran, pertanyaan, atau kendala yang ingin dikonsultasikan..."
                  :rules="[val => !!val && val.trim().length > 0 || 'Uraian tidak boleh kosong']"
                />
              </div>

              <!-- Lampiran Foto / Bukti Dokumen (Capacitor Camera) -->
              <div>
                <label class="text-caption text-weight-bold text-grey-8 q-mb-xs block">
                  Lampiran Foto / Dokumen Bukti (Opsional)
                </label>

                <div v-if="!photoPreview">
                  <q-btn
                    outline
                    color="teal-7"
                    icon="photo_camera"
                    label="Ambil atau Pilih Foto (Kamera / Galeri)"
                    class="full-width q-py-sm rounded-borders"
                    no-caps
                    @click="takeOrPickPhoto"
                  />
                </div>

                <div v-else class="preview-box q-pa-sm rounded-borders bg-grey-2 relative-position">
                  <q-img
                    :src="photoPreview"
                    class="rounded-borders"
                    style="max-height: 220px;"
                    fit="contain"
                  />
                  <div class="row justify-between items-center q-mt-sm">
                    <span class="text-caption text-grey-8">
                      <q-icon name="check_circle" color="positive" /> Foto berhasil dilampirkan
                    </span>
                    <q-btn
                      flat
                      dense
                      round
                      color="negative"
                      icon="delete"
                      @click="removePhoto"
                    >
                      <q-tooltip>Hapus Lampiran</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </div>

              <!-- Tombol Submit -->
              <div class="q-mt-lg">
                <q-btn
                  type="submit"
                  label="Kirimkan Konsultasi"
                  color="teal-7"
                  class="full-width q-py-sm text-weight-bold rounded-borders shadow-2"
                  unelevated
                  icon="send"
                  :loading="submitting"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: RIWAYAT KONSULTASI / TIKET SAYA                              -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-show="activeTab === 'history'">
        <!-- Filter Tabs -->
        <div class="row q-gutter-xs q-mb-md">
          <q-btn
            v-for="flt in filterTabs"
            :key="flt.value"
            dense
            rounded
            unelevated
            size="sm"
            :color="statusFilter === flt.value ? 'teal-7' : 'grey-3'"
            :text-color="statusFilter === flt.value ? 'white' : 'grey-8'"
            :label="flt.label"
            class="q-px-sm text-weight-bold"
            @click="statusFilter = flt.value"
          />
        </div>

        <!-- Skeleton Loading -->
        <div v-if="loadingTickets" class="q-gutter-y-sm">
          <q-skeleton v-for="n in 3" :key="n" height="110px" square class="rounded-borders" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredTickets.length === 0"
          class="column items-center justify-center q-pa-xl text-center"
        >
          <q-avatar icon="question_answer" size="72px" color="teal-1" text-color="teal-7" class="q-mb-md" />
          <div class="text-subtitle1 text-weight-bold text-grey-9">Belum Ada Riwayat Konsultasi</div>
          <div class="text-caption text-grey-6 q-mb-md">
            {{ statusFilter === 'ALL' ? 'Anda belum pernah mengirimkan tiket konsultasi.' : 'Tidak ada konsultasi dengan status ini.' }}
          </div>
          <q-btn
            color="teal-7"
            unelevated
            no-caps
            label="Kirim Konsultasi Sekarang"
            icon="add"
            @click="activeTab = 'create'"
            class="rounded-borders"
          />
        </div>

        <!-- List Tiket Konsultasi -->
        <div v-else class="q-gutter-y-sm">
          <q-card
            v-for="ticket in filteredTickets"
            :key="ticket.id"
            class="rounded-borders shadow-1 ticket-card cursor-pointer"
            @click="openTicketDetail(ticket)"
          >
            <q-card-section class="q-pb-xs">
              <div class="row items-center justify-between no-wrap q-mb-xs">
                <span class="text-caption text-weight-bold text-grey-6">
                  #{{ ticket.id.slice(0, 8) }}
                </span>
                <div class="row q-gutter-x-xs">
                  <q-badge
                    :color="getPriorityColor(ticket.priority)"
                    class="text-weight-bold q-px-xs"
                  >
                    {{ ticket.priority }}
                  </q-badge>
                  <q-badge
                    :color="getStatusColor(ticket.status)"
                    class="text-weight-bold q-px-xs"
                  >
                    {{ getStatusLabel(ticket.status) }}
                  </q-badge>
                </div>
              </div>

              <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs line-clamp-1">
                {{ ticket.title }}
              </div>

              <div class="text-caption text-grey-7 line-clamp-2 q-mb-sm">
                {{ ticket.description || '-' }}
              </div>

              <div class="row items-center justify-between text-caption text-grey-6 q-pt-xs border-top-grey">
                <div class="row items-center">
                  <q-icon name="schedule" size="14px" class="q-mr-xs text-grey-7" />
                  <span>{{ formatDate(ticket.createdAt) }}</span>
                </div>

                <div v-if="ticket.isBreached" class="text-negative text-weight-bold">
                  <q-icon name="warning" size="14px" class="q-mr-xs" /> SLA Terlewati
                </div>
                <div v-else-if="ticket.responseDueAt && !ticket.firstResponseAt" class="text-amber-9">
                  <q-icon name="hourglass_top" size="14px" class="q-mr-xs" /> Menunggu Respon
                </div>
                <div v-else class="text-positive">
                  <q-icon name="check_circle" size="14px" class="q-mr-xs" /> Terjadwal
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- DIALOG MODAL DETAIL TIKET & BALASAN DISKUSI                        -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <q-dialog v-model="detailDialog" full-width>
      <q-card class="column full-height" style="max-width: 600px; margin: 0 auto;">
        <q-toolbar class="bg-teal-7 text-white">
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            Detail Konsultasi #{{ selectedTicket?.id?.slice(0, 8) }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="col q-pa-md scroll" v-if="selectedTicket">
          <!-- Status & Prioritas -->
          <div class="row items-center justify-between q-mb-sm">
            <q-badge :color="getStatusColor(selectedTicket.status)" class="text-weight-bold q-pa-xs">
              Status: {{ getStatusLabel(selectedTicket.status) }}
            </q-badge>
            <q-badge :color="getPriorityColor(selectedTicket.priority)" class="text-weight-bold q-pa-xs">
              Prioritas: {{ selectedTicket.priority }}
            </q-badge>
          </div>

          <div class="text-h6 text-weight-bold text-grey-9 q-mb-xs">
            {{ selectedTicket.title }}
          </div>
          <div class="text-caption text-grey-6 q-mb-md">
            Diajukan pada: {{ formatDateTime(selectedTicket.createdAt) }}
          </div>

          <!-- Uraian Pertanyaan -->
          <div class="bg-grey-1 q-pa-sm rounded-borders q-mb-md">
            <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Uraian Konsultasi:</div>
            <div class="text-body2 text-grey-9 text-pre-line">
              {{ selectedTicket.description || '-' }}
            </div>
          </div>

          <!-- Lampiran Gambar -->
          <div v-if="selectedTicket.attachmentUrl" class="q-mb-md">
            <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Lampiran Bukti:</div>
            <q-img
              :src="selectedTicket.attachmentUrl"
              class="rounded-borders"
              style="max-height: 250px;"
              fit="contain"
            />
          </div>

          <!-- Info Petugas & Batas Respon -->
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-6">
              <div class="bg-teal-1 q-pa-sm rounded-borders">
                <div class="text-caption text-teal-9 text-weight-bold">Petugas PBJ (Agent):</div>
                <div class="text-caption text-grey-8">
                  {{ selectedTicket.assignedTo?.name || selectedTicket.assignedTo?.email || 'Menunggu penugasan' }}
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="bg-amber-1 q-pa-sm rounded-borders">
                <div class="text-caption text-amber-10 text-weight-bold">Target Respon SLA:</div>
                <div class="text-caption text-grey-8">
                  {{ selectedTicket.responseDueAt ? formatDateTime(selectedTicket.responseDueAt) : 'Standar SLA PBJ' }}
                </div>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <!-- Tanggapan / Komentar Diskusi -->
          <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-sm">
            Tanggapan & Diskusi ({{ selectedTicket.comments?.length || 0 }})
          </div>

          <div v-if="!selectedTicket.comments || selectedTicket.comments.length === 0" class="text-caption text-grey-6 text-center q-py-md">
            Belum ada balasan dari petugas pengadaan.
          </div>

          <div v-else class="q-gutter-y-sm q-mb-md">
            <div
              v-for="comment in selectedTicket.comments"
              :key="comment.id"
              class="q-pa-sm rounded-borders"
              :class="isOwnComment(comment) ? 'bg-teal-1 q-ml-md' : 'bg-grey-2 q-mr-md'"
            >
              <div class="row items-center justify-between text-caption text-weight-bold q-mb-xs">
                <span :class="isOwnComment(comment) ? 'text-teal-9' : 'text-grey-9'">
                  {{ comment.author?.name || comment.author?.email || 'Pengguna' }}
                </span>
                <span class="text-grey-6 text-caption" style="font-size: 10px;">
                  {{ formatDateTime(comment.createdAt) }}
                </span>
              </div>
              <div class="text-body2 text-grey-9 text-pre-line">
                {{ comment.content }}
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Input Balasan -->
        <q-card-actions class="bg-white q-pa-sm border-top-grey">
          <q-input
            v-model="replyContent"
            dense
            outlined
            placeholder="Tulis balasan atau informasi tambahan..."
            class="col"
            @keyup.enter="handleSendReply"
          />
          <q-btn
            color="teal-7"
            unelevated
            round
            dense
            icon="send"
            class="q-ml-sm"
            :loading="sendingReply"
            @click="handleSendReply"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { TicketService } from 'src/services/ticket.service'

const router = useRouter()
const $q = useQuasar()

const activeTab = ref('create')
const submitting = ref(false)
const loadingPolicies = ref(false)
const loadingTickets = ref(false)
const detailDialog = ref(false)
const selectedTicket = ref(null)
const replyContent = ref('')
const sendingReply = ref(false)

const statusFilter = ref('ALL')
const filterTabs = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Menunggu', value: 'OPEN' },
  { label: 'Diproses', value: 'IN_PROGRESS' },
  { label: 'Selesai', value: 'RESOLVED' }
]

const kategoriOptions = [
  'Pertanyaan Teknis RUP',
  'Masukan Spesifikasi Barang/Jasa',
  'Konsultasi Regulasi PBJ',
  'Saran & Partisipasi Publik',
  'Kendala Layanan LPSE / E-Katalog',
  'Lainnya'
]

// Identitas Pelapor
const reporterInfo = ref({
  name: '',
  email: '',
  orgId: ''
})

// Form State
const form = ref({
  nama: '',
  kontak: '',
  kategori: 'Pertanyaan Teknis RUP',
  judul: '',
  pesan: '',
  selectedPolicy: null,
  attachmentUrl: ''
})

const photoPreview = ref(null)
const myTickets = ref([])
const rawPolicies = ref([])

// Opsi prioritas SLA fallback
const fallbackPolicies = [
  { label: 'Rendah (Low) - Respon Maks. 24 Jam', priority: 'LOW', slaInfo: 'Maks. respon 24 jam' },
  { label: 'Sedang (Medium) - Respon Maks. 8 Jam', priority: 'MEDIUM', slaInfo: 'Maks. respon 8 jam' },
  { label: 'Tinggi (High) - Respon Maks. 2 Jam', priority: 'HIGH', slaInfo: 'Maks. respon 2 jam' }
]

const policyOptions = computed(() => {
  if (rawPolicies.value && rawPolicies.value.length > 0) {
    return rawPolicies.value.map(p => ({
      label: `${p.name} (${p.priority})`,
      priority: p.priority,
      id: p.id,
      orgId: p.organizationId,
      slaInfo: `Respon: ${p.responseTimeHours}j, Selesai: ${p.resolutionTimeHours}j`,
      raw: p
    }))
  }
  return fallbackPolicies.map(f => ({
    ...f,
    id: f.priority,
    orgId: reporterInfo.value.orgId || 'default-org'
  }))
})

onMounted(async () => {
  initUserInfo()
  await Promise.all([loadPolicies(), loadMyTickets()])
})

const initUserInfo = () => {
  const konselUser = TicketService.getKonselUser()
  if (konselUser) {
    const userName = konselUser.name || konselUser.nama || konselUser.username || ''
    const userEmail = konselUser.email || konselUser.no_hp || ''
    form.value.nama = userName
    form.value.kontak = userEmail
    reporterInfo.value.name = userName || 'Masyarakat Konsel'
    reporterInfo.value.email = userEmail || 'warga@konaweselatankab.go.id'
  }
}

// ── Load Kebijakan SLA ─────────────────────────────────────────────────────
const loadPolicies = async () => {
  loadingPolicies.value = true
  try {
    let orgId = reporterInfo.value.orgId
    if (!orgId) {
      try {
        const me = await TicketService.getMe()
        if (me?.memberships?.[0]?.orgId) {
          orgId = me.memberships[0].orgId
          reporterInfo.value.orgId = orgId
        }
      } catch (authErr) {
        console.log('[SLA] Menggunakan default org policies')
      }
    }

    if (orgId) {
      const data = await TicketService.getSlaPolicies(orgId)
      if (Array.isArray(data) && data.length > 0) {
        rawPolicies.value = data
      }
    }
  } catch (err) {
    console.warn('[Ticket] Gagal mengambil kebijakan SLA remote:', err)
  } finally {
    loadingPolicies.value = false
    if (!form.value.selectedPolicy && policyOptions.value.length > 0) {
      form.value.selectedPolicy = policyOptions.value[0]
    }
  }
}

// ── Load Riwayat Tiket ────────────────────────────────────────────────────
const loadMyTickets = async () => {
  loadingTickets.value = true
  try {
    const res = await TicketService.getMyTickets()
    if (Array.isArray(res)) {
      myTickets.value = res
    } else if (res?.data && Array.isArray(res.data)) {
      myTickets.value = res.data
    }
  } catch (err) {
    console.warn('[Ticket] Membaca riwayat tiket lokal:', err?.message)
    const local = localStorage.getItem('rup_konsultasi_tickets')
    if (local) {
      try {
        myTickets.value = JSON.parse(local)
      } catch (e) {}
    }
  } finally {
    loadingTickets.value = false
  }
}

const refreshData = async () => {
  await Promise.all([loadPolicies(), loadMyTickets()])
  $q.notify({ type: 'info', message: 'Data konsultasi diperbarui', position: 'top', timeout: 1000 })
}

// ── Foto Lampiran via Capacitor Camera ────────────────────────────────────
const takeOrPickPhoto = async () => {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      quality: 80,
      width: 1200
    })

    if (photo?.dataUrl) {
      photoPreview.value = photo.dataUrl
      form.value.attachmentUrl = photo.dataUrl
    }
  } catch (err) {
    console.log('User cancelled camera/gallery selection', err)
  }
}

const removePhoto = () => {
  photoPreview.value = null
  form.value.attachmentUrl = ''
}

// ── Submit Tiket Konsultasi ───────────────────────────────────────────────
const handleSubmitTicket = async () => {
  if (!form.value.nama.trim()) {
    return $q.notify({ type: 'negative', message: 'Nama lengkap wajib diisi' })
  }
  if (!form.value.judul.trim()) {
    return $q.notify({ type: 'negative', message: 'Subjek konsultasi wajib diisi' })
  }
  if (!form.value.pesan.trim()) {
    return $q.notify({ type: 'negative', message: 'Uraian konsultasi wajib diisi' })
  }

  const selected = form.value.selectedPolicy
  const priority = selected?.priority || 'MEDIUM'
  const slaPolicyId = selected?.id || null
  const orgId = selected?.orgId || reporterInfo.value.orgId || 'default-org'

  submitting.value = true
  try {
    const fullDescription = `[Kategori: ${form.value.kategori}]\n[Pelapor: ${form.value.nama} | Kontak: ${form.value.kontak}]\n\n${form.value.pesan.trim()}`

    const payload = {
      title: form.value.judul.trim(),
      description: fullDescription,
      priority,
      slaPolicyId,
      orgId,
      channel: 'PORTAL',
      attachmentUrl: form.value.attachmentUrl || null
    }

    let created = null
    try {
      created = await TicketService.createTicket(payload)
    } catch (apiErr) {
      console.warn('[Ticket] Backend SLA offline, menyimpan tiket konsultasi secara lokal:', apiErr)
      created = {
        id: 'RUP-' + Date.now().toString(36).toUpperCase(),
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        status: 'OPEN',
        channel: 'PORTAL',
        attachmentUrl: payload.attachmentUrl,
        createdAt: new Date().toISOString(),
        isBreached: false,
        comments: []
      }
    }

    if (created) {
      myTickets.value.unshift(created)
      localStorage.setItem('rup_konsultasi_tickets', JSON.stringify(myTickets.value))
    }

    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Konsultasi berhasil diajukan!',
      caption: `Tiket tercatat dengan prioritas ${priority}. Petugas akan menindaklanjuti.`,
      position: 'top'
    })

    // Reset Form Input
    form.value.judul = ''
    form.value.pesan = ''
    photoPreview.value = null
    form.value.attachmentUrl = ''

    // Buka tab riwayat
    activeTab.value = 'history'
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Gagal mengirim konsultasi',
      caption: err.response?.data?.message || err.message
    })
  } finally {
    submitting.value = false
  }
}

// ── Detail & Balasan Komentar ─────────────────────────────────────────────
const openTicketDetail = async (ticket) => {
  selectedTicket.value = { ...ticket }
  detailDialog.value = true

  try {
    const detail = await TicketService.getTicketById(ticket.id)
    if (detail) {
      selectedTicket.value = detail
    }
  } catch (e) {}
}

const handleSendReply = async () => {
  if (!replyContent.value.trim() || !selectedTicket.value) return

  sendingReply.value = true
  try {
    const content = replyContent.value.trim()
    try {
      await TicketService.addComment(selectedTicket.value.id, content)
    } catch (e) {}

    const newComment = {
      id: 'CMT-' + Date.now(),
      content,
      createdAt: new Date().toISOString(),
      author: {
        name: form.value.nama || reporterInfo.value.name,
        email: form.value.kontak || reporterInfo.value.email
      }
    }

    if (!selectedTicket.value.comments) {
      selectedTicket.value.comments = []
    }
    selectedTicket.value.comments.push(newComment)
    replyContent.value = ''

    $q.notify({ type: 'positive', message: 'Tanggapan terkirim' })
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Gagal mengirim tanggapan' })
  } finally {
    sendingReply.value = false
  }
}

const isOwnComment = (comment) => {
  return comment.author?.email === form.value.kontak || comment.author?.name === form.value.nama
}

// ── Helper Badges & Labels ────────────────────────────────────────────────
const filteredTickets = computed(() => {
  if (statusFilter.value === 'ALL') {
    return myTickets.value
  }
  return myTickets.value.filter(t => t.status === statusFilter.value)
})

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'HIGH': return 'negative'
    case 'MEDIUM': return 'orange-8'
    case 'LOW': return 'teal-7'
    default: return 'grey-7'
  }
}

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'HIGH': return 'error'
    case 'MEDIUM': return 'warning'
    case 'LOW': return 'info'
    default: return 'help'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'OPEN': return 'amber-9'
    case 'IN_PROGRESS': return 'indigo-7'
    case 'RESOLVED': return 'positive'
    case 'CLOSED': return 'grey-7'
    default: return 'grey-6'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'OPEN': return 'Menunggu Respon'
    case 'IN_PROGRESS': return 'Sedang Diproses'
    case 'RESOLVED': return 'Selesai'
    case 'CLOSED': return 'Ditutup'
    default: return status || 'Unknown'
  }
}

const formatDate = (isoString) => {
  if (!isoString) return '-'
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch (e) {
    return isoString
  }
}

const formatDateTime = (isoString) => {
  if (!isoString) return '-'
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return isoString
  }
}

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/rup')
  }
}
</script>

<style scoped lang="scss">
.konsultasi-page {
  min-height: 100vh;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.border-left-green {
  border-left: 4px solid #00a86b;
}

.border-teal {
  border: 1px solid #4db6ac;
}

.border-top-grey {
  border-top: 1px solid #eeeeee;
}

.text-pre-line {
  white-space: pre-line;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ticket-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.ticket-card:active {
  transform: scale(0.99);
}
</style>
