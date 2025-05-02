import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// Request interceptor - her istekte token ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('currentUser', JSON.stringify(response.data.user))
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentUser')
  }
}

export const essenceService = {
  getAllEssences: async () => {
    const response = await api.get('/essences')
    return response.data
  },

  createEssence: async (essenceData) => {
    const response = await api.post('/essences', essenceData)
    return response.data
  }
}

export const demandService = {
  getAllDemands: async () => {
    const response = await api.get('/demands')
    return response.data
  },

  createDemand: async (demandData) => {
    const response = await api.post('/demands', demandData)
    return response.data
  },

  deleteDemand: async (demandId, essenceId) => {
    const response = await api.delete('/demands', { data: { demandId, essenceId } })
    return response.data
  }
}

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users')
    return response.data
  }
}