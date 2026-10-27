import axios from 'axios'

const PROD_API_URL = 'https://konsel-setara.konaweselatankab.go.id'

function resolveApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined') {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    // Jika diakses dari hosting publik (seperti admin-konsel-setara.konaweselatankab.go.id),
    // selalu arahkan ke backend produksi resmi agar request dari HP tidak gagal ke localhost
    if (!isLocal && (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return PROD_API_URL
    }
  }
  return envUrl || PROD_API_URL
}

const API_URL = resolveApiUrl()
export const UPLOAD_URL = `${API_URL}/uploads`

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.authorization = `kikensbatara ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_profile')
      localStorage.removeItem('admin_access_group')
      window.location.href = '/auth/sign-in'
    }
    return Promise.reject(error)
  }
)

export default api
