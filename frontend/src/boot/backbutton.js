import { boot } from 'quasar/wrappers'
import { App } from '@capacitor/app'

export default boot(({ router }) => {
  let lastBack = 0

  App.addListener('backButton', () => {
    const now = new Date().getTime()

    if (router.canGoBack()) {
      router.back()
    } else {
      if (now - lastBack < 2000) {
        App.exitApp()
      } else {
        lastBack = now
        alert('Tekan sekali lagi untuk keluar')
      }
    }
  })
})