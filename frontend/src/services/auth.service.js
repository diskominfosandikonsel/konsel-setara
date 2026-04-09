import { api } from '../api/api'

export const AuthService = {
  login(data) {
    return api.post('auth/login', data)
  },
  register(data) {
    return api.post('auth/register', data)
  }
}