<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 90%; max-width: 90%;">
      <q-toolbar>
        <q-toolbar-title>
          <q-icon name="circle_notifications" color="red" class="q-mr-md" />
          <span class="text-weight-bold">{{ title }}</span>
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-separator />

      <q-card-section style="padding: 24px;">
        <div class="q-gutter-lg">
          <!-- Status Kecamatan -->
          <div>
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <q-icon name="location_city" size="28px" color="warning" style="margin-right: 12px;" />
              <h5 style="margin: 0; color: #FF9800; font-size: 16px; font-weight: 600;">
                {{ kecamatanLabel }}
              </h5>
            </div>
            
            <div v-if="statusKecamatan === 2" style="padding: 16px; background-color: #FFF3E0; border-left: 4px solid #FF9800; border-radius: 4px;">
              <div style="display: flex; align-items: flex-start;">
                <q-icon name="info" color="warning" size="24px" style="margin-right: 12px; margin-top: 2px; flex-shrink: 0;" />
                <div style="flex: 1;">
                  <div style="font-size: 13px; font-weight: 600; color: #E65100; margin-bottom: 8px;">
                    Data dikembalikan oleh {{ kecamatanLabel }}
                  </div>
                  <div style="font-size: 14px; color: #BF360C; line-height: 1.6;">
                    {{ keteranganKecamatan || 'Tidak ada keterangan' }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else style="padding: 16px; background-color: #F5F5F5; border-radius: 4px; text-align: center; color: #999;">
              <p style="margin: 0; font-size: 13px;">Data belum dikembalikan dari {{ kecamatanLabel }}</p>
            </div>
          </div>

          <q-separator />

          <!-- Status Kabupaten -->
          <div>
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
              <q-icon name="domain" size="28px" color="negative" style="margin-right: 12px;" />
              <h5 style="margin: 0; color: #D32F2F; font-size: 16px; font-weight: 600;">
                {{ kabupatenLabel }}
              </h5>
            </div>

            <div v-if="statusKabupaten === 2" style="padding: 16px; background-color: #FFEBEE; border-left: 4px solid #D32F2F; border-radius: 4px;">
              <div style="display: flex; align-items: flex-start;">
                <q-icon name="error" color="negative" size="24px" style="margin-right: 12px; margin-top: 2px; flex-shrink: 0;" />
                <div style="flex: 1;">
                  <div style="font-size: 13px; font-weight: 600; color: #B71C1C; margin-bottom: 8px;">
                    Data dikembalikan oleh {{ kabupatenLabel }}
                  </div>
                  <div style="font-size: 14px; color: #C62828; line-height: 1.6;">
                    {{ keteranganKabupaten || 'Tidak ada keterangan' }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else style="padding: 16px; background-color: #F5F5F5; border-radius: 4px; text-align: center; color: #999;">
              <p style="margin: 0; font-size: 13px;">Data belum dikembalikan dari {{ kabupatenLabel }}</p>
            </div>
          </div>

          <!-- Informasi Tambahan -->
          <div style="padding: 16px; background-color: #E3F2FD; border-radius: 4px; border-left: 4px solid #1976D2;">
            <div style="display: flex; align-items: flex-start;">
              <q-icon name="help" color="primary" size="24px" style="margin-right: 12px; margin-top: 2px; flex-shrink: 0;" />
              <div style="flex: 1;">
                <div style="font-size: 13px; font-weight: 600; color: #1565C0; margin-bottom: 8px;">
                  Langkah Selanjutnya
                </div>
                <div style="font-size: 13px; color: #1976D2; line-height: 1.6;">
                  {{ helpText }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Tutup" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ModalLihatStatus',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Alasan Pengembalian Permohonan'
    },
    statusKecamatan: {
      type: Number,
      default: 0
    },
    statusKabupaten: {
      type: Number,
      default: 0
    },
    keteranganKecamatan: {
      type: String,
      default: ''
    },
    keteranganKabupaten: {
      type: String,
      default: ''
    },
    kecamatanLabel: {
      type: String,
      default: 'Keterangan dari Tingkat Kecamatan'
    },
    kabupatenLabel: {
      type: String,
      default: 'Keterangan dari Tingkat Kabupaten'
    },
    helpText: {
      type: String,
      default: 'Silakan perbaiki data sesuai dengan keterangan di atas dan ajukan kembali permohonan Anda. Gunakan menu <strong>Edit</strong> untuk memperbaiki data.'
    }
  },
  emits: ['update:modelValue'],
  computed: {
    isOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  }
}
</script>

<style scoped>
/* Add component-specific styles here if needed */
</style>
