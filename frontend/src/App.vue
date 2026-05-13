<template>
  <router-view />

  <!-- ===================== CUSTOM UPDATE MODAL ===================== -->
  <q-dialog v-model="showUpdateDialog" persistent seamless position="bottom">
    <div class="update-modal-container">
      <!-- Backdrop blur overlay -->
      <div class="update-modal-card">
        <!-- Gradient Header with animated icon -->
        <div class="update-modal-header">
          <div class="update-header-particles">
            <span class="particle p1"></span>
            <span class="particle p2"></span>
            <span class="particle p3"></span>
            <span class="particle p4"></span>
            <span class="particle p5"></span>
          </div>
          <div class="update-icon-wrapper">
            <div class="update-icon-ring"></div>
            <q-icon name="rocket_launch" class="update-icon-main" />
          </div>
        </div>

        <!-- Content Body -->
        <div class="update-modal-body">
          <h3 class="update-title">Update Tersedia! 🎉</h3>
          <p class="update-subtitle">
            Versi terbaru aplikasi sudah siap untuk Anda
          </p>

          <!-- What's new section -->
          <div class="whats-new">
            <div class="whats-new-item">
              <q-icon name="auto_fix_high" size="18px" color="amber" />
              <span>Peningkatan performa & stabilitas</span>
            </div>
            <div class="whats-new-item">
              <q-icon name="new_releases" size="18px" color="green" />
              <span>Fitur baru & perbaikan bug</span>
            </div>
            <div class="whats-new-item">
              <q-icon name="security" size="18px" color="blue" />
              <span>Pembaruan keamanan penting</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="update-modal-actions">
          <button class="update-btn-primary" @click="onUpdateNow">
            <q-icon name="system_update" size="20px" />
            <span>Update Sekarang</span>
            <div class="btn-shimmer"></div>
          </button>
          <button
            v-if="!isForceUpdate"
            class="update-btn-secondary"
            @click="onUpdateLater"
          >
            Nanti Saja
          </button>
          <p v-if="isForceUpdate" class="force-update-note">
            <q-icon name="info" size="14px" />
            Update ini wajib untuk melanjutkan penggunaan aplikasi
          </p>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { PushNotifications } from "@capacitor/push-notifications";
import { api } from "src/api/api";
import { useNotifikasiStore } from "src/stores/notifikasi";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { openURL } from "quasar";

