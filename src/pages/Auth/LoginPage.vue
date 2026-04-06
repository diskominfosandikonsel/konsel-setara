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
            <img src="~assets/login-illustration.png" alt="Login Illustration" class="illustration">
        </div>

        <!-- Form Section -->
        <div class="form-section">
            <p class="instruction-text">Silakan login menggunakan akun anda</p>

            <div class="input-group">
                <input type="email" placeholder="user_ifoid@gmail.com" v-model="email" class="custom-input">
            </div>

            <div class="input-group">
                <input type="password" placeholder="**********" v-model="password" class="custom-input">
            </div>

            <div class="links-section">
                <a href="#" class="forgot-password">Lupa Password Anda ?</a>
            </div>

            <div class="button-group">
                <button class="btn btn-primary" @click="handleLogin">Masuk</button>
                <button class="btn btn-outline" @click="handleRegister">Daftar</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const email = ref('');
const password = ref('');

const handleLogin = () => {
    console.log('Logging in with:', email.value, password.value);
    // Implementation logic here
};

const handleRegister = () => {
    console.log('Navigating to registration');
    // Navigation logic here
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');

.login-container {
    min-height: 100vh;
    background-color: #154694;
    /* Deep primary blue matching the image */
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #ffffff;
    overflow-y: auto;
}

/* Status Bar Style */
.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: -0.01em;
}

.status-bar .icons {
    display: flex;
    gap: 6px;
    align-items: center;
}

.status-bar .material-icons {
    font-size: 1.1rem;
}

/* Illustration Style */
.illustration-section {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 50px;
    padding-bottom: 40px;
}

.illustration {
    width: 90%;
    max-width: 320px;
    height: auto;
    /* filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.3)); */
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.illustration:hover {
    transform: scale(1.03);
}

/* Form Section Style */
.form-section {
    padding: 0 32px 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
}

.instruction-text {
    font-size: 1.05rem;
    font-weight: 500;
    color: #ffffff;
    margin-bottom: 30px;
    text-align: center;
}

.input-group {
    width: 100%;
    max-width: 440px;
    margin-bottom: 18px;
}

.custom-input {
    width: 100%;
    padding: 18px 24px;
    border-radius: 18px;
    border: 2px solid transparent;
    background-color: #ffffff;
    font-size: 1rem;
    color: #333333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.custom-input:focus {
    outline: none;
    border-color: #64b5f6;
    box-shadow: 0 0 0 4px rgba(100, 181, 246, 0.2);
}

.custom-input::placeholder {
    color: #b0b0b0;
}

.links-section {
    width: 100%;
    max-width: 440px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 32px;
}

.forgot-password {
    color: #ffffff;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 600;
    transition: opacity 0.3s ease;
}

.forgot-password:hover {
    opacity: 0.8;
}

/* Button Styles */
.button-group {
    width: 100%;
    max-width: 440px;
    display: flex;
    gap: 16px;
}

.btn {
    flex: 1;
    padding: 16px 0;
    border-radius: 14px;
    border: none;
    font-size: 1.05rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.btn-primary,
.btn-outline {
    background-color: #64b5f6;
    /* Matching sky blue from image */
    color: white;
}

.btn:hover {
    transform: translateY(-2px);
    filter: brightness(1.08);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
}

.btn:active {
    transform: translateY(1px);
}

/* Responsive adjustment */
@media (max-width: 400px) {
    .form-section {
        padding-left: 20px;
        padding-right: 20px;
    }
}
</style>
