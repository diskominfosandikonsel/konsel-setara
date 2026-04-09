<template>
  <div class="register-container">

    <!-- Header Section -->
    <div class="header-section">
      <button class="back-btn" @click="$router.push('/login')">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="header-title">
        <h1>Daftarkan Akun Anda</h1>
        <p>Lengkapi Form</p>
      </div>
    </div>

    <!-- Form Section -->
    <div class="form-section">

      <!-- Nama Lengkap -->
      <div class="input-group">
        <label class="input-label">Nama Lengkap Sesuai KTP</label>
        <div class="input-wrapper">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            type="text"
            placeholder="Andi"
            v-model="form.nama"
            class="custom-input"
          />
        </div>
      </div>

      <div class="input-group">
        <label class="input-label">Username</label>
        <div class="input-wrapper">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            type="text"
            placeholder="Andi"
            v-model="form.username"
            class="custom-input"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="input-group">
        <label class="input-label">E-mail Aktif</label>
        <div class="input-wrapper">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input
            type="email"
            placeholder="user_infoid@gmail.com"
            v-model="form.email"
            class="custom-input"
          />
        </div>
      </div>

      <!-- Nomor Telepon -->
      <div class="input-group">
        <label class="input-label">Nomor Telepon</label>
        <div class="input-wrapper">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <input
            type="tel"
            placeholder="081212145607"
            v-model="form.hp"
            class="custom-input"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="input-group">
        <label class="input-label">Password</label>
        <div class="input-wrapper">
          <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input
            :type="showPassword ? 'text' : 'password'"
            placeholder="**********"
            v-model="form.password"
            class="custom-input"
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
      </div>

      <!-- Konfirmasi Password -->
      <div class="input-group">
        <label class="input-label">Konfirmasi Password</label>
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

      <!-- Error global -->
      <div v-if="errorMsg" class="error-banner">
        {{ errorMsg }}
      </div>

      <!-- Submit Button -->
      <div class="button-group">
        <button
          class="btn btn-primary"
          @click="doRegister"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner"></span>
          <span v-else>Daftarkan</span>
        </button>
      </div>

      <!-- Login Link -->
      <div class="login-link">
        <span>Sudah punya akun? </span>
        <a @click="$router.push('/login')" class="link-text">Masuk di sini</a>
      </div>

    </div>
  </div>
</template>

<script>
import { useAuthStore } from 'stores/auth'
export default {
  name: 'RegisPage',

  data() {
    return {
      form: {
        username: '',
        nama: '',
        email: '',
        hp: '',
        password: '',
        konfirmasi: ''
      },
      showPassword: false,
      showKonfirmasi: false,
      isLoading: false,
      errorMsg: ''
    }
  },

   computed: {
    auth() {
      return useAuthStore()
    }
  },

  methods: {
    async doRegister() {
      this.errorMsg = ''

      // VALIDATION
      if (!this.form.username || !this.form.nama || !this.form.email || !this.form.hp || !this.form.password || !this.form.konfirmasi) {
        this.errorMsg = 'Semua field wajib diisi.'
        return
      }

      if (this.form.password !== this.form.konfirmasi) {
        this.errorMsg = 'Konfirmasi password tidak cocok.'
        return
      }

      if (this.form.password.length < 6) {
        this.errorMsg = 'Password minimal 6 karakter.'
        return
      }

      this.isLoading = true

      try {
        // 🔥 BUILD PAYLOAD FOR BACKEND
        const payload = {
          username: this.form.username, // 👉 or generate from email
          nama: this.form.nama,
          email: this.form.email,
          hp: this.form.hp, // 👉 mapping
          password: this.form.password
        }

        console.log('REGISTER PAYLOAD:', payload)

        const success = await this.auth.register(payload)

        if (success) {
          this.$router.push('/login')
        }

      } catch (error) {
  console.error('REGISTER ERROR:', error.response?.data)

  this.errorMsg = error.response?.data?.message || 'Pendaftaran gagal'
} finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.register-container {
  min-height: 100vh;
  background-color: #154694;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #ffffff;
  overflow-y: auto;
}

/* Header */
.header-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 52px 28px 32px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 4px;
  transition: background 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.header-title h1 {
  font-size: 1.65rem;
  font-weight: 700;
  margin: 0 0 4px;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.header-title p {
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.85;
}

/* Form */
.form-section {
  padding: 0 28px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.input-group {
  width: 100%;
  max-width: 440px;
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
  letter-spacing: 0.01em;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 16px;
  border: 2px solid transparent;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-wrapper:focus-within {
  border-color: #64b5f6;
  box-shadow: 0 0 0 4px rgba(100, 181, 246, 0.2);
}

.input-wrapper.input-error {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.15);
}

.input-icon {
  color: #9eb3d4;
  flex-shrink: 0;
  margin-left: 16px;
}

.custom-input {
  flex: 1;
  padding: 16px 12px 16px 10px;
  border: none;
  background: transparent;
  font-size: 0.97rem;
  color: #333333;
  font-family: 'Plus Jakarta Sans', sans-serif;
  outline: none;
  min-width: 0;
}

.custom-input::placeholder {
  color: #b8c4d4;
}

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 14px;
  color: #9eb3d4;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.toggle-password:hover {
  color: #154694;
}

.error-text {
  display: block;
  font-size: 0.78rem;
  color: #ffb3b3;
  margin-top: 6px;
  font-weight: 500;
}

.error-banner {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 100, 100, 0.18);
  border: 1px solid rgba(255, 100, 100, 0.35);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 0.88rem;
  font-weight: 500;
  color: #ffdddd;
  margin-bottom: 16px;
  text-align: center;
}

/* Button */
.button-group {
  width: 100%;
  max-width: 440px;
  margin-top: 8px;
  margin-bottom: 20px;
}

.btn {
  width: 100%;
  padding: 17px 0;
  border-radius: 16px;
  border: none;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background-color: #64b5f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.08);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Login link */
.login-link {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
}

.link-text {
  color: #64b5f6;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.link-text:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 400px) {
  .header-section {
    padding: 44px 20px 24px;
  }
  .form-section {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
