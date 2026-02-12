export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
  
  return fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers }
  })
}
