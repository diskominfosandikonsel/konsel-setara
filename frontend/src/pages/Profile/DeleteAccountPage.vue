<template>
  <q-page class="bg-white delete-account-page q-pa-md">
    <!-- Header full width (di luar page-container) -->
    <div class="row items-center q-mb-lg header-title">
      <q-btn
        flat
        round
        dense
        icon="keyboard_arrow_left"
        size="18px"
        @click="$router.back()"
        class="q-mr-sm"
      />
      <div class="text-h5 text-weight-regular text-black">Hapus akun</div>
    </div>

    <div class="page-container">
      <!-- Content Wrapper -->
      <div class="content-wrapper">
        <!-- Intro -->
        <p class="intro-text">
          Setelah dihapus, anda akan kehilangan akses informasi berikut
        </p>

        <!-- Info List -->
        <div class="info-list q-mb-lg">
          <div class="info-item">
            <div class="info-title">1. Riwayat Aduan :</div>
            <div class="info-desc">Rincian riwayat aduan, alamat tersimpan, dst.</div>
          </div>
          <div class="info-item">
            <div class="info-title">2. Profil Konsel Digital</div>
            <div class="info-desc">Informasi personal di profil Konsel Digital anda</div>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="disclaimer q-mb-md">
          Dinas komunikasi informatika dan persandian tidak bertanggungjawab atas
          hilangnya informasi dan data anda setelah akun resmi dihapus.
        </div>

        <!-- Agreement Checkbox -->
        <div
          class="agreement-box q-mb-xl"
          :class="{ 'agreement-box--active': isAgreed }"
          @click="isAgreed = !isAgreed"
        >
          <div class="agreement-text">
            Saya setuju dan bersedia menghapus akun ini secara permanen.
          </div>
          <q-checkbox
            v-model="isAgreed"
            class="agreement-checkbox"
            color="primary"
            dense
            @click.stop
          />
        </div>
      </div>
    </div>

    <!-- Sticky Footer Actions -->
    <div class="footer-actions">
      <div class="footer-inner">
        <q-btn
          unelevated
          no-caps
          class="full-width btn-lanjut q-mb-sm"
          :class="{ 'btn-lanjut--active': isAgreed }"
          :disable="!isAgreed"
          label="Lanjut"
          @click="showConfirmDialog = true"
        />
        <q-btn
          outline
          no-caps
          class="full-width btn-batal"
          label="Batal"
          @click="$router.back()"
        />
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <q-dialog v-model="showConfirmDialog">
      <q-card class="confirm-card">
        <q-card-section class="q-pb-xs">
          <div class="text-h6 text-weight-medium">Hapus akun</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="text-body2 text-grey-8">
            Apakah Anda yakin menghapus akun ini ?
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn
            no-caps
            unelevated
            label="Batal"
            class="dialog-btn-cancel"
            v-close-popup
          />
          <q-btn
            flat
            no-caps
            label="Ok"
            class="dialog-btn-ok"
            @click="handleDeleteAccount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { ProfileService } from 'src/services/profile.service'
import { useAuthStore } from 'src/stores/auth'

export default defineComponent({
  name: 'DeleteAccountPage',

  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const auth = useAuthStore()

    const isAgreed = ref(false)
    const showConfirmDialog = ref(false)

    /**
     * Menangani proses penghapusan akun.
     * Memanggil API DELETE /api/v1/profile untuk menghapus akun dari database,
     * lalu membersihkan sesi lokal dan mengarahkan ke halaman login.
     */
    const handleDeleteAccount = async () => {
      showConfirmDialog.value = false
      $q.loading.show({ message: 'Menghapus akun...' })

      try {
        const res = await ProfileService.deleteAccount()

        if (res.data?.success) {
          // Bersihkan state auth (token + user) via store
          auth.logout()

          $q.notify({
            type: 'positive',
            message: 'Akun berhasil dihapus.',
            position: 'top',
            timeout: 2500,
          })

          router.replace('/login')
        } else {
          $q.notify({
            type: 'negative',
            message: res.data?.message || 'Gagal menghapus akun.',
            position: 'top',
            timeout: 3000,
          })
        }
      } catch (err) {
        console.error('❌ DELETE ACCOUNT ERROR:', err)
        $q.notify({
          type: 'negative',
          message: err.response?.data?.message || 'Gagal menghapus akun. Silakan coba lagi.',
          position: 'top',
          timeout: 3000,
        })
      } finally {
        $q.loading.hide()
      }
    }

    return {
      isAgreed,
      showConfirmDialog,
      handleDeleteAccount,
    }
  },
})
</script>

<style scoped lang="scss">
.delete-account-page {
  min-height: 100vh;
  padding-bottom: 180px;
}

.page-container {
  max-width: 720px;
  margin: 0 auto;
}

.header-title {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
  /* Trick membuat border tembus sampai pinggir meski q-page ada padding */
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;
  padding-right: 16px;
}

.content-wrapper {
  padding-top: 4px;
}

.intro-text {
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.6;
  margin-bottom: 18px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e0e0e0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .info-title {
    font-size: 14px;
    font-weight: 700;
    color: #000;
  }

  .info-desc {
    font-size: 13px;
    color: #5c5c5c;
    line-height: 1.5;
  }
}

.disclaimer {
  font-size: 13px;
  color: #1a1a1a;
  line-height: 1.6;
  padding-top: 4px;
}

.agreement-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #d6d6d6;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;

  .agreement-text {
    font-size: 13px;
    color: #1a1a1a;
    line-height: 1.4;
    flex: 1;
  }

  .agreement-checkbox {
    margin: 0;
  }

  &--active {
    background: #114ea4;
    border-color: #114ea4;

    .agreement-text {
      color: #fff;
    }

    /* Saat aktif: kotak checkbox putih dengan centang biru */
    :deep(.q-checkbox__inner--truthy .q-checkbox__bg) {
      background: #fff !important;
      border-color: #fff !important;
    }
    :deep(.q-checkbox__inner--truthy .q-checkbox__svg) {
      color: #114ea4 !important;
    }
    :deep(.q-checkbox__inner--truthy .q-checkbox__truthy) {
      stroke: #114ea4 !important;
    }
  }

  /* Saat idle: border abu-abu agar kotak terlihat di background putih */
  :deep(.q-checkbox__inner--falsy .q-checkbox__bg) {
    border-color: #bdbdbd;
  }
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  z-index: 10;
}

.footer-inner {
  max-width: 720px;
  margin: 0 auto;
}

.btn-lanjut {
  height: 44px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  background: #ebe7e7 !important;
  color: #8a8a8a !important;

  &--active {
    background: #ff0000 !important;
    color: #fff !important;
  }
}

.btn-batal {
  height: 44px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #ff0000 !important;
  border: 1px solid #ff0000 !important;
}

.confirm-card {
  width: 300px;
  max-width: 90vw;
  border-radius: 8px;

  .dialog-btn-cancel {
    background: #d9d9d9 !important;
    color: #000 !important;
    min-width: 64px;
    border-radius: 4px;
  }

  .dialog-btn-ok {
    color: #000 !important;
    min-width: 48px;
  }
}

@media (min-width: 768px) {
  .delete-account-page {
    padding-bottom: 200px;
  }

  .intro-text,
  .disclaimer {
    font-size: 15px;
  }

  .info-item {
    .info-title {
      font-size: 15px;
    }
    .info-desc {
      font-size: 14px;
    }
  }
}
</style>
