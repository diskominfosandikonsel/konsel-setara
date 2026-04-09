<template>
  <div class="lupa-container">

    <!-- Header Section -->
    <div class="header-section">
      <button class="back-btn" @click="$router.push('/login')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="header-title">
        <h1>Lupa Password ?</h1>
      </div>
    </div>

    <!-- Ilustrasi kunci -->
    <div class="illustration-section">
      <div class="icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </div>
      <p class="illustration-hint">Masukkan e-mail dan buat password baru</p>
    </div>

    <!-- Form Section -->
    <div class="form-section">

      <!-- Step 1: Sudah kirim email? tampilkan semua; jika tidak, hanya email -->
      <transition name="fade-slide" mode="out-in">
        <div v-if="!emailSent" key="step1" class="step-wrapper">
          <!-- Email -->
          <div class="input-group">
            <label class="input-label">Lengkapi E-mail</label>
            <div class="input-wrapper" :class="{ 'input-error': emailError }">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="user_infoid@gmail.com"
                v-model="form.email"
                class="custom-input"
                @input="emailError = ''"
              />
            </div>
            <span v-if="emailError" class="error-text">{{ emailError }}</span>
          </div>

          <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

          <div class="button-group">
            <button class="btn btn-primary" @click="sendReset" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Kirim Kode Reset</span>
            </button>
          </div>
        </div>

        <div v-else key="step2" class="step-wrapper">
          <!-- Password Baru -->
          <div class="input-group">
            <label class="input-label">Password Baru</label>
            <div class="input-wrapper" :class="{ 'input-error': passError }">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                :type="showPassword ? 'text' : 'password'"
                placeholder="**********"
                v-model="form.password"
                class="custom-input"
                @input="passError = ''"
              />
              <button class="toggle-password" @click="showPassword = !showPassword" type="button">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <span v-if="passError" class="error-text">{{ passError }}</span>
          </div>

          <!-- Konfirmasi Password Baru -->
          <div class="input-group">
            <label class="input-label">Konfirmasi Password Baru</label>
            <div class="input-wrapper" :class="{ 'input-error': form.konfirmasi && form.password !== form.konfirmasi }">
              <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <input
                :type="showKonfirmasi ? 'text' : 'password'"
                placeholder="**********"
                v-model="form.konfirmasi"
                class="custom-input"
              />
              <button class="toggle-password" @click="showKonfirmasi = !showKonfirmasi" type="button">
                <svg v-if="!showKonfirmasi" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <span v-if="form.konfirmasi && form.password !== form.konfirmasi" class="error-text">
              Password tidak cocok
            </span>
          </div>

          <div v-if="errorMsg" class="error-banner">{{ errorMsg }}</div>

          <div class="button-group">
            <button class="btn btn-primary" @click="doReset" :disabled="isLoading">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Perbaharui</span>
            </button>
          </div>
        </div>
      </transition>

      <!-- Kembali ke login -->
      <div class="login-link">
        <span>Ingat password? </span>
        <a @click="$router.push('/login')" class="link-text">Masuk di sini</a>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'LupapassPage',

  data() {
    return {
      form: {
        email: '',
        password: '',
        konfirmasi: ''
      },
      emailSent: false,
      showPassword: false,
      showKonfirmasi: false,
      isLoading: false,
      errorMsg: '',
      emailError: '',
      passError: ''
    }
  },

  methods: {
    async sendReset() {
      this.errorMsg = ''
      if (!this.form.email) {
        this.emailError = 'E-mail wajib diisi.'
        return
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.form.email)) {
        this.emailError = 'Format e-mail tidak valid.'
        return
      }

      this.isLoading = true
      try {
        // TODO: Integrasikan dengan API kirim email reset
        await new Promise(resolve => setTimeout(resolve, 1200))
        this.emailSent = true
      } catch (error) {
        this.errorMsg = error?.message || 'Gagal mengirim kode reset. Coba lagi.'
      } finally {
        this.isLoading = false
      }
    },

    async doReset() {
      this.errorMsg = ''
      this.passError = ''

      if (!this.form.password) {
        this.passError = 'Password baru wajib diisi.'
        return
      }
      if (this.form.password.length < 8) {
        this.passError = 'Password minimal 8 karakter.'
        return
      }
      if (this.form.password !== this.form.konfirmasi) {
        this.errorMsg = 'Konfirmasi password tidak cocok.'
        return
      }

      this.isLoading = true
      try {
        // TODO: Integrasikan dengan API update password
        await new Promise(resolve => setTimeout(resolve, 1200))
        this.$router.push('/login')
      } catch (error) {
        this.errorMsg = error?.message || 'Gagal memperbarui password. Coba lagi.'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>


