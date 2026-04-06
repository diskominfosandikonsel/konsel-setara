import { api } from './api'

export const AuthService = {
  login(data) {
    return api.post('auth/login', data) // 🔥 adjust endpoint
  }
}