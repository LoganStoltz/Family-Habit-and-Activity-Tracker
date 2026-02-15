// src/api.js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://ec2-18-116-66-13.us-east-2.compute.amazonaws.com' // make sure port matches Puma

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
      credentials: 'include', // if your backend uses cookies/sessions
    })

    // handle HTTP errors
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    // try parsing JSON, but fallback to text if invalid
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return response.json()
    } else {
      return response.text()
    }
  } catch (err) {
    console.error('API request failed:', err)
    throw err
  }
}
