<template>
  <q-footer elevated class="bg-white bottom-nav">
    <q-tabs v-model="tab" dense align="justify" indicator-color="transparent" class="text-grey-4" no-caps >

      <q-tab name="beranda" @click="go('/')">
        <div class="pill" :class="{ active: tab === 'beranda' }">
          <img src="~assets/icons/home.svg" class="icon" :class="{ active: tab === 'beranda' }" />
          <transition name="slide-fade">
            <span v-if="tab === 'beranda'">Beranda</span>
          </transition>
        </div>
      </q-tab>

      <q-tab name="news" @click="go('/news')">
        <div class="pill" :class="{ active: tab === 'news' }">
          <img src="~assets/icons/news.svg" class="icon" :class="{ active: tab === 'news' }" />
          <transition name="slide-fade">
            <span v-if="tab === 'news'">Informasi</span>
          </transition>
        </div>
      </q-tab>

      <q-tab name="notifikasi" @click="go('/notifikasi')">
        <div class="pill" :class="{ active: tab === 'notifikasi' }">
          <div class="icon-badge-wrap">
            <img src="~assets/icons/bell.svg" class="icon" :class="{ active: tab === 'notifikasi' }" />
            <transition name="badge-pop">
              <span v-if="unreadCount > 0" class="notif-badge">
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </transition>
          </div>
          <transition name="slide-fade">
            <span v-if="tab === 'notifikasi'">Notifikasi</span>
          </transition>
        </div>
      </q-tab>

      <q-tab name="profil" @click="go('/profil')">
        <div class="pill" :class="{ active: tab === 'profil' }">
          <img src="~assets/icons/user.svg" class="icon" :class="{ active: tab === 'profil' }" />
          <transition name="slide-fade">
            <span v-if="tab === 'profil'">Profil</span>
          </transition>
        </div>
      </q-tab>

    </q-tabs>
  </q-footer>
</template>
<script>
import { useNotifikasiStore } from 'src/stores/notifikasi'

export default {
  name: 'BottomNavigation',

  data () {
    return {
      tab: 'beranda'
    }
  },

  computed: {
    unreadCount () {
      const store = useNotifikasiStore()
      return store.unreadCount
    }
  },

  watch: {
    '$route.path': {
      immediate: true,
      handler (path) {
        if (path === '/') this.tab = 'beranda'
        else if (path.startsWith('/news')) this.tab = 'news'
        else if (path.startsWith('/notifikasi')) this.tab = 'notifikasi'
        else if (path.startsWith('/profil')) this.tab = 'profil'
        else this.tab = null
      }
    }
  },

  methods: {
    go (path) {
      this.$router.push(path)
    }
  },
}
</script>

<style scoped>
.bottom-nav {
  border-top: 1px solid rgba(0,0,0,0.05);
  padding-bottom: env(safe-area-inset-bottom);
}

.q-tab__label,
.q-tab span {
  text-transform: none !important;
}

.pill {
  display: flex;
  align-items: center;
  gap: 6px;

  height: 36px;
  max-width: 36px;
  padding: 0 8px;

  border-radius: 18px;
  overflow: visible;

  transition:
    background 0.25s ease,
    max-width 0.25s ease,
    padding 0.25s ease;
}

.pill.active {
  background: rgba(17, 78, 164, 0.12);
  max-width: 130px;
  padding: 0 14px;
  border-radius: 50px;
}

.icon {
  width: 25px;
  height: 25px;
  margin-bottom: 3px;

  filter: grayscale(100%) brightness(1.3);
  transition: filter 0.25s ease, transform 0.25s ease;
}

.icon.active {
  transform: translateY(-1px);
  filter: brightness(0) saturate(100%)
    invert(20%)
    sepia(91%)
    saturate(2976%)
    hue-rotate(210deg)
    brightness(90%)
    contrast(95%);
}

.pill span {
  font-size: 13px;
  font-weight: 500;
  color: #114EA4;
  white-space: nowrap;
}

/* ─── Badge ─── */
.icon-badge-wrap {
  position: relative;
  display: inline-flex;
}

.notif-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: #ef4444 !important;
  color: #ffffff !important;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.4);
}

.badge-pop-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-pop-leave-active {
  transition: all 0.2s ease;
}

.badge-pop-enter-from {
  opacity: 0;
  transform: scale(0);
}

.badge-pop-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* ─── Slide fade ─── */
.slide-fade-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.15s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-6px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

</style>

