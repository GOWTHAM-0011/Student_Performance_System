import axios from 'axios'

// Vite proxy forwards /api → http://localhost:8080
// withCredentials: true is REQUIRED for session cookies to be sent back
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
