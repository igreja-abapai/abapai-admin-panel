export const environment = {
  clientApiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  production: import.meta.env.PROD,
  development: import.meta.env.DEV,
}