export default {
  name: "App",

  data() {
    return {
      showUpdateDialog: false,
      currentAppVersion: "1.0.0",
      latestAppVersion: "1.0.0",
      isForceUpdate: false,
      updateStoreUrl: "",
    };
  },

  async mounted() {
    await this.initPush();
    await this.checkAppVersion();
  },

  methods: {
    async checkAppVersion() {
      try {
        const { data } = await api.get("/api/v1/app-version");

        // Mock version untuk testing di Web (browser)
        let currentVersion = "1.0.0";

        if (Capacitor.isNativePlatform()) {
          const info = await CapacitorApp.getInfo();
          currentVersion = info.version;
        } else {
          console.log("🌐 Menjalankan di Web, menggunakan mock version:", currentVersion);
        }

        const latestVersion = data.latestVersion;

        if (this.isUpdateAvailable(currentVersion, latestVersion)) {
          this.currentAppVersion = currentVersion;
          this.latestAppVersion = latestVersion;
          this.isForceUpdate = !!data.forceUpdate;
          this.updateStoreUrl = data.storeUrl;
          this.showUpdateDialog = true;
        }
      } catch (err) {
        console.error("Gagal mengecek versi aplikasi:", err);
      }
    },

    onUpdateNow() {
      openURL(this.updateStoreUrl);
      if (this.isForceUpdate) {
        setTimeout(() => this.checkAppVersion(), 3000);
      } else {
        this.showUpdateDialog = false;
      }
    },

    onUpdateLater() {
      this.showUpdateDialog = false;
    },

    isUpdateAvailable(current, latest) {
      if (!current || !latest) return false;
      const currentParts = current.split(".").map(Number);
      const latestParts = latest.split(".").map(Number);

      for (
        let i = 0;
        i < Math.max(currentParts.length, latestParts.length);
        i++
      ) {
        const c = currentParts[i] || 0;
        const l = latestParts[i] || 0;
        if (c < l) return true;
        if (c > l) return false;
      }
      return false;
    },

    async initPush() {
      try {
        const result = await PushNotifications.requestPermissions();

        if (result.receive !== "granted") return;

        // 🔥 IMPORTANT: create channel (FIX ANDROID SILENT ISSUE)
        await PushNotifications.createChannel({
          id: "default",
          name: "Default Channel",
          importance: 5,
        });

        await PushNotifications.register();

        // 📌 TOKEN RECEIVED
        PushNotifications.addListener("registration", async (token) => {
          console.log("FCM TOKEN:", token.value);

          localStorage.setItem("fcm_token", token.value);

          const trySave = async () => {
            try {
              const userStr = localStorage.getItem("user");
              if (!userStr || userStr === "undefined") return false;

              const user = JSON.parse(userStr);
              if (!user?._id) return false;

              await api.post("/fcm/save-token", {
                userId: user._id,
                token: token.value,
                device: "android",
              });

              console.log("TOKEN SAVED");
              return true;
            } catch (err) {
              console.error("Save token failed:", err);
              return false;
            }
          };

          // try immediately
          let saved = await trySave();

          // retry until login exists
          if (!saved) {
            const interval = setInterval(async () => {
              saved = await trySave();
              if (saved) clearInterval(interval);
            }, 2000);
          }
        });

        // 📩 FOREGROUND NOTIFICATION
        PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log("FOREGROUND:", notification);

            // Simpan ke riwayat notifikasi
            const notifStore = useNotifikasiStore();
            const data = notification.data || {};
            notifStore.add({
              title: notification.title || "Notifikasi",
              body: notification.body || "",
              type: data.type || "",
              laporanId:
                data.laporanId ||
                data.kasusId ||
                data.id ||
                data.id_kasus ||
                "",
            });

            // Tampilkan banner atas dengan aksi klik
            this.$q.notify({
              message: notification.title || "Notifikasi",
              caption: notification.body || "",
              color: "primary",
              icon: "notifications",
              position: "bottom",
              timeout: 5000,
              actions: [
                {
                  label: "Lihat",
                  color: "white",
                  handler: () => {
                    this.navigateToDetail(data);
                  },
                },
              ],
            });
          },
        );

        // 👆 CLICK EVENT (dari background / cold start)
        PushNotifications.addListener(
          "pushNotificationActionPerformed",
          async (action) => {
            console.log("CLICKED:", JSON.stringify(action));

            // Simpan ke riwayat notifikasi (cegah duplikat dengan foreground)
            const notifStore = useNotifikasiStore();
            const notif = action.notification || {};
            const data = notif.data || {};

            // Ambil title & body dari semua kemungkinan lokasi
            let resolvedTitle =
              notif.title || data.title || notif.body || "Notifikasi";
            let resolvedBody = notif.body || data.body || "";

            // FALLBACK KHUSUS PERAK: Karena backend perak tidak mengirim title/body di dalam data payload
            if (data.type === "perak" && !notif.title && !data.title) {
              if (data.status === "diterima") {
                resolvedTitle = "Data Diverifikasi";
                resolvedBody =
                  "Selamat! Data Pencaker Anda telah diterima oleh Admin.";
              } else if (data.status === "ditolak") {
                resolvedTitle = "Data Ditolak";
                resolvedBody = "Maaf, Data Pencaker Anda ditolak oleh Admin.";
              } else {
                resolvedTitle = "Notifikasi Perak";
                resolvedBody = "Ada pembaruan status pada pengajuan Anda.";
              }
            }

            // FALLBACK KHUSUS SIPPADU
            if (data.type === "sippadu" && !notif.title && !data.title) {
              if (data.status === "proses") {
                resolvedTitle = "Laporan Diproses";
                resolvedBody =
                  "Laporan SIPPADU Anda sedang diproses oleh petugas.";
              } else if (data.status === "selesai") {
                resolvedTitle = "Laporan Selesai";
                resolvedBody =
                  "Laporan SIPPADU Anda telah selesai ditindaklanjuti.";
              } else if (data.status === "dikembalikan") {
                resolvedTitle = "Laporan Dikembalikan";
                resolvedBody =
                  "Laporan SIPPADU Anda dikembalikan, mohon cek detailnya.";
              } else {
                resolvedTitle = "Notifikasi SIPPADU";
                resolvedBody = "Ada pembaruan pada laporan SIPPADU Anda.";
              }
            }

            // FALLBACK KHUSUS FIRETAP
            if (data.type === "firetap" && !notif.title && !data.title) {
              const statusFiretap = String(
                data.status || data.status_kasus || "",
              );
              if (statusFiretap === "0") {
                resolvedTitle = "Laporan Diterima";
                resolvedBody = "Laporan Firetap Anda telah diterima.";
              } else if (statusFiretap === "3") {
                resolvedTitle = "Penanganan Selesai";
                resolvedBody = "Laporan Firetap Anda telah selesai ditangani.";
              } else {
                resolvedTitle = "Notifikasi Firetap";
                resolvedBody = "Ada pembaruan pada laporan FIRETAP Anda.";
              }
            }

            // FALLBACK KHUSUS CSR
            if (
              data.type &&
              data.type.startsWith("csr_") &&
              !notif.title &&
              !data.title
            ) {
              if (data.type === "csr_pengajuan") {
                resolvedTitle =
                  data.status === "2"
                    ? "Pengajuan Disetujui"
                    : "Pengajuan Ditolak";
                resolvedBody =
                  data.status === "2"
                    ? "Selamat! Pengajuan CSR Anda telah disetujui."
                    : "Maaf, pengajuan CSR Anda belum dapat diterima.";
              } else if (data.type === "csr_new_program") {
                resolvedTitle = "Program CSR Baru";
                resolvedBody =
                  "Pemerintah baru saja merilis program CSR baru. Cek sekarang!";
              } else if (data.type === "csr_program") {
                resolvedTitle = "Program Selesai";
                resolvedBody = "Program CSR yang Anda ikuti telah selesai.";
              }
            }

            // Cek apakah notifikasi yang sama sudah tersimpan (dari foreground listener)
            const recentDuplicate = notifStore.list.find(
              (n) =>
                n.type === (data.type || "") &&
                n.laporanId ===
                  (data.laporanId ||
                    data.kasusId ||
                    data.id ||
                    data.id_kasus ||
                    "") &&
                Date.now() - new Date(n.createdAt).getTime() < 30000, // dalam 30 detik terakhir
            );

            if (!recentDuplicate) {
              notifStore.add({
                title: resolvedTitle,
                body: resolvedBody,
                type: data.type || "",
                laporanId:
                  data.laporanId ||
                  data.kasusId ||
                  data.id ||
                  data.id_kasus ||
                  "",
              });
            }

            await this.navigateToDetail(data);
          },
        );
      } catch (err) {
        console.error("Push init error:", err);
      }
    },

    /**
     * Navigasi ke halaman detail berdasarkan data payload notifikasi
     */
    async navigateToDetail(data) {
      if (!data || !data.type) return;

      if (data.type === "sippadu" && data.laporanId) {
        const target = "/sippadu_detail/" + data.laporanId;

        if (
          this.$route.path !== "/sippadu_riwayat" &&
          this.$route.path !== target
        ) {
          await this.$router.replace("/");
          await this.$router.push("/sippadu_riwayat");
          await this.$router.push(target);
        } else {
          await this.$router.push(target);
        }
      } else if (data.type === "sapakonsel" && data.laporanId) {
        const target = "/sapa_riwayat/" + data.laporanId;

        if (
          this.$route.path !== "/sapa_dashboard" &&
          this.$route.path !== target
        ) {
          await this.$router.replace("/");
          await this.$router.push("/sapa_dashboard");
          await this.$router.push(target);
        } else {
          await this.$router.push(target);
        }
      } else if (data.type === "firetap") {
        const firetapId =
          data.laporanId || data.kasusId || data.id || data.id_kasus;
        if (firetapId) {
          const target = "/firetap_detail/" + firetapId;

          if (
            this.$route.path !== "/firetap_riwayat" &&
            this.$route.path !== target
          ) {
            await this.$router.replace("/");
            await this.$router.push("/firetap_riwayat");
            await this.$router.push(target);
          } else {
            await this.$router.push(target);
          }
        }
      } else if (data.type === "perak") {
        const perakId =
          data.id || data.laporanId || data.kasusId || data.id_kasus;
        if (perakId) {
          const target = "/kartu/";

          if (
            this.$route.path !== "/perak_dashboard" &&
            this.$route.path !== target
          ) {
            await this.$router.replace("/");
            await this.$router.push("/perak_dashboard");
            await this.$router.push(target);
          } else {
            await this.$router.push(target);
          }
        }
      } else if (data.type === "csr_pengajuan") {
        await this.$router.push("/csr_pengajuan");
      } else if (data.type === "csr_new_program" && data.id) {
        await this.$router.push("/csr_detail/" + data.id);
      } else if (data.type === "csr_program") {
        await this.$router.push("/csr_pengajuan");
      }
    },
  },
};
</script>

