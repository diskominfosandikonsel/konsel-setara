<template>
  <div class="splash-container">
    <video ref="videoRef" class="splash-video" :class="{ 'is-playing': videoReady }" autoplay muted playsinline
      preload="auto" @playing="onVideoPlaying" @ended="onVideoEnded" @error="onVideoError">
      <source src="/konsel_splash.mp4" type="video/mp4" />
    </video>

    <!-- Fallback: skip button jika video error / lama -->
    <button v-if="showSkip" class="skip-btn" @click="goToHome">
      Lewati →
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SplashScreen } from '@capacitor/splash-screen'

const router = useRouter()
const videoRef = ref(null)
const showSkip = ref(false)
const videoReady = ref(false)

onMounted(async () => {
  try {
    await SplashScreen.hide()
  } catch {
    // Abaikan jika tidak di Capacitor (web browser)
  }

  // Paksa mulai video secara manual (Android WebView kadang perlu ini)
  if (videoRef.value) {
    videoRef.value.play().catch(() => {
      goToHome()
    })
  }

  // Tampilkan tombol skip setelah 3 detik
  setTimeout(() => {
    showSkip.value = true
  }, 3000)
})

function onVideoPlaying() {
  // Video sudah benar-benar mulai memutar → tampilkan
  videoReady.value = true
}

function onVideoEnded() {
  goToHome()
}

function onVideoError() {
  goToHome()
}

function goToHome() {
  router.replace('/')
}
</script>

<style scoped>
.splash-container {
  position: fixed;
  inset: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.splash-video {
  width: 65%;
  max-width: 260px;
  max-height: 55vh;
  object-fit: contain;
  border-radius: 12px;
  /* Sembunyikan sampai video benar-benar mulai memutar */
  opacity: 0;
  transition: opacity 0.1s ease;
}

/* Tampilkan video saat sudah playing */
.splash-video.is-playing {
  opacity: 1;
}

.skip-btn {
  position: absolute;
  bottom: 40px;
  right: 24px;
  background: rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 20px;
  padding: 8px 20px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.2s ease;
}

.skip-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
