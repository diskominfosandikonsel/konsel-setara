<template>
  <q-footer elevated class="bg-white bottom-nav">
    <q-tabs v-if="!disableActive" v-model="tab" dense align="justify" indicator-color="transparent" class="text-grey-4" no-caps >

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
          <img src="~assets/icons/bell.svg" class="icon" :class="{ active: tab === 'notifikasi' }" />
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

    <div v-else class="icon-only">
      <div class="icon-btn" @click="go('/')">
        <img src="~assets/icons/home.svg" class="icon" />
      </div>
      <div class="icon-btn" @click="go('/news')">
        <img src="~assets/icons/news.svg" class="icon" />
      </div>
      <div class="icon-btn" @click="go('/notifikasi')">
        <img src="~assets/icons/bell.svg" class="icon" />
      </div>
      <div class="icon-btn" @click="go('/profil')">
        <img src="~assets/icons/user.svg" class="icon" />
      </div>
    </div>
  </q-footer>
</template>
<script>
export default {
  name: 'BottomNavigation',

  computed: {
    disableActive () {
      return this.$route.meta.disableActiveTab
    },
  },

  data () {
    return {
      tab: 'beranda'
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
      }
    }
  },

  methods: {
    go (path) {
      this.$router.push(path)
    }
  },
  mounted() {
    console.log(this.disableActive);
   }
}
</script>

<style scoped>
.bottom-nav {
  border-top: 1px solid rgba(0,0,0,0.08);
  padding-bottom: env(safe-area-inset-bottom);
}

.q-tab__label,
.q-tab span {
  text-transform: none !important;
}

.q-tab--active {
  background: transparent !important;
}

.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 15px;
  transition: background 0.25s ease;
}

.pill.active {
  background: rgba(17, 78, 164, 0.12);
  border-radius: 50px;
}

.icon {
  width: 25px;
  height: 25px;
  margin-bottom: 3px;
  filter: grayscale(100%) brightness(1.3);
  transition: filter 0.25s ease;
}

.icon.active {
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

.slide-fade-enter-active {
  transition: all 0.25s ease;
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

.pill:not(.active) .icon {
  margin-bottom: 0;
}

.icon-only {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid rgba(0,0,0,0.08);
  padding-bottom: env(safe-area-inset-bottom);
}

.icon-btn {
  padding: 8.5px;
}

</style>