<style>
/* ================================
   UPDATE MODAL - Premium Design
   ================================ */
.update-modal-container {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  padding: 0 16px 24px;
}

.update-modal-card {
  background: #ffffff;
  border-radius: 28px 28px 24px 24px;
  overflow: hidden;
  box-shadow:
    0 -4px 30px rgba(67, 56, 202, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.12);
  animation: slideUpModal 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUpModal {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ---- Header Gradient ---- */
.update-modal-header {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #818cf8 70%, #a78bfa 100%);
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Floating particles */
.update-header-particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  animation: floatParticle 6s ease-in-out infinite;
}

.particle.p1 { width: 60px; height: 60px; top: -10px; left: -15px; animation-delay: 0s; }
.particle.p2 { width: 40px; height: 40px; top: 60px; right: 20px; animation-delay: 1.2s; }
.particle.p3 { width: 25px; height: 25px; bottom: 10px; left: 30%; animation-delay: 2.4s; }
.particle.p4 { width: 50px; height: 50px; top: 10px; right: -10px; animation-delay: 0.8s; background: rgba(255, 255, 255, 0.08); }
.particle.p5 { width: 35px; height: 35px; bottom: -5px; left: 60%; animation-delay: 3.2s; background: rgba(255, 255, 255, 0.1); }

@keyframes floatParticle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
  50% { transform: translateY(-15px) scale(1.15); opacity: 1; }
}

/* Icon in the header */
.update-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.update-icon-ring {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.25);
  animation: pulseRing 2s ease-in-out infinite;
}

