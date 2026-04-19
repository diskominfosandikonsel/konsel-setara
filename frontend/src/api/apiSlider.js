import axios from 'axios'

// API khusus Slider yang terhubung ke backend Konsel Setara
export const apiSlider = axios.create({
  baseURL: 'https://konsel-setara.konaweselatankab.go.id/api/v1/'
  //baseURL: 'http://localhost:5025/api/v1/'  // Untuk development lokal
})

apiSlider.interceptors.request.use((config) => {
  const token = localStorage.token
  if (token) {
    config.headers.Authorization = 'kikensbatara ' + token
  }
  return config
})
