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
        <div class="illustration-section"
            style="display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 50px;">

            <!-- Skeleton Loader -->
            <q-skeleton v-if="logoLoading" type="QAvatar" size="135px" animation="pulse"
                style="margin-bottom: 8px; background: rgba(255,255,255,0.2)" />

            <img v-show="!logoLoading" src="/img/logokonsel.png" alt="Logo Konsel" class="illustration"
                @load="logoLoading = false"
                style="width: 135px; margin-bottom: 8px; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.25));">

            <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
                <div
                    style="font-size: 1.8rem; font-weight: 900; color: #ffffff; letter-spacing: 3px; line-height: 1; text-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    #KONSEL
                </div>
                <div
                    style="font-size: 1.7rem; font-weight: 700; color: #ffca28; letter-spacing: 12px; line-height: 1.2; margin-top: 6px; margin-right: -12px; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                    SETARA
                </div>
            </div>
        </div>

        <!-- Form Section -->
        <div class="form-section" style="position: relative; padding-bottom: 80px;">
            <p class="instruction-text">Silakan login menggunakan akun anda</p>

            <div class="input-group" style="text-align: left;">
                <label class="input-label">Username</label>
                <input type="email" placeholder="Ketikkan username Anda" v-model="form.username"
                    class="custom-input w-100" style="width: 100%;">
            </div>

            <div class="input-group" style="text-align: left;">
                <label class="input-label">Password</label>
                <div class="relative-position">
                    <input :type="showPassword ? 'text' : 'password'" placeholder="Ketikkan password Anda"
                        v-model="form.password" class="custom-input w-100" style="width: 100%; padding-right: 52px;">
                    <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer pwd-toggle"
                        @click="showPassword = !showPassword" />
                </div>
            </div>

            <div class="links-section">
                <a @click="$router.push('/lupa-password')" class="forgot-password">Lupa Password Anda ?</a>
            </div>

            <div class="button-group">
                <button class="btn btn-primary" @click="doLogin">Masuk</button>
                <button class="btn btn-outline" @click="$router.push('/register')">Daftar</button>
            </div>

            <!-- Footer Aplikasi -->
            <div
                style="position: absolute; bottom: 15px; left: 0; width: 100%; font-size: 0.8rem; color: rgba(255, 255, 255, 1); font-weight: 500; letter-spacing: 0.5px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;">
                <div>@copyright : DiskominfoSandi Konawe Selatan 2026</div>
                <img src="/img/setara.png" alt="Logo Setara"
                    style="height: 36px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));">
            </div>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from 'src/stores/auth';

export default {
    name: 'LoginPage',

    data() {
        return {
            form: {
                username: '',
                password: ''
            },
            showPassword: false,
            logoLoading: true
        }
    },
    mounted() {
        // Ambil data login terakhir jika ada
        const lastUsername = localStorage.getItem('last_username')
        const lastPassword = localStorage.getItem('last_password')

        if (lastUsername) this.form.username = lastUsername
        if (lastPassword) this.form.password = lastPassword
    },
    methods: {
        async doLogin() {
            const auth = useAuthStore()
            const success = await auth.login(this.form)

            if (success) {
                // Simpan data login terakhir
                localStorage.setItem('last_username', this.form.username)
                localStorage.setItem('last_password', this.form.password)

                // Beri jeda render sesaat agar Notify & Loading context selesai dibersihkan
                setTimeout(() => {
                    this.$router.push('/')
                }, 50)
            }
        }
    }
}
</script>

<style scoped>
.pwd-toggle {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 24px;
    color: #5485d3;
    transition: color 0.2s ease;
}

.pwd-toggle:hover {
    color: var(--auth-bg);
}

@media (min-width: 900px) {
    .pwd-toggle {
        right: 24px;
        font-size: 28px;
    }
}
</style>