@keyframes pulseRing {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0; }
}

.update-icon-main {
  font-size: 52px;
  color: #ffffff;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: rocketBounce 2.5s ease-in-out infinite;
}

@keyframes rocketBounce {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-8px) rotate(5deg); }
}

/* ---- Body ---- */
.update-modal-body {
  padding: 24px 24px 16px;
  text-align: center;
}

.update-title {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.3px;
}

.update-subtitle {
  margin: 0 0 20px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

/* Version Badges */
.version-badges {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.version-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 18px;
  border-radius: 14px;
  min-width: 100px;
}

.version-badge.old {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.version-badge.new {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border: 1px solid #c7d2fe;
}

.version-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.version-badge.new .version-label {
  color: #6366f1;
}

.version-number {
  font-size: 18px;
  font-weight: 800;
  color: #374151;
}

.version-badge.new .version-number {
  color: #4338ca;
}

.version-arrow {
  font-size: 22px;
  color: #6366f1;
  animation: arrowPulse 1.5s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% { transform: translateX(0); opacity: 0.6; }
  50% { transform: translateX(4px); opacity: 1; }
}

/* What's new list */
.whats-new {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background: #fafbfc;
  border-radius: 14px;
  border: 1px solid #f0f1f3;
}

.whats-new-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #4b5563;
  text-align: left;
}

/* ---- Actions ---- */
.update-modal-actions {
  padding: 8px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.update-btn-primary {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #4338ca, #6366f1);
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}

.update-btn-primary:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

/* Shimmer animation on button */
.btn-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.25),
    transparent
  );
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.update-btn-secondary {
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.update-btn-secondary:active {
  background: #f3f4f6;
  color: #6b7280;
}

/* Force update note */
.force-update-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 8px 14px;
  border-radius: 10px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}
</style>
