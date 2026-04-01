import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Preserve cookies through the proxy
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Allow set-cookie headers to pass through
            const cookies = proxyRes.headers['set-cookie']
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map(c =>
                c.replace(/; secure/gi, '').replace(/; SameSite=None/gi, '; SameSite=Lax')
              )
            }
          })
        }
      }
    }
  }
})
