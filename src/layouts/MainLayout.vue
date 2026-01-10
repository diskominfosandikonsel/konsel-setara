<template>
  <q-layout view="hHh lpR fFf">

    <q-page-container>
      <router-view />
    </q-page-container>

    <BottomNav v-if="showBottomNav" />

  </q-layout>
</template>

<script>
import BottomNav from 'layouts/BottomNavigation.vue'

export default {
  name: 'MainLayout',

  components: {
    BottomNav
  },

  computed: {
    showBottomNav () {
      return this.$route.meta.showBottomNav === true
    },
  }
}
</script>
