import { api } from '../api/api'

export const ProfileService = {
  getProfile() {
    return api.get('api/v1/profile')
  },
  updateProfile(data) {
    return api.put('api/v1/profile', data)
  },
  changePassword(data) {
    return api.put('api/v1/profile/password', data)
  }
}
