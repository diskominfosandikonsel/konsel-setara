<template>
    <div class="login-container">
        <!-- Top Status Bar Mock (to match the feel of the request) -->
        <!-- <div class="status-bar">
            <div class="time">1:13 PM</div>
            <div class="icons">
                <span class="material-icons">signal_cellular_4_bar</span>
                <span class="material-icons">wifi</span>
                <span class="material-icons">battery_full</span>
            </div>
        </div> -->

        <!-- Illustration Content -->
        <div class="illustration-section">
            <img src="/img/Loginpage.png" alt="Login Illustration" class="illustration">
        </div>

        <!-- Form Section -->
        <div class="form-section">
            <p class="instruction-text">Silakan login menggunakan akun anda</p>

            <div class="input-group">
                <input type="email" placeholder="user_ifoid@gmail.com" v-model="form.username" class="custom-input">
            </div>

            <div class="input-group">
                <input type="password" placeholder="**********" v-model="form.password" class="custom-input">
            </div>

            <div class="links-section">
                <a @click="$router.push('/lupa-password')" class="forgot-password">Lupa Password Anda ?</a>
            </div>

            <div class="button-group">
                <button class="btn btn-primary" @click="doLogin">Masuk</button>
                <button class="btn btn-outline" @click="$router.push('/register')">Daftar</button>
            </div>
        </div>
    </div>
</template>

<script >
import { useAuthStore } from 'src/stores/auth';

export default {
    name : 'LoginPage',

    data() {
        return {
        form: {
            username: '',
            password: ''
        }
        }
    },
    methods: {
        async doLogin() {
          const auth = useAuthStore()
          const success = await auth.login(this.form)

          if (success) {
            this.$router.push('/')
          }
        }
    }
}
</script>


